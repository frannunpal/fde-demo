import type { FileNode } from '@fde-desktop/fde-core';
import type { FolderNode } from '@fde-desktop/fde-core';
import type { CreateTestIconOptions } from '@/Shared/Testing/Types/testTypes';
import type { DesktopIconEntity } from '@fde-desktop/fde-core';

/**
 * Create consistent timestamps for testing
 * Uses fixed dates to ensure reproducible test results
 */
export const TEST_TIMESTAMPS = {
  createdAt: new Date('2026-01-01T00:00:00Z'),
  updatedAt: new Date('2026-01-01T00:00:00Z'),
};

/**
 * Create timestamps with overrides
 */
export const createTimestamps = (overrides: { createdAt?: Date; updatedAt?: Date } = {}) => ({
  createdAt: overrides.createdAt ?? TEST_TIMESTAMPS.createdAt,
  updatedAt: overrides.updatedAt ?? TEST_TIMESTAMPS.updatedAt,
});

/**
 * Create a mock FileNode for testing
 *
 * @param overrides - Partial file node properties
 * @returns Complete FileNode with defaults
 *
 * @example
 * const file = createMockFileNode({
 *   id: 'custom-id',
 *   name: 'test.md',
 *   mimeType: 'text/markdown',
 * });
 */
export function createMockFileNode(overrides: Partial<FileNode> = {}): FileNode {
  return {
    id: 'test-file-id',
    name: 'test-file.txt',
    type: 'file',
    content: '',
    mimeType: 'text/plain',
    url: 'Desktop/test-file.txt',
    parentId: null,
    ...TEST_TIMESTAMPS,
    ...overrides,
  };
}

/**
 * Create a mock FolderNode for testing
 *
 * @param id - Folder ID
 * @param overrides - Additional folder properties
 * @returns Complete FolderNode with defaults
 *
 * @example
 * const folder = createMockFolderNode('folder-id', {
 *   name: 'Documents',
 * });
 */
export function createMockFolderNode(id: string, overrides: Partial<FolderNode> = {}): FolderNode {
  return {
    id,
    name: 'TestFolder',
    type: 'folder',
    parentId: null,
    children: [],
    ...TEST_TIMESTAMPS,
    ...overrides,
  };
}

/**
 * Create a test icon for desktop
 *
 * @param options - Icon configuration
 * @returns Complete DesktopIconEntity with defaults
 *
 * @example
 * const icon = createTestIcon({
 *   name: 'notes.md',
 *   appId: 'notepad',
 *   nodeId: 'file-123',
 * });
 */
export function createTestIcon(options: CreateTestIconOptions): DesktopIconEntity {
  return {
    id: options.id ?? `icon-${options.nodeId}`,
    name: options.name,
    icon: options.icon ?? '📄',
    appId: options.appId,
    nodeId: options.nodeId,
    x: options.x ?? 20,
    y: options.y ?? 20,
  };
}
