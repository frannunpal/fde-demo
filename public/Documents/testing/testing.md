# Testing and You

Tests are important. Yeah, I know nobody likes writing them, but this project has them and they work well. Here's how to test without losing your mind.

## Tools We Use

| Tool                      | What it's for                                     |
| ------------------------- | ------------------------------------------------- |
| **Vitest**                | Test runner (like Jest but faster)                |
| **React Testing Library** | Testing React components                          |
| **Jest DOM**              | Additional matchers (`toBeInTheDocument()`, etc.) |
| **jsdom**                 | Browser simulation for tests                      |
| **Playwright**            | E2E, visual, and accessibility testing            |

## Test Commands

```bash
# Run tests in watch mode
bun run test

# Run tests once (for CI)
bun run test:unit

# Run tests with coverage
bun run test:coverage

# Run E2E tests (Playwright)
bun run test:e2e

# Run visual tests
bun run test:visual

# Run visual tests with UI
bun run test:visual:ui

# Update visual snapshots
bun run test:visual:update

# Run Docker tests
bun run test:docker
```

## Test File Structure

Tests live next to the code they test:

```
src/
├── Presentation/
│   └── Hooks/
│       ├── useOpenApp.ts          # Code
│       └── useOpenApp.test.ts     # Test
├── Shared/
│   └── Constants/
│       ├── apps.ts
│       └── apps.test.ts
└── ...
```

## Types of Tests

### 1. Hook Tests

Hooks are tested with a combination of `vitest` and store mocks.

```typescript
// src/Presentation/Hooks/useClock.test.ts
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useClock } from './useClock';

describe('useClock', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  it('returns formatted time', () => {
    const { result } = renderHook(() => useClock());

    // Mock Date
    vi.setSystemTime(new Date('2024-01-01T14:35:00'));

    expect(result.current).toBe('14:35');
  });
});
```

### 2. Component Tests

React components are tested with React Testing Library.

```tsx
// src/Presentation/Components/Apps/CalendarApp/CalendarApp.test.tsx
import { render, screen } from '@testing-library/react';
import { CalendarApp } from './CalendarApp';

describe('CalendarApp', () => {
  it('renders the calendar title', () => {
    render(<CalendarApp />);
    expect(screen.getByText(/calendar/i)).toBeInTheDocument();
  });
});
```

```tsx
// src/Presentation/Components/Taskbar/Taskbar.test.tsx
import { render, screen, fireEvent } from '@testing-library/react';
import { Taskbar } from './Taskbar';
import { resetDesktopStore } from '@/Shared/Testing/Utils/resetDesktopStore';
import { renderWithMantine } from '@/Shared/Testing/Utils/renderWithMantine';

const wrapper = renderWithMantine();

describe('Taskbar', () => {
  beforeEach(() => {
    resetDesktopStore();
  });

  it('opens launcher when clicking the launcher button', () => {
    render(<Taskbar />, { wrapper });

    fireEvent.click(screen.getByRole('button', { name: 'Launcher' }));
    expect(screen.getByTestId('launcher-panel')).toBeInTheDocument();
  });

  it('closes the launcher when clicking outside', () => {
    render(<Taskbar />, { wrapper });

    fireEvent.click(screen.getByRole('button', { name: 'Launcher' }));
    fireEvent.click(document.body);
    expect(screen.queryByTestId('launcher-panel')).not.toBeInTheDocument();
  });
});
```

### 3. App Component Tests (with WindowContentProps)

Since apps receive `WindowContentProps`, you need to mock the `window` entity and `notifyReady` callback:

```tsx
// src/Presentation/Components/Apps/MyApp/MyApp.test.tsx
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { act } from '@testing-library/react';
import { renderWithMantine } from '@/Shared/Testing/Utils/renderWithMantine';
import { createMockWindowEntity } from '@/Shared/Testing/Utils/makeWindowEntity';
import MyApp from './MyApp';

const wrapper = renderWithMantine();

describe('MyApp', () => {
  const mockNotifyReady = vi.fn((payload?: Record<string, unknown>) => {
    // Simulate how notifyReady merges data back into contentData
    if (payload && win.contentData) {
      win.contentData = { ...win.contentData, ...payload };
    }
  });

  let win: ReturnType<typeof createMockWindowEntity>;

  beforeEach(() => {
    vi.clearAllMocks();
    win = createMockWindowEntity({ contentData: { initialValue: 'test' } });
  });

  it('renders with initial contentData', () => {
    render(<MyApp window={win} notifyReady={mockNotifyReady} />, { wrapper });
    expect(screen.getByText(/test/i)).toBeInTheDocument();
  });

  it('calls notifyReady on mount', () => {
    render(<MyApp window={win} notifyReady={mockNotifyReady} />, { wrapper });
    expect(mockNotifyReady).toHaveBeenCalled();
  });

  it('opens picker via contentData callback', () => {
    render(<MyApp window={win} notifyReady={mockNotifyReady} />, { wrapper });

    // Simulate menu bar calling setPickerOpen from contentData
    act(() => {
      (win.contentData?.setPickerOpen as (() => void) | undefined)?.();
    });

    expect(screen.getByRole('dialog')).toBeInTheDocument();
  });
});
```

#### Testing useIsDirty Hook

When testing apps that use `useIsDirty`, mock the `AppTempMemory` store:

```tsx
import { useAppTempMemoryStore } from '@presentation/Store/AppTempMemory';

describe('MyApp with useIsDirty', () => {
  beforeEach(() => {
    useAppTempMemoryStore.setState({ snapshots: {} });
  });

  it('tracks dirty state changes', async () => {
    const { result } = renderHook(() =>
      useIsDirty({
        snapshotRef: { current: 'initial' },
        getCurrentState: () => 'changed',
      }),
    );

    expect(result.current.isDirty).toBe(true);
  });
});
```

#### Testing useCloseInterceptor

For components using `useCloseInterceptor`, test that the close is intercepted:

```tsx
import { useCloseInterceptor } from '@presentation/Hooks/useCloseInterceptor';
import { useCloseModalStore } from '@presentation/Store/closeModalStore';

describe('useCloseInterceptor', () => {
  it('opens modal when dirty', () => {
    const openModal = vi.fn();
    vi.spyOn(useCloseModalStore.getState(), 'openModal', 'get').mockReturnValue(openModal);

    const { rerender } = renderHook(() =>
      useCloseInterceptor({
        isDirtyGetter: () => true,
        windowId: 'win-1',
      }),
    );

    // Trigger close interceptor
    const interceptor = getCloseInterceptor('win-1');
    expect(interceptor?.()).toBe(false); // Should block close
    expect(openModal).toHaveBeenCalled();
  });
});
```

#### Testing Menu Bar Builders

Menu bar builders are pure functions — test them directly without React:

```tsx
import { describe, it, expect, vi } from 'vitest';
import { buildMyAppMenuBar } from './buildMyAppMenuBar';

describe('buildMyAppMenuBar', () => {
  it('exports a File menu', () => {
    const menuBar = buildMyAppMenuBar(vi.fn(), vi.fn(), vi.fn());
    expect(menuBar[0]).toMatchObject({ type: 'menu', label: 'File' });
  });

  it('calls onOpen when Open is clicked', () => {
    const onOpen = vi.fn();
    const menuBar = buildMyAppMenuBar(onOpen, vi.fn(), vi.fn());
    const items = menuBar[0].items;
    items.find(i => i.label === 'Open')?.onClick?.();
    expect(onOpen).toHaveBeenCalledOnce();
  });

  it('disables Save when isDirty is false', () => {
    const onSave = vi.fn();
    const menuBar = buildMyAppMenuBar(vi.fn(), onSave, vi.fn(), false);
    const items = menuBar[0].items;
    const saveItem = items.find(i => i.label === 'Save');
    expect(saveItem?.disabled).toBe(true);
  });
});
```

#### Real Examples

Check these files for real-world test patterns:

- `src/Presentation/Components/Apps/NotesApp/NotesApp.test.tsx` - Full app with notifyReady pattern
- `src/Presentation/Components/Apps/ImageViewerApp/ImageViewerApp.test.tsx` - App with file picker
- `src/Presentation/Components/Apps/SettingsApp/SettingsApp.test.tsx` - Multi-section settings app
- `src/Presentation/Components/Apps/NotesApp/buildNotesMenuBar.test.tsx` - Menu bar builder tests
- `src/Presentation/Components/Apps/SettingsApp/buildSettingsMenuBar.test.tsx` - Menu bar tests

### 4. Store Tests

The Zustand stores are tested directly. Remember to reset stores before each test.

```typescript
// src/Presentation/Store/desktopStore.test.ts
import { describe, it, expect, beforeEach } from 'vitest';
import { desktopStore } from './desktopStore';
import { resetDesktopStore } from '../../Shared/Testing/Utils/resetDesktopStore';

describe('desktopStore', () => {
  beforeEach(() => {
    resetDesktopStore();
  });

  it('opens a window', () => {
    const state = desktopStore.getState();
    state.openWindow({
      title: 'Test',
      content: 'test',
      x: 0,
      y: 0,
      width: 100,
      height: 100,
    });

    expect(desktopStore.getState().windows).toHaveLength(1);
  });
});
```

```typescript
// src/Presentation/Store/settingsStore.test.ts
import { describe, it, expect } from 'vitest';
import { useSettingsStore } from './settingsStore';

describe('settingsStore', () => {
  it('sets wallpaper', () => {
    const store = useSettingsStore.getState();
    store.setWallpaper('/path/to/wallpaper.jpg');
    expect(useSettingsStore.getState().wallpaper).toBe('/path/to/wallpaper.jpg');
  });

  it('toggles theme', () => {
    const store = useSettingsStore.getState();
    const initialMode = store.theme.mode;
    store.toggleTheme();
    expect(useSettingsStore.getState().theme.mode).not.toBe(initialMode);
  });
});
```

## Testing Utilities

The project has helpers in `src/Shared/Testing/`:

### resetDesktopStore.ts

Resets the store before each test. Essential for independent tests.

```typescript
import { resetDesktopStore } from '../../Shared/Testing/Utils/resetDesktopStore';

beforeEach(() => {
  resetDesktopStore();
});
```

### renderWithMantine.tsx

Wrapper that renders the component with the Mantine Provider.

```tsx
import { renderWithMantine } from '../../Shared/Testing/Utils/renderWithMantine';

renderWithMantine(<MyComponent />);
```

### makeWindow.ts / makeWindowEntity.ts

Helpers for creating windows in tests.

```typescript
import { makeWindowInput } from '../../Shared/Testing/Utils/makeWindowInput';

const windowInput = makeWindowInput({
  title: 'Test',
  content: 'test',
});

// Or with full entity:
import { createMockWindowEntity } from '@/Shared/Testing/Utils/makeWindowEntity';

const win = createMockWindowEntity({ contentData: { src: 'test.jpg' } });
```

### Mocks

In `src/Shared/Testing/__mocks__/` there are mocks for:

- **i18n.mock.ts**: i18n mock with real translations for testing i18n-dependent components (`createI18nMock()`)
- **localStorage.mock.ts**: localStorage mock
- **react-rnd.mock.tsx**: react-rnd mock
- **framer-motion.mock.tsx**: framer-motion mock
- **jsdom-setup.tsx**: jsdom setup with i18n mock

### IndexedDB in Tests

Tests that interact with the file system use `fake-indexeddb/auto`, which provides a complete in-memory IndexedDB implementation. Import it at the top of your test file (or rely on the global setup):

```typescript
import 'fake-indexeddb/auto';
```

This makes `IndexedDBFileSystem` and `IndexedDBBlobStore` work in jsdom without any additional mocking.

### Using createI18nMock

For tests that need real translation values (not just keys), use `createI18nMock` from `i18n.mock.ts`:

```typescript
import { createI18nMock } from '@/Shared/Testing/__mocks__/i18n.mock';

const i18nMock = createI18nMock('apps', 'en');

vi.mock('react-i18next', () => ({
  useTranslation: () => i18nMock,
}));

describe('useAppName', () => {
  it('returns translated name', () => {
    const { result } = renderHook(() => useAppName('settings'));
    expect(result.current).toBe('Settings'); // Real translated value
  });
});
```

The mock supports all translation namespaces and languages (`en`, `es`).

### E2E Test Helpers: launcherHelpers

For Playwright E2E tests, use `launcherHelpers.ts` to interact with the Launcher:

```typescript
import {
  openLauncher,
  openAppFromLauncher,
  searchInLauncher,
  closeLauncher,
  getVisibleAppsInLauncher,
} from '@/Shared/Testing/Utils/launcherHelpers';

// Open the launcher panel
await openLauncher(page);

// Open an app by searching for it
await openAppFromLauncher(page, 'Notepad');

// Search without opening
await searchInLauncher(page, 'pdf');

// Get all visible apps
const appNames = await getVisibleAppsInLauncher(page);

// Close the launcher
await closeLauncher(page);
```

These helpers handle waiting for the launcher panel and search input to be ready, making E2E tests more reliable.

**Location**: `src/Shared/Testing/Utils/launcherHelpers.ts`

## Testing with i18n

The test setup includes mocks for both `react-i18next` and `i18next` in `src/Shared/Testing/__mocks__/jsdom-setup.tsx`:

{% raw %}

```typescript
// The mock returns translation keys as values with namespace support
vi.mock('react-i18next', () => ({
  useTranslation: (defaultNs?: string) => ({
    t: (key: string, options?: Record<string, unknown>) => {
      if (options?.defaultValue) return options.defaultValue as string;
      const ns = (options?.ns as string | undefined) ?? defaultNs;
      let result = key;
      if (ns && !result.includes(':')) {
        result = `${ns}:${result}`;
      }
      // Interpolation support: {{name}} -> value
      if (options) {
        Object.entries(options).forEach(([k, v]) => {
          if (k !== 'ns' && k !== 'defaultValue') {
            result = result.replace(new RegExp(`{{\\s*${k}\\s*}}`, 'g'), String(v));
          }
        });
      }
      return result;
    },
    i18n: { changeLanguage: vi.fn(), language: 'en' },
  }),
  Trans: ({ children }) => children,
  initReactI18next: { type: '3rdParty', init: vi.fn() },
}));

// For files that import i18next directly (menu bar builders, etc.)
vi.mock('i18next', () => ({
  default: {
    t: (key: string) => key,
    use: vi.fn(() => mockI18n),
    init: vi.fn(() => mockI18n),
    changeLanguage: vi.fn(),
    language: 'en',
  },
}));
```

{% endraw %}

For tests, prefer using translation keys or aria-labels:

```typescript
// Good: using translation key directly
expect(screen.getByLabelText('window.ariaLabels.close')).toBeInTheDocument();

// Good: using role-based queries with translation keys
expect(screen.getByRole('button', { name: 'common:actions.save' })).toBeInTheDocument();

// Good: testing that a translatable element exists
expect(screen.getByText('apps:notes.title')).toBeInTheDocument();
```

If a test file needs its own i18n mock (e.g., `useLanguageSync.test.ts`):

```typescript
// src/Presentation/Hooks/useLanguageSync.test.ts
const mockChangeLanguage = vi.fn();
const mockI18n = {
  changeLanguage: mockChangeLanguage,
  language: 'en',
};

vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => key,
    i18n: mockI18n,
  }),
  initReactI18next: {
    type: '3rdParty',
    init: vi.fn(),
  },
}));
```

## AAA Pattern

This project follows the AAA (Arrange, Act, Assert) pattern in all tests:

```typescript
it('does something', () => {
  // Arrange: prepare state
  const store = getInitialState();

  // Act: perform action
  const result = store.openWindow({...});

  // Assert: verify result
  expect(result.windows).toHaveLength(1);
});
```

## Domain/Application Layer Tests

These have no external dependencies, so they're easier:

```typescript
// Domain test
import { describe, it, expect } from 'vitest';
import { createWindow } from '../../Domain/Entities/Window';

describe('Window', () => {
  it('creates a window with default values', () => {
    const window = createWindow({ title: 'Test', content: 'test' });

    expect(window.title).toBe('Test');
    expect(window.isOpen).toBe(true);
    expect(window.state).toBe('normal');
  });
});
```

## Practical Tips

### Don't test implementation, test behavior

```typescript
// Bad: testing how it does it
expect(container.querySelector('.button').classList.contains('active'));

// Good: testing what it does
expect(screen.getByRole('button')).toBeDisabled();
```

### Use screen instead of container

```typescript
// Old way (deprecated)
const { container } = render(<Component />);
container.querySelector('button');

// New way (better)
render(<Component />);
screen.getByRole('button');
```

### Mock what you can't control

If a component depends on something external (localStorage, window.resize, etc), mock it:

```typescript
import { vi } from 'vitest';

// localStorage mock
const localStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  clear: vi.fn(),
};
Object.defineProperty(window, 'localStorage', { value: localStorageMock });
```

## Coverage

Run `bun run test:coverage` to see what percentage of the code is tested. The goal is to keep it as high as possible, but prioritize tests for business logic.

## E2E Tests (Playwright)

End-to-end tests verify user flows in a real browser. These tests run against `http://localhost:5173` using Playwright.

### Structure

```
tests/
├── e2e/                    # End-to-end functional tests
│   ├── calendar.e2e.spec.ts         # Calendar app
│   ├── clipboard-operations.e2e.spec.ts  # Clipboard copy/cut/paste
│   ├── desktop.e2e.spec.ts         # Desktop interactions
│   ├── desktop-icons.e2e.spec.ts   # Desktop icon behavior
│   ├── device-info.e2e.spec.ts     # Device info app
│   ├── dos-emulator.e2e.spec.ts    # DOS emulator
│   ├── file-management.e2e.spec.ts # File operations (IndexedDB)
│   ├── image-viewer-zoom.e2e.spec.ts  # Zoom functionality
│   ├── launcher-folders.e2e.spec.ts   # Launcher folder drag/drop
│   ├── notes-dirty-state.e2e.spec.ts  # Notes dirty tracking
│   ├── settings-dirty-state.e2e.spec.ts # Settings dirty tracking
│   ├── sort-icons.e2e.spec.ts      # Icon sorting
│   ├── taskbar-context-menu.e2e.spec.ts  # Taskbar right-click menu
│   ├── uploader.e2e.spec.ts        # Uploader app (IndexedDB)
│   ├── viewport-resize.e2e.spec.ts # Responsive behavior
│   ├── welcome-app.e2e.spec.ts     # Welcome app
│   └── window-management.e2e.spec.ts  # Window operations
├── docker/                 # Docker-specific tests (requires container)
│   ├── code-server.docker.spec.ts
│   ├── file-clipboard.docker.spec.ts
│   ├── file-management.docker.spec.ts
│   ├── runtime.docker.spec.ts
│   └── ...
├── accessibility/          # Accessibility tests
│   └── a11y.a11y.spec.ts
├── integration/            # Integration tests
│   ├── file-creation.integration.spec.ts
│   ├── file-save.integration.spec.ts
│   └── notepad.integration.spec.ts
└── visual/                 # Visual regression tests
    ├── apps/
    │   ├── calendar.visual.spec.ts
    │   ├── device-info.visual.spec.ts
    │   ├── menu-edit.visual.spec.ts
    │   ├── pdf.visual.spec.ts
    │   └── uploader.visual.spec.ts
    ├── desktop/
    └── seo/
        └── meta-tags.visual.spec.ts
```

### Running E2E Tests

```bash
# All E2E tests
bun run test:e2e

# Specific test file
bunx playwright test tests/e2e/calendar.e2e.spec.ts

# With UI for debugging
bunx playwright test --ui

# Single browser
bunx playwright test --project=chromium
```

### E2E Test Pattern

```typescript
import { test, expect } from '@playwright/test';

test.describe('Feature Name', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
  });

  test('should do something', async ({ page }) => {
    // Arrange
    const element = page.locator('[aria-label="Test"]');

    // Act
    await element.click();

    // Assert
    await expect(element).toBeVisible();
  });
});
```

### Docker vs Web Tests

| Test Type   | Environment            | Filesystem             | Location             |
| ----------- | ---------------------- | ---------------------- | -------------------- |
| E2E         | Web (`localhost:5173`) | IndexedDB              | `tests/e2e/`         |
| Docker      | Docker container       | Server API (`/api/fs`) | `tests/docker/`      |
| Visual      | Web                    | IndexedDB              | `tests/visual/`      |
| Integration | Web                    | IndexedDB              | `tests/integration/` |

See [tests/README.md](../../tests/README.md) for full test structure.

## Visual Tests (Playwright Screenshots)

Visual regression tests capture screenshots and compare them against baselines.

### Running Visual Tests

```bash
# Run visual tests
bun run test:visual

# Update snapshots after intentional changes
bun run test:visual:update

# Debug with UI
bun run test:visual:ui
```

### Visual Test Pattern

```typescript
import { test, expect } from '@playwright/test';

test.describe('Component Visual', () => {
  test('component screenshot', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    const component = page.locator('[data-testid="my-component"]');
    await expect(component).toHaveScreenshot('my-component.png');
  });

  test('hover state', async ({ page }) => {
    await page.goto('/');
    const button = page.locator('[data-testid="submit-button"]');
    await button.hover();
    await expect(button).toHaveScreenshot('submit-button-hover.png');
  });
});
```

### Best Practices for Visual Tests

1. **Use `data-testid`**: Always use test IDs, not CSS selectors
2. **Wait for stability**: `await page.waitForLoadState('networkidle')`
3. **Mask dynamic content**: Hide timestamps, dates, random IDs
4. **Consistent viewport**: Use `viewport: { width: 1280, height: 720 }`
5. **Update baselines**: After intentional UI changes

```typescript
// Mask dynamic content
await expect(page).toHaveScreenshot({
  mask: [page.locator('[data-testid="timestamp"]'), page.locator('[data-testid="random-id"]')],
});
```

### Visual Test Locations

- `tests/visual/apps/` - App-specific visual tests
- `tests/visual/desktop/` - Desktop layout tests
- `tests/visual/seo/` - SEO/meta tag tests

## SEO Tests

Tests for SEO-related features: sitemap, robots.txt, and meta tags.

### Tests

| File                                        | Description                                 |
| ------------------------------------------- | ------------------------------------------- |
| `tests/e2e/robots.e2e.spec.ts`              | Verifies `/robots.txt` exists and is valid  |
| `tests/e2e/sitemap.e2e.spec.ts`             | Verifies `/sitemap.xml` exists and is valid |
| `tests/visual/seo/meta-tags.visual.spec.ts` | Screenshots of rendered meta tags           |

### Prerendering

The build process generates static HTML for SEO:

```bash
bun run build      # Build React app
bun run prerender  # Generate static HTML + sitemap
```

**scripts/prerender.ts**:

- Uses `@prerenderer/prerenderer` with Puppeteer
- Waits for `prerender-ready` event
- Generates `sitemap.xml` with lastmod date

### Verifying SEO

```bash
# Check robots.txt
curl http://localhost:5173/robots.txt

# Check sitemap
curl http://localhost:5173/sitemap.xml

# Run SEO tests
bunx playwright test tests/e2e/robots.e2e.spec.ts
bunx playwright test tests/e2e/sitemap.e2e.spec.ts
```

## NPM Package Tests

The `packages/core/` directory has its own test suite for `@fde-desktop/fde-core`.

### Structure

```
packages/core/tests/
├── apps.test.ts      # Verifies CORE_APPS/EXTRA_APPS exports
├── build.test.ts     # Verifies build output exists
└── exports.test.ts   # Verifies all exports work correctly
```

### Running Package Tests

```bash
# Run tests from root
bun run test packages/core/

# Or from packages/core
cd packages/core && bun test
```

### What Package Tests Verify

| Test              | Description                                                 |
| ----------------- | ----------------------------------------------------------- |
| `apps.test.ts`    | CORE_APPS array is valid, all apps have required properties |
| `build.test.ts`   | `dist/` directory exists after build                        |
| `exports.test.ts` | All named exports are accessible and correct type           |

### Pre-publish Checks

The package runs tests before publish:

```json
{
  "scripts": {
    "prepublishOnly": "bun test"
  }
}
```

## Test Helpers

The project provides test utilities in `src/Shared/Testing/`:

### Playwright Helpers

Located in `tests/helpers/`:

```typescript
// tests/helpers/desktop-helpers.ts
export async function closeDefaultWelcomeWindow(page: Page) {
  const closeButton = page.locator('[aria-label="Close window"]').first();
  await closeButton.click();
}

// tests/helpers/docker-helpers.ts
export async function seedTestFile(page: Page, path: string, content: string) {
  await page.evaluate(
    async ({ path, content }) => {
      await window.__FDE_API__.fs.createFile(path, content, null);
    },
    { path, content } as const,
  );
}
```

### Unit Test Helpers

Located in `src/Shared/Testing/`:

```typescript
// Reset store before each test
import { resetDesktopStore } from '@/Shared/Testing/Utils/resetDesktopStore';

// Render with Mantine provider
import { renderWithMantine } from '@/Shared/Testing/Utils/renderWithMantine';

// Create mock window entity
import { createMockWindowEntity } from '@/Shared/Testing/Utils/makeWindowEntity';

// i18n mock with real translations
import { createI18nMock } from '@/Shared/Testing/__mocks__/i18n.mock';
```
