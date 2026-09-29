import { z } from 'zod';
import { HttpError } from '../middleware/error';

/**
 * Reglas de negocio de los proyectos / casos de estudio.
 * Se aplican al crear y editar desde el panel (a través del CRUD genérico).
 */

export const PROJECT_STATUSES = ['DRAFT', 'PUBLISHED'] as const;

const SLUG_RE = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

/** "Caso de Éxito: Streaming 4K" -> "caso-de-exito-streaming-4k" */
export function slugify(text: string): string {
  return text
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 191);
}

/** Campos de texto opcionales: una cadena vacía se guarda como NULL. */
const OPTIONAL_TEXT = [
  'client', 'year', 'summary', 'challenge', 'solution', 'results', 'coverImage',
  'gallery', 'tags', 'url', 'seoTitle', 'seoDescription',
] as const;

/** Columnas VARCHAR(191): se valida la longitud para devolver un error claro. */
const SHORT_TEXT = ['title', 'slug', 'client', 'year', 'coverImage', 'tags', 'url', 'seoTitle'] as const;

const urlSchema = z.string().url().refine((u) => /^https?:\/\//i.test(u));

/**
 * Normaliza y valida el payload de un proyecto antes de guardarlo.
 * - Genera el slug a partir del título si viene vacío.
 * - Convierte la fecha de publicación a Date y la fija al publicar sin fecha.
 */
export function prepareProject(data: Record<string, any>): Record<string, any> {
  const out = { ...data };

  for (const key of [...OPTIONAL_TEXT, 'title', 'slug']) {
    if (typeof out[key] === 'string') out[key] = out[key].trim();
  }
  for (const key of OPTIONAL_TEXT) {
    if (out[key] === '') out[key] = null;
  }

  if (out.title !== undefined && !out.title) {
    throw new HttpError(400, 'El título es requerido.');
  }

  if (out.slug !== undefined || out.title !== undefined) {
    if (!out.slug && out.title) out.slug = slugify(out.title);
    if (!out.slug || !SLUG_RE.test(out.slug)) {
      throw new HttpError(400, 'El slug solo admite minúsculas, números y guiones (ej: mi-proyecto).');
    }
  }

  for (const key of SHORT_TEXT) {
    if (typeof out[key] === 'string' && out[key].length > 191) {
      throw new HttpError(400, `El campo ${key} admite como máximo 191 caracteres.`);
    }
  }

  if (out.url && !urlSchema.safeParse(out.url).success) {
    throw new HttpError(400, 'La URL del proyecto debe empezar por http:// o https://');
  }

  if (out.status !== undefined && !PROJECT_STATUSES.includes(out.status)) {
    throw new HttpError(400, 'Estado de publicación inválido.');
  }

  if (out.publishedAt === '' || out.publishedAt === null) {
    out.publishedAt = null;
  } else if (out.publishedAt !== undefined) {
    const date = new Date(out.publishedAt);
    if (Number.isNaN(date.getTime())) throw new HttpError(400, 'Fecha de publicación inválida.');
    out.publishedAt = date;
  }
  if (out.status === 'PUBLISHED' && !out.publishedAt) {
    out.publishedAt = new Date();
  }

  return out;
}
