'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Inbox, ArrowRight, Clock, TrendingUp, Mail } from 'lucide-react';
import { api } from '@/lib/admin/client';
import { RESOURCES } from '@/lib/admin/resources';
import { Icon } from '@/lib/icon';
import { useAuth } from '@/lib/admin/auth';
import { CardSkeleton, Skeleton } from '@/components/admin/Skeleton';

type Stats = Awaited<ReturnType<typeof api.stats>>;

const METRICS = [
  { key: 'services', label: 'Servicios', color: 'text-brand-600 bg-brand-500/10' },
  { key: 'platforms', label: 'Plataformas', color: 'text-fuchsia-600 bg-fuchsia-500/10' },
  { key: 'licenses', label: 'Licencias', color: 'text-emerald-600 bg-emerald-500/10' },
  { key: 'faqs', label: 'FAQ', color: 'text-amber-600 bg-amber-500/10' },
  { key: 'gallery', label: 'Galería', color: 'text-sky-600 bg-sky-500/10' },
  { key: 'media', label: 'Multimedia', color: 'text-violet-600 bg-violet-500/10' },
];

function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'hace un momento';
  if (mins < 60) return `hace ${mins} min`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `hace ${hours} h`;
  const days = Math.floor(hours / 24);
  return `hace ${days} d`;
}

export default function DashboardPage() {
  const { user } = useAuth();
  const [stats, setStats] = useState<Stats | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    api.stats().then(setStats).catch((e) => setError(e instanceof Error ? e.message : 'Error'));
  }, []);

  const counts = stats?.counts ?? {};
  const chartData = METRICS.map((m) => ({ label: m.label, value: counts[m.key] ?? 0 }));
  const maxVal = Math.max(1, ...chartData.map((d) => d.value));

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold">Hola, {user?.name} 👋</h1>
        <p className="mt-1 text-slate-500">Bienvenido al panel de administración de tu portfolio.</p>
      </div>

      {error && <div className="mb-6 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-600 dark:bg-red-500/10">{error}</div>}

      {/* Métricas */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {!stats
          ? METRICS.map((m) => <CardSkeleton key={m.key} />)
          : METRICS.map((m) => (
              <Link key={m.key} href={m.key === 'media' ? '/admin/media' : `/admin/${m.key}`} className="card group flex items-center gap-4">
                <span className={`grid h-12 w-12 place-items-center rounded-2xl ${m.color}`}>
                  <Icon name={RESOURCES[m.key]?.icon ?? 'Image'} size={24} />
                </span>
                <div className="flex-1">
                  <div className="text-2xl font-bold">{counts[m.key] ?? 0}</div>
                  <div className="text-sm text-slate-500">{m.label}</div>
                </div>
                <ArrowRight size={18} className="text-slate-300 transition group-hover:translate-x-1 group-hover:text-brand-500" />
              </Link>
            ))}
      </div>

      {/* Mensajes destacado */}
      <div className="mt-4">
        <Link href="/admin/messages" className="card group flex items-center gap-4">
          <span className="grid h-12 w-12 place-items-center rounded-2xl bg-brand-600 text-white">
            <Inbox size={24} />
          </span>
          <div className="flex-1">
            <div className="text-2xl font-bold">
              {counts.messages ?? 0}
              {(counts.unreadMessages ?? 0) > 0 && (
                <span className="ml-2 rounded-full bg-brand-500/15 px-2 py-0.5 text-xs font-semibold text-brand-600 dark:text-brand-300">
                  {counts.unreadMessages} sin leer
                </span>
              )}
            </div>
            <div className="text-sm text-slate-500">Mensajes de contacto</div>
          </div>
          <ArrowRight size={18} className="text-slate-300 transition group-hover:translate-x-1 group-hover:text-brand-500" />
        </Link>
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-5">
        {/* Gráfico de contenido */}
        <div className="card lg:col-span-3">
          <h2 className="mb-1 flex items-center gap-2 font-semibold"><TrendingUp size={18} className="text-brand-500" /> Contenido por módulo</h2>
          <p className="mb-5 text-sm text-slate-500">Distribución de registros publicados.</p>
          {!stats ? (
            <div className="space-y-3">{Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} className="h-8" />)}</div>
          ) : (
            <div className="space-y-3">
              {chartData.map((d) => (
                <div key={d.label} className="flex items-center gap-3">
                  <span className="w-24 shrink-0 text-sm text-slate-500">{d.label}</span>
                  <div className="h-3 flex-1 overflow-hidden rounded-full bg-slate-100 dark:bg-white/10">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-brand-500 to-fuchsia-500 transition-all duration-700"
                      style={{ width: `${(d.value / maxVal) * 100}%` }}
                    />
                  </div>
                  <span className="w-8 text-right text-sm font-semibold">{d.value}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Actividad reciente */}
        <div className="card lg:col-span-2">
          <h2 className="mb-1 flex items-center gap-2 font-semibold"><Clock size={18} className="text-brand-500" /> Actividad reciente</h2>
          <p className="mb-5 text-sm text-slate-500">Últimos cambios en el contenido.</p>
          {!stats ? (
            <div className="space-y-3">{Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-10" />)}</div>
          ) : stats.activity.length === 0 ? (
            <p className="py-6 text-center text-sm text-slate-400">Sin actividad todavía.</p>
          ) : (
            <ul className="space-y-3">
              {stats.activity.map((a, i) => (
                <li key={i} className="flex items-center gap-3">
                  <span className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-slate-100 text-brand-500 dark:bg-white/10">
                    <Icon name={RESOURCES[a.resource]?.icon ?? 'Circle'} size={15} />
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium">{a.name}</p>
                    <p className="text-xs text-slate-400">{a.type} · {timeAgo(a.at)}</p>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      {/* Últimos mensajes */}
      {stats && stats.recentMessages.length > 0 && (
        <div className="card mt-6">
          <h2 className="mb-4 flex items-center gap-2 font-semibold"><Mail size={18} className="text-brand-500" /> Últimos mensajes</h2>
          <ul className="divide-y divide-slate-100 dark:divide-white/5">
            {stats.recentMessages.map((m) => (
              <li key={m.id} className="flex items-center gap-3 py-3">
                {!m.read && <span className="h-2 w-2 shrink-0 rounded-full bg-brand-500" />}
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium">{m.name}</p>
                  <p className="truncate text-xs text-slate-400">{m.subject || m.message}</p>
                </div>
                <span className="shrink-0 text-xs text-slate-400">{timeAgo(m.createdAt)}</span>
              </li>
            ))}
          </ul>
          <Link href="/admin/messages" className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-brand-600 hover:gap-2 dark:text-brand-300">
            Ver todos <ArrowRight size={14} />
          </Link>
        </div>
      )}

      {/* Accesos rápidos */}
      <h2 className="mb-4 mt-10 text-lg font-semibold">Gestión rápida</h2>
      <div className="grid gap-3 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
        {Object.values(RESOURCES).map((r) => (
          <Link
            key={r.key}
            href={`/admin/${r.key}`}
            className="flex items-center gap-3 rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-medium transition hover:border-brand-500 hover:text-brand-600 dark:border-white/10 dark:bg-white/[0.02]"
          >
            <Icon name={r.icon} size={18} className="text-brand-500" /> {r.label}
          </Link>
        ))}
      </div>
    </div>
  );
}
