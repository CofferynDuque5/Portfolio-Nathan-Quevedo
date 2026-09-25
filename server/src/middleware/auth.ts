import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { env } from '../config/env';
import { prisma } from '../lib/prisma';

export interface AuthRequest extends Request {
  user?: { id: number; email: string; role: string };
}

/**
 * Verifica el JWT del header Authorization: Bearer <token> y que el usuario
 * siga existiendo y activo. El rol se toma de la base de datos, no del token,
 * para que desactivar o degradar a alguien surta efecto al momento.
 */
export async function requireAuth(req: AuthRequest, res: Response, next: NextFunction) {
  const header = req.headers.authorization;
  if (!header || !header.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'No autorizado. Token requerido.' });
  }
  const token = header.slice(7);
  let payload: { id: number };
  try {
    payload = jwt.verify(token, env.jwtSecret) as { id: number };
  } catch {
    return res.status(401).json({ error: 'Token inválido o expirado.' });
  }
  try {
    const user = Number.isInteger(payload.id)
      ? await prisma.user.findUnique({
          where: { id: payload.id },
          select: { id: true, email: true, role: true, active: true },
        })
      : null;
    if (!user || !user.active) {
      return res.status(401).json({ error: 'Token inválido o expirado.' });
    }
    req.user = { id: user.id, email: user.email, role: user.role };
    next();
  } catch (err) {
    next(err);
  }
}

/** Restringe a un rol concreto (ej. solo ADMIN). */
export function requireRole(...roles: string[]) {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({ error: 'Permisos insuficientes.' });
    }
    next();
  };
}
