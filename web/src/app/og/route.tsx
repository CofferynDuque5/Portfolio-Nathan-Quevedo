import { ImageResponse } from 'next/og';
import { DEFAULT_LOCALE, isLocale } from '@/i18n/config';
import { getDictionary } from '@/i18n/dictionaries';

export const runtime = 'edge';
const size = { width: 1200, height: 630 };

/**
 * Imagen Open Graph generada dinámicamente (compartir en redes / WhatsApp).
 * GET /og?lang=en devuelve la versión en ese idioma.
 */
export function GET(req: Request) {
  const lang = new URL(req.url).searchParams.get('lang');
  const t = getDictionary(isLocale(lang) ? lang : DEFAULT_LOCALE).pages.home;
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          padding: '80px',
          background: 'linear-gradient(135deg, #0b1020 0%, #1e1b4b 55%, #4c1d95 100%)',
          color: 'white',
          fontFamily: 'sans-serif',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 20, marginBottom: 40 }}>
          <div
            style={{
              width: 84,
              height: 84,
              borderRadius: 20,
              background: 'linear-gradient(135deg, #6366f1, #d946ef)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 48,
              fontWeight: 800,
            }}
          >
            N
          </div>
          <div style={{ fontSize: 34, fontWeight: 600, opacity: 0.9 }}>Nathan Quevedo</div>
        </div>
        <div style={{ fontSize: 68, fontWeight: 800, lineHeight: 1.1, maxWidth: 900 }}>
          {t.ogTitle}
        </div>
        <div style={{ fontSize: 34, marginTop: 30, opacity: 0.8, maxWidth: 900 }}>
          {t.ogSubtitle}
        </div>
      </div>
    ),
    {
      ...size,
      headers: { 'Cache-Control': 'public, max-age=86400, stale-while-revalidate=604800' },
    }
  );
}
