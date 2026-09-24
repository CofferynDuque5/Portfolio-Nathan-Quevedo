import type { Metadata } from 'next';
import { getProjects, getSiteContent, SITE_URL } from '@/lib/api';
import { pageMetadata } from '@/lib/seo';
import { getT } from '@/i18n';
import { CATEGORY_PARAM } from '@/lib/projects';
import PageShell from '@/components/public/PageShell';
import PageHeader from '@/components/public/PageHeader';
import ProjectsExplorer from '@/components/public/projects/ProjectsExplorer';

export function generateMetadata(): Promise<Metadata> {
  const t = getT().pages.projects;
  return pageMetadata('proyectos', '/proyectos', { title: t.metaTitle, description: t.metaDescription });
}

export default async function ProjectsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const [content, projects, params] = await Promise.all([getSiteContent(), getProjects(), searchParams]);
  const initial = params[CATEGORY_PARAM];
  const t = getT();

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: t.nav.projects,
    url: `${SITE_URL}/proyectos`,
    hasPart: projects.map((p) => ({
      '@type': 'CreativeWork',
      name: p.title,
      url: `${SITE_URL}/proyectos/${p.slug}`,
    })),
  };

  return (
    <PageShell content={content} jsonLd={jsonLd}>
      <PageHeader
        eyebrow={t.pages.projects.eyebrow}
        title={t.pages.projects.title}
        lead={t.pages.projects.lead}
      />
      <div className="container-x">
        <ProjectsExplorer projects={projects} initialCategory={typeof initial === 'string' ? initial : undefined} />
      </div>
    </PageShell>
  );
}
