import { Quote, Star } from 'lucide-react';
import { Testimonial } from '@/lib/types';
import Reveal from '@/components/Reveal';
import { cn } from '@/lib/utils';
import { initials } from '@/lib/initials';

/**
 * Testimonios de clientes, editables en el panel. Si no hay ninguno activo,
 * la sección no se muestra.
 */
export default function Testimonials({
  testimonials,
  eyebrow,
  title,
  ratingLabel,
  className = 'py-20 sm:py-28',
}: {
  testimonials: Testimonial[];
  eyebrow: string;
  title: string;
  /** Texto accesible de las estrellas: (4) => "4 de 5 estrellas". */
  ratingLabel: (n: number) => string;
  className?: string;
}) {
  if (!testimonials.length) return null;
  const single = testimonials.length === 1;

  return (
    <section id="testimonios" aria-labelledby="testimonios-title" className={className}>
      <div className="container-x">
        <div className="max-w-2xl">
          <span className="eyebrow">{eyebrow}</span>
          <h2 id="testimonios-title" className="section-title mt-4">{title}</h2>
        </div>

        <ul className={cn('mt-12 grid gap-6', single ? 'max-w-3xl' : 'md:grid-cols-2 lg:grid-cols-3')}>
          {testimonials.map((item, i) => (
            <li key={item.id}>
              <Reveal delay={(i % 3) * 0.08} className="h-full">
                <figure className="card flex h-full flex-col">
                  <Quote aria-hidden size={28} className="text-brand-500/40" />
                  {item.rating ? (
                    <p className="mt-4 flex gap-0.5 text-amber-500" role="img" aria-label={ratingLabel(item.rating)}>
                      {Array.from({ length: 5 }, (_, s) => (
                        <Star
                          key={s}
                          size={16}
                          aria-hidden
                          className={s < item.rating! ? 'fill-current' : 'text-slate-300 dark:text-white/20'}
                        />
                      ))}
                    </p>
                  ) : null}
                  <blockquote className="mt-4 flex-1 whitespace-pre-line text-lg leading-relaxed text-slate-700 dark:text-slate-200">
                    {item.quote}
                  </blockquote>
                  <figcaption className="mt-6 flex items-center gap-3 border-t border-slate-200 pt-5 dark:border-white/10">
                    {item.avatar ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={item.avatar} alt="" loading="lazy" decoding="async" className="h-11 w-11 rounded-full object-cover" />
                    ) : (
                      <span aria-hidden className="grid h-11 w-11 place-items-center rounded-full bg-brand-500/10 text-sm font-semibold text-brand-700 dark:text-brand-300">
                        {initials(item.name)}
                      </span>
                    )}
                    <span>
                      <span className="block font-semibold">{item.name}</span>
                      {item.role && <span className="block text-sm text-slate-500 dark:text-slate-400">{item.role}</span>}
                    </span>
                  </figcaption>
                </figure>
              </Reveal>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
