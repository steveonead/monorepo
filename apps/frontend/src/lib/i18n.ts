import i18n from 'i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import HTTPBackend from 'i18next-http-backend';
import { initReactI18next } from 'react-i18next';

import { isDev } from '@/lib/env';

export async function setupI18n() {
  await i18n
    .use(initReactI18next) // Passes i18n down to react-i18next
    .use(LanguageDetector) // Detects user language
    .use(HTTPBackend) // Loads translations from a backend
    .init({
      ns: ['translation', 'test'],
      supportedLngs: ['zh-Hant', 'en-US'],
      load: 'currentOnly',
      fallbackLng: 'zh-Hant',
      debug: isDev,
      interpolation: {
        escapeValue: false, // React already escapes values
      },
    });

  return i18n;
}
