import type { WindowEntity } from '@fde-desktop/fde-core';

export type WindowState = 'normal' | 'minimized' | 'maximized';

export type WindowInput = Omit<WindowEntity, 'id' | 'isOpen' | 'state' | 'zIndex'>;
