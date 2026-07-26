import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import { asyncHandler } from '../utils/asyncHandler';
import { prisma } from '../lib/prisma';

/**
 * GET /api/admin/stats
 * Métricas agregadas para el dashboard: totales por módulo, mensajes sin leer,
 * actividad reciente (últimos registros modificados) y últimos mensajes.
 */
export const getStats = asyncHandler(async (_req: AuthRequest, res: Response) => {
  const [
    services,
    platforms,
    licenses,
    faqs,
    gallery,
    logos,
    banners,
    media,
    messages,
    unreadMessages,
    recentMessages,
    recentServices,
    recentLicenses,
    recentPlatforms,
  ] = await Promise.all([
    prisma.service.count(),
    prisma.platform.count(),
    prisma.license.count(),
    prisma.faq.count(),
    prisma.galleryItem.count(),
    prisma.logo.count(),
    prisma.banner.count(),
    prisma.mediaFile.count(),
    prisma.contactMessage.count(),
    prisma.contactMessage.count({ where: { read: false } }),
    prisma.contactMessage.findMany({ take: 5, orderBy: { createdAt: 'desc' } }),
    prisma.service.findMany({ take: 5, orderBy: { updatedAt: 'desc' } }),
    prisma.license.findMany({ take: 5, orderBy: { updatedAt: 'desc' } }),
    prisma.platform.findMany({ take: 5, orderBy: { updatedAt: 'desc' } }),
  ]);

  // Actividad reciente combinada entre modelos, ordenada por fecha de cambio.
  const activity = [
    ...recentServices.map((s) => ({ type: 'Servicio', name: s.title, at: s.updatedAt, resource: 'services' })),
    ...recentLicenses.map((l) => ({ type: 'Licencia', name: l.name, at: l.updatedAt, resource: 'licenses' })),
    ...recentPlatforms.map((p) => ({ type: 'Plataforma', name: p.name, at: p.updatedAt, resource: 'platforms' })),
  ]
    .sort((a, b) => new Date(b.at).getTime() - new Date(a.at).getTime())
    .slice(0, 6);

  res.json({
    counts: { services, platforms, licenses, faqs, gallery, logos, banners, media, messages, unreadMessages },
    activity,
    recentMessages,
  });
});
