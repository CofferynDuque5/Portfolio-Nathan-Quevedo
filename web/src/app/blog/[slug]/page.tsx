import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getPost, getSiteContent, SITE_URL } from '@/lib/api';
import { parseTags } from '@/lib/projects';
import { markdownToText } from '@/lib/markdown';
import { getI18n, languageAlternates, LOCALE_META } from '@/i18n';
import { defaultOgImages } from '@/lib/seo';
import PageShell from '@/components/public/PageShell';
import PostDetail from '@/components/public/blog/PostDetail';

type Params = { params: Promise<{ slug: string }> };

/** Descripción del artículo: la SEO, el resumen o el comienzo del texto. */
function describe(p: { seoDescription?: string | null; excerpt?: string | null; content?: string | null }) {
  if (p.seoDescription) return p.seoDescription;
  if (p.excerpt) return p.excerpt;
  const text = markdownToText(p.content);
  return text ? (text.length > 160 ? `${text.slice(0, 157).trimEnd()}…` : text) : undefined;
}

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { slug } = await params;
  const { t, locale, href } = await getI18n();
  const page = await getPost(slug, locale);
  if (!page) return { title: t.pages.blog.notFound, robots: { index: false, follow: false } };

  const p = page.data;
  const title = p.seoTitle || p.title;
  const description = describe(p);
  const path = href(`/blog/${p.slug}`);
  const images = p.coverImage ? [{ url: p.coverImage, alt: p.title }] : defaultOgImages(locale, t.pages.home.ogAlt);
  return {
    title,
    description,
    keywords: parseTags(p.tags),
    alternates: { canonical: path, languages: languageAlternates(`/blog/${p.slug}`) },
    openGraph: {
      type: 'article',
      locale: LOCALE_META[locale].og,
      url: `${SITE_URL}${path}`,
      title,
      description,
      publishedTime: p.publishedAt ?? undefined,
      modifiedTime: p.updatedAt,
      tags: parseTags(p.tags),
      images,
    },
    twitter: { card: 'summary_large_image', title, description, images: images.map((i) => i.url) },
  };
}

export default async function PostPage({ params }: Params) {
  const { slug } = await params;
  const { locale, href } = await getI18n();
  const [page, content] = await Promise.all([getPost(slug, locale), getSiteContent(locale)]);
  if (!page) notFound();

  const p = page.data;
  const s = content.settings;
  const url = `${SITE_URL}${href(`/blog/${p.slug}`)}`;
  const author = { '@type': 'Person', name: s.siteName || 'Nathan Quevedo', url: SITE_URL };

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    inLanguage: locale,
    headline: p.title,
    description: describe(p),
    url,
    mainEntityOfPage: { '@type': 'WebPage', '@id': url },
    image: p.coverImage ? new URL(p.coverImage, SITE_URL).toString() : undefined,
    datePublished: p.publishedAt ?? undefined,
    dateModified: p.updatedAt,
    keywords: parseTags(p.tags).join(', ') || undefined,
    articleSection: p.category?.name,
    timeRequired: p.readingMinutes ? `PT${p.readingMinutes}M` : undefined,
    author,
    publisher: author,
  };

  return (
    <PageShell content={content} jsonLd={jsonLd}>
      <PostDetail post={p} prev={page.prev} next={page.next} whatsapp={s.whatsapp} />
    </PageShell>
  );
}
