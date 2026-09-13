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

// App de Next.js (frontend + panel /admin) ubicada en /web.
const nextApp = next({ dev: false, dir: path.join(__dirname, 'web') });
const handle = nextApp.getRequestHandler();

nextApp
  .prepare()
  .then(() => {
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
