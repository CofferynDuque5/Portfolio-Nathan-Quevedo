import dotenv from 'dotenv';
import path from 'path';

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

export const env = {
  nodeEnv: process.env.NODE_ENV ?? 'development',
  port: parseInt(process.env.PORT ?? '4000', 10),
  databaseUrl: required('DATABASE_URL', 'mysql://root:password@localhost:3306/portfolio_nathan'),
  jwtSecret: required('JWT_SECRET', 'dev-secret-change-me'),
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
  isProd: (process.env.NODE_ENV ?? 'development') === 'production',
};
