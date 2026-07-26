import { Logo } from '@/lib/types';

export default function LogosMarquee({ logos }: { logos: Logo[] }) {
  if (!logos.length) return null;
  const row = [...logos, ...logos]; // duplicado para el bucle continuo

  return (
    <section className="border-y border-slate-200/60 py-10 dark:border-white/10">
      <div className="container-x">
        <p className="mb-6 text-center text-sm font-medium uppercase tracking-wider text-slate-400">
          Trabajamos con las mejores marcas
        </p>
      </div>
      <div className="group relative overflow-hidden">
        <div className="flex w-max animate-marquee items-center gap-14 group-hover:[animation-play-state:paused]">
          {row.map((l, i) => (
            <div key={`${l.id}-${i}`} className="flex items-center gap-2 text-slate-400">
              {l.image && !l.image.includes('placeholder') ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={l.image} alt={l.name} className="h-8 w-auto object-contain opacity-70 grayscale transition hover:opacity-100 hover:grayscale-0" />
              ) : (
                <span className="text-xl font-bold text-slate-400/80">{l.name}</span>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
