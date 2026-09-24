import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { ProjectSummary } from '@/lib/types';
import Reveal from '@/components/Reveal';
import ProjectCard from './projects/ProjectCard';

/** Sección de la home con los proyectos publicados más relevantes. */
export default function FeaturedProjects({ projects }: { projects: ProjectSummary[] }) {
  if (!projects.length) return null;
  const [first, ...rest] = projects.slice(0, 3);

  return (
    <section id="proyectos" className="py-20 sm:py-28">
      <div className="container-x">
        <Reveal className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
          <div className="max-w-2xl">
            <span className="eyebrow">Proyectos</span>
            <h2 className="section-title mt-4">Casos de estudio</h2>
            <p className="mt-4 text-slate-600 dark:text-slate-300">
              Trabajos reales, explicados de principio a fin.
            </p>
          </div>
          <Link href="/proyectos" className="btn-ghost self-start sm:self-auto">
            Ver todos <ArrowRight size={16} />
          </Link>
        </Reveal>

        <div className="mt-12 grid gap-x-8 gap-y-14 lg:grid-cols-2">
          <Reveal className={rest.length ? 'lg:row-span-2' : 'lg:col-span-2'}>
            <ProjectCard project={first} large={!rest.length} />
          </Reveal>
          {rest.map((p, i) => (
            <Reveal key={p.id} delay={0.08 * (i + 1)}>
              <ProjectCard project={p} />
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
