'use client';

import { MessageCircle } from 'lucide-react';
import { waLink } from '@/lib/utils';
import { useI18n } from '@/i18n/client';

/** Bloque de llamado a la acción para pedir cotización (WhatsApp o formulario). */
export default function QuoteCTA({
  title,
  text,
  whatsapp,
  message,
  className = 'container-x mt-20 sm:mt-28',
}: {
  title?: string;
  text?: string;
  whatsapp?: string;
  message?: string;
  className?: string;
}) {
  const { t, href } = useI18n();
  return (
    <section className={className}>
      <div className="relative overflow-hidden rounded-3xl bg-slate-900 px-6 py-14 text-white sm:px-14 sm:py-20 dark:bg-white/[0.04]">
        <div className="bg-grid absolute inset-0 opacity-30" aria-hidden />
        <div className="relative max-w-2xl">
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">{title ?? t.cta.title}</h2>
          <p className="mt-4 text-lg text-slate-300">{text ?? t.cta.text}</p>
          <div className="mt-8 flex flex-wrap gap-3">
            <a href={waLink(whatsapp, message ?? t.whatsapp.quote)} target="_blank" rel="noopener noreferrer" className="btn-primary">
              <MessageCircle size={16} /> {t.common.quoteWhatsapp}
            </a>
            <a href={href('/contacto')} className="btn border border-white/20 text-white hover:bg-white/10">
              {t.common.writeMessage}
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
