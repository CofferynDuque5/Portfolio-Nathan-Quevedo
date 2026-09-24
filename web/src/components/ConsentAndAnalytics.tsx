'use client';

import { useEffect, useRef, useState } from 'react';
import { usePathname } from 'next/navigation';
import { ShieldCheck } from 'lucide-react';
import {
  browserOptedOut, CONSENT_CHANGED, getConsent, OPEN_CONSENT, setConsent, track,
} from '@/lib/analytics';

const WHATSAPP_RE = /(wa\.me|api\.whatsapp\.com|whatsapp:)/i;

/**
 * Aviso de privacidad + medición del sitio público.
 * - Muestra el aviso mientras el visitante no haya elegido.
 * - Registra páginas vistas y clics en WhatsApp solo con consentimiento.
 * - No actúa en el panel (/admin).
 */
export default function ConsentAndAnalytics() {
  const pathname = usePathname();
  const isAdmin = pathname?.startsWith('/admin');
  const [open, setOpen] = useState(false);
  const [details, setDetails] = useState(false);
  const lastPath = useRef<string | null>(null);

  // Estado inicial y reapertura desde "Preferencias de privacidad".
  useEffect(() => {
    if (isAdmin) return;
    if (getConsent() === null && !browserOptedOut()) setOpen(true);
    const reopen = () => setOpen(true);
    window.addEventListener(OPEN_CONSENT, reopen);
    return () => window.removeEventListener(OPEN_CONSENT, reopen);
  }, [isAdmin]);

  // Página vista en cada navegación (y al aceptar, la página actual).
  useEffect(() => {
    if (isAdmin || !pathname) return;
    const send = () => {
      if (lastPath.current === pathname) return;
      if (getConsent() !== 'granted') return;
      lastPath.current = pathname;
      track('pageview', pathname);
    };
    send();
    window.addEventListener(CONSENT_CHANGED, send);
    return () => window.removeEventListener(CONSENT_CHANGED, send);
  }, [pathname, isAdmin]);

  // Clics en cualquier enlace de WhatsApp del sitio (conversión).
  useEffect(() => {
    if (isAdmin) return;
    const onClick = (e: MouseEvent) => {
      const a = (e.target as Element | null)?.closest?.('a[href]') as HTMLAnchorElement | null;
      if (a && WHATSAPP_RE.test(a.href)) track('whatsapp_click');
    };
    document.addEventListener('click', onClick, { capture: true });
    return () => document.removeEventListener('click', onClick, { capture: true });
  }, [isAdmin]);

  if (isAdmin || !open) return null;

  const choose = (value: 'granted' | 'denied') => {
    setConsent(value);
    setOpen(false);
  };

  return (
    <div
      role="dialog"
      aria-modal="false"
      aria-labelledby="consent-title"
      className="fixed inset-x-3 bottom-3 z-[60] mx-auto max-w-xl animate-fade-up rounded-3xl border border-slate-200 bg-white/95 p-5 shadow-2xl backdrop-blur-xl sm:bottom-6 sm:p-6 dark:border-white/10 dark:bg-slate-900/95"
    >
      <div className="flex items-start gap-4">
        <span className="hidden h-10 w-10 shrink-0 place-items-center rounded-2xl bg-brand-500/10 text-brand-600 sm:grid dark:text-brand-300">
          <ShieldCheck size={20} />
        </span>
        <div className="min-w-0">
          <h2 id="consent-title" className="font-semibold">Tu privacidad, primero</h2>
          <p className="mt-1.5 text-sm leading-relaxed text-slate-600 dark:text-slate-300">
            ¿Nos permites medir de forma anónima cómo se usa el sitio? Nos ayuda a mejorarlo. No usamos
            cookies de terceros ni publicidad.
          </p>
          {details && (
            <ul className="mt-3 space-y-1.5 text-sm text-slate-500 dark:text-slate-400">
              <li>• Se registran las páginas vistas, el tipo de dispositivo y navegador, y de qué sitio llegas.</li>
              <li>• También los clics en WhatsApp y los formularios enviados.</li>
              <li>• No guardamos tu IP. Se usa un identificador aleatorio en tu navegador.</li>
              <li>• Los datos se borran a los 13 meses. Puedes cambiar tu elección en el pie de página.</li>
            </ul>
          )}
          <div className="mt-4 flex flex-wrap items-center gap-2">
            <button onClick={() => choose('granted')} className="btn-primary px-5 py-2.5">
              Aceptar
            </button>
            <button onClick={() => choose('denied')} className="btn-ghost px-5 py-2.5">
              Rechazar
            </button>
            {!details && (
              <button
                onClick={() => setDetails(true)}
                className="px-2 py-2 text-sm font-medium text-slate-500 underline-offset-4 hover:text-slate-900 hover:underline dark:text-slate-400 dark:hover:text-white"
              >
                Qué medimos
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
