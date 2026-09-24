import type { Metadata } from 'next';
import { getProjects, getSiteContent, SITE_URL } from '@/lib/api';
import { pageMetadata } from '@/lib/seo';
import { CATEGORY_PARAM } from '@/lib/projects';
import PageShell from '@/components/public/PageShell';
import PageHeader from '@/components/public/PageHeader';
import ProjectsExplorer from '@/components/public/projects/ProjectsExplorer';

export function generateMetadata(): Promise<Metadata> {
  return pageMetadata('proyectos', '/proyectos', {
    title: 'Proyectos y casos de estudio',
    description:
      'Casos de estudio de Nathan Quevedo: proyectos de streaming, licencias, soporte técnico y soluciones digitales.',
  });
}

export default async function ProjectsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const [content, projects, params] = await Promise.all([getSiteContent(), getProjects(), searchParams]);
  const initial = params[CATEGORY_PARAM];

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: 'Proyectos',
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
        eyebrow="Portfolio"
        title="Proyectos que hablan por sí mismos"
        lead="Una selección de trabajos: el reto de cada cliente, cómo lo resolví y qué resultados obtuvimos."
      />
      <div className="container-x">
        <ProjectsExplorer projects={projects} initialCategory={typeof initial === 'string' ? initial : undefined} />
      </div>
    </PageShell>
  );
}
