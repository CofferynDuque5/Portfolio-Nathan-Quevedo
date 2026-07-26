import { Request, Response, NextFunction } from 'express';

export class HttpError extends Error {
  status: number;
  constructor(status: number, message: string) {
    super(message);
    this.status = status;
  }
}

export function notFound(_req: Request, res: Response) {
  res.status(404).json({ error: 'Recurso no encontrado.' });
}

/* eslint-disable @typescript-eslint/no-unused-vars */
export function errorHandler(err: any, _req: Request, res: Response, _next: NextFunction) {
  // Errores conocidos de Prisma (registro no encontrado, único duplicado, etc.)
  if (err?.code === 'P2025') {
    return res.status(404).json({ error: 'Registro no encontrado.' });
  }
  if (err?.code === 'P2002') {
    const field = err?.meta?.target ?? 'campo';
    return res.status(409).json({ error: `Ya existe un registro con ese ${field}.` });
  }
  // Errores de subida (Multer): tamaño excedido, tipo no permitido, etc.
  if (err?.name === 'MulterError' || /archivo no permitido|Solo se aceptan/i.test(err?.message ?? '')) {
    const msg = err?.code === 'LIMIT_FILE_SIZE' ? 'El archivo supera el tamaño máximo permitido.' : err.message;
    return res.status(400).json({ error: msg });
  }
  const status = err instanceof HttpError ? err.status : 500;
  const message = err?.message ?? 'Error interno del servidor.';
  if (status >= 500) {
    console.error('[error]', err);
  }
  res.status(status).json({ error: message });
}
