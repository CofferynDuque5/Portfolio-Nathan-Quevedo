import { NextRequest, NextResponse } from 'next/server';
import { DEFAULT_LOCALE, LOCALE_HEADER, localizedPath, parseLocalizedPath } from '@/i18n/config';

/**
 * Rutas de idioma: /en/services -> página /servicios en inglés.
 * La URL visible no cambia; las páginas leen el idioma de la cabecera interna.
 */
export function middleware(req: NextRequest) {
  const { locale, basePath, canonical } = parseLocalizedPath(req.nextUrl.pathname);

  // Fuera de /en el idioma es siempre el español: se descarta la cabecera
  // interna si la trae el visitante (solo la puede poner este middleware).
  if (locale === DEFAULT_LOCALE) {
    if (!req.headers.has(LOCALE_HEADER)) return NextResponse.next();
    const headers = new Headers(req.headers);
    headers.delete(LOCALE_HEADER);
    return NextResponse.next({ request: { headers } });
  }

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

// Todas las páginas salvo la API, los archivos subidos y los estáticos de Next.
export const config = {
  matcher: ['/((?!api/|uploads/|_next/static|_next/image|favicon\\.ico).*)'],
};
