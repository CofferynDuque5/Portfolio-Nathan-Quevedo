/**
 * Configuración de idiomas del sitio público.
 *
 * Hoy solo está activo el español. Para añadir inglés:
 *  1. Crea `dictionaries/en.ts` con la misma forma que `es.ts` (TypeScript
 *     avisa si falta alguna clave).
 *  2. Añade 'en' a LOCALES y su entrada en LOCALE_META y en dictionaries/index.ts.
 *  3. Activa el enrutado por idioma (ver README, sección "Idiomas").
 */
export const LOCALES = ['es'] as const;
export type Locale = (typeof LOCALES)[number];

export const DEFAULT_LOCALE: Locale = 'es';

export const LOCALE_META: Record<Locale, { name: string; intl: string; og: string }> = {
  es: { name: 'Español', intl: 'es-ES', og: 'es_ES' },
};

export function isLocale(value: string): value is Locale {
  return (LOCALES as readonly string[]).includes(value);
}

/**
 * Enlaces hreflang de una ruta en todos los idiomas activos, más x-default
 * (el idioma por defecto). Se usa en metadatos y en el sitemap.
 */
export function languageAlternates(path: string): Record<string, string> {
  const map: Record<string, string> = {};
  for (const l of LOCALES) map[l] = localizedPath(path, l);
  map['x-default'] = localizedPath(path, DEFAULT_LOCALE);
  return map;
}

/**
 * Ruta pública de una página en un idioma. El idioma por defecto no lleva
 * prefijo (/servicios); los demás sí (/en/servicios).
 */
export function localizedPath(path: string, locale: Locale = DEFAULT_LOCALE): string {
  if (locale === DEFAULT_LOCALE) return path;
  return `/${locale}${path === '/' ? '' : path}`;
}
