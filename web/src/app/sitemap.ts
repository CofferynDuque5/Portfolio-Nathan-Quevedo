import type { MetadataRoute } from 'next';
import { getProjects, SITE_URL } from '@/lib/api';
import { languageAlternates, LOCALES, localizedPath } from '@/i18n/config';

type Entry = Omit<MetadataRoute.Sitemap[number], 'url'> & { path: string };

const abs = (p: string) => `${SITE_URL}${p === '/' ? '' : p}`;

/**
 * Una entrada por página e idioma, cada una con sus versiones hreflang
 * (Google recomienda listar todas las variantes).
 */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date('2026-07-26');
  const projects = await getProjects();
  const latest = projects.reduce<Date | null>((acc, p) => {
    const d = new Date(p.updatedAt);
    return !acc || d > acc ? d : acc;
  }, null);

  const pages: Entry[] = [
    { path: '/', lastModified: now, changeFrequency: 'weekly', priority: 1 },
    { path: '/proyectos', lastModified: latest ?? now, changeFrequency: 'weekly', priority: 0.9 },
    ...projects.map((p): Entry => ({
      path: `/proyectos/${p.slug}`,
      lastModified: new Date(p.updatedAt),
      changeFrequency: 'monthly',
      priority: 0.8,
    })),
    { path: '/servicios', lastModified: now, changeFrequency: 'monthly', priority: 0.9 },
    { path: '/sobre-mi', lastModified: now, changeFrequency: 'monthly', priority: 0.7 },
    { path: '/contacto', lastModified: now, changeFrequency: 'yearly', priority: 0.7 },
  ];

  return pages.flatMap(({ path, ...entry }) => {
    const languages = Object.fromEntries(
      Object.entries(languageAlternates(path)).map(([lang, p]) => [lang, abs(p)])
    );
    return LOCALES.map((locale) => ({ ...entry, url: abs(localizedPath(path, locale)), alternates: { languages } }));
  });
}
