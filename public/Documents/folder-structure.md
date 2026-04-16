# Folder Structure

Here's the complete breakdown of how the project is organized. You should be able to find anything without getting lost.

## Overview

This project has a **dual nature**: a reusable NPM package (`packages/core/`) and an example application (`src/`) that consumes it.

```
fran-desktop/
├── packages/
│   └── core/                # @fde-desktop/fde-core (npm package)
│       ├── src/             # Library source code
│       └── package.json
│
├── src/                     # Example app (consumer of @fde-desktop/fde-core)
│   ├── App.tsx              # Uses <FdeDesktop customApps={userApps} />
│   ├── main.tsx             # React entry point
│   ├── Presentation/        # Custom apps (WelcomeApp, etc.)
│   ├── Infrastructure/      # Example-specific adapters
│   └── Shared/              # Test utilities
│
├── docs/                    # Documentation
├── tests/                   # E2E and visual tests
└── docker/                  # Docker configuration
```

## Packages Directory (`packages/`)

The `packages/` directory contains NPM packages that can be published and used independently.

### `packages/core/` — @fde-desktop/fde-core

The main npm package with reusable desktop environment functionality:

```
packages/core/
├── package.json             # Package definition
├── tsup.config.ts           # Build config (library mode)
├── vitest.config.ts         # Test config
├── LICENSE
├── README.md
├── src/
│   ├── index.ts             # Main entry point (exports everything)
│   │
│   ├── apps/                # Core app exports
│   │   └── index.ts          # FilesApp, SettingsApp, etc.
│   │
│   ├── components/          # UI components
│   │   ├── FdeDesktop/      # Main wrapper component
│   │   ├── Desktop/         # Desktop area
│   │   ├── DesktopIcon/     # Desktop icons
│   │   ├── Window/          # Window component + registry helpers
│   │   ├── Taskbar/         # Taskbar with clock
│   │   ├── Launcher/        # App launcher
│   │   ├── AppMenuBar/      # Menu bar for apps
│   │   ├── ContextMenu/     # Right-click menus
│   │   ├── TaskbarContextMenu/
│   │   ├── Theme/           # Theme provider
│   │   ├── FdeProvider/     # Context provider
│   │   ├── Apps/            # Core apps (Files, Settings, etc.)
│   │   └── Shared/          # Shared UI components
│   │
│   ├── domain/              # Domain entities (pure business logic)
│   │   ├── entities/
│   │   │   ├── Window.ts
│   │   │   ├── DesktopIcon.ts
│   │   │   ├── FileSystem.ts
│   │   │   └── LauncherFolder.ts
│   │   └── index.ts
│   │
│   ├── infrastructure/      # External adapters
│   │   ├── adapters/
│   │   │   ├── IndexedDBFileSystem.ts
│   │   │   ├── DockerFileSystemAdapter.ts
│   │   │   ├── FdeApiAdapter.ts
│   │   │   ├── WindowManagerAdapter.ts
│   │   │   └── DefaultThemeProvider.ts
│   │   ├── Migration/
│   │   ├── Loaders/
│   │   └── index.ts
│   │
│   ├── stores/              # Zustand stores
│   │   ├── desktopStore.ts
│   │   ├── settingsStore.ts
│   │   ├── customAppStore.ts
│   │   ├── closeModalStore.ts
│   │   ├── AppTempMemory.ts
│   │   ├── factories/
│   │   └── index.ts
│   │
│   ├── hooks/               # 30+ React hooks
│   │   ├── useOpenApp.ts
│   │   ├── useNotifications.ts
│   │   ├── useSystemTheme.ts
│   │   ├── useClock.ts
│   │   ├── useDownload.ts
│   │   └── ... (30+ more)
│   │
│   ├── constants/           # App definitions + constants
│   │   ├── coreApps.ts      # CORE_APPS
│   │   ├── extraApps.ts     # EXTRA_APPS (reference)
│   │   ├── apps.ts          # Combined APPS
│   │   ├── layout.ts
│   │   ├── themeColors.ts
│   │   └── ...
│   │
│   ├── interfaces/          # TypeScript interfaces
│   │   ├── IAppEntry.ts
│   │   ├── IFileSystem.ts
│   │   ├── IWindowManager.ts
│   │   └── ...
│   │
│   ├── types/               # TypeScript types
│   │   ├── WindowTypes.ts
│   │   ├── FileSystemTypes.ts
│   │   └── ...
│   │
│   ├── utils/               # Utility functions
│   │   ├── getRuntime.ts
│   │   ├── uuid.ts
│   │   ├── formatBytes.ts
│   │   └── ...
│   │
│   ├── i18n/                # Internationalization
│   │   └── index.ts
│   │
│   ├── test/                # Test utilities
│   │   ├── __mocks__/
│   │   ├── Utils/
│   │   └── Types/
│   │
│   ├── server/              # Bun server (for Docker)
│   │   ├── index.ts
│   │   ├── routes/
│   │   └── ...
│   │
│   └── styles/              # Global CSS
│       └── variables.css
│
└── tests/                   # Package tests
    ├── apps.test.ts
    ├── build.test.ts
    └── exports.test.ts
```

### What's Exported from `@fde-desktop/fde-core`

| Category           | Exports                                                                                                                         |
| ------------------ | ------------------------------------------------------------------------------------------------------------------------------- |
| **Components**     | `FdeDesktop`, `Desktop`, `Window`, `Taskbar`, `Launcher`, `AppMenuBar`, `ContextMenu`, `DesktopIcon`, etc.                      |
| **Apps**           | `FilesApp`, `SettingsApp`, `NotesApp`, `ImageViewerApp`, `PdfApp`, `UploaderApp`, `CalendarApp`, `TerminalApp`, `CodeServerApp` |
| **Stores**         | `useDesktopStore`, `useSettingsStore`, `useCustomAppStore`, `useAppTempMemoryStore`                                             |
| **Hooks**          | `useOpenApp`, `useNotifications`, `useSystemTheme`, `useClock`, `useDownload`, `useIsDirty`, etc.                               |
| **Domain**         | `createWindow`, `createDesktopIcon`, `createLauncherFolder`                                                                     |
| **Infrastructure** | `IndexedDBFileSystem`, `DockerFileSystemAdapter`, `FdeApiAdapter`                                                               |
| **Types**          | `AppEntry`, `WindowEntity`, `FileNode`, `FolderNode`, `IFileSystem`, etc.                                                       |

## Example App (`src/`)

The `src/` directory is a **demonstration application** that shows how to use `@fde-desktop/fde-core`:

```
src/
├── App.tsx                  # Entry: <FdeDesktop customApps={userApps} />
├── main.tsx                 # React entry point
├── global.d.ts              # Global type declarations
├── index.css                # Global styles
│
├── Presentation/            # React components (example-specific)
│   ├── Components/
│   │   ├── Apps/            # Custom apps for the example
│   │   │   ├── WelcomeApp/  # Personal portfolio app
│   │   │   ├── LinkekinApp/ # LinkedIn link app
│   │   │   ├── GithubApp/   # GitHub link app
│   │   │   └── DosEmulatorApp/ # DOS emulator
│   │   └── Window/
│   │       └── AppRegistry.tsx  # userApps definition
│   └── Hooks/               # Example-specific hooks
│       └── useJsDos.ts      # DOS emulator hook
│
├── Infrastructure/          # Example-specific adapters
│   ├── Adapters/
│   │   └── JsDosAdapter.ts  # DOS emulator adapter
│   └── i18n.ts              # i18n setup
│
├── Shared/                  # Shared utilities (example-specific)
│   ├── Constants/
│   │   └── profileData.ts   # Profile data for WelcomeApp
│   ├── Types/
│   ├── Testing/             # Test utilities
│   └── Locales/             # Translation files
│
└── setupTestsJsdom.ts       # Test setup
```

### Example App vs Core Library

| Aspect           | `packages/core/`                  | `src/`                                   |
| ---------------- | --------------------------------- | ---------------------------------------- |
| **Purpose**      | Reusable library                  | Example app                              |
| **Exports**      | Everything via `index.ts`         | Consumes library                         |
| **Apps**         | Core apps (Files, Settings, etc.) | Custom apps (WelcomeApp, LinkedIn, etc.) |
| **Adapters**     | IndexedDB, Docker, FDE API        | js-dos (DOS emulator)                    |
| **Distribution** | npm package                       | Source only                              |

### How the Example Uses the Core

```tsx
// src/App.tsx
import { FdeDesktop } from '@fde-desktop/fde-core';
import { userApps } from '@presentation/Components/Window/AppRegistry';
import defaultWallpaper from '/Images/wallpaper.jpg';

function App() {
  return (
    <FdeDesktop
      customApps={userApps}
      defaultWallpaper={defaultWallpaper}
      initialApp="welcome"
      prefetchLoaders={[{ id: 'dos-emulator', loader: () => import('./DosEmulatorApp') }]}
    />
  );
}
```

## Server Layer (`packages/core/src/server/`)

Bun server for Docker mode. Handles API requests and WebSocket connections.

```
Server/
├── index.ts                  # Server entry point (Bun.serve)
├── types.ts                  # Server-specific types
├── workspace.ts              # Workspace utilities
└── routes/
    ├── fs.ts                 # File system REST API
    ├── fsWatcher.ts          # File watcher for HMR
    ├── pty.ts                # PTY WebSocket (terminal)
    ├── hmr.ts                # Hot Module Replacement WebSocket
    └── codeServer.ts         # code-server management
```

**API Endpoints:**

| Endpoint       | Method          | Description                               |
| -------------- | --------------- | ----------------------------------------- |
| `/api/fs/*`    | GET/POST/DELETE | File system operations                    |
| `/api/runtime` | GET             | Runtime info (docker, workspace, version) |
| `/api/shell`   | GET             | Available shells                          |
| `/api/pty`     | WebSocket       | Terminal PTY                              |
| `/api/hmr`     | WebSocket       | Hot reload for custom apps                |

---

## Core Library Layers (`packages/core/src/`)

The library is organized into clean hexagonal layers. All of these live inside `packages/core/src/`, not the example app.

### Domain Layer

Pure business logic. No React, no state management. Just factories that create entities.

```
packages/core/src/domain/
├── entities/
│   ├── DesktopIcon.ts      # Factory for DesktopIconEntity
│   ├── FileSystem.ts       # Factories for FileNode and FolderNode
│   ├── LauncherFolder.ts   # Factory for LauncherFolder
│   └── Window.ts           # Factory for WindowEntity
└── index.ts
```

### Infrastructure Layer

Adapters that connect to the outside world.

```
packages/core/src/infrastructure/
├── adapters/
│   ├── DefaultThemeProvider.ts     # Theme provider
│   ├── FdeApiAdapter.ts            # FDE API adapter for custom apps
│   ├── IndexedDBFileSystem.ts      # FS persistence (IndexedDB, default)
│   ├── IndexedDBBlobStore.ts       # Blob storage with idb:// URL scheme
│   ├── LocalStorageFileSystem.ts   # Legacy FS persistence (localStorage)
│   ├── DockerFileSystemAdapter.ts  # Docker REST FS adapter
│   ├── MantineThemeAdapter.ts      # Mantine adapter
│   └── WindowManagerAdapter.ts     # Window manager
├── Loaders/
└── Migration/
```

### Presentation Layer (Core)

All built-in apps and UI components live in `packages/core/src/components/`:

```
packages/core/src/components/
├── Apps/               # All built-in desktop apps
│   ├── FilesApp/       # File explorer
│   ├── SettingsApp/    # Settings (appearance, launcher, font, reset)
│   ├── NotesApp/       # Markdown editor (Notepad)
│   ├── ImageViewerApp/ # Image viewer with file picker
│   ├── PdfApp/         # PDF viewer
│   ├── UploaderApp/    # File upload wizard
│   ├── MenuEditApp/    # Manage launcher folders
│   ├── DeviceInfoApp/  # Device info display (always on top)
│   ├── CalendarApp/    # Calendar
│   ├── TerminalApp/    # xterm.js terminal (Docker only)
│   ├── CodeServerApp/  # VS Code via code-server (Docker only)
│   └── StorybookApp/   # Storybook viewer
├── Window/
│   ├── helperRegistry.ts   # Core app registry (initCoreRegistry)
│   ├── lazyApps.ts         # Lazy imports for all core apps
│   └── ...
├── FdeDesktop/         # Main wrapper component
├── Desktop/            # Desktop area
├── Taskbar/            # Taskbar with window buttons
├── Launcher/           # App launcher
└── Shared/             # Reusable UI components
```

## Where to Find Common Things

| What you're looking for          | Where it is                                                                  |
| -------------------------------- | ---------------------------------------------------------------------------- |
| Register a new app (example app) | `src/Presentation/Components/Window/AppRegistry.tsx`                         |
| Core app definitions (metadata)  | `packages/core/src/constants/coreApps.ts`                                    |
| Extra app definitions (metadata) | `packages/core/src/constants/extraApps.ts`                                   |
| Core app component registry      | `packages/core/src/components/Window/helperRegistry.ts`                      |
| Custom apps (Docker dynamic)     | `packages/core/src/constants/customApps.ts`                                  |
| Profile data (for Welcome)       | `packages/core/src/constants/profileData.ts`                                 |
| Menu bar builders                | `packages/core/src/components/Apps/*/build*MenuBar.tsx`                      |
| The main store                   | `packages/core/src/stores/desktopStore.ts`                                   |
| Settings store                   | `packages/core/src/stores/settingsStore.ts`                                  |
| Custom apps store                | `packages/core/src/stores/customAppStore.ts`                                 |
| Temp memory store                | `packages/core/src/stores/AppTempMemory.ts`                                  |
| i18n configuration               | `src/Infrastructure/i18n.ts`                                                 |
| Translation files                | `packages/core/src/i18n/` (core) or `src/Shared/Locales/` (example app)     |
| Server entry point               | `packages/core/src/server/index.ts`                                          |
| Server API routes                | `packages/core/src/server/routes/`                                           |
| FDE API adapter                  | `packages/core/src/infrastructure/adapters/FdeApiAdapter.ts`                 |
| Storage migration                | `packages/core/src/infrastructure/Migration/migrateStorage.ts`               |
| Window component                 | `packages/core/src/components/Window/Window.tsx`                             |
| Hook for opening apps            | `packages/core/src/hooks/useOpenApp.ts`                                      |
| Hook for tracking changes        | `packages/core/src/hooks/useIsDirty.ts`                                      |
| File picker modal                | `packages/core/src/components/Shared/FilePickerApp/FilePickerApp.tsx`        |
| File system (default)            | `packages/core/src/infrastructure/adapters/IndexedDBFileSystem.ts`           |
| Blob store                       | `packages/core/src/infrastructure/adapters/IndexedDBBlobStore.ts`            |
| Window types                     | `packages/core/src/interfaces/WindowEntity.ts`                               |
| FDE API types                    | `packages/core/src/types/FdeApi.ts`                                          |
| Global styles                    | `src/index.css`                                                              |

## Important Root Files

| File               | What it's for         |
| ------------------ | --------------------- |
| `vite.config.ts`   | Vite config           |
| `tsconfig.json`    | TypeScript config     |
| `vitest.config.ts` | Vitest config (tests) |
| `.storybook/`      | Storybook config      |
| `eslint.config.js` | ESLint config         |
| `.prettierrc`      | Prettier config       |

## Next Step

Now that you know where everything is, check out [hooks.md](./hooks.md) to see all available hooks and what each one does.

```

```
