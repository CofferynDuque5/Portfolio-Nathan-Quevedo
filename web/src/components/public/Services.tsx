import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { Service } from '@/lib/types';
import ServiceCard from './ServiceCard';
import { getI18n } from '@/i18n';

/** Servicios que caben en la home: destacados primero, luego el orden del panel. */
export function pickHomeServices(services: Service[], limit = HOME_SERVICES): Service[] {
  return [...services.filter((s) => s.featured), ...services.filter((s) => !s.featured)].slice(0, limit);
}

/** Cuántos servicios se ven en la home (dos filas de tres); el resto, en /servicios. */
export const HOME_SERVICES = 6;

/** Sección de servicios de la home (con enlace a la página completa). */
export default async function Services({ services, whatsapp }: { services: Service[]; whatsapp?: string }) {
  if (!services.length) return null;
  const shown = pickHomeServices(services);
  const { t: dict, href } = await getI18n();
  const t = dict.services;

  return (
    <section id="servicios" className="py-20 sm:py-28">
      <div className="container-x">
        <div className="mx-auto max-w-2xl text-center">
          <span className="eyebrow">{t.eyebrow}</span>
          <h2 className="section-title mt-4">{t.title}</h2>
          <p className="mt-4 text-slate-600 dark:text-slate-300">
            {t.lead}
          </p>
        </div>

        <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {shown.map((s, i) => (
            <ServiceCard key={s.id} s={s} i={i} whatsapp={whatsapp} />
          ))}
        </div>

        <div className="mt-10 text-center">
          <Link href={href('/servicios')} className="btn-ghost">
            {t.seeAll} <ArrowRight size={16} />
          </Link>
        </div>
      </div>
    </section>
  );
}
