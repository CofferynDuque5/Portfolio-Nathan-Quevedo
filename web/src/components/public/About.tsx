import { ShieldCheck, Clock, Sparkles, Users } from 'lucide-react';
import Reveal from '@/components/Reveal';

const stats = [
  { icon: Users, value: '+500', label: 'Clientes satisfechos' },
  { icon: ShieldCheck, value: '100%', label: 'Software original' },
  { icon: Clock, value: '24/7', label: 'Soporte disponible' },
  { icon: Sparkles, value: '+50', label: 'Productos y licencias' },
];

export default function About({ title, text }: { title: string; text: string }) {
  return (
    <section id="sobre" className="py-20 sm:py-28">
      <div className="container-x grid items-center gap-12 lg:grid-cols-2">
        <Reveal>
          <span className="eyebrow">Sobre mí</span>
          <h2 className="section-title mt-4">{title}</h2>
          <p className="mt-5 text-lg leading-relaxed text-slate-600 dark:text-slate-300">{text}</p>
          <p className="mt-4 text-slate-600 dark:text-slate-400">
            Mi compromiso es ofrecerte tecnología de confianza, con procesos claros y atención
            cercana. Trabajo con transparencia para que contratar servicios digitales sea simple y
            seguro.
          </p>
        </Reveal>

        <Reveal delay={0.1}>
          <div className="grid grid-cols-2 gap-4">
            {stats.map((s) => (
              <div key={s.label} className="card text-center">
                <s.icon className="mx-auto mb-3 text-brand-500" size={28} />
                <div className="text-3xl font-bold">{s.value}</div>
                <div className="mt-1 text-sm text-slate-500 dark:text-slate-400">{s.label}</div>
              </div>
            ))}
          </div>
        </Reveal>
      </div>
    </section>
  );
}
