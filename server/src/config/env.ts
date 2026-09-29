import dotenv from 'dotenv';
import crypto from 'crypto';
import fs from 'fs';
import path from 'path';
import { isUnsafeSecret } from '../lib/secrets';

// Carga el .env de la raíz del monorepo (../../.env) y también un .env local si existe.
dotenv.config({ path: path.resolve(process.cwd(), '../.env') });
dotenv.config();

function required(key: string, fallback?: string): string {
  const value = process.env[key] ?? fallback;
  if (value === undefined) {
    throw new Error(`Falta la variable de entorno requerida: ${key}`);
  }
  return value;
}

const isProd = (process.env.NODE_ENV ?? 'development') === 'production';

/** Archivo donde se guarda la clave generada automáticamente (fuera de Git). */
export const JWT_SECRET_FILE = path.resolve(__dirname, '../../../.jwt-secret');

/**
 * Clave para firmar las sesiones del panel.
 * En producción, si JWT_SECRET falta, es corta o es una clave publicada,
 * se genera una aleatoria y se guarda en .jwt-secret para que sobreviva
 * a los reinicios. Así nadie puede firmar sesiones con una clave conocida.
 */
function resolveJwtSecret(): string {
  const configured = process.env.JWT_SECRET;
  if (!isProd) return configured || 'dev-secret-change-me';
  if (!isUnsafeSecret(configured)) return configured!;

  try {
    const saved = fs.readFileSync(JWT_SECRET_FILE, 'utf8').trim();
    if (!isUnsafeSecret(saved)) return saved;
  } catch {
    /* todavía no existe */
  }
  const generated = crypto.randomBytes(48).toString('hex');
  try {
    // 'wx': si otro proceso la creó a la vez, se usa la suya.
    fs.writeFileSync(JWT_SECRET_FILE, generated + '\n', { flag: 'wx', mode: 0o600 });
  } catch {
    try {
      const saved = fs.readFileSync(JWT_SECRET_FILE, 'utf8').trim();
      if (!isUnsafeSecret(saved)) return saved;
    } catch {
      /* sin permisos de escritura: se usa la generada solo en este arranque */
    }
  }
  console.warn(
    '⚠️  JWT_SECRET falta o no es segura: se usa una clave generada automáticamente (' +
      JWT_SECRET_FILE + ').'
  );
  return generated;
}

export const env = {
  nodeEnv: process.env.NODE_ENV ?? 'development',
  port: parseInt(process.env.PORT ?? '4000', 10),
  databaseUrl: required('DATABASE_URL', 'mysql://root:password@localhost:3306/portfolio_nathan'),
  jwtSecret: resolveJwtSecret(),
  jwtExpiresIn: process.env.JWT_EXPIRES_IN ?? '7d',
  corsOrigin: process.env.CORS_ORIGIN ?? 'http://localhost:3000',
  apiUrl: process.env.API_URL ?? 'http://localhost:4000',
  uploadDir: process.env.UPLOAD_DIR ?? '../web/public/uploads',
  maxUploadMb: parseInt(process.env.MAX_UPLOAD_MB ?? '15', 10),
  admin: {
    name: process.env.ADMIN_NAME ?? 'Nathan Quevedo',
    email: process.env.ADMIN_EMAIL ?? 'admin@nathanquevedo.com',
    password: process.env.ADMIN_PASSWORD ?? 'Admin1234!',
  },
  isProd,
};
