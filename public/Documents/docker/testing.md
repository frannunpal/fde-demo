# Docker Integration Testing

This document provides a comprehensive testing guide for Docker functionality in fde-desktop.

## Prerequisites

Make sure Docker is running and ports 5173 and 3001 are available:

```bash
# Check Docker status
docker info | head -10

# Check ports are free
lsof -i :5173 || echo "Port 5173 available"
lsof -i :3001 || echo "Port 3001 available"
```

## Phase 1: Build and Start Container

### 1.1 Build Image

```bash
cd /home/francisque/repos/fde-desktop
docker compose build dev
```

**Expected output:**

```
>>> [dev] Installing dependencies...
>>> [build] Installing dependencies...
Image fde-desktop-dev Built
```

### 1.2 Start Container

```bash
docker compose up dev -d
```

**Expected output:**

```
Container fde-desktop-dev-1 Started
```

### 1.3 Check Logs

```bash
docker compose logs dev --tail 50
```

**Expected logs:**

```
[Dev] Injecting Docker runtime flag...
[Dev] Checking dependencies...
[Dev] Checking for dependency updates...
[Server] Starting FDE server...
[Server] Docker mode: true
[Server] Workspace: /app/workspace
[Server] Port: 3001
[Server] Listening on http://localhost:3001
VITE v7.3.1 ready in xxx ms
➜ Local: http://localhost:5173/
```

## Phase 2: Test Runtime Detection

### 2.1 Verify Flag Injection

```bash
curl -s http://localhost:5173/ | grep -o '__FDE_IN_DOCKER__[^<]*'
```

**Expected:**

```
__FDE_IN_DOCKER__ = true;
```

### 2.2 Test Runtime API Endpoint

```bash
curl -s http://localhost:5173/api/runtime | jq
```

**Expected:**

```json
{
  "docker": true,
  "workspace": "/app/workspace",
  "version": "1.0.0"
}
```

## Phase 3: Test Filesystem API

### 3.1 List Empty Workspace

```bash
curl -s 'http://localhost:5173/api/fs?action=readdir&path=/'
```

**Expected:**

```json
[]
```

### 3.2 Create a File

```bash
curl -X POST 'http://localhost:5173/api/fs' \
  -H 'Content-Type: application/json' \
  -d '{"path":"test.txt","content":"Hello from Docker!"}'
```

**Expected:**

```json
{
  "path": "test.txt",
  "content": "Hello from Docker!",
  "encoding": "utf-8"
}
```

### 3.3 Read the File

```bash
curl -s 'http://localhost:5173/api/fs?action=read&path=/test.txt'
```

**Expected:**

```json
{
  "path": "/test.txt",
  "content": "Hello from Docker!",
  "encoding": "utf-8"
}
```

### 3.4 Create a Directory

```bash
curl -X PUT 'http://localhost:5173/api/fs' \
  -H 'Content-Type: application/json' \
  -d '{"path":"my-folder"}'
```

**Expected:**

```json
{
  "path": "my-folder",
  "created": true
}
```

### 3.5 List Files Again

```bash
curl -s 'http://localhost:5173/api/fs?action=readdir&path=/'
```

**Expected:**

```json
[
  {
    "name": "test.txt",
    "path": "/test.txt",
    "type": "file",
    "size": 18,
    "modifiedAt": "2026-03-19T...",
    "createdAt": "1970-01-01T..."
  },
  {
    "name": "my-folder",
    "path": "/my-folder",
    "type": "directory",
    ...
  }
]
```

### 3.6 Create File in Directory

```bash
curl -X POST 'http://localhost:5173/api/fs' \
  -H 'Content-Type: application/json' \
  -d '{"path":"my-folder/nested.txt","content":"Nested file content"}'
```

### 3.7 Check File Stats

```bash
curl -s 'http://localhost:5173/api/fs?action=stat&path=/test.txt'
```

**Expected:**

```json
{
  "name": "test.txt",
  "path": "/test.txt",
  "type": "file",
  "size": 18,
  "modifiedAt": "...",
  "createdAt": "..."
}
```

### 3.8 Delete a File

```bash
curl -X DELETE 'http://localhost:5173/api/fs?path=/test.txt'
```

**Expected:**

```json
{
  "path": "/test.txt",
  "deleted": true
}
```

## Phase 4: Test Persistence

### 4.1 Restart Container

```bash
docker compose restart dev
sleep 10  # Wait for server to start
```

### 4.2 Verify Files Persist

```bash
curl -s 'http://localhost:5173/api/fs?action=readdir&path=/'
```

**Expected:**

```json
[
  {
    "name": "my-folder",
    "path": "/my-folder",
    "type": "directory",
    ...
  }
]
```

The `my-folder` directory should still exist after restart because workspace is a named volume.

### 4.3 Check Container Workspace

```bash
docker compose exec dev ls -la /app/workspace/
```

**Expected:**

```
total X
drwxr-xr-x X bun bun 4096 Mar 19 XX:XX .
drwxr-xr-x X bun bun 4096 Mar 19 XX:XX ..
drwxr-xr-x X bun bun 4096 Mar 19 XX:XX my-folder
```

## Phase 5: Test Browser Integration

### 5.1 Open Application

```bash
# Open in browser
xdg-open http://localhost:5173/ 2>/dev/null || open http://localhost:5173/
```

### 5.2 Test in Browser Console (F12)

Open DevTools and run these commands:

```javascript
// Test runtime detection
console.log('Runtime:', window.__FDE_IN_DOCKER__);
// Expected: true

// Test filesystem API available
console.log('FS API:', window.__FDE_API__?.fs);
// Expected: DockerFileSystemAdapter {...}

// Test filesystem operations
window.__FDE_API__.fs.getRootNodes().then(nodes => console.log('Root nodes:', nodes));
// Expected: [] initially, or files created via API

// Create a file via browser
window.__FDE_API__.fs.createFile('browser-test.txt', 'Created from browser', null);
```

### 5.3 Verify File Created

```bash
curl -s 'http://localhost:5173/api/fs?action=readdir&path=/'
# Should show 'browser-test.txt' in the list
```

## Phase 6: Test Hot Reload

### 6.1 Modify a Source File

```bash
# Add a comment to a file
echo "// Test hot reload" >> src/main.tsx
```

### 6.2 Check Vite Logs

```bash
docker compose logs dev --tail 10
```

**Expected:**

```
[vite] hmr update /src/main.tsx
```

### 6.3 Verify in Browser

The page should automatically reload/update without manual refresh.

### 6.4 Clean Up

```bash
# Remove the comment
git checkout src/main.tsx
```

## Phase 7: Verify All Tests Pass

### 7.1 Run Unit Tests

```bash
# Test getRuntime
bun run test:unit packages/core/tests/utils/getRuntime.test.ts

# Test DockerFileSystemAdapter
bun run test:unit packages/core/src/infrastructure/adapters/DockerFileSystemAdapter.test.ts

# All tests
bun run test:unit
```

**Expected:**

```
✓ getRuntime (9 tests)
✓ DockerFileSystemAdapter (9 tests)
✓ desktopStore (13 tests)
...
Test Files  XX passed (XX)
Tests       XX passed (XX)
```

## Phase 8: Full Integration Test Script

Create a test script for quick verification:

```bash
#!/bin/bash
# test-docker-integration.sh

set -e

echo "=== Building Container ==="
docker compose build dev || exit 1

echo "=== Starting Container ==="
docker compose up dev -d || exit 1
sleep 10

echo "=== Testing Runtime Detection ==="
RESULT=$(curl -s http://localhost:5173/api/runtime)
echo "$RESULT"
if [[ ! "$RESULT" =~ '"docker":true' ]]; then
  echo "FAIL: Runtime detection not working"
  exit 1
fi

echo "=== Testing Filesystem API ==="
# Create file
curl -s -X POST 'http://localhost:5173/api/fs' \
  -H 'Content-Type: application/json' \
  -d '{"path":"integration-test.txt","content":"test"}' > /dev/null

# Read file
RESULT=$(curl -s 'http://localhost:5173/api/fs?action=read&path=/integration-test.txt')
if [[ ! "$RESULT" =~ '"content":"test"' ]]; then
  echo "FAIL: Filesystem read not working"
  exit 1
fi

# Delete file
curl -X DELETE 'http://localhost:5173/api/fs?path=/integration-test.txt' > /dev/null

echo "=== All Tests Passed ==="
docker compose down
```

Make the script executable:

```bash
chmod +x test-docker-integration.sh
./test-docker-integration.sh
```

## Troubleshooting

### Container Won't Start

```bash
# Check logs for errors
docker compose logs dev

# Rebuild from scratch
docker compose down -v
docker compose build --no-cache dev
docker compose up dev
```

### API Returns 404

```bash
# Check if API server is running
docker compose exec dev ps aux | grep bun

# Check port 3001 directly
curl -v http://localhost:3001/api/runtime

# Check if Vite proxy is working
curl -v http://localhost:5173/api/runtime
```

### Files Not Persisting

```bash
# Check if workspace volume exists
docker volume ls | grep workspace

# Inspect volume
docker volume inspect fde_workspace

# List files in container
docker compose exec dev ls -la /app/workspace/
```

### Hot Reload Not Working

```bash
# Verify volumes are mounted correctly
docker compose exec dev ls -la /app/src/

# Check Vite config
docker compose exec dev cat vite.config.ts | grep proxy

# Restart container
docker compose restart dev
```

### Permission Denied on Files

```bash
# Check file ownership
docker compose exec dev ls -la /app/

# If files are root:root, fix ownership
docker compose exec dev sh -c "chown -R bun:bun /app/workspace"
```

## Test Summary Checklist

| Test                | Command                                  | Expected Result    |
| ------------------- | ---------------------------------------- | ------------------ |
| Runtime flag        | `curl localhost:5173/ \| grep IN_DOCKER` | `true`             |
| API runtime         | `curl localhost:5173/api/runtime`        | `{docker:true}`    |
| Filesystem read     | `curl '...?action=read&path=/test'`      | `{content:...}`    |
| Filesystem write    | `curl -X POST ...`                       | `{path,...}`       |
| Persistence         | `docker compose restart`                 | Files remain       |
| Browser integration | `window.__FDE_IN_DOCKER__`               | `true`             |
| Hot reload          | Modify file                              | HMR update in logs |
| Unit tests          | `bun test:unit`                          | All pass           |

## Debug Commands

```bash
# Full container inspection
docker compose exec dev sh
> cat /etc/os-release
> bun --version
> ls -la /app/
> env | grep -E "DOCKER|WORKSPACE"

# Volume inspection
docker volume ls
docker volume inspect fde-desktop_node_modules
docker volume inspect fde_workspace

# Network inspection
docker network ls
docker network inspect fde-desktop_default

# Complete reset
docker compose down -v           # Stop and remove volumes
docker compose build --no-cache   # Rebuild from scratch
docker compose up dev             # Start fresh
```

## SEO and Prerendering Tests

Docker containers serve static files for SEO:

### Robots and Sitemap

```bash
# Test robots.txt
curl http://localhost:5173/robots.txt
# Expected:
# User-agent: *
# Allow: /
# ...

# Test sitemap.xml
curl http://localhost:5173/sitemap.xml
# Expected:
# <?xml version="1.0" encoding="UTF-8"?>
# <urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
#   <url>...</url>
# </urlset>
```

### Playwright Tests

For Docker-specific SEO tests:

| File                                  | Description                                 | Environment |
| ------------------------------------- | ------------------------------------------- | ----------- |
| `tests/docker/robots.docker.spec.ts`  | Verifies `/robots.txt` exists and is valid  | Docker only |
| `tests/docker/sitemap.docker.spec.ts` | Verifies `/sitemap.xml` exists and is valid | Docker only |
| `tests/e2e/robots.e2e.spec.ts`        | Verifies robots.txt in web mode             | Web/E2E     |
| `tests/e2e/sitemap.e2e.spec.ts`       | Verifies sitemap in web mode                | Web/E2E     |

### Running SEO Tests

```bash
# Run Docker SEO tests
bunx playwright test tests/docker/robots.docker.spec.ts
bunx playwright test tests/docker/sitemap.docker.spec.ts

# Run web SEO tests
bunx playwright test tests/e2e/robots.e2e.spec.ts
bunx playwright test tests/e2e/sitemap.e2e.spec.ts
```

## Performance Verification

### Build Time

```bash
# Time the build
time docker compose build dev
# Expected: < 2 minutes with cached layers
```

### Startup Time

```bash
# Time startup
time docker compose up dev -d
# Wait for logs
docker compose logs dev -f
# Expected: < 15 seconds
```

### API Response Time

```bash
# Test API latency
for i in {1..10}; do
  time curl -s http://localhost:5173/api/runtime > /dev/null
done
# Expected: < 50ms per request
```

## Next Steps

After all tests pass:

1. **Integration with frontend**: Open http://localhost:5173 in browser and test file operations through the Files app
2. **Terminal PTY**: Test WebSocket connection for terminal support (Phase 2.4)
3. **Production build**: Test `docker compose build prod` and verify nginx serves correctly
4. **Full test suite**: Run `bun run test:all` to ensure no regressions

---

## Phase 9: Docker E2E Tests

Docker E2E tests verify that the application works correctly when running inside a Docker container with the DockerFileSystemAdapter.

### 9.1 Test Files

Docker-specific tests are located in `tests/docker/`:

| File                             | Description                                       |
| -------------------------------- | ------------------------------------------------- |
| `file-seed.docker.spec.ts`       | Verifies files are seeded from `fs-manifest.json` |
| `file-management.docker.spec.ts` | CRUD operations persist across page reloads       |
| `runtime.docker.spec.ts`         | Runtime detection and API endpoints               |

### 9.2 Running Docker E2E Tests

```bash
# Start Docker container, run tests, stop container
bun run test:docker

# Or step by step:
bun run test:docker:setup    # Build and start container
bun run test:docker          # Run Docker E2E tests
bun run test:docker:teardown # Stop container
```

### 9.3 Prerequisites

Docker tests require:

1. **Docker running**: `docker info` should succeed
2. **Ports available**: 5173 (Vite) and 3001 (API)
3. **Clean workspace**: First run seeds files from manifest

### 9.4 What Docker Tests Verify

| Test              | Verification                              |
| ----------------- | ----------------------------------------- |
| Runtime detection | `window.__FDE_IN_DOCKER__` is `true`      |
| API endpoint      | `/api/runtime` returns `{docker: true}`   |
| Filesystem API    | `/api/fs` lists seeded folders            |
| File seed         | Desktop has files from `fs-manifest.json` |
| File persistence  | Created files persist after reload        |
| CRUD operations   | Create, read, update, delete work         |

### 9.5 Test Flow

```
┌─────────────────────────────────────────────────────────────┐
│                    DOCKER TEST SETUP                          │
├─────────────────────────────────────────────────────────────┤
│  1. Build Docker image (docker compose build dev)             │
│  2. Start container (docker compose up dev -d)               │
│  3. Wait 15s for server ready                                 │
│  4. Seed script runs automatically                            │
│     - Creates folders: Desktop, Documents, Images, Games      │
│     - Copies files from /app/public/ to /app/workspace/       │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                    PLAYWRIGHT TESTS                            │
├─────────────────────────────────────────────────────────────┤
│  1. Playwright connects to http://localhost:5173              │
│  2. Tests verify:                                             │
│     - Runtime detection (__FDE_IN_DOCKER__)                   │
│     - Filesystem API endpoints                                │
│     - Seeded files appear in UI                               │
│     - File operations persist                                  │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                    TEARDOWN                                    │
├─────────────────────────────────────────────────────────────┤
│  docker compose down (stops container, preserves volumes)     │
└─────────────────────────────────────────────────────────────┘
```

### 9.6 Debugging Docker Tests

```bash
# Start container manually and keep it running
bun run test:docker:setup

# Run tests with UI mode
bun run test:docker:ui

# Check container logs
docker compose logs dev --tail 100

# Check seeded files
docker compose exec dev ls -la /app/workspace/Desktop/
docker compose exec dev ls -la /app/workspace/Documents/

# Check API directly
curl http://localhost:5173/api/runtime
curl 'http://localhost:5173/api/fs?action=readdir&path=/'

# Manual cleanup
docker compose down -v  # Remove volumes too
```

### 9.7 Common Issues

#### Tests fail with "Container not ready"

```bash
# Increase wait time in test:docker:setup
# In package.json, change sleep 15 to sleep 30
```

#### Files not seeded

```bash
# Check seed script logs
docker compose logs dev | grep -i seed

# Manually run seed script
docker compose exec dev sh /usr/local/bin/seed-workspace.sh

# Check manifest exists
docker compose exec dev cat /app/public/fs-manifest.json
```

#### Port already in use

```bash
# Find process using port
lsof -i :5173
lsof -i :3001

# Kill process
kill -9 <PID>
```

### 9.8 CI/CD Integration

For CI/CD pipelines:

```yaml
# GitHub Actions example
- name: Run Docker E2E Tests
  run: |
    bun run test:docker:setup
    bun run test:docker
    bun run test:docker:teardown
```

**Note:** Ensure Docker is available in your CI environment.
