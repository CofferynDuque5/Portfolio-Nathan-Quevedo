import type { MetadataRoute } from 'next';
import { getProjects, SITE_URL } from '@/lib/api';
import { languageAlternates } from '@/i18n';

/** Versiones por idioma de una ruta (hreflang en el sitemap). */
function alternates(path: string) {
  const languages = Object.fromEntries(
    Object.entries(languageAlternates(path)).map(([lang, p]) => [lang, `${SITE_URL}${p === '/' ? '' : p}`])
  );
  return { languages };
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date('2026-07-26');
  const projects = await getProjects();
  const latest = projects.reduce<Date | null>((acc, p) => {
    const d = new Date(p.updatedAt);
    return !acc || d > acc ? d : acc;
  }, null);

  return [
    { url: SITE_URL, lastModified: now, changeFrequency: 'weekly', priority: 1, alternates: alternates('/') },
    { url: `${SITE_URL}/proyectos`, lastModified: latest ?? now, changeFrequency: 'weekly', priority: 0.9, alternates: alternates('/proyectos') },
    ...projects.map((p) => ({
      url: `${SITE_URL}/proyectos/${p.slug}`,
      lastModified: new Date(p.updatedAt),
      changeFrequency: 'monthly' as const,
      priority: 0.8,
      alternates: alternates(`/proyectos/${p.slug}`),
    })),
    { url: `${SITE_URL}/servicios`, lastModified: now, changeFrequency: 'monthly', priority: 0.9, alternates: alternates('/servicios') },
    { url: `${SITE_URL}/sobre-mi`, lastModified: now, changeFrequency: 'monthly', priority: 0.7, alternates: alternates('/sobre-mi') },
    { url: `${SITE_URL}/contacto`, lastModified: now, changeFrequency: 'yearly', priority: 0.7, alternates: alternates('/contacto') },
  ];
}
