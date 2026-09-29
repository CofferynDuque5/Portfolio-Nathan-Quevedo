import type { Metadata } from 'next';
import Link from 'next/link';
import { Rss } from 'lucide-react';
import { getPosts, getSiteContent, SITE_URL } from '@/lib/api';
import { pageMetadata } from '@/lib/seo';
import { getI18n, getLocale, getT, localizedPath, LOCALE_META } from '@/i18n';
import { parseTags } from '@/lib/projects';
import { formatDate, TAG_PARAM } from '@/lib/blog';
import { cn } from '@/lib/utils';
import PageShell from '@/components/public/PageShell';
import PageHeader from '@/components/public/PageHeader';
import PostCard from '@/components/public/blog/PostCard';

export async function generateMetadata(): Promise<Metadata> {
  const [t, locale] = await Promise.all([getT(), getLocale()]);
  const meta = await pageMetadata('blog', '/blog', {
    title: t.pages.blog.metaTitle,
    description: t.pages.blog.metaDescription,
  });
  return {
    ...meta,
    alternates: {
      ...meta.alternates,
      types: { 'application/rss+xml': [{ url: localizedPath('/blog/rss.xml', locale), title: t.pages.blog.metaTitle }] },
    },
  };
}

export default async function BlogPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const { t, locale, href } = await getI18n();
  const intl = LOCALE_META[locale].intl;
  const [content, posts, params] = await Promise.all([getSiteContent(locale), getPosts(locale), searchParams]);

  // Etiquetas de todos los artículos (sin repetir, sin distinguir mayúsculas).
  const tagMap = new Map<string, string>();
  for (const p of posts) for (const tag of parseTags(p.tags)) if (!tagMap.has(tag.toLowerCase())) tagMap.set(tag.toLowerCase(), tag);
  const tags = Array.from(tagMap.values()).sort((a, b) => a.localeCompare(b, intl));

  const raw = typeof params[TAG_PARAM] === 'string' ? params[TAG_PARAM] : undefined;
  const active = raw ? tagMap.get(raw.toLowerCase()) : undefined;
  // Una etiqueta que no existe da un listado vacío (no todos los artículos).
  const shown = raw
    ? posts.filter((p) => parseTags(p.tags).some((tag) => tag.toLowerCase() === raw.toLowerCase()))
    : posts;
  // Sin filtro, el artículo más reciente va destacado arriba.
  const latest = raw ? undefined : shown[0];
  const rest = raw ? shown : shown.slice(1);

  const meta = (p: (typeof posts)[number]) =>
    [formatDate(p.publishedAt, intl), p.readingMinutes ? t.blog.minRead(p.readingMinutes) : null].filter(Boolean).join(' · ');
  const tagHref = (tag?: string) => (tag ? `${href('/blog')}?${TAG_PARAM}=${encodeURIComponent(tag)}` : href('/blog'));

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Blog',
    name: t.pages.blog.title,
    url: `${SITE_URL}${href('/blog')}`,
    inLanguage: locale,
    blogPost: posts.map((p) => ({
      '@type': 'BlogPosting',
      headline: p.title,
      url: `${SITE_URL}${href(`/blog/${p.slug}`)}`,
      datePublished: p.publishedAt ?? undefined,
    })),
  };

  return (
    <PageShell content={content} jsonLd={jsonLd}>
      <PageHeader eyebrow={t.pages.blog.eyebrow} title={t.pages.blog.title} lead={t.pages.blog.lead}>
        {posts.length > 0 && (
          <a
            href={href('/blog/rss.xml')}
            className="mt-6 inline-flex items-center gap-2 text-sm font-medium text-slate-500 transition hover:text-brand-700 dark:text-slate-400 dark:hover:text-brand-300"
          >
            <Rss size={16} /> {t.blog.rss}
          </a>
        )}
      </PageHeader>

      <div className="container-x">
        {tags.length > 1 && (
          <nav aria-label={t.blog.filterLabel} className="mb-12">
            <ul className="flex flex-wrap gap-2">
              {[undefined, ...tags].map((tag) => {
                const current = tag === active;
                return (
                  <li key={tag ?? ''}>
                    <Link
                      href={tagHref(tag)}
                      aria-current={current ? 'page' : undefined}
                      className={cn(
                        'inline-block rounded-full border px-4 py-1.5 text-sm font-medium transition',
                        current
                          ? 'border-slate-900 bg-slate-900 text-white dark:border-white dark:bg-white dark:text-slate-900'
                          : 'border-slate-200 text-slate-600 hover:border-slate-400 dark:border-white/10 dark:text-slate-300 dark:hover:border-white/30'
                      )}
                    >
                      {tag ?? t.blog.all}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </nav>
        )}

        {shown.length === 0 ? (
          <div className="rounded-3xl border border-dashed border-slate-300 px-6 py-16 text-center dark:border-white/15">
            <h2 className="text-2xl font-semibold tracking-tight">{raw ? t.blog.emptyTag : t.blog.emptyTitle}</h2>
            {!raw && <p className="mx-auto mt-3 max-w-xl text-slate-600 dark:text-slate-300">{t.blog.emptyText}</p>}
            <Link href={raw ? href('/blog') : href('/contacto')} className="btn-primary mt-8">
              {raw ? t.blog.back : t.blog.emptyCta}
            </Link>
          </div>
        ) : (
          <>
            {latest && (
              <section aria-label={t.blog.latest} className="mb-16 border-b border-slate-200 pb-16 dark:border-white/10">
                <PostCard post={latest} href={href(`/blog/${latest.slug}`)} meta={meta(latest)} large />
              </section>
            )}
            {rest.length > 0 && (
              <ul className="grid gap-x-8 gap-y-14 sm:grid-cols-2 lg:grid-cols-3">
                {rest.map((p) => (
                  <li key={p.id} className="animate-fade-in-up">
                    <PostCard post={p} href={href(`/blog/${p.slug}`)} meta={meta(p)} />
                  </li>
                ))}
              </ul>
            )}
          </>
        )}
      </div>
    </PageShell>
  );
}
