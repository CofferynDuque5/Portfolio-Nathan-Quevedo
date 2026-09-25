import { ReactNode } from 'react';
import { SiteContent } from '@/lib/types';
import { jsonLdHtml } from '@/lib/jsonld';
import Navbar from './Navbar';
import Footer from './Footer';
import FloatingWhatsApp from './FloatingWhatsApp';

/** Estructura común de las páginas interiores: menú, contenido, pie y WhatsApp. */
export default function PageShell({
  content,
  jsonLd,
  children,
}: {
  content: SiteContent;
  jsonLd?: object;
  children: ReactNode;
}) {
  const s = content.settings;
  const siteName = s.siteName || 'Nathan Quevedo';
  return (
    <>
      {jsonLd && <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLdHtml(jsonLd) }} />}
      <Navbar siteName={siteName} />
      <main className="pb-24 sm:pb-32">{children}</main>
      <Footer siteName={siteName} tagline={s.tagline} social={content.socialLinks} />
      <FloatingWhatsApp phone={s.whatsapp} />
    </>
  );
}
