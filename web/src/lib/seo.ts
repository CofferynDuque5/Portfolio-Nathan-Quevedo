import type { Metadata } from 'next';
import { getSeo, SITE_URL } from '@/lib/api';
import { DEFAULT_LOCALE, getLocale, languageAlternates, localizedPath, LOCALE_META, Locale } from '@/i18n';

/** Imagen para redes generada por defecto (app/og), en el idioma de la página. */
export function defaultOgImages(locale: Locale, alt: string) {
  return [{ url: `/og?lang=${locale}`, width: 1200, height: 630, alt }];
}

/**
 * Metadatos de una página del sitio, editables desde el panel (módulo SEO,
 * clave = `page`). Si no hay registro se usan los valores por defecto.
 */
export async function pageMetadata(
  page: string,
  path: string,
  defaults: { title: string; description: string }
): Promise<Metadata> {
  const locale = await getLocale();
  const seo = await getSeo(page, locale);
  const title = seo?.title ?? defaults.title;
  const description = seo?.description ?? defaults.description;
  const images = seo?.ogImage ? [{ url: seo.ogImage }] : defaultOgImages(locale, title);
  const url = localizedPath(path, locale);
  return {
    title,
    description,
    keywords: seo?.keywords ?? undefined,
    robots: seo?.noindex ? { index: false, follow: false } : undefined,
    // El canonical del panel es la URL en español; en otros idiomas, la propia página.
    alternates: {
      canonical: locale === DEFAULT_LOCALE ? seo?.canonical ?? path : url,
      languages: languageAlternates(path),
    },
    openGraph: { type: 'website', locale: LOCALE_META[locale].og, url: `${SITE_URL}${url}`, title, description, images },
    twitter: { card: 'summary_large_image', title, description, images: images.map((i) => i.url) },
  };
}
