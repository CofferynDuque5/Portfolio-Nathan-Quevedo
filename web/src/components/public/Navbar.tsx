'use client';

import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import { Menu, X } from 'lucide-react';
import ThemeToggle from '@/components/ThemeToggle';
import { cn } from '@/lib/utils';
import { useI18n } from '@/i18n/client';
import { LOCALES, LOCALE_META, switchLocalePath } from '@/i18n/config';

export default function Navbar({ siteName }: { siteName: string }) {
  const { t, locale, href } = useI18n();
  const links = [
    { href: href('/servicios'), label: t.nav.services },
    { href: href('/servicios#plataformas'), label: t.nav.streaming },
    { href: href('/proyectos'), label: t.nav.projects },
    { href: href('/sobre-mi'), label: t.nav.about },
    { href: href('/contacto#faq'), label: t.nav.faq },
  ];
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  // Enlace de la página actual (los que llevan #ancla no se marcan).
  const isCurrent = (href: string) =>
    !href.includes('#') && (pathname === href || pathname?.startsWith(`${href}/`));

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <header
      className={cn(
        'fixed inset-x-0 top-0 z-50 transition-all',
        scrolled ? 'glass border-b border-slate-200/60 dark:border-white/10' : 'bg-transparent'
      )}
    >
      <nav className="container-x flex h-16 items-center justify-between">
        <a href={href('/')} className="flex items-center gap-2 text-lg font-bold">
          <span className="grid h-8 w-8 place-items-center rounded-xl bg-brand-600 text-sm text-white">
            {siteName.charAt(0)}
          </span>
          {siteName}
        </a>

        <div className="hidden items-center gap-1 lg:flex">
          {links.map((l) => (
            <a
              key={l.href}
              href={l.href}
              aria-current={isCurrent(l.href) ? 'page' : undefined}
              className="rounded-full px-4 py-2 text-sm font-medium text-slate-600 transition hover:bg-slate-100 hover:text-slate-900 aria-[current=page]:text-slate-900 aria-[current=page]:bg-slate-100 dark:text-slate-300 dark:hover:bg-white/10 dark:hover:text-white dark:aria-[current=page]:bg-white/10 dark:aria-[current=page]:text-white"
            >
              {l.label}
            </a>
          ))}
        </div>

        <div className="flex items-center gap-2">
          {/* Selector de idioma: la misma página en el otro idioma. */}
          <nav aria-label={t.nav.language} className="flex items-center">
            {LOCALES.filter((l) => l !== locale).map((l) => (
              <a
                key={l}
                href={switchLocalePath(pathname || '/', l)}
                hrefLang={l}
                lang={l}
                title={LOCALE_META[l].name}
                aria-label={LOCALE_META[l].name}
                className="grid h-10 min-w-10 place-items-center rounded-full border border-slate-200 px-3 text-xs font-semibold tracking-wide text-slate-600 transition hover:border-slate-400 hover:text-slate-900 dark:border-white/10 dark:text-slate-300 dark:hover:border-white/30 dark:hover:text-white"
              >
                {LOCALE_META[l].short}
              </a>
            ))}
          </nav>
          <ThemeToggle />
          <a href={href('/contacto')} className="btn-primary hidden sm:inline-flex">
            {t.nav.contact}
          </a>
          <button
            onClick={() => setOpen((v) => !v)}
            aria-label={t.nav.menu}
            className="grid h-10 w-10 place-items-center rounded-full border border-slate-200 lg:hidden dark:border-white/10"
          >
            {open ? <X size={18} /> : <Menu size={18} />}
          </button>
        </div>
      </nav>

      {open && (
        <div className="glass border-t border-slate-200/60 lg:hidden dark:border-white/10">
          <div className="container-x flex flex-col py-3">
            {links.map((l) => (
              <a
                key={l.href}
                href={l.href}
                aria-current={isCurrent(l.href) ? 'page' : undefined}
                onClick={() => setOpen(false)}
                className="rounded-xl px-4 py-3 text-sm font-medium text-slate-700 hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-white/10"
              >
                {l.label}
              </a>
            ))}
            <a href={href('/contacto')} onClick={() => setOpen(false)} className="btn-primary mt-2">
              {t.nav.contact}
            </a>
          </div>
        </div>
      )}
    </header>
  );
}
