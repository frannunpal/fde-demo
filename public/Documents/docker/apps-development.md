# Developing Apps in Docker

Guide for creating and developing React apps in fde-desktop.

## Overview

Apps in fde-desktop are standalone React applications that run inside windows. Each app is compiled independently with its own dependencies.

### Two Development Modes

| Mode            | Description                                                          |
| --------------- | -------------------------------------------------------------------- |
| **Development** | Apps in `apps/` are rebuilt automatically when files change          |
| **Production**  | Users can create apps in `workspace/` and they rebuild automatically |

## Creating a New App

### Using the Template

```bash
# Create from template
./docker/create-app.sh my-app "My App"
```

### Template Structure

```
apps/my-app/
├── manifest.json         # App metadata
├── package.json          # Dependencies (React + TypeScript)
├── vite.config.ts        # Build configuration (with CSS injection)
└── src/
    ├── main.tsx          # Entry point with lifecycle setup
    ├── App.tsx           # Main component
    └── index.css         # Global styles
```

## App Lifecycle

Apps must properly manage their lifecycle to work correctly with the framework:

### 1. Wait for Container

Your app must wait for the container element before mounting:

```typescript
const APP_ID = __APP_ID__;
const CONTAINER_ID = `app-container-${APP_ID}`;

function waitForContainer(): Promise<HTMLElement> {
  return new Promise((resolve, reject) => {
    const startTime = Date.now();
    const READY_TIMEOUT = 10000;

    const check = () => {
      const container = document.getElementById(CONTAINER_ID);
      if (container) {
        resolve(container);
        return;
      }
      if (Date.now() - startTime >= READY_TIMEOUT) {
        reject(new Error(`Container not found after ${READY_TIMEOUT}ms`));
        return;
      }
      setTimeout(check, 100);
    };
    check();
  });
}
```

### 2. Notify Ready

After mounting, notify the framework so it can show your app:

```typescript
const root = ReactDOM.createRoot(container);
root.render(<App />);

// This tells the framework your app is ready
window.__FDE_API__?.registerAppInstance?.(APP_ID, root);
```

### Complete Entry Point

```typescript
// apps/my-app/src/main.tsx
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';

declare const __APP_ID__: string;
const APP_ID = __APP_ID__;
const CONTAINER_ID = `app-container-${APP_ID}`;
const READY_TIMEOUT = 10000;

function waitForContainer(): Promise<HTMLElement> {
  return new Promise((resolve, reject) => {
    const startTime = Date.now();

    const check = () => {
      const container = document.getElementById(CONTAINER_ID);
      if (container) {
        resolve(container);
        return;
      }
      if (Date.now() - startTime >= READY_TIMEOUT) {
        reject(new Error(`Container not found after ${READY_TIMEOUT}ms`));
        return;
      }
      setTimeout(check, 100);
    };
    check();
  });
}

async function init() {
  try {
    const container = await waitForContainer();
    const fde = (window as any).__FDE_API__;

    const root = ReactDOM.createRoot(container);
    root.render(<App />);

    fde?.registerAppInstance?.(APP_ID, root);
    console.log(`[${APP_ID}] App initialized`);
  } catch (err) {
    console.error(`[${APP_ID}] Failed to initialize:`, err);
  }
}

init();
```

## Manifest Configuration

```json
{
  "id": "my-app",
  "name": "My App",
  "version": "1.0.0",
  "description": "A standalone app for fde-desktop",
  "icon": "📦",
  "author": "Your Name",
  "window": {
    "defaultWidth": 800,
    "defaultHeight": 600,
    "minWidth": 400,
    "minHeight": 300,
    "canMaximize": true,
    "alwaysOnTop": false
  }
}
```

| Field                  | Type    | Default  | Description        |
| ---------------------- | ------- | -------- | ------------------ |
| `id`                   | string  | required | Unique identifier  |
| `name`                 | string  | required | Display name       |
| `version`              | string  | "1.0.0"  | Semantic version   |
| `icon`                 | string  | "📦"     | Emoji icon         |
| `iconUrl`              | string  | -        | Path to icon image |
| `window.defaultWidth`  | number  | 800      | Initial width      |
| `window.defaultHeight` | number  | 600      | Initial height     |
| `window.canMaximize`   | boolean | true     | Allow maximize     |

## Framework API

The framework exposes `window.__FDE_API__` at runtime:

```typescript
interface FdeAPI {
  // Window management
  openApp: (appId: string, options?: { contentData?: unknown }) => void;
  closeWindow: (windowId?: string) => void;
  minimizeWindow: (windowId?: string) => void;
  maximizeWindow: (windowId?: string) => void;
  restoreWindow: (windowId?: string) => void;
  focusWindow: (windowId?: string) => void;

  // Notifications
  showNotification: (options: {
    title: string;
    message: string;
    type?: 'info' | 'success' | 'error' | 'warning';
    fcIcon?: string;
  }) => string;
  hideNotification: (notificationId: string) => void;

  // Events
  on: (event: string, callback: (data: unknown) => void) => () => void;
  off: (event: string, callback: (data: unknown) => void) => void;

  // App lifecycle
  appReady: (appId: string) => void;
  registerAppInstance: (appId: string, instance: unknown) => void;
}
```

### Usage in Apps

```typescript
const fde = window.__FDE_API__;

// Open another app
fde?.openApp('files');

// Show notification
fde?.showNotification({
  title: 'My App',
  message: 'Operation completed',
  type: 'success',
});

// Close current window
fde?.closeWindow();
```

## CSS Configuration

Apps must bundle CSS inside JavaScript. This is handled automatically by `vite-plugin-css-injected-by-js`.

### Setup

1. Install the plugin:

```bash
cd apps/my-app
bun add -D vite-plugin-css-injected-by-js
```

2. Add to your `vite.config.ts`:

```typescript
import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';
import cssInjectedByJsPlugin from 'vite-plugin-css-injected-by-js';

export default defineConfig({
  plugins: [
    // @ts-expect-error - Vite version compatibility
    cssInjectedByJsPlugin(),
    react(),
  ],
  build: {
    outDir: '../../dist-apps/my-app',
    emptyOutDir: true,
    rollupOptions: {
      input: 'src/main.tsx',
      output: {
        entryFileNames: 'index.js',
      },
    },
  },
});
```

### How It Works

Without the plugin, Vite generates separate CSS files that won't load:

```
dist-apps/my-app/
├── index.js     (JavaScript)
├── style.css    (CSS - won't load automatically)
└── manifest.json
```

With the plugin, CSS is inlined in JavaScript:

```
dist-apps/my-app/
├── index.js     (JavaScript + CSS inline)
└── manifest.json
```

## Hot Module Replacement (HMR)

When running in Docker with `--watch`, apps are automatically rebuilt when files change.

### How It Works

1. `apps-builder.ts` monitors `apps/` for file changes
2. When changes are detected, Vite rebuilds the app
3. WebSocket notification is sent to all connected clients
4. Framework unmounts previous instance and loads the new one

### HMR Limitations

- Only works in Docker mode (`window.__FDE_IN_DOCKER__ === true`)
- Apps must implement `registerAppInstance` for clean unmounting
- CSS changes require full reload (not hot-replaced)

## TypeScript Types

Include framework API types in your app:

```typescript
// src/types/fde-api.d.ts
declare global {
  interface Window {
    __FDE_API__?: {
      openApp: (appId: string, options?: { contentData?: unknown }) => void;
      closeWindow: (windowId?: string) => void;
      minimizeWindow: (windowId?: string) => void;
      maximizeWindow: (windowId?: string) => void;
      restoreWindow: (windowId?: string) => void;
      focusWindow: (windowId?: string) => void;
      showNotification: (options: {
        title: string;
        message: string;
        type?: 'info' | 'success' | 'error';
        fcIcon?: string;
      }) => string;
      hideNotification: (notificationId: string) => void;
      getWindows: () => unknown[];
      getActiveWindow: () => unknown | null;
      on: (event: string, callback: (data: unknown) => void) => () => void;
      off: (event: string, callback: (data: unknown) => void) => void;
      appReady: (appId: string) => void;
      registerAppInstance: (appId: string, instance: unknown) => void;
    };
  }
}

export {};
```

## Developing Apps in Production

When running in production mode:

1. Apps are stored in `./apps/` directory
2. Changes are detected automatically by the watcher
3. Apps are rebuilt when files change

### Workflow

```bash
# 1. Start production
docker compose up -d

# 2. Create new app
./docker/create-app.sh my-app "My App"

# 3. Check app in browser
# Open: http://localhost
# Look for "My App" in the launcher
```

### File Watcher

The apps watcher monitors `./apps/` for changes:

```bash
# Check watcher status
docker compose exec prod supervisorctl status watcher

# View watcher logs
docker compose exec prod cat /var/log/supervisor/watcher.out.log

# Manually rebuild all apps
docker compose exec prod bun run /app/docker/apps-builder.ts --clean
```

## Building Apps

### Manual Build

```bash
# Build all apps
bun run apps:build

# Watch for changes
bun run apps:watch

# Clean and rebuild
bun run apps:build --clean
```

### Build Output

Apps are compiled to `dist-apps/`:

```
dist-apps/
├── apps-manifest.json    # Registry of all apps
├── my-app/
│   ├── index.js          # Entry point (with CSS inline)
│   └── manifest.json     # Metadata
└── another-app/
    └── ...
```

## Troubleshooting

### App Not Appearing

```bash
# Check manifest
cat apps/my-app/manifest.json

# Check build output
ls -la dist-apps/my-app/

# Rebuild apps
bun run apps:build --clean
```

### App Shows "Loading" Forever

This usually means `registerAppInstance` wasn't called:

```typescript
// Make sure to call this after mounting
window.__FDE_API__?.registerAppInstance?.(APP_ID, root);
```

### Container Not Found

```typescript
// Make sure you wait for the container
function waitForContainer(): Promise<HTMLElement> {
  return new Promise((resolve, reject) => {
    const startTime = Date.now();
    const check = () => {
      const container = document.getElementById(CONTAINER_ID);
      if (container) {
        resolve(container);
        return;
      }
      if (Date.now() - startTime >= 10000) {
        reject(new Error('Container not found'));
        return;
      }
      setTimeout(check, 100);
    };
    check();
  });
}
```

### Styles Not Loading

Make sure `vite-plugin-css-injected-by-js` is installed and configured:

```bash
bun add -D vite-plugin-css-injected-by-js
```

### HMR Not Working

1. Ensure you're running in Docker mode
2. Check that `registerAppInstance` is called after mounting
3. Verify previous instances are properly unmounted

## Next Steps

- [Custom apps documentation](../custom-apps.md)
- [Troubleshooting](./troubleshooting.md)
