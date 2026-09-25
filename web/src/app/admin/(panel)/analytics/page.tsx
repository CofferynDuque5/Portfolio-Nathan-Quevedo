'use client';

import { useEffect, useState } from 'react';
import { Eye, MousePointerClick, Percent, Send, Users } from 'lucide-react';
import { api, AnalyticsRow, AnalyticsSummary } from '@/lib/admin/client';
import { CardSkeleton, Skeleton } from '@/components/admin/Skeleton';
import { cn } from '@/lib/utils';

const RANGES = [
  { days: 7, label: '7 días' },
  { days: 30, label: '30 días' },
  { days: 90, label: '90 días' },
];

const DEVICE_LABELS: Record<string, string> = { mobile: 'Móvil', tablet: 'Tableta', desktop: 'Escritorio' };

const nf = new Intl.NumberFormat('es-ES');
const pf = new Intl.NumberFormat('es-ES', { style: 'percent', maximumFractionDigits: 1 });

/** "2026-09-24" -> "24 sept" (fechas agrupadas en UTC por la API). */
function shortDate(iso: string) {
  return new Date(`${iso}T00:00:00Z`).toLocaleDateString('es-ES', { day: 'numeric', month: 'short', timeZone: 'UTC' });
}

/** Máximo "redondo" para el eje: 7 -> 10, 42 -> 50, 180 -> 200. */
function niceMax(n: number) {
  if (n <= 4) return 4;
  const pow = Math.pow(10, Math.floor(Math.log10(n)));
  const steps = [1, 2, 2.5, 5, 10];
  return (steps.find((s) => s * pow >= n) ?? 10) * pow;
}

export default function AnalyticsPage() {
  const [days, setDays] = useState(30);
  const [data, setData] = useState<AnalyticsSummary | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let alive = true;
    setData(null);
    setError(null);
    api
      .analytics(days)
      .then((d) => alive && setData(d))
      .catch((e) => alive && setError(e instanceof Error ? e.message : 'Error al cargar las métricas.'));
    return () => {
      alive = false;
    };
  }, [days]);

  const t = data?.totals;
  const kpis = [
    { label: 'Visitantes', value: t && nf.format(t.visitors), icon: Users },
    { label: 'Páginas vistas', value: t && nf.format(t.pageviews), icon: Eye },
    { label: 'Clics en WhatsApp', value: t && nf.format(t.whatsappClicks), icon: MousePointerClick },
    { label: 'Formularios enviados', value: t && nf.format(t.contactSubmits), icon: Send },
    { label: 'Visitas con conversión', value: t && pf.format(t.conversionRate), icon: Percent },
  ];

  return (
    <div>
      {/* Cabecera + filtro de periodo */}
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold">Métricas</h1>
          <p className="mt-1 max-w-xl text-sm text-slate-500">
            Solo se mide a quien acepta el aviso de privacidad, así que las cifras son menores que el
            tráfico real. Días en hora UTC.
          </p>
        </div>
        <div role="tablist" aria-label="Periodo" className="inline-flex self-start rounded-xl border border-slate-200 bg-white p-1 dark:border-white/10 dark:bg-white/[0.02]">
          {RANGES.map((r) => (
            <button
              key={r.days}
              role="tab"
              aria-selected={days === r.days}
              onClick={() => setDays(r.days)}
              className={cn(
                'rounded-lg px-4 py-1.5 text-sm font-medium transition',
                days === r.days ? 'bg-brand-600 text-white' : 'text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-white/10'
              )}
            >
              {r.label}
            </button>
          ))}
        </div>
      </div>

      {error && <div className="mb-6 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-600 dark:bg-red-500/10">{error}</div>}

      {/* Indicadores */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        {kpis.map((k) =>
          !data ? (
            <CardSkeleton key={k.label} />
          ) : (
            <div key={k.label} className="rounded-2xl border border-slate-200 bg-white p-5 dark:border-white/10 dark:bg-white/[0.02]">
              <div className="flex items-center gap-2 text-sm text-slate-500">
                <k.icon size={16} className="text-slate-400" /> {k.label}
              </div>
              <div className="mt-2 text-3xl font-bold tabular-nums">{k.value}</div>
            </div>
          )
        )}
      </div>

      {/* Evolución diaria */}
      <section className="mt-6 rounded-2xl border border-slate-200 bg-white p-5 sm:p-6 dark:border-white/10 dark:bg-white/[0.02]">
        <h2 className="font-semibold">Páginas vistas por día</h2>
        {!data ? <Skeleton className="mt-4 h-56 w-full" /> : <DailyChart series={data.series} />}
      </section>

      {/* Desgloses */}
      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <Breakdown
          title="Páginas más vistas"
          unit="vistas"
          rows={data?.pages}
          format={(l) => (l === '/' ? 'Inicio' : l ?? '')}
        />
        <Breakdown
          title="Fuentes de tráfico"
          unit="visitas"
          rows={data?.sources}
          format={(l) => l || 'Directo o desconocido'}
        />
        <Breakdown
          title="Dispositivos"
          unit="visitas"
          rows={data?.devices}
          format={(l) => DEVICE_LABELS[l ?? ''] ?? l ?? 'Otro'}
        />
        <Breakdown title="Navegadores" unit="visitas" rows={data?.browsers} format={(l) => l || 'Otro'} />
      </div>
    </div>
  );
}

/** Barras verticales por día con tooltip al pasar el ratón o enfocar con teclado. */
function DailyChart({ series }: { series: AnalyticsSummary['series'] }) {
  const [active, setActive] = useState<number | null>(null);
  const max = niceMax(Math.max(0, ...series.map((d) => d.pageviews)));
  const ticks = [max, max / 2, 0];
  const empty = series.every((d) => d.pageviews === 0);
  const hovered = active !== null ? series[active] : null;

  return (
    <div className="mt-4">
      <div className="relative flex h-56 gap-3">
        {/* Eje Y */}
        <div className="flex w-8 shrink-0 flex-col justify-between pb-6 text-right text-xs tabular-nums text-slate-400">
          {ticks.map((v) => <span key={v} className="-translate-y-1/2 first:translate-y-0 last:translate-y-0">{nf.format(v)}</span>)}
        </div>

        <div className="relative flex min-w-0 flex-1 flex-col">
          {/* Rejilla */}
          <div className="pointer-events-none absolute inset-x-0 top-0 bottom-6 flex flex-col justify-between">
            {ticks.map((v) => (
              <div key={v} className="border-t border-dashed border-slate-200 dark:border-white/10" />
            ))}
          </div>

          {/* Barras */}
          <div className="relative flex flex-1 items-end gap-[2px]" onMouseLeave={() => setActive(null)}>
            {series.map((d, i) => (
              <button
                key={d.date}
                type="button"
                aria-label={`${shortDate(d.date)}: ${d.pageviews} páginas vistas, ${d.visitors} visitantes`}
                onMouseEnter={() => setActive(i)}
                onFocus={() => setActive(i)}
                onBlur={() => setActive(null)}
                className="group flex h-full min-w-0 flex-1 items-end focus:outline-none"
              >
                <span
                  className={cn(
                    'block w-full rounded-t-[4px] transition-colors',
                    d.pageviews ? 'bg-brand-500 dark:bg-brand-400' : 'bg-transparent',
                    active !== null && active !== i && 'opacity-40',
                    'group-focus-visible:ring-2 group-focus-visible:ring-brand-300'
                  )}
                  style={{ height: `${(d.pageviews / max) * 100}%`, minHeight: d.pageviews ? 2 : 0 }}
                />
              </button>
            ))}
            {empty && (
              <p className="absolute inset-0 grid place-items-center text-sm text-slate-400">
                Aún no hay visitas registradas en este periodo.
              </p>
            )}
          </div>

          {/* Eje X */}
          <div className="flex h-6 items-end justify-between text-xs text-slate-400">
            <span>{shortDate(series[0].date)}</span>
            <span>{shortDate(series[Math.floor(series.length / 2)].date)}</span>
            <span>{shortDate(series[series.length - 1].date)}</span>
          </div>

          {/* Tooltip */}
          {hovered && active !== null && (
            <div
              className="pointer-events-none absolute top-0 z-10 -translate-x-1/2 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs shadow-lg dark:border-white/10 dark:bg-slate-900"
              style={{ left: `${Math.min(88, Math.max(12, ((active + 0.5) / series.length) * 100))}%` }}
            >
              <div className="font-semibold">{shortDate(hovered.date)}</div>
              <div className="mt-1 tabular-nums text-slate-600 dark:text-slate-300">
                {nf.format(hovered.pageviews)} páginas vistas
              </div>
              <div className="tabular-nums text-slate-600 dark:text-slate-300">{nf.format(hovered.visitors)} visitantes</div>
            </div>
          )}
        </div>
      </div>

      <details className="mt-4 text-sm">
        <summary className="cursor-pointer text-slate-500 hover:text-slate-900 dark:hover:text-white">Ver datos en tabla</summary>
        <div className="mt-3 max-h-64 overflow-auto rounded-xl border border-slate-200 dark:border-white/10">
          <table className="w-full text-left">
            <thead className="sticky top-0 bg-slate-50 dark:bg-slate-900">
              <tr>
                <th className="px-3 py-2 font-medium">Día</th>
                <th className="px-3 py-2 text-right font-medium">Páginas vistas</th>
                <th className="px-3 py-2 text-right font-medium">Visitantes</th>
              </tr>
            </thead>
            <tbody>
              {series.map((d) => (
                <tr key={d.date} className="border-t border-slate-100 dark:border-white/5">
                  <td className="px-3 py-1.5">{shortDate(d.date)}</td>
                  <td className="px-3 py-1.5 text-right tabular-nums">{nf.format(d.pageviews)}</td>
                  <td className="px-3 py-1.5 text-right tabular-nums">{nf.format(d.visitors)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </details>
    </div>
  );
}

/** Lista con barra proporcional (una sola tonalidad: la magnitud manda). */
function Breakdown({
  title,
  unit,
  rows,
  format,
}: {
  title: string;
  unit: string;
  rows?: AnalyticsRow[];
  format: (label: string | null) => string;
}) {
  const max = Math.max(1, ...(rows ?? []).map((r) => r.value));
  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-6 dark:border-white/10 dark:bg-white/[0.02]">
      <div className="flex items-baseline justify-between">
        <h2 className="font-semibold">{title}</h2>
        <span className="text-xs text-slate-400">{unit}</span>
      </div>
      {!rows ? (
        <div className="mt-4 space-y-3">
          {[0, 1, 2].map((i) => <Skeleton key={i} className="h-7 w-full" />)}
        </div>
      ) : rows.length === 0 ? (
        <p className="mt-4 text-sm text-slate-400">Sin datos en este periodo.</p>
      ) : (
        <ul className="mt-4 space-y-2">
          {rows.map((r) => (
            <li key={r.label ?? '∅'} className="relative flex items-center justify-between gap-4 rounded-lg px-3 py-1.5 text-sm">
              <span
                aria-hidden
                className="absolute inset-y-0 left-0 rounded-lg bg-brand-500/10 dark:bg-brand-400/15"
                style={{ width: `${(r.value / max) * 100}%` }}
              />
              <span className="relative truncate">{format(r.label)}</span>
              <span className="relative shrink-0 font-medium tabular-nums">{nf.format(r.value)}</span>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
