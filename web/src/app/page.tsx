import { getSiteContent, SITE_URL } from '@/lib/api';
import { jsonLdHtml } from '@/lib/jsonld';
import Navbar from '@/components/public/Navbar';
import Hero from '@/components/public/Hero';
import About from '@/components/public/About';
import Services from '@/components/public/Services';
import FeaturedProjects from '@/components/public/FeaturedProjects';
import Platforms from '@/components/public/Platforms';
import Licenses from '@/components/public/Licenses';
import Process from '@/components/public/Process';
import LogosMarquee from '@/components/public/LogosMarquee';
import BannerCTA from '@/components/public/BannerCTA';
import Faq from '@/components/public/Faq';
import Testimonials from '@/components/public/Testimonials';
import Contact from '@/components/public/Contact';
import Footer from '@/components/public/Footer';
import FloatingWhatsApp from '@/components/public/FloatingWhatsApp';
import { getI18n } from '@/i18n';

export default async function HomePage() {
  const { t, locale, href } = await getI18n();
  const content = await getSiteContent(locale);
  const s = content.settings;
  const siteName = s.siteName || 'Nathan Quevedo';

  // Schema.org: negocio de servicios profesionales.
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'ProfessionalService',
    name: siteName,
    description: s.tagline,
    url: `${SITE_URL}${href('/') === '/' ? '' : href('/')}`,
    inLanguage: locale,
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
        dangerouslySetInnerHTML={{ __html: jsonLdHtml(jsonLd) }}
      />
      {faqLd && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: jsonLdHtml(faqLd) }}
        />
      )}

      <Navbar siteName={siteName} />
      <main>
        <Hero slides={content.heroSlides} tagline={s.tagline} />
        <LogosMarquee logos={content.logos} />
        <About title={s.aboutTitle || t.about.titleFor(siteName)} text={s.aboutText || ''} settings={s} />
        <Services services={content.services} whatsapp={s.whatsapp} />
        <FeaturedProjects projects={content.projects} />
        <Testimonials
          testimonials={content.testimonials}
          eyebrow={t.testimonials.eyebrow}
          title={t.testimonials.title}
          ratingLabel={t.testimonials.rating}
        />
        <Platforms platforms={content.platforms} />
        <Licenses licenses={content.licenses} whatsapp={s.whatsapp} />
        <Process title={s.processTitle || t.process.defaultTitle} />
        <BannerCTA banner={content.banners[0]} />
        <Faq faqs={content.faqs} />
        <Contact info={content.contactInfo} />
      </main>
      <Footer siteName={siteName} tagline={s.tagline} social={content.socialLinks} />
      <FloatingWhatsApp phone={s.whatsapp} />
    </>
  );
}
