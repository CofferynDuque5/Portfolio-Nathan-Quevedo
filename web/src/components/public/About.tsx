import { ShieldCheck, Clock, Sparkles, Users } from 'lucide-react';
import Reveal from '@/components/Reveal';
import { getT } from '@/i18n';

/**
 * Cifras destacadas. El valor se edita en el panel (Configuración general,
 * claves stat*); si se deja vacío, esa cifra no se muestra.
 */
const STATS = [
  { key: 'statClients', icon: Users, fallback: '+2000' },
  { key: 'statOriginal', icon: ShieldCheck, fallback: '100%' },
  { key: 'statSupport', icon: Clock, fallback: '24/7' },
  { key: 'statProducts', icon: Sparkles, fallback: '+50' },
] as const;

export default function About({
  title,
  text,
  settings = {},
}: {
  title: string;
  text: string;
  settings?: Record<string, string>;
}) {
  const t = getT().about;
  const stats = STATS.map((st) => ({ ...st, label: t.stats[st.key], value: settings[st.key] ?? st.fallback })).filter((st) => st.value.trim());

  return (
    <section id="sobre" className="py-20 sm:py-28">
      <div className="container-x grid items-center gap-12 lg:grid-cols-2">
        <Reveal>
          <span className="eyebrow">{t.eyebrow}</span>
          <h2 className="section-title mt-4">{title}</h2>
          <p className="mt-5 text-lg leading-relaxed text-slate-600 dark:text-slate-300">{text}</p>
          <p className="mt-4 text-slate-600 dark:text-slate-400">
            {t.commitment}
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
