'use client';

import Link from 'next/link';
import { ArrowUpRight } from 'lucide-react';
import { ProjectSummary } from '@/lib/types';
import { Icon } from '@/lib/icon';
import { parseTags } from '@/lib/projects';
import { cn } from '@/lib/utils';
import { useI18n } from '@/i18n/client';

/** Tarjeta editorial de un proyecto: portada, categoría, título y etiquetas. */
export default function ProjectCard({
  project,
  large = false,
}: {
  project: ProjectSummary;
  large?: boolean;
}) {
  const { t: dict, href } = useI18n();
  const tags = parseTags(project.tags).slice(0, 3);
  const meta = [project.client, project.year].filter(Boolean).join(' · ');

  return (
    <Link
      href={href(`/proyectos/${project.slug}`)}
      className="group flex h-full flex-col focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-4 rounded-3xl"
    >
      <div
        className={cn(
          'relative overflow-hidden rounded-3xl border border-slate-200/70 bg-slate-100 dark:border-white/10 dark:bg-white/[0.03]',
          large ? 'aspect-[4/3] md:aspect-[21/9]' : 'aspect-[4/3]'
        )}
      >
        {project.coverImage ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={project.coverImage}
            alt=""
            loading="lazy"
            decoding="async"
            className="h-full w-full object-cover transition duration-700 ease-out group-hover:scale-[1.04]"
          />
        ) : (
          <div className="relative flex h-full w-full items-center justify-center bg-gradient-to-br from-brand-500/15 via-fuchsia-500/10 to-transparent">
            <div className="bg-grid absolute inset-0 opacity-60" />
            <Icon name={project.category?.icon} size={56} strokeWidth={1.2} className="relative text-brand-500/60" />
          </div>
        )}

        <span className="absolute right-4 top-4 grid h-11 w-11 translate-y-1 place-items-center rounded-full bg-white/90 text-slate-900 opacity-0 shadow-soft backdrop-blur transition duration-300 group-hover:translate-y-0 group-hover:opacity-100 dark:bg-slate-900/85 dark:text-white">
          <ArrowUpRight size={18} />
        </span>
        {project.featured && (
          <span className="absolute left-4 top-4 rounded-full bg-brand-600 px-3 py-1 text-xs font-semibold text-white shadow-glow">
            {dict.common.featured}
          </span>
        )}
      </div>

      <div className="mt-5 flex flex-1 flex-col">
        <div className="flex items-center gap-3 text-xs font-semibold uppercase tracking-[0.14em] text-slate-500 dark:text-slate-400">
          {project.category && <span className="text-brand-600 dark:text-brand-300">{project.category.name}</span>}
          {project.category && meta && <span aria-hidden className="h-px w-6 bg-slate-300 dark:bg-white/20" />}
          {meta && <span className="truncate">{meta}</span>}
        </div>
        <h3
          className={cn(
            'mt-2 font-semibold leading-tight tracking-tight transition group-hover:text-brand-600 dark:group-hover:text-brand-300',
            large ? 'text-2xl sm:text-3xl' : 'text-xl'
          )}
        >
          {project.title}
        </h3>
        {project.summary && (
          <p className="mt-2 line-clamp-2 text-sm leading-relaxed text-slate-600 dark:text-slate-400">
            {project.summary}
          </p>
        )}
        {tags.length > 0 && (
          <ul className="mt-4 flex flex-wrap gap-2" aria-label={dict.common.tags}>
            {tags.map((t) => (
              <li
                key={t}
                className="rounded-full border border-slate-200 px-3 py-1 text-xs text-slate-600 dark:border-white/10 dark:text-slate-300"
              >
                {t}
              </li>
            ))}
          </ul>
        )}
      </div>
    </Link>
  );
}
