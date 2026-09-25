import { Response } from 'express';
import { z } from 'zod';
import { prisma } from '../lib/prisma';
import { asyncHandler } from '../utils/asyncHandler';
import { AuthRequest } from '../middleware/auth';
import { HttpError } from '../middleware/error';
import { getResource } from '../lib/resources';
import { parseLocale, translatableFields } from '../lib/translations';

/** Registro existente y sus campos traducibles, o error. */
async function target(resource: string, idParam: string, localeParam: unknown) {
  const locale = parseLocale(localeParam);
  if (!locale) throw new HttpError(400, 'Idioma no válido.');
  const config = getResource(resource);
  if (!config) throw new HttpError(404, 'Recurso no encontrado.');
  const id = Number(idParam);
  const record = Number.isInteger(id) ? await config.model.findUnique({ where: { id } }) : null;
  if (!record) throw new HttpError(404, 'Registro no encontrado.');
  const fields = translatableFields(resource, record);
  if (!fields.length) throw new HttpError(400, 'Este registro no tiene campos traducibles.');
  return { locale, id, fields };
}

/** GET /api/admin/translations/:resource/:id?locale=en → { fields, values } */
export const get = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { locale, id, fields } = await target(req.params.resource, req.params.id, req.query.locale);
  const rows = await prisma.contentTranslation.findMany({
    where: { locale, resource: req.params.resource, recordId: id, field: { in: [...fields] } },
  });
  const values: Record<string, string> = {};
  for (const r of rows) values[r.field] = r.value;
  res.json({ fields, values });
});

const bodySchema = z.object({
  locale: z.string(),
  values: z.record(z.string().max(20000).nullable()),
});

/**
 * PUT /api/admin/translations/:resource/:id — guarda las traducciones.
 * Un campo vacío borra su traducción (el sitio vuelve a mostrar el español).
 */
export const save = asyncHandler(async (req: AuthRequest, res: Response) => {
  const parsed = bodySchema.safeParse(req.body);
  if (!parsed.success) throw new HttpError(400, 'Datos inválidos.');
  const { locale, id, fields } = await target(req.params.resource, req.params.id, parsed.data.locale);
  const resource = req.params.resource;

  const unknown = Object.keys(parsed.data.values).filter((f) => !fields.includes(f));
  if (unknown.length) throw new HttpError(400, `Campos no traducibles: ${unknown.join(', ')}.`);

  const ops = Object.entries(parsed.data.values).map(([field, raw]) => {
    const value = (raw ?? '').trim();
    const where = { locale_resource_recordId_field: { locale, resource, recordId: id, field } };
    return value
      ? prisma.contentTranslation.upsert({
          where,
          update: { value },
          create: { locale, resource, recordId: id, field, value },
        })
      : prisma.contentTranslation.deleteMany({ where: { locale, resource, recordId: id, field } });
  });
  await prisma.$transaction(ops);

  const rows = await prisma.contentTranslation.findMany({ where: { locale, resource, recordId: id } });
  const values: Record<string, string> = {};
  for (const r of rows) values[r.field] = r.value;
  res.json({ fields, values });
});
