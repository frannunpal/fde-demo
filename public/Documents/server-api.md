# Server API Reference

The server layer provides API endpoints and WebSocket connections for Docker mode. It's built with Bun and runs inside the Docker container.

## Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                    Docker Container                               │
│                                                                  │
│  supervisord                                                    │
│  ├── nginx (Port 8080)                                          │
│  │   ├── /           → static files                              │
│  │   └── /api/*     → proxy to localhost:3001                    │
│  │                                                              │
│  ├── api-server (Port 3001)                                      │
│  │   ├── REST /api/fs/*                                          │
│  │   ├── REST /api/runtime                                       │
│  │   ├── REST /api/shell                                         │
│  │   └── WebSocket /api/pty                                      │
│  │                               └── WebSocket /api/hmr          │
│  │                                                              │
│  └── watcher - Rebuilds apps when ./apps/* changes              │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

## REST Endpoints

### File System (`/api/fs/*`)

File system operations bound to `WORKSPACE_PATH`.

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/fs/read` | GET | Read file contents |
| `/api/fs/write` | POST | Write file contents |
| `/api/fs/delete` | DELETE | Delete file or directory |
| `/api/fs/list` | GET | List directory contents |
| `/api/fs/mkdir` | POST | Create directory |
| `/api/fs/stat` | GET | Get file/directory stats |
| `/api/fs/rename` | POST | Rename file or directory |
| `/api/fs/copy` | POST | Copy file or directory |
| `/api/fs/reset` | POST | Reset workspace to initial state |

**Example:**

```typescript
// Read file
const response = await fetch('/api/fs/read?path=/app/workspace/file.txt');
const content = await response.text();

// Write file
await fetch('/api/fs/write', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ path: '/app/workspace/new.txt', content: 'Hello' }),
});
```

### Runtime Info (`/api/runtime`)

Returns runtime configuration and version.

```typescript
const response = await fetch('/api/runtime');
const info = await response.json();
// {
//   docker: true,
//   workspace: '/app/workspace',
//   version: '1.0.0'
// }
```

### Shell Info (`/api/shell`)

Returns available shell configurations.

```typescript
const response = await fetch('/api/shell');
const shells = await response.json();
// {
//   default: '/bin/zsh',
//   available: ['/bin/sh', '/bin/zsh', '/bin/bash']
// }
```

### HMR Broadcast (`/api/hmr/broadcast`)

Broadcasts an HMR event to all connected clients. Used by the apps watcher.

```typescript
await fetch('/api/hmr/broadcast', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    type: 'reload',
    appId: 'my-app',
  }),
});
```

## WebSocket Endpoints

### PTY (`/api/pty`)

Terminal WebSocket for shell access.

**Connection:**

```typescript
const ws = new WebSocket('/api/pty');

ws.onopen = () => {
  // Send terminal size
  ws.send(JSON.stringify({ type: 'resize', cols: 80, rows: 24 }));
};

ws.onmessage = (event) => {
  // Receive terminal output
  const data = JSON.parse(event.data);
  if (data.type === 'output') {
    console.log(data.data);
  }
};

// Send input to terminal
ws.send(JSON.stringify({ type: 'input', data: 'ls -la\n' }));
```

**Message Types:**

| Type | Direction | Description |
|------|-----------|-------------|
| `input` | Client → Server | Terminal input |
| `output` | Server → Client | Terminal output |
| `resize` | Client → Server | Resize terminal (cols, rows) |
| `exit` | Server → Client | Process exited |

### HMR (`/api/hmr`)

Hot Module Replacement WebSocket for custom apps.

**Connection:**

```typescript
const ws = new WebSocket('/api/hmr');

ws.onmessage = (event) => {
  const message = JSON.parse(event.data);
  
  switch (message.type) {
    case 'reload':
      console.log(`App ${message.appId} needs reload`);
      break;
    case 'app-registered':
      console.log(`App ${message.manifest.id} registered`);
      break;
    case 'app-unregistered':
      console.log(`App ${message.appId} unregistered`);
      break;
    case 'app-error':
      console.error(`App error: ${message.error}`);
      break;
  }
};
```

**Message Types:**

| Type | Description |
|------|-------------|
| `reload` | App needs reload |
| `app-registered` | New app registered |
| `app-unregistered` | App removed |
| `app-error` | App build/error |

## Server Implementation

Located in `packages/core/src/server/`:

```
Server/
├── index.ts              # Bun.serve() entry point
├── types.ts              # Server-specific types
├── workspace.ts          # Workspace utilities
└── routes/
    ├── fs.ts             # File system REST API
    ├── fsWatcher.ts      # File watcher for HMR
    ├── pty.ts            # PTY WebSocket handler
    ├── hmr.ts            # HMR WebSocket handler
    └── codeServer.ts     # code-server management
```

## Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `PORT` | `5173` | Server port |
| `IN_DOCKER` | `true` | Docker mode flag |
| `WORKSPACE_PATH` | `/app/workspace` | User files directory |
| `APPS_PATH` | `/app/apps` | Custom apps source |
| `APPS_DIST` | `/app/dist-apps` | Compiled apps output |
| `NODE_ENV` | - | `development` or `production` |

## Runtime Detection

The frontend detects Docker mode via `window.__FDE_IN_DOCKER__`:

```typescript
// packages/core/src/utils/getRuntime.ts
export function getRuntime(): 'browser' | 'docker' | 'electron' {
  if (typeof window === 'undefined') return 'browser';
  if ((window as any).__FDE_IN_DOCKER__ === true) return 'docker';
  if (/Electron/i.test(navigator.userAgent)) return 'electron';
  return 'browser';
}
```

The server injects this flag via nginx in production, or via Vite in development.

## Related Documentation

- [docker/README.md](./docker/README.md) - Docker quick start guide
- [docker/architecture.md](./docker/architecture.md) - Docker architecture details
- [custom-apps.md](./custom-apps.md) - Custom apps development