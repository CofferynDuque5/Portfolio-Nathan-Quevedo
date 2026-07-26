import type { MetadataRoute } from 'next';
import { SITE_URL } from '@/lib/api';

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date('2026-07-26');
  return [
    { url: SITE_URL, lastModified: now, changeFrequency: 'weekly', priority: 1 },
    { url: `${SITE_URL}/#servicios`, lastModified: now, changeFrequency: 'monthly', priority: 0.8 },
    { url: `${SITE_URL}/#licencias`, lastModified: now, changeFrequency: 'monthly', priority: 0.8 },
    { url: `${SITE_URL}/#plataformas`, lastModified: now, changeFrequency: 'monthly', priority: 0.7 },
    { url: `${SITE_URL}/#contacto`, lastModified: now, changeFrequency: 'monthly', priority: 0.6 },
  ];
}
