import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { Service } from '@/lib/types';
import ServiceCard from './ServiceCard';

/** Sección de servicios de la home (con enlace a la página completa). */
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
            <ServiceCard key={s.id} s={s} i={i} whatsapp={whatsapp} />
          ))}
        </div>

        <div className="mt-10 text-center">
          <Link href="/servicios" className="btn-ghost">
            Ver todos los servicios <ArrowRight size={16} />
          </Link>
        </div>
      </div>
    </section>
  );
}
