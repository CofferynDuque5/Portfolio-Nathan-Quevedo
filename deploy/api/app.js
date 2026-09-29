/**
 * ============================================================
 *  Punto de entrada de la API sola (modo "dos apps")
 * ============================================================
 *  Sirve solo la API (Express): /api/* y /uploads/*.
 *  El sitio (Next.js) va en otra app Node.js con su propio zip.
 *
 *  Es el "Application startup file" de esta app en
 *  cPanel  ->  Setup Node.js App.
 * ============================================================
 */
const path = require('path');

require('dotenv').config({ path: path.join(__dirname, '.env') });

process.env.NODE_ENV = process.env.NODE_ENV || 'production';

// Los archivos subidos se guardan en ./uploads (salvo UPLOAD_DIR absoluto).
if (!process.env.UPLOAD_DIR || !path.isAbsolute(process.env.UPLOAD_DIR)) {
  process.env.UPLOAD_DIR = path.join(__dirname, 'uploads');
}

// Red de seguridad: genera el cliente de Prisma si el postinstall no pudo.
function ensurePrismaClient() {
  try {
    require('@prisma/client').PrismaClient;
    return;
  } catch {
    console.log('⚙️  Generando el cliente de Prisma...');
  }
  try {
    const { execFileSync } = require('child_process');
    const prismaBin = require.resolve('prisma/build/index.js');
    const schema = path.join(__dirname, 'server', 'prisma', 'schema.prisma');
    execFileSync(process.execPath, [prismaBin, 'generate', `--schema=${schema}`], { stdio: 'inherit' });
    console.log('✅ Cliente de Prisma generado.');
  } catch (e) {
    console.error('❌ No se pudo generar el cliente de Prisma:', e.message);
  }
}
ensurePrismaClient();

const { createApiServer } = require('./server/dist/app.js');
const { notFound, errorHandler } = require('./server/dist/middleware/error.js');
const { autoBootstrap } = require('./scripts/setup-db.cjs');

const port = parseInt(process.env.PORT || '4000', 10);

async function main() {
  // Crea tablas y contenido si la base de datos está vacía.
  try {
    const result = await autoBootstrap();
    if (result.action === 'created') console.log('✅ Base de datos inicializada automáticamente.');
    else if (!result.ok) {
      console.error('⚠️  No se pudo preparar la base de datos:', result.error?.message);
      console.error('   Revisa DATABASE_URL en el .env. La API arrancará igualmente.');
    }
  } catch (e) {
    console.error('⚠️  Error preparando la base de datos:', e?.message);
  }

  const app = createApiServer();
  app.get('/', (_req, res) => res.json({ status: 'ok', service: 'portfolio-nathan-api' }));
  app.use(notFound);
  app.use(errorHandler);
  app.listen(port, () => {
    console.log(`\n🚀 API del portfolio en línea — puerto ${port} [${process.env.NODE_ENV}]`);
  });
}

main().catch((err) => {
  console.error('❌ Error al iniciar la API:', err);
  process.exit(1);
});
