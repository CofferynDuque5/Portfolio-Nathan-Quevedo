import { prisma } from './prisma';

/**
 * Traducciones del contenido editable del panel.
 *
 * El español es el idioma base y vive en cada tabla. Los demás idiomas se
 * guardan campo a campo en `content_translations`; si un campo no está
 * traducido, el sitio muestra el texto en español.
 */

/** Idiomas del sitio además del español. */
export const TRANSLATION_LOCALES = ['en'] as const;
export type TranslationLocale = (typeof TRANSLATION_LOCALES)[number];

/** Campos traducibles por recurso (solo texto visible en el sitio). */
export const TRANSLATABLE: Record<string, readonly string[]> = {
  heroSlides: ['title', 'highlight', 'subtitle', 'ctaText'],
  categories: ['name', 'description'],
  services: ['title', 'shortDesc', 'description', 'price', 'ctaText'],
  projects: ['title', 'summary', 'challenge', 'solution', 'results', 'tags', 'seoTitle', 'seoDescription'],
  posts: ['title', 'excerpt', 'content', 'tags', 'seoTitle', 'seoDescription'],
  platforms: ['description', 'price'],
  licenses: ['type', 'description', 'price'],
  faqs: ['question', 'answer'],
  banners: ['title', 'subtitle'],
  contactInfo: ['label', 'value'],
  seo: ['title', 'description', 'keywords'],
  settings: ['value'],
};

/** Ajustes generales cuyo valor es texto para el visitante. */
export const TRANSLATABLE_SETTINGS = ['tagline', 'aboutTitle', 'aboutText', 'processTitle'] as const;

/** Idioma válido para traducir o null (español / desconocido). */
export function parseLocale(value: unknown): TranslationLocale | null {
  return typeof value === 'string' && (TRANSLATION_LOCALES as readonly string[]).includes(value)
    ? (value as TranslationLocale)
    : null;
}

/** Campos traducibles de un registro concreto (los ajustes dependen de su clave). */
export function translatableFields(resource: string, record?: { key?: string } | null): readonly string[] {
  if (resource === 'settings') {
    return record?.key && (TRANSLATABLE_SETTINGS as readonly string[]).includes(record.key) ? ['value'] : [];
  }
  return TRANSLATABLE[resource] ?? [];
}

type Row = { id: number; [k: string]: any };

/**
 * Sustituye en `records` los campos traducidos al idioma pedido.
 * `nested` aplica también las traducciones de una relación incluida
 * (ej: la categoría de un servicio).
 */
export async function translateRecords<T extends Row>(
  locale: TranslationLocale | null,
  resource: string,
  records: T[],
  nested: { key: string; resource: string }[] = []
): Promise<T[]> {
  if (!locale || !records.length) return records;

  const ids = new Map<string, Set<number>>();
  const want = (res: string, id: number) => {
    if (!ids.has(res)) ids.set(res, new Set());
    ids.get(res)!.add(id);
  };
  for (const r of records) {
    want(resource, r.id);
    for (const n of nested) if (r[n.key]?.id) want(n.resource, r[n.key].id);
  }

  const rows = await prisma.contentTranslation.findMany({
    where: {
      locale,
      OR: Array.from(ids, ([res, set]) => ({ resource: res, recordId: { in: Array.from(set) } })),
    },
  });
  const map = new Map<string, Record<string, string>>();
  for (const t of rows) {
    if (!t.value.trim()) continue;
    const k = `${t.resource}:${t.recordId}`;
    (map.get(k) ?? map.set(k, {}).get(k)!)[t.field] = t.value;
  }

  const overlay = (res: string, rec: any) => {
    const tr = map.get(`${res}:${rec.id}`);
    if (!tr) return rec;
    const allowed = translatableFields(res, rec);
    const out = { ...rec };
    for (const f of allowed) if (tr[f] !== undefined) out[f] = tr[f];
    return out;
  };

  return records.map((r) => {
    let out = overlay(resource, r);
    for (const n of nested) if (out[n.key]) out = { ...out, [n.key]: overlay(n.resource, out[n.key]) };
    return out;
  });
}

/** Igual que translateRecords, para un solo registro (o null). */
export async function translateRecord<T extends Row>(
  locale: TranslationLocale | null,
  resource: string,
  record: T | null,
  nested: { key: string; resource: string }[] = []
): Promise<T | null> {
  if (!record) return record;
  const [out] = await translateRecords(locale, resource, [record], nested);
  return out;
}

/** Borra las traducciones de un registro eliminado. */
export function deleteTranslations(resource: string, recordId: number) {
  return prisma.contentTranslation.deleteMany({ where: { resource, recordId } });
}
