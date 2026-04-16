# API Reference — @fde-desktop/fde-core

Complete reference for every symbol exported by the package.

---

## Components

The package exports ready-to-use UI components for building desktop environments.

### Main Component

#### `FdeDesktop`

The main wrapper component that initializes the desktop environment and handles core app registration:

```tsx
import { FdeDesktop, type FdeDesktopProps } from '@fde-desktop/fde-core';

function App() {
  return (
    <FdeDesktop
      customApps={userApps} // Optional: custom apps
      defaultWallpaper={wallpaperUrl} // Optional: default wallpaper URL
      initialApp="welcome" // Optional: app ID to open on start
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

### Desktop Components

#### `Desktop`

The main desktop area that displays icons and windows:

```tsx
import { Desktop, type DesktopProps } from '@fde-desktop/fde-core';

<Desktop>{/* Desktop icons */}</Desktop>;
```

#### `DesktopIcon`

Individual desktop icon component:

```tsx
import { DesktopIcon, type DesktopIconProps } from '@fde-desktop/fde-core';

<DesktopIcon icon={icon} onDoubleClick={() => openApp(icon.appId)} />;
```

#### `Window`

Window component with drag/resize/minimize/maximize:

```tsx
import { Window } from '@fde-desktop/fde-core';

<Window window={win}>{/* Content rendered by app registry */}</Window>;
```

### System UI

#### `Taskbar`

Taskbar with clock and window buttons:

```tsx
import { Taskbar } from '@fde-desktop/fde-core';

<Taskbar />;
```

#### `Launcher`

Start menu / app launcher:

```tsx
import { Launcher } from '@fde-desktop/fde-core';

<Launcher />;
```

#### `LanguageSelector`

Language selection dropdown:

```tsx
import { LanguageSelector } from '@fde-desktop/fde-core';

<LanguageSelector />;
```

### Menu Components

#### `AppMenuBar`

Menu bar component for apps:

```tsx
import { AppMenuBar } from '@fde-desktop/fde-core';

<AppMenuBar windowId={windowId} />;
```

#### `ContextMenu`

Right-click context menu:

```tsx
import { ContextMenu, CreateItemContextMenu, TaskbarContextMenu } from '@fde-desktop/fde-core';

<ContextMenu items={items} position={position} />
<CreateItemContextMenu />
<TaskbarContextMenu />
```

### Theme Components

#### `ThemeProvider`

Theme context provider:

```tsx
import { ThemeProvider, useTheme, DEFAULT_FDE_THEME } from '@fde-desktop/fde-core';

<ThemeProvider>
  <App />
</ThemeProvider>;

// Access theme in components
const { theme, setTheme, toggleTheme } = useTheme();
```

### Context Providers

#### `FdeProvider`

Global FDE context provider:

```tsx
import { FdeProvider, useFdeContext } from '@fde-desktop/fde-core';

<FdeProvider>
  <App />
</FdeProvider>;

// Access context
const api = useFdeContext();
```

#### `AppReadyProvider`

Context for app-window communication:

```tsx
import { AppReadyProvider, useAppReady } from '@fde-desktop/fde-core';

<AppReadyProvider windowId={windowId}>
  <MyApp />
</AppReadyProvider>;

// In app component
const { notifyReady, getContentData } = useAppReady();
```

### Registry Helpers

App registry functions for managing core and custom apps:

```tsx
import {
  initRegistry,
  getAppComponent,
  getMenuBarBuilder,
  getMenuBarComponent,
  isLazyApp,
  getAppName,
  registerComponents,
  CORE_REGISTRY,
} from '@fde-desktop/fde-core';

// Initialize core registry (called by FdeDesktop)
initRegistry();

// Get app component
const AppComponent = getAppComponent('files');

// Get menu bar component
const MenuBar = getMenuBarComponent('notepad');

// Check if app is lazy-loaded
const lazy = isLazyApp('notepad'); // true

// Get app display name
const name = getAppName('files'); // 'Files'

// Register custom apps
registerComponents(userApps);
```

### Shared Components

#### App UI Components

```tsx
import {
  AppIcon, // App icon display
  AppLoading, // Loading spinner
  AppEmptyState, // Empty state placeholder
  FileIcon, // File/folder icon
  DirtyIndicator, // Unsaved changes indicator
  CollapsibleSection, // Collapsible folder/section
  LanguageFlag, // SVG flag for language selection
  PortraitWarning, // Mobile portrait warning
} from '@fde-desktop/fde-core';
```

#### Input Components

```tsx
import {
  ColorPicker, // Color selection
  IconColorPicker, // Icon color picker
} from '@fde-desktop/fde-core';
```

#### File Handling

```tsx
import {
  FilePickerApp, // File picker modal
  FilePickerModal, // File picker modal variant
  FolderPicker, // Folder picker modal
  CreateItemApp, // Create file/folder modal
  DownloadProgress, // Download progress UI
} from '@fde-desktop/fde-core';
```

#### Custom App Loading

```tsx
import {
  CustomAppLoader, // Dynamic app loader
  CustomAppLoadingScreen, // Loading screen
  CustomAppNotSupported, // Not supported message
  CustomAppOffline, // Offline message
} from '@fde-desktop/fde-core';
```

#### External Links

```tsx
import { ExternalLinkApp } from '@fde-desktop/fde-core';

// Opens external URLs in new tabs
<ExternalLinkApp url="https://example.com" title="Example" />;
```

---

## Apps

### Constants

| Export          | Type         | Description                               |
| --------------- | ------------ | ----------------------------------------- |
| `CORE_APPS`     | `AppEntry[]` | Array of all core apps                    |
| `CORE_APP_IDS`  | `string[]`   | App IDs for core apps                     |
| `EXTRA_APPS`    | `AppEntry[]` | Host-app-only apps (reference only)       |
| `EXTRA_APP_IDS` | `string[]`   | App IDs for extra apps                    |
| `APPS`          | `AppEntry[]` | Combined array (`CORE_APPS + EXTRA_APPS`) |
| `APP_IDS`       | `Record`     | All app ID constants keyed by name        |

### Individual App Entries

All of these are `AppEntry` objects with `id`, `name`, `icon`, `fcIcon`, `defaultWidth`, `defaultHeight`, etc.

| Export           | App ID         |
| ---------------- | -------------- |
| `FilesApp`       | `files`        |
| `SettingsApp`    | `settings`     |
| `NotepadApp`     | `notepad`      |
| `ImageViewerApp` | `image-viewer` |
| `PdfApp`         | `pdf`          |
| `UploaderApp`    | `uploader`     |
| `MenuEditApp`    | `menuedit`     |
| `DeviceInfoApp`  | `device-info`  |
| `CalendarApp`    | `calendar`     |
| `TerminalApp`    | `terminal`     |
| `CodeServerApp`  | `code-server`  |

> **Note**: Core apps also export React components under the same names. These components accept `WindowContentProps`.

### Lazy App Components

For code-splitting, use the lazy variants:

```tsx
import {
  FilesAppLazy,
  NotesAppLazy,
  ImageViewerAppLazy,
  PdfAppLazy,
  MenuEditAppLazy,
  UploaderAppLazy,
  SettingsAppLazy,
  DeviceInfoAppLazy,
  CalendarAppLazy,
  CreateItemAppLazy,
} from '@fde-desktop/fde-core';
```

### Menu Bar Components

Each app with a menu bar exports its component:

```tsx
import {
  NotesMenuBar,
  SettingsMenuBar,
  PdfMenuBar,
  ImageViewerMenuBar,
  MenuEditMenuBar,
  TerminalMenuBar,
} from '@fde-desktop/fde-core';
```

### Usage

```typescript
import { CORE_APPS, FilesApp, CORE_APP_IDS } from '@fde-desktop/fde-core';

// Open by ID
openApp('files');

// Iterate all core apps
CORE_APPS.forEach(app => console.log(app.id, app.name));

// Check an ID
if (appId === CORE_APP_IDS.FILES) { ... }
```

---

## Stores

### `useDesktopStore`

Main store for desktop state. Uses Zustand with `persist` middleware (key: `fde-desktop`).

```typescript
import { useDesktopStore } from '@fde-desktop/fde-core';
```

#### State

| Property               | Type                  | Description                            |
| ---------------------- | --------------------- | -------------------------------------- |
| `windows`              | `WindowEntity[]`      | All open windows                       |
| `icons`                | `DesktopIconEntity[]` | Desktop icons                          |
| `fsNodes`              | `FSNode[]`            | Virtual file system nodes              |
| `clipboard`            | `ClipboardState`      | Copy/cut clipboard                     |
| `filesCurrentFolderId` | `string \| null`      | Active folder in Files app             |
| `contextMenu`          | `ContextMenuState`    | Context menu (position, items, target) |
| `notifications`        | `NotificationItem[]`  | System notifications                   |
| `launcherFolders`      | `LauncherFolder[]`    | Launcher folders (predefined + custom) |

#### Window Actions

| Action                    | Signature                                                          |
| ------------------------- | ------------------------------------------------------------------ |
| `openWindow`              | `(input: WindowInput) => void`                                     |
| `closeWindow`             | `(id: string) => void`                                             |
| `minimizeWindow`          | `(id: string) => void`                                             |
| `maximizeWindow`          | `(id: string) => void`                                             |
| `restoreWindow`           | `(id: string) => void`                                             |
| `focusWindow`             | `(id: string) => void`                                             |
| `moveWindow`              | `(id: string, x: number, y: number) => void`                       |
| `resizeWindow`            | `(id: string, w: number, h: number, x: number, y: number) => void` |
| `updateWindowContentData` | `(id: string, data: Record<string, unknown>) => void`              |

#### Icon Actions

| Action               | Signature                                    |
| -------------------- | -------------------------------------------- |
| `addIcon`            | `(icon: DesktopIconInput) => void`           |
| `removeIcon`         | `(id: string) => void`                       |
| `moveIcon`           | `(id: string, x: number, y: number) => void` |
| `mergeDesktopApps`   | `(icons: DesktopIconInput[]) => void`        |
| `reorderDesktopApps` | `(orderedIds: string[]) => void`             |

#### File System Actions

| Action         | Signature                                            |
| -------------- | ---------------------------------------------------- |
| `createFile`   | `(name, content, parentId?) => Promise<FileNode>`    |
| `createFolder` | `(name, parentId?) => Promise<FolderNode>`           |
| `deleteNode`   | `(id: string) => Promise<void>`                      |
| `renameNode`   | `(id: string, name: string) => Promise<void>`        |
| `moveNode`     | `(id: string, newParentId: string) => Promise<void>` |
| `initFs`       | `() => Promise<void>`                                |

#### Standalone exports

```typescript
import { fileSystem, resetFileSystem, resetWindowManager } from '@fde-desktop/fde-core';

// fileSystem: singleton IndexedDBFileSystem instance
await fileSystem.initialize();

// resetFileSystem: replaces the fileSystem singleton (testing)
// resetWindowManager: replaces the window manager singleton (testing)
```

---

### `useSettingsStore`

User preferences and theme. Persisted to `localStorage` under `fde-desktop:settings`.

```typescript
import { useSettingsStore } from '@fde-desktop/fde-core';
```

#### State

| Property            | Type                        | Description                        |
| ------------------- | --------------------------- | ---------------------------------- |
| `wallpaper`         | `string \| null`            | Background image URL               |
| `wallpaperModule`   | `string`                    | Wallpaper module ID                |
| `launcherIcon`      | `string`                    | Icon name for the start button     |
| `font`              | `string`                    | Selected font family               |
| `downloadedFonts`   | `string[]`                  | Downloaded Google Fonts            |
| `fontSize`          | `number`                    | UI font size in px                 |
| `animationDuration` | `number`                    | Framer Motion duration multiplier  |
| `theme`             | `Theme`                     | Current theme object               |
| `themeSetManually`  | `boolean`                   | Whether user overrode system theme |
| `customThemeColors` | `CustomThemeColors \| null` | Custom color overrides             |
| `language`          | `SupportedLanguage`         | UI language (`'en'` \| `'es'`)     |

#### Actions

| Action                 | Signature                                     |
| ---------------------- | --------------------------------------------- |
| `setWallpaper`         | `(url: string \| null) => void`               |
| `setFont`              | `(font: string) => void`                      |
| `setFontSize`          | `(size: number) => void`                      |
| `setThemeMode`         | `(mode: ThemeMode) => void`                   |
| `toggleTheme`          | `() => void`                                  |
| `setThemeAutomatic`    | `() => void`                                  |
| `applySystemTheme`     | `(mode: ThemeMode) => void`                   |
| `setCustomThemeColors` | `(colors: CustomThemeColors \| null) => void` |
| `setLanguage`          | `(lang: SupportedLanguage) => void`           |
| `markFontDownloaded`   | `(fontName: string) => void`                  |
| `setAnimationDuration` | `(duration: number) => void`                  |

---

### `useCustomAppStore`

Manages custom (dynamic) apps loaded at runtime in Docker mode.

```typescript
import { useCustomAppStore } from '@fde-desktop/fde-core';
```

| Property / Action | Description                      |
| ----------------- | -------------------------------- |
| `customApps`      | Loaded custom app manifests      |
| `isLoading`       | Whether apps are being loaded    |
| `error`           | Error state if loading failed    |
| `loadCustomApps`  | Fetch manifests from `/api/apps` |
| `registerApp`     | Register a custom app at runtime |
| `unregisterApp`   | Remove a custom app              |

---

### `useAppTempMemoryStore`

Temporary snapshots for `useIsDirty` dirty-state tracking. Persisted under `fde-desktop:appTempMemory`.

```typescript
import { useAppTempMemoryStore } from '@fde-desktop/fde-core';

const { setSnapshot, getSnapshot, clearSnapshot } = useAppTempMemoryStore.getState();
```

---

## Hooks

```typescript
import { useOpenApp, useNotifications, ... } from '@fde-desktop/fde-core';
```

### `useOpenApp`

Open an app by ID. Returns a function:

```typescript
const openApp = useOpenApp();

openApp('files');
openApp('notepad', { contentData: { initialContent: '# Hello' } });
openApp('pdf', { contentData: { src: 'https://example.com/file.pdf' } });
```

### `useNotifications`

```typescript
const { showNotification, hideNotification } = useNotifications();

const id = showNotification({
  title: 'Success',
  message: 'Done!',
  type: 'success', // 'success' | 'error' | 'info'
  fcIcon: 'FcCheckmark', // optional react-icons/fc icon
});

hideNotification(id);
```

### `useSystemTheme`

Detects the OS color scheme and keeps the settings store in sync if `themeSetManually` is false:

```typescript
const { systemTheme } = useSystemTheme(); // 'light' | 'dark'
```

### `useClock`

```typescript
const { time, date } = useClock(); // formatted strings updated every minute
```

### `useDeviceDetection`

```typescript
const { isMobile, isTablet, isDesktop, screenSize } = useDeviceDetection();
```

### `useDownload`

Stream an HTTP download with progress tracking:

```typescript
const { download, progress, isDownloading } = useDownload();

await download({ url: '/file.zip', filename: 'file.zip' });
// progress: { loaded: number, total: number, percent: number }
```

### `useResolvedUrl`

Resolves `idb://` URLs (files stored in IndexedDB) to temporary blob URLs for display:

```typescript
const blobUrl = useResolvedUrl(file.url); // null if not resolved yet
// Use blobUrl as <img src> or <a href>
```

### `useIsDirty`

Track unsaved changes by comparing current state against a snapshot:

```typescript
const { isDirty, takeSnapshot } = useIsDirty({
  snapshotRef, // React.MutableRefObject<string | null>
  getCurrentState: () => content,
  initialSnapshot: '',
  appId: win?.id, // for persistence across mounts
});
```

### `useContextMenu`

```typescript
const { open, close, isOpen, position, items } = useContextMenu();
```

### `useCollapsible`

```typescript
const { isOpen, toggle, open, close } = useCollapsible(defaultOpen);
```

### `useSearchFilter`

```typescript
const filtered = useSearchFilter(items, query, item => item.name);
```

### `useApplyFont`

Applies the currently selected font (from `settingsStore`) to the document body. Call once at the app root:

```typescript
useApplyFont();
```

### `useFontDownload`

Download a Google Font by name:

```typescript
const { download, isDownloading } = useFontDownload();
await download('Inter');
```

### `useLanguageSync`

Keeps the i18next instance in sync with `settingsStore.language`. Call once at the root:

```typescript
useLanguageSync();
```

### `useAppName`

Get the translated name for an app by ID:

```typescript
const name = useAppName('files'); // 'Files' | 'Archivos'
```

### `useFolderName`

Get the translated name for a predefined launcher folder:

```typescript
const name = useFolderName(folder); // translated string
```

### `useAnimationDuration`

Get the current animation duration from settings:

```typescript
const duration = useAnimationDuration(); // number (seconds)
```

### `useAdaptiveDimensions`

Returns window dimensions adjusted to viewport:

```typescript
const { width, height } = useAdaptiveDimensions({ defaultWidth: 800, defaultHeight: 600 });
```

### `useFdeApi`

Access the `window.__FDE_API__` object (for custom apps running inside fde-desktop):

```typescript
const fde = useFdeApi();
fde?.openApp('files');
```

### `useCustomAppHMR`

Enables Hot Module Replacement for custom apps in Docker mode. Call once at the root:

```typescript
useCustomAppHMR();
```

### Icon hooks

```typescript
// react-icons/fc
const { icon } = useFcIcon('FcHome');
const element = useFcIconElement('FcHome', { size: 24 });

// react-icons/fi (Feather)
const { icon } = useFiIcon('FiFile');

// react-icons/vsc (VS Code)
const { icon } = useVscIcon('VscFile');

// Generic (tries fc, then fi, then vsc)
const { icon } = useDynamicIcon('FcHome');
```

### `useJsDos`

For loading DOS game bundles in the DOS emulator app. See `DosEmulatorApp` for usage.

### `useTaskbarContextMenu`

Manages right-click context menu on taskbar buttons:

```typescript
const { open, close, isOpen, position } = useTaskbarContextMenu();
```

### `useTaskbarHeight`

Get the measured taskbar height in pixels:

```typescript
const height = useTaskbarHeight();
```

### `useWindowButtonRegistry`

Tracks the DOM position of taskbar buttons for minimize animations:

```typescript
const { register, unregister, getButtonRect } = useWindowButtonRegistry();
```

---

## Domain Entities

Factories for creating domain objects:

```typescript
import { createWindow, createDesktopIcon, createLauncherFolder } from '@fde-desktop/fde-core';
```

### `createWindow(input: WindowInput): WindowEntity`

```typescript
const win = createWindow({
  title: 'My Window',
  appId: 'my-app', // maps to AppRegistry
  x: 100,
  y: 100,
  width: 800,
  height: 600,
  contentData: { src: 'some-value' },
});
```

### `createDesktopIcon(input: DesktopIconInput): DesktopIconEntity`

```typescript
const icon = createDesktopIcon({
  appId: 'files',
  x: 20,
  y: 20,
  name: 'Files',
  fcIcon: 'FcFolder',
});
```

### `createLauncherFolder`

```typescript
const folder = createLauncherFolder({
  name: 'Productivity',
  appIds: ['notepad', 'files'],
  isPredefined: false,
});
```

---

## Types & Interfaces

```typescript
import type {
  AppEntry,
  WindowEntity,
  WindowContentProps,
  FSNode,
  FileNode,
  FolderNode,
  IFileSystem,
  AppMenuElement,
  AppRegistration,
  MenuBarBuilder,
  MenuBarComponentProps,
  DesktopState,
  NotificationItem,
  ClipboardState,
  CustomThemeColors,
} from '@fde-desktop/fde-core';
```

### `AppEntry`

```typescript
interface AppEntry {
  id: string;
  name: string;
  icon: string; // emoji fallback
  fcIcon?: string; // react-icons/fc name
  defaultWidth: number;
  defaultHeight: number;
  minWidth?: number;
  minHeight?: number;
  canMaximize?: boolean;
  alwaysOnTop?: boolean;
  hasContextMenu?: boolean;
}
```

### `WindowEntity`

```typescript
interface WindowEntity {
  id: string;
  title: string;
  content: string; // app ID
  x: number;
  y: number;
  width: number;
  height: number;
  zIndex: number;
  isMinimized: boolean;
  isMaximized: boolean;
  alwaysOnTop: boolean;
  contentData?: Record<string, unknown>;
  fcIcon?: string;
}
```

### `WindowContentProps`

```typescript
interface WindowContentProps {
  window?: WindowEntity;
  notifyReady?: (contentData?: Record<string, unknown>) => void;
}
```

### `FSNode`

Union type: `FileNode | FolderNode`.

```typescript
interface FileNode {
  id: string;
  name: string;
  type: 'file';
  parentId: string | null;
  mimeType: string;
  url: string; // 'idb://<hash>' for IndexedDB, path for Docker
  size: number;
  createdAt: number;
}

interface FolderNode {
  id: string;
  name: string;
  type: 'folder';
  parentId: string | null;
  createdAt: number;
}
```

### `AppMenuElement`

```typescript
type AppMenuElement =
  | { type: 'menu'; label: string; icon?: string; items: AppMenuElement[] }
  | { type: 'item'; label: string; icon?: string; onClick: () => void; disabled?: boolean }
  | { type: 'divider' }
  | { type: 'switch'; label: string; checked: boolean; onChange: (v: boolean) => void }
  | {
      type: 'slider';
      label?: string;
      min: number;
      max: number;
      value: number;
      onChange: (v: number) => void;
    }
  | {
      type: 'select';
      label?: string;
      options: { value: string; label: string }[];
      value: string;
      onChange: (v: string) => void;
    }
  | {
      type: 'number-input';
      label?: string;
      min: number;
      max: number;
      step?: number;
      value: number;
      onChange: (v: number) => void;
    }
  | { type: 'text-input'; placeholder?: string; value: string; onChange: (v: string) => void }
  | { type: 'dirty-indicator' };
```

---

## Infrastructure

### `IndexedDBFileSystem`

Browser-based file system persisted in IndexedDB:

```typescript
import { IndexedDBFileSystem } from '@fde-desktop/fde-core';

const fs = new IndexedDBFileSystem();
await fs.initialize();

const folder = await fs.createFolder('Documents');
const file = await fs.createFile('notes.txt', 'Hello!', folder.id);
const nodes = await fs.getAllNodes();
```

**Singleton**: The package also exports a pre-created singleton:

```typescript
import { fileSystem } from '@fde-desktop/fde-core';
```

### `DockerFileSystemAdapter`

REST-based file system for Docker mode (uses `/api/fs/*`):

```typescript
import { DockerFileSystemAdapter } from '@fde-desktop/fde-core';

const fs = new DockerFileSystemAdapter();
await fs.initialize();
```

### `FdeApiAdapter`

The global `window.__FDE_API__` implementation. Exposes window management, notifications, file system, and events to custom apps:

```typescript
import { FdeApiAdapter } from '@fde-desktop/fde-core';
```

Register it on `window.__FDE_API__` to allow custom apps (loaded in iframes or containers) to communicate with the desktop.

---

## Utils

```typescript
import {
  generateUUID,
  uuidv4, // UUID generation
  getRuntime,
  isDocker,
  isBrowser,
  isElectron,
  isDev, // runtime detection
  formatBytes, // '1.2 MB'
  getFileExtension, // 'pdf' from 'report.pdf'
  getMimeTypeFromExtension, // 'application/pdf'
  getAppIdForMime, // 'pdf' from 'application/pdf'
  sortNodes, // sort file system nodes
  buildBreadcrumbs, // [{ id, name }] path to a node
  isNewerVersion, // semver comparison
  clearBrowserData, // clear localStorage + IndexedDB
  waitForContainer, // poll for DOM element by ID
  getBaseUrl,
  resolveUrl, // base URL for API calls
  hashBlob, // SHA-256 hash a Blob
  getFourRandomColors, // generate 4 random hex colors
} from '@fde-desktop/fde-core';
```

### Runtime detection

```typescript
const runtime = getRuntime(); // 'browser' | 'docker' | 'electron'

isDocker(); // window.__FDE_IN_DOCKER__ === true
isBrowser(); // runtime === 'browser'
isElectron(); // navigator.userAgent contains 'Electron'
isDev(); // import.meta.env.DEV
```

### `waitForContainer`

Polls for a DOM element by ID, useful for custom apps:

```typescript
const container = await waitForContainer('app-container-my-app', 10000);
```

---

## Constants

```typescript
import {
  DEFAULT_WINDOW_DIMENSIONS, // { defaultWidth: 800, defaultHeight: 600, minWidth: 640, minHeight: 480 }
  DEFAULT_THEME_COLORS, // Default light/dark color palette
  ICON_COLUMN_WIDTH, // 80
  ICON_ROW_HEIGHT, // 80
  ICON_MARGIN, // 20
  TASKBAR_HEIGHT, // 48
  DEFAULT_VIEWPORT_WIDTH, // 1280
  DEFAULT_VIEWPORT_HEIGHT, // 720
  BREAKPOINTS, // { mobile: 480, tablet: 768, desktop: 1024 }
  ANIMATION_DURATION, // 0.3 (seconds)
  AVAILABLE_FONTS, // string[] of Google Font names
  FONT_STACKS, // Record<string, string> CSS font stacks
  GOOGLE_FONTS_HREF, // Google Fonts CDN base URL
  PRESET_COLORS, // string[] predefined color values
  PRESET_ICONS, // string[] predefined fc icon names
  DEFAULT_LAUNCHER_FOLDERS, // Predefined launcher folder definitions
  CUSTOM_APPS_FOLDER_ID, // ID for the custom apps folder
  APP_IDS, // Record<string, string> all app IDs
} from '@fde-desktop/fde-core';
```

### Animation helpers

```typescript
import {
  createWindowVariants, // factory for open/close variants
  createEaseIn,
  createEaseOut,
  randomWindowPosition, // { x, y } within viewport
  centerWindowPosition, // { x, y } centered in viewport
  windowVariants, // default window animation variants
  panelVariants, // panel slide variants
} from '@fde-desktop/fde-core';
```

---

## i18n

```typescript
import { i18n } from '@fde-desktop/fde-core';
```

Pre-configured `i18next` instance with:

- Languages: `en` (default), `es`
- Auto language detection via `i18next-browser-languagedetector`
- Namespaces: `common`, `apps`, `settings`, `window`, `contextMenu`, `notifications`, `welcome`, `notes`

Wrap your app with `I18nextProvider` from `react-i18next` and pass this instance.
