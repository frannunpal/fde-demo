import type { FileNode } from '@fde-desktop/fde-core';
import type { FolderNode } from '@fde-desktop/fde-core';

export type FileSystemNodeType = 'file' | 'folder';

export type FSNode = FileNode | FolderNode;
