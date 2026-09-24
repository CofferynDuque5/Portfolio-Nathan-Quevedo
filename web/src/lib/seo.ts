import type { Metadata } from 'next';
import { getSeo, SITE_URL } from '@/lib/api';
import { getLocale, languageAlternates, LOCALE_META } from '@/i18n';

/**
 * Metadatos de una página del sitio, editables desde el panel (módulo SEO,
 * clave = `page`). Si no hay registro se usan los valores por defecto.
 */
export async function pageMetadata(
  page: string,
  path: string,
  defaults: { title: string; description: string }
): Promise<Metadata> {
  const seo = await getSeo(page);
  const title = seo?.title ?? defaults.title;
  const description = seo?.description ?? defaults.description;
  const images = seo?.ogImage ? [{ url: seo.ogImage }] : undefined;
  return {
    title,
    description,
    keywords: seo?.keywords ?? undefined,
    robots: seo?.noindex ? { index: false, follow: false } : undefined,
    alternates: { canonical: seo?.canonical ?? path, languages: languageAlternates(path) },
    openGraph: { type: 'website', locale: LOCALE_META[getLocale()].og, url: `${SITE_URL}${path}`, title, description, ...(images ? { images } : {}) },
    twitter: { card: 'summary_large_image', title, description, ...(images ? { images: images.map((i) => i.url) } : {}) },
  };
}
