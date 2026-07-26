import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { getSeo, SITE_URL } from '@/lib/api';

const inter = Inter({ subsets: ['latin'], variable: '--font-sans', display: 'swap' });

/** Metadatos dinámicos leídos desde el panel (módulo SEO). */
export async function generateMetadata(): Promise<Metadata> {
  const seo = await getSeo('home');
  const title = seo?.title ?? 'Nathan Quevedo | Software y Licencias Premium';
  const description =
    seo?.description ??
    'Licencias originales, streaming premium, VPN, antivirus y almacenamiento en la nube con instalación remota y soporte técnico.';
  // Si hay una imagen OG personalizada se usa; si no, Next usa la generada en opengraph-image.tsx.
  const customImages = seo?.ogImage ? [{ url: seo.ogImage, width: 1200, height: 630, alt: title }] : undefined;

  return {
    metadataBase: new URL(SITE_URL),
    title: { default: title, template: '%s | Nathan Quevedo' },
    description,
    keywords: seo?.keywords ?? undefined,
    authors: [{ name: 'Nathan Quevedo' }],
    robots: seo?.noindex ? { index: false, follow: false } : { index: true, follow: true },
    alternates: { canonical: seo?.canonical ?? '/' },
    openGraph: {
      type: 'website',
      locale: 'es_ES',
      url: SITE_URL,
      title,
      description,
      siteName: 'Nathan Quevedo',
      ...(customImages ? { images: customImages } : {}),
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      ...(customImages ? { images: customImages.map((i) => i.url) } : {}),
    },
  };
}

export const viewport = {
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#ffffff' },
    { media: '(prefers-color-scheme: dark)', color: '#09090f' },
  ],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es" suppressHydrationWarning className={inter.variable}>
      <head>
        {/* Evita el parpadeo de tema (FOUC) aplicando la clase antes del render. */}
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var t=localStorage.getItem('theme');var d=t?t==='dark':window.matchMedia('(prefers-color-scheme: dark)').matches;if(d)document.documentElement.classList.add('dark');}catch(e){}})();`,
          }}
        />
      </head>
      <body>{children}</body>
    </html>
  );
}
