# Docker Troubleshooting

Common issues and solutions when developing fde-desktop in Docker.

## Quick Diagnostics

### Check Container Status

```bash
# Is the container running?
docker compose ps

# View logs
docker compose logs dev --tail 100

# Check runtime detection
docker compose exec dev cat index.html | grep FDE_IN_DOCKER
# Expected: window.__FDE_IN_DOCKER__ = true;

# Check API server
curl http://localhost:5173/api/runtime
# Expected: {"docker":true,"workspace":"/app/workspace","version":"1.0.0"}

# Test filesystem
curl 'http://localhost:5173/api/fs?action=readdir&path=/'
# Expected: [] (empty directory) or list of files
```

## Common Issues

### 1. Permission Denied on Files

#### Symptoms

```
cp: cannot create regular file 'public/Documents/file.md': Permission denied
```

#### Cause

Files created inside the container are owned by `root` because `COPY . .` in Dockerfile runs as root by default.

#### Solution

**Option A: Fix ownership in Dockerfile**

```dockerfile
COPY --chown=bun:bun . .
```

**Option B: Create directories in entrypoint**

```sh
# entrypoint.sh
mkdir -p public/Documents
```

**Option C: Use named volumes for generated files**

```yaml
# docker-compose.yml
volumes:
  - dist:/app/dist
  - dist-apps:/app/dist-apps
```

### 2. `bun install` Hangs

#### Symptoms

```
bun install
# ... no output for minutes
```

#### Cause

`bun install` in runtime is slow because it needs to download packages each time.

#### Solution

Move dependency installation to build phase:

```dockerfile
# Before (slow)
COPY . .
RUN mkdir -p node_modules
CMD ["/entrypoint.sh"]
# entrypoint.sh runs: bun install

# After (fast)
COPY package.json bun.lock ./
RUN bun install --frozen-lockfile
COPY . .
CMD ["/entrypoint.sh"]
# entrypoint.sh only checks for changes
```

### 3. `bun install` Still Slow After Fix

#### Symptoms

Container takes long to start even after moving `bun install` to Dockerfile.

#### Cause

Named volume `node_modules` may contain stale packages.

#### Solution

```bash
# Rebuild with fresh volumes
docker compose down -v
docker compose build --no-cache dev
docker compose up dev
```

### 4. Shell Script Syntax Errors

#### Symptoms

```sh
/entrypoint.sh: 100: Syntax error: Unterminated quoted string
```

#### Cause

Alpine/busybox `sh` doesn't handle nested quoting like `"'"$(..)"'"`.

#### Solution

Use intermediate variable:

```sh
# Before (fails)
echo '{"generated":"'"$(date)"'"}' > file.json

# After (works)
TIMESTAMP=$(date -u +"%Y-%m-%dT%H:%M:%SZ")
echo "{\"generated\":\"$TIMESTAMP\"}" > file.json
```

### 5. `command not found: copy`

#### Symptoms

```sh
error: script "copy-docs" exited with code 127
/usr/bin/bash: line 1: copy: command not found
```

#### Cause

The `copy` command only exists in Windows. Linux/macOS uses `cp`.

#### Solution

Use POSIX-compliant commands:

```json
// package.json
{
  "scripts": {
    "copy-docs": "mkdir -p public/Documents && cp docs/*.md public/Documents/ || true"
  }
}
```

The `|| true` ensures the script continues even if some files can't be copied.

### 6. `target "builder" not found`

#### Symptoms

```
target builder: failed to solve: target stage "builder" could not be found
```

#### Cause

Referenced Dockerfile stage doesn't exist.

#### Solution

Add the missing stage:

```dockerfile
# Add builder stage
FROM oven/bun:1.2 AS builder
WORKDIR /app
COPY package.json bun.lock ./
RUN bun install --frozen-lockfile
CMD ["bun", "run", "docker/apps-builder.ts"]
```

### 7. WebSocket Connection Fails

#### Symptoms

```
WebSocket connection to 'ws://localhost:5173/api/pty' failed
```

#### Cause

Vite proxy not configured for WebSocket.

#### Solution

Add `ws: true` to Vite proxy:

```typescript
// vite.config.ts
export default defineConfig({
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:3001',
        changeOrigin: true,
        ws: true, // Enable WebSocket proxying
      },
    },
  },
});
```

### 8. API Returns 404 in Production

#### Symptoms

```
GET http://localhost/api/runtime 404 (Not Found)
```

#### Cause

Production uses nginx to serve static files, but there's no API server.

#### Solution

Production needs a separate API server or must be built differently:

**Option A: Add API server to production image**

```dockerfile
FROM oven/bun:1.2 AS production
COPY --from=build /app/dist /app/dist
COPY --from=build /app/packages/core/src/server /app/server
CMD ["bun", "run", "/app/server/index.ts"]
```

**Option B: Deploy API server separately**

```yaml
# docker-compose.prod.yml
services:
  frontend:
    image: nginx:alpine
    # ... nginx config

  api:
    image: fde-desktop-api:latest
    ports:
      - '3001:3001'
```

### 9. Hot Reload Not Working

#### Symptoms

Changes to source files don't trigger Vite HMR.

#### Cause

Volume not mounted correctly.

#### Solution

```yaml
# docker-compose.yml
volumes:
  - ./src:/app/src # Required for hot reload
  - ./public:/app/public # Required for static assets
```

Verify volumes:

```bash
docker compose exec dev ls -la /app/src
# Should show your source files
```

### 10. Container Exits Immediately

#### Symptoms

```bash
docker compose up dev
# Container starts then immediately stops
```

#### Cause

Entrypoint script has errors or missing `exec` for foreground process.

#### Solution

```sh
# entrypoint.sh

# WRONG: Script ends without foreground process
bun build
bun run dev    # This runs but script continues

# CORRECT: Use exec for foreground process
bun build
exec bun run dev --host  # 'exec' replaces shell with process
```

### 11. Cannot Access Files from Container

#### Symptoms

```bash
docker compose exec dev ls /app/workspace
# ls: cannot access '/app/workspace': No such file or directory
```

#### Cause

Directory not created in Dockerfile.

#### Solution

```dockerfile
# Dockerfile
RUN mkdir -p /app/workspace
```

Or create in entrypoint:

```sh
# entrypoint.sh
mkdir -p /app/workspace
```

### 12. Container Out of Disk Space

#### Symptoms

```bash
no space left on device
```

#### Cause

Docker images and volumes accumulating over time.

#### Solution

```bash
# Remove unused images
docker image prune -a

# Remove unused volumes
docker volume prune

# Remove everything
docker system prune -a --volumes
```

### 13. Named Volume Data Loss

#### Symptoms

Data in `/app/workspace` disappears after `docker compose down`.

#### Cause

Named volumes are removed with `docker compose down -v`.

#### Solution

```bash
# Stop without removing volumes
docker compose down

# Or backup before removing
docker run --rm -v fde_workspace:/data -v $(pwd):/backup alpine tar czf /backup/workspace-backup.tar.gz /data
docker compose down -v
```

### 14. Node Modules Not Persisting

#### Symptoms

Package installation runs every container start.

#### Cause

`node_modules` volume not properly defined or mounted.

#### Solution

```yaml
# docker-compose.yml
volumes:
  - ./package.json:/app/package.json
  - ./bun.lock:/app/bun.lock
  - node_modules:/app/node_modules # Named volume for persistence
```

### 15. Port Already in Use

#### Symptoms

```
Error: port 5173 already in use
```

#### Cause

Another process using the port.

#### Solution

```bash
# Find process using port
lsof -i :5173

# Kill process
kill -9 <PID>

# Or use different port
docker compose up dev -e PORT=5174
```

## Testing Steps

### Complete Flow Checklist

```bash
# 1. Build image
docker compose build dev

# 2. Start container
docker compose up dev -d

# 3. Verify Docker flag
docker compose exec dev cat index.html | grep IN_DOCKER
# Expected: window.__FDE_IN_DOCKER__ = true;

# 4. Check API server
curl http://localhost:5173/api/runtime
# Expected: {"docker":true,"workspace":"/app/workspace","version":"1.0.0"}

# 5. Test filesystem
curl -X POST 'http://localhost:5173/api/fs' \
  -H 'Content-Type: application/json' \
  -d '{"path":"test.txt","content":"Hello"}'
# Expected: {"path":"test.txt","content":"Hello","encoding":"utf-8"}

# 6. Verify file created
curl 'http://localhost:5173/api/fs?action=readdir&path=/'
# Expected: [{"name":"test.txt",...}]

# 7. Clean up
docker compose down
```

### Verify Runtime Detection in Browser

```javascript
// Open browser console (F12)
console.log(window.__FDE_IN_DOCKER__);
// Expected: true (in container) / false (local)

console.log(window.__FDE_API__.fs);
// Expected: DockerFileSystemAdapter (in container) / IndexedDBFileSystem (local)
```

### Test Hot Reload

```bash
# 1. Start container
docker compose up dev -d

# 2. Modify a file locally
echo "// test" >> src/App.tsx

# 3. Check Vite logs
docker compose logs dev --tail 20
# Expected: [vite] hmr update /src/App.tsx

# 4. Verify in browser
# Open http://localhost:5173
# Changes should appear without reload
```

## Debug Commands

```bash
# Full container inspection
docker compose exec dev sh
> cat /etc/os-release
> bun --version
> ls -la /app/
> env | grep -E "DOCKER|WORKSPACE"
> cat /entrypoint.sh

# Volume inspection
docker volume ls
docker volume inspect fde-desktop_node_modules

# Network inspection
docker network ls
docker network inspect fde_default

# Complete reset
docker compose down -v        # Stop and remove volumes
docker compose build --no-cache  # Rebuild from scratch
docker compose up dev         # Start fresh
```

## Performance Tips

### Speed Up Build

1. **Layer caching**: Order Dockerfile from least to most frequently changed

```dockerfile
# Least changed (cached)
COPY package.json bun.lock ./
RUN bun install --frozen-lockfile

# Most changed (rebuilt often)
COPY . .
```

2. **Use .dockerignore**

```dockerignore
node_modules
dist
.git
*.md
```

3. **Named volumes for node_modules**

```yaml
volumes:
  - node_modules:/app/node_modules # Persisted, not copied each build
```

### Speed Up Runtime

1. **Minimal COPY in entrypoint**:

```sh
# Only copy what's needed
bun install --frozen-lockfile &
bun run build &
wait
```

2. **Use `bun install` instead of `bun add`**:

```sh
# Better: Install all at once
bun install --frozen-lockfile

# Worse: Install individual packages
bun add react
bun add react-dom
```

## Getting Help

If you encounter an issue not covered here:

1. Check the logs: `docker compose logs dev -f`
2. Inspect the container: `docker compose exec dev sh`
3. Review architecture: [architecture.md](./architecture.md)
4. Check Docker documentation: https://docs.docker.com/
