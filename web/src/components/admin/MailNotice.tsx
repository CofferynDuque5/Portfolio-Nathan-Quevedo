'use client';

import { useEffect, useState } from 'react';
import { BellOff, BellRing, Send } from 'lucide-react';
import { api } from '@/lib/admin/client';
import { useAuth } from '@/lib/admin/auth';
import { useToast } from '@/components/admin/Toast';

type Status = Awaited<ReturnType<typeof api.notifications.status>>;

/** Estado de los avisos por correo de mensajes nuevos, con correo de prueba. */
export default function MailNotice() {
  const toast = useToast();
  const { user } = useAuth();
  const [status, setStatus] = useState<Status | null>(null);
  const [sending, setSending] = useState(false);

  useEffect(() => {
    api.notifications.status().then(setStatus).catch(() => setStatus(null));
  }, []);

  if (!status) return null;

  const test = async () => {
    setSending(true);
    try {
      const res = await api.notifications.test();
      toast.success(`Correo de prueba enviado a ${res.to}.`);
    } catch (e: any) {
      toast.error(e?.message ?? 'No se pudo enviar el correo de prueba.');
    } finally {
      setSending(false);
    }
  };

  if (!status.enabled) {
    return (
      <div className="mb-6 flex items-start gap-3 rounded-2xl border border-amber-300/60 bg-amber-50 p-4 text-sm text-amber-900 dark:border-amber-400/20 dark:bg-amber-400/10 dark:text-amber-200">
        <BellOff size={18} className="mt-0.5 shrink-0" />
        <p>
          <strong>Los avisos por correo están desactivados.</strong> Los mensajes solo se ven aquí. Para recibir
          un correo con cada mensaje nuevo, añade los datos de una cuenta de correo de tu dominio
          (<code>SMTP_HOST</code>, <code>SMTP_USER</code>, <code>SMTP_PASS</code>) al archivo <code>.env</code> y
          reinicia la app. Los pasos están en DEPLOY-CPANEL.md.
        </p>
      </div>
    );
  }

  return (
    <div className="mb-6 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-slate-200 p-4 text-sm dark:border-white/10">
      <p className="flex items-center gap-2 text-slate-600 dark:text-slate-300">
        <BellRing size={18} className="shrink-0 text-green-600" />
        <span>
          Cada mensaje nuevo te llega a <strong className="text-slate-900 dark:text-white">{status.to}</strong>.
        </span>
      </p>
      {user?.role === 'ADMIN' && (
        <button onClick={test} disabled={sending} className="btn-ghost !py-2 text-sm">
          <Send size={15} /> {sending ? 'Enviando…' : 'Enviar correo de prueba'}
        </button>
      )}
    </div>
  );
}
