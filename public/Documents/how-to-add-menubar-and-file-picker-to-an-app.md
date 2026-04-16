# How to Add a Menu Bar and File Picker to an App

So you've got an app and you want to give it a proper menu bar at the top — with a "File > Open" that pops up a file picker inside the window. This is exactly what `ImageViewerApp` does, and this document walks you through the same steps so you can do it in your own app.

## What We're Building

- A **menu bar** rendered at the top of the window (File > Open, File > Exit)
- A **file picker modal** that opens _inside_ the window (not in a portal floating outside it)
- A **notifyReady pattern** to communicate actions and state back to the window (for the menu bar)
- A **centralized registry** that ties everything together

## Two Menu Bar Patterns

There are **two patterns** for building menu bars, each suited to different needs:

### Pattern 1: `buildMenuBar` (Function-Based)

**Use when:** Your menu bar needs simple state (booleans, strings) or actions that don't change frequently.

- Pure function that returns `AppMenuElement[]`
- Reads state from `window.contentData` (pushed by the app via `notifyReady`)
- Recomputes on every render
- Simple to implement, no extra dependencies

### Pattern 2: `MenuBarComponent` (Zustand Store)

**Use when:** Your menu bar has reactive state that updates frequently (sliders, switches, real-time values).

- React component that subscribes to a Zustand store
- App writes to store directly (no `notifyReady` for those values!)
- Independent re-renders — the window doesn't re-render when menu state changes
- Better performance for high-frequency updates (zoom sliders, etc.)

### Which Pattern to Choose?

| Scenario                         | Pattern                                       |
| -------------------------------- | --------------------------------------------- |
| Static menus (File > Open, Exit) | Either — use `buildMenuBar` for simplicity    |
| Toggle switches (true/false)     | Either — `buildMenuBar` works fine            |
| Sliders with real-time updates   | **`MenuBarComponent`** — avoids lag           |
| Complex derived state            | **`MenuBarComponent`** — cleaner separation   |
| Multiple windows of same app     | **`MenuBarComponent`** — store per `windowId` |

---

## The Files Involved

### Pattern 1: `buildMenuBar`

```
YourApp/
├── YourApp.tsx                  # Main component — receives WindowContentProps
├── buildYourAppMenuBar.tsx      # Pure function that builds the AppMenuElement[] array
└── YourApp.test.tsx             # Tests for both
```

### Pattern 2: `MenuBarComponent`

```
YourApp/
├── YourApp.tsx                  # Main component — writes to Zustand store
├── yourAppStore.ts              # Zustand store with state per windowId
├── useYourAppMenuBar.ts         # Hook that builds menu elements from store
├── YourAppMenuBar.tsx           # React component subscribed to store
├── yourAppStore.test.ts         # Store tests
└── useYourAppMenuBar.test.ts    # Hook tests
```

And in the Window folder:

```
src/Presentation/Components/Window/
├── AppRegistry.tsx              # Registers your app and its menu bar builder/component
├── DynamicMenuBarRenderer.tsx   # Renders MenuBarComponent dynamically
└── ...
```

---

# Pattern 1: `buildMenuBar` (Function-Based)

This is the simpler approach for most apps.

---

## Step 1: Define Your Component with WindowContentProps

Your component receives `WindowContentProps` which includes the `window` entity and a `notifyReady` callback. Use `notifyReady` to push data back to the window (like actions for the menu bar, or functions to open the file picker).

```tsx
// src/Presentation/Components/Apps/YourApp/YourApp.tsx
import { type FC, useState, useCallback, useEffect } from 'react';
import { FilePickerModal } from '@presentation/Components/Shared/FilePickerApp/FilePickerApp';
import type { FileNode } from '@/Shared/Interfaces/FileNode';
import type { WindowContentProps } from '@/Shared/Interfaces/IWindowContentProps';
import classes from './YourApp.module.css';

export interface YourAppActions {
  openFile: () => void;
  doSomething: () => void;
}

const YourApp: FC<WindowContentProps> = ({ window: win, notifyReady }) => {
  const [pickerOpen, setPickerOpen] = useState(false);
  const [isDirty, setIsDirty] = useState(false);

  // Read initial data from window.contentData (passed when opening the app)
  const initialData = win?.contentData as { initialSrc?: string } | undefined;
  const [src, setSrc] = useState(initialData?.initialSrc);

  const handleFileSelected = useCallback((node: FileNode) => {
    setSrc(node.url ?? node.name);
    setPickerOpen(false);
  }, []);

  // Notify the window of our actions and state — the menu bar builder
  // will read these from window.contentData
  useEffect(() => {
    notifyReady?.({
      ...(win?.contentData ?? {}),
      actions: {
        openFile: () => setPickerOpen(true),
        doSomething: () => console.log('doing something'),
      },
      isDirty,
      setPickerOpen: () => setPickerOpen(true), // Expose picker opener to menu bar
    });
  }, [win, notifyReady, isDirty]);

  return (
    <div className={classes.container} data-windowid={win?.id}>
      {/* your app content here */}

      <FilePickerModal
        opened={pickerOpen}
        acceptedMimeTypes={['image/*']}
        onConfirm={handleFileSelected}
        onCancel={() => setPickerOpen(false)}
      />
    </div>
  );
};

export default YourApp;
```

### Important: `position: relative` on the container

`FilePickerModal` renders as an `position: absolute; inset: 0` overlay — it fills its nearest positioned ancestor. Your container **must** have `position: relative` in its CSS, otherwise the overlay will escape the window.

```css
/* YourApp.module.css */
.container {
  position: relative; /* required for FilePickerModal overlay */
  width: 100%;
  height: 100%;
}
```

---

## Step 2: Extract the Menu Bar Builder

The menu bar configuration is a pure function — no hooks, no state. Keep it in its own file so it can be imported by the registry.

```tsx
// src/Presentation/Components/Apps/YourApp/buildYourAppMenuBar.tsx
import type { AppMenuElement } from '@/Shared/Interfaces/IAppMenuElement';

export const buildYourAppMenuBar = (
  onOpenPicker: () => void,
  onExit: () => void,
): AppMenuElement[] => [
  {
    type: 'menu',
    label: 'File',
    items: [
      { type: 'item', label: 'Open', icon: 'FcOpenedFolder', onClick: onOpenPicker },
      { type: 'divider' },
      { type: 'item', label: 'Exit', icon: 'FcLeft', onClick: onExit },
    ],
  },
];
```

That's it. No component, no React, just data.

### Note: Avoid DirtyIndicator for Reactive State

If your app has reactive `isDirty` state (changes frequently, like after each keystroke), do NOT use `rightSection` with `buildMenuBar`. The `notifyReady` pattern causes Window to re-render on every state change, which creates lag.

Instead, migrate to **Pattern 2 (MenuBarComponent)** and use the `{ type: 'dirty-indicator' }` element approach described in the Pattern 2 section.

---

## Step 3: Register Your App in the AppRegistry

Instead of wiring everything in `App.tsx`, you register your app in the central `AppRegistry.tsx`. This is where you connect the menu bar builder to the window's `contentData`.

```tsx
// src/Presentation/Components/Window/AppRegistry.tsx
import type { FC } from 'react';
import type { WindowEntity } from '@/Shared/Interfaces/WindowEntity';
import type { WindowContentProps, MenuBarBuilder } from '@/Shared/Interfaces/IWindowContentProps';

import YourApp from '@presentation/Components/Apps/YourApp/YourApp';
import { buildYourAppMenuBar } from '@presentation/Components/Apps/YourApp/buildYourAppMenuBar';
import { useDesktopStore } from '@presentation/Store/desktopStore';

type AppComponent = FC<WindowContentProps>;

interface AppRegistryEntry {
  component: AppComponent;
  buildMenuBar?: MenuBarBuilder;
}

// The menu bar builder receives the full window entity (with updated contentData)
const buildYourAppMenuBarFn: MenuBarBuilder = (window: {
  const close WindowEntity) =>Window = useDesktopStore.getState().closeWindow;

  // Read actions and state that the app pushed via notifyReady
  const actions = window.contentData?.actions as
    | { openFile: () => void; doSomething: () => void }
    | undefined;
  const isDirty = window.contentData?.isDirty as boolean | undefined;

  // The setPickerOpen function is also available in contentData
  const setPickerOpen = window.contentData?.setPickerOpen as (() => void) | undefined;

  return buildYourAppMenuBar(
    () => setPickerOpen?.(),      // File > Open
    () => closeWindow(window.id), // File > Exit
  );
};

const registry: Record<string, AppRegistryEntry> = {
  // ...existing apps...

  'your-app': {
    component: YourApp,
    buildMenuBar: buildYourAppMenuBarFn,
  },
};

export const getAppComponent = (content: string): AppComponent => {
  return registry[content]?.component ?? AppEmptyState;
};

export const getMenuBarBuilder = (content: string): MenuBarBuilder | undefined => {
  return registry[content]?.buildMenuBar;
};
```

### Why this pattern?

1. **Decoupling**: The component doesn't know about the window or menu bar — it just calls `notifyReady` with data
2. **Reactivity**: The menu bar is recomputed every render with the latest `contentData` from the app
3. **Centralization**: All app registration lives in one place

---

## Step 4: How to Use notifyReady

The `notifyReady` callback is provided by the `Window` component via React Context. Your app calls it to push:

- **Actions**: Functions the menu bar can call (e.g., `save`, `openFile`, `new`)
- **State**: Flags the menu bar might need (e.g., `isDirty` for enabling/disabling Save)
- **Callbacks**: Functions to trigger UI from outside (e.g., `setPickerOpen`)

```tsx
// Inside your component
useEffect(() => {
  notifyReady?.({
    ...(win?.contentData ?? {}), // preserve existing data
    actions: {
      new: handleNew,
      save: handleSave,
      saveAs: handleSaveAs,
    },
    isDirty,
    setPickerOpen: () => setPickerOpen(true),
  });
}, [handleNew, handleSave, handleSaveAs, isDirty, win, notifyReady]);
```

The menu bar builder then reads these from `window.contentData`:

```tsx
const buildMenuBarFn: MenuBarBuilder = (window: WindowEntity) => {
  const actions = window.contentData?.actions as YourAppActions | undefined;
  const isDirty = window.contentData?.isDirty as boolean | undefined;

  return buildYourAppMenuBar(
    () => actions?.new?.(),
    () => actions?.save?.(),
    isDirty ?? false,
  );
};
```

---

## Step 5: Tests

Test the component and the menu bar builder separately. The component receives `WindowContentProps`, so pass mocks for `window` and `notifyReady`.

```tsx
// YourApp.test.tsx
import { render, screen, fireEvent } from '@testing-library/react';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import YourApp from './YourApp';
import { buildYourAppMenuBar } from './buildYourAppMenuBar';
import { renderWithMantine } from '@/Shared/Testing/Utils/renderWithMantine';

const wrapper = renderWithMantine();

describe('YourApp', () => {
  const mockNotifyReady = vi.fn();
  const mockWindow = {
    id: 'win-1',
    contentData: { initialSrc: undefined },
  } as any;

  beforeEach(() => {
    mockNotifyReady.mockClear();
  });

  it('should render the app container', () => {
    render(<YourApp window={mockWindow} notifyReady={mockNotifyReady} />, { wrapper });
    expect(screen.getByTestId('your-app-container')).toBeInTheDocument();
  });

  it('should call notifyReady on mount', () => {
    render(<YourApp window={mockWindow} notifyReady={mockNotifyReady} />, { wrapper });
    expect(mockNotifyReady).toHaveBeenCalledWith(
      expect.objectContaining({
        setPickerOpen: expect.any(Function),
        actions: expect.any(Object),
        isDirty: false,
      }),
    );
  });

  it('should show the picker modal when pickerOpen is true and setPickerOpen is called', () => {
    let setPickerOpenFn: () => void;
    mockNotifyReady.mockImplementation((data: any) => {
      setPickerOpenFn = data.setPickerOpen;
    });

    const { rerender } = render(<YourApp window={mockWindow} notifyReady={mockNotifyReady} />, {
      wrapper,
    });

    // Simulate opening the picker
    setPickerOpenFn!();

    rerender(<YourApp window={mockWindow} notifyReady={mockNotifyReady} />);
    expect(screen.getByRole('dialog', { name: 'Open file' })).toBeInTheDocument();
  });
});

describe('buildYourAppMenuBar', () => {
  it('should export a File menu', () => {
    const menuBar = buildYourAppMenuBar(vi.fn(), vi.fn());
    expect(menuBar[0]).toMatchObject({ type: 'menu', label: 'File' });
  });

  it('should call onOpenPicker when Open is clicked', () => {
    const onOpen = vi.fn();
    const menuBar = buildYourAppMenuBar(onOpen, vi.fn());
    const items = (
      menuBar[0] as { items: Array<{ type: string; label?: string; onClick?: () => void }> }
    ).items;
    items.find(i => i.label === 'Open')?.onClick?.();
    expect(onOpen).toHaveBeenCalledOnce();
  });
});
```

---

## Step 6: Storybook (optional but nice)

To show the app with the picker already open in a story:

```tsx
// YourApp.stories.tsx
import { useEffect } from 'react';
import { WindowButtonRegistryProvider } from '@presentation/Hooks/useWindowButtonRegistry';
import Window from '@presentation/Components/Window/Window';
import { makeWindow } from '@/Shared/Testing/Utils/makeWindow';
import { buildYourAppMenuBar } from './buildYourAppMenuBar';
import YourApp from './YourApp';

const win = makeWindow({
  id: 'win-your-app',
  title: 'Your App',
  fcIcon: 'FcPicture',
  width: 700,
  height: 520,
  content: 'your-app',
});

const YourAppStory = () => {
  useEffect(() => {
    // Seed the store if needed
    useDesktopStore.setState({
      fsNodes: [
        /* seed nodes */
      ],
    });
  }, []);

  return (
    <WindowButtonRegistryProvider>
      <div style={{ position: 'relative', width: 700, height: 520 }}>
        <Window window={win} />
      </div>
    </WindowButtonRegistryProvider>
  );
};

export const Default: Story = {
  render: () => <YourAppStory />,
};
```

---

# Pattern 2: `MenuBarComponent` (Zustand Store)

**Use this pattern when your menu bar has reactive state that updates frequently** (zoom sliders, real-time values, complex derived state).

## Why This Pattern?

The `buildMenuBar` pattern has a limitation: every time the app calls `notifyReady`, the `Window` component re-renders and recomputes the menu bar. For high-frequency updates (like dragging a zoom slider), this causes lag:

```
User drags slider → App updates state → notifyReady() → Window re-renders → Menu recomputed → Lag
```

The `MenuBarComponent` pattern solves this by:

1. **Zustand store per windowId** — state is stored outside React component tree
2. **Independent subscriptions** — menu bar re-renders independently from the app/window
3. **No notifyReady for reactive state** — app writes directly to store

```
User drags slider → Store updates → Only MenuBarComponent re-renders → Smooth
```

## The Files

```
YourApp/
├── YourApp.tsx                  # Writes to store for reactive state
├── yourAppStore.ts              # Zustand store with state per windowId
├── useYourAppMenuBar.ts         # Hook that reads store and builds AppMenuElement[]
├── YourAppMenuBar.tsx           # React component rendered by Window
└── tests...
```

## Step-by-Step Implementation

### Step 1: Create the Zustand Store

```typescript
// src/Presentation/Components/Apps/YourApp/yourAppStore.ts
import { create } from 'zustand';

interface WindowState {
  someValue: number;
  someFlag: boolean;
}

interface YourAppStore {
  // State storage (per windowId)
  states: Record<string, WindowState>;

  // Getters (for use in selectors)
  getSomeValue: (windowId: string) => number;
  getSomeFlag: (windowId: string) => boolean;

  // Setters (called from app or menu)
  setSomeValue: (windowId: string, value: number) => void;
  setSomeFlag: (windowId: string, flag: boolean) => void;

  // Cleanup (called when window closes or app resets)
  reset: (windowId: string) => void;
}

const DEFAULT_STATE: WindowState = {
  someValue: 100,
  someFlag: true,
};

export const useYourAppStore = create<YourAppStore>((set, get) => ({
  states: {},

  getSomeValue: id => get().states[id]?.someValue ?? 100,
  getSomeFlag: id => get().states[id]?.someFlag ?? true,

  setSomeValue: (id, value) =>
    set(s => ({
      states: { ...s.states, [id]: { ...(s.states[id] ?? DEFAULT_STATE), someValue: value } },
    })),

  setSomeFlag: (id, flag) =>
    set(s => ({
      states: { ...s.states, [id]: { ...(s.states[id] ?? DEFAULT_STATE), someFlag: flag } },
    })),

  reset: id =>
    set(s => ({
      states: { ...s.states, [id]: DEFAULT_STATE },
    })),
}));

// Optional: convenience hooks for components
export const useSomeValue = (windowId: string) =>
  useYourAppStore(s => s.states[windowId]?.someValue ?? 100);

export const useSomeFlag = (windowId: string) =>
  useYourAppStore(s => s.states[windowId]?.someFlag ?? true);
```

### Step 2: Create the Hook that Builds Menu Elements

```typescript
// src/Presentation/Components/Apps/YourApp/useYourAppMenuBar.ts
import type { AppMenuElement } from '@/Shared/Interfaces/IAppMenuElement';
import { useYourAppStore } from './yourAppStore';

export const useYourAppMenuBarElements = (windowId: string): AppMenuElement[] => {
  // Read store via selectors
  const someValue = useYourAppStore(s => s.states[windowId]?.someValue ?? 100);
  const someFlag = useYourAppStore(s => s.states[windowId]?.someFlag ?? true);

  // Get actions from store
  const setSomeValue = useYourAppStore(s => s.setSomeValue);
  const setSomeFlag = useYourAppStore(s => s.setSomeFlag);

  return [
    {
      type: 'switch',
      label: 'Enable Feature',
      checked: someFlag,
      onChange: () => setSomeFlag(windowId, !someFlag),
    },
    {
      type: 'slider',
      label: `Value: ${someValue}%`,
      min: 10,
      max: 500,
      value: someValue,
      onChange: value => setSomeValue(windowId, value),
    },
  ];
};
```

### Step 3: Create the MenuBar Component

```tsx
// src/Presentation/Components/Apps/YourApp/YourAppMenuBar.tsx
import type { FC } from 'react';
import type { MenuBarComponentProps } from '@/Shared/Interfaces/IWindowContentProps';
import { useYourAppMenuBarElements } from './useYourAppMenuBar';
import AppMenuBar from '@presentation/Components/AppMenuBar/AppMenuBar';

export const YourAppMenuBar: FC<MenuBarComponentProps> = ({ windowId }) => {
  const elements = useYourAppMenuBarElements(windowId);
  return <AppMenuBar elements={elements} />;
};
```

### Step 4: Update Your App to Use the Store

```tsx
// src/Presentation/Components/Apps/YourApp/YourApp.tsx
import { type FC, useEffect } from 'react';
import { useYourAppStore } from './yourAppStore';
import type { WindowContentProps } from '@/Shared/Interfaces/IWindowContentProps';

const YourApp: FC<WindowContentProps> = ({ window: win, notifyReady }) => {
  // Only call reset on mount and when file changes
  useEffect(() => {
    useYourAppStore.getState().reset(win.id);
  }, [win.id]);

  // For reactive state, DON'T call notifyReady — write directly to store
  // The menu bar subscribes independently and updates without re-rendering this app

  return <div>{/* Your app content */}</div>;
};

export default YourApp;
```

### Step 5: Register in AppRegistry

```tsx
// src/Presentation/Components/Window/AppRegistry.tsx
import YourApp from '@presentation/Components/Apps/YourApp/YourApp';
import { YourAppMenuBar } from '@presentation/Components/Apps/YourApp/YourAppMenuBar';

const registry: Record<string, AppRegistryEntry> = {
  // ...
  'your-app': {
    component: YourApp,
    MenuBarComponent: YourAppMenuBar, // <-- React component, not function
  },
};

export const getMenuBarComponent = (content: string): MenuBarComponent | undefined => {
  return registry[content]?.MenuBarComponent;
};
```

That's it! The `Window` component will render your `MenuBarComponent` via `DynamicMenuBarRenderer`.

---

## Showing Dirty State in Menu Bar

If your app tracks unsaved changes (dirty state), you can show a `DirtyIndicator` in the menu bar.

**Important:** Use `{ type: 'dirty-indicator' }` as a **separate menu element**, NOT as `rightSection` on a menu. This ensures proper positioning at the right end of the menubar.

### Example: Conditionally Showing DirtyIndicator

```typescript
// useYourAppMenuBar.ts
export const useYourAppMenuBarElements = (windowId: string): AppMenuElement[] => {
  const isDirty = useIsDirty(windowId);

  const items: AppMenuElement[] = [
    {
      type: 'menu',
      label: 'File',
      items: [
        { type: 'item', label: 'Save', onClick: handleSave, disabled: !isDirty },
        { type: 'divider' },
        { type: 'item', label: 'Exit', onClick: onExit },
      ],
    },
  ];

  // Add dirty indicator at the end when dirty
  if (isDirty) {
    items.push({ type: 'dirty-indicator' });
  }

  return items;
};
```

The `DirtyIndicator` component (orange sync icon with "Unsaved changes" tooltip) will appear at the right side of the menu bar when `isDirty` is true.

---

## How It Works Together

```
┌─────────────────────────────────────────────────────────────────┐
│                         Zustand Store                            │
│  states: { [windowId]: { someValue, someFlag, ... } }            │
└───────────────────────────┬─────────────────────────────────────┘
                            │
          ┌─────────────────┴─────────────────┐
          │                                   │
          ▼                                   ▼
┌─────────────────────┐             ┌─────────────────────┐
│     YourApp.tsx     │             │  YourAppMenuBar.tsx │
│  (writes to store)  │             │ (reads from store)  │
└─────────────────────┘             └─────────────────────┘
          │                                   │
          │                                   │
          ▼                                   ▼
   Window renders                    Window renders via
   this directly                     DynamicMenuBarRenderer
```

---

## Real References

**Pattern 1 (`buildMenuBar`):**

- [`src/Presentation/Components/Apps/PdfApp/buildPdfViewerMenuBar.tsx`](../src/Presentation/Components/Apps/PdfApp/buildPdfViewerMenuBar.tsx)

**Pattern 2 (`MenuBarComponent`):**

- [`src/Presentation/Components/Apps/ImageViewerApp/ImageViewerApp.tsx`](../src/Presentation/Components/Apps/ImageViewerApp/ImageViewerApp.tsx)
- [`src/Presentation/Components/Apps/ImageViewerApp/imageViewerStore.ts`](../src/Presentation/Components/Apps/ImageViewerApp/imageViewerStore.ts)
- [`src/Presentation/Components/Apps/ImageViewerApp/useImageViewerMenuBar.ts`](../src/Presentation/Components/Apps/ImageViewerApp/useImageViewerMenuBar.ts)
- [`src/Presentation/Components/Apps/ImageViewerApp/ImageViewerMenuBar.tsx`](../src/Presentation/Components/Apps/ImageViewerApp/ImageViewerMenuBar.tsx)
- [`src/Presentation/Components/Apps/NotesApp/NotesApp.tsx`](../src/Presentation/Components/Apps/NotesApp/NotesApp.tsx) — with DirtyIndicator
- [`src/Presentation/Components/Apps/NotesApp/notesStore.ts`](../src/Presentation/Components/Apps/NotesApp/notesStore.ts)
- [`src/Presentation/Components/Apps/NotesApp/useNotesMenuBar.ts`](../src/Presentation/Components/Apps/NotesApp/useNotesMenuBar.ts)
- [`src/Presentation/Components/Apps/SettingsApp/SettingsApp.tsx`](../src/Presentation/Components/Apps/SettingsApp/SettingsApp.tsx) — with DirtyIndicator
- [`src/Presentation/Components/Apps/SettingsApp/settingsAppStore.ts`](../src/Presentation/Components/Apps/SettingsApp/settingsAppStore.ts)
- [`src/Presentation/Components/Apps/SettingsApp/useSettingsMenuBar.ts`](../src/Presentation/Components/Apps/SettingsApp/useSettingsMenuBar.ts)
- [`src/Presentation/Components/Window/DynamicMenuBarRenderer.tsx`](../src/Presentation/Components/Window/DynamicMenuBarRenderer.tsx)

**Shared Components:**

- [`src/Presentation/Components/Window/AppRegistry.tsx`](../src/Presentation/Components/Window/AppRegistry.tsx)
- [`src/Shared/Interfaces/IAppMenuElement.ts`](../src/Shared/Interfaces/IAppMenuElement.ts) — includes `dirty-indicator` type
- [`src/Presentation/Components/AppMenuBar/AppMenuBar.tsx`](../src/Presentation/Components/AppMenuBar/AppMenuBar.tsx) — renders `dirty-indicator`
- [`src/Presentation/Components/Shared/FilePickerApp/FilePickerApp.tsx`](../src/Presentation/Components/Shared/FilePickerApp/FilePickerApp.tsx)

| Prop                | Type                       | Required | Description                                                  |
| ------------------- | -------------------------- | -------- | ------------------------------------------------------------ |
| `opened`            | `boolean`                  | ✓        | Whether the modal is visible                                 |
| `acceptedMimeTypes` | `string[]`                 | —        | e.g. `['image/*']`, `['application/pdf']`. Empty = all files |
| `onConfirm`         | `(node: FileNode) => void` | ✓        | Called when the user selects a file and clicks Open          |
| `onCancel`          | `() => void`               | ✓        | Called when the user clicks Cancel                           |

Wildcards like `image/*` are supported — they'll match any file whose mimeType starts with `image/`.

---

## FileSaveModal API Reference

For apps that need to save files (like NotesApp):

| Prop          | Type                               | Required | Description                                      |
| ------------- | ---------------------------------- | -------- | ------------------------------------------------ |
| `opened`      | `boolean`                          | ✓        | Whether the modal is visible                     |
| `initialName` | `string`                           | —        | Default filename (e.g. "untitled.md")            |
| `onConfirm`   | `(result: FileSaveResult) => void` | ✓        | Called with `{ parentId, name }` when user saves |
| `onCancel`    | `() => void`                       | ✓        | Called when the user clicks Cancel               |

---

## Real Reference

The complete implementation lives in:

### Pattern 1 Examples

- [`src/Presentation/Components/Apps/PdfApp/PdfApp.tsx`](../src/Presentation/Components/Apps/PdfApp/PdfApp.tsx)
- [`src/Presentation/Components/Apps/PdfApp/buildPdfViewerMenuBar.tsx`](../src/Presentation/Components/Apps/PdfApp/buildPdfViewerMenuBar.tsx)
- [`src/Presentation/Components/Apps/NotesApp/NotesApp.tsx`](../src/Presentation/Components/Apps/NotesApp/NotesApp.tsx)
- [`src/Presentation/Components/Apps/NotesApp/buildNotesMenuBar.tsx`](../src/Presentation/Components/Apps/NotesApp/buildNotesMenuBar.tsx)

### Pattern 2 Examples

- [`src/Presentation/Components/Apps/ImageViewerApp/ImageViewerApp.tsx`](../src/Presentation/Components/Apps/ImageViewerApp/ImageViewerApp.tsx)
- [`src/Presentation/Components/Apps/ImageViewerApp/imageViewerStore.ts`](../src/Presentation/Components/Apps/ImageViewerApp/imageViewerStore.ts)
- [`src/Presentation/Components/Apps/ImageViewerApp/useImageViewerMenuBar.ts`](../src/Presentation/Components/Apps/ImageViewerApp/useImageViewerMenuBar.ts)
- [`src/Presentation/Components/Apps/ImageViewerApp/ImageViewerMenuBar.tsx`](../src/Presentation/Components/Apps/ImageViewerApp/ImageViewerMenuBar.tsx)
- [`src/Presentation/Components/Window/DynamicMenuBarRenderer.tsx`](../src/Presentation/Components/Window/DynamicMenuBarRenderer.tsx)

### Shared Components

- [`src/Presentation/Components/Window/AppRegistry.tsx`](../src/Presentation/Components/Window/AppRegistry.tsx)
- [`src/Presentation/Components/Shared/FilePickerApp/FilePickerApp.tsx`](../src/Presentation/Components/Shared/FilePickerApp/FilePickerApp.tsx)
