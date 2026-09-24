'use client';

import Link from 'next/link';
import { ArrowLeft, ArrowRight, ArrowUpRight } from 'lucide-react';
import { Project, ProjectLink } from '@/lib/types';
import { formatMonthYear, parseGallery, parseTags } from '@/lib/projects';
import Reveal from '@/components/Reveal';
import RichText from './RichText';
import QuoteCTA from '../QuoteCTA';
import { useI18n } from '@/i18n/client';

/**
 * Caso de estudio completo. Se usa en la página pública (/proyectos/[slug])
 * y en la vista previa del panel, para que lo que se previsualiza sea
 * exactamente lo que se publica.
 */
export default function ProjectDetail({
  project,
  prev,
  next,
  whatsapp,
}: {
  project: Project;
  prev?: ProjectLink | null;
  next?: ProjectLink | null;
  whatsapp?: string;
}) {
  const { t: dict, intl, href } = useI18n();
  const t = dict.caseStudy;
  const tags = parseTags(project.tags);
  const gallery = parseGallery(project.gallery);
  const published = formatMonthYear(project.publishedAt, intl);

  const facts = [
    { label: t.client, value: project.client },
    { label: t.year, value: project.year },
    { label: t.category, value: project.category?.name },
    { label: t.published, value: published },
  ].filter((f): f is { label: string; value: string } => Boolean(f.value));

  const sections = [
    { key: 'reto', title: t.challenge, text: project.challenge },
    { key: 'solucion', title: t.solution, text: project.solution },
    { key: 'resultados', title: t.results, text: project.results },
  ].filter((s) => s.text?.trim());

  return (
    <article>
      {/* Cabecera editorial */}
      <header className="container-x pt-32 sm:pt-40">
        <Link
          href={href('/proyectos')}
          className="inline-flex items-center gap-2 text-sm font-medium text-slate-500 transition hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"
        >
          <ArrowLeft size={16} /> {t.back}
        </Link>

        <Reveal>
          <h1 className="mt-8 max-w-5xl text-4xl font-bold leading-[1.05] tracking-tight sm:text-6xl lg:text-7xl">
            {project.title}
          </h1>
          {project.summary && (
            <p className="mt-6 max-w-3xl text-lg leading-relaxed text-slate-600 sm:text-xl dark:text-slate-300">
              {project.summary}
            </p>
          )}
        </Reveal>

        {(facts.length > 0 || project.url) && (
          <Reveal delay={0.1}>
            <dl className="mt-12 grid grid-cols-2 gap-x-6 gap-y-6 border-t border-slate-200 pt-6 sm:grid-cols-4 dark:border-white/10">
              {facts.map((f) => (
                <div key={f.label}>
                  <dt className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-400">{f.label}</dt>
                  <dd className="mt-1.5 font-medium first-letter:uppercase">{f.value}</dd>
                </div>
              ))}
            </dl>
          </Reveal>
        )}
      </header>

      {/* Portada */}
      {project.coverImage && (
        <Reveal className="container-x mt-12 sm:mt-16">
          <div className="overflow-hidden rounded-3xl border border-slate-200/70 dark:border-white/10">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={project.coverImage} alt={project.title} className="h-auto w-full object-cover" />
          </div>
        </Reveal>
      )}

      {/* Cuerpo: secciones numeradas con la etiqueta fija en escritorio */}
      {sections.length > 0 && (
        <div className="container-x mt-20 space-y-20 sm:mt-28 sm:space-y-28">
          {sections.map((s, i) => (
            <section key={s.key} aria-labelledby={`sec-${s.key}`} className="grid gap-6 lg:grid-cols-12">
              <div className="lg:col-span-4">
                <div className="lg:sticky lg:top-28">
                  <span className="font-mono text-sm text-brand-600 dark:text-brand-300">
                    {String(i + 1).padStart(2, '0')}
                  </span>
                  <h2 id={`sec-${s.key}`} className="mt-2 text-2xl font-semibold tracking-tight sm:text-3xl">
                    {s.title}
                  </h2>
                </div>
              </div>
              <Reveal className="lg:col-span-8">
                <RichText
                  text={s.text}
                  className="text-lg leading-relaxed text-slate-700 dark:text-slate-300"
                />
              </Reveal>
            </section>
          ))}
        </div>
      )}

      {/* Galería */}
      {gallery.length > 0 && (
        <section aria-label={t.gallery} className="container-x mt-20 sm:mt-28">
          <div className="grid gap-6 sm:grid-cols-2">
            {gallery.map((src, i) => (
              <Reveal
                key={`${src}-${i}`}
                delay={(i % 2) * 0.08}
                className={gallery.length % 2 === 1 && i === 0 ? 'sm:col-span-2' : undefined}
              >
                <div className="overflow-hidden rounded-3xl border border-slate-200/70 dark:border-white/10">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={src} alt="" loading="lazy" decoding="async" className="h-auto w-full object-cover" />
                </div>
              </Reveal>
            ))}
          </div>
        </section>
      )}

      {/* Etiquetas + enlace */}
      {(tags.length > 0 || project.url) && (
        <div className="container-x mt-16">
          <div className="flex flex-col gap-6 border-t border-slate-200 pt-8 sm:flex-row sm:items-center sm:justify-between dark:border-white/10">
          {tags.length > 0 ? (
            <ul className="flex flex-wrap gap-2" aria-label={dict.common.tags}>
              {tags.map((tag) => (
                <li
                  key={tag}
                  className="rounded-full border border-slate-200 px-3 py-1 text-sm text-slate-600 dark:border-white/10 dark:text-slate-300"
                >
                  {tag}
                </li>
              ))}
            </ul>
          ) : <span />}
          {project.url && (
            <a href={project.url} target="_blank" rel="noopener noreferrer" className="btn-ghost self-start">
              {t.live} <ArrowUpRight size={16} />
            </a>
          )}
          </div>
        </div>
      )}

      {/* Llamado a la acción */}
      <QuoteCTA
        title={t.ctaTitle}
        whatsapp={whatsapp}
        message={dict.whatsapp.project(project.title)}
      />

      {/* Navegación entre proyectos */}
      {(prev || next) && (
        <nav aria-label={t.otherProjects} className="container-x mt-16 grid gap-4 sm:grid-cols-2">
          {prev ? (
            <Link href={href(`/proyectos/${prev.slug}`)} className="card group">
              <span className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.14em] text-slate-400">
                <ArrowLeft size={14} className="transition group-hover:-translate-x-1" /> {t.prev}
              </span>
              <span className="mt-2 block text-lg font-semibold">{prev.title}</span>
            </Link>
          ) : <span className="hidden sm:block" />}
          {next && (
            <Link href={href(`/proyectos/${next.slug}`)} className="card group sm:text-right">
              <span className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.14em] text-slate-400 sm:justify-end">
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
