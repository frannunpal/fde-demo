# Custom Apps

## Overview

Custom apps are standalone React applications that run inside fde-desktop windows. Each app is compiled independently with its own dependencies and communicates with the framework through the `window.__FDE_API__` interface.

Custom apps are loaded at runtime from the `apps/` directory and can be added or modified without rebuilding the entire framework.

## Architecture

```
┌─────────────────────────────────────────────────────────────────────────┐
│                    fde-desktop (Framework)                             │
│  ┌───────────────────────────────────────────────────────────────────┐  │
│  │  React 19 + Mantine + Zustand                                     │  │
│  │  ┌─────────────┐  ┌─────────────┐  ┌──────────────────────┐     │  │
│  │  │   Stores    │  │   Hooks     │  │  window.__FDE_API__  │     │  │
│  │  │ desktopStore│  │ useOpenApp  │  │  (Public API)        │     │  │
│  │  │customAppStore│  │ useTheme    │  │                      │     │  │
│  │  └─────────────┘  └─────────────┘  └──────────────────────┘     │  │
│  └───────────────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────────────┘
                                     │
                                     │ window.__FDE_API__
                                     ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                    Independent App (DOM Container)                      │
│  ┌───────────────────────────────────────────────────────────────────┐  │
│  │  <div id="app-container-{appId}">                                │  │
│  │  ┌───────────────────────────────────────────────────────────┐    │  │
│  │  │  React 18                                                  │    │  │
│  │  │    ↑                                                       │    │  │
│  │  │    │ Own renderer                                          │    │  │
│  │  │    │ Own dependencies                                      │    │  │
│  │  │    │ Access to __FDE_API__ via window                      │    │  │
│  │  └───────────────────────────────────────────────────────────┘    │  │
│  └───────────────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────────────┘
```

## App Structure

Each app must have this structure:

```
apps/
├── my-app/
│   ├── manifest.json       # Required: App metadata
│   ├── package.json        # Required: Dependencies
│   ├── vite.config.ts      # Optional: Build config (auto-generated if missing)
│   ├── tsconfig.json       # Optional: TypeScript config
│   └── src/
│       ├── main.tsx        # Required: Entry point
│       └── App.tsx         # Main component
```

## manifest.json

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

### Fields

| Field         | Type   | Required | Description                               |
| ------------- | ------ | -------- | ----------------------------------------- |
| `id`          | string | Yes      | Unique identifier for the app             |
| `name`        | string | Yes      | Display name shown in window title        |
| `version`     | string | No       | Semantic version (default: "1.0.0")       |
| `description` | string | No       | Brief description                         |
| `icon`        | string | No       | Emoji icon (default: "📦")                |
| `iconUrl`     | string | No       | Path to icon image relative to app folder |
| `author`      | string | No       | Author name                               |
| `window`      | object | No       | Window configuration                      |

### Window Configuration

| Field           | Type            | Default | Description                         |
| --------------- | --------------- | ------- | ----------------------------------- |
| `defaultWidth`  | number          | 800     | Initial window width                |
| `defaultHeight` | number          | 600     | Initial window height               |
| `minWidth`      | number \| false | 400     | Minimum width (false = no minimum)  |
| `minHeight`     | number \| false | 300     | Minimum height (false = no minimum) |
| `canMaximize`   | boolean         | true    | Allow maximize button               |
| `alwaysOnTop`   | boolean         | false   | Keep window always on top           |

## Framework API

The framework exposes a global API that apps can use:

```typescript
interface FranDesktopAPI {
  // Window management
  openApp(appId: string, options?: OpenAppOptions): void;
  closeWindow(windowId?: string): void;
  minimizeWindow(windowId?: string): void;
  maximizeWindow(windowId?: string): void;
  restoreWindow(windowId?: string): void;
  focusWindow(windowId?: string): void;

  // File system
  openFile(path: string, appId?: string): void;
  openFileDialog(options?: FileDialogOptions): Promise<string | null>;
  saveFile(content: string, options?: SaveDialogOptions): Promise<boolean>;
  saveFileDialog(options?: SaveDialogOptions): Promise<string | null>;

  // Theme
  getTheme(): Record<string, unknown>;
  setTheme(theme: Record<string, unknown>): void;

  // Notifications
  showNotification(options: NotificationOptions): string;
  hideNotification(notificationId: string): void;

  // State
  getWindows(): WindowEntity[];
  getActiveWindow(): WindowEntity | null;
  getWindowById(windowId: string): WindowEntity | null;

  // Events
  on<T extends FranEventType>(event: T, callback: (data: FranEventPayloads[T]) => void): () => void;
  off<T extends FranEventType>(event: T, callback: (data: FranEventPayloads[T]) => void): void;

  // Dynamic app lifecycle
  appReady(appId: string): void;
  registerAppInstance(appId: string, instance: unknown): void;
}
```

### Usage in Apps

```typescript
// Get API reference
const fde = window.__FDE_API__;

if (fde) {
  // Open another app
  fde.openApp('files');

  // Show notification
  fde.showNotification({
    title: 'My App',
    message: 'Operation completed!',
    type: 'success',
  });

  // Close current window
  fde.closeWindow();

  // Get all open windows
  const windows = fde.getWindows();
}
```

## App Lifecycle

Custom apps must notify the framework when they're ready. This ensures proper loading state management and prevents the app from being displayed before initialization is complete.

### Ready Notification

When your app is mounted and ready to display, call:

```typescript
window.__FDE_API__?.registerAppInstance?.('my-app', appInstance);
```

### App ID — Critical Rule

**The `APP_ID` must match the folder name of your app exactly.** The framework creates a container with `id="app-container-{appId}"` — if your app uses a different ID, it will fail to mount.

**Do NOT hardcode the app ID.** Use the `__APP_ID__` constant injected at build time by the builder:

```typescript
// ✅ Correct — ID is injected at build time
declare const __APP_ID__: string;
const APP_ID = __APP_ID__;

// ❌ Wrong — if you copy the app, this will be wrong
const APP_ID = 'my-app';
```

The `__APP_ID__` global is replaced by Vite's `define` config with the folder name (`process.env.VITE_APP_ID`) during the build. Your `vite.config.ts` must include:

```typescript
define: {
  '__APP_ID__': JSON.stringify(process.env.VITE_APP_ID || 'my-app'),
},
```

If your app uses the auto-generated vite config (no `vite.config.ts`), this is already handled automatically.

### Container Waiting Pattern

Your app must wait for the container element before mounting. The container ID follows the pattern `app-container-{appId}`:

```typescript
declare const __APP_ID__: string;
const APP_ID = __APP_ID__;

function waitForContainer(): Promise<HTMLElement> {
  return new Promise((resolve, reject) => {
    const startTime = Date.now();
    const CONTAINER_ID = `app-container-${APP_ID}`;
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

### Complete React Example

```typescript
// apps/my-app/src/main.tsx
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';

declare const __APP_ID__: string;
const APP_ID = __APP_ID__;

function waitForContainer(): Promise<HTMLElement> {
  return new Promise((resolve, reject) => {
    const startTime = Date.now();
    const CONTAINER_ID = `app-container-${APP_ID}`;
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

async function init() {
  try {
    const container = await waitForContainer();
    const fde = (window as any).__FDE_API__;

    const root = ReactDOM.createRoot(container);
    root.render(<App />);

    fde?.registerAppInstance?.(APP_ID, root);
    console.log(`[${APP_ID}] React app initialized`);
  } catch (err) {
    console.error(`[${APP_ID}] Failed to initialize:`, err);
  }
}

init();
```

### Ready Timeout

If `registerAppInstance` is not called within 10 seconds, the framework will:

1. Log a warning to the console
2. Show a notification to the user
3. If the app instance was registered (the app mounted but didn't call `registerAppInstance`), display the app anyway
4. If no instance is mounted, show an error screen with a descriptive message instead of a blank window

## CSS Configuration

Custom apps must bundle CSS inside JavaScript to ensure styles load correctly. The `vite-plugin-css-injected-by-js` plugin handles this automatically.

### For Apps with Custom Vite Config

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

### For Apps Without Vite Config

The `docker/apps-builder.ts` automatically generates a React config with the CSS plugin included. No additional setup required.

### How It Works

Without the plugin, Vite generates separate CSS files:

```
dist-apps/my-app/
├── index.js     (JavaScript)
├── style.css    (CSS - won't load automatically)
└── manifest.json
```

With the plugin, CSS is injected inline:

```
dist-apps/my-app/
├── index.js     (JavaScript + CSS inline)
└── manifest.json
```

This ensures the framework loads styles when loading the app.

## Hot Module Replacement (HMR)

When running in Docker with `--watch` mode, custom apps support hot reloading.

### How HMR Works

1. The `apps-builder.ts` monitors `apps/` for file changes
2. When a change is detected, Vite rebuilds the app
3. A WebSocket notification is sent to all connected clients
4. The framework unmounts the old instance and loads the new one

### HMR Requirements

- Only works in Docker mode (`window.__FDE_IN_DOCKER__ === true`)
- Apps must implement `registerAppInstance` for clean unmounting

## Creating a New App

### Using the Template Script

```bash
./docker/create-app.sh my-game "My Game"
```

This creates a new app in `apps/my-game/` with:

- `manifest.json` - Pre-configured metadata
- `package.json` - React + TypeScript dependencies
- `vite.config.ts` - Build configuration with CSS injection
- `src/main.tsx` - Entry point with lifecycle setup
- `src/App.tsx` - Example React component

### Manual Creation

1. Create the app folder:

```bash
mkdir -p apps/my-app/src
```

2. Create `manifest.json`:

```json
{
  "id": "my-app",
  "name": "My App",
  "version": "1.0.0",
  "icon": "📦",
  "window": {
    "defaultWidth": 800,
    "defaultHeight": 600
  }
}
```

3. Create `package.json`:

```json
{
  "name": "my-app",
  "version": "1.0.0",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "vite build"
  },
  "dependencies": {
    "react": "^18.0.0",
    "react-dom": "^18.0.0"
  },
  "devDependencies": {
    "@vitejs/plugin-react": "^4.0.0",
    "@types/react": "^18.0.0",
    "@types/react-dom": "^18.0.0",
    "vite": "^5.0.0",
    "typescript": "^5.3.0",
    "vite-plugin-css-injected-by-js": "^4.0.0"
  }
}
```

4. Create entry point (`src/main.tsx`):

```typescript
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

declare const __APP_ID__: string;
const APP_ID = __APP_ID__;

function waitForContainer(): Promise<HTMLElement> {
  return new Promise((resolve, reject) => {
    const startTime = Date.now();
    const CONTAINER_ID = `app-container-${APP_ID}`;

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

async function init() {
  const container = await waitForContainer();
  const root = ReactDOM.createRoot(container);
  root.render(<App />);
  window.__FDE_API__?.registerAppInstance?.(APP_ID, root);
}

init();
```

5. Install dependencies:

```bash
cd apps/my-app
bun install
```

## Copying an Existing App

When duplicating an app (e.g., using `example-app` as a template):

1. Copy the folder: `cp -r apps/example-app apps/my-app`
2. Update `manifest.json` — set a unique `id` (must match the folder name)
3. **Do not change `main.tsx`** — `__APP_ID__` is injected at build time automatically
4. The builder detects the new folder, installs deps (`bun install`), builds, and notifies the desktop

> **Note:** `node_modules` are not copied. The builder always runs `bun install` for apps with a `package.json` before building, so deps are always fresh.

## Building Apps

### Development

```bash
# Build all apps once
./docker/apps-builder.ts

# Build and watch for changes
./docker/apps-builder.ts --watch

# Clean build
./docker/apps-builder.ts --clean
```

### With Docker

```bash
# Development with hot reload
docker compose up dev

# Production build
docker compose up prod --build
```

## TypeScript Types

Include the framework API types in your app:

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

## Debugging

### Check app loading

```javascript
// Browser console
window.__FDE_API__?.getWindows();
```

### Check loaded apps manifest

```typescript
import { fetchAppManifest } from '@fde-desktop/fde-core';

const manifest = await fetchAppManifest();
console.log(manifest);
```

### Force reload apps cache

```typescript
import { clearManifestCache, fetchAppManifest } from '@fde-desktop/fde-core';

clearManifestCache();
await fetchAppManifest();
```

## More Information

- See [docs/docker/apps-development.md](./docker/apps-development.md) for complete Docker development workflow
- See [docs/how-to-create-an-app.md](./how-to-create-an-app.md) for creating built-in apps
