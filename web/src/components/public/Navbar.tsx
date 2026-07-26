'use client';

import { useEffect, useState } from 'react';
import { Menu, X } from 'lucide-react';
import ThemeToggle from '@/components/ThemeToggle';
import { cn } from '@/lib/utils';

const links = [
  { href: '#sobre', label: 'Sobre mí' },
  { href: '#servicios', label: 'Servicios' },
  { href: '#plataformas', label: 'Plataformas' },
  { href: '#licencias', label: 'Licencias' },
  { href: '#proceso', label: 'Proceso' },
  { href: '#faq', label: 'FAQ' },
];

export default function Navbar({ siteName }: { siteName: string }) {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

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
        <a href="#top" className="flex items-center gap-2 text-lg font-bold">
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
              className="rounded-full px-4 py-2 text-sm font-medium text-slate-600 transition hover:bg-slate-100 hover:text-slate-900 dark:text-slate-300 dark:hover:bg-white/10 dark:hover:text-white"
            >
              {l.label}
            </a>
          ))}
        </div>

        <div className="flex items-center gap-2">
          <ThemeToggle />
          <a href="#contacto" className="btn-primary hidden sm:inline-flex">
            Contactar
          </a>
          <button
            onClick={() => setOpen((v) => !v)}
            aria-label="Menú"
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
                onClick={() => setOpen(false)}
                className="rounded-xl px-4 py-3 text-sm font-medium text-slate-700 hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-white/10"
              >
                {l.label}
              </a>
            ))}
            <a href="#contacto" onClick={() => setOpen(false)} className="btn-primary mt-2">
              Contactar
            </a>
          </div>
        </div>
      )}
    </header>
  );
}
