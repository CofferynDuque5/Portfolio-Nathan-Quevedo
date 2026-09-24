import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { getSiteContent, SITE_URL } from '@/lib/api';
import { pageMetadata } from '@/lib/seo';
import PageShell from '@/components/public/PageShell';
import PageHeader from '@/components/public/PageHeader';
import Process from '@/components/public/Process';
import FeaturedProjects from '@/components/public/FeaturedProjects';
import QuoteCTA from '@/components/public/QuoteCTA';
import { Icon } from '@/lib/icon';

export function generateMetadata(): Promise<Metadata> {
  return pageMetadata('sobre-mi', '/sobre-mi', {
    title: 'Sobre Nathan Quevedo',
    description:
      'Quién es Nathan Quevedo y cómo trabaja: servicios digitales, streaming, licencias originales y soporte técnico remoto.',
  });
}

export default async function AboutPage() {
  const content = await getSiteContent();
  const s = content.settings;
  const name = s.siteName || 'Nathan Quevedo';

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'AboutPage',
    url: `${SITE_URL}/sobre-mi`,
    mainEntity: {
      '@type': 'Person',
      name,
      description: s.aboutText || undefined,
      sameAs: content.socialLinks.map((l) => l.url),
    },
  };

  return (
    <PageShell content={content} jsonLd={jsonLd}>
      {/* Texto editable en el panel: Configuración general > aboutTitle / aboutText. */}
      <PageHeader eyebrow="Sobre mí" title={s.aboutTitle || `Sobre ${name}`} lead={s.aboutText || undefined}>
        <div className="mt-10 flex flex-wrap gap-3">
          <Link href="/servicios" className="btn-primary">
            Ver servicios <ArrowRight size={16} />
          </Link>
          <Link href="/contacto" className="btn-ghost">
            Contactar
          </Link>
        </div>
      </PageHeader>

      {/* Líneas de trabajo: las categorías activas del panel. */}
      {content.categories.length > 0 && (
        <section aria-labelledby="h-areas" className="container-x">
          <h2 id="h-areas" className="border-t border-slate-200 pt-8 text-2xl font-semibold tracking-tight sm:text-3xl dark:border-white/10">
            En qué te puedo ayudar
          </h2>
          <ul className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {content.categories.map((c) => (
              <li key={c.id}>
                <Link href={`/servicios#${c.slug}`} className="card group flex h-full items-start gap-4">
                  <span className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-brand-500/10 text-brand-600 dark:text-brand-300">
                    <Icon name={c.icon} size={20} />
                  </span>
                  <span>
                    <span className="block font-semibold group-hover:text-brand-600 dark:group-hover:text-brand-300">{c.name}</span>
                    {c.description && (
                      <span className="mt-1 block text-sm text-slate-500 dark:text-slate-400">{c.description}</span>
                    )}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      )}

      <Process title={s.processTitle || 'Proceso de trabajo'} />
      <FeaturedProjects projects={content.projects} />
      <QuoteCTA whatsapp={s.whatsapp} className="container-x" />
    </PageShell>
  );
}
