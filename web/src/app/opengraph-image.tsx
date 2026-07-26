import { ImageResponse } from 'next/og';

export const runtime = 'edge';
export const alt = 'Nathan Quevedo — Software y Licencias Premium';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

/** Imagen Open Graph generada dinámicamente (compartir en redes / WhatsApp). */
export default function OpengraphImage() {
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
          Software original y suscripciones premium
        </div>
        <div style={{ fontSize: 34, marginTop: 30, opacity: 0.8, maxWidth: 900 }}>
          Licencias, streaming, seguridad y nube · Instalación remota y soporte garantizado
        </div>
      </div>
    ),
    { ...size }
  );
}
