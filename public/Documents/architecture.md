# Architecture

This project is a virtual desktop in the browser, like those web-based desktop environments you might find on certain web services. The idea is simple: recreate the feeling of a real operating system inside Chrome or Firefox.

## The Tech Stack

Before diving into the details, here's what it's built with:

| Technology        | Why                                                                        |
| ----------------- | -------------------------------------------------------------------------- |
| **React 19**      | Latest React with improved concurrent features                             |
| **TypeScript**    | Window state is complex, types catch bugs before they hit production       |
| **react-rnd**     | 170k weekly downloads. Handles all the drag and resize math                |
| **Zustand**       | State management without the boilerplate. We're happy with it              |
| **Mantine v9**    | Pretty Components Without a Designer. Upgraded from v8 for latest features |
| **Framer Motion** | Animations that don't kill performance                                     |

## Project Structure Overview

This project has a **dual nature**: a reusable NPM package and an example application that consumes it.

```
fran-desktop/
├── packages/
│   └── core/                 # @fde-desktop/fde-core (npm package)
│       ├── src/
│       │   ├── components/   # UI components (Window, Desktop, Taskbar, etc.)
│       │   ├── apps/         # Core app exports (Files, Settings, etc.)
│       │   ├── domain/        # Entity factories (createWindow, etc.)
│       │   ├── infrastructure/ # Adapters (IndexedDB, Docker, etc.)
│       │   ├── stores/        # Zustand stores
│       │   ├── hooks/         # React hooks
│       │   ├── constants/     # App definitions, theme, layout
│       │   ├── types/         # TypeScript types
│       │   ├── interfaces/     # TypeScript interfaces
│       │   ├── i18n/          # Internationalization
│       │   ├── utils/         # Utility functions
│       │   └── index.ts       # Public API
│       └── package.json
│
└── src/                      # Example app (consumer of @fde-desktop/fde-core)
    ├── App.tsx               # Uses <FdeDesktop customApps={userApps} />
    ├── main.tsx              # React entry point
    ├── Presentation/
    │   └── Components/
    │       ├── Apps/
    │       │   ├── WelcomeApp/   # Personal portfolio app
    │       │   ├── LinkedinApp/  # LinkedIn link app
    │       │   ├── GithubApp/    # GitHub link app
    │       │   └── DosEmulatorApp/ # DOS game emulator
    │       └── Window/
    │           └── AppRegistry.tsx  # userApps definition
    ├── Infrastructure/
    │   └── Adapters/
    │       └── JsDosAdapter.ts  # DOS emulator adapter
    └── Shared/
        └── Testing/          # Test utilities
```

### `packages/core/` — The Library

The `packages/core/` directory contains `@fde-desktop/fde-core`, a standalone npm package. It exports:

- **UI Components**: `FdeDesktop`, `Desktop`, `Window`, `Taskbar`, `Launcher`, `AppMenuBar`, `ContextMenu`, etc.
- **Core Apps**: Files, Settings, Notepad, Image Viewer, PDF Viewer, Calendar, Terminal, VS Code
- **Stores**: Zustand stores for desktop, settings, custom apps
- **Hooks**: 30+ hooks for app management, notifications, icons, file system
- **Domain Entities**: Factories for creating windows, icons, folders
- **Infrastructure**: IndexedDB file system, Docker adapter, FDE API adapter
- **Types & Utils**: Full TypeScript support and utility functions

### `src/` — The Example App

The `src/` directory is **not** part of the npm package. It's a demonstration application that shows how to use `@fde-desktop/fde-core`:

- **WelcomeApp**: Personal portfolio (the "home" app)
- **LinkedinApp**, **GithubApp**: External link apps
- **DosEmulatorApp**: DOS game emulator using js-dos
- **AppRegistry**: Shows how to register custom apps

The example app connects to the core library via `App.tsx`:

```tsx
// src/App.tsx
import { FdeDesktop } from '@fde-desktop/fde-core';
import { userApps } from '@presentation/Components/Window/AppRegistry';

function App() {
  return (
    <FdeDesktop customApps={userApps} defaultWallpaper={defaultWallpaper} initialApp="welcome" />
  );
}
```

### How They Connect

1. `packages/core/` exports everything via `src/index.ts`
2. `src/App.tsx` imports `FdeDesktop` and passes custom apps
3. Core apps (Files, Settings, etc.) are loaded automatically by `FdeDesktop`
4. Custom apps (Welcome, LinkedIn, GitHub) are registered via `customApps` prop

## Hexagonal Architecture (Ports & Adapters)

The project uses a simplified hexagonal architecture, balancing clean separation with practical simplicity:

```
Domain (pure entities/factories)
   ↓
Infrastructure (adapters: react-rnd, IndexedDB)
   ↓
Presentation (React components + Zustand stores)
```

### Domain Layer (`packages/core/src/domain/`)

Pure business entities live here. No external dependencies, no React, nothing. Just plain TypeScript factories:

- **Window.ts**: Factory for creating window entities
- **FileSystem.ts**: Factories for file system nodes (files and folders)
- **DesktopIcon.ts**: Factory for desktop icons
- **LauncherFolder.ts**: Factory for creating launcher folder entities (predefined and custom folders that organize apps in the Launcher)

### Application Layer (interfaces in `packages/core/src/interfaces/`)

Contains the interface contracts (ports) that adapters implement:

- **IWindowManager**: Interface for window operations
- **IFileSystem**: Interface for file system operations
- **IThemeProvider**: Interface for theme management

The use cases were intentionally removed as they added unnecessary indirection. The stores call adapters directly, keeping the architecture simple and practical.

### Infrastructure Layer (`packages/core/src/infrastructure/`)

The adapters that connect the real world with our logic:

**Adapters:**

- **WindowManagerAdapter.ts**: Implements `IWindowManager`. Manages the entire window lifecycle (open, close, minimize, maximize, focus, move, resize). Also handles the z-index strategy with alwaysOnTop.
- **IndexedDBFileSystem.ts**: Implements `IFileSystem`. Persists the file system and file blobs to IndexedDB. Supports seeding from a manifest, SHA-256 hash-based blob deduplication, and automatic migration from legacy localStorage data.
- **IndexedDBBlobStore.ts**: Low-level blob storage module. Handles raw `save()`, `load()`, `remove()`, `toBlobUrl()` operations on a dedicated IndexedDB database (`fde-desktop-blobs`). Files stored here are referenced via the `idb://` URL scheme.
- **LocalStorageFileSystem.ts**: Legacy `IFileSystem` implementation. Kept for backward compatibility — new installations use `IndexedDBFileSystem` by default.
- **DefaultThemeProvider.ts**: Implements `IThemeProvider`. Manages light/dark themes.
- **MantineThemeAdapter.ts**: Converts our custom Theme object to the format Mantine expects.
- **FdeApiAdapter.ts**: Provides the `__FDE_API__` interface for custom apps. Exposes window management, notifications, file system, and event APIs.
- **i18n.ts**: Internationalization configuration using react-i18next. Supports English and Spanish with automatic language detection.

**Loaders:**

- **jsDosLoader.ts**: Loads DOS game bundles for the DOS emulator app.

**Migration:**

- **migrateStorage.ts**: Handles migration of storage data between versions (e.g., localStorage to IndexedDB).

### Server Layer (`packages/core/src/server/`)

Bun server for Docker mode. Handles API requests and WebSocket connections for file system operations, terminal PTY, and hot module replacement.

**Entry Point:**

- **index.ts**: Main server using `Bun.serve()`. Routes requests to appropriate handlers.

**Routes:**

- **fs.ts**: REST API for file system operations (`GET/POST/DELETE /api/fs/*`). Binds `WORKSPACE_PATH` for Docker workspace.
- **fsWatcher.ts**: File watcher for custom app HMR. Monitors `apps/` directory for changes.
- **pty.ts**: WebSocket handler for terminal PTY. Provides shell access in Docker mode.
- **hmr.ts**: WebSocket handler for hot module replacement. Notifies connected clients when custom apps change.
- **codeServer.ts**: Manages code-server processes for the CodeServer app.

**API Endpoints:**

| Endpoint       | Method          | Description                               |
| -------------- | --------------- | ----------------------------------------- |
| `/api/fs/*`    | GET/POST/DELETE | File system operations                    |
| `/api/runtime` | GET             | Runtime info (docker, workspace, version) |
| `/api/shell`   | GET             | Available shells                          |
| `/api/pty`     | WebSocket       | Terminal PTY                              |
| `/api/hmr`     | WebSocket       | Hot reload for custom apps                |

### Presentation Layer (`packages/core/src/components/`)

This is where all the React stuff lives:

- **Components/**: UI components (Window, Taskbar, DesktopIcon, Apps, etc.)
  - **Taskbar/**: The bottom bar showing open windows and system controls
  - **TaskbarContextMenu/**: Right-click menu for taskbar items (window controls: minimize, maximize, restore, exit)
  - **Launcher/**: Start menu / app launcher with settings sections and collapsible folders
  - **Window/**: Draggable, resizable window component using react-rnd
    - **helperRegistry.ts**: Core app registry — `initCoreRegistry()` registers all built-in apps
    - **lazyApps.ts**: Lazy imports for all core app components
    - **AppReadyContext.tsx**: React context for app-window communication
    - **useAppReady.ts**: Hook to access notifyReady and getContentData from context
  - **DesktopIcon/**: Icons on the desktop that open apps
  - **PortraitWarning/**: Warning overlay for portrait orientation on mobile devices
  - **Apps/**: Built-in applications (Welcome, Files, Terminal, Settings, Notes/Notepad, PDF Viewer, Image Viewer, Calendar, Storybook, Uploader, DOS Emulator, MenuEdit, CodeServer)
  - **Shared/**: Reusable components
    - **AppIcon/**: App icon component
    - **AppLoading/**: Loading spinner for lazy-loaded apps
    - **AppEmptyState/**: Empty state component for apps
    - **BiIcon/**: BoxIcons loader component
    - **VscIcon/**: VSCode icon wrapper component
    - **CollapsibleSection/**: Collapsible folder/app sections
    - **ColorPicker/**, **IconColorPicker/**: Color picker components
    - **CreateItemApp/**: Create files/folders modal
    - **DirtyIndicator/**: Unsaved changes indicator
    - **DownloadProgress/**: Download progress component
    - **ExternalLinkApp/**: Reusable external link app component
    - **FilePickerApp/**, **FolderPicker/**: File picker and folder picker modals
    - **LanguageFlag/**: SVG flag components for language selection
    - **SettingsSection/**: Reusable settings section wrapper
    - **CustomAppLoader/**: Dynamic app loader with error and offline states
      - **CustomAppLoader.tsx**: Main loader component
      - **CustomAppLoadingScreen.tsx**: Loading screen
      - **CustomAppNotSupported.tsx**: Not supported message
      - **CustomAppOffline.tsx**: Offline message
- **Hooks/**: Custom hooks (useOpenApp, useClock, useSystemTheme, useDownload, useApplyFont, useIsDirty, useCloseInterceptor, useNotifications, useFcIcon, useFiIcon, useVscIcon, useDynamicIcon, useContextMenu, useWindowButtonRegistry, useAppUpdate, useLanguageSync, useAppName, useResolvedUrl, useFolderName, useTaskbarHeight, useSearchFilter, useCollapsible, useDragDrop, useFdeApi, useJsDos, useDeviceDetection, useAdaptiveDimensions, useTaskbarContextMenu, useFontDownload, useAnimationDuration)
- **Store/**: Zustand stores (desktopStore.ts, settingsStore.ts, closeModalStore.ts, customAppStore.ts)
- **Utils/**: Presentation utilities

### Shared Layer (`packages/core/src/` — interfaces, types, constants, utils)

Code shared across all layers:

- **Interfaces/**: TypeScript contracts (IWindowManager, IFileSystem, AppEntry, etc.)
  - **IComponentProps.ts**: Props interfaces for all presentation components
  - **IWindowContentProps.ts**: Interface for app components (`WindowContentProps`, `MenuBarBuilder`)
  - **WindowEntity.ts**: Window entity type with contentData
  - **ISettingsState.ts**: Settings state interface (wallpaper, font, theme, custom colors)
  - **IAppMenuElement.ts**: Menu bar element types (menu, item, divider, combobox, switch, slider, text-input)
- **Types/**: Utility types
- **Constants/**: Global constants (APPS, Colors, Icons, Animations, Fonts)
- **Utils/**: Utility functions (getFileExtension, sortNodes, getAppIdForMime)
- **Testing/**: Test utilities (mocks, helpers: makeWindow, makeWindowEntity, resetDesktopStore, renderWithMantine)

## Window Component Architecture

The `Window` component uses a centralized registry pattern to manage apps:

### WindowContentProps

All app components receive `WindowContentProps` instead of individual props:

```tsx
interface WindowContentProps {
  window?: WindowEntity; // The window entity with metadata and contentData
  notifyReady?: (contentData?: Record<string, unknown>) => void; // Callback to push data back
}
```

### AppRegistration System

Apps are managed through a three-tier registry system:

**1. Core Apps (`packages/core/src/components/Window/helperRegistry.ts` — `initCoreRegistry()`)**

Bundled with the library and loaded asynchronously:

- Files, Settings, PDF Viewer, Image Viewer
- Uploader, Create Item, Notes/Notepad, Calendar
- Menu Editor, Device Info, Terminal, Code Server, Storybook

**2. User Apps (`src/Presentation/Components/Window/AppRegistry.tsx`)**

Application-specific apps defined in the example app:

- Welcome, LinkedIn, GitHub, DosEmulator, DOOM

**3. Custom Apps (Docker runtime)**

Dynamic apps loaded from `/dist-apps/apps-manifest.json` with hot-reload support.

**Architecture:**

```
FdeDesktop.mount()
  └── initCoreRegistry()     // Load core apps asynchronously
      └── registerComponents(customApps)  // Merge user apps
          └── Desktop + Taskbar render with merged registry
```

**Key Files:**

- `packages/core/src/components/Window/helperRegistry.ts`: Core registry — `initCoreRegistry()`, `registerComponents()`, `getAppComponent()`, etc.
- `packages/core/src/components/Window/lazyApps.ts`: Lazy imports for all core app components
- `src/Presentation/Components/Window/AppRegistry.tsx`: Example app's `userApps` definition

**Registration in App:**

```tsx
import { FdeDesktop } from '@fde-desktop/fde-core';
import { userApps } from './AppRegistry';

function App() {
  return <FdeDesktop customApps={userApps}>{/* Desktop content */}</FdeDesktop>;
}
```

All app registration follows a consistent pattern:

```tsx
const userApps: Record<string, AppRegistryEntry> = {
  'image-viewer': {
    component: ImageViewerApp,
    MenuBarComponent: ImageViewerMenuBar, // React component (recommended)
    appName: 'Image Viewer',
  },
  pdf: {
    component: PdfApp,
    MenuBarComponent: PdfMenuBar,
    appName: 'PDF',
  },
  // ...other apps
};
```

**Two patterns for menu bars:**

| Pattern            | Use When                             |
| ------------------ | ------------------------------------ |
| `MenuBarComponent` | Reactive state (sliders, zoom, etc.) |
| `buildMenuBar`     | Static menus only (older apps)       |

For new apps, prefer `MenuBarComponent`. See [how-to-create-an-app.md](./how-to-create-an-app.md) for details.

### notifyReady Pattern (buildMenuBar only)

Apps use `notifyReady` to communicate with the window/menu bar:

```tsx
const ImageViewerApp: FC<WindowContentProps> = ({ window: win, notifyReady }) => {
  const [pickerOpen, setPickerOpen] = useState(false);

  useEffect(() => {
    notifyReady?.({
      ...(win?.contentData ?? {}),
      setPickerOpen: () => setPickerOpen(true),
    });
  }, [win, notifyReady]);

  return <div>...</div>;
};
```

The menu bar builder reads these values from `window.contentData`:

```tsx
const buildImageViewerMenuBarFn: MenuBarBuilder = (window: WindowEntity) => {
  const setPickerOpen = window.contentData?.setPickerOpen as (() => void) | undefined;
  return buildImageViewerMenuBar(
    () => setPickerOpen?.(),
    () => closeWindow(window.id),
  );
};
```

This decoupling means:

- **Components** don't know about windows or menu bars
- **Menu bars** are recomputed every render with fresh contentData
- **All registration** is centralized in one file

## Typical Data Flow

1. User **double clicks** on a desktop icon
2. The `DesktopIcon` component calls `useOpenApp()` with the app ID
3. `useOpenApp` looks up the app in the `APPS` registry (in `packages/core/src/constants/apps.ts`)
4. Generates a random position for the window
5. Calls `openWindow()` on the store (`desktopStore.ts`)
6. The store delegates to `WindowManagerAdapter` (in Application layer)
7. `WindowManagerAdapter` creates the `Window` entity with its unique z-index
8. Adds it to the windows array in the store
9. The `Window` component:
   - Looks up the app component via `getAppComponent()` in `helperRegistry`
   - Creates `AppReadyProvider` context
   - Renders the app with `WindowContentProps`
   - Computes the menu bar from the builder (if present)

## State Management with Zustand

The project uses multiple Zustand stores with persist middleware. Desktop state and settings are saved to localStorage, while the file system (nodes and blobs) is stored in IndexedDB. When you close the tab and come back, everything is where you left it.

### desktopStore (`packages/core/src/stores/desktopStore.ts`)

Main store for desktop state:

- **windows**: Array of all open windows with contentData
- **icons**: Desktop icons
- **fsNodes**: File system nodes (virtual file system)
- **clipboard**: Clipboard content (copy/cut operations)
- **filesCurrentFolderId**: Current folder in Files app
- **contextMenu**: Context menu state (position, items, target)
- **notifications**: System notifications

### settingsStore (`packages/core/src/stores/settingsStore.ts`)

User preferences and theme settings:

- **wallpaper**: Background image URL
- **launcherIcon**: Icon for the start menu button
- **font**: Selected font family
- **downloadedFonts**: Array of downloaded Google Fonts
- **theme**: Current theme (light/dark mode with color values)
- **themeSetManually**: Whether user manually set theme (vs system)
- **customThemeColors**: Custom color overrides for taskbar, window, accent
- **language**: Current UI language ('en' | 'es')

### closeModalStore (`packages/core/src/stores/closeModalStore.ts`)

Handles close confirmation dialogs:

- **isModalOpen**: Whether a close confirmation modal is displayed
- **setIsModalOpen**: Toggle modal visibility

### customAppStore (`packages/core/src/stores/customAppStore.ts`)

Manages custom (dynamic) apps in Docker mode:

- **customApps**: Array of loaded custom app manifests
- **isLoading**: Loading state for custom apps
- **error**: Error state if loading fails
- **loadCustomApps**: Load custom app manifests from server
- **registerApp**: Register a new custom app
- **unregisterApp**: Remove a custom app

Used by `CustomAppLoader` and `useCustomAppHMR` to manage dynamic apps.

### AppTempMemory (`packages/core/src/stores/AppTempMemory.ts`)

Temporary snapshots for `useIsDirty` hook:

- **snapshots**: Record of appId → snapshot data
- **setSnapshot**: Store a snapshot for an app
- **getSnapshot**: Retrieve a snapshot for an app
- **clearSnapshot**: Remove a snapshot

All stores persist to localStorage automatically.

## What's Saved and Where

### IndexedDB

| Database            | Store   | What it saves                                        |
| ------------------- | ------- | ---------------------------------------------------- |
| `fde-desktop-fs`    | `nodes` | File system nodes (files and folders metadata)       |
| `fde-desktop-fs`    | `blobs` | File blobs with SHA-256 hash deduplication           |
| `fde-desktop-blobs` | `blobs` | Standalone blob store (used by `IndexedDBBlobStore`) |

### localStorage

| Key                         | What it saves                           |
| --------------------------- | --------------------------------------- |
| `fde-desktop`               | Desktop state (windows, icons)          |
| `fde-desktop:settings`      | User settings (theme, wallpaper, font)  |
| `fde-desktop:appTempMemory` | Temporary snapshots for useIsDirty hook |
| `fde-desktop:version`       | App version (for detecting updates)     |
| `fde-desktop:language`      | User's preferred language               |

> **Migration note**: Older installations stored data with `fran-desktop` prefix. A migration utility will be implemented to handle legacy data.

Everything stays on your machine. No cookies, no servers, no tracking. Total privacy.

## Internationalization (i18n)

The project uses react-i18next for internationalization:

- **Infrastructure/i18n.ts**: i18n configuration with automatic language detection
- **Shared/Locales/**: Translation files organized by language (`en/`, `es/`)

Supported languages:

- English (en) - default fallback
- Spanish (es)

Language detection and persistence:

1. First visit: Detects browser language via `i18next-browser-languagedetector`
2. If detected language is not supported, falls back to English
3. User preference saved to localStorage via settingsStore
4. Manual switch available via Settings app or Taskbar language selector

Translation namespaces:

- `common`: Common UI strings (buttons, labels, themes)
- `apps`: App names and descriptions
- `settings`: Settings sections and options
- `window`: Window-related strings
- `contextMenu`: Context menu strings
- `notifications`: Notification strings
- `welcome`: Welcome app strings (hero, skills, experience)

## Window Z-Index Strategy

Normal windows have sequential z-index: 1, 2, 3...
"Always on top" windows have an offset of +10000: 10001, 10002...

This guarantees they're always above normal ones, no matter how many normal windows are open.

## Next Step

Now that you know how the architecture works, check out [folder-structure.md](./folder-structure.md) to see how the code is organized on disk.

## Recent Changes

### New Stores (2024-2025)

Split global state into multiple focused stores:

- **settingsStore**: Separated user preferences (wallpaper, font, theme, custom colors) from desktop state
- **closeModalStore**: Dedicated store for close confirmation dialogs

### Window-Scoped State Factory

New apps should use the `createWindowStateStore` factory for per-window state:

```typescript
// Instead of writing 40+ lines of boilerplate:
const useMyStore = createWindowStateStore<MyState>(defaultState);

// Provides:
// - states: Record<string, T>
// - actions.getState(id)
// - actions.setState(id, updates)
// - actions.reset(id)
```

Location: `packages/core/src/stores/factories/createWindowStateStore.ts`

For dirty-state-only tracking, use `createDirtyStateStore()` which includes optimization to skip updates when value hasn't changed.

### Code Splitting

Large apps are lazy-loaded to reduce initial bundle size:

All core apps use `React.lazy()` — they're defined in `packages/core/src/components/Window/lazyApps.ts` and registered with `isLazy: true`:

- `notepad`, `menuedit`, `calendar`, `device-info`, `storybook`
- `terminal`, `code-server`
- `files`, `settings`, `pdf`, `image-viewer`, `uploader`

Example app lazy apps (in `src/Presentation/Components/Window/AppRegistry.tsx`):

- `linkedin`, `github`, `dos-emulator`, `doom`
- `welcome` uses a `loader` (React.lazy internally)

```typescript
// lazyApps.ts
export const FilesAppLazy = lazy(() => import('../Apps/FilesApp/FilesApp'));
export const NotesAppLazy = lazy(() => import('../Apps/NotesApp/NotesApp'));
```

**Loading component:** `AppLoading` displays a spinner while lazy apps load.

**Prefetch:** Apps are prefetched after 3 seconds idle time via `requestIdleCallback`.

### Enhanced Menu Bar System

All apps with menus now use the centralized `AppRegistry` pattern:

- **NotesApp**: Full-featured markdown editor with New, Save, Save As, Exit menu
- **ImageViewerApp**: Simple File > Open/Exit menu
- **PdfApp**: File > Open/Exit menu
- **SettingsApp**: Edit > Discard changes, File > Exit menu

### Window Content Data Pattern

成熟 production-ready pattern for app-window communication:

```tsx
// App pushes data via notifyReady
notifyReady?.({
  actions: { new: handleNew, save: handleSave },
  isDirty,
  setPickerOpen: () => setPickerOpen(true),
});

// Menu bar reads from window.contentData
const actions = window.contentData?.actions as { save: () => void } | undefined;
```

### TaskbarContextMenu Enhancements

Right-click menu on taskbar buttons now includes:

- **Minimize**: Minimize window to taskbar
- **Maximize**: Maximize window to full screen
- **Restore**: Restore minimized/maximized window
- **Close**: Close the window
- Window state-aware options (only shows applicable actions)

### Font System

New font management system with Google Fonts integration:

- User can select from multiple font families
- Automatic Google Fonts loading and persistence
- `useApplyFont` hook applies font globally
- Downloaded fonts persist across sessions

### Download Hook

Added `useDownload` hook for streaming HTTP downloads:

- Real-time progress tracking (bytes loaded, percent complete)
- Handles Content-Length headers
- Fallback for environments without ReadableStream
- Used by version update system

### IndexedDB File System Migration

The file system storage was migrated from localStorage to IndexedDB:

- **IndexedDBFileSystem**: New default adapter implementing `IFileSystem`. Uses two IndexedDB object stores (`nodes` and `blobs`) for file metadata and binary content respectively.
- **IndexedDBBlobStore**: Dedicated blob storage module with `idb://` URL scheme for referencing stored files.
- **SHA-256 deduplication**: Uploaded files are hashed and stored by hash, preventing duplicate large files from wasting space.
- **Persistence queue**: Batches multiple mutations into single IndexedDB transactions using `queueMicrotask()`.
- **Automatic migration**: Legacy localStorage data (`fran-desktop:filesystem`) is detected and migrated on first initialization.
- **useResolvedUrl hook**: Converts `idb://` URLs to temporary blob URLs for display in apps (ImageViewer, PdfApp, NotesApp). Handles blob URL lifecycle (creation and revocation).

### Uploader App

New file upload application with a 4-step wizard:

1. **Select**: Choose a file from the local machine via a file button
2. **Destination**: Pick a target folder using a folder picker modal
3. **Upload**: Store the file blob in IndexedDB with progress feedback
4. **Done**: Post-upload actions — "Show in Files" and "Open file"

Uses `fileSystem.saveBlob()` for hash-based deduplication and `createFile()` to register the file node.

### DOS Emulator

New app using [js-dos](https://js-dos.com/overview.html) to run DOS games in the browser. See [adding-games-to-dos-emulator.md](./adding-games-to-dos-emulator.md) for details.

### Icon System Refactoring

Centralized dynamic icon loading into `useDynamicIcon` hook:

- Supports `react-icons/fc`, `react-icons/bi`, and `react-icons/vsc` libraries
- New `useVscIcon` / `useVscIconElement` hooks for VSCode icons
- New `VscIcon` shared component

### Built-in Apps

Current app lineup:

- **Welcome**: Personal portfolio/profile app with skills, experience, and contact info
- **Calendar**: Calendar view
- **DOS Emulator**: Run DOS games via js-dos bundles
- **Device Info**: System information display (always on top)
- **Files**: File explorer with folder tree and file list
- **Github**: GitHub profile link
- **Image Viewer**: Image viewer with file picker
- **LinkedIn**: LinkedIn profile link
- **Notes**: Markdown editor with rich text toolbar
- **PDF Viewer**: PDF document viewer
- **Settings**: Appearance, launcher, font, and reset settings
- **Storybook**: Storybook playground
- **Terminal**: Interactive terminal emulator (xterm.js + WebSocket PTY). Docker only — shows an unsupported notice in web/Electron
- **Uploader**: File upload wizard with folder picker
- **Code Server**: VS Code in a browser (code-server). Docker only — starts the code-server process on demand and embeds it in an iframe

## NPM Package Structure

The project exports core functionality as `@fde-desktop/fde-core`, allowing others to build their own desktop environments.

### Package Location

```
packages/
└── core/                    # @fde-desktop/fde-core
    ├── package.json         # Package definition
    ├── src/
    │   ├── apps/            # Core app exports (Files, Settings, etc.)
    │   ├── components/       # UI components (FdeDesktop, Window, Taskbar, etc.)
    │   ├── constants/        # App definitions, theme, layout constants
    │   ├── domain/           # Domain entities (createWindow, etc.)
    │   ├── hooks/            # 30+ React hooks
    │   ├── i18n/             # Internationalization setup
    │   ├── infrastructure/   # Adapters (IndexedDB, Docker, etc.)
    │   ├── interfaces/       # TypeScript interfaces
    │   ├── stores/           # Zustand stores
    │   ├── types/            # TypeScript types
    │   ├── utils/            # Utility functions
    │   ├── test/             # Test utilities
    │   ├── server/           # Bun server (for Docker)
    │   └── index.ts          # Public API
    ├── tests/                # Package tests
    └── tsup.config.ts        # Build config
```

### What's Exported

| Category           | Exports                                                                                                                         |
| ------------------ | ------------------------------------------------------------------------------------------------------------------------------- |
| **Components**     | `FdeDesktop`, `Desktop`, `Window`, `Taskbar`, `Launcher`, `AppMenuBar`, `ContextMenu`, `DesktopIcon`, etc.                      |
| **Apps**           | `FilesApp`, `SettingsApp`, `NotesApp`, `ImageViewerApp`, `PdfApp`, `UploaderApp`, `CalendarApp`, `TerminalApp`, `CodeServerApp` |
| **Stores**         | `useDesktopStore`, `useSettingsStore`, `useCustomAppStore`, `useAppTempMemoryStore`                                             |
| **Hooks**          | `useOpenApp`, `useNotifications`, `useSystemTheme`, `useClock`, `useDownload`, `useIsDirty`, etc.                               |
| **Domain**         | `createWindow`, `createDesktopIcon`, `createLauncherFolder`, `createFile`, `createFolder`                                       |
| **Infrastructure** | `IndexedDBFileSystem`, `DockerFileSystemAdapter`, `FdeApiAdapter`, `WindowManagerAdapter`                                       |
| **Types**          | `AppEntry`, `WindowEntity`, `FileNode`, `FolderNode`, `IFileSystem`, etc.                                                       |

### CORE_APPS vs EXTRA_APPS

The package splits apps into two categories:

| Category       | Apps                                                                                 | Availability                             |
| -------------- | ------------------------------------------------------------------------------------ | ---------------------------------------- |
| **CORE_APPS**  | Files, Settings, Notepad, ImageViewer, PDF, Uploader, MenuEdit, DeviceInfo, Calendar | Exported in `@fde-desktop/fde-core`      |
| **EXTRA_APPS** | Welcome, Storybook, Linkedin, Github, Terminal, CodeServer, DosEmulator, Doom        | Host app only (depends on static assets) |

```typescript
// From @fde-desktop/fde-core
import { CORE_APPS, CORE_APP_IDS } from '@fde-desktop/fde-core';

// From host app (src/Shared/Constants)
import { EXTRA_APPS, EXTRA_APP_IDS } from '@/Shared/Constants/extraApps';
```

### Exports

The package exports:

```typescript
// Apps
export { CORE_APPS, CORE_APP_IDS, FilesApp, SettingsApp /* ... */ } from './apps';

// Stores
export { useDesktopStore, useSettingsStore, useCustomAppStore } from './stores';

// Hooks
export { useOpenApp, useFdeApi, useNotifications /* ... */ } from './hooks';

// Domain Entities
export { createWindow, createDesktopIcon, createLauncherFolder } from './domain';

// Types & Interfaces
export type { AppEntry, WindowEntity, FSNode, IFileSystem } from './types';

// Utils
export { getRuntime, isDocker, isBrowser, uuid, formatBytes } from './utils';

// Constants
export { DEFAULT_WINDOW_DIMENSIONS, DEFAULT_THEME_COLORS /* ... */ } from './constants';
```

### Usage

See [npm-package.md](./npm-package.md) for full usage guide.

### Publishing

The package is published automatically via GitHub Actions when a release is created:

1. Create a git tag: `git tag v0.3.1 && git push --tags`
2. Create a GitHub release from the tag
3. `release.yml` runs → syncs version to `packages/core/package.json`
4. `npm-publish.yml` runs → tests, builds, publishes to npm

### LanguageFlag Component

Flag icons for language selection:

- SVG-based flag components for supported languages (English, Spanish)
- Used in Settings app and Taskbar language selector
- Lightweight, no external image dependencies

### Profile Data

Personal profile constants in `src/Shared/constants/profileData.ts`:

- **PROFILE**: Contact info (name, title, email, phone, location, links, CV URLs)
- **EXPERIENCE**: Work history with company, role, period, description
- **SKILLS**: Technical and soft skills with proficiency levels
- **LANGUAGES**: Language proficiency (native, certified)
- **TECH_STACK**: List of technologies for skills display

Used by WelcomeApp to render the portfolio page.

## SSG and SEO

The project uses static site generation (SSG) for SEO optimization on GitHub Pages.

### Prerendering

The build process generates static HTML for the homepage:

- **scripts/prerender.ts**: Uses `@prerenderer/prerenderer` with Puppeteer
- Waits for `prerender-ready` event before capturing
- Generates `sitemap.xml` automatically
- Runs after `bun run build` in production builds

### Meta Tags

`index.html` includes comprehensive meta tags:

```html
<!-- Primary Meta Tags -->
<title>FDE Desktop - Web Desktop Environment</title>
<meta name="description" content="A web-based desktop environment..." />

<!-- Open Graph / Facebook -->
<meta property="og:type" content="website" />
<meta property="og:url" content="https://frannunpal.github.io/" />
<meta property="og:image" content="https://frannunpal.github.io/og-image.png" />

<!-- Twitter -->
<meta name="twitter:card" content="summary_large_image" />
```

### Sitemap and Robots

Generated during build:

- `sitemap.xml`: Auto-generated by prerender script
- `robots.txt`: Served at `/robots.txt` for crawler instructions
- `fs-manifest.json`: File system manifest (excluded from robots)

### SEO Tests

Visual and E2E tests verify SEO tags:

- `tests/e2e/robots.e2e.spec.ts`: Verifies robots.txt exists
- `tests/e2e/sitemap.e2e.spec.ts`: Verifies sitemap.xml exists
- `tests/visual/seo/meta-tags.visual.spec.ts`: Screenshots of meta tags

### Build Process

```bash
bun run build     # Builds the React app
bun run prerender # Generates static HTML + sitemap
```

### Desktop App Reordering

Store functions for managing desktop icon positions:

- **reorderDesktopApps**: Reorders app icons while preserving file icon positions
- **mergeDesktopApps**: Merges new app icons without duplicates

Icons maintain sort order: apps > folders > files (alphabetical within each group).

### Launcher Folders

Apps can now be organized into folders in the Launcher:

- **Predefined folders**: Social Links, Office and media, Programming, Games (defined in `launcherFolders.ts`)
- **Custom folders**: Users can create/rename/delete custom folders via MenuEditApp
- **Drag & drop**: Apps can be moved between folders using drag and drop
- **Search**: Filter apps by name, automatically expands all folders when searching
- **Translations**: Predefined folder names are translated via i18n

Key components:

- `LauncherFolder` entity in Domain layer
- `Launcher` component with collapsible folders and search
- `MenuEditApp` for folder management
- `CollapsibleSection` shared component
- Drag & drop system built on `@dnd-kit/core`

New hooks:

- `useFolderName`: Translate predefined folder names
- `useTaskbarHeight`: Measure context menu height for positioning
- `useSearchFilter`: Generic search filtering
- `useCollapsible`: Manage expand/collapse state
- `useDragDrop/*`: Complete drag & drop system

New store state:

- `launcherFolders`: Array of folder entities in desktopStore
- Actions: `setLauncherFolders`, `createLauncherFolder`, `updateLauncherFolder`, `deleteLauncherFolder`, `addAppToFolder`, `removeAppFromFolder`

### Taskbar Context Menu

Right-click on taskbar buttons shows context menu with window controls:

- Minimize, Maximize, Restore, Close
- Dynamic positioning above taskbar
- State-aware options (only shows applicable actions)

### Mantine v9 Upgrade (2025)

Upgraded from Mantine v8 to v9:

- **Breaking changes**: Some component props changed
- **New features**: Improved color scheme handling
- **Migration**: Updated all Mantine imports and usages
- **Tests**: Updated component tests for v9 compatibility

## Docker Architecture

fde-desktop supports running inside Docker containers with full filesystem access and runtime detection.

### Unified Architecture

Both development and production use the **same architecture** with nginx + supervisord + gosu:

```
┌─────────────────────────────────────────────────────────────────┐
│              Unified Architecture (Dev & Prod)                   │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  Entry: root → fix volumes → gosu bun → supervisord            │
│                                                                 │
│  supervisord                                                    │
│  ├── nginx (port 8080) - proxies /api/* to localhost:3001      │
│  ├── api (port 3001) - REST API + WebSocket                     │
│  ├── watcher - Rebuilds apps when ./apps/* changes              │
│  └── [vite] - Dev only: HMR for React code                     │
│                                                                 │
│  Dev:  Source code bind mounted, api runs from src/             │
│  Prod: Bundled server (dist-server/), static files in image     │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

**Key differences:**

| Aspect       | Development                    | Production                       |
| ------------ | ------------------------------ | -------------------------------- |
| API Server   | `packages/core/src/server/index.ts` (source) | `dist-server/index.js` (bundled) |
| Vite process | Yes (HMR)                      | No                               |
| Source code  | Bind mounted                   | Not included                     |
| nginx config | `nginx.dev.conf`               | `nginx.conf`                     |

### gosu for Privilege Management

Containers start as root to fix volume ownership, then drop to `bun` user:

```sh
# entrypoint.sh
# 1. Start as root
# 2. chown -R bun:bun /app/workspace  # Fix Docker volume ownership
# 3. exec gosu bun:bun "$0" "$@"      # Drop privileges
# 4. Run supervisord as bun user
```

### Runtime Detection

The framework automatically detects the runtime environment:

```
┌─────────────────────────────────────────────────────────────────┐
│                    Runtime Detection Flow                        │
│                                                                  │
│  window.__FDE_IN_DOCKER__ = true?                               │
│         │                                                        │
│    YES  │  NO                                                    │
│         ▼         ▼                                              │
│    ┌─────────┐  ┌───────────────────────────┐                   │
│    │ Docker  │  │ navigator.userAgent check │                    │
│    │  Mode   │  │         │                 │                    │
│    └─────────┘  │  Electron?  │  Browser?   │                    │
│                  ▼             ▼             ▼                     │
│              ┌────────┐  ┌─────────┐  ┌─────────┐                │
│              │Electron│  │ Browser │  │ Browser │                 │
│              │  Mode  │  │  Mode   │  │  Mode   │                 │
│              └────────┘  └─────────┘  └─────────┘                 │
└─────────────────────────────────────────────────────────────────┘
```

```typescript
// src/Shared/Utils/getRuntime.ts
export function getRuntime(): 'browser' | 'docker' | 'electron' {
  if (typeof window === 'undefined') return 'browser';
  if ((window as any).__FDE_IN_DOCKER__ === true) return 'docker';
  if (/Electron/i.test(navigator.userAgent)) return 'electron';
  return 'browser';
}
```

### FileSystem Adapter Pattern

The filesystem uses the Adapter pattern from the Ports & Adapters architecture:

```
┌─────────────────────────────────────────────────────────────────┐
│                    Domain Layer                                  │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │  IFileSystem (Port/Interface)                              │ │
│  │  - getNode(id): FSNode                                     │ │
│  │  - createFile(name, content, parentId): FileNode          │ │
│  │  - createFolder(name, parentId): FolderNode               │ │
│  │  - delete(id): void                                        │ │
│  └────────────────────────────────────────────────────────────┘ │
│                           ▲                                      │
│                           │ depends on                           │
└───────────────────────────┼─────────────────────────────────────┘
                            │
┌───────────────────────────┼─────────────────────────────────────┐
│                    Infrastructure Layer                          │
│  ┌─────────────────┐  ┌─────────────────┐  ┌────────────────┐  │
│  │ IndexedDBFS     │  │ DockerFS        │  │ ElectronFS     │  │
│  │ (Browser)       │  │ (Container)      │  │ (Desktop)      │  │
│  │                 │  │                  │  │                │  │
│  │ - IndexedDB API │  │ - fetch('/api') │  │ - Node fs      │  │
│  │ - Blob storage  │  │ - REST endpoints │  │ - electron     │  │
│  └─────────────────┘  └─────────────────┘  └────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
```

### Docker Server Architecture

In Docker mode, supervisord manages all processes:

```
┌─────────────────────────────────────────────────────────────────┐
│                    Docker Container                               │
│                    (Runs as 'bun' user via gosu)                │
│                                                                  │
│  supervisord                                                    │
│  ├── nginx (Port 8080)                                          │
│  │   ├── /           → static files (or Vite proxy in dev)      │
│  │   └── /api/*     → proxy to localhost:3001                   │
│  │                                                              │
│  ├── api-server (Port 3001)                                      │
│  │   ├── REST /api/fs/*                                          │
│  │   └── WebSocket /api/pty                                      │
│  │                                                              │
│  ├── watcher - Rebuilds apps when ./apps/* changes              │
│  │                                                              │
│  └── [vite] (Dev only) - HMR                                    │
│                                                                  │
│  Dev:  source code mounted, api from packages/core/src/server/                 │
│  Prod: bundled server (dist-server/), static files in image     │
└─────────────────────────────────────────────────────────────────┘
```

For detailed Docker implementation, see:

- [docker/architecture.md](./docker/architecture.md) - Complete Docker architecture guide
- [docker/production.md](./docker/production.md) - Production deployment
- [docker/development.md](./docker/development.md) - Development workflow
- [docker/troubleshooting.md](./docker/troubleshooting.md) - Common issues and solutions
