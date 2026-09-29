import { HttpError } from '../middleware/error';

/** Longitud máxima de una reseña: lo justo para leerse en una tarjeta. */
export const MAX_QUOTE_LENGTH = 1000;

/**
 * Normaliza y valida un testimonio antes de guardarlo (CRUD genérico).
 * Las estrellas son opcionales: vacío = sin valoración.
 */
export function prepareTestimonial(data: Record<string, any>): Record<string, any> {
  const out = { ...data };
  for (const key of ['name', 'role', 'quote', 'avatar']) {
    if (typeof out[key] === 'string') out[key] = out[key].trim();
  }
  for (const key of ['role', 'avatar']) {
    if (out[key] === '') out[key] = null;
  }

  if (out.name !== undefined && !out.name) throw new HttpError(400, 'El nombre es requerido.');
  if (out.quote !== undefined && !out.quote) throw new HttpError(400, 'El testimonio es requerido.');
  for (const key of ['name', 'role', 'avatar']) {
    if (typeof out[key] === 'string' && out[key].length > 191) {
      throw new HttpError(400, `El campo ${key} admite como máximo 191 caracteres.`);
    }
  }
  if (typeof out.quote === 'string' && out.quote.length > MAX_QUOTE_LENGTH) {
    throw new HttpError(400, `El testimonio admite como máximo ${MAX_QUOTE_LENGTH} caracteres.`);
  }

  if (out.rating === '' || out.rating === null || Number.isNaN(out.rating)) {
    out.rating = null;
  } else if (out.rating !== undefined) {
    const n = Number(out.rating);
    if (!Number.isInteger(n) || n < 1 || n > 5) throw new HttpError(400, 'La valoración va de 1 a 5 estrellas.');
    out.rating = n;
  }
  return out;
}
