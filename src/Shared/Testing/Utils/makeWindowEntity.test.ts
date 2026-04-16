import { describe, it, expect } from 'vitest';
import { createMockWindowEntity } from './makeWindowEntity';
import type { WindowEntity } from '@fde-desktop/fde-core';

describe('createMockWindowEntity', () => {
  describe('default values', () => {
    it('should return an object with a default id', () => {
      // Act
      const entity = createMockWindowEntity();

      // Assert
      expect(entity.id).toBe('test-window');
    });

    it('should return an object with a default title', () => {
      // Act
      const entity = createMockWindowEntity();

      // Assert
      expect(entity.title).toBe('Test Window');
    });

    it('should return an object with default position (0, 0)', () => {
      // Act
      const entity = createMockWindowEntity();

      // Assert
      expect(entity.x).toBe(0);
      expect(entity.y).toBe(0);
    });

    it('should return an object with default dimensions', () => {
      // Act
      const entity = createMockWindowEntity();

      // Assert
      expect(entity.width).toBe(800);
      expect(entity.height).toBe(600);
    });

    it('should return an object with default minimum dimensions', () => {
      // Act
      const entity = createMockWindowEntity();

      // Assert
      expect(entity.minWidth).toBe(640);
      expect(entity.minHeight).toBe(480);
    });

    it('should return an object with isOpen set to true', () => {
      // Act
      const entity = createMockWindowEntity();

      // Assert
      expect(entity.isOpen).toBe(true);
    });

    it('should return an object with state set to normal', () => {
      // Act
      const entity = createMockWindowEntity();

      // Assert
      expect(entity.state).toBe('normal');
    });

    it('should return an object with zIndex set to 1', () => {
      // Act
      const entity = createMockWindowEntity();

      // Assert
      expect(entity.zIndex).toBe(1);
    });

    it('should return an object with empty contentData', () => {
      // Act
      const entity = createMockWindowEntity();

      // Assert
      expect(entity.contentData).toEqual({});
    });
  });

  describe('overrides', () => {
    it('should override the title', () => {
      // Act
      const entity = createMockWindowEntity({ title: 'Custom Title' });

      // Assert
      expect(entity.title).toBe('Custom Title');
    });

    it('should override the id', () => {
      // Act
      const entity = createMockWindowEntity({ id: 'custom-id' });

      // Assert
      expect(entity.id).toBe('custom-id');
    });

    it('should override contentData', () => {
      // Act
      const entity = createMockWindowEntity({ contentData: { src: 'Desktop/file.pdf' } });

      // Assert
      expect(entity.contentData).toEqual({ src: 'Desktop/file.pdf' });
    });

    it('should override multiple fields simultaneously', () => {
      // Act
      const entity = createMockWindowEntity({ title: 'X', width: 1024, height: 768 });

      // Assert
      expect(entity.title).toBe('X');
      expect(entity.width).toBe(1024);
      expect(entity.height).toBe(768);
    });

    it('should keep non-overridden defaults intact', () => {
      // Act
      const entity = createMockWindowEntity({ title: 'Only Title Changed' });

      // Assert
      expect(entity.id).toBe('test-window');
      expect(entity.isOpen).toBe(true);
    });
  });

  describe('type compatibility', () => {
    it('should satisfy the WindowEntity type', () => {
      // Act
      const entity = createMockWindowEntity();

      // Assert — TypeScript compile-time check via explicit type annotation
      const typed: WindowEntity = entity;
      expect(typed).toBeDefined();
    });
  });
});
