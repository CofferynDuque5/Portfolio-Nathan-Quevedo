import { DEFAULT_LOCALE, Locale } from '../config';
import { es, Dictionary } from './es';
import { en } from './en';

export type { Dictionary };

const DICTIONARIES: Record<Locale, Dictionary> = { es, en };

/** Diccionario de un idioma (sin dependencias de servidor: sirve en cualquier sitio). */
export function getDictionary(locale: Locale = DEFAULT_LOCALE): Dictionary {
  return DICTIONARIES[locale] ?? DICTIONARIES[DEFAULT_LOCALE];
}
