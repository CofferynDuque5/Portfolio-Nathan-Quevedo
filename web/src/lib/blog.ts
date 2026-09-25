/** Helpers de presentación para el blog. */
import { DEFAULT_LOCALE, LOCALE_META } from '@/i18n/config';
import { readingMinutes } from './markdown';
import type { Post, PostSummary } from './types';

/** Parámetro de URL para filtrar el listado por etiqueta. */
export const TAG_PARAM = 'etiqueta';

/** "2026-09-24T..." -> "24 de septiembre de 2026" */
export function formatDate(iso?: string | null, locale: string = LOCALE_META[DEFAULT_LOCALE].intl): string | null {
  if (!iso) return null;
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return null;
  return d.toLocaleDateString(locale, { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC' });
}

/** Minutos de lectura: los da la API pública; en la vista previa se calculan aquí. */
export function postMinutes(post: PostSummary | Post): number {
  return post.readingMinutes ?? readingMinutes('content' in post ? post.content : null);
}
