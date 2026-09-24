import { Play } from 'lucide-react';
import { Platform } from '@/lib/types';
import { getT } from '@/i18n';

/**
 * Carrusel continuo de plataformas, solo con CSS (sin librería de carrusel).
 * Se detiene al pasar el ratón o al enfocar una tarjeta; con movimiento
 * reducido se convierte en una fila desplazable.
 */
export default async function Platforms({ platforms }: { platforms: Platform[] }) {
  if (!platforms.length) return null;
  const t = await getT();

  const card = (p: Platform, copy: boolean) => (
    <li key={`${p.id}-${copy ? 'b' : 'a'}`} aria-hidden={copy || undefined} className={copy ? 'marquee-copy' : undefined}>
      <div className="card flex h-40 w-56 flex-col items-center justify-center gap-3 text-center sm:w-64">
        {p.logo ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={p.logo} alt={copy ? '' : p.name} loading="lazy" decoding="async" className="h-12 w-auto object-contain" />
        ) : (
          <span className="grid h-12 w-12 place-items-center rounded-2xl bg-brand-500/10 text-brand-500">
            <Play size={22} />
          </span>
        )}
        <div>
          <div className="font-semibold">{p.name}</div>
          {p.price && <div className="text-sm text-brand-600 dark:text-brand-300">{p.price}</div>}
        </div>
      </div>
    </li>
  );

  return (
    <section id="plataformas" className="py-20 sm:py-28">
      <div className="container-x">
        <div className="mx-auto max-w-2xl text-center">
          <span className="eyebrow">{t.platforms.eyebrow}</span>
          <h2 className="section-title mt-4">{t.platforms.title}</h2>
          <p className="mt-4 text-slate-600 dark:text-slate-300">{t.platforms.lead}</p>
        </div>
      </div>

      <div className="marquee group relative mt-12 overflow-hidden py-2">
        <ul
          className="marquee-track flex w-max animate-marquee gap-4 px-2 group-hover:[animation-play-state:paused] group-focus-within:[animation-play-state:paused]"
          style={{ animationDuration: `${Math.max(platforms.length, 4) * 5}s` }}
        >
          {platforms.map((p) => card(p, false))}
          {platforms.map((p) => card(p, true))}
        </ul>
      </div>
    </section>
  );
}
