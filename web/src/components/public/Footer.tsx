import { SocialLink } from '@/lib/types';
import { Icon } from '@/lib/icon';

export default function Footer({
  siteName,
  tagline,
  social,
}: {
  siteName: string;
  tagline?: string;
  social: SocialLink[];
}) {
  const year = 2026;

  return (
    <footer className="border-t border-slate-200/60 bg-slate-50 py-14 dark:border-white/10 dark:bg-white/[0.02]">
      <div className="container-x">
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-4">
          <div className="lg:col-span-2">
            <div className="flex items-center gap-2 text-lg font-bold">
              <span className="grid h-8 w-8 place-items-center rounded-xl bg-brand-600 text-sm text-white">
                {siteName.charAt(0)}
              </span>
              {siteName}
            </div>
            <p className="mt-3 max-w-sm text-sm text-slate-500 dark:text-slate-400">
              {tagline || 'Servicios y licencias digitales premium con soporte garantizado.'}
            </p>
            <div className="mt-5 flex gap-3">
              {social.map((s) => (
                <a
                  key={s.id}
                  href={s.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={s.platform}
                  className="grid h-10 w-10 place-items-center rounded-full border border-slate-200 text-slate-600 transition hover:border-brand-500 hover:text-brand-600 dark:border-white/10 dark:text-slate-300"
                >
                  <Icon name={s.icon} size={18} />
                </a>
              ))}
            </div>
          </div>

          <div>
            <h4 className="text-sm font-semibold">Enlaces</h4>
            <ul className="mt-4 space-y-2 text-sm text-slate-500 dark:text-slate-400">
              <li><a href="#servicios" className="hover:text-brand-600">Servicios</a></li>
              <li><a href="#licencias" className="hover:text-brand-600">Licencias</a></li>
              <li><a href="#proceso" className="hover:text-brand-600">Proceso</a></li>
              <li><a href="#faq" className="hover:text-brand-600">Preguntas frecuentes</a></li>
            </ul>
          </div>

          <div>
            <h4 className="text-sm font-semibold">Contacto</h4>
            <ul className="mt-4 space-y-2 text-sm text-slate-500 dark:text-slate-400">
              <li><a href="#contacto" className="hover:text-brand-600">Formulario de contacto</a></li>
              <li><a href="/admin" className="hover:text-brand-600">Panel administrativo</a></li>
            </ul>
          </div>
        </div>

        <div className="mt-12 flex flex-col items-center justify-between gap-4 border-t border-slate-200/60 pt-6 text-sm text-slate-400 dark:border-white/10 sm:flex-row">
          <p>© {year} {siteName}. Todos los derechos reservados.</p>
          <p>Hecho con Next.js · TailwindCSS · Prisma</p>
        </div>
      </div>
    </footer>
  );
}
