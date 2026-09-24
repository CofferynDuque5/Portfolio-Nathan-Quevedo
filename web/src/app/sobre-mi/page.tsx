import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { getSiteContent, SITE_URL } from '@/lib/api';
import { pageMetadata } from '@/lib/seo';
import { getT } from '@/i18n';
import PageShell from '@/components/public/PageShell';
import PageHeader from '@/components/public/PageHeader';
import Process from '@/components/public/Process';
import FeaturedProjects from '@/components/public/FeaturedProjects';
import QuoteCTA from '@/components/public/QuoteCTA';
import { Icon } from '@/lib/icon';

export function generateMetadata(): Promise<Metadata> {
  const t = getT().pages.about;
  return pageMetadata('sobre-mi', '/sobre-mi', { title: t.metaTitle, description: t.metaDescription });
}

export default async function AboutPage() {
  const content = await getSiteContent();
  const s = content.settings;
  const name = s.siteName || 'Nathan Quevedo';
  const t = getT();

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
      <PageHeader eyebrow={t.pages.about.eyebrow} title={s.aboutTitle || t.about.titleFor(name)} lead={s.aboutText || undefined}>
        <div className="mt-10 flex flex-wrap gap-3">
          <Link href="/servicios" className="btn-primary">
            {t.common.seeServices} <ArrowRight size={16} />
          </Link>
          <Link href="/contacto" className="btn-ghost">
            {t.common.contact}
          </Link>
        </div>
      </PageHeader>

      {/* Líneas de trabajo: las categorías activas del panel. */}
      {content.categories.length > 0 && (
        <section aria-labelledby="h-areas" className="container-x">
          <h2 id="h-areas" className="border-t border-slate-200 pt-8 text-2xl font-semibold tracking-tight sm:text-3xl dark:border-white/10">
            {t.pages.about.areasTitle}
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

      <Process title={s.processTitle || t.process.defaultTitle} />
      <FeaturedProjects projects={content.projects} />
      <QuoteCTA whatsapp={s.whatsapp} className="container-x" />
    </PageShell>
  );
}
