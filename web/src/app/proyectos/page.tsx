import type { Metadata } from 'next';
import { getProjects, getSeo, getSiteContent, SITE_URL } from '@/lib/api';
import { CATEGORY_PARAM } from '@/lib/projects';
import Navbar from '@/components/public/Navbar';
import Footer from '@/components/public/Footer';
import FloatingWhatsApp from '@/components/public/FloatingWhatsApp';
import Reveal from '@/components/Reveal';
import ProjectsExplorer from '@/components/public/projects/ProjectsExplorer';

/** SEO editable desde el panel (módulo SEO, página "proyectos"). */
export async function generateMetadata(): Promise<Metadata> {
  const seo = await getSeo('proyectos');
  const title = seo?.title ?? 'Proyectos y casos de estudio';
  const description =
    seo?.description ??
    'Casos de estudio de Nathan Quevedo: proyectos de streaming, licencias, soporte técnico y soluciones digitales.';
  return {
    title,
    description,
    keywords: seo?.keywords ?? undefined,
    robots: seo?.noindex ? { index: false, follow: false } : undefined,
    alternates: { canonical: seo?.canonical ?? '/proyectos' },
    openGraph: {
      type: 'website',
      url: `${SITE_URL}/proyectos`,
      title,
      description,
      ...(seo?.ogImage ? { images: [{ url: seo.ogImage }] } : {}),
    },
  };
}

export default async function ProjectsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const [content, projects, params] = await Promise.all([getSiteContent(), getProjects(), searchParams]);
  const s = content.settings;
  const siteName = s.siteName || 'Nathan Quevedo';
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
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <Navbar siteName={siteName} />
      <main className="pb-24 sm:pb-32">
        <header className="container-x pb-14 pt-32 sm:pb-20 sm:pt-40">
          <Reveal>
            <span className="eyebrow">Portfolio</span>
            <h1 className="mt-6 max-w-4xl text-4xl font-bold leading-[1.05] tracking-tight sm:text-6xl">
              Proyectos que hablan por sí mismos
            </h1>
            <p className="mt-6 max-w-2xl text-lg leading-relaxed text-slate-600 dark:text-slate-300">
              Una selección de trabajos: el reto de cada cliente, cómo lo resolví y qué resultados
              obtuvimos.
            </p>
          </Reveal>
        </header>
        <div className="container-x">
          <ProjectsExplorer projects={projects} initialCategory={typeof initial === 'string' ? initial : undefined} />
        </div>
      </main>
      <Footer siteName={siteName} tagline={s.tagline} social={content.socialLinks} />
      <FloatingWhatsApp phone={s.whatsapp} />
    </>
  );
}
