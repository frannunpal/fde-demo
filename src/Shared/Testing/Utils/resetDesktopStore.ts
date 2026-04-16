import { vi } from 'vitest';
import type { StoreApi, UseBoundStore } from 'zustand';
import type { DesktopState } from '@fde-desktop/fde-core';

type LocalStorageMock = { clear: () => void };

export const resetDesktopStore = (
  store: UseBoundStore<StoreApi<DesktopState>>,
  localStorageMock: LocalStorageMock,
  extraReset?: () => void,
) => {
  vi.clearAllMocks();
  extraReset?.();
  localStorageMock.clear();
  store.setState({ windows: [], icons: [], fsNodes: [], isFsReady: true });
};
