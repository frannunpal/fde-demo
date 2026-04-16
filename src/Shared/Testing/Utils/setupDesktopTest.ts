import { vi } from 'vitest';
import { createLocalStorageMock } from '@/Shared/Testing/__mocks__/localStorage.mock';
import { resetDesktopStore } from './resetDesktopStore';

/**
 * Sets up localStorage mock for tests.
 * Returns the mock for assertions.
 *
 * @example
 * // In your test file:
 * import { setupDesktopTest } from '@/Shared/Testing/Utils/setupDesktopTest';
 *
 * const localStorageMock = setupDesktopTest();
 *
 * // Use in assertions:
 * expect(localStorageMock.setItem).toHaveBeenCalledWith('key', 'value');
 */
export function setupDesktopTest(): Storage {
  const localStorageMock = createLocalStorageMock();
  vi.stubGlobal('localStorage', localStorageMock);
  return localStorageMock;
}

/**
 * Sets up localStorage mock and resets desktopStore.
 * Useful for tests that interact with the desktop state.
 *
 * @example
 * // In your test file:
 * import { setupDesktopTestWithStore } from '@/Shared/Testing/Utils/setupDesktopTest';
 *
 * beforeEach(() => {
 *   const { localStorageMock, useDesktopStore } = setupDesktopTestWithStore();
 * });
 */
export async function setupDesktopTestWithStore(): Promise<{
  localStorageMock: Storage;
  useDesktopStore: typeof import('@fde-desktop/fde-core').useDesktopStore;
}> {
  const localStorageMock = createLocalStorageMock();
  vi.stubGlobal('localStorage', localStorageMock);

  const { useDesktopStore } = await import('@fde-desktop/fde-core');
  resetDesktopStore(useDesktopStore, localStorageMock);

  return { localStorageMock, useDesktopStore };
}
