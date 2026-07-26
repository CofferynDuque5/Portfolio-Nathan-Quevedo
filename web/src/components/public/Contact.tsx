'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { motion } from 'framer-motion';
import { Send, CheckCircle2, Mail, Phone, Clock, MessageCircle } from 'lucide-react';
import { ContactInfo } from '@/lib/types';
import { Icon } from '@/lib/icon';
import { API_URL } from '@/lib/api';

interface FormValues {
  name: string;
  email: string;
  phone?: string;
  subject?: string;
  message: string;
}

const iconByType: Record<string, React.ComponentType<{ size?: number; className?: string }>> = {
  email: Mail,
  phone: Phone,
  whatsapp: MessageCircle,
  hours: Clock,
};

export default function Contact({ info }: { info: ContactInfo[] }) {
  const { register, handleSubmit, reset, formState } = useForm<FormValues>();
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const onSubmit = async (values: FormValues) => {
    setError(null);
    try {
      const res = await fetch(`${API_URL}/api/public/contact`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(values),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || 'No se pudo enviar el mensaje.');
      }
      setSent(true);
      reset();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Error inesperado.');
    }
  };

  return (
    <section id="contacto" className="py-20 sm:py-28">
      <div className="container-x grid gap-10 lg:grid-cols-2">
        {/* Info */}
        <div>
          <span className="eyebrow">Contacto</span>
          <h2 className="section-title mt-4">Hablemos de tu proyecto</h2>
          <p className="mt-4 text-slate-600 dark:text-slate-300">
            Cuéntanos qué necesitas y te responderemos lo antes posible. Estamos aquí para ayudarte.
          </p>

          <div className="mt-8 space-y-4">
            {info.map((c) => {
              const IconCmp = c.type ? iconByType[c.type] : null;
              return (
                <div key={c.id} className="flex items-center gap-4">
                  <span className="grid h-11 w-11 place-items-center rounded-2xl bg-brand-500/10 text-brand-600 dark:text-brand-300">
                    {IconCmp ? <IconCmp size={20} /> : <Icon name={c.icon ?? undefined} size={20} />}
                  </span>
                  <div>
                    <div className="text-sm text-slate-500">{c.label}</div>
                    <div className="font-medium">{c.value}</div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Formulario */}
        <div className="card">
          {sent ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="flex flex-col items-center justify-center py-14 text-center"
            >
              <CheckCircle2 className="mb-4 text-green-500" size={56} />
              <h3 className="text-xl font-semibold">¡Mensaje enviado!</h3>
              <p className="mt-2 text-slate-600 dark:text-slate-400">
                Gracias por escribirnos. Te contactaremos muy pronto.
              </p>
              <button onClick={() => setSent(false)} className="btn-ghost mt-6">
                Enviar otro mensaje
              </button>
            </motion.div>
          ) : (
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="label">Nombre *</label>
                  <input className="field" placeholder="Tu nombre" {...register('name', { required: true })} />
                  {formState.errors.name && <p className="mt-1 text-xs text-red-500">El nombre es requerido.</p>}
                </div>
                <div>
                  <label className="label">Correo *</label>
                  <input
                    className="field"
                    type="email"
                    placeholder="tu@correo.com"
                    {...register('email', { required: true })}
                  />
                  {formState.errors.email && <p className="mt-1 text-xs text-red-500">El correo es requerido.</p>}
                </div>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="label">Teléfono</label>
                  <input className="field" placeholder="Opcional" {...register('phone')} />
                </div>
                <div>
                  <label className="label">Asunto</label>
                  <input className="field" placeholder="Opcional" {...register('subject')} />
                </div>
              </div>
              <div>
                <label className="label">Mensaje *</label>
                <textarea
                  className="field min-h-[120px] resize-y"
                  placeholder="¿En qué podemos ayudarte?"
                  {...register('message', { required: true })}
                />
                {formState.errors.message && <p className="mt-1 text-xs text-red-500">El mensaje es requerido.</p>}
              </div>

              {error && <p className="text-sm text-red-500">{error}</p>}

              <button type="submit" disabled={formState.isSubmitting} className="btn-primary w-full">
                {formState.isSubmitting ? 'Enviando…' : (<>Enviar mensaje <Send size={16} /></>)}
              </button>
            </form>
          )}
        </div>
      </div>
    </section>
  );
}
