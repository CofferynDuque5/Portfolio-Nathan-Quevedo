'use client';

import { useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { FolderKanban } from 'lucide-react';
import { ProjectCategory, ProjectSummary } from '@/lib/types';
import { CATEGORY_PARAM } from '@/lib/projects';
import { cn } from '@/lib/utils';
import ProjectCard from './ProjectCard';
import { useI18n } from '@/i18n/client';

/**
 * Listado de proyectos con filtro por categoría.
 * El filtro se refleja en la URL (?categoria=slug) para poder compartirlo,
 * sin recargar la página.
 */
export default function ProjectsExplorer({
  projects,
  initialCategory,
}: {
  projects: ProjectSummary[];
  initialCategory?: string;
}) {
  const { t: dict, locale, href } = useI18n();
  const t = dict.projects;
  // Solo se ofrecen las categorías que tienen al menos un proyecto publicado.
  const categories = useMemo(() => {
    const map = new Map<string, ProjectCategory & { count: number }>();
    for (const p of projects) {
      if (!p.category) continue;
      const entry = map.get(p.category.slug);
      if (entry) entry.count += 1;
      else map.set(p.category.slug, { ...p.category, count: 1 });
    }
    return Array.from(map.values()).sort((a, b) => a.name.localeCompare(b.name, locale));
  }, [projects, locale]);

  const [active, setActive] = useState<string | null>(
    initialCategory && categories.some((c) => c.slug === initialCategory) ? initialCategory : null
  );

  const visible = active ? projects.filter((p) => p.category?.slug === active) : projects;

  const select = (slug: string | null) => {
    setActive(slug);
    const url = new URL(window.location.href);
    if (slug) url.searchParams.set(CATEGORY_PARAM, slug);
    else url.searchParams.delete(CATEGORY_PARAM);
    window.history.replaceState(null, '', url);
  };

  if (!projects.length) {
    return (
      <div className="rounded-3xl border border-dashed border-slate-300 px-6 py-20 text-center dark:border-white/15">
        <FolderKanban className="mx-auto mb-4 text-slate-300 dark:text-slate-600" size={40} strokeWidth={1.4} />
        <p className="text-lg font-semibold">{t.emptyTitle}</p>
        <p className="mx-auto mt-2 max-w-md text-sm text-slate-500 dark:text-slate-400">
          {t.emptyText}
        </p>
        <a href={href('/contacto')} className="btn-primary mt-6">
          {t.emptyCta}
        </a>
      </div>
    );
  }

  const chip = (slug: string | null, label: string, count: number) => (
    <button
      key={slug ?? 'all'}
      type="button"
      onClick={() => select(slug)}
      aria-pressed={active === slug}
      className={cn(
        'inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-medium transition',
        active === slug
          ? 'border-slate-900 bg-slate-900 text-white dark:border-white dark:bg-white dark:text-slate-900'
          : 'border-slate-200 text-slate-600 hover:border-slate-400 hover:text-slate-900 dark:border-white/15 dark:text-slate-300 dark:hover:border-white/40 dark:hover:text-white'
      )}
    >
      {label}
      <span className={cn('text-xs tabular-nums', active === slug ? 'opacity-70' : 'text-slate-400')}>{count}</span>
    </button>
  );

  return (
    <div>
      {categories.length > 1 && (
        <div role="group" aria-label={t.filterLabel} className="mb-10 flex flex-wrap gap-2">
          {chip(null, t.all, projects.length)}
          {categories.map((c) => chip(c.slug, c.name, c.count))}
        </div>
      )}

      <p className="sr-only" aria-live="polite">
        {t.shown(visible.length)}
      </p>

      <motion.ul layout className="grid gap-x-8 gap-y-14 md:grid-cols-2">
        <AnimatePresence mode="popLayout" initial={false}>
          {visible.map((p, i) => {
            // Ritmo editorial: cada tercer proyecto ocupa el ancho completo; también
            // el último si quedaría solo en su fila.
            const wide = i % 3 === 0 || (i % 3 === 1 && i === visible.length - 1);
            return (
            <motion.li
              key={p.id}
              layout
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.97 }}
              transition={{ duration: 0.4, delay: Math.min(i, 4) * 0.05, ease: 'easeOut' }}
              className={cn(wide && 'md:col-span-2')}
            >
              <ProjectCard project={p} large={wide} />
            </motion.li>
            );
          })}
        </AnimatePresence>
      </motion.ul>
    </div>
  );
}
