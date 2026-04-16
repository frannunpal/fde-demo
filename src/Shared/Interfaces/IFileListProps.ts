import type { FSNode } from '@/Shared/Types/FileSystemTypes';
import type { FileNode } from '@fde-desktop/fde-core';

export interface FileListProps {
  nodes: FSNode[];
  onNavigate: (id: string) => void;
  onOpenFile: (node: FileNode) => void;
  onNodeContextMenu: (e: React.MouseEvent, nodeId: string) => void;
}

export interface FileListItemProps {
  node: FSNode;
  onNavigate: (id: string) => void;
  onOpenFile: (node: FileNode) => void;
  onContextMenu: (e: React.MouseEvent, nodeId: string) => void;
}
