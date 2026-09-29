'use client';

import { ArrowRight, ShieldCheck, Zap, BadgeCheck } from 'lucide-react';
import { HeroSlide } from '@/lib/types';
import { useI18n } from '@/i18n/client';

export default function Hero({ slides, tagline }: { slides: HeroSlide[]; tagline?: string }) {
  const { t, href } = useI18n();
  const slide = slides[0];
  if (!slide) return null;

  return (
    <section id="top" className="relative overflow-hidden pt-28 pb-20 sm:pt-36 sm:pb-28">
      {/* Fondo decorativo */}
      <div className="bg-grid absolute inset-0 -z-10 opacity-60" />
      <div className="absolute left-1/2 top-0 -z-10 h-[420px] w-[720px] -translate-x-1/2 rounded-full bg-brand-500/20 blur-[120px]" />

      <div className="container-x">
        <div className="mx-auto max-w-3xl text-center">
          <span
            className="animate-fade-in-up eyebrow"
          >
            <BadgeCheck size={14} /> {tagline || t.hero.badge}
          </span>

          <h1
            className="animate-rise mt-6 text-4xl font-extrabold leading-[1.1] tracking-tight sm:text-6xl"
          >
            {slide.title}{' '}
            {slide.highlight && (
              <span className="bg-gradient-to-r from-brand-500 to-fuchsia-500 bg-clip-text text-transparent">
                {slide.highlight}
              </span>
            )}
          </h1>

          {slide.subtitle && (
            <p
              className="animate-fade-in-up [animation-delay:150ms] mx-auto mt-6 max-w-2xl text-lg text-slate-600 dark:text-slate-300"
            >
              {slide.subtitle}
            </p>
          )}

          <div
            className="animate-fade-in-up [animation-delay:250ms] mt-9 flex flex-wrap items-center justify-center gap-3"
          >
            <a href={href(slide.ctaLink || '#contacto')} className="btn-primary">
              {slide.ctaText || t.common.contact} <ArrowRight size={16} />
            </a>
            <a href="#servicios" className="btn-ghost">
              {t.common.seeServices}
            </a>
          </div>

          <ul
            className="animate-fade-in-up [animation-delay:400ms] mt-10 flex flex-wrap items-center justify-center gap-x-6 gap-y-3 text-sm text-slate-500 dark:text-slate-400"
          >
            <li className="flex items-center gap-2">
              <ShieldCheck size={16} className="text-brand-500" /> {t.hero.trust[0]}
            </li>
            <li className="flex items-center gap-2">
              <Zap size={16} className="text-brand-500" /> {t.hero.trust[1]}
            </li>
            <li className="flex items-center gap-2">
              <BadgeCheck size={16} className="text-brand-500" /> {t.hero.trust[2]}
            </li>
          </ul>
        </div>
      </div>
    </section>
  );
}
