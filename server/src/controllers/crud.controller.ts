import { Response } from 'express';
import bcrypt from 'bcryptjs';
import { AuthRequest } from '../middleware/auth';
import { asyncHandler } from '../utils/asyncHandler';
import { getResource, normalizePayload, ResourceConfig } from '../lib/resources';
import { HttpError } from '../middleware/error';

/** Convierte `password` en `passwordHash` para el recurso de usuarios. */
async function handlePassword(resource: string, payload: Record<string, any>) {
  if (resource !== 'users') return payload;
  const out = { ...payload };
  if (out.password) {
    out.passwordHash = await bcrypt.hash(String(out.password), 10);
  }
  delete out.password;
  return out;
}

function resolveResource(name: string): ResourceConfig {
  const config = getResource(name);
  if (!config) throw new HttpError(404, `Recurso desconocido: ${name}`);
  return config;
}

/** GET /api/admin/:resource — listado con búsqueda, orden y paginación. */
export const list = asyncHandler(async (req: AuthRequest, res: Response) => {
  const config = resolveResource(req.params.resource);

  const page = Math.max(1, parseInt((req.query.page as string) ?? '1', 10));
  const perPage = Math.min(100, Math.max(1, parseInt((req.query.perPage as string) ?? '10', 10)));
  const search = (req.query.search as string)?.trim();
  const sortBy = req.query.sortBy as string | undefined;
  const sortDir = (req.query.sortDir as string) === 'desc' ? 'desc' : 'asc';

  const where: any = {};
  if (search && config.searchable.length) {
    where.OR = config.searchable.map((field) => ({
      [field]: { contains: search },
    }));
  }

  const orderBy = sortBy ? { [sortBy]: sortDir } : config.defaultOrderBy;

  const [total, data] = await Promise.all([
    config.model.count({ where }),
    config.model.findMany({
      where,
      orderBy,
      skip: (page - 1) * perPage,
      take: perPage,
      include: config.include,
    }),
  ]);

  res.json({
    data: sanitizeList(req.params.resource, data),
    meta: {
      total,
      page,
      perPage,
      totalPages: Math.ceil(total / perPage) || 1,
    },
  });
});

/** GET /api/admin/:resource/:id */
export const getOne = asyncHandler(async (req: AuthRequest, res: Response) => {
  const config = resolveResource(req.params.resource);
  const record = await config.model.findUnique({
    where: { id: Number(req.params.id) },
    include: config.include,
  });
  if (!record) throw new HttpError(404, 'Registro no encontrado.');
  res.json({ data: sanitize(req.params.resource, record) });
});

/** POST /api/admin/:resource */
export const create = asyncHandler(async (req: AuthRequest, res: Response) => {
  const config = resolveResource(req.params.resource);
  const payload = await handlePassword(req.params.resource, normalizePayload(config, req.body));
  const record = await config.model.create({ data: payload, include: config.include });
  res.status(201).json({ data: sanitize(req.params.resource, record) });
});

/** PUT /api/admin/:resource/:id */
export const update = asyncHandler(async (req: AuthRequest, res: Response) => {
  const config = resolveResource(req.params.resource);
  const payload = await handlePassword(req.params.resource, normalizePayload(config, req.body));
  const record = await config.model.update({
    where: { id: Number(req.params.id) },
    data: payload,
    include: config.include,
  });
  res.json({ data: sanitize(req.params.resource, record) });
});

/** PATCH /api/admin/:resource/:id/toggle — activar/desactivar. */
export const toggle = asyncHandler(async (req: AuthRequest, res: Response) => {
  const config = resolveResource(req.params.resource);
  if (!config.hasActive) throw new HttpError(400, 'Este recurso no admite activar/desactivar.');
  const current = await config.model.findUnique({ where: { id: Number(req.params.id) } });
  if (!current) throw new HttpError(404, 'Registro no encontrado.');
  const record = await config.model.update({
    where: { id: Number(req.params.id) },
    data: { active: !current.active },
  });
  res.json({ data: sanitize(req.params.resource, record) });
});

/** DELETE /api/admin/:resource/:id */
export const remove = asyncHandler(async (req: AuthRequest, res: Response) => {
  const config = resolveResource(req.params.resource);
  await config.model.delete({ where: { id: Number(req.params.id) } });
  res.json({ success: true });
});

/** Quita el hash de contraseña de las respuestas de usuarios. */
function sanitize(resource: string, record: any) {
  if (resource === 'users' && record) {
    const { passwordHash, ...rest } = record;
    return rest;
  }
  return record;
}

function sanitizeList(resource: string, records: any[]) {
  return records.map((r) => sanitize(resource, r));
}
