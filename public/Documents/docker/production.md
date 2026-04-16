# Production Deployment

Guide for deploying fde-desktop in production with the unified architecture.

## Architecture

Production uses the **same architecture as development** (nginx + supervisord + gosu), but with:

- Bundled server (not source code)
- Static files baked into image
- No Vite process
- Storybook included

```
┌─────────────────────────────────────────────────────────────────┐
│                    Production Container                          │
│                    (Runs as 'bun' user via gosu)                │
│                                                                 │
│  Entry: root → fix volumes → gosu bun → supervisord            │
│                                                                 │
│  supervisord                                                    │
│  ├── nginx (port 8080)                                         │
│  │   ├── /           → static files (framework)                │
│  │   ├── /storybook/ → Storybook documentation                  │
│  │   ├── /dist-apps/ → Dynamic apps                            │
│  │   └── /api/*     → proxy to localhost:3001                  │
│  │                                                              │
│  ├── api (port 3001)                                           │
│  │   └── bun run /app/dist-server/index.js (bundled)           │
│  │                                                              │
│  └── watcher                                                    │
│      └── Rebuilds user apps when ./apps/* changes               │
│                                                                 │
│  NO source code in container                                    │
│  Server: bun build ./packages/core/src/server/index.ts --outdir dist-server │
└─────────────────────────────────────────────────────────────────┘
```

## Key Differences from Development

| Aspect       | Development                    | Production                       |
| ------------ | ------------------------------ | -------------------------------- |
| nginx config | `nginx.dev.conf`               | `nginx.conf`                     |
| API Server   | `packages/core/src/server/index.ts` (source) | `dist-server/index.js` (bundled) |
| Vite process | Yes                            | No                               |
| Source code  | Bind mounted                   | Not included                     |
| Storybook    | Not included                   | Included                         |
| Config files | Bind mounted (dev only)        | Baked into image                 |

## Non-Root User with gosu

The container **starts as root** to fix volume ownership, then **drops to bun user**:

```sh
# entrypoint.sh flow:
# 1. Start as root
# 2. chown -R bun:bun /app/workspace /app/dist-apps
# 3. exec gosu bun:bun "$0" "$@"  # Drop privileges
# 4. Run supervisord as bun user
```

### Why gosu instead of USER?

Docker named volumes are created as root. We need to:

1. Start as root
2. Fix ownership of volumes
3. Drop to non-root user

Using `USER bun` in Dockerfile would skip step 2, causing permission errors.

### Why Internal Port 8080?

Non-root users cannot bind to ports below 1024. Therefore:

- **Internal port**: 8080 (nginx listens on this)
- **External port**: 5173 (mapped in docker-compose.yml)
- **User sees**: http://localhost:5173

## Quick Start

```bash
# Build production image (with your UID/GID for volume permissions)
UID=$(id -u) GID=$(id -g) docker compose build prod

# Start production
docker compose up prod

# Or use the script
./scripts/docker-prod.sh build
```

Access: http://localhost:5173

## Endpoints

| Endpoint      | Description             |
| ------------- | ----------------------- |
| `/`           | Main application        |
| `/storybook/` | Storybook documentation |
| `/dist-apps/` | Dynamic apps manifest   |
| `/api/*`      | REST API                |
| `/api/pty`    | WebSocket terminal      |
| `/health`     | Health check            |

## Services

### Nginx (Port 8080)

Serves static files and proxies API requests:

```nginx
# nginx.conf (production)
user bun;  # Runs as non-root

server {
    listen 8080;  # Port > 1024 for non-root

    location / {
        root /usr/share/nginx/html;
        try_files $uri $uri/ /index.html;
    }

    location /api/ {
        proxy_pass http://127.0.0.1:3001;
    }
}
```

### API Server (Port 3001)

**Bundled Bun server** (not source code):

```bash
# Built during docker build:
bun build ./packages/core/src/server/index.ts --outdir ./dist-server --target=bun

# Run in production:
bun run /app/dist-server/index.js
```

Provides:

- Filesystem API (`/api/fs/*`)
- Terminal PTY (`/api/pty`)
- Apps manifest (`/api/apps`)

### Apps Watcher

Monitors `./apps/` directory for changes using **chokidar**:

```bash
# Started by supervisord
bun run /app/docker/apps-builder.ts --watch
```

## Environment Variables

```bash
NODE_ENV=production
IN_DOCKER=true
EXTERNAL_PORT=5173      # Port shown to user
WORKSPACE_PATH=/app/workspace
APPS_PATH=/app/apps
APPS_DIST=/app/dist-apps
```

## User Permissions

Production runs as the `bun` user via gosu:

```dockerfile
# Dockerfile - no USER instruction (gosu handles this)
# entrypoint.sh starts as root, fixes ownership, then drops to bun
```

```bash
# Build with your UID/GID
UID=$(id -u) GID=$(id -g) docker compose build prod

# Or use defaults (UID=1000, GID=1000)
docker compose build prod
```

## Volumes

```yaml
volumes:
  # Bind mount for user apps (read-only)
  - ./apps:/app/apps:ro

  # Named volumes for persistence
  - dist-apps:/app/dist-apps # Compiled user apps
  - workspace:/app/workspace # User files
```

**Note**: Source code (`./src`) is NOT mounted. The built static files and bundled server are copied into the image.

### Workspace Persistence

User files are stored in named Docker volumes:

```bash
# List files
docker compose exec prod ls -la /app/workspace

# Backup workspace
docker run --rm -v fde_workspace:/data -v $(pwd):/backup alpine \
  tar czf /backup/workspace-backup.tar.gz /data

# Restore workspace
docker run --rm -v fde_workspace:/data -v $(pwd):/backup alpine \
  tar xzf /backup/workspace-backup.tar.gz -C /
```

## Health Checks

```bash
# Container health check (using wget)
curl http://localhost:5173/health

# Docker health status
docker compose ps
```

## Logs

```bash
# All logs
docker compose logs prod

# Supervisord logs
docker compose exec prod cat /var/log/supervisor/supervisord.log

# Individual services
docker compose exec prod cat /var/log/supervisor/nginx.err.log
docker compose exec prod cat /var/log/supervisor/api.err.log
docker compose exec prod cat /var/log/supervisor/watcher.err.log
```

## Scaling

For high availability, run multiple instances behind a load balancer:

```yaml
# docker-compose.prod.yml
services:
  prod:
    deploy:
      replicas: 3
    # ...

  loadbalancer:
    image: nginx:alpine
    ports:
      - '80:80'
    volumes:
      - ./nginx-lb.conf:/etc/nginx/nginx.conf
```

## Updates

```bash
# Pull latest changes
git pull

# Rebuild with latest code
docker compose build --no-cache prod

# Recreate containers
docker compose up -d --force-recreate
```

## Monitoring

```bash
# Resource usage
docker stats fde-desktop-prod-1

# Container processes
docker compose exec prod ps aux

# Supervisord status
docker compose exec prod supervisorctl status
```

## Security

### Privilege Management

The container uses gosu for proper privilege management:

```dockerfile
# Dockerfile
RUN apt-get update && apt-get install -y gosu

# Configs are owned by root (immutable)
COPY docker/nginx.conf /etc/nginx/nginx.conf
COPY docker/supervisord.conf /etc/supervisor/supervisord.conf
```

```sh
# entrypoint.sh
# 1. Running as root
# 2. Fix volume ownership: chown -R bun:bun /app/workspace
# 3. Drop privileges: exec gosu bun:bun "$0" "$@"
# 4. Now running as bun user
```

### No Source Code in Production

Production image does NOT include source code:

```dockerfile
# Build stage - compiles everything
RUN bun run build
RUN bun build ./packages/core/src/server/index.ts --outdir ./dist-server --target=bun

# Production stage - copies only artifacts
COPY --from=build /app/dist /usr/share/nginx/html
COPY --from=build /app/dist-server /app/dist-server
COPY --from=build /app/dist-apps /app/dist-apps
# NO src/ directory!
```

This reduces attack surface and image size.

### Benefits ofgosu vs USER

| Approach       | Works? | Why                                               |
| -------------- | ------ | ------------------------------------------------- |
| `USER bun`     | No     | Can't fix volume ownership (root creates volumes) |
| `gosu bun cmd` | Yes    | Start as root → fix permissions → drop to bun     |

### HTTPS (Recommended)

Add a reverse proxy for SSL termination:

```yaml
# docker-compose.prod.yml
services:
  prod:
    # ... existing config

  nginx-proxy:
    image: nginx:alpine
    ports:
      - '443:443'
    volumes:
      - ./nginx-ssl.conf:/etc/nginx/nginx.conf
      - ./certs:/etc/nginx/certs
```

### Rate Limiting

Add to nginx configuration:

```nginx
# Rate limit API
location /api/ {
    limit_req zone=api burst=10 nodelay;
    proxy_pass http://api_server;
}

# Define zone
limit_req_zone $binary_remote_addr zone=api:10m rate=10r/s;
```

## Troubleshooting

### Services Not Starting

```bash
# Check supervisord logs
docker compose exec prod cat /var/log/supervisor/supervisord.log

# Check individual services
docker compose exec prod supervisorctl status

# Restart a service
docker compose exec prod supervisorctl restart api
```

### Nginx Errors

```bash
# Check nginx logs
docker compose exec prod cat /var/log/nginx/error.log

# Test nginx config
docker compose exec prod nginx -t

# Reload nginx
docker compose exec prod nginx -s reload
```

### Permission Denied Errors

If you see permission errors with workspace files:

```bash
# Fix workspace permissions (run as root temporarily)
docker compose exec -u root prod chown -R bun:bun /app/workspace

# Or rebuild with your UID/GID
UID=$(id -u) GID=$(id -g) docker compose build prod --no-cache
docker compose up prod
```

### API Server Errors

```bash
# Check API logs
docker compose exec prod cat /var/log/supervisor/api.err.log

# Test API directly (inside container, port 3001)
docker compose exec prod wget -qO- http://localhost:3001/api/runtime
```

### Apps Watcher Issues

```bash
# Check watcher logs
docker compose exec prod cat /var/log/supervisor/watcher.err.log

# Restart watcher
docker compose exec prod supervisorctl restart watcher

# Manually rebuild apps
docker compose exec prod bun run /app/docker/apps-builder.ts --clean
```

## Next Steps

- [Apps development](./apps-development.md)
- [Troubleshooting](./troubleshooting.md)
