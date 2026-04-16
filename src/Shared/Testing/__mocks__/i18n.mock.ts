import { vi } from 'vitest';

import enApps from '@shared/Locales/en/apps.json';
import enSettings from '@shared/Locales/en/settings.json';
import enWindow from '@shared/Locales/en/window.json';
import enCommon from '@shared/Locales/en/common.json';
import enContextMenu from '@shared/Locales/en/contextMenu.json';
import enNotifications from '@shared/Locales/en/notifications.json';
import enNotes from '@shared/Locales/en/notes.json';
import enWelcome from '@shared/Locales/en/welcome.json';

import esApps from '@shared/Locales/es/apps.json';
import esSettings from '@shared/Locales/es/settings.json';
import esWindow from '@shared/Locales/es/window.json';
import esCommon from '@shared/Locales/es/common.json';
import esContextMenu from '@shared/Locales/es/contextMenu.json';
import esNotifications from '@shared/Locales/es/notifications.json';
import esNotes from '@shared/Locales/es/notes.json';
import esWelcome from '@shared/Locales/es/welcome.json';

type TranslationMap = Record<string, unknown>;
type SupportedLanguage = 'en' | 'es';
type Namespace =
  | 'apps'
  | 'settings'
  | 'window'
  | 'common'
  | 'contextMenu'
  | 'notifications'
  | 'notes'
  | 'welcome';

const translations: Record<SupportedLanguage, Record<Namespace, TranslationMap>> = {
  en: {
    apps: enApps,
    settings: enSettings,
    window: enWindow,
    common: enCommon,
    contextMenu: enContextMenu,
    notifications: enNotifications,
    notes: enNotes,
    welcome: enWelcome,
  },
  es: {
    apps: esApps,
    settings: esSettings,
    window: esWindow,
    common: esCommon,
    contextMenu: esContextMenu,
    notifications: esNotifications,
    notes: esNotes,
    welcome: esWelcome,
  },
};

function getNestedValue(obj: TranslationMap, path: string): string | undefined {
  return path.split('.').reduce<unknown>((acc, key) => {
    if (acc && typeof acc === 'object' && key in acc) {
      return (acc as Record<string, unknown>)[key];
    }
    return undefined;
  }, obj) as string | undefined;
}

export function createI18nMock(namespace: Namespace = 'apps', language: SupportedLanguage = 'en') {
  return {
    t: (key: string, fallback?: string): string => {
      const translationsForNs = translations[language][namespace];
      const value = getNestedValue(translationsForNs, key);
      return value ?? fallback ?? key;
    },
    i18n: {
      changeLanguage: vi.fn(),
      language,
    },
  };
}

export function createMultiNsI18nMock(language: SupportedLanguage = 'en') {
  const resolve = (key: string, options?: Record<string, unknown>, defaultNs?: string): string => {
    const ns =
      (options?.ns as string | undefined) ??
      (key.includes(':') ? key.split(':')[0] : defaultNs) ??
      'apps';
    const fullKey = key.includes(':') ? key.split(':').slice(1).join(':') : key;
    const translationsForNs = translations[language][ns as Namespace];
    if (!translationsForNs) return key;
    const value = getNestedValue(translationsForNs, fullKey);
    return value ?? key;
  };

  return {
    useTranslation: (defaultNs?: string) => ({
      t: (key: string, options?: Record<string, unknown>) => resolve(key, options, defaultNs),
      i18n: { changeLanguage: vi.fn(), language },
    }),
    initReactI18next: { type: '3rdParty', init: vi.fn() },
  };
}

export type { Namespace, SupportedLanguage };
