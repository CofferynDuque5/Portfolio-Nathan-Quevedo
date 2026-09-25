import { Request, Response } from 'express';
import { z } from 'zod';
import { prisma } from '../lib/prisma';
import { asyncHandler } from '../utils/asyncHandler';
import { AuthRequest } from '../middleware/auth';

/**
 * Métricas propias, respetuosas con la privacidad.
 * - El sitio solo envía eventos si el visitante acepta la medición.
 * - No se guarda la IP ni el user-agent completo: solo tipo de dispositivo
 *   y navegador, la ruta sin parámetros y el dominio de procedencia.
 * - Los identificadores son aleatorios y los genera el navegador.
 */

export const EVENT_TYPES = ['pageview', 'whatsapp_click', 'contact_submit'] as const;
const CONVERSIONS = ['whatsapp_click', 'contact_submit'] as const;

/** Conservación máxima de los eventos (13 meses). */
const RETENTION_DAYS = 395;

const BOT_RE = /bot|crawl|spider|slurp|preview|headless|lighthouse|facebookexternalhit|embedly|monitor/i;

const idSchema = z.string().regex(/^[A-Za-z0-9-]{8,64}$/);
const trackSchema = z.object({
  type: z.enum(EVENT_TYPES),
  path: z.string().startsWith('/').max(191),
  source: z.string().trim().toLowerCase().max(100).nullish(),
  visitorId: idSchema,
  sessionId: idSchema,
});

export function detectDevice(ua: string): 'mobile' | 'tablet' | 'desktop' {
  if (/ipad|tablet|playbook|silk|(android(?!.*mobile))/i.test(ua)) return 'tablet';
  if (/mobi|iphone|ipod|android|blackberry|opera mini|iemobile/i.test(ua)) return 'mobile';
  return 'desktop';
}

export function detectBrowser(ua: string): string | null {
  if (/edg\//i.test(ua)) return 'Edge';
  if (/opr\/|opera/i.test(ua)) return 'Opera';
  if (/samsungbrowser/i.test(ua)) return 'Samsung Internet';
  if (/firefox|fxios/i.test(ua)) return 'Firefox';
  if (/chrome|crios/i.test(ua)) return 'Chrome';
  if (/safari/i.test(ua)) return 'Safari';
  return null;
}

/**
 * POST /api/public/track — registra un evento.
 * Responde siempre 204 (también ante datos inválidos o bots) para no dar
 * pistas a quien intente abusar del endpoint ni romper la navegación.
 */
export const track = asyncHandler(async (req: Request, res: Response) => {
  const ua = String(req.headers['user-agent'] ?? '');
  const parsed = trackSchema.safeParse(req.body);
  if (!ua || BOT_RE.test(ua) || !parsed.success || parsed.data.path.startsWith('/admin')) {
    res.status(204).end();
    return;
  }
  const { type, path, source, visitorId, sessionId } = parsed.data;
  await prisma.analyticsEvent.create({
    data: {
      type,
      // Solo la ruta: sin query string ni fragmento.
      path: path.split(/[?#]/)[0] || '/',
      source: source || null,
      device: detectDevice(ua),
      browser: detectBrowser(ua),
      visitorId,
      sessionId,
    },
  });
  res.status(204).end();
});

const RANGES = [7, 30, 90] as const;

const num = (v: unknown) => Number(v ?? 0);

/**
 * GET /api/admin/analytics?days=7|30|90 — resumen para el panel de métricas.
 * Las fechas se agrupan por día en UTC.
 */
export const summary = asyncHandler(async (req: AuthRequest, res: Response) => {
  const requested = parseInt(String(req.query.days ?? '30'), 10);
  const days = (RANGES as readonly number[]).includes(requested) ? requested : 30;

  // Purga de datos antiguos (política de conservación).
  await prisma.analyticsEvent.deleteMany({
    where: { createdAt: { lt: new Date(Date.now() - RETENTION_DAYS * 86_400_000) } },
  });

  const today = new Date();
  today.setUTCHours(0, 0, 0, 0);
  const since = new Date(today.getTime() - (days - 1) * 86_400_000);

  const [totals, conversionRows, convertingSessions, daily, pages, sources, devices, browsers] =
    await Promise.all([
      prisma.$queryRaw<{ pageviews: bigint; visitors: bigint; sessions: bigint }[]>`
        SELECT COUNT(*) AS pageviews, COUNT(DISTINCT visitorId) AS visitors,
               COUNT(DISTINCT sessionId) AS sessions
        FROM analytics_events WHERE type = 'pageview' AND createdAt >= ${since}`,
      prisma.analyticsEvent.groupBy({
        by: ['type'],
        where: { type: { in: [...CONVERSIONS] }, createdAt: { gte: since } },
        _count: { _all: true },
      }),
      prisma.$queryRaw<{ n: bigint }[]>`
        SELECT COUNT(DISTINCT sessionId) AS n FROM analytics_events
        WHERE type IN ('whatsapp_click', 'contact_submit') AND createdAt >= ${since}`,
      prisma.$queryRaw<{ day: Date | string; pageviews: bigint; visitors: bigint }[]>`
        SELECT DATE(createdAt) AS day, COUNT(*) AS pageviews, COUNT(DISTINCT visitorId) AS visitors
        FROM analytics_events WHERE type = 'pageview' AND createdAt >= ${since}
        GROUP BY DATE(createdAt) ORDER BY day`,
      prisma.$queryRaw<{ label: string; value: bigint }[]>`
        SELECT path AS label, COUNT(*) AS value FROM analytics_events
        WHERE type = 'pageview' AND createdAt >= ${since}
        GROUP BY path ORDER BY value DESC LIMIT 10`,
      // Procedencia y dispositivo se cuentan por sesión (visita), no por página.
      prisma.$queryRaw<{ label: string | null; value: bigint }[]>`
        SELECT source AS label, COUNT(DISTINCT sessionId) AS value FROM analytics_events
        WHERE type = 'pageview' AND createdAt >= ${since}
        GROUP BY source ORDER BY value DESC LIMIT 10`,
      prisma.$queryRaw<{ label: string; value: bigint }[]>`
        SELECT device AS label, COUNT(DISTINCT sessionId) AS value FROM analytics_events
        WHERE type = 'pageview' AND createdAt >= ${since}
        GROUP BY device ORDER BY value DESC`,
      prisma.$queryRaw<{ label: string | null; value: bigint }[]>`
        SELECT browser AS label, COUNT(DISTINCT sessionId) AS value FROM analytics_events
        WHERE type = 'pageview' AND createdAt >= ${since}
        GROUP BY browser ORDER BY value DESC LIMIT 6`,
    ]);

  // Serie diaria completa (días sin visitas = 0).
  const byDay = new Map(
    daily.map((d) => [new Date(d.day).toISOString().slice(0, 10), d])
  );
  const series = Array.from({ length: days }, (_, i) => {
    const date = new Date(since.getTime() + i * 86_400_000).toISOString().slice(0, 10);
    const row = byDay.get(date);
    return { date, pageviews: num(row?.pageviews), visitors: num(row?.visitors) };
  });

  const t = totals[0];
  const sessions = num(t?.sessions);
  const conv = Object.fromEntries(conversionRows.map((r) => [r.type, r._count._all]));
  const list = (rows: { label: string | null; value: bigint }[]) =>
    rows.map((r) => ({ label: r.label, value: num(r.value) }));

  res.json({
    days,
    totals: {
      pageviews: num(t?.pageviews),
      visitors: num(t?.visitors),
      sessions,
      whatsappClicks: conv.whatsapp_click ?? 0,
      contactSubmits: conv.contact_submit ?? 0,
      conversionRate: sessions ? num(convertingSessions[0]?.n) / sessions : 0,
    },
    series,
    pages: list(pages),
    sources: list(sources),
    devices: list(devices),
    browsers: list(browsers),
  });
});
