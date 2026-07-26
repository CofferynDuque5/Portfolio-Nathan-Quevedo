'use client';

import { motion } from 'framer-motion';
import { ArrowUpRight } from 'lucide-react';
import { Service } from '@/lib/types';
import { Icon } from '@/lib/icon';

export default function Services({ services }: { services: Service[] }) {
  if (!services.length) return null;

  return (
    <section id="servicios" className="py-20 sm:py-28">
      <div className="container-x">
        <div className="mx-auto max-w-2xl text-center">
          <span className="eyebrow">Servicios</span>
          <h2 className="section-title mt-4">Todo lo que necesitas, en un solo lugar</h2>
          <p className="mt-4 text-slate-600 dark:text-slate-300">
            Soluciones digitales premium con instalación remota y soporte incluido.
          </p>
        </div>

        <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {services.map((s, i) => (
            <motion.article
              key={s.id}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-60px' }}
              transition={{ duration: 0.45, delay: (i % 3) * 0.08 }}
              className="group card flex flex-col"
            >
              <div className="mb-4 flex items-center justify-between">
                <span className="grid h-12 w-12 place-items-center rounded-2xl bg-brand-500/10 text-brand-600 dark:text-brand-300">
                  <Icon name={s.icon} size={24} />
                </span>
                {s.featured && (
                  <span className="rounded-full bg-brand-500/10 px-3 py-1 text-xs font-semibold text-brand-600 dark:text-brand-300">
                    Destacado
                  </span>
                )}
              </div>
              <h3 className="text-lg font-semibold">{s.title}</h3>
              <p className="mt-2 flex-1 text-sm text-slate-600 dark:text-slate-400">
                {s.shortDesc || s.description}
              </p>
              <a
                href={s.ctaLink || '#contacto'}
                className="mt-5 inline-flex items-center gap-1 text-sm font-semibold text-brand-600 transition group-hover:gap-2 dark:text-brand-300"
              >
                {s.ctaText || 'Contactar'} <ArrowUpRight size={16} />
              </a>
            </motion.article>
          ))}
        </div>
      </div>
    </section>
  );
}
