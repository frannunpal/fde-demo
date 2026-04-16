import { describe, it, expect } from 'vitest';
import { createMockStore, createStoreSelector, makeMockStore, defaultMockStore } from './renderApp';

describe('renderApp utilities', () => {
  describe('createMockStore', () => {
    it('should create a store with default values', () => {
      const store = createMockStore();

      expect(store.fsNodes).toEqual([]);
      expect(store.windows).toEqual([]);
      expect(store.icons).toEqual([]);
      expect(store.filesCurrentFolderId).toBeNull();
      expect(store.customApps).toEqual([]);
      expect(typeof store.openWindow).toBe('function');
      expect(typeof store.closeWindow).toBe('function');
    });

    it('should override default values', () => {
      const store = createMockStore({
        filesCurrentFolderId: 'folder-123',
        fsNodes: [{ id: 'file-1', name: 'test.txt' }],
      });

      expect(store.filesCurrentFolderId).toBe('folder-123');
      expect(store.fsNodes).toHaveLength(1);
    });
  });

  describe('createStoreSelector', () => {
    it('should create a selector function that returns state slices', () => {
      const store = createMockStore({ filesCurrentFolderId: 'folder-1' });
      const selector = createStoreSelector(store);

      const result = selector(s => s.filesCurrentFolderId);

      expect(result).toBe('folder-1');
    });

    it('should work with complex selectors', () => {
      const store = createMockStore({
        fsNodes: [{ id: 'file-1' }, { id: 'file-2' }],
      });
      const selector = createStoreSelector(store);

      const nodeCount = selector(s => s.fsNodes.length);

      expect(nodeCount).toBe(2);
    });
  });

  describe('makeMockStore', () => {
    it('should return store and selector', () => {
      const { store, selector } = makeMockStore({ filesCurrentFolderId: 'folder-xyz' });

      expect(store.filesCurrentFolderId).toBe('folder-xyz');
      expect(selector(s => s.filesCurrentFolderId)).toBe('folder-xyz');
    });

    it('should allow selector to access all store properties', () => {
      const { selector } = makeMockStore({
        windows: [{ id: 'win-1' }],
      });

      expect(selector(s => s.windows)).toEqual([{ id: 'win-1' }]);
      expect(selector(s => s.customApps)).toEqual([]);
    });
  });

  describe('defaultMockStore', () => {
    it('should have all required properties', () => {
      expect(defaultMockStore).toHaveProperty('fsNodes');
      expect(defaultMockStore).toHaveProperty('windows');
      expect(defaultMockStore).toHaveProperty('icons');
      expect(defaultMockStore).toHaveProperty('openWindow');
      expect(defaultMockStore).toHaveProperty('closeWindow');
      expect(defaultMockStore).toHaveProperty('createFile');
      expect(defaultMockStore).toHaveProperty('createFolder');
      expect(defaultMockStore).toHaveProperty('setFilesCurrentFolderId');
      expect(defaultMockStore).toHaveProperty('notifications');
      expect(defaultMockStore).toHaveProperty('customApps');
      expect(defaultMockStore).toHaveProperty('contextMenu');
    });
  });
});
