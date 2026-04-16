import type { WindowEntity } from '@fde-desktop/fde-core';

export const createMockWindowEntity = (overrides: Partial<WindowEntity> = {}): WindowEntity => ({
  id: 'test-window',
  title: 'Test Window',
  content: 'test',
  x: 0,
  y: 0,
  width: 800,
  height: 600,
  minWidth: 640,
  minHeight: 480,
  isOpen: true,
  state: 'normal',
  zIndex: 1,
  contentData: {},
  ...overrides,
});
