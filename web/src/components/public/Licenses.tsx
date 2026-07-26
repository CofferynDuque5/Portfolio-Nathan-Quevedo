import { KeyRound, Check } from 'lucide-react';
import Reveal from '@/components/Reveal';
import { License } from '@/lib/types';
import { waLink } from '@/lib/utils';

export default function Licenses({ licenses, whatsapp }: { licenses: License[]; whatsapp?: string }) {
  if (!licenses.length) return null;

  return (
    <section id="licencias" className="bg-slate-50 py-20 dark:bg-white/[0.02] sm:py-28">
      <div className="container-x">
        <div className="mx-auto max-w-2xl text-center">
          <span className="eyebrow">Licencias originales</span>
          <h2 className="section-title mt-4">Software con licencia auténtica</h2>
          <p className="mt-4 text-slate-600 dark:text-slate-300">
            Windows, Office, Adobe y mucho más, con garantía y activación verificada.
          </p>
        </div>

        <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {licenses.map((l, i) => (
            <Reveal key={l.id} delay={(i % 3) * 0.06}>
              <div className="card flex h-full flex-col">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <span className="grid h-11 w-11 place-items-center rounded-2xl bg-brand-500/10 text-brand-600 dark:text-brand-300">
                      <KeyRound size={20} />
                    </span>
                    <div>
                      <h3 className="font-semibold leading-tight">{l.name}</h3>
                      {l.type && <span className="text-xs text-slate-500">{l.type}</span>}
                    </div>
                  </div>
                  {l.price && <span className="text-sm font-bold text-brand-600 dark:text-brand-300">{l.price}</span>}
                </div>
                {l.description && (
                  <p className="mt-3 flex-1 text-sm text-slate-600 dark:text-slate-400">{l.description}</p>
                )}
                <div className="mt-4 flex items-center gap-2 text-sm text-slate-500">
                  <Check size={16} className="text-green-500" /> Original y garantizado
                </div>
                <a
                  href={waLink(whatsapp, `Hola, me interesa la licencia de ${l.name}`)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-ghost mt-4 w-full"
                >
                  Solicitar
                </a>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
