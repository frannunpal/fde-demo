import type { WindowEntity } from '@fde-desktop/fde-core';

export const makeWindow = (overrides: Partial<WindowEntity> = {}): WindowEntity => {
  const content = overrides.content ?? 'notepad';
  const defaultId = `${content}-story`;

  return {
    id: defaultId,
    title: 'Test Window',
    content: 'notepad',
    x: 100,
    y: 100,
    width: 800,
    height: 600,
    minWidth: 200,
    minHeight: 150,
    isOpen: true,
    state: 'normal',
    zIndex: 1,
    ...overrides,
  };
};
