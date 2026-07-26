'use client';

import { motion } from 'framer-motion';
import { ArrowRight, ShieldCheck, Zap, BadgeCheck } from 'lucide-react';
import { HeroSlide } from '@/lib/types';

export default function Hero({ slides, tagline }: { slides: HeroSlide[]; tagline?: string }) {
  const slide = slides[0];
  if (!slide) return null;

  return (
    <section id="top" className="relative overflow-hidden pt-28 pb-20 sm:pt-36 sm:pb-28">
      {/* Fondo decorativo */}
      <div className="bg-grid absolute inset-0 -z-10 opacity-60" />
      <div className="absolute left-1/2 top-0 -z-10 h-[420px] w-[720px] -translate-x-1/2 rounded-full bg-brand-500/20 blur-[120px]" />

      <div className="container-x">
        <div className="mx-auto max-w-3xl text-center">
          <motion.span
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="eyebrow"
          >
            <BadgeCheck size={14} /> {tagline || 'Servicios digitales premium'}
          </motion.span>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.05 }}
            className="mt-6 text-4xl font-extrabold leading-[1.1] tracking-tight sm:text-6xl"
          >
            {slide.title}{' '}
            {slide.highlight && (
              <span className="bg-gradient-to-r from-brand-500 to-fuchsia-500 bg-clip-text text-transparent">
                {slide.highlight}
              </span>
            )}
          </motion.h1>

          {slide.subtitle && (
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.15 }}
              className="mx-auto mt-6 max-w-2xl text-lg text-slate-600 dark:text-slate-300"
            >
              {slide.subtitle}
            </motion.p>
          )}

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.25 }}
            className="mt-9 flex flex-wrap items-center justify-center gap-3"
          >
            <a href={slide.ctaLink || '#contacto'} className="btn-primary">
              {slide.ctaText || 'Contactar'} <ArrowRight size={16} />
            </a>
            <a href="#servicios" className="btn-ghost">
              Ver servicios
            </a>
          </motion.div>

          <motion.ul
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="mt-10 flex flex-wrap items-center justify-center gap-x-6 gap-y-3 text-sm text-slate-500 dark:text-slate-400"
          >
            <li className="flex items-center gap-2">
              <ShieldCheck size={16} className="text-brand-500" /> Licencias 100% originales
            </li>
            <li className="flex items-center gap-2">
              <Zap size={16} className="text-brand-500" /> Activación rápida
            </li>
            <li className="flex items-center gap-2">
              <BadgeCheck size={16} className="text-brand-500" /> Soporte garantizado
            </li>
          </motion.ul>
        </div>
      </div>
    </section>
  );
}
