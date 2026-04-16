# NPM Package Integration Guide

This guide explains how to use `@fde-desktop/fde-core` to build your own desktop environment application.

## Installation

```bash
npm install @fde-desktop/fde-core react react-dom
```

## Quick Start

### 1. Install Dependencies

```bash
npm install @fde-desktop/fde-core react react-dom zustand @mantine/core @mantine/hooks framer-motion
```

### 2. Import Styles

```tsx
import '@mantine/core/styles.css';
import '@mantine/dates/styles.css';
// Styles are bundled in the package
```

### 3. Basic Usage with FdeDesktop

The simplest way to use the library is with the `FdeDesktop` component:

```tsx
import { FdeDesktop, type AppRegistryEntry } from '@fde-desktop/fde-core';
import '@mantine/core/styles.css';
import '@mantine/dates/styles.css';

// Define your custom apps (optional)
const myApps: Record<string, AppRegistryEntry> = {
  'my-app': {
    loader: () => import('./MyApp'),
    appName: 'My App',
  },
};

function App() {
  return <FdeDesktop customApps={myApps}>{/* Optional: custom desktop content */}</FdeDesktop>;
}

export default App;
```

Core apps (Files, Settings, Notepad, Image Viewer, PDF Viewer, Uploader, etc.) are loaded automatically. Your custom apps are merged with the core registry.

### Initialization Order

When you use `FdeDesktop`, it handles initialization automatically:

1. **Mount**: `FdeDesktop` mounts
2. **Core Apps**: Core app components are available immediately
3. **User Apps**: `registerComponents(customApps)` merges your apps
4. **Render**: Desktop renders with merged app registry

## Core Apps vs Custom Apps

**Core Apps** come bundled with the library and are loaded automatically:

| App ID         | Name         | Description            |
| -------------- | ------------ | ---------------------- |
| `files`        | Files        | File browser           |
| `settings`     | Settings     | System settings        |
| `notepad`      | Notepad      | Text editor (Tiptap)   |
| `image-viewer` | Image Viewer | Image viewer           |
| `pdf`          | PDF Viewer   | PDF viewer             |
| `uploader`     | Uploader     | File uploader          |
| `device-info`  | Device Info  | System information     |
| `calendar`     | Calendar     | Calendar widget        |
| `menuedit`     | MenuEdit     | Launcher folder editor |
| `terminal`     | Terminal     | Terminal emulator      |
| `code-server`  | VS Code      | VS Code in browser     |

**Custom Apps** are apps you define and pass to `FdeDesktop`:

```tsx
import type { AppRegistryEntry, WindowContentProps } from '@fde-desktop/fde-core';

const MyCustomApp: FC<WindowContentProps> = ({ window, notifyReady }) => {
  return <div>My App Content</div>;
};

const MyCustomMenuBar: MenuBarComponent = ({ windowId }) => {
  return <div>My Menu Bar</div>;
};

const userApps: Record<string, AppRegistryEntry> = {
  'my-app': {
    loader: () => import('./MyApp'),
    appName: 'My App',
    isLazy: false, // optional, defaults to false
  },
};
```

## Core Concepts

### App Registry

Apps are managed through a registry system:

```typescript
import { getAppComponent, getMenuBarComponent, isLazyApp, getAppName } from '@fde-desktop/fde-core';

// Get app component by ID
const AppComponent = getAppComponent('files');

// Check if app is lazy-loaded
const lazy = isLazyApp('notepad');

// Get display name
const name = getAppName('files'); // 'Files'
```

### Stores (Zustand)

Access desktop state via stores:

```typescript
import { useDesktopStore, useSettingsStore, useCustomAppStore } from '@fde-desktop/fde-core';

// Desktop state
const { windows, openWindow, closeWindow, icons, fsNodes } = useDesktopStore();

// Settings
const { wallpaper, theme, language, setThemeMode } = useSettingsStore();

// Custom apps (Docker)
const { customApps, loadCustomApps } = useCustomAppStore();
```

### Runtime Detection

Detect the current runtime environment:

```typescript
import { getRuntime, isDocker, isBrowser, isElectron, isDev } from '@fde-desktop/fde-core';

if (isDocker()) {
  // Docker-specific logic
  // API calls available
}

if (isBrowser()) {
  // Browser-only logic
  // IndexedDB storage
}

if (isElectron()) {
  // Electron-specific
}
```

### File System

The package provides file system adapters:

```typescript
import { IndexedDBFileSystem, DockerFileSystemAdapter } from '@fde-desktop/fde-core';

// IndexedDB (browser-only)
const fs = new IndexedDBFileSystem();
await fs.initialize();

// Docker (API-based)
const dockerFs = new DockerFileSystemAdapter();
```

### Creating a Custom App (Step by Step)

#### Step 1: Create the component

Every app receives `WindowContentProps` — a `window` entity and a `notifyReady` callback:

```tsx
// MyApp.tsx
import { type FC, useEffect } from 'react';
import type { WindowContentProps } from '@fde-desktop/fde-core';

const MyApp: FC<WindowContentProps> = ({ window: win, notifyReady }) => {
  // Read data passed when opening the app
  const { filePath } = (win?.contentData ?? {}) as { filePath?: string };

  useEffect(() => {
    // Call notifyReady to signal the window the app is ready.
    // You can also pass data back (e.g. actions for the menu bar).
    notifyReady?.({});
  }, [win, notifyReady]);

  return (
    <div>
      <h1>My App</h1>
      {filePath && <p>Opening: {filePath}</p>}
    </div>
  );
};

export default MyApp;
```

#### Step 2: Register the app

Pass it to `FdeDesktop` via `customApps`:

```tsx
// App.tsx
import { FdeDesktop, type AppRegistryEntry } from '@fde-desktop/fde-core';

const myApps: Record<string, AppRegistryEntry> = {
  'my-app': {
    loader: () => import('./MyApp'),  // React.lazy under the hood
    appName: 'My App',
    isLazy: true,
    // Window size and icon (optional):
    defaultWidth: 800,
    defaultHeight: 600,
    minWidth: 640,
    minHeight: 480,
    fcIcon: 'FcFolder',   // react-icons/fc name
  },
};

function App() {
  return <FdeDesktop customApps={myApps} />;
}
```

#### Step 3: Open the app

```tsx
import { useOpenApp } from '@fde-desktop/fde-core';

function MyButton() {
  const openApp = useOpenApp();

  return (
    <button onClick={() => openApp('my-app', { contentData: { filePath: '/docs/readme.md' } })}>
      Open My App
    </button>
  );
}
```

#### Step 4: Add a menu bar (optional)

Menu bars are React components rendered above the window content:

```tsx
// MyAppMenuBar.tsx
import { type FC, memo } from 'react';
import { AppMenuBar, useDesktopStore } from '@fde-desktop/fde-core';
import type { MenuBarComponentProps, AppMenuElement } from '@fde-desktop/fde-core';

export const MyAppMenuBar: FC<MenuBarComponentProps> = memo(({ windowId, onExit }) => {
  const elements: AppMenuElement[] = [
    {
      type: 'menu',
      label: 'File',
      items: [
        { type: 'item', label: 'Exit', icon: 'FcLeave', onClick: onExit },
      ],
    },
  ];

  return <AppMenuBar elements={elements} />;
});
MyAppMenuBar.displayName = 'MyAppMenuBar';
```

Register it alongside the component:

```tsx
const myApps: Record<string, AppRegistryEntry> = {
  'my-app': {
    loader: () => import('./MyApp'),
    menuBarLoader: () => import('./MyAppMenuBar').then(m => ({ default: m.MyAppMenuBar })),
    appName: 'My App',
    isLazy: true,
  },
};
```

For reactive menu bars (sliders, switches, zoom controls), see [how-to-create-an-app.md](./how-to-create-an-app.md#pattern-1-menubarcomponent-recommended).

### Types

All types are exported:

```typescript
import type {
  AppRegistryEntry,
  AppComponent,
  WindowEntity,
  WindowInput,
  FileNode,
  FolderNode,
  IFileSystem,
} from '@fde-desktop/fde-core';
```

## UI Components

The package exports ready-to-use components:

```typescript
import {
  FdeDesktop,
  Desktop,
  DesktopIcon,
  Window,
  Taskbar,
  Launcher,
  ContextMenu,
  CreateItemContextMenu,
  AppMenuBar,
  ThemeProvider,
} from '@fde-desktop/fde-core';
```

### FdeDesktop

The main wrapper component that handles initialization:

```tsx
import { FdeDesktop } from '@fde-desktop/fde-core';

function App() {
  return (
    <FdeDesktop
      customApps={userApps} // Optional: custom apps
      defaultWallpaper={wallpaperUrl} // Optional: default wallpaper
      initialApp="welcome" // Optional: app to open on start
      prefetchLoaders={[
        // Optional: preload lazy apps
        { id: 'dos-emulator', loader: () => import('./DosEmulatorApp') },
      ]}
    >
      {/* Optional: custom desktop content */}
    </FdeDesktop>
  );
}
```

### Desktop & DesktopIcon

```tsx
import { Desktop, DesktopIcon, useDesktopStore } from '@fde-desktop/fde-core';

function MyDesktop() {
  const icons = useDesktopStore(s => s.icons);
  const openApp = useOpenApp();

  return (
    <Desktop>
      {icons.map(icon => (
        <DesktopIcon key={icon.id} icon={icon} onDoubleClick={() => openApp(icon.appId)} />
      ))}
    </Desktop>
  );
}
```

### Window

```tsx
import { Window, useDesktopStore } from '@fde-desktop/fde-core';
import type { WindowEntity } from '@fde-desktop/fde-core';

function WindowManager() {
  const windows = useDesktopStore(s => s.windows);

  return (
    <>
      {windows.map(win => (
        <Window key={win.id} window={win}>
          {/* App content is rendered by registry lookup */}
        </Window>
      ))}
    </>
  );
}
```

### Taskbar & Launcher

```tsx
import { Taskbar, Launcher } from '@fde-desktop/fde-core';

function MyUI() {
  return (
    <>
      <Desktop>{/* windows and icons */}</Desktop>
      <Taskbar />
      <Launcher />
    </>
  );
}
```

## Hooks

Available hooks:

```typescript
import {
  useOpenApp, // Open an app by ID
  useNotifications, // Show notifications
  useSystemTheme, // Get system theme
  useClock, // Timer/clock
  useContextMenu, // Context menu management
  useDeviceDetection, // Device info
  useDownload, // File download
  useCustomAppHMR, // Custom app lifecycle
  useIsDirty, // Dirty state tracking
  useCloseInterceptor, // Window close interception
  useResolvedUrl, // Resolve idb:// URLs
} from '@fde-desktop/fde-core';
```

## Domain Entities

Use entity factories:

```typescript
import { createWindow, createDesktopIcon, createLauncherFolder } from '@fde-desktop/fde-core';

const window = createWindow({
  title: 'My Window',
  appId: 'my-app',
  x: 100,
  y: 100,
  width: 800,
  height: 600,
});

const icon = createDesktopIcon({
  appId: 'myapp',
  x: 50,
  y: 50,
  name: 'My App',
});
```

## Constants

Predefined constants:

```typescript
import {
  DEFAULT_WINDOW_DIMENSIONS,
  DEFAULT_FDE_THEME,
  ICON_COLUMN_WIDTH,
  ICON_ROW_HEIGHT,
  TASKBAR_HEIGHT,
  DEFAULT_VIEWPORT_WIDTH,
  DEFAULT_VIEWPORT_HEIGHT,
  ANIMATION_DURATION,
} from '@fde-desktop/fde-core';
```

## i18n

The package includes i18n setup:

```typescript
import { i18n } from '@fde-desktop/fde-core';

// Use with react-i18next
import { useTranslation } from 'react-i18next';

function MyComponent() {
  const { t } = useTranslation();
  return <span>{t('key')}</span>;
}
```

## Utilities

Helper functions:

```typescript
import {
  uuid, // Generate UUID
  formatBytes, // Format bytes to human-readable
  getMimeTypeFromExtension,
  getFileExtension,
  sortNodes, // Sort file nodes
  buildBreadcrumbs, // Build breadcrumb path
  isNewerVersion, // Compare version strings
  clearBrowserData, // Clear browser storage
  waitForContainer, // Poll for DOM element by ID
  getBaseUrl,
  resolveUrl, // Base URL for API calls
  hashBlob, // SHA-256 hash a Blob
  getFourRandomColors, // Generate 4 random hex colors
} from '@fde-desktop/fde-core';
```

## Docker Integration

For Docker-based deployments:

```typescript
import { DockerFileSystemAdapter, FdeApiAdapter, initializeFdeApi } from '@fde-desktop/fde-core';

// Initialize FDE API
initializeFdeApi();

// File system
const dockerFs = new DockerFileSystemAdapter();

// Custom app lifecycle
useCustomAppHMR();
```

## Example App

The `src/` directory in the main repository contains a complete example showing:

- How to use `FdeDesktop` with custom apps
- Custom app registration via `AppRegistry`
- Welcome app (personal portfolio)
- External link apps (LinkedIn, GitHub)
- DOS emulator app

See the [main repository](https://github.com/frannunpal/fde-desktop) for source code.

## License

MIT
