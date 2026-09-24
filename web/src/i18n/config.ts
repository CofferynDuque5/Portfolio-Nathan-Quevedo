/**
 * Configuración de idiomas del sitio público.
 *
 * El español es el idioma por defecto y no lleva prefijo (/servicios).
 * Los demás idiomas van bajo su prefijo y con rutas traducidas
 * (/en/services). El middleware (src/middleware.ts) reescribe esas rutas a
 * las páginas reales, que son las mismas para todos los idiomas.
 *
 * Para añadir otro idioma: crea su diccionario (misma forma que `es.ts`),
 * añádelo a LOCALES, LOCALE_META y ROUTE_SEGMENTS, y regístralo en index.ts.
 */
export const LOCALES = ['es', 'en'] as const;
export type Locale = (typeof LOCALES)[number];

export const DEFAULT_LOCALE: Locale = 'es';

/** Cabecera interna con la que el middleware indica el idioma a las páginas. */
export const LOCALE_HEADER = 'x-locale';

export const LOCALE_META: Record<Locale, { name: string; short: string; intl: string; og: string }> = {
  es: { name: 'Español', short: 'ES', intl: 'es-ES', og: 'es_ES' },
  en: { name: 'English', short: 'EN', intl: 'en-US', og: 'en_US' },
};

/** Primer segmento de cada página en cada idioma (el español es la ruta real). */
const ROUTE_SEGMENTS: Record<Locale, Record<string, string>> = {
  es: {},
  en: { servicios: 'services', proyectos: 'projects', 'sobre-mi': 'about', contacto: 'contact' },
};

export function isLocale(value: string | null | undefined): value is Locale {
  return !!value && (LOCALES as readonly string[]).includes(value);
}

/** Separa "/ruta?query#hash" en sus partes. */
function splitPath(path: string) {
  const m = path.match(/^([^?#]*)(\?[^#]*)?(#.*)?$/);
  return { pathname: m?.[1] || '/', rest: `${m?.[2] ?? ''}${m?.[3] ?? ''}` };
}

/**
 * Ruta pública de una página en un idioma, a partir de la ruta en español.
 * localizedPath('/servicios#licencias', 'en') -> '/en/services#licencias'
 * Las anclas (#…) y rutas externas se devuelven tal cual.
 */
export function localizedPath(path: string, locale: Locale = DEFAULT_LOCALE): string {
  if (locale === DEFAULT_LOCALE || !path.startsWith('/')) return path;
  const { pathname, rest } = splitPath(path);
  const [first, ...more] = pathname.split('/').filter(Boolean);
  if (!first) return `/${locale}${rest}`;
  const segment = ROUTE_SEGMENTS[locale][first] ?? first;
  return `/${[locale, segment, ...more].join('/')}${rest}`;
}

/**
 * Inverso de localizedPath: idioma y ruta en español de una URL pública.
 * parseLocalizedPath('/en/projects/x') -> { locale: 'en', basePath: '/proyectos/x' }
 * `canonical` es false si la URL usa un segmento que no es el de ese idioma
 * (ej: /en/servicios), para redirigir a la forma correcta.
 */
export function parseLocalizedPath(pathname: string): { locale: Locale; basePath: string; canonical: boolean } {
  const [first, second, ...more] = pathname.split('/').filter(Boolean);
  if (!isLocale(first) || first === DEFAULT_LOCALE) {
    return { locale: DEFAULT_LOCALE, basePath: pathname || '/', canonical: true };
  }
  const locale = first;
  if (!second) return { locale, basePath: '/', canonical: true };
  const segments = ROUTE_SEGMENTS[locale];
  const base = Object.keys(segments).find((k) => segments[k] === second);
  const canonical = !!base || !(second in segments);
  return { locale, basePath: `/${[base ?? second, ...more].join('/')}`, canonical };
}

/** Misma página en otro idioma (para el selector de idioma). */
export function switchLocalePath(pathname: string, target: Locale): string {
  return localizedPath(parseLocalizedPath(pathname).basePath, target);
}

/**
 * Enlaces hreflang de una ruta (en español) en todos los idiomas, más
 * x-default (el idioma por defecto). Se usa en metadatos y en el sitemap.
 */
export function languageAlternates(path: string): Record<string, string> {
  const map: Record<string, string> = {};
  for (const l of LOCALES) map[l] = localizedPath(path, l);
  map['x-default'] = localizedPath(path, DEFAULT_LOCALE);
  return map;
}
