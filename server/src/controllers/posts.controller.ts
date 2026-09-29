import { Request, Response } from 'express';
import { prisma } from '../lib/prisma';
import { asyncHandler } from '../utils/asyncHandler';
import { AuthRequest } from '../middleware/auth';
import { HttpError } from '../middleware/error';
import { parseLocale, translateRecord, translateRecords } from '../lib/translations';
import { readingMinutes } from '../lib/posts';

const CATEGORY = [{ key: 'category', resource: 'categories' }];

/**
 * Solo los artículos publicados son visibles en el sitio. Un artículo con fecha
 * futura queda programado: no aparece hasta que llega esa fecha.
 */
const published = () => ({ status: 'PUBLISHED' as const, publishedAt: { lte: new Date() } });

/** Más recientes primero. */
export const POST_ORDER = [{ publishedAt: 'desc' as const }, { id: 'desc' as const }];

const categorySelect = { select: { id: true, name: true, slug: true, icon: true } };

/** Campos para el listado (sin el cuerpo del artículo). */
export const postCardSelect = {
  id: true,
  title: true,
  slug: true,
  excerpt: true,
  coverImage: true,
  tags: true,
  publishedAt: true,
  updatedAt: true,
  category: categorySelect,
};

/** GET /api/public/posts?lang=en — artículos publicados. */
export const listPublished = asyncHandler(async (req: Request, res: Response) => {
  const rows = await prisma.post.findMany({
    where: published(),
    orderBy: POST_ORDER,
    select: { ...postCardSelect, content: true },
  });
  const translated = await translateRecords(parseLocale(req.query.lang), 'posts', rows, CATEGORY);
  // El cuerpo solo se usa para el tiempo de lectura; no viaja en el listado.
  const data = translated.map(({ content, ...post }) => ({ ...post, readingMinutes: readingMinutes(content) }));
  res.json({ data });
});

const link = (p: { slug: string; title: string }) => ({ slug: p.slug, title: p.title });

/**
 * GET /api/public/posts/:slug?lang=en — artículo publicado + anterior/siguiente.
 * "Anterior" es el artículo más antiguo y "siguiente" el más reciente.
 */
export const getPublishedBySlug = asyncHandler(async (req: Request, res: Response) => {
  const post = await prisma.post.findFirst({
    where: { ...published(), slug: req.params.slug },
    include: { category: categorySelect },
  });
  if (!post) throw new HttpError(404, 'Artículo no encontrado.');

  const locale = parseLocale(req.query.lang);
  const siblings = await translateRecords(
    locale,
    'posts',
    await prisma.post.findMany({
      where: published(),
      orderBy: POST_ORDER,
      select: { id: true, slug: true, title: true },
    })
  );
  const i = siblings.findIndex((p) => p.slug === post.slug);
  const translated = await translateRecord(locale, 'posts', post, CATEGORY);
  res.json({
    data: { ...translated, readingMinutes: readingMinutes(translated?.content) },
    prev: i >= 0 && i < siblings.length - 1 ? link(siblings[i + 1]) : null,
    next: i > 0 ? link(siblings[i - 1]) : null,
  });
});

/**
 * PATCH /api/admin/posts/:id/publish — publica o despublica.
 * Body: { published: boolean }. Al publicar por primera vez se fija la fecha;
 * al despublicar se conserva para mantener la fecha original si se republica.
 */
export const setPublished = asyncHandler(async (req: AuthRequest, res: Response) => {
  const id = Number(req.params.id);
  const current = await prisma.post.findUnique({ where: { id } });
  if (!current) throw new HttpError(404, 'Registro no encontrado.');

  const publish = req.body?.published === true;
  const data = await prisma.post.update({
    where: { id },
    data: publish
      ? { status: 'PUBLISHED', publishedAt: current.publishedAt ?? new Date() }
      : { status: 'DRAFT' },
    include: { category: true },
  });
  res.json({ data });
});
