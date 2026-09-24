'use client';

import { createContext, ReactNode, useContext } from 'react';
import { DEFAULT_LOCALE, Locale, LOCALE_META, localizedPath } from './config';
import { getDictionary, Dictionary } from './dictionaries';

interface I18nValue {
  locale: Locale;
  t: Dictionary;
  intl: string;
  /** Ruta en el idioma actual a partir de la ruta en español. */
  href: (path: string) => string;
}

const value = (locale: Locale): I18nValue => ({
  locale,
  t: getDictionary(locale),
  intl: LOCALE_META[locale].intl,
  href: (path) => localizedPath(path, locale),
});

const I18nContext = createContext<I18nValue>(value(DEFAULT_LOCALE));

/** Proporciona el idioma a los componentes de cliente (se monta en el layout). */
export function I18nProvider({ locale, children }: { locale: Locale; children: ReactNode }) {
  return <I18nContext.Provider value={value(locale)}>{children}</I18nContext.Provider>;
}

/** Textos, idioma actual y rutas localizadas en componentes de cliente. */
export function useI18n(): I18nValue {
  return useContext(I18nContext);
}
