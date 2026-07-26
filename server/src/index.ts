import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';
import path from 'path';
import fs from 'fs';
import { env } from './config/env';
import routes from './routes';
import { notFound, errorHandler } from './middleware/error';
import { UPLOAD_ROOT } from './controllers/upload.controller';

const app = express();

app.disable('x-powered-by');
app.use(
  helmet({
    crossOriginResourcePolicy: { policy: 'cross-origin' },
  })
);
app.use(
  cors({
    origin: env.corsOrigin.split(',').map((o) => o.trim()),
    credentials: true,
  })
);
app.use(compression());
app.use(express.json({ limit: '2mb' }));
app.use(express.urlencoded({ extended: true }));
if (!env.isProd) app.use(morgan('dev'));

// Asegura que la carpeta de uploads exista y la sirve como estática.
fs.mkdirSync(UPLOAD_ROOT, { recursive: true });
app.use(
  '/uploads',
  express.static(UPLOAD_ROOT, {
    maxAge: env.isProd ? '30d' : 0,
    immutable: env.isProd,
  })
);

// Healthcheck
app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', service: 'portfolio-nathan-api', time: new Date().toISOString() });
});

// Límite general de peticiones a la API (protección básica anti-abuso).
app.use(
  '/api',
  rateLimit({
    windowMs: 60 * 1000,
    max: 300,
    standardHeaders: true,
    legacyHeaders: false,
    message: { error: 'Demasiadas peticiones. Espera un momento e intenta de nuevo.' },
  })
);

// API
app.use('/api', routes);

// 404 + manejo de errores
app.use(notFound);
app.use(errorHandler);

const server = app.listen(env.port, () => {
  console.log(`\n🚀 API lista en ${env.apiUrl} (puerto ${env.port}) [${env.nodeEnv}]`);
  console.log(`📂 Uploads: ${UPLOAD_ROOT}`);
});

// Cierre elegante
process.on('SIGTERM', () => server.close(() => process.exit(0)));
process.on('SIGINT', () => server.close(() => process.exit(0)));

export default app;
