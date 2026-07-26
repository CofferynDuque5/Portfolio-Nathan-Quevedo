'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Inbox, ArrowRight } from 'lucide-react';
import { api } from '@/lib/admin/client';
import { RESOURCES } from '@/lib/admin/resources';
import { Icon } from '@/lib/icon';
import { useAuth } from '@/lib/admin/auth';

const CARDS = ['services', 'platforms', 'licenses', 'faqs', 'gallery', 'logos'];

export default function DashboardPage() {
  const { user } = useAuth();
  const [counts, setCounts] = useState<Record<string, number>>({});
  const [messages, setMessages] = useState(0);

  useEffect(() => {
    Promise.all(
      CARDS.map((k) =>
        api.list(k, { perPage: 1 }).then((r) => [k, r.meta.total] as [string, number]).catch(() => [k, 0] as [string, number])
      )
    ).then((entries) => setCounts(Object.fromEntries(entries)));
    api.list('messages', { perPage: 1 }).then((r) => setMessages(r.meta.total)).catch(() => undefined);
  }, []);

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold">Hola, {user?.name} 👋</h1>
        <p className="mt-1 text-slate-500">Bienvenido al panel de administración de tu portfolio.</p>
      </div>

      {/* Métricas */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {CARDS.map((k) => {
          const def = RESOURCES[k];
          return (
            <Link key={k} href={`/admin/${k}`} className="card group flex items-center gap-4">
              <span className="grid h-12 w-12 place-items-center rounded-2xl bg-brand-500/10 text-brand-600 dark:text-brand-300">
                <Icon name={def.icon} size={24} />
              </span>
              <div className="flex-1">
                <div className="text-2xl font-bold">{counts[k] ?? '—'}</div>
                <div className="text-sm text-slate-500">{def.label}</div>
              </div>
              <ArrowRight size={18} className="text-slate-300 transition group-hover:translate-x-1 group-hover:text-brand-500" />
            </Link>
          );
        })}
      </div>

      {/* Mensajes */}
      <div className="mt-6">
        <Link href="/admin/messages" className="card group flex items-center gap-4">
          <span className="grid h-12 w-12 place-items-center rounded-2xl bg-fuchsia-500/10 text-fuchsia-600">
            <Inbox size={24} />
          </span>
          <div className="flex-1">
            <div className="text-2xl font-bold">{messages}</div>
            <div className="text-sm text-slate-500">Mensajes de contacto recibidos</div>
          </div>
          <ArrowRight size={18} className="text-slate-300 transition group-hover:translate-x-1 group-hover:text-brand-500" />
        </Link>
      </div>

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
