import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getProject, getSiteContent, SITE_URL } from '@/lib/api';
import { parseTags } from '@/lib/projects';
import { getI18n, languageAlternates, LOCALE_META } from '@/i18n';
import { defaultOgImages } from '@/lib/seo';
import PageShell from '@/components/public/PageShell';
import ProjectDetail from '@/components/public/projects/ProjectDetail';

type Params = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { slug } = await params;
  const { t, locale, href } = await getI18n();
  const page = await getProject(slug, locale);
  if (!page) return { title: t.pages.projects.notFound, robots: { index: false, follow: false } };

  const p = page.data;
  const title = p.seoTitle || p.title;
  const description = p.seoDescription || p.summary || undefined;
  const path = href(`/proyectos/${p.slug}`);
  const url = `${SITE_URL}${path}`;
  const images = p.coverImage ? [{ url: p.coverImage, alt: p.title }] : defaultOgImages(locale, t.pages.home.ogAlt);
  return {
    title,
    description,
    keywords: parseTags(p.tags),
    alternates: { canonical: path, languages: languageAlternates(`/proyectos/${p.slug}`) },
    openGraph: {
      type: 'article',
      locale: LOCALE_META[locale].og,
      url,
      title,
      description,
      publishedTime: p.publishedAt ?? undefined,
      modifiedTime: p.updatedAt,
      images,
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: images.map((i) => i.url),
    },
  };
}

export default async function ProjectPage({ params }: Params) {
  const { slug } = await params;
  const { locale, href } = await getI18n();
  const [page, content] = await Promise.all([getProject(slug, locale), getSiteContent(locale)]);
  if (!page) notFound();

  const p = page.data;
  const s = content.settings;

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'CreativeWork',
    inLanguage: locale,
    name: p.title,
    headline: p.seoTitle || p.title,
    description: p.seoDescription || p.summary || undefined,
    url: `${SITE_URL}${href(`/proyectos/${p.slug}`)}`,
    image: p.coverImage ? new URL(p.coverImage, SITE_URL).toString() : undefined,
    datePublished: p.publishedAt ?? undefined,
    dateModified: p.updatedAt,
    keywords: parseTags(p.tags).join(', ') || undefined,
    genre: p.category?.name,
    author: { '@type': 'Person', name: s.siteName || 'Nathan Quevedo' },
  };

  return (
    <PageShell content={content} jsonLd={jsonLd}>
      <ProjectDetail project={p} prev={page.prev} next={page.next} whatsapp={s.whatsapp} />
    </PageShell>
  );
}
