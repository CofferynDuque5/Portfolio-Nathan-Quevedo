'use client';

import { motion } from 'framer-motion';
import { MessageCircle } from 'lucide-react';
import { Service } from '@/lib/types';
import { Icon } from '@/lib/icon';
import { waLink } from '@/lib/utils';

export default function Services({ services, whatsapp }: { services: Service[]; whatsapp?: string }) {
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

        <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {services.map((s, i) => (
            <motion.article
              key={s.id}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-60px' }}
              transition={{ duration: 0.45, delay: (i % 3) * 0.08 }}
              className="group flex flex-col overflow-hidden rounded-3xl border border-slate-200/70 bg-white shadow-soft transition hover:-translate-y-1.5 hover:shadow-xl dark:border-white/10 dark:bg-white/[0.03]"
            >
              {/* Imagen / cabecera visual */}
              <div className="relative aspect-[16/10] overflow-hidden">
                {s.image ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={s.image}
                    alt={s.title}
                    loading="lazy"
                    decoding="async"
                    className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                  />
                ) : (
                  // Placeholder premium con degradado + icono cuando no hay imagen
                  <div className="relative flex h-full w-full items-center justify-center bg-gradient-to-br from-brand-500/15 via-fuchsia-500/10 to-transparent">
                    <div className="bg-grid absolute inset-0 opacity-50" />
                    <Icon name={s.icon} size={56} className="relative text-brand-500/70" strokeWidth={1.4} />
                  </div>
                )}

                {/* Badge de icono */}
                <span className="absolute left-4 top-4 grid h-11 w-11 place-items-center rounded-2xl bg-white/90 text-brand-600 shadow-soft backdrop-blur dark:bg-slate-900/80 dark:text-brand-300">
                  <Icon name={s.icon} size={20} />
                </span>

                {s.featured && (
                  <span className="absolute right-4 top-4 rounded-full bg-brand-600 px-3 py-1 text-xs font-semibold text-white shadow-glow">
                    Destacado
                  </span>
                )}
              </div>

              {/* Contenido */}
              <div className="flex flex-1 flex-col p-6">
                <div className="flex items-start justify-between gap-3">
                  <h3 className="text-lg font-semibold leading-snug">{s.title}</h3>
                  {s.price && (
                    <span className="shrink-0 rounded-full bg-brand-500/10 px-3 py-1 text-sm font-bold text-brand-600 dark:text-brand-300">
                      {s.price}
                    </span>
                  )}
                </div>

                <p className="mt-2 flex-1 text-sm leading-relaxed text-slate-600 dark:text-slate-400">
                  {s.shortDesc || s.description}
                </p>

                <a
                  href={waLink(whatsapp, `Hola, me interesa el servicio: ${s.title}`)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-primary mt-6 w-full"
                >
                  <MessageCircle size={16} /> {s.ctaText || 'Solicitar por WhatsApp'}
                </a>
              </div>
            </motion.article>
          ))}
        </div>
      </div>
    </section>
  );
}
