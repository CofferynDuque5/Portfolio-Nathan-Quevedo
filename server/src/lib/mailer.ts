import nodemailer, { Transporter } from 'nodemailer';

/**
 * Avisos por correo de los mensajes del formulario de contacto.
 * Se configuran con variables de entorno (en cPanel, con una cuenta de
 * correo del propio dominio). Sin SMTP_HOST, los avisos quedan desactivados
 * y los mensajes siguen guardándose en el panel como siempre.
 */
export interface MailConfig {
  host: string;
  port: number;
  secure: boolean;
  user: string;
  pass: string;
  from: string;
  to: string;
}

export function mailConfig(env: NodeJS.ProcessEnv = process.env): MailConfig | null {
  const host = env.SMTP_HOST?.trim();
  const user = env.SMTP_USER?.trim() ?? '';
  const to = (env.NOTIFY_EMAIL?.trim() || user).trim();
  if (!host || !to) return null;
  const port = parseInt(env.SMTP_PORT ?? '465', 10) || 465;
  const secure = env.SMTP_SECURE ? env.SMTP_SECURE === 'true' : port === 465;
  return {
    host,
    port,
    secure,
    user,
    pass: env.SMTP_PASS ?? '',
    from: env.MAIL_FROM?.trim() || user || to,
    to,
  };
}

let cached: { key: string; transport: Transporter } | null = null;

function transporter(cfg: MailConfig): Transporter {
  const key = JSON.stringify(cfg);
  if (cached?.key !== key) {
    cached = {
      key,
      transport: nodemailer.createTransport({
        host: cfg.host,
        port: cfg.port,
        secure: cfg.secure,
        auth: cfg.user ? { user: cfg.user, pass: cfg.pass } : undefined,
        connectionTimeout: 10_000,
        greetingTimeout: 10_000,
        socketTimeout: 20_000,
      }),
    };
  }
  return cached.transport;
}

const escapeHtml = (s: string) =>
  s.replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]!);

/** Sin saltos de línea: evita inyectar cabeceras en el asunto. */
const oneLine = (s: string) => s.replace(/[\r\n]+/g, ' ').trim();

export interface ContactNotice {
  name: string;
  email: string;
  phone?: string | null;
  subject?: string | null;
  message: string;
}

/** Arma el correo de aviso (texto y HTML). Exportado para las pruebas. */
export function buildContactEmail(msg: ContactNotice, siteUrl: string) {
  const panel = `${siteUrl.replace(/\/+$/, '')}/admin/messages`;
  const subject = oneLine(`Nuevo mensaje de ${msg.name}${msg.subject ? `: ${msg.subject}` : ''}`).slice(0, 180);
  const rows: [string, string][] = [
    ['Nombre', msg.name],
    ['Correo', msg.email],
    ...(msg.phone ? [['Teléfono', msg.phone] as [string, string]] : []),
    ...(msg.subject ? [['Asunto', msg.subject] as [string, string]] : []),
  ];
  const text = [
    'Nuevo mensaje desde el formulario de contacto de tu web.',
    '',
    ...rows.map(([k, v]) => `${k}: ${v}`),
    '',
    msg.message,
    '',
    `Responde a este correo para contestar a ${msg.name}.`,
    `Todos los mensajes: ${panel}`,
  ].join('\n');
  const html = `<!doctype html><html><body style="margin:0;padding:24px;background:#f8fafc;font-family:Arial,Helvetica,sans-serif;color:#0f172a">
<div style="max-width:560px;margin:0 auto;background:#ffffff;border:1px solid #e2e8f0;border-radius:16px;padding:28px">
<p style="margin:0 0 4px;font-size:12px;letter-spacing:.08em;text-transform:uppercase;color:#4f46e5;font-weight:bold">Nuevo mensaje</p>
<h1 style="margin:0 0 20px;font-size:20px">${escapeHtml(msg.name)} te ha escrito desde la web</h1>
<table style="width:100%;border-collapse:collapse;font-size:14px">${rows
    .map(
      ([k, v]) =>
        `<tr><td style="padding:6px 12px 6px 0;color:#64748b;white-space:nowrap;vertical-align:top">${k}</td><td style="padding:6px 0">${escapeHtml(v)}</td></tr>`
    )
    .join('')}</table>
<div style="margin:20px 0;padding:16px;border-radius:12px;background:#f1f5f9;font-size:15px;line-height:1.6;white-space:pre-wrap">${escapeHtml(msg.message)}</div>
<p style="margin:0 0 20px;font-size:14px;color:#475569">Responde a este correo para contestar directamente a ${escapeHtml(msg.name)}.</p>
<a href="${escapeHtml(panel)}" style="display:inline-block;padding:10px 18px;border-radius:999px;background:#4f46e5;color:#ffffff;text-decoration:none;font-size:14px;font-weight:bold">Ver en el panel</a>
</div></body></html>`;
  return { subject, text, html };
}

function siteUrl() {
  return process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';
}

/**
 * Envía el aviso de un mensaje nuevo. Nunca lanza: un fallo del correo no
 * debe impedir que el mensaje se guarde (queda en el panel igualmente).
 */
export async function notifyContactMessage(msg: ContactNotice): Promise<boolean> {
  const cfg = mailConfig();
  if (!cfg) return false;
  try {
    const { subject, text, html } = buildContactEmail(msg, siteUrl());
    await transporter(cfg).sendMail({
      from: { name: 'Web · Nathan Quevedo', address: cfg.from },
      to: cfg.to,
      replyTo: { name: oneLine(msg.name), address: msg.email },
      subject,
      text,
      html,
    });
    return true;
  } catch (err: any) {
    console.error('[correo] No se pudo enviar el aviso del mensaje:', err?.message ?? err);
    return false;
  }
}

/** Correo de prueba desde el panel. Devuelve el error legible si falla. */
export async function sendTestEmail(): Promise<{ ok: true; to: string } | { ok: false; error: string }> {
  const cfg = mailConfig();
  if (!cfg) return { ok: false, error: 'Los avisos por correo no están configurados (falta SMTP_HOST).' };
  try {
    await transporter(cfg).sendMail({
      from: { name: 'Web · Nathan Quevedo', address: cfg.from },
      to: cfg.to,
      subject: 'Prueba de avisos por correo',
      text: 'Si lees esto, los avisos del formulario de contacto de tu web funcionan.',
    });
    return { ok: true, to: cfg.to };
  } catch (err: any) {
    return { ok: false, error: `El servidor de correo respondió: ${oneLine(String(err?.message ?? err)).slice(0, 200)}` };
  }
}

/** Estado para el panel (sin la contraseña). */
export function mailStatus() {
  const cfg = mailConfig();
  return cfg
    ? { enabled: true as const, to: cfg.to, host: cfg.host, port: cfg.port }
    : { enabled: false as const };
}
