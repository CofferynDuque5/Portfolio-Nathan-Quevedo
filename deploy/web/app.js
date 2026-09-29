/**
 * ============================================================
 *  Punto de entrada del sitio solo (modo "dos apps")
 * ============================================================
 *  Sirve el sitio y el panel /admin (Next.js). Los datos los pide
 *  a la API, que va en otra app Node.js con su propio zip
 *  (API_URL en el .env).
 *
 *  Es el "Application startup file" de esta app en
 *  cPanel  ->  Setup Node.js App.
 * ============================================================
 */
const path = require('path');
const http = require('http');

require('dotenv').config({ path: path.join(__dirname, '.env') });

process.env.NODE_ENV = process.env.NODE_ENV || 'production';

const next = require('next');

const port = parseInt(process.env.PORT || '3000', 10);
const app = next({ dev: false, dir: __dirname });
const handle = app.getRequestHandler();

if (!process.env.API_URL) {
  console.warn('⚠️  Falta API_URL en el .env: el sitio no podrá leer el contenido de la API.');
}

app
  .prepare()
  .then(() => {
    http.createServer((req, res) => handle(req, res)).listen(port, () => {
      console.log(`\n🚀 Sitio del portfolio en línea — puerto ${port} [${process.env.NODE_ENV}]`);
      console.log(`   API: ${process.env.API_URL || '(sin configurar)'}`);
    });
  })
  .catch((err) => {
    console.error('❌ Error al iniciar el sitio:', err);
    process.exit(1);
  });
