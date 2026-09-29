import express, { Express } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';
import crypto from 'crypto';
import fs from 'fs';
import { env } from './config/env';
import routes from './routes';
import { notFound } from './middleware/error';
import { UPLOAD_ROOT } from './controllers/upload.controller';

/**
 * Construye la app Express de la API (middleware + rutas + /uploads),
 * SIN ponerse a escuchar y SIN el manejador de errores final.
 *
 * Así se puede usar de dos formas:
 *  - Standalone (server/src/index.ts): API en su propio puerto.
 *  - Un solo proceso (app.js en la raíz): montada junto a Next.js en el
 *    mismo puerto/dominio (ideal para cPanel/hosting compartido).
 */
const isLocalAddress = (addr?: string) =>
  !addr || addr === '127.0.0.1' || addr === '::1' || addr === '::ffff:127.0.0.1';

/**
 * Peticiones que el propio servidor de Next.js hace a la API al renderizar
 * páginas. Llevan una clave aleatoria que solo conoce este proceso
 * (INTERNAL_API_KEY, la crea app.js al arrancar) y no cuentan para el límite
 * de peticiones: si contaran, todas las visitas compartirían un mismo cupo.
 */
export function isInternalRequest(req: express.Request): boolean {
  const key = process.env.INTERNAL_API_KEY;
  const sent = req.get('x-internal-key');
  if (!key || !sent || sent.length !== key.length) return false;
  return crypto.timingSafeEqual(Buffer.from(sent), Buffer.from(key));
}

export function createApiServer(): Express {
  const app = express();
  app.disable('x-powered-by');
  // Detrás del proxy del hosting (Apache/Passenger en cPanel) la conexión llega
  // desde la propia máquina: se confía solo en ese salto para conocer la IP
  // real del visitante (X-Forwarded-For). Una IP pública nunca se toma por proxy.
  app.set('trust proxy', (addr: string, i: number) => i === 0 && isLocalAddress(addr));

  app.use(
    helmet({
      // CSP desactivada: en modo "un solo proceso" esta app también sirve
      // las páginas de Next.js, cuyos scripts se romperían con la CSP por defecto.
      contentSecurityPolicy: false,
      crossOriginResourcePolicy: { policy: 'cross-origin' },
    })
  );
  app.use(cors({ origin: env.corsOrigin.split(',').map((o) => o.trim()), credentials: true }));
  app.use(compression());
  app.use(express.json({ limit: '2mb' }));
  app.use(express.urlencoded({ extended: true }));
  if (!env.isProd) app.use(morgan('dev'));

  // Carpeta de archivos subidos servida de forma estática.
  fs.mkdirSync(UPLOAD_ROOT, { recursive: true });
  app.use(
    '/uploads',
    express.static(UPLOAD_ROOT, { maxAge: env.isProd ? '30d' : 0, immutable: env.isProd })
  );

  // Healthcheck
  app.get('/api/health', (_req, res) => {
    res.json({ status: 'ok', service: 'portfolio-nathan-api', time: new Date().toISOString() });
  });

  // Límite general de peticiones a la API.
  app.use(
    '/api',
    rateLimit({
      windowMs: 60 * 1000,
      max: 300,
      standardHeaders: true,
      legacyHeaders: false,
      skip: isInternalRequest,
      message: { error: 'Demasiadas peticiones. Espera un momento e intenta de nuevo.' },
    })
  );

  app.use('/api', routes);

  // 404 en JSON solo para rutas /api desconocidas (las demás pasan a Next.js).
  app.use('/api', notFound);

  return app;
}
