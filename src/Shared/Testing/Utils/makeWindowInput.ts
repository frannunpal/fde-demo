import type { WindowInput } from '@/Shared/Types/WindowTypes';

export const makeWindowInput = (overrides: Partial<WindowInput> = {}): WindowInput => ({
  title: 'Test Window',
  content: 'notepad',
  x: 100,
  y: 100,
  width: 800,
  height: 600,
  minWidth: 200,
  minHeight: 150,
  ...overrides,
});
