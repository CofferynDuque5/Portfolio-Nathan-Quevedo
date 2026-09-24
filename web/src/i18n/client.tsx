'use client';

import { createContext, ReactNode, useContext } from 'react';
import { DEFAULT_LOCALE, Locale, LOCALE_META } from './config';
import { getDictionary, Dictionary } from './index';

interface I18nValue {
  locale: Locale;
  t: Dictionary;
  intl: string;
}

const I18nContext = createContext<I18nValue>({
  locale: DEFAULT_LOCALE,
  t: getDictionary(DEFAULT_LOCALE),
  intl: LOCALE_META[DEFAULT_LOCALE].intl,
});

/** Proporciona el idioma a los componentes de cliente (se monta en el layout). */
export function I18nProvider({ locale, children }: { locale: Locale; children: ReactNode }) {
  return (
    <I18nContext.Provider value={{ locale, t: getDictionary(locale), intl: LOCALE_META[locale].intl }}>
      {children}
    </I18nContext.Provider>
  );
}

/** Textos e idioma actual en componentes de cliente. */
export function useI18n(): I18nValue {
  return useContext(I18nContext);
}
