import type { UseBoundStore, StoreApi } from 'zustand';
import type { DesktopState } from '@fde-desktop/fde-core';
import type {
  TestDesktopState,
  CreateTestFileStateOptions,
  CreateTestFolderStateOptions,
} from '@/Shared/Testing/Types/testTypes';
import { createTestIcon, createMockFolderNode } from './testFactories';

// Re-export factories for convenience
export { createMockFileNode, createMockFolderNode, createTestIcon } from './testFactories';

/**
 * Type-safe setState for DesktopStore in tests
 * Zustand already supports Partial<T> by design
 *
 * @param store - DesktopStore instance
 * @param state - Partial state to set
 *
 * @example
 * setTestState(useDesktopStore, {
 *   windows: [],
 *   icons: [myIcon],
 *   fsNodes: [myFile],
 * });
 */
export function setTestState(
  store: UseBoundStore<StoreApi<DesktopState>>,
  state: TestDesktopState,
): void {
  store.setState(state);
}

/**
 * Create complete test state for a file on desktop
 * Includes the file, its icon, and optionally the desktop folder
 *
 * @param options - Configuration options
 * @returns Complete TestDesktopState ready to use
 *
 * @example
 * const state = createTestFileState({
 *   file: createMockFileNode({ name: 'notes.md', mimeType: 'text/markdown' }),
 *   appId: 'notepad',
 * });
 * setTestState(useDesktopStore, state);
 */
export function createTestFileState(options: CreateTestFileStateOptions): TestDesktopState {
  const { file, appId, iconId, position, includeDesktop = true } = options;

  const fsNodes = includeDesktop
    ? [createMockFolderNode('folder-desktop', { name: 'Desktop' }), file]
    : [file];

  return {
    windows: [],
    icons: [
      createTestIcon({
        id: iconId,
        name: file.name,
        icon: '📄',
        appId,
        nodeId: file.id,
        x: position?.x ?? 20,
        y: position?.y ?? 20,
      }),
    ],
    fsNodes,
  };
}

/**
 * Create complete test state for a folder on desktop
 *
 * @param options - Configuration options
 * @returns Complete TestDesktopState ready to use
 *
 * @example
 * const state = createTestFolderState({
 *   folder: createMockFolderNode('folder-docs', { name: 'Documents' }),
 *   appId: 'files',
 * });
 * setTestState(useDesktopStore, state);
 */
export function createTestFolderState(options: CreateTestFolderStateOptions): TestDesktopState {
  const { folder, appId, iconId, position } = options;

  return {
    windows: [],
    icons: [
      createTestIcon({
        id: iconId,
        name: folder.name,
        icon: '📁',
        appId,
        nodeId: folder.id,
        x: position?.x ?? 20,
        y: position?.y ?? 20,
      }),
    ],
    fsNodes: [folder],
  };
}

/**
 * Create default test state (empty desktop with folder)
 * Useful for beforeEach setup
 *
 * @returns Default TestDesktopState
 *
 * @example
 * beforeEach(() => {
 *   resetDesktopStore(useDesktopStore, localStorageMock);
 *   setTestState(useDesktopStore, createDefaultTestState());
 * });
 */
export function createDefaultTestState(): TestDesktopState {
  return {
    windows: [],
    icons: [],
    fsNodes: [createMockFolderNode('folder-desktop', { name: 'Desktop' })],
  };
}
