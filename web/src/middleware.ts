import { NextRequest, NextResponse } from 'next/server';
import { LOCALE_HEADER, localizedPath, parseLocalizedPath } from '@/i18n/config';

/**
 * Rutas de idioma: /en/services -> página /servicios en inglés.
 * La URL visible no cambia; las páginas leen el idioma de la cabecera interna.
 */
export function middleware(req: NextRequest) {
  const { locale, basePath, canonical } = parseLocalizedPath(req.nextUrl.pathname);

  // El panel y la API no tienen versión por idioma.
  if (basePath.startsWith('/admin') || basePath.startsWith('/api')) {
    return NextResponse.redirect(new URL(basePath + req.nextUrl.search, req.url));
  }
  // /en/servicios -> /en/services (una sola URL por página e idioma).
  if (!canonical) {
    return NextResponse.redirect(new URL(localizedPath(basePath, locale) + req.nextUrl.search, req.url), 308);
  }

  const headers = new Headers(req.headers);
  headers.set(LOCALE_HEADER, locale);
  const url = req.nextUrl.clone();
  url.pathname = basePath;
  return NextResponse.rewrite(url, { request: { headers } });
}

export const config = { matcher: ['/en', '/en/:path*'] };
