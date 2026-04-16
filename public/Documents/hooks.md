# Hooks

Here's all the custom hooks in the project. Each one does a specific thing and they're meant to be reused across components.

## Available Hooks

### useOpenApp

The most important hook if you want to open an app. Returns a function that takes the app ID and optional additional data.

```typescript
const openApp = useOpenApp();

// Open with simple ID
openApp('notepad');

// Open with custom data
openApp('notepad', { contentData: { initialText: 'Hello!' } });
```

Looks up the app in the `APPS` registry, generates a random position for the window, and calls `openWindow` on the store.

**Location**: `packages/core/src/hooks/useOpenApp.ts`

---

### useClock

Returns the current time formatted as HH:MM. Updates every second.

```typescript
const time = useClock(); // "14:35"
```

Useful for showing the clock in the taskbar.

**Location**: `packages/core/src/hooks/useClock.ts`

---

### useSystemTheme

Automatically detects the OS theme (light/dark) and returns the current theme. Also allows changing it manually.

```typescript
const { theme, toggleTheme, setThemeMode } = useSystemTheme();
```

Listens to the browser's `prefers-color-scheme` event. If the user manually changes the theme, it saves that preference and stops following the system.

**Location**: `packages/core/src/hooks/useSystemTheme.ts`

---

### useNotifications

Manages system notifications. Returns the notifications array and functions to add/remove.

```typescript
const { notifications, notify, dismiss } = useNotifications();

// Add a notification
const id = notify('Title', 'Message', { fcIcon: 'FcInfo' });

// Dismiss a notification
dismiss(id);
```

Notifications appear somewhere in the UI and can be closed manually or automatically.

**Location**: `packages/core/src/hooks/useNotifications.ts`

---

### useFcIcon

Dynamically loads an icon from `react-icons/fc` by name. Uses lazy loading to not load icons that aren't used. Internally uses the centralized `useDynamicIcon` hook.

```typescript
const IconComponent = useFcIcon('FcHome');
// Returns the component, use it like: <IconComponent size={24} />
```

**Location**: `packages/core/src/hooks/useFcIcon.ts`

---

### useFcIconElement

Same as `useFcIcon` but returns the already rendered element instead of the component.

```tsx
const iconElement = useFcIconElement('FcHome', { size: 24 });
```

**Location**: Another export in `useFcIcon`.

---

### useContextMenu

Manages local context menus (right click). Returns the state and functions to open/close.

```typescript
const { opened, position, open, close } = useContextMenu();

const handleRightClick = (e: MouseEvent) => {
  e.preventDefault();
  open(e);
};
```

**Location**: `packages/core/src/hooks/useContextMenu.ts`

---

### useAppUpdate

Checks for app updates by comparing the current version with the one stored in localStorage. In web mode, it fetches `version.json` and shows a notification to reload. In Electron mode, it checks GitHub releases and offers to download the latest version.

```typescript
useAppUpdate(); // Used in the root component, doesn't return anything useful
```

**Location**: `packages/core/src/hooks/useAppUpdate.ts`

---

### useDownload

Hook for tracking streamed HTTP downloads with real-time progress. Returns status, loaded/total bytes, percent complete, and error state.

```typescript
const { status, loaded, total, percent, error, download, reset } = useDownload();

// Start download
const text = await download('https://example.com/file.txt');

// status: 'idle' | 'downloading' | 'done' | 'error'
// percent: 0-100 or null if Content-Length unknown
```

Useful for downloading version.json or other resources with progress tracking.

**Location**: `packages/core/src/hooks/useDownload.ts`

---

### useApplyFont

Applies the currently selected font stack to the document root and manages Google Fonts loading. Automatically re-injects font links when downloaded fonts change.

```typescript
useApplyFont(); // No return value, applies side effects

// Also exports:
import { FONT_STACKS, GOOGLE_FONTS_HREF } from '@/Shared/Constants/Fonts';
```

Used in the root component to apply user-selected fonts globally.

**Location**: `packages/core/src/hooks/useApplyFont.ts`

---

### useLanguageSync

Keeps the Zustand store language and i18next synchronized. Used in the root App component to ensure language preferences persist correctly.

```typescript
useLanguageSync(); // No return value, applies side effects
```

**What it does:**

1. Listens to language changes in the settings store
2. Syncs i18next's language with the store
3. Saves language to localStorage (`fde-desktop:language`) for persistence

**Location**: `packages/core/src/hooks/useLanguageSync.ts`

---

### useAppName

Returns the translated name for an app given its ID. Uses the `apps` namespace for translations.

```typescript
const appName = useAppName('settings'); // Returns translated "Settings"
const appName = useAppName('notepad'); // Returns translated "Notepad"
const appName = useAppName('unknown-app'); // Returns "unknown-app" (fallback)
const appName = useAppName(undefined); // Returns empty string
```

The hook maps app IDs to translation keys internally and handles unknown IDs gracefully.

**Location**: `packages/core/src/hooks/useAppName.ts`

---

### useIsDirty

Reusable hook for tracking unsaved changes. Compares current state against a stored snapshot and persists the snapshot to `AppTempMemory` store.

```typescript
const { isDirty, takeSnapshot, reset } = useIsDirty({
  snapshotRef: myRef,
  getCurrentState: () => myState,
  initialSnapshot: initialValue,
  onChange: dirty => console.log(dirty),
  appId: 'my-app', // Optional: persists snapshot across sessions
});
```

- **isDirty**: Boolean indicating whether state has changed from the snapshot
- **takeSnapshot()**: Save current state as the clean baseline
- **reset()**: Clear dirty flag without changing the snapshot

**Location**: `packages/core/src/hooks/useIsDirty.ts`

---

### useFiIcon / useFiIconElement

Loads icons from `react-icons/fi` (Feather Icons). All icon hooks share the same `useDynamicIcon` internals.

```typescript
const IconComponent = useFiIcon('FiHome');
// Returns the component, use it like: <IconComponent size={24} />

const iconElement = useFiIconElement('FiHome', { size: 24 });
// Returns the already rendered element
```

Also exports `useFcIcon`, `useFcIconElement`, `useVscIcon`, `useVscIconElement` from the same module.

**Location**: `packages/core/src/hooks/useDynamicIcon.ts` (re-exported from `useFcIcon.ts`)

---

### useWindowButtonRegistry

It's a Context Provider that stores the position of taskbar buttons. This enables smooth "flying" animations from the window to the button when minimizing.

```tsx
// In the Window component:
<WindowButtonRegistryProvider windowId={id}>
  <Window ... />
</WindowButtonRegistryProvider>
```

**Location**: `packages/core/src/hooks/useWindowButtonRegistry.tsx`

---

### useResolvedUrl

Resolves `idb://` URLs (files stored in IndexedDB) into temporary blob URLs that the browser can display. For regular URLs (`http://`, relative paths), it returns them as-is.

```typescript
const resolvedUrl = useResolvedUrl(file?.url);
// 'idb://abc123' → 'blob:http://localhost:5173/...'
// 'https://example.com/img.png' → 'https://example.com/img.png'
// undefined → undefined
```

Handles blob URL lifecycle automatically — creates the blob URL on mount and revokes it on unmount or when the source URL changes.

Used by `ImageViewerApp`, `PdfApp`, and any component that displays files stored in IndexedDB.

**Location**: `packages/core/src/hooks/useResolvedUrl.ts`

---

### useVscIcon / useVscIconElement

Same pattern as `useFcIcon` and `useFiIcon`, but loads icons from `react-icons/vsc` (VSCode icons).

```typescript
const IconComponent = useVscIcon('VscFile');
// Returns the component, use it like: <IconComponent size={24} />

const iconElement = useVscIconElement('VscFile', { size: 24 });
// Returns the already rendered element
```

**Location**: `packages/core/src/hooks/useDynamicIcon.ts` (re-exported from `useFcIcon.ts`)

---

### useFolderName

Returns the translated name for predefined folders (Games, Office, etc.) or the original name for custom folders.

```typescript
const folderName = useFolderName(folder);
// Predefined: { id: 'launcher-folder-games', name: 'Games', isPredefined: true }
//   → Returns translated "Games" (via apps:folders.games)
// Custom: { id: 'uuid', name: 'My Folder', isPredefined: false }
//   → Returns "My Folder" (no translation)
```

Uses i18n to translate predefined folder names while preserving custom folder names as-is. The hook checks `folder.isPredefined` and looks up the translation key from `FOLDER_ID_TO_TRANSLATION_KEY`.

**Location**: `packages/core/src/hooks/useFolderName.ts`

---

### useTaskbarHeight

Measures the height of a context menu for dynamic positioning above the taskbar. Returns a ref to attach to the menu element and the measured height.

```typescript
const { menuRef, menuHeight } = useTaskbarHeight(opened);

// Use menuRef on the menu element
<div ref={menuRef} style={{ bottom: menuHeight + TASKBAR_HEIGHT }}>
  {/* menu content */}
</div>
```

Uses `useLayoutEffect` to measure after the menu renders. Useful for positioning context menus dynamically based on their content.

**Location**: `packages/core/src/hooks/useTaskbarHeight.ts`

---

### useSearchFilter

Generic hook for filtering items by search query. Works with any item type and customizable search text extraction.

```typescript
const filteredApps = useSearchFilter(apps, searchQuery, app => app.name);
const filteredFolders = useSearchFilter(folders, searchQuery, folder => folder.name);
```

- Returns all items if search query is empty
- Case-insensitive matching
- Memoized for performance

**Location**: `packages/core/src/hooks/useSearchFilter.ts`

---

### useCollapsible

Manages expand/collapse state for collapsible sections (like folders in the Launcher).

```typescript
const { expanded, toggle, expand, collapse, expandAll, collapseAll, isExpanded } = useCollapsible();

// Toggle a single item
toggle('folder-1');

// Check if expanded
if (isExpanded('folder-1')) {
  /* ... */
}

// Expand multiple items at once
expandAll(['folder-1', 'folder-2', 'folder-3']);

// Collapse all
collapseAll();
```

Returns a Set of expanded item IDs and functions to manipulate it. Used by the Launcher to manage folder expansion state.

**Location**: `packages/core/src/hooks/useCollapsible.ts`

---

### useDragDrop (Drag & Drop System)

A complete drag and drop system built on `@dnd-kit/core`. Provides hooks and components for dragging apps between folders in the Launcher and MenuEditApp.

```typescript
// Wrap your app with DragDropProvider
<DragDropProvider onDrop={handleDrop}>
  <MyComponent />
  <DragOverlayComponent />
</DragDropProvider>

// Make items draggable
const { attributes, listeners, setNodeRef, isDragging, style } = useDraggableItem({
  item: { type: 'app', id: 'notepad', name: 'Notepad', sourceId: 'folder-1', sourceType: 'launcher-folder' },
  disabled: false,
});

// Make areas droppable
const { setNodeRef, isOver, active } = useDroppableArea({
  target: { type: 'launcher-folder', id: 'folder-2', name: 'Office', accepts: ['app'] },
});

// Access drag state from anywhere in the provider tree
const { activeItem, overTarget } = useDragDropState();
```

**Types:**

- `DragItemType`: 'app' | 'file' | 'folder'
- `DropTargetType`: 'launcher-folder' | 'filesystem-folder' | 'desktop' | 'available-apps'
- `DragItemData`: Item being dragged (type, id, name, source info, metadata)
- `DropTarget`: Drop target definition (type, id, name, accepts)

**Custom Modifier:**

- `snapCenterToCursor`: Centers the drag overlay on the cursor position for better UX

**Location**: `packages/core/src/hooks/useDragDrop/`

---

### useFdeApi

Returns the `__FDE_API__` interface for dynamic apps. Provides access to desktop functionality like `openApp`, `closeWindow`, `showNotification`, etc.

```typescript
const api = useFdeApi();

if (api) {
  api.openApp('files');
  api.showNotification({ title: 'Hello', message: 'World' });
}
```

Returns `null` if the API hasn't been initialized (non-Docker environments).

**Location**: `packages/core/src/hooks/useFdeApi.ts`

---

### useJsDos

Hook for interacting with the js-dos emulator in DOS games. Provides `dosInstance` and `bundlePath` loading.

```typescript
const { dosInstance, createDos } = useJsDos();
```

Used by `DosEmulatorApp` to manage DOS games.

**Location**: `packages/core/src/hooks/useJsDos.ts`

---

### useDeviceDetection

Detects device type (mobile, tablet, desktop) and screen orientation. Returns an object with boolean flags.

```typescript
const { isMobile, isTablet, isDesktop, isPortrait, shouldShowWarning, screenWidth, screenHeight } =
  useDeviceDetection();

if (shouldShowWarning) {
  // Show "not optimized for mobile" warning
}
```

Used for responsive layouts and mobile warnings.

**Location**: `packages/core/src/hooks/useDeviceDetection.ts`

---

### useAdaptiveDimensions

Returns adaptive window dimensions based on screen size. Different defaults for mobile, tablet, desktop, and large desktop.

```typescript
const { defaultWidth, defaultHeight, minWidth, minHeight } = useAdaptiveDimensions();
```

Used by windows to get appropriate sizes for different devices.

**Location**: `packages/core/src/hooks/useAdaptiveDimensions.ts`

---

### useTaskbarContextMenu

Manages the taskbar button right-click context menu (minimize, maximize, restore, close).

```typescript
const { opened, position, open, close } = useTaskbarContextMenu();
```

**Location**: `packages/core/src/hooks/useTaskbarContextMenu.ts`

---

### useFontDownload

Handles downloading and caching Google Fonts. Downloads fonts by URL and stores them in IndexedDB.

```typescript
const { downloadedFonts, downloadFont, isDownloading } = useFontDownload();
```

Used by Settings app to download custom fonts.

**Location**: `packages/core/src/hooks/useFontDownload.ts`

---

### useAnimationDuration

Returns animation duration based on user preferences (for reduced motion support).

```typescript
const duration = useAnimationDuration(); // Returns milliseconds
```

Respects `prefers-reduced-motion` media query.

**Location**: `packages/core/src/hooks/useAnimationDuration.ts`

---

### useCustomAppHMR

Hot Module Replacement for custom apps in Docker mode. Listens for WebSocket messages from the server and triggers app reloads when custom apps change.

```typescript
// Automatically connects in Docker mode
// Handles reload, app-registered, app-unregistered events
useCustomAppHMR();
```

Used internally by `CustomAppLoader` to handle custom app hot reloading.

**Location**: `packages/core/src/hooks/useCustomAppHMR.ts`

---

### useMenuBarUtils

Utility functions for menu bar handling. Provides helper functions used by menu bar builders.

```typescript
const { buildMenuStructure, handleMenuAction } = useMenuBarUtils();
```

Used by apps with complex menu structures.

**Location**: `packages/core/src/hooks/useMenuBarUtils.ts`

---

## notifyReady (Not a Hook, But Important)

While not a hook, `notifyReady` is a callback passed to app components via `WindowContentProps`. Use it to communicate from your app to the window/menu bar:

```tsx
const MyApp: FC<WindowContentProps> = ({ window: win, notifyReady }) => {
  useEffect(() => {
    notifyReady?.({
      actions: { save: handleSave, open: handleOpen },
      isDirty,
      setPickerOpen: () => setPickerOpen(true),
    });
  }, [win, notifyReady, isDirty]);

  return <div>...</div>;
};
```

The menu bar builder reads these values from `window.contentData` to enable/disable items, call actions, etc.

---

## Example: How to Use a Hook

```tsx
import { useOpenApp } from '../Hooks/useOpenApp';

function MyComponent() {
  const openApp = useOpenApp();

  return <button onClick={() => openApp('calendar')}>Open Calendar</button>;
}
```

## Creating a New Hook

If you need to create a new hook:

1. Create the file in `packages/core/src/hooks/myNewHook.ts`
2. Follow project conventions:
   - Name with `use` prefix (required in React)
   - Export the function directly
   - Add tests in `*.test.ts` or `*.test.tsx`
3. Document what it does in a comment (even if brief)

```typescript
// packages/core/src/hooks/useMyNewHook.ts
import { useState, useCallback } from 'react';

export function useMyNewHook() {
  const [state, setState] = useState(null);

  const action = useCallback(() => {
    // does something
  }, []);

  return { state, action };
}
```

## Related Stores

Besides hooks, the project has Zustand stores for global state:

### useSettingsStore

Central store for user preferences: wallpaper, launcher icon, font, theme, and custom colors.

```typescript
const {
  wallpaper,
  setWallpaper,
  font,
  setFont,
  theme,
  setThemeMode,
  customThemeColors,
  setCustomThemeColors,
} = useSettingsStore();
```

**Location**: `packages/core/src/stores/settingsStore.ts`

### useAppTempMemoryStore

Store for temporary snapshots used by `useIsDirty`. Persists snapshots to localStorage so they survive page reloads.

```typescript
const { setSnapshot, getSnapshot, clearSnapshot } = useAppTempMemoryStore();

// Store a snapshot
setSnapshot('my-app', { data: 'current state' });

// Retrieve a snapshot
const snapshot = getSnapshot('my-app');

// Clear a snapshot
clearSnapshot('my-app');
```

**Location**: `packages/core/src/stores/AppTempMemory.ts`

### useDesktopStore

Main store for desktop state: windows, icons, file system, clipboard, context menu.

```typescript
const { windows, openWindow, closeWindow, fsNodes, createFile } = useDesktopStore();
```

**Location**: `packages/core/src/stores/desktopStore.ts`

---

## Next Step

Know how to use the hooks? Now learn [how-to-create-an-app.md](./how-to-create-an-app.md) to create your own desktop app.
