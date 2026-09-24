import { ReactNode } from 'react';
import Reveal from '@/components/Reveal';

/** Cabecera editorial de página interior (h1 único de la página). */
export default function PageHeader({
  eyebrow,
  title,
  lead,
  children,
}: {
  eyebrow: string;
  title: string;
  lead?: string;
  children?: ReactNode;
}) {
  return (
    <header className="container-x pb-14 pt-32 sm:pb-20 sm:pt-40">
      <Reveal>
        <span className="eyebrow">{eyebrow}</span>
        <h1 className="mt-6 max-w-4xl text-4xl font-bold leading-[1.05] tracking-tight sm:text-6xl">{title}</h1>
        {lead && (
          <p className="mt-6 max-w-2xl text-lg leading-relaxed text-slate-600 dark:text-slate-300">{lead}</p>
        )}
        {children}
      </Reveal>
    </header>
  );
}
