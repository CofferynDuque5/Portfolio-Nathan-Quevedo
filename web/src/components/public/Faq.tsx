'use client';

import { useState } from 'react';
import { ChevronDown } from 'lucide-react';
import { Faq as FaqType } from '@/lib/types';
import { useI18n } from '@/i18n/client';

export default function Faq({ faqs }: { faqs: FaqType[] }) {
  const [open, setOpen] = useState<number | null>(0);
  const { t } = useI18n();
  if (!faqs.length) return null;

  return (
    <section id="faq" className="py-20 sm:py-28">
      <div className="container-x max-w-3xl">
        <div className="text-center">
          <span className="eyebrow">{t.faq.eyebrow}</span>
          <h2 className="section-title mt-4">{t.faq.title}</h2>
        </div>

        <div className="mt-10 space-y-3">
          {faqs.map((f, i) => {
            const isOpen = open === i;
            return (
              <div
                key={f.id}
                className="overflow-hidden rounded-2xl border border-slate-200 dark:border-white/10"
              >
                <button
                  onClick={() => setOpen(isOpen ? null : i)}
                  className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left font-medium"
                  aria-expanded={isOpen}
                >
                  {f.question}
                  <ChevronDown
                    size={18}
                    className={`shrink-0 text-brand-500 transition-transform ${isOpen ? 'rotate-180' : ''}`}
                  />
                </button>
                {/* Altura animada con CSS (grid 0fr -> 1fr); cerrada no es accesible por teclado ni lector. */}
                <div
                  className={`grid transition-[grid-template-rows,opacity] duration-300 ${
                    isOpen ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'
                  }`}
                  inert={!isOpen}
                >
                  <div className="overflow-hidden">
                    <p className="px-5 pb-5 text-slate-600 dark:text-slate-400">{f.answer}</p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
