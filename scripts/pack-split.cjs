/**
 * Empaqueta el proyecto en DOS zips para instalarlo como dos apps Node.js:
 *   portfolio-api.zip  ->  la API (Express + Prisma) con la preparación de la BD
 *   portfolio-web.zip  ->  el sitio y el panel (Next.js), que llama a la API
 *
 * Uso:
 *   SITE_URL=https://midominio.com API_PUBLIC_URL=https://api.midominio.com \
 *     node scripts/pack-split.cjs [carpeta-de-salida]
 *
 * Compila la API y el sitio (el sitio lleva las dos URL "horneadas"), fija
 * las versiones exactas de node_modules en cada package.json y genera en
 * cada zip un .env.cpanel con la misma INTERNAL_API_KEY aleatoria.
 */
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const { execFileSync } = require('child_process');

const ROOT = path.resolve(__dirname, '..');
const SITE_URL = (process.env.SITE_URL || 'https://nathanquevedo.nvcorx.com').replace(/\/$/, '');
const API_URL = (process.env.API_PUBLIC_URL || 'https://api.nathanquevedo.nvcorx.com').replace(/\/$/, '');
const OUT = path.resolve(process.argv[2] || path.join(ROOT, 'dist-zips'));
const host = (u) => new URL(u).host;

const run = (cmd, args, opts = {}) =>
  execFileSync(cmd, args, { cwd: ROOT, stdio: 'inherit', ...opts });
const readJson = (p) => JSON.parse(fs.readFileSync(p, 'utf8'));
const copy = (from, to, filter) =>
  fs.cpSync(path.join(ROOT, from), to, { recursive: true, filter });

/** Versión instalada de cada dependencia, para que el hosting instale lo mismo que se probó. */
function pinned(deps) {
  const out = {};
  for (const name of Object.keys(deps).sort()) {
    out[name] = readJson(path.join(ROOT, 'node_modules', name, 'package.json')).version;
  }
  return out;
}

function fill(file, vars) {
  let text = fs.readFileSync(file, 'utf8');
  for (const [k, v] of Object.entries(vars)) text = text.split(`__${k}__`).join(v);
  fs.writeFileSync(file, text);
}

function zip(dir, file) {
  fs.rmSync(file, { force: true });
  run('zip', ['-qr', file, '.'], { cwd: dir });
  console.log(`📦 ${file} (${(fs.statSync(file).size / 1e6).toFixed(1)} MB)`);
}

const vars = { SITE_URL, API_URL, SITE_HOST: host(SITE_URL), API_HOST: host(API_URL) };
const internalKey = crypto.randomBytes(32).toString('hex');
const rootPkg = readJson(path.join(ROOT, 'package.json'));
const engines = rootPkg.engines;

// ---------- 1) Compilar ----------
run('npm', ['run', 'build', '-w', 'server']);
run('npm', ['run', 'build', '-w', 'web'], {
  env: {
    ...process.env,
    NODE_ENV: 'production',
    NEXT_PUBLIC_SITE_URL: SITE_URL,
    NEXT_PUBLIC_API_URL: API_URL,
    API_URL: '',
  },
});

fs.rmSync(OUT, { recursive: true, force: true });
fs.mkdirSync(OUT, { recursive: true });

// ---------- 2) API ----------
const api = path.join(OUT, 'portfolio-api');
const serverPkg = readJson(path.join(ROOT, 'server', 'package.json'));
copy('server/dist', path.join(api, 'server', 'dist'));
copy('server/prisma', path.join(api, 'server', 'prisma'), (src) => !src.endsWith('.db'));
for (const f of ['setup-db.cjs', 'seed-translations.cjs', 'copy-updates.cjs', 'brands.cjs', 'prisma-generate.cjs']) {
  copy(`scripts/${f}`, path.join(api, 'scripts', f));
}
copy('deploy/api/app.js', path.join(api, 'app.js'));
copy('deploy/api/DEPLOY.md', path.join(api, 'DEPLOY.md'));
fs.mkdirSync(path.join(api, 'uploads'));
fs.writeFileSync(path.join(api, 'uploads', '.gitkeep'), '');
fs.writeFileSync(
  path.join(api, 'package.json'),
  JSON.stringify(
    {
      name: 'portfolio-nathan-quevedo-api',
      version: rootPkg.version,
      private: true,
      description: 'API del portfolio de Nathan Quevedo (Express + Prisma + MySQL).',
      main: 'app.js',
      scripts: {
        start: 'node app.js',
        postinstall: 'node scripts/prisma-generate.cjs',
        'db:setup': 'node scripts/setup-db.cjs',
      },
      dependencies: pinned({ ...serverPkg.dependencies, dotenv: '', mysql2: '' }),
      engines,
    },
    null,
    2
  ) + '\n'
);
fs.writeFileSync(
  path.join(api, '.env.cpanel'),
  `# Renombra este archivo a .env y cambia SOLO la línea DATABASE_URL.
DATABASE_URL="mysql://USUARIO:CONTRASENA@localhost:3306/NOMBRE_BD"

PORT=4000
NODE_ENV=production

# Vacía: la API crea sola una clave segura en .jwt-secret.
JWT_SECRET=""
JWT_EXPIRES_IN="7d"

# Direcciones del sitio y de esta API.
NEXT_PUBLIC_SITE_URL="${SITE_URL}"
API_URL="${API_URL}"
CORS_ORIGIN="${SITE_URL}"

# La misma clave que en el .env del sitio: sus peticiones no gastan el
# límite de peticiones de los visitantes.
INTERNAL_API_KEY="${internalKey}"

# Imágenes subidas (vacío = carpeta uploads/ de esta app).
UPLOAD_DIR=""
MAX_UPLOAD_MB=15

# Avisos por correo de mensajes nuevos (opcional; sin SMTP_HOST, desactivados).
SMTP_HOST=""
SMTP_PORT=465
SMTP_USER=""
SMTP_PASS=""
NOTIFY_EMAIL="quevedomoralesnathan05@gmail.com"

# Administrador del panel. Contraseña vacía = se crea una al azar en
# ADMIN-PASSWORD.txt (entra, cámbiala en el panel y borra el archivo).
ADMIN_NAME="Nathan Quevedo"
ADMIN_EMAIL="admin@nathanquevedo.com"
ADMIN_PASSWORD=""
`
);
fill(path.join(api, 'DEPLOY.md'), vars);

// ---------- 3) Sitio ----------
const web = path.join(OUT, 'portfolio-web');
const webPkg = readJson(path.join(ROOT, 'web', 'package.json'));
copy('web/.next', path.join(web, '.next'), (src) => {
  const rel = path.relative(path.join(ROOT, 'web', '.next'), src);
  return !(rel === 'cache' || rel.startsWith(`cache${path.sep}`) || rel === 'trace');
});
copy('web/public', path.join(web, 'public'), (src) => {
  const rel = path.relative(path.join(ROOT, 'web', 'public'), src);
  return !rel.startsWith(`uploads${path.sep}`);
});
copy('web/next.config.mjs', path.join(web, 'next.config.mjs'));
copy('deploy/web/app.js', path.join(web, 'app.js'));
copy('deploy/web/DEPLOY.md', path.join(web, 'DEPLOY.md'));
fs.writeFileSync(
  path.join(web, 'package.json'),
  JSON.stringify(
    {
      name: 'portfolio-nathan-quevedo-web',
      version: rootPkg.version,
      private: true,
      description: 'Sitio y panel del portfolio de Nathan Quevedo (Next.js).',
      main: 'app.js',
      scripts: { start: 'node app.js' },
      dependencies: pinned({ ...webPkg.dependencies, dotenv: '' }),
      engines,
    },
    null,
    2
  ) + '\n'
);
fs.writeFileSync(
  path.join(web, '.env.cpanel'),
  `# Renombra este archivo a .env. Ya viene completo.
PORT=3000
NODE_ENV=production

# Dirección de la API (la otra app Node.js).
API_URL="${API_URL}"

# La misma clave que en el .env de la API.
INTERNAL_API_KEY="${internalKey}"
`
);
fill(path.join(web, 'DEPLOY.md'), vars);

// ---------- 4) Lockfiles y zips ----------
for (const dir of [api, web]) {
  run('npm', ['install', '--package-lock-only', '--ignore-scripts', '--no-audit', '--no-fund'], { cwd: dir });
}
zip(api, path.join(OUT, 'portfolio-api.zip'));
zip(web, path.join(OUT, 'portfolio-web.zip'));
