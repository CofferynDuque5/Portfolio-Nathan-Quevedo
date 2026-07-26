import { Request, Response } from 'express';
import { z } from 'zod';
import { prisma } from '../lib/prisma';
import { asyncHandler } from '../utils/asyncHandler';
import { getResource } from '../lib/resources';
import { HttpError } from '../middleware/error';

/**
 * GET /api/public/content
 * Devuelve TODO el contenido activo del sitio en una sola llamada,
 * optimizado para el renderizado de la home (menos round-trips = mejor SEO/perf).
 */
export const getSiteContent = asyncHandler(async (_req: Request, res: Response) => {
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
  ] = await Promise.all([
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
    settings,
  });
});

/** GET /api/public/:resource — listado público de un recurso activo. */
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
  res.json({ data });
});

/** GET /api/public/seo/:page — metadatos SEO de una página. */
export const getSeo = asyncHandler(async (req: Request, res: Response) => {
  const seo = await prisma.seo.findUnique({ where: { page: req.params.page } });
  res.json({ data: seo });
});

const contactSchema = z.object({
  name: z.string().min(2, 'El nombre es requerido.'),
  email: z.string().email('Correo inválido.'),
  phone: z.string().optional(),
  subject: z.string().optional(),
  message: z.string().min(5, 'El mensaje es demasiado corto.'),
});

/** POST /api/public/contact — recibe el formulario de contacto. */
export const submitContact = asyncHandler(async (req: Request, res: Response) => {
  const parsed = contactSchema.safeParse(req.body);
  if (!parsed.success) {
    throw new HttpError(400, parsed.error.errors[0]?.message ?? 'Datos inválidos.');
  }
  const message = await prisma.contactMessage.create({ data: parsed.data });
  res.status(201).json({ success: true, id: message.id });
});
