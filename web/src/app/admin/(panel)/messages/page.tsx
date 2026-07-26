'use client';

import { useCallback, useEffect, useState } from 'react';
import { Inbox, Mail, Phone, Trash2, Check } from 'lucide-react';
import { api } from '@/lib/admin/client';
import ConfirmDialog from '@/components/admin/ConfirmDialog';
import { useToast } from '@/components/admin/Toast';
import { Skeleton } from '@/components/admin/Skeleton';

interface Message {
  id: number;
  name: string;
  email: string;
  phone?: string | null;
  subject?: string | null;
  message: string;
  read: boolean;
  createdAt: string;
}

export default function MessagesPage() {
  const toast = useToast();
  const [rows, setRows] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [active, setActive] = useState<Message | null>(null);
  const [toDelete, setToDelete] = useState<Message | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.list<Message>('messages', { perPage: 100 });
      setRows(res.data);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const open = async (m: Message) => {
    setActive(m);
    if (!m.read) {
      await api.update('messages', m.id, { read: true }).catch(() => undefined);
      setRows((prev) => prev.map((x) => (x.id === m.id ? { ...x, read: true } : x)));
    }
  };

  return (
    <div>
      <div className="mb-6">
        <h1 className="flex items-center gap-2 text-2xl font-bold"><Inbox size={24} className="text-brand-500" /> Mensajes de contacto</h1>
        <p className="mt-1 text-sm text-slate-500">{rows.filter((r) => !r.read).length} sin leer · {rows.length} en total</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="space-y-2">
          {loading ? (
            <div className="space-y-2">{Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-20 rounded-2xl" />)}</div>
          ) : rows.length === 0 ? (
            <p className="py-10 text-center text-sm text-slate-500">No hay mensajes todavía.</p>
          ) : (
            rows.map((m) => (
              <button
                key={m.id}
                onClick={() => open(m)}
                className={`w-full rounded-2xl border p-4 text-left transition ${
                  active?.id === m.id ? 'border-brand-500 bg-brand-500/5' : 'border-slate-200 hover:border-brand-300 dark:border-white/10'
                }`}
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="flex items-center gap-2 font-medium">
                    {!m.read && <span className="h-2 w-2 rounded-full bg-brand-500" />}
                    {m.name}
                  </span>
                  <span className="text-xs text-slate-400">{new Date(m.createdAt).toLocaleDateString('es')}</span>
                </div>
                <p className="mt-1 truncate text-sm text-slate-500">{m.subject || m.message}</p>
              </button>
            ))
          )}
        </div>

        {/* Detalle */}
        <div className="lg:sticky lg:top-24 lg:self-start">
          {active ? (
            <div className="card">
              <div className="mb-4 flex items-start justify-between">
                <div>
                  <h2 className="text-lg font-semibold">{active.name}</h2>
                  <p className="text-sm text-slate-500">{new Date(active.createdAt).toLocaleString('es')}</p>
                </div>
                <button onClick={() => setToDelete(active)} className="grid h-9 w-9 place-items-center rounded-lg text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10">
                  <Trash2 size={16} />
                </button>
              </div>
              <div className="space-y-2 text-sm">
                <a href={`mailto:${active.email}`} className="flex items-center gap-2 text-brand-600"><Mail size={15} /> {active.email}</a>
                {active.phone && <p className="flex items-center gap-2 text-slate-600 dark:text-slate-400"><Phone size={15} /> {active.phone}</p>}
              </div>
              {active.subject && <p className="mt-4 font-medium">{active.subject}</p>}
              <p className="mt-2 whitespace-pre-wrap rounded-xl bg-slate-50 p-4 text-sm text-slate-700 dark:bg-white/5 dark:text-slate-300">{active.message}</p>
              <div className="mt-3 flex items-center gap-1.5 text-xs text-green-600"><Check size={14} /> Leído</div>
            </div>
          ) : (
            <div className="grid h-48 place-items-center rounded-2xl border border-dashed border-slate-300 text-sm text-slate-400 dark:border-white/15">
              Selecciona un mensaje para leerlo
            </div>
          )}
        </div>
      </div>

      <ConfirmDialog
        open={toDelete !== null}
        message="El mensaje se eliminará de forma permanente."
        onConfirm={async () => {
          if (toDelete) {
            await api.remove('messages', toDelete.id);
            setRows((prev) => prev.filter((x) => x.id !== toDelete.id));
            if (active?.id === toDelete.id) setActive(null);
            toast.success('Mensaje eliminado.');
            setToDelete(null);
          }
        }}
        onCancel={() => setToDelete(null)}
      />
    </div>
  );
}
