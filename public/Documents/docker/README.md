# fde-desktop Docker Guide

Quick start guide for running fde-desktop in Docker.

## Quick Start

### Development Mode

```bash
# Build and start
docker compose --profile dev build
docker compose --profile dev up

# Or use the scripts
./scripts/docker-dev.sh build
```

Access: http://localhost:5173

### Production Mode

```bash
# Build and start (default profile)
docker compose build
docker compose up

# Or use the scripts
./scripts/docker-prod.sh build
```

Access: http://localhost:5173

### Using Pre-built Image from ghcr.io

If you want to run fde-desktop without building it locally, use the pre-built image from GitHub Container Registry:

```bash
# Using the ghcr compose file (default tag: hola)
docker compose -f docker-compose.ghcr.yml up

# Using a different tag
IMAGE_TAG=latest docker compose -f docker-compose.ghcr.yml up
```

Access: http://localhost:5173

## Profiles

| Profile | Command                            | Services     |
| ------- | ---------------------------------- | ------------ |
| `dev`   | `docker compose --profile dev up`  | dev, builder |
| `prod`  | `docker compose --profile prod up` | prod         |
| default | `docker compose up`                | prod         |

## Services

| Service         | Internal Port | External Port | Description                  |
| --------------- | ------------- | ------------- | ---------------------------- |
| Frontend (dev)  | 5173          | 5173          | Vite dev server              |
| API (dev)       | 3001          | 3001          | Bun API server               |
| Frontend (prod) | 8080          | 5173          | Nginx server                 |
| API (prod)      | 3001          | -             | Internal (proxied via nginx) |

**Note:** Production runs nginx on port 8080 internally (mapped to 5173 externally) because the container runs as a non-root user.

## Environment Variables

| Variable         | Default        | Description                        |
| ---------------- | -------------- | ---------------------------------- |
| `NODE_ENV`       | -              | development/production             |
| `IN_DOCKER`      | true           | Runtime detection                  |
| `EXTERNAL_PORT`  | 5173           | Port exposed to user (for display) |
| `WORKSPACE_PATH` | /app/workspace | User files directory               |
| `APPS_PATH`      | /app/apps      | Dynamic apps source                |
| `APPS_DIST`      | /app/dist-apps | Compiled apps output               |

See [Runtime Flags](../runtime-flags.md) for front-end runtime detection (`__FDE_IN_DOCKER__`, `__IS_DEV__`).

## User Permissions

Production containers run as the `bun` user (non-root) with UID/GID matching your host user:

```bash
# Build with your UID/GID (automatic on most systems)
UID=$(id -u) GID=$(id -g) docker compose build prod

# Or use defaults (UID=1000, GID=1000)
docker compose build prod
```

This ensures files created in volumes (like `/app/workspace`) are accessible from your host.

## Documentation

- [Architecture](./architecture.md) - Docker architecture overview
- [Development](./development.md) - Development workflow
- [Production](./production.md) - Production deployment (hybrid mode)
- [Publishing](./publishing.md) - Publishing images to GitHub Container Registry
- [Apps Development](./apps-development.md) - Developing user apps
- [Troubleshooting](./troubleshooting.md) - Common issues
- [Testing](./testing.md) - Docker integration tests

## Quick Reference

```bash
# Development
docker compose --profile dev up        # Start dev environment
docker compose --profile dev build     # Build dev image
docker compose logs dev -f             # View logs
docker compose exec dev sh             # Enter container

# Production
docker compose up                      # Start prod (default)
docker compose build                    # Build prod image
docker compose logs prod -f            # View logs

# Using ghcr.io image (no build required)
docker compose -f docker-compose.ghcr.yml up
IMAGE_TAG=latest docker compose -f docker-compose.ghcr.yml up

# Cleanup
docker compose down                     # Stop containers
docker compose down -v                  # Stop and remove volumes
docker compose build --no-cache        # Rebuild from scratch
```
