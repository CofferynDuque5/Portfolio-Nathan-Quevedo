/** Helpers de presentación para los proyectos / casos de estudio. */
import { DEFAULT_LOCALE, LOCALE_META } from '@/i18n/config';

/** "Streaming, Soporte , " -> ["Streaming", "Soporte"] */
export function parseTags(tags?: string | null): string[] {
  return (tags ?? '')
    .split(',')
    .map((t) => t.trim())
    .filter(Boolean);
}

/** Galería guardada como una URL por línea. */
export function parseGallery(gallery?: string | null): string[] {
  return (gallery ?? '')
    .split('\n')
    .map((u) => u.trim())
    .filter(Boolean);
}

/** "2026-09-24T..." -> "septiembre de 2026" */
export function formatMonthYear(iso?: string | null, locale: string = LOCALE_META[DEFAULT_LOCALE].intl): string | null {
  if (!iso) return null;
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return null;
  return d.toLocaleDateString(locale, { month: 'long', year: 'numeric', timeZone: 'UTC' });
}

/** Parámetro de URL para el filtro por categoría del listado. */
export const CATEGORY_PARAM = 'categoria';
