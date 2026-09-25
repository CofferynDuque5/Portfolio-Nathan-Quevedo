import { HttpError } from '../middleware/error';
import { PROJECT_STATUSES, slugify } from './projects';

/**
 * Reglas de negocio de los artículos del blog.
 * Se aplican al crear y editar desde el panel (a través del CRUD genérico).
 */

export const POST_STATUSES = PROJECT_STATUSES;

const SLUG_RE = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

/** Campos de texto opcionales: una cadena vacía se guarda como NULL. */
const OPTIONAL_TEXT = ['excerpt', 'content', 'coverImage', 'tags', 'seoTitle', 'seoDescription'] as const;

/** Columnas VARCHAR(191): se valida la longitud para devolver un error claro. */
const SHORT_TEXT = ['title', 'slug', 'coverImage', 'tags', 'seoTitle'] as const;

/** MEDIUMTEXT admite 16 MB; se limita muy por debajo para un artículo. */
export const MAX_CONTENT_LENGTH = 200_000;

/**
 * Normaliza y valida el payload de un artículo antes de guardarlo.
 * - Genera el slug a partir del título si viene vacío.
 * - Convierte la fecha de publicación a Date y la fija al publicar sin fecha.
 */
export function preparePost(data: Record<string, any>): Record<string, any> {
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
      throw new HttpError(400, 'El slug solo admite minúsculas, números y guiones (ej: mi-articulo).');
    }
  }

  for (const key of SHORT_TEXT) {
    if (typeof out[key] === 'string' && out[key].length > 191) {
      throw new HttpError(400, `El campo ${key} admite como máximo 191 caracteres.`);
    }
  }
  if (typeof out.content === 'string' && out.content.length > MAX_CONTENT_LENGTH) {
    throw new HttpError(400, 'El artículo es demasiado largo.');
  }

  if (out.status !== undefined && !POST_STATUSES.includes(out.status)) {
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

/**
 * Minutos de lectura (≈ 200 palabras por minuto, mínimo 1). Cuenta palabras
 * del texto sin las marcas de formato ni las direcciones de enlaces e imágenes.
 */
export function readingMinutes(markdown?: string | null): number {
  const words = (markdown ?? '')
    .replace(/!\[[^\]]*\]\([^)]*\)/g, ' ')
    .replace(/\]\([^)]*\)/g, ' ')
    .replace(/[#*_`>[\]]+/g, ' ')
    .split(/\s+/)
    .filter((w) => /[\p{L}\p{N}]/u.test(w)).length;
  return Math.max(1, Math.round(words / 200));
}
