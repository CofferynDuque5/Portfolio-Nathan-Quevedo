import { MessageCircle } from 'lucide-react';
import { waLink } from '@/lib/utils';

/** Bloque de llamado a la acción para pedir cotización (WhatsApp o formulario). */
export default function QuoteCTA({
  title = '¿Hablamos de tu proyecto?',
  text = 'Cuéntame qué necesitas y te preparo una propuesta a medida.',
  whatsapp,
  message = 'Hola, me gustaría solicitar una cotización.',
  className = 'container-x mt-20 sm:mt-28',
}: {
  title?: string;
  text?: string;
  whatsapp?: string;
  message?: string;
  className?: string;
}) {
  return (
    <section className={className}>
      <div className="relative overflow-hidden rounded-3xl bg-slate-900 px-6 py-14 text-white sm:px-14 sm:py-20 dark:bg-white/[0.04]">
        <div className="bg-grid absolute inset-0 opacity-30" aria-hidden />
        <div className="relative max-w-2xl">
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">{title}</h2>
          <p className="mt-4 text-lg text-slate-300">{text}</p>
          <div className="mt-8 flex flex-wrap gap-3">
            <a href={waLink(whatsapp, message)} target="_blank" rel="noopener noreferrer" className="btn-primary">
              <MessageCircle size={16} /> Cotizar por WhatsApp
            </a>
            <a href="/contacto" className="btn border border-white/20 text-white hover:bg-white/10">
              Escribir un mensaje
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
