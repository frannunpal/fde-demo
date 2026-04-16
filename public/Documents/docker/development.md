# Development Workflow

Guide for developing fde-desktop in Docker with the unified architecture.

## Architecture

Development uses the **same architecture as production** (nginx + supervisord + gosu), with these additions:

- Vite dev server for HMR
- Source code bind mounted
- Full test dependencies

```
┌─────────────────────────────────────────────────────────────────┐
│                    Development Container                         │
│                    (Runs as 'bun' user via gosu)                │
│                                                                 │
│  Entry: root → fix volumes → gosu bun → supervisord            │
│                                                                 │
│  supervisord                                                    │
│  ├── nginx (port 8080)                                         │
│  │   └── /api/* → proxy to localhost:3001                      │
│  │                                                              │
│  ├── api (port 3001)                                           │
│  │   └── bun run /app/packages/core/src/server/index.ts (source code!)      │
│  │                                                              │
│  ├── watcher                                                   │
│  │   └── Rebuilds apps when ./apps/* changes                    │
│  │                                                              │
│  └── vite (development only)                                   │
│      └── Vite dev server for HMR                                │
│                                                                 │
│  Bind mounts: ./src, ./public, ./apps, ./docker                 │
│  Named volumes: node_modules, dist, dist-apps, workspace        │
└─────────────────────────────────────────────────────────────────┘
```

## Key Differences from Production

| Aspect       | Development                    | Production                       |
| ------------ | ------------------------------ | -------------------------------- |
| nginx config | `nginx.dev.conf`               | `nginx.conf`                     |
| API Server   | `packages/core/src/server/index.ts` (source) | `dist-server/index.js` (bundled) |
| Vite process | Yes                            | No                               |
| Source code  | Bind mounted                   | Not included                     |
| Storybook    | Not included                   | Included                         |

## Starting Development

### First Time Setup

```bash
# Build development image (with your UID/GID)
UID=$(id -u) GID=$(id -g) docker compose --profile dev build

# Start container
docker compose --profile dev up

# Or use the script
./scripts/docker-dev.sh
```

### Daily Development

```bash
# Start development
docker compose --profile dev up

# View logs
docker compose logs dev -f

# Enter container
docker compose exec dev sh
```

## Hot Reload

### What Triggers Reload

Changes to the following trigger immediate reload:

| Path           | Reload Type          |
| -------------- | -------------------- |
| `src/**/*`     | Vite HMR (instant)   |
| `public/**/*`  | Vite HMR (instant)   |
| `apps/**/*`    | Apps watcher rebuild |
| `package.json` | Dependency reinstall |

### Verify Hot Reload

```bash
# 1. Start container
docker compose --profile dev up -d

# 2. Modify a file
echo "// test" >> src/App.tsx

# 3. Check Vite logs
docker compose logs dev --tail 20
# Expected: [vite] hmr update /src/App.tsx
```

## Development Tools

### Accessing the Container

```bash
# Shell access
docker compose exec dev sh

# Check environment
docker compose exec dev env | grep -E "IN_DOCKER|WORKSPACE"

# Check file structure
docker compose exec dev ls -la /app/
```

### Debugging API

```bash
# Test API endpoint
curl http://localhost:5173/api/runtime

# Test filesystem
curl 'http://localhost:5173/api/fs?action=readdir&path=/'

# Create a file
curl -X POST 'http://localhost:5173/api/fs' \
  -H 'Content-Type: application/json' \
  -d '{"path":"test.txt","content":"Hello"}'

# Read the file
curl 'http://localhost:5173/api/fs?action=read&path=/test.txt'
```

### Debugging in Browser

Open browser console (F12):

```javascript
// Check runtime flags
console.log('In Docker:', window.__FDE_IN_DOCKER__);
console.log('Dev mode:', window.__IS_DEV__);

// Check filesystem API
console.log('FS API:', window.__FDE_API__?.fs);

// Test notification
window.__FDE_API__?.showNotification({
  title: 'Test',
  message: 'Hello from console',
  type: 'info',
});
```

## Testing

### Running Tests

```bash
# Inside container
docker compose exec dev bun run test

# Specific test file
docker compose exec dev bun run test:unit packages/core/tests/utils/getRuntime.test.ts

# Watch mode
docker compose exec dev bun run test --watch
```

### Docker Integration Tests

```bash
# Run Docker E2E tests
bun run test:docker

# With UI
bun run test:docker:ui
```

## Working with Apps

### Creating a New App

```bash
# Use the template script
./docker/create-app.sh my-app "My App"

# Or manually
mkdir -p apps/my-app/src
cd apps/my-app
bun install
bun run dev
```

### Building Apps

```bash
# Build all apps once
bun run apps:build

# Watch for changes
bun run apps:watch
```

### Testing Apps

Apps in `apps/` directory are watched by the apps-builder:

```bash
# Check apps manifest
curl http://localhost:5173/api/apps

# Trigger rebuild by modifying
echo "// change" >> apps/example-app/src/App.vue
```

## Troubleshooting

### Container Won't Start

```bash
# Check logs
docker compose logs dev

# Check if ports are in use
lsof -i :5173
lsof -i :3001

# Rebuild from scratch
docker compose down -v
docker compose build --no-cache
docker compose up dev
```

### Hot Reload Not Working

```bash
# Verify volumes are mounted
docker compose exec dev ls -la /app/src/

# Check Vite config
docker compose exec dev cat vite.config.ts | grep proxy

# Restart container
docker compose restart dev
```

### Permission Denied

If you see permission errors:

```bash
# The entrypoint should fix this automatically, but if needed:
docker compose exec -u root dev chown -R bun:bun /app/workspace
docker compose exec -u root dev chown -R bun:bun /app/apps

# Or rebuild with your UID/GID
UID=$(id -u) GID=$(id -g) docker compose --profile dev build --no-cache
```

**Note**: The entrypoint starts as root to fix volume ownership (including `/app/apps`) and then drops to `bun` user via gosu. It also automatically runs `bun install` for any app in `apps/*/` that has a `package.json` but no `node_modules`, so code-server and other tools can resolve dependencies immediately.

## Environment Variables

```bash
# Set in docker-compose.yml
environment:
  - NODE_ENV=development
  - IN_DOCKER=true
  - VERBOSE=true
  - WORKSPACE_PATH=/app/workspace

# Or pass at runtime
docker compose --profile dev up -e VERBOSE=true
```

## Volumes

### Named Volumes

```bash
# List volumes
docker volume ls

# Inspect volume
docker volume inspect fde_workspace

# Backup volume
docker run --rm -v fde_workspace:/data -v $(pwd):/backup alpine \
  tar czf /backup/workspace-backup.tar.gz /data
```

### Bind Mounts

```yaml
# docker-compose.yml
volumes:
  - ./src:/app/src # Source code
  - ./public:/app/public # Static assets
  - ./apps:/app/apps # Dynamic apps
```

## Cleanup

```bash
# Stop containers
docker compose down

# Remove volumes
docker compose down -v

# Remove images
docker compose down --rmi all

# Complete reset
docker compose down -v --rmi all
docker system prune -a
```

## Next Steps

- [Production deployment](./production.md)
- [Troubleshooting](./troubleshooting.md)
