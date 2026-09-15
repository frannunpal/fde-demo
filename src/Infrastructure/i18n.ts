import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

import enCommon from '@shared/Locales/en/common.json';
import enApps from '@shared/Locales/en/apps.json';
import enSettings from '@shared/Locales/en/settings.json';
import enWindow from '@shared/Locales/en/window.json';
import enContextMenu from '@shared/Locales/en/contextMenu.json';
import enNotifications from '@shared/Locales/en/notifications.json';
import enNotes from '@shared/Locales/en/notes.json';
import enWelcome from '@shared/Locales/en/welcome.json';
import enMenuedit from '@shared/Locales/en/menuedit.json';
import enCities from '@shared/Locales/en/cities.json';
import enCityLog from '@shared/Locales/en/cityLog.json';
import enOnboarding from '@shared/Locales/en/onboarding.json';

import esCommon from '@shared/Locales/es/common.json';
import esApps from '@shared/Locales/es/apps.json';
import esSettings from '@shared/Locales/es/settings.json';
import esWindow from '@shared/Locales/es/window.json';
import esContextMenu from '@shared/Locales/es/contextMenu.json';
import esNotifications from '@shared/Locales/es/notifications.json';
import esNotes from '@shared/Locales/es/notes.json';
import esWelcome from '@shared/Locales/es/welcome.json';
import esMenuedit from '@shared/Locales/es/menuedit.json';
import esCities from '@shared/Locales/es/cities.json';
import esCityLog from '@shared/Locales/es/cityLog.json';
import esOnboarding from '@shared/Locales/es/onboarding.json';

export const SUPPORTED_LANGUAGES = ['en', 'es'] as const;
export type SupportedLanguage = (typeof SUPPORTED_LANGUAGES)[number];

export const DEFAULT_LANGUAGE: SupportedLanguage = 'en';

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources: {
      en: {
        common: enCommon,
        apps: enApps,
        settings: enSettings,
        window: enWindow,
        contextMenu: enContextMenu,
        notifications: enNotifications,
        notes: enNotes,
        welcome: enWelcome,
        menuedit: enMenuedit,
        cities: enCities,
        cityLog: enCityLog,
        onboarding: enOnboarding,
      },
      es: {
        common: esCommon,
        apps: esApps,
        settings: esSettings,
        window: esWindow,
        contextMenu: esContextMenu,
        notifications: esNotifications,
        notes: esNotes,
        welcome: esWelcome,
        menuedit: esMenuedit,
        cities: esCities,
        cityLog: esCityLog,
        onboarding: esOnboarding,
      },
    },
    fallbackLng: DEFAULT_LANGUAGE,
    supportedLngs: SUPPORTED_LANGUAGES,
    ns: [
      'common',
      'apps',
      'settings',
      'window',
      'contextMenu',
      'notifications',
      'notes',
      'welcome',
      'menuedit',
      'cities',
      'cityLog',
      'onboarding',
    ],
    defaultNS: 'common',
    interpolation: {
      escapeValue: false,
    },
    detection: {
      order: ['localStorage', 'navigator'],
      lookupLocalStorage: 'fde-desktop:language',
      caches: ['localStorage'],
    },
  });

export default i18n;
