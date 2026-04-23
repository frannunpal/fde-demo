import type { FSNode } from '@fde-desktop/fde-core';
import {
  createMockFileNode,
  createMockFolderNode,
  makeWindow,
  createMockWindowEntity,
} from '@/Shared/Testing/Utils';
import AppWithPickerOpen from '@fde-desktop/fde-core-test/Utils/AppWithPickerOpen';

// Re-export utilities
export {
  makeWindow,
  AppWithPickerOpen,
  createMockFileNode,
  createMockFolderNode,
  createMockWindowEntity,
};

// Tipos
export type { FSNode, WindowEntity } from '@fde-desktop/fde-core';

/**
 * FSNodes básicos: carpetas raíz + archivos comunes
 * Uso: FilesApp, UploaderApp, cualquier app que necesite estructura simple
 */
export function createBasicFsNodes(): FSNode[] {
  return [
    createMockFolderNode('folder-documents', { name: 'Documents', parentId: null }),
    createMockFolderNode('folder-images', { name: 'Images', parentId: null }),
    createMockFileNode({
      id: 'file-readme',
      name: 'readme.txt',
      parentId: null,
      mimeType: 'text/plain',
    }),
  ];
}

/**
 * FSNodes con estructura anidada (carpeta dentro de carpeta)
 * Uso: probar navegación jerárquica en FilesApp
 */
export function createNestedFsNodes(): FSNode[] {
  return [
    createMockFolderNode('folder-documents', {
      name: 'Documents',
      parentId: null,
      children: ['folder-projects'],
    }),
    createMockFolderNode('folder-projects', {
      name: 'Projects',
      parentId: 'folder-documents',
      children: [],
    }),
    createMockFileNode({
      id: 'file-notes',
      name: 'notes.md',
      parentId: 'folder-documents',
      mimeType: 'text/markdown',
    }),
    createMockFolderNode('folder-desktop', { name: 'Desktop', parentId: null }),
    createMockFileNode({
      id: 'file-readme',
      name: 'readme.txt',
      parentId: null,
      mimeType: 'text/plain',
    }),
  ];
}

/**
 * FSNodes con imágenes (URLs desde public/Images/)
 * Uso: ImageViewerApp, FilePickerApp con filtro de imágenes
 */
export function createImageFsNodes(): FSNode[] {
  return [
    createMockFolderNode('folder-images', {
      name: 'Images',
      parentId: null,
      children: ['file-wallpaper', 'file-wallpaper2'],
    }),
    createMockFileNode({
      id: 'file-wallpaper',
      name: 'wallpaper.jpg',
      parentId: 'folder-images',
      mimeType: 'image/jpeg',
      url: `${import.meta.env.BASE_URL}Images/wallpaper.jpg`,
    }),
    createMockFileNode({
      id: 'file-wallpaper2',
      name: 'wallpaper2.jpg',
      parentId: 'folder-images',
      mimeType: 'image/jpeg',
      url: `${import.meta.env.BASE_URL}Images/wallpaper2.jpg`,
    }),
  ];
}

/**
 * FSNodes con documentos (PDF, markdown)
 * Uso: PdfApp, NotesApp, FilePickerApp
 */
export function createDocumentFsNodes(): FSNode[] {
  return [
    createMockFolderNode('folder-desktop', {
      name: 'Desktop',
      parentId: null,
      children: ['file-cv'],
    }),
    createMockFileNode({
      id: 'file-cv',
      name: 'CV_2026_English.pdf',
      parentId: 'folder-desktop',
      mimeType: 'application/pdf',
      url: `${import.meta.env.BASE_URL}Desktop/CV_2026_English.pdf`,
    }),
    createMockFolderNode('folder-documents', {
      name: 'Documents',
      parentId: null,
      children: ['file-notes'],
    }),
    createMockFileNode({
      id: 'file-notes',
      name: 'notes.md',
      parentId: 'folder-documents',
      mimeType: 'text/markdown',
      content: '# My Notes\n\nThis is a markdown file.',
    }),
  ];
}

/**
 * FSNodes completos (carpetas, subcarpetas, archivos variados con URLs)
 * Uso: FilePickerApp, cualquier app que necesite estructura completa
 */
export function createFullFsNodes(): FSNode[] {
  return [
    ...createImageFsNodes(),
    createMockFolderNode('folder-desktop', {
      name: 'Desktop',
      parentId: null,
      children: ['file-cv'],
    }),
    createMockFileNode({
      id: 'file-cv',
      name: 'CV_2026_English.pdf',
      parentId: 'folder-desktop',
      mimeType: 'application/pdf',
      url: `${import.meta.env.BASE_URL}Desktop/CV_2026_English.pdf`,
    }),
    createMockFolderNode('folder-documents', {
      name: 'Documents',
      parentId: null,
      children: ['file-notes', 'folder-projects'],
    }),
    createMockFolderNode('folder-projects', {
      name: 'Projects',
      parentId: 'folder-documents',
      children: [],
    }),
    createMockFileNode({
      id: 'file-notes',
      name: 'notes.md',
      parentId: 'folder-documents',
      mimeType: 'text/markdown',
      content: '# My Notes\n\nThis is a markdown file.',
    }),
  ];
}
