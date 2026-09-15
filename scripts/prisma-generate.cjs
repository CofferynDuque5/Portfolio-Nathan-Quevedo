/**
 * Genera el cliente de Prisma SIN depender de que "prisma" esté en el PATH.
 * Necesario en hostings (cPanel/CloudLinux) donde el postinstall no encuentra
 * el binario "prisma". Resuelve la ruta del módulo y lo ejecuta con node.
 */
const path = require('path');
const { execFileSync } = require('child_process');

const schema = path.join(__dirname, '..', 'server', 'prisma', 'schema.prisma');

try {
  const prismaBin = require.resolve('prisma/build/index.js');
  execFileSync(process.execPath, [prismaBin, 'generate', `--schema=${schema}`], {
    stdio: 'inherit',
  });
} catch (e) {
  // No romper la instalación: si aquí falla, app.js lo reintenta al arrancar.
  console.error('[prisma-generate] Aviso: no se pudo generar ahora (' + (e.message || e) + ').');
  console.error('[prisma-generate] Se reintentará automáticamente al iniciar la app.');
  process.exit(0);
}
