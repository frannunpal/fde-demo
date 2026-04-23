import 'fake-indexeddb/auto';
import '@testing-library/jest-dom';
import { afterEach, beforeEach, vi } from 'vitest';
import { cleanup } from '@testing-library/react';
import './react-icons.mock';
import { createLocalStorageMock } from './localStorage.mock';

const localStorageMock = createLocalStorageMock();
Object.defineProperty(globalThis, 'localStorage', { value: localStorageMock, writable: true });

Object.defineProperty(globalThis, 'navigator', {
  value: {
    language: 'en-US',
    userAgent: 'Mozilla/5.0 (Test Environment) jsdom',
  },
  writable: true,
});

vi.spyOn(console, 'log').mockImplementation(() => {});

beforeEach(() => {
  localStorageMock.clear();
  vi.clearAllMocks();
});

global.ResizeObserver = class ResizeObserver {
  observe() {}
  unobserve() {}
  disconnect() {}
};

if (typeof window !== 'undefined') {
  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: (query: string) => ({
      matches: false,
      media: query,
      onchange: null,
      addListener: () => {},
      removeListener: () => {},
      addEventListener: () => {},
      removeEventListener: () => {},
      dispatchEvent: () => false,
    }),
  });
}

vi.mock('react-i18next', () => ({
  useTranslation: (defaultNs?: string) => ({
    t: (key: string, options?: Record<string, unknown>) => {
      if (options?.defaultValue) return options.defaultValue as string;

      const ns = (options?.ns as string | undefined) ?? defaultNs;
      let result = key;

      if (ns && !result.includes(':')) {
        result = `${ns}:${result}`;
      }

      if (options) {
        Object.entries(options).forEach(([k, v]) => {
          if (k !== 'ns' && k !== 'defaultValue') {
            result = result.replace(new RegExp(`{{\\s*${k}\\s*}}`, 'g'), String(v));
          }
        });
      }
      return result;
    },
    i18n: {
      changeLanguage: vi.fn(),
      language: 'en',
    },
  }),
  Trans: ({ children }: { children: React.ReactNode }) => children,
  initReactI18next: {
    type: '3rdParty',
    init: vi.fn(),
  },
}));

vi.mock('i18next', () => {
  const mockI18n = {
    t: (key: string) => key,
    use: vi.fn(() => mockI18n),
    init: vi.fn(() => mockI18n),
    changeLanguage: vi.fn(),
    language: 'en',
  };
  return { default: mockI18n };
});

afterEach(async () => {
  cleanup();
  await new Promise(resolve => setTimeout(resolve, 0));
});
