import { Fragment, ReactNode } from 'react';
import { Block, Inline, parseMarkdown } from '@/lib/markdown';

/**
 * Pinta el Markdown sencillo de un artículo (ver lib/markdown.ts) con
 * elementos de React: nunca inserta HTML del panel.
 */
export default function Markdown({ source, blocks }: { source?: string | null; blocks?: Block[] }) {
  const tree = blocks ?? parseMarkdown(source);
  if (!tree.length) return null;
  return <div className="text-lg leading-relaxed text-slate-700 dark:text-slate-300">{tree.map(renderBlock)}</div>;
}

function renderInline(nodes: Inline[]): ReactNode {
  return nodes.map((n, i) => {
    switch (n.type) {
      case 'text':
        return <Fragment key={i}>{n.value}</Fragment>;
      case 'br':
        return <br key={i} />;
      case 'strong':
        return <strong key={i} className="font-semibold text-slate-900 dark:text-white">{renderInline(n.children)}</strong>;
      case 'em':
        return <em key={i}>{renderInline(n.children)}</em>;
      case 'code':
        return (
          <code key={i} className="rounded-md bg-slate-100 px-1.5 py-0.5 font-mono text-[0.9em] text-slate-800 dark:bg-white/10 dark:text-slate-100">
            {n.value}
          </code>
        );
      case 'link':
        return (
          <a
            key={i}
            href={n.href}
            className="font-medium text-brand-700 underline decoration-brand-500/40 underline-offset-4 transition hover:decoration-brand-500 dark:text-brand-300"
            {...(n.external ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
          >
            {renderInline(n.children)}
          </a>
        );
    }
  });
}

function renderBlock(b: Block, i: number): ReactNode {
  switch (b.type) {
    case 'heading': {
      const styles = {
        2: 'mt-14 text-2xl font-semibold tracking-tight text-slate-900 sm:text-3xl dark:text-white',
        3: 'mt-10 text-xl font-semibold tracking-tight text-slate-900 dark:text-white',
        4: 'mt-8 text-lg font-semibold text-slate-900 dark:text-white',
      } as const;
      const Tag = `h${b.level}` as 'h2' | 'h3' | 'h4';
      return (
        <Tag key={i} id={b.id} className={`${styles[b.level]} scroll-mt-28 first:mt-0`}>
          {renderInline(b.children)}
        </Tag>
      );
    }
    case 'paragraph':
      return <p key={i} className="mt-6 first:mt-0">{renderInline(b.children)}</p>;
    case 'list': {
      const Tag = b.ordered ? 'ol' : 'ul';
      return (
        <Tag key={i} className={`mt-6 space-y-2 pl-6 first:mt-0 ${b.ordered ? 'list-decimal marker:font-semibold marker:text-brand-600' : 'list-disc marker:text-brand-500'}`}>
          {b.items.map((item, j) => (
            <li key={j} className="pl-1">{renderInline(item)}</li>
          ))}
        </Tag>
      );
    }
    case 'quote':
      return (
        <blockquote key={i} className="mt-8 border-l-4 border-brand-500 pl-5 text-xl italic text-slate-800 first:mt-0 dark:text-slate-200">
          {renderInline(b.children)}
        </blockquote>
      );
    case 'code':
      return (
        <pre key={i} className="mt-6 overflow-x-auto rounded-2xl bg-slate-900 p-5 text-sm leading-relaxed text-slate-100 first:mt-0 dark:bg-white/[0.06]">
          <code>{b.value}</code>
        </pre>
      );
    case 'image':
      return (
        <figure key={i} className="mt-10 first:mt-0">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={b.src}
            alt={b.alt}
            loading="lazy"
            decoding="async"
            className="h-auto w-full rounded-2xl border border-slate-200/70 dark:border-white/10"
          />
          {b.alt && <figcaption className="mt-3 text-center text-sm text-slate-500 dark:text-slate-400">{b.alt}</figcaption>}
        </figure>
      );
    case 'hr':
      return <hr key={i} className="my-12 border-slate-200 dark:border-white/10" />;
  }
}
