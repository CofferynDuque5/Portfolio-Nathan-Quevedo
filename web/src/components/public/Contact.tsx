'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Send, CheckCircle2, Mail, Phone, Clock, MessageCircle } from 'lucide-react';
import { ContactInfo, SocialLink } from '@/lib/types';
import { Icon } from '@/lib/icon';
import { API_URL } from '@/lib/api';
import { waLink } from '@/lib/utils';
import { track } from '@/lib/analytics';
import { useI18n } from '@/i18n/client';

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

export default function Contact({
  info,
  whatsapp,
  social = [],
  asPage = false,
}: {
  info: ContactInfo[];
  whatsapp?: string;
  social?: SocialLink[];
  /** En /contacto el título es el h1 de la página. */
  asPage?: boolean;
}) {
  const Heading = asPage ? 'h1' : 'h2';
  const { t: dict, locale } = useI18n();
  const t = dict.contact;
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
        throw new Error((locale === 'es' && data.error) || t.sendError);
      }
      setSent(true);
      track('contact_submit');
      reset();
    } catch (e) {
      setError(e instanceof Error ? e.message : t.unexpectedError);
    }
  };

  return (
    <section id="contacto" className={asPage ? 'pb-20 pt-32 sm:pb-28 sm:pt-40' : 'py-20 sm:py-28'}>
      <div className="container-x grid gap-10 lg:grid-cols-2">
        {/* Info */}
        <div>
          <span className="eyebrow">{t.eyebrow}</span>
          <Heading className={asPage ? 'mt-6 text-4xl font-bold leading-[1.05] tracking-tight sm:text-6xl' : 'section-title mt-4'}>
            {t.title}
          </Heading>
          <p className="mt-4 text-slate-600 dark:text-slate-300">
            {t.lead}
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

          {(whatsapp || social.length > 0) && (
            <div className="mt-8 flex flex-wrap items-center gap-3">
              {whatsapp && (
                <a
                  href={waLink(whatsapp, dict.whatsapp.quote)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn bg-[#25D366] text-[#0b141a] hover:bg-[#1ebe5b]"
                >
                  <MessageCircle size={18} /> {t.whatsappButton}
                </a>
              )}
              {social.map((l) => (
                <a
                  key={l.id}
                  href={l.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={l.platform}
                  className="grid h-11 w-11 place-items-center rounded-full border border-slate-200 text-slate-600 transition hover:border-brand-500 hover:text-brand-600 dark:border-white/10 dark:text-slate-300"
                >
                  <Icon name={l.icon} size={18} />
                </a>
              ))}
            </div>
          )}
        </div>

        {/* Formulario */}
        <div className="card">
          {sent ? (
            <div
              className="flex animate-fade-up flex-col items-center justify-center py-14 text-center"
            >
              <CheckCircle2 className="mb-4 text-green-500" size={56} />
              <h3 className="text-xl font-semibold">{t.sentTitle}</h3>
              <p className="mt-2 text-slate-600 dark:text-slate-400">
                {t.sentText}
              </p>
              <button onClick={() => setSent(false)} className="btn-ghost mt-6">
                {t.sendAnother}
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label htmlFor="contact-name" className="label">{t.name} *</label>
                  <input id="contact-name" autoComplete="name" className="field" placeholder={t.namePlaceholder} {...register('name', { required: t.nameRequired, minLength: { value: 2, message: t.nameRequired } })} />
                  {formState.errors.name && <p className="mt-1 text-xs text-red-500">{formState.errors.name.message}</p>}
                </div>
                <div>
                  <label htmlFor="contact-email" className="label">{t.email} *</label>
                  <input
                    id="contact-email"
                    autoComplete="email"
                    className="field"
                    type="email"
                    placeholder={t.emailPlaceholder}
                    {...register('email', { required: t.emailRequired, pattern: { value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, message: t.emailInvalid } })}
                  />
                  {formState.errors.email && <p className="mt-1 text-xs text-red-500">{formState.errors.email.message}</p>}
                </div>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label htmlFor="contact-phone" className="label">{t.phone}</label>
                  <input id="contact-phone" type="tel" autoComplete="tel" className="field" placeholder={t.optional} {...register('phone')} />
                </div>
                <div>
                  <label htmlFor="contact-subject" className="label">{t.subject}</label>
                  <input id="contact-subject" className="field" placeholder={t.optional} {...register('subject')} />
                </div>
              </div>
              <div>
                <label htmlFor="contact-message" className="label">{t.message} *</label>
                <textarea
                  id="contact-message"
                  className="field min-h-[120px] resize-y"
                  placeholder={t.messagePlaceholder}
                  {...register('message', { required: t.messageRequired, minLength: { value: 5, message: t.messageShort } })}
                />
                {formState.errors.message && <p className="mt-1 text-xs text-red-500">{formState.errors.message.message}</p>}
              </div>

              {error && <p className="text-sm text-red-500">{error}</p>}

              <button type="submit" disabled={formState.isSubmitting} className="btn-primary w-full">
                {formState.isSubmitting ? t.sending : (<>{t.send} <Send size={16} /></>)}
              </button>
            </form>
          )}
        </div>
      </div>
    </section>
  );
}
