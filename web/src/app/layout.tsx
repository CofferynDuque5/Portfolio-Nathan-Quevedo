import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { getSeo, SITE_URL } from '@/lib/api';
import ConsentAndAnalytics from '@/components/ConsentAndAnalytics';
import { DEFAULT_LOCALE, getDictionary, getLocale, languageAlternates, localizedPath, LOCALE_META } from '@/i18n';
import { defaultOgImages } from '@/lib/seo';
import { I18nProvider } from '@/i18n/client';

const inter = Inter({ subsets: ['latin'], variable: '--font-sans', display: 'swap' });

/** Metadatos dinámicos leídos desde el panel (módulo SEO). */
export async function generateMetadata(): Promise<Metadata> {
  const locale = await getLocale();
  const seo = await getSeo('home', locale);
  const t = getDictionary(locale).pages.home;
  const title = seo?.title ?? t.metaTitle;
  const description = seo?.description ?? t.metaDescription;
  // Si hay una imagen OG personalizada se usa; si no, la generada en app/og en el idioma de la página.
  const images = seo?.ogImage
    ? [{ url: seo.ogImage, width: 1200, height: 630, alt: title }]
    : defaultOgImages(locale, t.ogAlt);
  const home = localizedPath('/', locale);

  return {
    metadataBase: new URL(SITE_URL),
    title: { default: title, template: '%s | Nathan Quevedo' },
    description,
    keywords: seo?.keywords ?? undefined,
    authors: [{ name: 'Nathan Quevedo' }],
    robots: seo?.noindex ? { index: false, follow: false } : { index: true, follow: true },
    alternates: {
      canonical: locale === DEFAULT_LOCALE ? seo?.canonical ?? '/' : home,
      languages: languageAlternates('/'),
    },
    openGraph: {
      type: 'website',
      locale: LOCALE_META[locale].og,
      url: `${SITE_URL}${locale === DEFAULT_LOCALE ? '' : home}`,
      title,
      description,
      siteName: 'Nathan Quevedo',
      images,
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: images.map((i) => i.url),
    },
  };
}

export const viewport = {
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#ffffff' },
    { media: '(prefers-color-scheme: dark)', color: '#09090f' },
  ],
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const locale = await getLocale();
  return (
    <html lang={locale} suppressHydrationWarning className={inter.variable}>
      <head>
        {/* Evita el parpadeo de tema (FOUC) aplicando la clase antes del render. */}
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var t=localStorage.getItem('theme');var d=t?t==='dark':window.matchMedia('(prefers-color-scheme: dark)').matches;if(d)document.documentElement.classList.add('dark');}catch(e){}})();`,
          }}
        />
      </head>
      <body>
        <I18nProvider locale={locale}>
          {children}
          <ConsentAndAnalytics />
        </I18nProvider>
      </body>
    </html>
  );
}
