import { Request, Response } from 'express';
import { prisma } from '../lib/prisma';
import { asyncHandler } from '../utils/asyncHandler';
import { AuthRequest } from '../middleware/auth';
import { HttpError } from '../middleware/error';

/** Solo los proyectos publicados son visibles en el sitio. */
const PUBLISHED = { status: 'PUBLISHED' as const };

/** Orden editorial: destacados primero, luego el orden manual y la fecha. */
export const PROJECT_ORDER = [
  { featured: 'desc' as const },
  { order: 'asc' as const },
  { publishedAt: 'desc' as const },
];

const categorySelect = { select: { id: true, name: true, slug: true, icon: true } };

/** Campos necesarios para las tarjetas del listado (sin el cuerpo del caso). */
export const projectCardSelect = {
  id: true,
  title: true,
  slug: true,
  client: true,
  year: true,
  summary: true,
  coverImage: true,
  tags: true,
  featured: true,
  publishedAt: true,
  updatedAt: true,
  category: categorySelect,
};

/** GET /api/public/projects — listado de proyectos publicados. */
export const listPublished = asyncHandler(async (_req: Request, res: Response) => {
  const data = await prisma.project.findMany({
    where: PUBLISHED,
    orderBy: PROJECT_ORDER,
    select: projectCardSelect,
  });
  res.json({ data });
});

/** GET /api/public/projects/:slug — caso de estudio publicado + anterior/siguiente. */
export const getPublishedBySlug = asyncHandler(async (req: Request, res: Response) => {
  const project = await prisma.project.findFirst({
    where: { ...PUBLISHED, slug: req.params.slug },
    include: { category: categorySelect },
  });
  if (!project) throw new HttpError(404, 'Proyecto no encontrado.');

  const siblings = await prisma.project.findMany({
    where: PUBLISHED,
    orderBy: PROJECT_ORDER,
    select: { slug: true, title: true },
  });
  const i = siblings.findIndex((p) => p.slug === project.slug);
  res.json({
    data: project,
    prev: i > 0 ? siblings[i - 1] : null,
    next: i >= 0 && i < siblings.length - 1 ? siblings[i + 1] : null,
  });
});

/**
 * PATCH /api/admin/projects/:id/publish — publica o despublica.
 * Body: { published: boolean }. Al publicar por primera vez se fija la fecha;
 * al despublicar se conserva para mantener la fecha original si se republica.
 */
export const setPublished = asyncHandler(async (req: AuthRequest, res: Response) => {
  const id = Number(req.params.id);
  const current = await prisma.project.findUnique({ where: { id } });
  if (!current) throw new HttpError(404, 'Registro no encontrado.');

  const published = req.body?.published === true;
  const data = await prisma.project.update({
    where: { id },
    data: published
      ? { status: 'PUBLISHED', publishedAt: current.publishedAt ?? new Date() }
      : { status: 'DRAFT' },
    include: { category: true },
  });
  res.json({ data });
});
