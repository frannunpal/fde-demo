import type { DesktopState } from '@fde-desktop/fde-core';

/**
 * Partial state for testing DesktopStore
 * Zustand supports Partial<T> by design, so this is type-safe
 */
export type TestDesktopState = Pick<DesktopState, 'windows' | 'icons' | 'fsNodes'>;

/**
 * Options for creating a test icon
 */
export interface CreateTestIconOptions {
  /** Icon ID (defaults to `icon-${nodeId}`) */
  id?: string;
  /** Display name */
  name: string;
  /** Emoji or icon identifier (defaults to '📄') */
  icon?: string;
  /** App ID to open */
  appId: string;
  /** Node ID this icon points to */
  nodeId: string;
  /** X position (defaults to 20) */
  x?: number;
  /** Y position (defaults to 20) */
  y?: number;
}

/**
 * Options for creating test file state
 */
export interface CreateTestFileStateOptions {
  /** File node to create state for */
  file: import('@fde-desktop/fde-core').FileNode;
  /** App ID to open the file with */
  appId: string;
  /** Icon ID (defaults to `icon-${file.id}`) */
  iconId?: string;
  /** Position on desktop */
  position?: { x: number; y: number };
  /** Include default desktop folder in fsNodes (defaults to true) */
  includeDesktop?: boolean;
}

/**
 * Options for creating test folder state
 */
export interface CreateTestFolderStateOptions {
  /** Folder node to create state for */
  folder: import('@fde-desktop/fde-core').FolderNode;
  /** App ID to open the folder with */
  appId: string;
  /** Icon ID (defaults to `icon-${folder.id}`) */
  iconId?: string;
  /** Position on desktop */
  position?: { x: number; y: number };
}

/**
 * Options for creating test folder state
 */
export interface CreateTestFolderStateOptions {
  /** Folder node to create state for */
  folder: import('@fde-desktop/fde-core').FolderNode;
  /** App ID to open the folder with */
  appId: string;
  /** Icon ID (defaults to `icon-${folder.id}`) */
  iconId?: string;
  /** Position on desktop */
  position?: { x: number; y: number };
}
