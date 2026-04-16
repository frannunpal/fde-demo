import { vi } from 'vitest';
import { APP_ID_TO_TRANSLATION_KEY } from '@fde-desktop/fde-core';

/**
 * Mock for useNotifications hook.
 * Returns mock functions for testing notification behavior.
 *
 * @example
 * // In your test file:
 * vi.mock('@presentation/Hooks/useNotifications', () => ({
 *   useNotifications: () => ({
 *     notify: vi.fn(),
 *     notifications: [],
 *     addNotification: vi.fn(),
 *     removeNotification: vi.fn(),
 *   }),
 * }));
 */
export const mockUseNotifications = () => ({
  notify: vi.fn(),
  notifications: [] as unknown[],
  dismiss: vi.fn(),
  addNotification: vi.fn(),
  removeNotification: vi.fn(),
});

/**
 * Default app name mappings for useAppName mock.
 * Apps with mismatching IDs to translation keys use APP_ID_TO_TRANSLATION_KEY.
 * Other apps default to their appId as the translation key.
 */
const DEFAULT_APP_NAMES: Record<string, string> = {
  notepad: 'Notepad',
  uploader: 'Uploader',
  files: 'Files',
  settings: 'Settings',
  pdf: 'PDF Viewer',
  calendar: 'Calendar',
  storybook: 'Storybook',
  linkedin: 'LinkedIn',
  github: 'GitHub',
  'image-viewer': 'Image Viewer',
  'dos-emulator': 'DOS Emulator',
  doom: 'DOOM',
  terminal: 'Terminal',
  'device-info': 'Device Info',
  menuedit: 'MenuEdit',
  welcome: 'Welcome',
  'code-server': 'VS Code',
};

Object.keys(APP_ID_TO_TRANSLATION_KEY).forEach(appId => {
  const translationKey = APP_ID_TO_TRANSLATION_KEY[appId];
  if (!DEFAULT_APP_NAMES[appId] && translationKey) {
    const capitalized = translationKey
      .replace(/([A-Z])/g, ' $1')
      .trim()
      .replace(/^./, str => str.toUpperCase());
    DEFAULT_APP_NAMES[appId] = capitalized;
  }
});

/**
 * Creates a useAppName mock function.
 * @param customNames - Optional custom app name mappings to merge with defaults
 *
 * @example
 * // In your test file:
 * vi.mock('@presentation/Hooks/useAppName', () => ({
 *   useAppName: (appId: string | undefined) => {
 *     if (!appId) return '';
 *     const names = { notepad: 'Notepad', files: 'Files' };
 *     return names[appId] ?? appId;
 *   },
 * }));
 */
export const createAppNameMock = (customNames?: Record<string, string>) => {
  const names = customNames ? { ...DEFAULT_APP_NAMES, ...customNames } : DEFAULT_APP_NAMES;
  return (appId: string | undefined) => {
    if (!appId) return '';
    return names[appId] ?? appId;
  };
};

/**
 * Creates a useOpenApp mock function.
 *
 * @example
 * // In your test file:
 * const mockOpenApp = vi.fn();
 * vi.mock('@presentation/Hooks/useOpenApp', () => ({
 *   useOpenApp: () => mockOpenApp,
 * }));
 */
export const createOpenAppMock = () => vi.fn();
