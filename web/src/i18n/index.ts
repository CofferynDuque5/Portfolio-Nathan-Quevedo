import { DEFAULT_LOCALE, Locale } from './config';
import { es, Dictionary } from './dictionaries/es';

export * from './config';
export type { Dictionary };

const DICTIONARIES: Record<Locale, Dictionary> = { es };

/** Diccionario de un idioma (síncrono: sirve en servidor y en cliente). */
export function getDictionary(locale: Locale = DEFAULT_LOCALE): Dictionary {
  return DICTIONARIES[locale] ?? DICTIONARIES[DEFAULT_LOCALE];
}

/**
 * Idioma de la petición actual en componentes de servidor.
 * Con un solo idioma devuelve el predeterminado; al activar el enrutado por
 * idioma se leerá del segmento de la URL.
 */
export function getLocale(): Locale {
  return DEFAULT_LOCALE;
}

/** Atajo para componentes de servidor: textos del idioma actual. */
export function getT(): Dictionary {
  return getDictionary(getLocale());
}
