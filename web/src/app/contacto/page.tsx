import type { Metadata } from 'next';
import { getSiteContent, SITE_URL } from '@/lib/api';
import { pageMetadata } from '@/lib/seo';
import PageShell from '@/components/public/PageShell';
import Contact from '@/components/public/Contact';
import Faq from '@/components/public/Faq';

export function generateMetadata(): Promise<Metadata> {
  return pageMetadata('contacto', '/contacto', {
    title: 'Contacto y cotizaciones',
    description:
      'Escríbeme por WhatsApp o con el formulario y te preparo una cotización para streaming, licencias o soporte técnico.',
  });
}

export default async function ContactPage() {
  const content = await getSiteContent();
  const s = content.settings;

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'ContactPage',
    url: `${SITE_URL}/contacto`,
    mainEntity: {
      '@type': 'ProfessionalService',
      name: s.siteName || 'Nathan Quevedo',
      telephone: s.whatsapp || undefined,
      sameAs: content.socialLinks.map((l) => l.url),
    },
  };

  return (
    <PageShell content={content} jsonLd={jsonLd}>
      <Contact info={content.contactInfo} whatsapp={s.whatsapp} social={content.socialLinks} asPage />
      <Faq faqs={content.faqs} />
    </PageShell>
  );
}
