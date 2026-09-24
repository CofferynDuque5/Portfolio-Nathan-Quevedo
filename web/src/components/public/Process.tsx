import { MessageSquare, CreditCard, Download, HeadphonesIcon } from 'lucide-react';
import Reveal from '@/components/Reveal';
import { getT } from '@/i18n';

const ICONS = [MessageSquare, CreditCard, Download, HeadphonesIcon];

export default async function Process({ title }: { title: string }) {
  const t = (await getT()).process;
  const steps = t.steps.map((st, i) => ({ ...st, icon: ICONS[i] ?? MessageSquare }));
  return (
    <section id="proceso" className="py-20 sm:py-28">
      <div className="container-x">
        <div className="mx-auto max-w-2xl text-center">
          <span className="eyebrow">{t.eyebrow}</span>
          <h2 className="section-title mt-4">{title}</h2>
        </div>

        <div className="relative mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {steps.map((s, i) => (
            <Reveal key={s.title} delay={i * 0.08}>
              <div className="relative text-center">
                <div className="mx-auto grid h-16 w-16 place-items-center rounded-2xl bg-brand-600 text-white shadow-glow">
                  <s.icon size={26} />
                </div>
                <span className="mt-4 inline-block text-sm font-bold text-brand-500">{t.step(i + 1)}</span>
                <h3 className="mt-1 text-lg font-semibold">{s.title}</h3>
                <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">{s.desc}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
