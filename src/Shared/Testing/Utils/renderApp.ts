import { vi } from 'vitest';
import { render, type RenderResult, type RenderOptions } from '@testing-library/react';
import { renderWithMantine } from './renderWithMantine';
import type { ReactElement } from 'react';

type MockFn = ReturnType<typeof vi.fn>;

interface MockStoreState {
  fsNodes: unknown[];
  windows: unknown[];
  icons: unknown[];
  filesCurrentFolderId: string | null;
  openWindow: MockFn;
  closeWindow: MockFn;
  createFile: MockFn;
  createFolder: MockFn;
  setFilesCurrentFolderId: MockFn;
  openContextMenu: MockFn;
  closeContextMenu: MockFn;
  contextMenu: { x: number; y: number; owner: string | null; targetNodeId?: string };
  notifications: unknown[];
  addNotification: MockFn;
  removeNotification: MockFn;
  customApps: Array<{ id: string; name: string; icon?: string }>;
  [key: string]: unknown;
}

const defaultMockStore: MockStoreState = {
  fsNodes: [],
  windows: [],
  icons: [],
  filesCurrentFolderId: null,
  openWindow: vi.fn(),
  closeWindow: vi.fn(),
  createFile: vi.fn(),
  createFolder: vi.fn(),
  setFilesCurrentFolderId: vi.fn(),
  openContextMenu: vi.fn(),
  closeContextMenu: vi.fn(),
  contextMenu: { x: 0, y: 0, owner: null },
  notifications: [],
  addNotification: vi.fn(),
  removeNotification: vi.fn(),
  customApps: [],
};

function createMockStore(overrides?: Partial<MockStoreState>): MockStoreState {
  const store: MockStoreState = { ...defaultMockStore };

  if (overrides) {
    Object.keys(overrides).forEach(key => {
      (store as Record<string, unknown>)[key] = overrides[key];
    });
  }

  return store;
}

/**
 * Creates a selector function compatible with Zustand's useStore pattern.
 * Use this in vi.mock() for desktopStore.
 *
 * @example
 * const mockStore = createMockStore({ filesCurrentFolderId: 'folder-1' });
 * vi.mock('@presentation/Store/desktopStore', () => ({
 *   useDesktopStore: createStoreSelector(mockStore),
 * }));
 */
function createStoreSelector<T extends MockStoreState>(store: T) {
  return (selector: (s: T) => unknown) => selector(store);
}

/**
 * Higher-order function to create a mock store selector for tests.
 * Returns a selector function that extracts data from the mock store.
 *
 * @example
 * // In your test file:
 * const mockStore = makeMockStore({ openWindow: vi.fn() });
 * vi.mock('@presentation/Store/desktopStore', () => ({
 *   useDesktopStore: mockStore.selector,
 * }));
 */
function makeMockStore<T extends Partial<MockStoreState>>(overrides?: T) {
  const store = createMockStore(overrides);
  const selector = (sel: (s: MockStoreState) => unknown) => sel(store);
  return { store, selector };
}

type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P];
};

function renderWithMantineWrapper<T extends ReactElement>(
  ui: T,
  options?: Omit<RenderOptions, 'wrapper'>,
): RenderResult {
  return render(ui, { wrapper: renderWithMantine as never, ...options });
}

export {
  createMockStore,
  createStoreSelector,
  makeMockStore,
  defaultMockStore,
  renderWithMantineWrapper as renderApp,
};
export type { MockStoreState, DeepPartial };
