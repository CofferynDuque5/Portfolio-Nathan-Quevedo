import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getProject, getSiteContent, SITE_URL } from '@/lib/api';
import { parseTags } from '@/lib/projects';
import Navbar from '@/components/public/Navbar';
import Footer from '@/components/public/Footer';
import FloatingWhatsApp from '@/components/public/FloatingWhatsApp';
import ProjectDetail from '@/components/public/projects/ProjectDetail';

type Params = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { slug } = await params;
  const page = await getProject(slug);
  if (!page) return { title: 'Proyecto no encontrado', robots: { index: false, follow: false } };

  const p = page.data;
  const title = p.seoTitle || p.title;
  const description = p.seoDescription || p.summary || undefined;
  const url = `${SITE_URL}/proyectos/${p.slug}`;
  return {
    title,
    description,
    keywords: parseTags(p.tags),
    alternates: { canonical: `/proyectos/${p.slug}` },
    openGraph: {
      type: 'article',
      url,
      title,
      description,
      publishedTime: p.publishedAt ?? undefined,
      modifiedTime: p.updatedAt,
      ...(p.coverImage ? { images: [{ url: p.coverImage, alt: p.title }] } : {}),
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      ...(p.coverImage ? { images: [p.coverImage] } : {}),
    },
  };
}

export default async function ProjectPage({ params }: Params) {
  const { slug } = await params;
  const [page, content] = await Promise.all([getProject(slug), getSiteContent()]);
  if (!page) notFound();

  const p = page.data;
  const s = content.settings;
  const siteName = s.siteName || 'Nathan Quevedo';

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'CreativeWork',
    name: p.title,
    headline: p.seoTitle || p.title,
    description: p.seoDescription || p.summary || undefined,
    url: `${SITE_URL}/proyectos/${p.slug}`,
    image: p.coverImage ? new URL(p.coverImage, SITE_URL).toString() : undefined,
    datePublished: p.publishedAt ?? undefined,
    dateModified: p.updatedAt,
    keywords: parseTags(p.tags).join(', ') || undefined,
    genre: p.category?.name,
    author: { '@type': 'Person', name: siteName },
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <Navbar siteName={siteName} />
      <main className="pb-24 sm:pb-32">
        <ProjectDetail project={p} prev={page.prev} next={page.next} whatsapp={s.whatsapp} />
      </main>
      <Footer siteName={siteName} tagline={s.tagline} social={content.socialLinks} />
      <FloatingWhatsApp phone={s.whatsapp} />
    </>
  );
}
