# Getting Started with @fde-desktop/fde-core

This guide walks you through building a desktop environment from scratch using `@fde-desktop/fde-core`.

## Prerequisites

- Node.js 18+ or Bun
- React 19
- TypeScript (recommended)
- Vite (recommended bundler)

## Quick Start

### 1. Create a new project

```bash
npm create vite@latest my-desktop -- --template react-ts
cd my-desktop
```

### 2. Install dependencies

```bash
npm install @fde-desktop/fde-core
npm install @mantine/core @mantine/hooks @mantine/dates
npm install framer-motion react-rnd react-i18next i18next
npm install zustand react-icons dayjs
```

### 3. Import styles

```tsx
// src/main.tsx
import React from 'react';
import ReactDOM from 'react-dom/client';
import '@mantine/core/styles.css';
import '@mantine/dates/styles.css';
import App from './App';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
```

### 4. Use FdeDesktop

The simplest way to get started is with the `FdeDesktop` component. Core apps (Files, Settings, Notepad, etc.) are included automatically:

```tsx
// src/App.tsx
import { FdeDesktop } from '@fde-desktop/fde-core';
import defaultWallpaper from './assets/wallpaper.jpg';

function App() {
  return <FdeDesktop defaultWallpaper={defaultWallpaper} />;
}

export default App;
```

That's it! You now have a working desktop environment with:

- Desktop icons (drag-and-drop supported)
- Window management (open, close, minimize, maximize)
- Taskbar with clock
- App launcher (start menu)
- Built-in apps: Files, Settings, Notepad, Image Viewer, PDF Viewer, Calendar, etc.

## Adding Custom Apps

To add your own apps, use the `customApps` prop:

```tsx
// src/App.tsx
import { FdeDesktop, type AppRegistryEntry } from '@fde-desktop/fde-core';
import type { WindowContentProps } from '@fde-desktop/fde-core';

// Your custom app component
const MyCustomApp: FC<WindowContentProps> = ({ window, notifyReady }) => {
  return (
    <div style={{ padding: 20 }}>
      <h1>My Custom App</h1>
      <p>This is a custom app in window {window?.id}</p>
    </div>
  );
};

// Register your apps
const userApps: Record<string, AppRegistryEntry> = {
  'my-app': {
    loader: () => import('./MyApp'),
    appName: 'My App',
  },
};

function App() {
  return (
    <FdeDesktop
      customApps={userApps}
      initialApp="my-app" // Optional: open on start
    />
  );
}

export default App;
```

### Lazy-Loaded Apps

For code-splitting, use the `loader` function:

```tsx
const userApps: Record<string, AppRegistryEntry> = {
  'heavy-app': {
    loader: () => import('./HeavyApp'),
    appName: 'Heavy App',
    isLazy: true, // Indicates lazy loading
  },
};
```

### App with Menu Bar

```tsx
import type { MenuBarComponent } from '@fde-desktop/fde-core';

const MyAppMenuBar: MenuBarComponent = ({ windowId }) => {
  const { menus } = useAppBarMenus(windowId);

  return <div>{/* Menu bar UI */}</div>;
};

const userApps: Record<string, AppRegistryEntry> = {
  'my-app': {
    loader: () => import('./MyApp'),
    appName: 'My App',
    MenuBarComponent: MyMenuBar, // Optional
  },
};
```

## Opening Apps Programmatically

```tsx
import { useOpenApp } from '@fde-desktop/fde-core';

function MyLauncher() {
  const openApp = useOpenApp();

  return (
    <button onClick={() => openApp('files')}>
      Open Files
    </button>
    <button onClick={() => openApp('notepad', {
      contentData: { initialContent: '# Hello\n\nStart writing...' }
    })}>
      Open Notepad with content
    </button>
  );
}
```

## Managing Desktop State

```tsx
import { useDesktopStore } from '@fde-desktop/fde-core';

function MyComponent() {
  const windows = useDesktopStore(s => s.windows);
  const icons = useDesktopStore(s => s.icons);
  const closeWindow = useDesktopStore(s => s.closeWindow);
  const openWindow = useDesktopStore(s => s.openWindow);

  return (
    <div>
      <p>Open windows: {windows.length}</p>
      <p>Desktop icons: {icons.length}</p>
    </div>
  );
}
```

## Settings and Themes

```tsx
import { useSettingsStore } from '@fde-desktop/fde-core';

function ThemeToggle() {
  const { theme, toggleTheme, wallpaper, setWallpaper } = useSettingsStore();

  return (
    <div>
      <button onClick={toggleTheme}>
        Switch to {theme.mode === 'light' ? 'dark' : 'light'} mode
      </button>
    </div>
  );
}
```

## Notifications

```tsx
import { useNotifications } from '@fde-desktop/fde-core';

function MyComponent() {
  const { showNotification } = useNotifications();

  const handleClick = () => {
    showNotification({
      title: 'Success',
      message: 'Operation completed!',
      type: 'success',
      fcIcon: 'FcCheckmark',
    });
  };

  return <button onClick={handleClick}>Do something</button>;
}
```

## Runtime Detection

```tsx
import { getRuntime, isDocker, isBrowser } from '@fde-desktop/fde-core';

const runtime = getRuntime(); // 'browser' | 'docker' | 'electron'

if (isDocker()) {
  // Use DockerFileSystemAdapter for API-based file system
}

if (isBrowser()) {
  // Use IndexedDBFileSystem (default)
}
```

## File System

The desktop uses a virtual file system persisted in IndexedDB:

```tsx
import { fileSystem } from '@fde-desktop/fde-core';

// Initialize on app start
await fileSystem.initialize();

// Create a folder
const folder = await fileSystem.createFolder('Documents', null);

// Create a file
const file = await fileSystem.createFile('notes.txt', 'Hello!', folder.id);

// List all nodes
const nodes = await fileSystem.getAllNodes();
```

## i18n (Internationalization)

The package includes i18n support for English and Spanish:

```tsx
import { FdeDesktop } from '@fde-desktop/fde-core';

// i18n is configured automatically in FdeDesktop
// Change language via settings store
import { useSettingsStore } from '@fde-desktop/fde-core';

function LanguageSwitcher() {
  const { language, setLanguage } = useSettingsStore();

  return (
    <select value={language} onChange={e => setLanguage(e.target.value)}>
      <option value="en">English</option>
      <option value="es">Español</option>
    </select>
  );
}
```

## Complete Example

```tsx
// src/App.tsx
import { FdeDesktop, type AppRegistryEntry } from '@fde-desktop/fde-core';
import type { WindowContentProps } from '@fde-desktop/fde-core';
import wallpaper from './assets/wallpaper.jpg';

// Custom app
const WelcomeApp: FC<WindowContentProps> = ({ window }) => {
  return (
    <div style={{ padding: 20 }}>
      <h1>Welcome to My Desktop!</h1>
      <p>This app is running in window {window?.id}</p>
    </div>
  );
};

// Custom apps registry
const userApps: Record<string, AppRegistryEntry> = {
  welcome: {
    loader: () => import('./WelcomeApp'),
    appName: 'Welcome',
  },
  'my-tool': {
    loader: () => import('./MyToolApp'),
    appName: 'My Tool',
    isLazy: true,
  },
};

function App() {
  return <FdeDesktop customApps={userApps} defaultWallpaper={wallpaper} initialApp="welcome" />;
}

export default App;
```

## Next Steps

- [API Reference](./api-reference.md) — all exported symbols
- [architecture.md](../architecture.md) — how the main app is structured
- [how-to-create-an-app.md](../how-to-create-an-app.md) — adding built-in apps
- [custom-apps.md](../custom-apps.md) — standalone apps via `window.__FDE_API__`

## Example App

The main repository (`src/` directory) contains a complete example application. It demonstrates:

- Using `FdeDesktop` with custom apps
- Welcome app (personal portfolio)
- External link apps (LinkedIn, GitHub)
- DOS game emulator
- All core features

See [github.com/frannunpal/fde-desktop](https://github.com/frannunpal/fde-desktop) for source code.
