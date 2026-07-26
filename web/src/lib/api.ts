import { SiteContent } from './types';
import { fallbackContent } from './fallback';

/** URL base de la API. En SSR usa API_URL; en el cliente NEXT_PUBLIC_API_URL. */
export const API_URL =
  (typeof window === 'undefined'
    ? process.env.API_URL || process.env.NEXT_PUBLIC_API_URL
    : process.env.NEXT_PUBLIC_API_URL) || 'http://localhost:4000';

export const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';

/**
 * Obtiene todo el contenido del sitio desde la API (Server Component).
 * Si la API falla, devuelve contenido de respaldo para no romper el render.
 */
export async function getSiteContent(): Promise<SiteContent> {
  try {
    const res = await fetch(`${API_URL}/api/public/content`, {
      // Revalida cada 60s: buen equilibrio entre frescura y rendimiento.
      next: { revalidate: 60 },
    });
    if (!res.ok) throw new Error(`API respondió ${res.status}`);
    const data = (await res.json()) as SiteContent;
    return { ...fallbackContent, ...data, settings: { ...fallbackContent.settings, ...data.settings } };
  } catch {
    return fallbackContent;
  }
}

export interface SeoData {
  page: string;
  title: string;
  description: string;
  keywords?: string | null;
  ogImage?: string | null;
  canonical?: string | null;
  noindex: boolean;
}

/** Obtiene los metadatos SEO de una página concreta. */
export async function getSeo(page: string): Promise<SeoData | null> {
  try {
    const res = await fetch(`${API_URL}/api/public/seo/${page}`, { next: { revalidate: 300 } });
    if (!res.ok) return null;
    const json = await res.json();
    return json.data ?? null;
  } catch {
    return null;
  }
}
