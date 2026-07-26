'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown } from 'lucide-react';
import { Faq as FaqType } from '@/lib/types';

export default function Faq({ faqs }: { faqs: FaqType[] }) {
  const [open, setOpen] = useState<number | null>(0);
  if (!faqs.length) return null;

  return (
    <section id="faq" className="py-20 sm:py-28">
      <div className="container-x max-w-3xl">
        <div className="text-center">
          <span className="eyebrow">Preguntas frecuentes</span>
          <h2 className="section-title mt-4">Resolvemos tus dudas</h2>
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
                <AnimatePresence initial={false}>
                  {isOpen && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.25 }}
                    >
                      <p className="px-5 pb-5 text-slate-600 dark:text-slate-400">{f.answer}</p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
