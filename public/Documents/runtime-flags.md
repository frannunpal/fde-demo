# Runtime Flags

FDE Desktop uses runtime flags to detect the execution environment and adapt its behavior accordingly.

## Available Flags

| Flag                       | Type      | Description                                                                                                                                 |
| -------------------------- | --------- | ------------------------------------------------------------------------------------------------------------------------------------------- |
| `window.__FDE_IN_DOCKER__` | `boolean` | `true` when running in Docker, `false` in local browser/Electron                                                                            |
| `window.__IS_DEV__`        | `boolean` | `true` in development mode (Docker dev), `false` in production. For local development (`bun run dev`), detected via hostname (`localhost`). |

## Helper Functions

All exported from `src/Shared/Utils/getRuntime.ts`:

| Function       | Return    | Description                                                        |
| -------------- | --------- | ------------------------------------------------------------------ |
| `getRuntime()` | `Runtime` | Returns `'docker'`, `'browser'`, or `'electron'`                   |
| `isDocker()`   | `boolean` | `true` when running inside Docker                                  |
| `isBrowser()`  | `boolean` | `true` in standard web browser (not Docker, not Electron)          |
| `isElectron()` | `boolean` | `true` when running inside Electron                                |
| `isDev()`      | `boolean` | `true` in Docker dev mode or localhost — uses hostname as fallback |

## Environment Detection

| Environment                         | `__FDE_IN_DOCKER__` | `__IS_DEV__`                        |
| ----------------------------------- | ------------------- | ----------------------------------- |
| `bun run dev` (local)               | `false`             | Detected via hostname (`localhost`) |
| Docker dev (`NODE_ENV=development`) | `true`              | `true` (injected)                   |
| Docker prod (`NODE_ENV=production`) | `true`              | `false`                             |

## Usage in Code

### TypeScript/React

```typescript
import { getRuntime, isDocker, isBrowser, isElectron, isDev } from '@shared/Utils/getRuntime';

// getRuntime() — returns 'docker' | 'browser' | 'electron'
const runtime = getRuntime();

// isDocker() — true when running inside a Docker container
if (isDocker()) {
  // Use DockerFileSystemAdapter (API calls)
} else {
  // Use IndexedDBFileSystem (local storage)
}

// isBrowser() — true in standard web browser (not Docker, not Electron)
if (isBrowser()) {
  // IndexedDB-only features
}

// isElectron() — true when running inside Electron
if (isElectron()) {
  // Native OS integrations
}

// isDev() — true in Docker dev mode or local dev server (localhost)
if (isDev()) {
  // Verbose logging, debug features
}
```

### Service Worker

In the Service Worker there's no access to `window`, so detection is done via hostname:

```javascript
const isDev = () => {
  return self.location.hostname === 'localhost' || self.location.hostname === '127.0.0.1';
};

if (isDev()) {
  console.log('[SW] Development mode - logging enabled');
}
```

## Flag Injection

### `index.html` (default values)

```html
<script>
  window.__FDE_IN_DOCKER__ = false;
  window.__IS_DEV__ = false;
</script>
```

### Docker `entrypoint.sh`

```bash
# Inject __FDE_IN_DOCKER__ (always in Docker)
sed -i 's/window.__FDE_IN_DOCKER__ = false;/window.__FDE_IN_DOCKER__ = true;/' "$INDEX_HTML"

# Inject __IS_DEV__ only in development mode
if [ "$NODE_ENV" = "development" ]; then
  sed -i 's/window.__IS_DEV__ = false;/window.__IS_DEV__ = true;/' "$INDEX_HTML"
fi
```

## Related Environment Variables

| Variable         | Environment | Description                   |
| ---------------- | ----------- | ----------------------------- |
| `NODE_ENV`       | Docker      | `development` or `production` |
| `IN_DOCKER`      | Docker      | `true` (used internally)      |
| `WORKSPACE_PATH` | Docker      | Path to user directory        |

## Service Worker and Cache

The Service Worker (`sw.js`) detects development mode to behave differently:

- **In development**: Logs enabled, API requests are not cached
- **In production**: Logs disabled, only static assets are cached

```javascript
// API requests are never cached (must always be fresh)
if (url.pathname.startsWith('/api/')) {
  event.respondWith(fetch(event.request));
  return;
}
```

## Browser Verification

```javascript
// In the browser console
console.log('In Docker:', window.__FDE_IN_DOCKER__);
console.log('Is Dev:', window.__IS_DEV__);
console.log('Runtime:', window.__FDE_API__?.fs ? 'Docker/API' : 'IndexedDB');
```

## References

- [Runtime Detection](./architecture.md#runtime-detection) - Adapter architecture
- [Docker Development](./docker/development.md) - Development workflow
- [Docker Production](./docker/production.md) - Production deployment
