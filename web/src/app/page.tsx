import { getSiteContent, SITE_URL } from '@/lib/api';
import Navbar from '@/components/public/Navbar';
import Hero from '@/components/public/Hero';
import About from '@/components/public/About';
import Services from '@/components/public/Services';
import Platforms from '@/components/public/Platforms';
import Licenses from '@/components/public/Licenses';
import Process from '@/components/public/Process';
import LogosMarquee from '@/components/public/LogosMarquee';
import BannerCTA from '@/components/public/BannerCTA';
import Faq from '@/components/public/Faq';
import Contact from '@/components/public/Contact';
import Footer from '@/components/public/Footer';

export default async function HomePage() {
  const content = await getSiteContent();
  const s = content.settings;
  const siteName = s.siteName || 'Nathan Quevedo';

  // Schema.org: negocio de servicios profesionales.
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'ProfessionalService',
    name: siteName,
    description: s.tagline,
    url: SITE_URL,
    email: s.email || undefined,
    telephone: s.whatsapp || undefined,
    sameAs: content.socialLinks.map((l) => l.url),
    makesOffer: content.services.map((svc) => ({
      '@type': 'Offer',
      itemOffered: { '@type': 'Service', name: svc.title, description: svc.shortDesc || undefined },
    })),
  };

  const faqLd =
    content.faqs.length > 0
      ? {
          '@context': 'https://schema.org',
          '@type': 'FAQPage',
          mainEntity: content.faqs.map((f) => ({
            '@type': 'Question',
            name: f.question,
            acceptedAnswer: { '@type': 'Answer', text: f.answer },
          })),
        }
      : null;

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      {faqLd && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(faqLd) }}
        />
      )}

      <Navbar siteName={siteName} />
      <main>
        <Hero slides={content.heroSlides} tagline={s.tagline} />
        <LogosMarquee logos={content.logos} />
        <About title={s.aboutTitle || 'Sobre Nathan Quevedo'} text={s.aboutText || ''} />
        <Services services={content.services} />
        <Platforms platforms={content.platforms} />
        <Licenses licenses={content.licenses} whatsapp={s.whatsapp} />
        <Process title={s.processTitle || 'Proceso de trabajo'} />
        <BannerCTA banner={content.banners[0]} />
        <Faq faqs={content.faqs} />
        <Contact info={content.contactInfo} />
      </main>
      <Footer siteName={siteName} tagline={s.tagline} social={content.socialLinks} />
    </>
  );
}
