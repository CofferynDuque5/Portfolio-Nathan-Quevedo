import type { MetadataRoute } from 'next';
import { getProjects, SITE_URL } from '@/lib/api';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date('2026-07-26');
  const projects = await getProjects();
  const latest = projects.reduce<Date | null>((acc, p) => {
    const d = new Date(p.updatedAt);
    return !acc || d > acc ? d : acc;
  }, null);

  return [
    { url: SITE_URL, lastModified: now, changeFrequency: 'weekly', priority: 1 },
    { url: `${SITE_URL}/proyectos`, lastModified: latest ?? now, changeFrequency: 'weekly', priority: 0.9 },
    ...projects.map((p) => ({
      url: `${SITE_URL}/proyectos/${p.slug}`,
      lastModified: new Date(p.updatedAt),
      changeFrequency: 'monthly' as const,
      priority: 0.8,
    })),
    { url: `${SITE_URL}/servicios`, lastModified: now, changeFrequency: 'monthly', priority: 0.9 },
    { url: `${SITE_URL}/sobre-mi`, lastModified: now, changeFrequency: 'monthly', priority: 0.7 },
    { url: `${SITE_URL}/contacto`, lastModified: now, changeFrequency: 'yearly', priority: 0.7 },
  ];
}
