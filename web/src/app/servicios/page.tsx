import type { Metadata } from 'next';
import { getSiteContent, SITE_URL } from '@/lib/api';
import { pageMetadata } from '@/lib/seo';
import { getT } from '@/i18n';
import { Category, Service } from '@/lib/types';
import PageShell from '@/components/public/PageShell';
import PageHeader from '@/components/public/PageHeader';
import ServiceCard from '@/components/public/ServiceCard';
import Platforms from '@/components/public/Platforms';
import Licenses from '@/components/public/Licenses';
import Process from '@/components/public/Process';
import QuoteCTA from '@/components/public/QuoteCTA';

export function generateMetadata(): Promise<Metadata> {
  const t = getT().pages.services;
  return pageMetadata('servicios', '/servicios', { title: t.metaTitle, description: t.metaDescription });
}

/** Agrupa los servicios por categoría respetando el orden del panel. */
function groupByCategory(services: Service[], categories: Category[]) {
  const groups = categories
    .map((c) => ({ category: c as Category | null, items: services.filter((s) => s.categoryId === c.id) }))
    .filter((g) => g.items.length > 0);
  const known = new Set(categories.map((c) => c.id));
  const others = services.filter((s) => !s.categoryId || !known.has(s.categoryId));
  if (others.length) groups.push({ category: null, items: others });
  return groups;
}

export default async function ServicesPage() {
  const content = await getSiteContent();
  const s = content.settings;
  const groups = groupByCategory(content.services, content.categories);
  const dict = getT();
  const t = dict.pages.services;

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: dict.nav.services,
    url: `${SITE_URL}/servicios`,
    itemListElement: content.services.map((svc, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      item: {
        '@type': 'Service',
        name: svc.title,
        description: svc.shortDesc || svc.description || undefined,
        category: svc.category?.name,
        provider: { '@type': 'Person', name: s.siteName || 'Nathan Quevedo' },
      },
    })),
  };

  return (
    <PageShell content={content} jsonLd={jsonLd}>
      <PageHeader
        eyebrow={t.eyebrow}
        title={t.title}
        lead={t.lead}
      >
        {groups.length > 1 && (
          <nav aria-label={t.categoriesLabel} className="mt-10 flex flex-wrap gap-2">
            {groups.map((g) => (
              <a
                key={g.category?.slug ?? 'otros'}
                href={`#${g.category?.slug ?? 'otros'}`}
                className="rounded-full border border-slate-200 px-4 py-2 text-sm font-medium text-slate-600 transition hover:border-slate-400 hover:text-slate-900 dark:border-white/15 dark:text-slate-300 dark:hover:border-white/40 dark:hover:text-white"
              >
                {g.category?.name ?? t.others}
              </a>
            ))}
          </nav>
        )}
      </PageHeader>

      {/* Streaming primero: es la línea principal del negocio. */}
      <Platforms platforms={content.platforms} />

      <div className="space-y-16 sm:space-y-20">
        {groups.map((g) => (
          <section
            key={g.category?.slug ?? 'otros'}
            id={g.category?.slug ?? 'otros'}
            aria-labelledby={`h-${g.category?.slug ?? 'otros'}`}
            className="container-x grid scroll-mt-24 gap-8 border-t border-slate-200 pt-8 lg:grid-cols-12 dark:border-white/10"
          >
            {/* Etiqueta de la categoría fija a la izquierda en escritorio (composición editorial). */}
            <div className="lg:col-span-4">
              <div className="lg:sticky lg:top-28">
                <h2 id={`h-${g.category?.slug ?? 'otros'}`} className="text-2xl font-semibold tracking-tight sm:text-3xl">
                  {g.category?.name ?? t.others}
                </h2>
                {g.category?.description && (
                  <p className="mt-3 max-w-sm text-slate-500 dark:text-slate-400">{g.category.description}</p>
                )}
                <p className="mt-3 text-sm text-slate-400">
                  {t.count(g.items.length)}
                </p>
              </div>
            </div>
            <div className="grid gap-6 sm:grid-cols-2 lg:col-span-8">
              {g.items.map((svc, i) => (
                <ServiceCard key={svc.id} s={svc} i={i} whatsapp={s.whatsapp} />
              ))}
            </div>
          </section>
        ))}
      </div>

      <div className="mt-20 sm:mt-28">
        <Licenses licenses={content.licenses} whatsapp={s.whatsapp} />
        <Process title={s.processTitle || dict.process.defaultTitle} />
      </div>

      <QuoteCTA
        title={t.ctaTitle}
        text={t.ctaText}
        whatsapp={s.whatsapp}
        className="container-x"
      />
    </PageShell>
  );
}
