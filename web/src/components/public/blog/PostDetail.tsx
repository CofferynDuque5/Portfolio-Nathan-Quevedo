'use client';

import Link from 'next/link';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import { Post, PostLink } from '@/lib/types';
import { parseTags } from '@/lib/projects';
import { formatDate, postMinutes, TAG_PARAM } from '@/lib/blog';
import { parseMarkdown, tableOfContents } from '@/lib/markdown';
import QuoteCTA from '../QuoteCTA';
import Markdown from './Markdown';
import { useI18n } from '@/i18n/client';

/**
 * Artículo completo. Se usa en la página pública (/blog/[slug]) y en la vista
 * previa del panel, para que lo que se previsualiza sea lo que se publica.
 */
export default function PostDetail({
  post,
  prev,
  next,
  whatsapp,
}: {
  post: Post;
  prev?: PostLink | null;
  next?: PostLink | null;
  whatsapp?: string;
}) {
  const { t: dict, intl, href } = useI18n();
  const t = dict.blog;
  const blocks = parseMarkdown(post.content);
  const toc = tableOfContents(blocks);
  const tags = parseTags(post.tags);
  const date = formatDate(post.publishedAt, intl);
  const meta = [date, t.minRead(postMinutes(post))].filter(Boolean).join(' · ');

  return (
    <article>
      <header className="container-x pt-32 sm:pt-40">
        <div className="mx-auto max-w-3xl">
          <Link
            href={href('/blog')}
            className="inline-flex items-center gap-2 text-sm font-medium text-slate-500 transition hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"
          >
            <ArrowLeft size={16} /> {t.back}
          </Link>

          <div className="animate-rise">
            <p className="mt-8 text-sm text-slate-500 dark:text-slate-400">
              {post.category?.name && (
                <span className="font-semibold text-brand-700 dark:text-brand-300">{post.category.name} · </span>
              )}
              {post.publishedAt ? <time dateTime={post.publishedAt}>{meta}</time> : meta}
            </p>
            <h1 className="mt-4 text-4xl font-bold leading-[1.1] tracking-tight sm:text-5xl lg:text-6xl">{post.title}</h1>
            {post.excerpt && (
              <p className="mt-6 text-lg leading-relaxed text-slate-600 sm:text-xl dark:text-slate-300">{post.excerpt}</p>
            )}
          </div>
        </div>
      </header>

      {post.coverImage && (
        <div className="container-x mt-12 sm:mt-16">
          <div className="mx-auto max-w-5xl overflow-hidden rounded-3xl border border-slate-200/70 dark:border-white/10">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={post.coverImage} alt="" className="h-auto w-full object-cover" />
          </div>
        </div>
      )}

      <div className="container-x mt-12 sm:mt-16">
        <div className="mx-auto max-w-3xl">
          {toc.length >= 3 && (
            <nav
              aria-label={t.contents}
              className="mb-12 rounded-2xl border border-slate-200 p-6 dark:border-white/10"
            >
              <h2 className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500 dark:text-slate-400">
                {t.contents}
              </h2>
              <ol className="mt-4 space-y-2 text-base">
                {toc.map((h) => (
                  <li key={h.id}>
                    <a href={`#${h.id}`} className="text-slate-700 hover:text-brand-700 dark:text-slate-300 dark:hover:text-brand-300">
                      {h.text}
                    </a>
                  </li>
                ))}
              </ol>
            </nav>
          )}

          <Markdown blocks={blocks} />

          {tags.length > 0 && (
            <ul className="mt-14 flex flex-wrap gap-2 border-t border-slate-200 pt-8 dark:border-white/10" aria-label={dict.common.tags}>
              {tags.map((tag) => (
                <li key={tag}>
                  <Link
                    href={`${href('/blog')}?${TAG_PARAM}=${encodeURIComponent(tag)}`}
                    className="inline-block rounded-full border border-slate-200 px-3 py-1 text-sm text-slate-600 transition hover:border-brand-500 hover:text-brand-700 dark:border-white/10 dark:text-slate-300 dark:hover:text-brand-300"
                  >
                    {tag}
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      <QuoteCTA title={t.ctaTitle} whatsapp={whatsapp} message={dict.whatsapp.post(post.title)} />

      {(prev || next) && (
        <nav aria-label={t.otherPosts} className="container-x mt-16 grid gap-4 sm:grid-cols-2">
          {prev ? (
            <Link href={href(`/blog/${prev.slug}`)} className="card group">
              <span className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.14em] text-slate-500 dark:text-slate-400">
                <ArrowLeft size={14} className="transition group-hover:-translate-x-1" /> {t.prev}
              </span>
              <span className="mt-2 block text-lg font-semibold">{prev.title}</span>
            </Link>
          ) : <span className="hidden sm:block" />}
          {next && (
            <Link href={href(`/blog/${next.slug}`)} className="card group sm:text-right">
              <span className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.14em] text-slate-500 dark:text-slate-400 sm:justify-end">
                {t.next} <ArrowRight size={14} className="transition group-hover:translate-x-1" />
              </span>
              <span className="mt-2 block text-lg font-semibold">{next.title}</span>
            </Link>
          )}
        </nav>
      )}
    </article>
  );
}
