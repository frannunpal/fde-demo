# How to Create an App

Want to add your own application to the desktop? Great, it's easier than you think. This document walks you through creating a new app step by step.

## Two Contexts

There are two ways to create apps, depending on where you're working:

| Context | When to use |
| ------- | ----------- |
| **External project** (npm package consumer) | You installed `@fde-desktop/fde-core` in your own project |
| **Monorepo contributor** (working inside this repo) | You're adding an app to the `src/` example app |

The component API is identical in both cases — the only difference is **where you register the app** and **what you import**.

## External Project (npm package consumer)

If you installed `@fde-desktop/fde-core` in your own project, here's the complete flow:

### 1. Create your app component

```tsx
// src/MyApp.tsx
import { type FC, useEffect } from 'react';
import type { WindowContentProps } from '@fde-desktop/fde-core';

const MyApp: FC<WindowContentProps> = ({ window: win, notifyReady }) => {
  useEffect(() => {
    notifyReady?.({});
  }, [win, notifyReady]);

  return (
    <div>
      <h1>Hello from My App!</h1>
    </div>
  );
};

export default MyApp;
```

### 2. Register and use it with FdeDesktop

```tsx
// src/App.tsx
import { FdeDesktop, type AppRegistryEntry } from '@fde-desktop/fde-core';
import '@mantine/core/styles.css';
import '@mantine/dates/styles.css';

const myApps: Record<string, AppRegistryEntry> = {
  'my-app': {
    loader: () => import('./MyApp'),  // lazy-loaded
    appName: 'My App',
    isLazy: true,
    // Optional window metadata:
    defaultWidth: 800,
    defaultHeight: 600,
    fcIcon: 'FcFolder',    // react-icons/fc icon name
  },
};

function App() {
  return (
    <FdeDesktop
      customApps={myApps}
      initialApp="my-app"       // open on start (optional)
    />
  );
}
```

That's it. Core apps (Files, Settings, Notepad, etc.) load automatically. Your app is merged into the registry.

### 3. Make it openable from code

```tsx
import { useOpenApp } from '@fde-desktop/fde-core';

function SomeButton() {
  const openApp = useOpenApp();
  return (
    <button onClick={() => openApp('my-app', { contentData: { value: 42 } })}>
      Open My App
    </button>
  );
}
```

See [npm-package.md](./npm-package.md) for the full API reference.

---

## Monorepo Contributor (example app in `src/`)

The steps below are for adding an app to the `src/` example app inside this repository.

### The Complete Flow

Creating an app has three steps:

1. **Create the component** in `src/Presentation/Components/Apps/` using `WindowContentProps`
2. **Register in AppRegistry** to connect your component and menu bar
3. **(Optional but recommended) Add tests and stories**

Let's see each in detail.

> **Note on app metadata**: Window dimensions, icons, and display names can be set directly in the `AppRegistryEntry` object in `AppRegistry.tsx`. No separate metadata file is needed for example-app apps.

## Step 1: Create the Component

Create a new folder in `src/Presentation/Components/Apps/`. For example, for an app called "MyApp":

```
src/Presentation/Components/Apps/MyApp/
├── MyApp.tsx              # Main component (receives WindowContentProps)
├── MyApp.module.css       # Styles (optional)
├── MyApp.test.tsx         # Tests (required)
├── MyApp.stories.tsx      # Storybook (optional)
└── MyAppMenuBar.tsx      # Menu bar component (if you need one)
```

### Basic Component Structure with WindowContentProps

```tsx
// src/Presentation/Components/Apps/MyApp/MyApp.tsx
import { type FC, useEffect, useState } from 'react';
import type { WindowContentProps } from '@fde-desktop/fde-core';
import classes from './MyApp.module.css';

const MyApp: FC<WindowContentProps> = ({ window: win, notifyReady }) => {
  const initialData = win?.contentData as { initialValue?: string } | undefined;
  const [state, setState] = useState(initialData?.initialValue ?? '');

  useEffect(() => {
    notifyReady?.({
      ...(win?.contentData ?? {}),
    });
  }, [win, notifyReady]);

  return (
    <div className={classes.container} data-windowid={win?.id}>
      <h1>Hello from My App!</h1>
      <p>Current state: {state}</p>
    </div>
  );
};

export default MyApp;
```

### WindowContentProps API

| Prop          | Type                                              | Description                                     |
| ------------- | ------------------------------------------------- | ----------------------------------------------- |
| `window`      | `WindowEntity \| undefined`                       | The window entity with metadata and contentData |
| `notifyReady` | `(contentData?: Record<string, unknown>) => void` | Callback to push data back to the window        |

The `window` object contains:

- `window.id` - unique window identifier
- `window.content` - app ID (e.g., 'my-app')
- `window.contentData` - data passed when opening the app
- `window.title`, `window.fcIcon`, etc.

### How to Receive Parameters

When you open an app with `openApp('my-app', { contentData: {...} })`, the data arrives in `window.contentData`:

```tsx
const MyApp: FC<WindowContentProps> = ({ window: win, notifyReady }) => {
  const contentData = win?.contentData as { initialValue?: string } | undefined;
  const initialValue = contentData?.initialValue;
  // ...
};
```

## Step 2: Register in AppRegistry

After creating your component, register it in `src/Presentation/Components/Window/AppRegistry.tsx`:

### For Synchronous Apps (loaded immediately)

```tsx
// In AppRegistry.tsx
import MyApp from '@presentation/Components/Apps/MyApp/MyApp';
import { MyAppMenuBar } from '@presentation/Components/Apps/MyApp/MyAppMenuBar';

const registry: Record<string, AppRegistryEntry> = {
  // ...existing apps...

  'my-app': {
    component: MyApp,
    MenuBarComponent: MyAppMenuBar, // Optional: if you have a menu bar
    appName: 'My App',
  },
};
```

### For Lazy-Loaded Apps (deferred loading)

Large apps should be lazy-loaded to reduce initial bundle size:

```tsx
// In lazyApps.tsx
export const MyApp = lazy(() => import('@presentation/Components/Apps/MyApp/MyApp'));

export const MyAppMenuBar = lazy(() =>
  import('@presentation/Components/Apps/MyApp/MyAppMenuBar').then(m => ({
    default: m.MyAppMenuBar,
  })),
) as MenuBarComponent;

// In AppRegistry.tsx
import { MyApp, MyAppMenuBar } from './lazyApps';

const registry: Record<string, AppRegistryEntry> = {
  'my-app': {
    component: MyApp as AppComponent,
    MenuBarComponent: MyAppMenuBar,
    isLazy: true,
    appName: 'My App',
  },
};
```

If your app needs a menu bar, see the next section.

## Step 3: (Optional) Tests

If you want your app to have tests, here's a template:

```tsx
// src/Presentation/Components/Apps/MyApp/MyApp.test.tsx
import { render, screen } from '@testing-library/react';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import MyApp from './MyApp';
import { renderWithMantine } from '@/Shared/Testing/Utils/renderWithMantine';

const wrapper = renderWithMantine();

describe('MyApp', () => {
  const mockNotifyReady = vi.fn();
  const mockWindow = {
    id: 'win-1',
    contentData: { initialValue: 'test' },
  } as any;

  beforeEach(() => {
    mockNotifyReady.mockClear();
  });

  it('renders without crashing', () => {
    render(<MyApp window={mockWindow} notifyReady={mockNotifyReady} />, { wrapper });
    expect(screen.getByText(/hello/i)).toBeInTheDocument();
  });

  it('accepts initial value from contentData', () => {
    render(<MyApp window={mockWindow} notifyReady={mockNotifyReady} />, { wrapper });
    expect(screen.getByText(/test/i)).toBeInTheDocument();
  });

  it('calls notifyReady on mount', () => {
    render(<MyApp window={mockWindow} notifyReady={mockNotifyReady} />, { wrapper });
    expect(mockNotifyReady).toHaveBeenCalled();
  });
});
```

## How to Open Your App

Once registered, you can open it from anywhere using the `useOpenApp` hook:

```tsx
const openApp = useOpenApp();

openApp('my-app'); // Open with defaults
openApp('my-app', {
  contentData: { initialValue: 'hello' }, // With data
});
```

## Things You Can Do in Your App

- **Access the store**: `useDesktopStore(state => state.windows)` or `useSettingsStore(state => state.theme)`
- **Manipulate files**: `useDesktopStore(state => state.fsNodes)`
- **Show notifications**: `useNotifications()`
- **Use icons**: `useFcIcon('FcHome')`, `useFcIconElement('FcHome', { size: 24 })`, `useFiIcon('FiHome')` for Feather Icons, or `useVscIcon('VscFile')` for VSCode icons
- **Communicate with window**: Call `notifyReady` to push actions/state
- **Resolve file URLs**: `useResolvedUrl(url)` to convert `idb://` URLs to displayable blob URLs (required for files stored in IndexedDB)
- **Download files**: `useDownload()` for streaming downloads with progress tracking
- **Apply fonts**: `useApplyFont()` automatically applies selected font to document
- **Track unsaved changes**: `useIsDirty()` to detect and persist dirty state
- **Intercept window close**: `useCloseInterceptor()` to show confirmation when closing with unsaved changes

## How to Add a Menu Bar

Windows can have a menu bar at the top with dropdown menus, switches, sliders, comboboxes, and text inputs. There are **two patterns** for building menu bars.

### Two Menu Bar Patterns

| Pattern            | Use When                                   | Pros                              |
| ------------------ | ------------------------------------------ | --------------------------------- |
| `MenuBarComponent` | Reactive state (sliders, real-time values) | Independent re-renders, smooth UX |
| `buildMenuBar`     | Static menus, simple actions               | Simpler to implement              |

**Recommendation:** For new apps, use `MenuBarComponent` if you have any reactive state (sliders, switches, zoom controls). Use `buildMenuBar` only for static menus.

---

## Pattern 1: MenuBarComponent (Recommended)

This pattern uses a React component subscribed to a Zustand store. The menu bar re-renders independently from the app, providing smooth UX for reactive elements.

### Files Structure

```
MyApp/
├── MyApp.tsx              # Main component
├── myAppStore.ts          # Zustand store (window-scoped state)
├── useMyAppMenuBar.ts     # Hook that builds menu elements
├── MyAppMenuBar.tsx       # Menu bar component
└── tests...
```

### Step 1: Create the Zustand Store

```typescript
// src/Presentation/Components/Apps/MyApp/myAppStore.ts
import { create } from 'zustand';

interface WindowState {
  zoom: number;
  isDirty: boolean;
}

interface MyAppStore {
  states: Record<string, WindowState>;
  getZoom: (windowId: string) => number;
  getIsDirty: (windowId: string) => boolean;
  setZoom: (windowId: string, zoom: number) => void;
  setIsDirty: (windowId: string, isDirty: boolean) => void;
  reset: (windowId: string) => void;
}

const DEFAULT_STATE: WindowState = {
  zoom: 100,
  isDirty: false,
};

export const useMyAppStore = create<MyAppStore>((set, get) => ({
  states: {},
  getZoom: id => get().states[id]?.zoom ?? DEFAULT_STATE.zoom,
  getIsDirty: id => get().states[id]?.isDirty ?? DEFAULT_STATE.isDirty,
  setZoom: (id, zoom) =>
    set(s => ({
      states: { ...s.states, [id]: { ...(s.states[id] ?? DEFAULT_STATE), zoom } },
    })),
  setIsDirty: (id, isDirty) =>
    set(s => ({
      states: { ...s.states, [id]: { ...(s.states[id] ?? DEFAULT_STATE), isDirty } },
    })),
  reset: id => set(s => ({ states: { ...s.states, [id]: DEFAULT_STATE } })),
}));

export const useZoom = (windowId: string) =>
  useMyAppStore(s => s.states[windowId]?.zoom ?? DEFAULT_STATE.zoom);

export const useIsDirty = (windowId: string) =>
  useMyAppStore(s => s.states[windowId]?.isDirty ?? DEFAULT_STATE.isDirty);
```

### Step 2: Create the Menu Elements Hook

```typescript
// src/Presentation/Components/Apps/MyApp/useMyAppMenuBar.ts
import { useMemo, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import type { AppMenuElement } from '@/Shared/Interfaces/IAppMenuElement';
import { useZoom, useIsDirty, useMyAppStore } from './myAppStore';

interface UseMyAppMenuBarOptions {
  windowId: string;
  onExit: () => void;
}

export const useMyAppMenuBarElements = (options: UseMyAppMenuBarOptions): AppMenuElement[] => {
  const { windowId, onExit } = options;
  const { t } = useTranslation('common');

  const zoom = useZoom(windowId);
  const isDirty = useIsDirty(windowId);
  const setZoom = useMyAppStore(s => s.setZoom);

  const handleZoomChange = useCallback(
    (value: number) => setZoom(windowId, value),
    [windowId, setZoom],
  );

  return useMemo(() => {
    const items: AppMenuElement[] = [
      {
        type: 'menu',
        label: t('menu.file'),
        items: [
          { type: 'divider' },
          { type: 'item', label: t('actions.exit'), icon: 'FcLeave', onClick: onExit },
        ],
      },
      {
        type: 'slider',
        label: `Zoom: ${zoom}%`,
        min: 50,
        max: 200,
        value: zoom,
        onChange: handleZoomChange,
      },
    ];

    if (isDirty) {
      items.push({ type: 'dirty-indicator' });
    }

    return items;
  }, [t, onExit, zoom, isDirty, handleZoomChange]);
};
```

### Step 3: Create the MenuBar Component

```tsx
// src/Presentation/Components/Apps/MyApp/MyAppMenuBar.tsx
import { type FC, memo } from 'react';
import AppMenuBar from '@presentation/Components/AppMenuBar/AppMenuBar';
import { useMyAppMenuBarElements } from './useMyAppMenuBar';
import type { MenuBarComponentProps } from '@/Shared/Interfaces/IWindowContentProps';

export const MyAppMenuBar: FC<MenuBarComponentProps> = memo(({ windowId, onExit, contentData }) => {
  const elements = useMyAppMenuBarElements({
    windowId,
    onExit,
  });

  return <AppMenuBar elements={elements} />;
});

MyAppMenuBar.displayName = 'MyAppMenuBar';
```

### Step 4: Register in AppRegistry

```tsx
// In AppRegistry.tsx
import { MyAppMenuBar } from '@presentation/Components/Apps/MyApp/MyAppMenuBar';

const registry: Record<string, AppRegistryEntry> = {
  'my-app': {
    component: MyApp,
    MenuBarComponent: MyAppMenuBar,
    appName: 'My App',
  },
};
```

---

## Pattern 2: buildMenuBar (Function-Based)

For simpler apps with static menus, use the function-based approach. This is older and causes Window re-renders on every state change.

### Step 1: Define the Menu Builder Function

```tsx
// src/Presentation/Components/Apps/MyApp/buildMyAppMenuBar.ts
import type { AppMenuElement } from '@/Shared/Interfaces/IAppMenuElement';

export const buildMyAppMenuBar = (onOpen: () => void, onExit: () => void): AppMenuElement[] => [
  {
    type: 'menu',
    label: 'File',
    items: [
      { type: 'item', label: 'Open', icon: 'FcOpenedFolder', onClick: onOpen },
      { type: 'divider' },
      { type: 'item', label: 'Exit', icon: 'FcLeave', onClick: onExit },
    ],
  },
];
```

### Step 2: Register the Menu Bar Builder

```tsx
// In AppRegistry.tsx
import { buildMyAppMenuBar } from '@presentation/Components/Apps/MyApp/buildMyAppMenuBar';
import { useDesktopStore } from '@presentation/Store/desktopStore';
import type { MenuBarBuilder } from '@/Shared/Interfaces/IWindowContentProps';

const buildMyAppMenuBarFn: MenuBarBuilder = window => {
  const closeWindow = useDesktopStore.getState().closeWindow;
  const setPickerOpen = window.contentData?.setPickerOpen as (() => void) | undefined;

  return buildMyAppMenuBar(
    () => setPickerOpen?.(),
    () => closeWindow(window.id),
  );
};

const registry: Record<string, AppRegistryEntry> = {
  'my-app': {
    component: MyApp,
    buildMenuBar: buildMyAppMenuBarFn,
    appName: 'My App',
  },
};
```

### Step 3: Use notifyReady to Expose Actions

```tsx
const MyApp: FC<WindowContentProps> = ({ window: win, notifyReady }) => {
  const [pickerOpen, setPickerOpen] = useState(false);

  useEffect(() => {
    notifyReady?.({
      ...(win?.contentData ?? {}),
      setPickerOpen: () => setPickerOpen(true),
    });
  }, [win, notifyReady]);
};
```

---

## Menu Element Types

| Type              | Props                                                | Description               |
| ----------------- | ---------------------------------------------------- | ------------------------- |
| `menu`            | `label`, `icon?`, `items[]`                          | Dropdown menu             |
| `item`            | `label`, `icon?`, `onClick`, `disabled?`             | Clickable menu item       |
| `divider`         | _(none)_                                             | Horizontal separator      |
| `switch`          | `label`, `checked`, `onChange`                       | Toggle switch             |
| `slider`          | `label?`, `min`, `max`, `value`, `onChange`          | Slider control            |
| `select`          | `label?`, `options[]`, `value`, `onChange`           | Dropdown select           |
| `number-input`    | `label?`, `min`, `max`, `step?`, `value`, `onChange` | Number input              |
| `text-input`      | `placeholder?`, `value`, `onChange`                  | Text input                |
| `dirty-indicator` | _(none)_                                             | Unsaved changes indicator |

For complete documentation on menu bars (including advanced patterns), see [how-to-add-menubar-and-file-picker-to-an-app.md](./how-to-add-menubar-and-file-picker-to-an-app.md).

## Advanced: notifyReady Pattern

The `notifyReady` callback is the key to communication between your app and the window. Use it to:

1. **Expose actions** to the menu bar (save, open, etc.)
2. **Push state** that affects menu items (isDirty, currentView, etc.)
3. **Expose callbacks** to open modals from outside (file picker, save dialog)

```tsx
const NotesApp: FC<WindowContentProps> = ({ window, notifyReady }) => {
  const [isDirty, setIsDirty] = useState(false);
  const [saveModalOpen, setSaveModalOpen] = useState(false);

  useEffect(() => {
    notifyReady?.({
      ...(window?.contentData ?? {}),
      actions: {
        new: handleNew,
        save: () => {
          pendingSaveMode.current = 'save';
          handleSave();
        },
        saveAs: () => {
          pendingSaveMode.current = 'saveAs';
          handleSave();
        },
      },
      isDirty,
      setPickerOpen: () => setPickerOpen(true),
    });
  }, [window, notifyReady, isDirty]);

  return (
    <>
      <FilePickerModal
        opened={pickerOpen}
        onConfirm={handleFileSelected}
        onCancel={() => setPickerOpen(false)}
      />
      <FileSaveModal
        opened={saveModalOpen}
        onConfirm={handleSaveConfirm}
        onCancel={() => setSaveModalOpen(false)}
      />
      {/* editor content */}
    </>
  );
};
```

The menu bar builder then reads these values from `window.contentData`:

```tsx
const buildNotesMenuBarFn: MenuBarBuilder = (window: WindowEntity) => {
  const closeWindow = useDesktopStore.getState().closeWindow;
  const actions = window.contentData?.actions as
    | { new: () => void; save: () => void; saveAs: () => void }
    | undefined;
  const isDirty = window.contentData?.isDirty as boolean | undefined;

  return buildNotesMenuBar(
    () => actions?.new(),
    () => window.contentData?.setPickerOpen?.(),
    () => actions?.save(),
    () => actions?.saveAs(),
    () => closeWindow(window.id),
    isDirty ?? false,
  );
};
```

## Advanced: Tracking Unsaved Changes

Apps like NotesApp and SettingsApp track unsaved changes and show a confirmation dialog when the user tries to close with pending changes.

### Using useIsDirty

The `useIsDirty` hook compares current state against a stored snapshot:

```tsx
import { useRef } from 'react';
import { useIsDirty } from '@presentation/Hooks/useIsDirty';

const MyApp: FC<WindowContentProps> = ({ window: win, notifyReady }) => {
  const [content, setContent] = useState('');
  const snapshotRef = useRef<string | null>(null);

  const { isDirty, takeSnapshot } = useIsDirty({
    snapshotRef,
    getCurrentState: () => content,
    initialSnapshot: '',
    appId: win?.id, // Persists snapshot across sessions
  });

  useEffect(() => {
    notifyReady?.({
      ...(win?.contentData ?? {}),
      isDirty,
    });
  }, [win, notifyReady, isDirty]);

  const handleSave = () => {
    // ... save logic
    takeSnapshot(); // Mark current state as clean
  };

  // ...
};
```

### Using useCloseInterceptor

Combine with `useCloseInterceptor` to show a confirmation dialog:

```tsx
import { useCloseInterceptor } from '@presentation/Hooks/useCloseInterceptor';

const MyApp: FC<WindowContentProps> = ({ window: win, notifyReady }) => {
  const [isDirty, setIsDirty] = useState(false);

  useCloseInterceptor({
    isDirtyGetter: () => isDirty,
    windowId: win?.id,
    onDiscard: () => {
      // Called when user clicks "Discard" in the modal
      console.log('Changes discarded');
    },
    onSave: () => {
      // Called when user clicks "Save" in the modal
      handleSave();
    },
  });

  // ...
};
```

When `isDirty` is true and the user tries to close the window, a modal appears with Save/Discard options.

## Advanced: Window-Scoped State

If your app needs to maintain separate state for each window instance (e.g., multiple NotesApp windows with different content), use the `createWindowStateStore` factory.

### When to Use

Use window-scoped state when:

- Your app can have multiple windows open simultaneously
- Each window needs its own state (dirty flag, zoom level, content, etc.)
- You want to avoid global state pollution

### Basic Usage

```tsx
// src/Presentation/Components/Apps/MyApp/myAppStore.ts
import { createWindowStateStore } from '@presentation/Store/factories/createWindowStateStore';

interface MyWindowState {
  content: string;
  isDirty: boolean;
}

const DEFAULT_STATE: MyWindowState = {
  content: '',
  isDirty: false,
};

export const useMyAppStore = createWindowStateStore<MyWindowState>(DEFAULT_STATE);

// Convenience selector
export const useContent = (windowId: string) =>
  useMyAppStore(s => s.states[windowId]?.content ?? '');
```

### Using in Your Component

```tsx
const MyApp: FC<WindowContentProps> = ({ window: win }) => {
  const windowId = win?.id ?? '';
  const content = useContent(windowId);
  const { getState, setState, reset } = useMyAppStore.getState().actions;

  const handleChange = (newContent: string) => {
    setState(windowId, { content: newContent, isDirty: true });
  };

  useEffect(() => {
    // Reset state when window closes
    return () => reset(windowId);
  }, [windowId]);

  return <textarea value={content} onChange={e => handleChange(e.target.value)} />;
};
```

### For Dirty-State-Only Apps

If you only need to track `isDirty`, use the simpler `createDirtyStateStore`:

```tsx
import { createDirtyStateStore } from '@presentation/Store/factories/createWindowStateStore';

export const useMyAppStore = createDirtyStateStore();

// In component
const isDirty = useMyAppStore(s => s.states[windowId]?.isDirty ?? false);
useMyAppStore.getState().setIsDirty(windowId, true);
```

### Existing Implementations

For reference, see how existing apps implement window-scoped state:

- `settingsAppStore.ts` - Simple dirty state tracking
- `notesStore.ts` - Simple dirty state tracking
- `menuEditStore.ts` - Dirty state + snapshot
- `imageViewerStore.ts` - Zoom state with multiple properties

Note: These existing stores use hand-written patterns for historical reasons. New apps should prefer `createWindowStateStore` for consistency.

## Next Step

Got your app created? Then learn [testing.md](./testing.md) to know how to test all this properly, or check [how-to-add-menubar-and-file-picker-to-an-app.md](./how-to-add-menubar-and-file-picker-to-an-app.md) for detailed menu bar and file picker integration.
