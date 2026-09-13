/**
 * ============================================================
 *  Punto de entrada de PRODUCCIÓN — un solo proceso
 * ============================================================
 *  Sirve, en el MISMO puerto y dominio:
 *    - La API (Express)         ->  /api/*  y  /uploads/*
 *    - El sitio web (Next.js)   ->  todo lo demás
 *
 *  Es el archivo que debe indicarse como "Application startup file"
 *  en cPanel  ->  Setup Node.js App.
 *
 *  Requisitos previos (una sola vez):
 *    npm install
 *    npm run build      (genera server/dist y web/.next)
 *    npm run db:push && npm run seed
 * ============================================================
 */
const path = require('path');

// Carga variables de entorno desde el .env de la raíz.
require('dotenv').config({ path: path.join(__dirname, '.env') });

process.env.NODE_ENV = process.env.NODE_ENV || 'production';

const express = require('express');
const next = require('next');

const port = parseInt(process.env.PORT || '3000', 10);

// La API compilada (server/dist). Si no existe, avisa cómo compilar.
let createApiServer, errorHandler;
try {
  ({ createApiServer } = require('./server/dist/app.js'));
  ({ errorHandler } = require('./server/dist/middleware/error.js'));
} catch (e) {
  console.error('\n❌ No se encontró la API compilada (server/dist).');
  console.error('   Ejecuta primero:  npm run build\n');
  throw e;
}

// Auto-preparación de la base de datos (crea tablas + contenido si está vacía).
let autoBootstrap;
try {
  ({ autoBootstrap } = require('./scripts/setup-db.cjs'));
} catch {
  autoBootstrap = null;
}

// App de Next.js (frontend + panel /admin) ubicada en /web.
const nextApp = next({ dev: false, dir: path.join(__dirname, 'web') });
const handle = nextApp.getRequestHandler();

async function prepareDatabase() {
  if (!autoBootstrap) return;
  try {
    const result = await autoBootstrap();
    if (result.action === 'created') {
      console.log('✅ Base de datos inicializada automáticamente.');
    } else if (!result.ok) {
      console.error('⚠️  No se pudo preparar la base de datos automáticamente:', result.error?.message);
      console.error('   Revisa DATABASE_URL en el .env. La app arrancará igualmente.');
    }
  } catch (e) {
    console.error('⚠️  Error en la preparación automática de la base de datos:', e?.message);
  }
}

nextApp
  .prepare()
  .then(async () => {
    // Prepara la BD antes de aceptar peticiones (solo actúa si está vacía).
    await prepareDatabase();

    const server = express();

    // 1) API + archivos subidos (/api/*, /uploads/*)
    server.use(createApiServer());

    // 2) Todo lo demás lo resuelve Next.js (páginas, panel, assets)
    server.all('*', (req, res) => handle(req, res));

    // 3) Manejo de errores final (para errores propagados por la API)
    server.use(errorHandler);

    server.listen(port, () => {
      console.log(`\n🚀 Portfolio Nathan Quevedo en línea — puerto ${port} [${process.env.NODE_ENV}]`);
      console.log(`   Sitio:  /            (Next.js)`);
      console.log(`   API:    /api/health  (Express)`);
    });
  })
  .catch((err) => {
    console.error('❌ Error al iniciar la aplicación:', err);
    process.exit(1);
  });
