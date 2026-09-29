import Link from 'next/link';
import { ArrowUpRight, Newspaper } from 'lucide-react';
import { PostSummary } from '@/lib/types';
import { cn } from '@/lib/utils';

/**
 * Tarjeta de un artículo: portada, fecha, título y resumen.
 * Recibe los textos ya traducidos para poder pintarse en el servidor.
 */
export default function PostCard({
  post,
  href,
  meta,
  large = false,
}: {
  post: PostSummary;
  href: string;
  /** "24 de septiembre de 2026 · 5 min de lectura" */
  meta: string;
  large?: boolean;
}) {
  return (
    <Link
      href={href}
      className={cn(
        'group flex h-full flex-col rounded-3xl focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-4',
        large && 'md:grid md:grid-cols-2 md:items-center md:gap-10'
      )}
    >
      <div className="relative aspect-[16/10] overflow-hidden rounded-3xl border border-slate-200/70 bg-slate-100 dark:border-white/10 dark:bg-white/[0.03]">
        {post.coverImage ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={post.coverImage}
            alt=""
            loading={large ? 'eager' : 'lazy'}
            decoding="async"
            className="h-full w-full object-cover transition duration-700 ease-out group-hover:scale-[1.04]"
          />
        ) : (
          <div className="relative flex h-full w-full items-center justify-center bg-gradient-to-br from-brand-500/15 via-fuchsia-500/10 to-transparent">
            <div className="bg-grid absolute inset-0 opacity-60" />
            <Newspaper size={52} strokeWidth={1.2} className="relative text-brand-500/60" />
          </div>
        )}
        <span className="absolute right-4 top-4 grid h-11 w-11 translate-y-1 place-items-center rounded-full bg-white/90 text-slate-900 opacity-0 shadow-soft backdrop-blur transition duration-300 group-hover:translate-y-0 group-hover:opacity-100 dark:bg-slate-900/85 dark:text-white">
          <ArrowUpRight size={18} />
        </span>
      </div>

      <div className={cn('mt-5 flex flex-1 flex-col', large && 'md:mt-0')}>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          {post.category?.name && (
            <span className="font-semibold text-brand-700 dark:text-brand-300">{post.category.name} · </span>
          )}
          {meta}
        </p>
        <h2
          className={cn(
            'mt-2 font-semibold tracking-tight transition group-hover:text-brand-700 dark:group-hover:text-brand-300',
            large ? 'text-2xl sm:text-4xl' : 'text-xl'
          )}
        >
          {post.title}
        </h2>
        {post.excerpt && (
          <p className={cn('mt-3 text-slate-600 dark:text-slate-300', large ? 'text-lg' : 'line-clamp-3')}>{post.excerpt}</p>
        )}
      </div>
    </Link>
  );
}
