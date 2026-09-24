import { headers } from 'next/headers';
import { DEFAULT_LOCALE, isLocale, Locale, LOCALE_HEADER, localizedPath } from './config';
import { getDictionary, Dictionary } from './dictionaries';

export * from './config';
export { getDictionary };
export type { Dictionary };

/**
 * Idioma de la petición actual en componentes de servidor. Lo fija el
 * middleware para las rutas /en/…; el resto es el idioma por defecto.
 */
export async function getLocale(): Promise<Locale> {
  try {
    const value = (await headers()).get(LOCALE_HEADER);
    return isLocale(value) ? value : DEFAULT_LOCALE;
  } catch {
    // Fuera de una petición (ej: generación estática).
    return DEFAULT_LOCALE;
  }
}

/** Atajo para componentes de servidor: textos del idioma actual. */
export async function getT(): Promise<Dictionary> {
  return getDictionary(await getLocale());
}

/** Idioma, textos y rutas localizadas para componentes de servidor. */
export async function getI18n() {
  const locale = await getLocale();
  return {
    locale,
    t: getDictionary(locale),
    href: (path: string) => localizedPath(path, locale),
  };
}
