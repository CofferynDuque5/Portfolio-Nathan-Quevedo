import type { Metadata } from 'next';
import { getSiteContent, SITE_URL } from '@/lib/api';
import { pageMetadata } from '@/lib/seo';
import { getI18n, getT } from '@/i18n';
import PageShell from '@/components/public/PageShell';
import Contact from '@/components/public/Contact';
import Faq from '@/components/public/Faq';

export async function generateMetadata(): Promise<Metadata> {
  const t = (await getT()).pages.contact;
  return pageMetadata('contacto', '/contacto', { title: t.metaTitle, description: t.metaDescription });
}

export default async function ContactPage() {
  const { locale, href } = await getI18n();
  const content = await getSiteContent(locale);
  const s = content.settings;

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'ContactPage',
    url: `${SITE_URL}${href('/contacto')}`,
    inLanguage: locale,
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
