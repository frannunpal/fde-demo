# Docker Architecture

Complete guide to Docker architecture, deployment, and development in fde-desktop.

## Overview

fde-desktop runs in Docker with a **unified architecture** for both development and production:

- **Same processes**: Both use nginx + supervisord + gosu
- **Same endpoints**: Both expose the same routes
- **Difference**: Development includes source code bind mounts + Vite; Production has bundled server + static files

## Architecture Overview

### Unified Container Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│              Unified Architecture (Dev & Prod)                   │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  Entrypoint (entrypoint.sh)                                     │
│  ├─ Start as root                                               │
│  ├─ Inject Docker runtime flags                                 │
│  ├─ Fix volume ownership (gosu needs this)                      │
│  └─ exec gosu bun:bun → drop to bun user                        │
│                                                                 │
│  Supervisord (manages all processes)                            │
│  ├── nginx (port 8080)                                          │
│  │   └─ Proxies /api/* to localhost:3001                        │
│  │                                                              │
│  ├── api (port 3001)                                            │
│  │   └─ REST API + WebSocket for filesystem/PTY                 │
│  │                                                              │
│  ├── watcher (chokidar)                                         │
│  │   └─ Rebuilds apps when ./apps/* changes                      │
│  │                                                              │
│  └── [vite] (Development only)                                  │
│      └─ Vite dev server for HMR                                  │
│                                                                 │
│  Dev:  /app/index.html + bind mounts                            │
│  Prod: /usr/share/nginx/html/ (static files, bundled server)    │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### Multi-Stage Dockerfile

```
┌─────────────────────────────────────────────────────────────────┐
│                    Dockerfile                              │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  Stage 1a: deps (oven/bun:1.2)                                 │
│  ├─ Full dependencies (electron, playwright, testing)          │
│  └─ Used by: development                                       │
│                                                                 │
│  Stage 1b: deps-minimal (oven/bun:1.2)                         │
│  ├─ Filtered dependencies (no electron, playwright, tests)     │
│  └─ Used by: builder, build, production                        │
│                                                                 │
│  Stage 2: development (oven/bun:1.2)                           │
│  ├─ nginx + supervisord + gosu                                  │
│  ├─ Full node_modules from deps                                 │
│  ├─ Vite dev server + API server                                │
│  └─ Apps watcher for dynamic apps                              │
│                                                                 │
│  Stage 3: builder (oven/bun:1.2)                               │
│  ├─ Builds dynamic apps only                                   │
│  └─ Used for: CI/CD                                            │
│                                                                 │
│  Stage 4: build (oven/bun:1.2)                                 │
│  ├─ Compiles framework (Vite + TypeScript)                     │
│  ├─ Builds Storybook                                           │
│  ├─ Builds server bundle (bun build)                           │
│  └─ Builds dynamic apps                                        │
│                                                                 │
│  Stage 5: production (oven/bun:1.2 + supervisord)              │
│  ├─ nginx + supervisord + gosu                                  │
│  ├─ Static files (no source code!)                             │
│  ├─ Bundled server (dist-server/index.js)                      │
│  ├─ Apps watcher                                               │
│  └─ Runs as 'bun' user via gosu                                │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### Dependency Filtering

Production builds exclude heavy dependencies:

| Excluded             | Reason                  | Size Saved |
| -------------------- | ----------------------- | ---------- |
| `electron`           | Only for desktop builds | ~300MB     |
| `electron-builder`   | Only for packaging      | ~50MB      |
| `@playwright/test`   | Only for E2E tests      | ~300MB     |
| `@testing-library/*` | Only for unit tests     | ~20MB      |
| `jsdom`              | Only for tests          | ~15MB      |
| `fake-indexeddb`     | Only for tests          | ~5MB       |

Total savings: **~700MB** per production build.

## Privilege Management with gosu

Both development and production containers start as **root** to fix volume ownership, then drop to **bun** user:

```sh
# entrypoint.sh
# 1. Start as root
# 2. Fix volume ownership (chown -R bun:bun /app/workspace)
# 3. Drop privileges: exec gosu bun:bun "$0" "$@"
# 4. Run supervisord as bun user
```

This ensures:

- Docker named volumes work correctly (created as root by Docker)
- Container runs as non-root for security
- UID/GID configurable via build args to match host user

## Entrypoint: entrypoint.sh

The unified entrypoint handles both development and production modes:

```sh
# Environment detection
NODE_ENV="${NODE_ENV:-development}"
IS_PRODUCTION="false"
if [ "$NODE_ENV" = "production" ]; then
  IS_PRODUCTION="true"
  INDEX_HTML="/usr/share/nginx/html/index.html"
  PORT="${EXTERNAL_PORT:-8080}"
else
  INDEX_HTML="/app/index.html"
  PORT="5173"
fi

# Inject runtime flags (as root)
sed -i 's/window.__FDE_IN_DOCKER__ = false;/window.__FDE_IN_DOCKER__ = true;/' "$INDEX_HTML"

# Fix volume ownership (as root)
VOLUME_DIRS="/app/dist-apps /app/workspace"  # prod
# or VOLUME_DIRS="/app/dist /app/dist-apps /app/node_modules /app/workspace"  # dev
chown -R bun:bun "$dir"

# Drop privileges
exec gosu bun:bun "$0" "$@"

# Start supervisord (as bun user)
exec /usr/bin/supervisord -c /etc/supervisor/supervisord.conf
```

## Supervisord Configuration

Both environments use supervisord to manage processes:

### Development (supervisord.dev.conf)

```ini
[supervisord]
nodaemon=true

[program:nginx]
command=nginx -g "daemon off;"
priority=10

[program:api]
command=bun run /app/packages/core/src/server/index.ts
environment=PORT="3001",IN_DOCKER="true",NODE_ENV="development"
priority=20

[program:watcher]
command=bun run /app/docker/apps-builder.ts --watch
priority=30

[program:vite]
command=bun run dev --host
priority=40
```

### Production (supervisord.prod.conf)

```ini
[supervisord]
nodaemon=true

[program:nginx]
command=nginx -g "daemon off;"
priority=10

[program:api]
command=bun run /app/dist-server/index.js
environment=PORT="3001",IN_DOCKER="true",NODE_ENV="production"
priority=20

[program:watcher]
command=bun run /app/docker/apps-builder.ts --watch
priority=30
```

**Key differences:**
| Aspect | Development | Production |
| -------------- | ---------------------------- | ----------------------------- |
| API command | `bun run packages/core/src/server/index.ts`| `bun run dist-server/index.js`|
| Vite process | Yes (HMR) | No |
| Source code | Bind mounted | Not included |

## Config Files Immutability

All configuration files are **baked into the Docker image** (not bind mounted):

| File                      | Location in Image                  |
| ------------------------- | ---------------------------------- |
| `docker/nginx.conf`       | `/etc/nginx/nginx.conf`            |
| `docker/nginx.dev.conf`   | `/etc/nginx/nginx.dev.conf`        |
| `docker/supervisord.conf` | `/etc/supervisor/supervisord.conf` |
| `docker/entrypoint.sh`    | `/app/docker/entrypoint.sh`        |

This ensures consistency and reproducibility.

## Development Architecture

### Development Container (Stage 2)

```
┌─────────────────────────────────────────────────────────────────┐
│                    Development Container                         │
│                    (Runs as 'bun' user via gosu)                │
│                                                                 │
│  supervisord                                                    │
│  ├── nginx (port 8080)                                         │
│  │   └── /api/* → proxy to localhost:3001                      │
│  │                                                              │
│  ├── api (port 3001)                                            │
│  │   └── bun run /app/packages/core/src/server/index.ts                       │
│  │                                                              │
│  ├── watcher                                                    │
│  │   └── Rebuilds apps when ./apps/* changes                    │
│  │                                                              │
│  └── vite                                                       │
│      └── Vite dev server for HMR (proxies to nginx)            │
│                                                                 │
│  Bind mounts: ./src, ./public, ./apps, ./docker                 │
│  Named volumes: node_modules, dist, dist-apps, workspace        │
└─────────────────────────────────────────────────────────────────┘
```

**Features:**

- Full test dependencies installed
- Hot reload for React code (Vite HMR)
- Real filesystem access via API
- WebSocket terminal (PTY)
- Apps watcher for dynamic apps
- nginx proxies API requests

## Production Architecture

### Production Container (Stage 5)

```
┌─────────────────────────────────────────────────────────────────┐
│                    Production Container                          │
│                    (Runs as 'bun' user via gosu)                │
│                                                                 │
│  supervisord                                                    │
│  ├── nginx (port 8080)                                         │
│  │   ├── /           → static files (framework)                │
│  │   ├── /storybook/ → Storybook documentation                  │
│  │   ├── /dist-apps/ → Dynamic apps                            │
│  │   └── /api/*     → proxy to localhost:3001                  │
│  │                                                              │
│  ├── api (port 3001)                                           │
│  │   └── bun run /app/dist-server/index.js (bundled!)          │
│  │                                                              │
│  └── watcher                                                    │
│      └── Rebuilds apps when ./apps/* changes                    │
│                                                                 │
│  NO source code in image (only dist/ and dist-server/)         │
│  Server bundled with: bun build ./packages/core/src/server/index.ts          │
└─────────────────────────────────────────────────────────────────┘
```

**Key differences from Development:**

| Aspect       | Development                    | Production                       |
| ------------ | ------------------------------ | -------------------------------- |
| API Server   | `packages/core/src/server/index.ts` (source) | `dist-server/index.js` (bundled) |
| Vite process | Yes                            | No                               |
| Source code  | Bind mounted                   | Not included in image            |
| Storybook    | Not included                   | Included                         |
| nginx config | `nginx.dev.conf`               | `nginx.conf`                     |

## Runtime Detection

### How It Works

The container sets `window.__FDE_IN_DOCKER__ = true` at runtime:

```html
<!-- index.html (default) -->
<script>
  window.__FDE_IN_DOCKER__ = false;
</script>

<!-- After entrypoint injection -->
<script>
  window.__FDE_IN_DOCKER__ = true;
</script>
```

Development also sets `window.__IS_DEV__ = true`.

### Detection API

```typescript
// packages/core/src/utils/getRuntime.ts
type Runtime = 'browser' | 'docker' | 'electron';

export function getRuntime(): Runtime {
  if (typeof window === 'undefined') return 'browser';
  if ((window as any).__FDE_IN_DOCKER__ === true) return 'docker';
  if (/Electron/i.test(navigator.userAgent)) return 'electron';
  return 'browser';
}
```

### Usage in Code

```typescript
// FileSystem adapter selection
import { IndexedDBFileSystem } from '@infrastructure/Adapters/IndexedDBFileSystem';
import { DockerFileSystemAdapter } from '@infrastructure/Adapters/DockerFileSystemAdapter';
import { isDocker } from '@shared/Utils/getRuntime';

function createFileSystemAdapter() {
  if (isDocker()) {
    return new DockerFileSystemAdapter();
  }
  return new IndexedDBFileSystem();
}
```

## REST API Endpoints

### Filesystem API

| Method | Endpoint                         | Description           |
| ------ | -------------------------------- | --------------------- |
| GET    | `/api/fs?action=readdir&path=/`  | List directory        |
| GET    | `/api/fs?action=read&path=/file` | Read file             |
| GET    | `/api/fs?action=stat&path=/path` | Get metadata          |
| POST   | `/api/fs`                        | Create/write file     |
| PUT    | `/api/fs`                        | Create directory      |
| DELETE | `/api/fs?path=/path`             | Delete file/directory |

### WebSocket PTY

```javascript
const ws = new WebSocket('ws://localhost:5173/api/pty');

ws.onopen = () => {
  ws.send(JSON.stringify({ type: 'start', cwd: '/' }));
};

ws.onmessage = event => {
  console.log(event.data); // Shell output
};

// Send input
ws.send(JSON.stringify({ type: 'input', data: 'ls\n' }));
```

## Volumes

### Development Volumes

```yaml
services:
  dev:
    volumes:
      # Bind mounts for hot reload
      - ./src:/app/src
      - ./public:/app/public
      - ./apps:/app/apps
      # Named volumes for persistence
      - node_modules:/app/node_modules
      - dist:/app/dist
      - dist-apps:/app/dist-apps
      - workspace:/app/workspace
```

### Production Volumes

```yaml
services:
  prod:
    volumes:
      # Bind mounts for user apps (read-only)
      - ./apps:/app/apps:ro
      # Named volumes for persistence
      - dist-apps:/app/dist-apps
      - workspace:/app/workspace
```

**Note:** Production does NOT mount source code. The server is bundled and static files are copied into the image.

### Volume Persistence

```bash
# List volumes
docker volume ls

# Inspect a volume
docker volume inspect fde_workspace

# Copy files from volume
docker cp fde-desktop-prod-1:/app/workspace/. ./backup/

# Remove volumes (WARNING: destroys data)
docker compose down -v
```

## Build Optimization

### Layer Caching

Dockerfile layers are ordered from least to most frequently changed:

```dockerfile
# 1. Dependencies (cached if package.json unchanged)
COPY package.json bun.lock ./
RUN bun install --frozen-lockfile --ignore-scripts

# 2. Source code (rebuilds on change)
COPY src src
COPY public public
# ...

# 3. Build
RUN bun run build
```

### .dockerignore

Excludes unnecessary files:

```dockerignore
# Dependencies
node_modules

# Build outputs
dist
dist-apps

# Development
.git
.husky
*.md
!README.md

# IDE
.vscode
.idea

# Test
coverage
test-results

# Electron
electron
```

## Debugging

### Check Container Status

```bash
docker compose ps
docker compose logs dev --tail 100
docker compose exec dev sh
```

### Verify Runtime

```bash
# Check Docker flag
docker compose exec dev cat index.html | grep IN_DOCKER

# Check API
curl http://localhost:5173/api/runtime

# Test filesystem
curl 'http://localhost:5173/api/fs?action=readdir&path=/'
```

### Full Reset

```bash
docker compose down -v          # Stop and remove volumes
docker compose build --no-cache # Rebuild from scratch
docker compose up dev           # Start fresh
```

## Next Steps

- [Development workflow](./development.md)
- [Production deployment](./production.md)
- [Troubleshooting](./troubleshooting.md)
