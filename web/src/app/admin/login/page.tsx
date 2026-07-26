'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { Lock, Mail, LogIn, ShieldCheck } from 'lucide-react';
import { useAuth } from '@/lib/admin/auth';

export default function LoginPage() {
  const { login, user, loading } = useAuth();
  const router = useRouter();
  const { register, handleSubmit } = useForm<{ email: string; password: string }>();
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!loading && user) router.replace('/admin');
  }, [user, loading, router]);

  const onSubmit = async (values: { email: string; password: string }) => {
    setError(null);
    setSubmitting(true);
    try {
      await login(values.email, values.password);
      router.replace('/admin');
    } catch (e) {
      setError(e instanceof Error ? e.message : 'No se pudo iniciar sesión.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="grid min-h-screen place-items-center bg-slate-50 p-4 dark:bg-[#09090f]">
      <div className="bg-grid absolute inset-0 -z-10 opacity-40" />
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <span className="mx-auto mb-4 grid h-14 w-14 place-items-center rounded-2xl bg-brand-600 text-white shadow-glow">
            <ShieldCheck size={28} />
          </span>
          <h1 className="text-2xl font-bold">Panel Administrativo</h1>
          <p className="mt-1 text-sm text-slate-500">Inicia sesión para gestionar el sitio</p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="card space-y-4">
          <div>
            <label className="label">Correo electrónico</label>
            <div className="relative">
              <Mail className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input type="email" className="field pl-10" placeholder="admin@nathanquevedo.com" {...register('email', { required: true })} />
            </div>
          </div>
          <div>
            <label className="label">Contraseña</label>
            <div className="relative">
              <Lock className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input type="password" className="field pl-10" placeholder="••••••••" {...register('password', { required: true })} />
            </div>
          </div>

          {error && <div className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-600 dark:bg-red-500/10">{error}</div>}

          <button type="submit" disabled={submitting} className="btn-primary w-full">
            {submitting ? 'Ingresando…' : (<>Iniciar sesión <LogIn size={16} /></>)}
          </button>
        </form>

        <p className="mt-6 text-center text-xs text-slate-400">
          Portfolio Nathan Quevedo · Acceso restringido
        </p>
      </div>
    </div>
  );
}
