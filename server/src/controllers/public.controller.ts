import { Request, Response } from 'express';
import { z } from 'zod';
import { prisma } from '../lib/prisma';
import { asyncHandler } from '../utils/asyncHandler';
import { getResource } from '../lib/resources';
import { HttpError } from '../middleware/error';
import { PROJECT_ORDER, projectCardSelect } from './projects.controller';
import { parseLocale, translateRecord, translateRecords } from '../lib/translations';
import { notifyContactMessage } from '../lib/mailer';

const CATEGORY = [{ key: 'category', resource: 'categories' }];

/**
 * GET /api/public/content?lang=en
 * Devuelve TODO el contenido activo del sitio en una sola llamada,
 * optimizado para el renderizado de la home (menos round-trips = mejor SEO/perf).
 * Con `lang` se aplican las traducciones disponibles (el resto, en español).
 */
export const getSiteContent = asyncHandler(async (req: Request, res: Response) => {
  const locale = parseLocale(req.query.lang);
  const raw = await Promise.all([
    prisma.heroSlide.findMany({ where: { active: true }, orderBy: { order: 'asc' } }),
    prisma.category.findMany({ where: { active: true }, orderBy: { order: 'asc' } }),
    prisma.service.findMany({
      where: { active: true },
      orderBy: { order: 'asc' },
      include: { category: true },
    }),
    prisma.platform.findMany({ where: { active: true }, orderBy: { order: 'asc' } }),
    prisma.license.findMany({ where: { active: true }, orderBy: { order: 'asc' } }),
    prisma.faq.findMany({ where: { active: true }, orderBy: { order: 'asc' } }),
    prisma.galleryItem.findMany({ where: { active: true }, orderBy: { order: 'asc' } }),
    prisma.banner.findMany({ where: { active: true }, orderBy: { order: 'asc' } }),
    prisma.logo.findMany({ where: { active: true }, orderBy: { order: 'asc' } }),
    prisma.socialLink.findMany({ where: { active: true }, orderBy: { order: 'asc' } }),
    prisma.contactInfo.findMany({ where: { active: true }, orderBy: { order: 'asc' } }),
    prisma.setting.findMany(),
    // Selección de proyectos publicados para la home (destacados primero).
    prisma.project.findMany({
      where: { status: 'PUBLISHED' },
      orderBy: PROJECT_ORDER,
      select: projectCardSelect,
      take: 6,
    }),
    prisma.testimonial.findMany({ where: { active: true }, orderBy: { order: 'asc' } }),
  ]);

  const tr = <T extends { id: number }>(resource: string, rows: T[], nested = false) =>
    translateRecords(locale, resource, rows, nested ? CATEGORY : []);
  const [
    heroSlides,
    categories,
    services,
    platforms,
    licenses,
    faqs,
    gallery,
    banners,
    logos,
    socialLinks,
    contactInfo,
    settingsRows,
    projects,
    testimonials,
  ] = await Promise.all([
    tr('heroSlides', raw[0]),
    tr('categories', raw[1]),
    tr('services', raw[2], true),
    tr('platforms', raw[3]),
    tr('licenses', raw[4]),
    tr('faqs', raw[5]),
    raw[6],
    tr('banners', raw[7]),
    raw[8],
    raw[9],
    tr('contactInfo', raw[10]),
    tr('settings', raw[11]),
    tr('projects', raw[12], true),
    tr('testimonials', raw[13]),
  ]);

  const settings: Record<string, string> = {};
  for (const row of settingsRows) settings[row.key] = row.value;

  res.json({
    heroSlides,
    categories,
    services,
    platforms,
    licenses,
    faqs,
    gallery,
    banners,
    logos,
    socialLinks,
    contactInfo,
    projects,
    testimonials,
    settings,
  });
});

/** GET /api/public/:resource?lang=en — listado público de un recurso activo. */
export const getPublicResource = asyncHandler(async (req: Request, res: Response) => {
  const config = getResource(req.params.resource);
  if (!config || !config.public) {
    throw new HttpError(404, 'Recurso no disponible.');
  }
  const data = await config.model.findMany({
    where: { active: true },
    orderBy: config.defaultOrderBy,
    include: config.include,
  });
  const nested = config.include?.category ? CATEGORY : [];
  res.json({ data: await translateRecords(parseLocale(req.query.lang), req.params.resource, data, nested) });
});

/** GET /api/public/seo/:page?lang=en — metadatos SEO de una página. */
export const getSeo = asyncHandler(async (req: Request, res: Response) => {
  const seo = await prisma.seo.findUnique({ where: { page: req.params.page } });
  res.json({ data: await translateRecord(parseLocale(req.query.lang), 'seo', seo) });
});

const contactSchema = z.object({
  name: z.string().trim().min(2, 'El nombre es requerido.').max(191, 'El nombre es demasiado largo.'),
  email: z.string().trim().email('Correo inválido.').max(191, 'El correo es demasiado largo.'),
  phone: z.string().trim().max(50, 'El teléfono es demasiado largo.').optional(),
  subject: z.string().trim().max(191, 'El asunto es demasiado largo.').optional(),
  message: z.string().trim().min(5, 'El mensaje es demasiado corto.').max(5000, 'El mensaje es demasiado largo (máximo 5000 caracteres).'),
});

/** POST /api/public/contact — recibe el formulario de contacto. */
export const submitContact = asyncHandler(async (req: Request, res: Response) => {
  const parsed = contactSchema.safeParse(req.body);
  if (!parsed.success) {
    throw new HttpError(400, parsed.error.errors[0]?.message ?? 'Datos inválidos.');
  }
  const message = await prisma.contactMessage.create({ data: parsed.data });
  // El aviso por correo va en segundo plano: el visitante no espera al SMTP.
  void notifyContactMessage(parsed.data);
  res.status(201).json({ success: true, id: message.id });
});
