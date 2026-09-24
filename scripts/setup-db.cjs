/**
 * ============================================================
 *  Preparación de la base de datos
 * ============================================================
 *  - Crea las tablas y aplica las migraciones pendientes (registro en
 *    la tabla `_app_migrations`).
 *  - Siembra el contenido inicial (admin, servicios, plataformas,
 *    licencias, FAQ, redes, contacto, SEO, etc.).
 *
 *  Se usa de dos formas:
 *   1) Automático: app.js llama a autoBootstrap() al arrancar. Aplica las
 *      migraciones pendientes y, si la BD está vacía, siembra el contenido
 *      (no toca los datos existentes).
 *   2) Manual: `node scripts/setup-db.cjs`  (o cPanel > Run JS script > db:setup)
 *      Recarga el contenido base.
 * ============================================================
 */
const path = require('path');
const fs = require('fs');

require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

/** Parsea la DATABASE_URL en sus partes. */
function parseDbUrl(dbUrl) {
  const url = new URL(dbUrl);
  return {
    host: url.hostname || 'localhost',
    port: url.port ? parseInt(url.port, 10) : 3306,
    user: decodeURIComponent(url.username),
    password: decodeURIComponent(url.password),
    database: decodeURIComponent(url.pathname.replace(/^\//, '')),
  };
}

async function canConnect(cfg) {
  let mysql;
  try {
    mysql = require('mysql2/promise');
  } catch {
    return false; // sin driver no podemos comprobar; se asume que existe
  }
  try {
    const conn = await mysql.createConnection({
      host: cfg.host,
      port: cfg.port,
      user: cfg.user,
      password: cfg.password,
      database: cfg.database,
      connectTimeout: 8000,
    });
    await conn.end();
    return true;
  } catch {
    return false;
  }
}

/** Intenta crear la BD por la API de cPanel (uapi). */
function tryCpanelCreate(cfg, log) {
  const { execFileSync } = require('child_process');
  const bins = ['uapi', '/usr/local/cpanel/bin/uapi'];
  for (const bin of bins) {
    try {
      execFileSync(bin, ['--output=json', 'Mysql', 'create_database', `name=${cfg.database}`], { stdio: 'pipe' });
      // Asegura que el usuario exista y tenga privilegios (ignora errores si ya existen).
      try {
        execFileSync(bin, ['--output=json', 'Mysql', 'create_user', `name=${cfg.user}`, `password=${cfg.password}`], { stdio: 'pipe' });
      } catch {}
      try {
        execFileSync(bin, ['--output=json', 'Mysql', 'set_privileges_on_database', `user=${cfg.user}`, `database=${cfg.database}`, 'privileges=ALL PRIVILEGES'], { stdio: 'pipe' });
      } catch {}
      log('   • API de cPanel ejecutada (' + bin + ').');
      return true;
    } catch {
      // probar el siguiente binario
    }
  }
  return false;
}

/**
 * Garantiza que la BASE DE DATOS (esquema MySQL) exista.
 *  1) Si ya conecta, no hace nada.
 *  2) Intenta CREATE DATABASE por SQL (funciona si el usuario tiene permiso).
 *  3) Intenta crearla con la API de cPanel (uapi).
 * Devuelve { ok, action|message }.
 */
async function ensureDatabaseExists(log = console.log) {
  const dbUrl = process.env.DATABASE_URL;
  if (!dbUrl) return { ok: false, message: 'Falta DATABASE_URL en el .env' };

  let cfg;
  try {
    cfg = parseDbUrl(dbUrl);
  } catch {
    return { ok: false, message: 'DATABASE_URL con formato inválido' };
  }
  if (!cfg.database) return { ok: false, message: 'DATABASE_URL sin nombre de base de datos' };

  // 1) ¿Ya existe?
  if (await canConnect(cfg)) return { ok: true, action: 'exists' };

  log('   • La base de datos "' + cfg.database + '" no existe. Intentando crearla...');

  // 2) CREATE DATABASE por SQL.
  try {
    const mysql = require('mysql2/promise');
    const conn = await mysql.createConnection({
      host: cfg.host,
      port: cfg.port,
      user: cfg.user,
      password: cfg.password,
      connectTimeout: 8000,
    });
    const safe = cfg.database.replace(/`/g, '');
    await conn.query('CREATE DATABASE IF NOT EXISTS `' + safe + '` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci');
    await conn.end();
    if (await canConnect(cfg)) {
      log('   ✓ Base de datos creada por SQL.');
      return { ok: true, action: 'created-sql' };
    }
  } catch (e) {
    log('   • No se pudo crear por SQL (' + (e.code || e.message) + '). Probando API de cPanel...');
  }

  // 3) API de cPanel.
  if (tryCpanelCreate(cfg, log) && (await canConnect(cfg))) {
    log('   ✓ Base de datos creada por la API de cPanel.');
    return { ok: true, action: 'created-cpanel' };
  }

  return {
    ok: false,
    message:
      'No se pudo crear la base de datos automáticamente. Créala en cPanel > MySQL Databases ' +
      '(nombre: ' + cfg.database + ', usuario: ' + cfg.user + ' con ALL PRIVILEGES) y reinicia la app.',
  };
}

const admin = {
  name: process.env.ADMIN_NAME || 'Nathan Quevedo',
  email: process.env.ADMIN_EMAIL || 'admin@nathanquevedo.com',
  password: process.env.ADMIN_PASSWORD || 'Admin1234!',
};

/** Divide un archivo de migración en sentencias SQL ejecutables. */
function readMigrationStatements(file) {
  return fs
    .readFileSync(file, 'utf8')
    .split(';')
    .map((s) =>
      s
        .split('\n')
        .filter((line) => !line.trim().startsWith('--'))
        .join('\n')
        .trim()
    )
    .filter((s) => s.length > 0);
}

async function tableExists(prisma, table) {
  try {
    await prisma.$queryRawUnsafe('SELECT 1 FROM `' + table + '` LIMIT 1');
    return true;
  } catch {
    return false;
  }
}

/**
 * Aplica las migraciones pendientes de prisma/migrations en orden.
 * Lleva un registro propio en `_app_migrations`, de modo que al actualizar
 * la app (p. ej. al añadir el módulo de proyectos) las tablas nuevas se crean
 * solas al reiniciar, sin tocar los datos existentes.
 */
async function ensureSchema(prisma, log = console.log) {
  await prisma.$executeRawUnsafe(
    'CREATE TABLE IF NOT EXISTS `_app_migrations` (' +
      '`name` VARCHAR(191) NOT NULL, ' +
      '`appliedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3), ' +
      'PRIMARY KEY (`name`)' +
      ') DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci'
  );

  const migrationsDir = path.join(__dirname, '..', 'server', 'prisma', 'migrations');
  const dirs = fs
    .readdirSync(migrationsDir)
    .filter((d) => fs.existsSync(path.join(migrationsDir, d, 'migration.sql')))
    .sort();

  const rows = await prisma.$queryRawUnsafe('SELECT `name` FROM `_app_migrations`');
  const applied = new Set(rows.map((r) => r.name));

  // Instalaciones anteriores a este registro: si ya existen las tablas base,
  // la migración inicial se aplicó en su momento; se marca sin re-ejecutarla.
  if (applied.size === 0 && dirs.length && (await tableExists(prisma, 'users'))) {
    await prisma.$executeRawUnsafe('INSERT INTO `_app_migrations` (`name`) VALUES (?)', dirs[0]);
    applied.add(dirs[0]);
  }

  const pending = dirs.filter((d) => !applied.has(d));
  if (!pending.length) {
    log('   ✓ Tablas al día (sin migraciones pendientes).');
    return;
  }

  for (const dir of pending) {
    log('   • Aplicando migración ' + dir + '...');
    for (const stmt of readMigrationStatements(path.join(migrationsDir, dir, 'migration.sql'))) {
      await prisma.$executeRawUnsafe(stmt);
    }
    await prisma.$executeRawUnsafe('INSERT INTO `_app_migrations` (`name`) VALUES (?)', dir);
  }
  log('   ✓ ' + pending.length + ' migración(es) aplicada(s).');
}

/** Inserta / actualiza todo el contenido inicial. */
async function seedContent(prisma, log = console.log) {
  // ---------------- Usuario administrador ----------------
  const passwordHash = await bcrypt.hash(admin.password, 10);
  await prisma.user.upsert({
    where: { email: admin.email },
    update: { name: admin.name, passwordHash, active: true },
    create: { name: admin.name, email: admin.email, passwordHash, role: 'ADMIN' },
  });
  log(`   ✓ Admin: ${admin.email}`);

  // ---------------- Configuración general ----------------
  const settings = [
    { key: 'siteName', value: 'Nathan Quevedo', group: 'general', label: 'Nombre del sitio', type: 'text' },
    { key: 'tagline', value: 'Servicios y Licencias Digitales Premium', group: 'general', label: 'Eslogan', type: 'text' },
    { key: 'aboutTitle', value: 'Sobre Nathan Quevedo', group: 'about', label: 'Título Sobre mí', type: 'text' },
    {
      key: 'aboutText',
      value:
        'Especialista en soluciones digitales, licencias de software original y suscripciones premium. Ofrezco instalación remota, soporte técnico y asesoría para que aproveches al máximo tus herramientas tecnológicas, con total confianza y respaldo.',
      group: 'about',
      label: 'Texto Sobre mí',
      type: 'textarea',
    },
    { key: 'primaryColor', value: '#6366f1', group: 'theme', label: 'Color primario', type: 'color' },
    { key: 'whatsapp', value: '+58 4225200631', group: 'contact', label: 'WhatsApp', type: 'text' },
    { key: 'processTitle', value: 'Proceso de trabajo', group: 'process', label: 'Título proceso', type: 'text' },
    // Cifras de la sección "Sobre mí" (vacías = ocultas).
    { key: 'statClients', value: '+2000', group: 'about', label: 'Cifra: clientes satisfechos', type: 'text' },
    { key: 'statOriginal', value: '100%', group: 'about', label: 'Cifra: software original', type: 'text' },
    { key: 'statSupport', value: '24/7', group: 'about', label: 'Cifra: soporte disponible', type: 'text' },
    { key: 'statProducts', value: '+50', group: 'about', label: 'Cifra: productos y licencias', type: 'text' },
  ];
  for (const s of settings) {
    await prisma.setting.upsert({
      where: { key: s.key },
      update: { value: s.value, label: s.label, group: s.group, type: s.type },
      create: s,
    });
  }
  log(`   ✓ ${settings.length} ajustes generales`);

  // ---------------- Hero ----------------
  await prisma.heroSlide.deleteMany();
  await prisma.heroSlide.createMany({
    data: [
      {
        title: 'Software original y suscripciones premium',
        highlight: 'a un solo clic',
        subtitle:
          'Licencias auténticas, plataformas de streaming y herramientas profesionales con instalación remota y soporte garantizado.',
        ctaText: 'Contactar ahora',
        ctaLink: '#contacto',
        order: 0,
        active: true,
      },
      {
        title: 'Instalación remota y soporte técnico',
        highlight: 'sin complicaciones',
        subtitle: 'Configuramos tus licencias y aplicaciones de forma remota, rápida y segura.',
        ctaText: 'Ver servicios',
        ctaLink: '#servicios',
        order: 1,
        active: true,
      },
    ],
  });
  log('   ✓ Hero');

  // ---------------- Categorías ----------------
  // Upsert por slug (no deleteMany): así los proyectos reales conservan su categoría
  // aunque se vuelva a ejecutar la carga del contenido base.
  const categoryData = [
    { name: 'Streaming', slug: 'streaming', icon: 'Play', description: 'Plataformas de entretenimiento premium', order: 0 },
    { name: 'Licencias', slug: 'licencias', icon: 'KeyRound', description: 'Software original con licencia', order: 1 },
    { name: 'Nube', slug: 'nube', icon: 'Cloud', description: 'Almacenamiento y productividad en la nube', order: 2 },
    { name: 'Seguridad', slug: 'seguridad', icon: 'ShieldCheck', description: 'Protección digital y privacidad', order: 3 },
    { name: 'Soporte', slug: 'soporte', icon: 'Headset', description: 'Instalación remota y soporte técnico', order: 4 },
  ];
  for (const c of categoryData) {
    await prisma.category.upsert({ where: { slug: c.slug }, update: c, create: c });
  }
  const categories = await prisma.category.findMany();
  const catId = (slug) => (categories.find((c) => c.slug === slug) || {}).id ?? null;
  log('   ✓ Categorías');

  // ---------------- Servicios ----------------
  await prisma.service.deleteMany();
  const services = [
    { title: 'Plataformas de Streaming Premium', slug: 'streaming-premium', icon: 'Play', shortDesc: 'Netflix, Disney+, HBO, Prime Video y más.', description: 'Acceso a las mejores plataformas de streaming con garantía y soporte continuo.', category: 'streaming', featured: true },
    { title: 'Instalación y Configuración Remota', slug: 'instalacion-remota', icon: 'MonitorSmartphone', shortDesc: 'Configuramos todo por ti, de forma remota.', description: 'Instalación y puesta a punto de tus licencias y aplicaciones sin que salgas de casa.', category: 'soporte', featured: true },
    { title: 'Licencias de Software Original', slug: 'licencias-software', icon: 'KeyRound', shortDesc: 'Claves auténticas y verificadas.', description: 'Licencias 100% originales para todo tipo de software profesional.', category: 'licencias', featured: true },
    { title: 'Licencias Microsoft Windows', slug: 'windows', icon: 'Monitor', shortDesc: 'Windows 10 y 11 Pro/Home.', description: 'Activa tu Windows con licencias originales de por vida.', category: 'licencias' },
    { title: 'Microsoft Office y Microsoft 365', slug: 'office-365', icon: 'FileText', shortDesc: 'Office 2021 y Microsoft 365.', description: 'Word, Excel, PowerPoint y más, con licencia original.', category: 'licencias' },
    { title: 'Suscripciones de Software', slug: 'suscripciones', icon: 'Sparkles', shortDesc: 'Adobe, Canva Pro, CapCut, ChatGPT.', description: 'Las mejores herramientas creativas y de IA por suscripción.', category: 'licencias', featured: true },
    { title: 'Seguridad y Protección Digital', slug: 'seguridad-digital', icon: 'ShieldCheck', shortDesc: 'Antivirus y VPN premium.', description: 'Protege tus dispositivos y tu privacidad con las mejores soluciones.', category: 'seguridad' },
    { title: 'Almacenamiento en la Nube', slug: 'nube', icon: 'Cloud', shortDesc: 'Google One, OneDrive, Dropbox.', description: 'Amplía tu almacenamiento en la nube con planes premium.', category: 'nube' },
    { title: 'Software Profesional y Empresarial', slug: 'software-profesional', icon: 'Briefcase', shortDesc: 'Soluciones para empresas.', description: 'Software especializado para profesionales y empresas.', category: 'licencias' },
    { title: 'Soporte Técnico Remoto', slug: 'soporte-tecnico', icon: 'Headset', shortDesc: 'Asistencia cuando la necesites.', description: 'Soporte técnico remoto rápido y confiable.', category: 'soporte' },
  ];
  await prisma.service.createMany({
    data: services.map((s, i) => ({
      title: s.title,
      slug: s.slug,
      icon: s.icon,
      shortDesc: s.shortDesc,
      description: s.description,
      image: `/services/${s.slug}.svg`,
      featured: s.featured || false,
      categoryId: catId(s.category),
      ctaText: 'Solicitar por WhatsApp',
      ctaLink: '#contacto',
      order: i,
      active: true,
    })),
  });
  log(`   ✓ ${services.length} servicios`);

  // ---------------- Proyectos (casos de estudio) ----------------
  // Nunca se borran: son contenido real del portfolio. Solo si no hay ninguno
  // se crean dos BORRADORES de ejemplo, claramente marcados, para mostrar la
  // estructura en el panel. No se publican ni aparecen en el sitio.
  if ((await prisma.project.count()) === 0) {
    const sample = 'Contenido de ejemplo: reemplázalo por la información real del proyecto antes de publicarlo.';
    await prisma.project.createMany({
      data: [
        {
          title: '[Ejemplo] Puesta en marcha de un servicio de streaming',
          slug: 'ejemplo-servicio-streaming',
          client: 'Cliente de ejemplo',
          summary: sample,
          challenge: 'Describe aquí el problema o la necesidad del cliente. ' + sample,
          solution: 'Explica qué hiciste, con qué herramientas y cómo lo organizaste. ' + sample,
          results: 'Resume los resultados reales y medibles. ' + sample,
          tags: 'Streaming, Ejemplo',
          categoryId: catId('streaming'),
          status: 'DRAFT',
          order: 0,
        },
        {
          title: '[Ejemplo] Instalación y soporte remoto para una oficina',
          slug: 'ejemplo-soporte-remoto',
          client: 'Cliente de ejemplo',
          summary: sample,
          challenge: 'Describe aquí el problema o la necesidad del cliente. ' + sample,
          solution: 'Explica qué hiciste, con qué herramientas y cómo lo organizaste. ' + sample,
          results: 'Resume los resultados reales y medibles. ' + sample,
          tags: 'Soporte, Ejemplo',
          categoryId: catId('soporte'),
          status: 'DRAFT',
          order: 1,
        },
      ],
    });
    log('   ✓ 2 proyectos de ejemplo (borradores)');
  }

  // ---------------- Plataformas de streaming ----------------
  await prisma.platform.deleteMany();
  const platforms = [
    { name: 'Netflix', key: 'netflix' },
    { name: 'Disney+', key: 'disney-plus' },
    { name: 'HBO Max', key: 'hbo-max' },
    { name: 'Prime Video', key: 'prime-video' },
    { name: 'Spotify', key: 'spotify' },
    { name: 'YouTube Premium', key: 'youtube' },
    { name: 'Paramount+', key: 'paramount-plus' },
    { name: 'Crunchyroll', key: 'crunchyroll' },
  ];
  await prisma.platform.createMany({
    data: platforms.map((p, i) => ({
      name: p.name,
      slug: p.key,
      description: `Suscripción premium a ${p.name}.`,
      logo: `/brands/${p.key}.svg`,
      order: i,
      active: true,
    })),
  });
  log(`   ✓ ${platforms.length} plataformas`);

  // ---------------- Licencias ----------------
  await prisma.license.deleteMany();
  const licenses = [
    { name: 'Windows 11 Pro', type: 'Sistema Operativo', key: 'windows-11' },
    { name: 'Microsoft Office 2021', type: 'Ofimática', key: 'office-2021' },
    { name: 'Microsoft 365', type: 'Suscripción', key: 'microsoft-365' },
    { name: 'Adobe Creative Cloud', type: 'Diseño', key: 'adobe-cc' },
    { name: 'Canva Pro', type: 'Diseño', key: 'canva' },
    { name: 'CapCut Pro', type: 'Edición de video', key: 'capcut' },
    { name: 'ChatGPT Plus', type: 'Inteligencia Artificial', key: 'chatgpt' },
    { name: 'Google One', type: 'Almacenamiento', key: 'google-one' },
    { name: 'OneDrive', type: 'Almacenamiento', key: 'onedrive' },
    { name: 'Dropbox', type: 'Almacenamiento', key: 'dropbox' },
    { name: 'VPN Premium', type: 'Seguridad', key: 'vpn' },
    { name: 'Antivirus Premium', type: 'Seguridad', key: 'antivirus' },
  ];
  await prisma.license.createMany({
    data: licenses.map((l, i) => ({
      name: l.name,
      slug: l.key,
      type: l.type,
      description: `Licencia original de ${l.name}.`,
      image: `/brands/${l.key}.svg`,
      order: i,
      active: true,
    })),
  });
  log(`   ✓ ${licenses.length} licencias`);

  // ---------------- FAQ ----------------
  await prisma.faq.deleteMany();
  const faqs = [
    { question: '¿Las licencias son originales?', answer: 'Sí, todas nuestras licencias son 100% originales y verificadas.' },
    { question: '¿Cómo se realiza la instalación?', answer: 'La instalación se realiza de forma remota, de manera rápida y segura, sin que tengas que desplazarte.' },
    { question: '¿Ofrecen soporte después de la compra?', answer: 'Por supuesto. Brindamos soporte técnico continuo tras cada servicio.' },
    { question: '¿Qué métodos de pago aceptan?', answer: 'Aceptamos múltiples métodos de pago. Escríbenos y te asesoramos.' },
    { question: '¿Cuánto tarda la activación?', answer: 'La mayoría de servicios se activan el mismo día de la compra.' },
  ];
  await prisma.faq.createMany({ data: faqs.map((f, i) => ({ ...f, order: i, active: true })) });
  log(`   ✓ ${faqs.length} preguntas frecuentes`);

  // ---------------- Logos (marcas / partners) ----------------
  await prisma.logo.deleteMany();
  const logos = [
    { name: 'Microsoft', image: '/brands/windows-11.svg' },
    { name: 'Adobe', image: '/brands/adobe-cc.svg' },
    { name: 'Netflix', image: '/brands/netflix.svg' },
    { name: 'Canva', image: '/brands/canva.svg' },
    { name: 'Spotify', image: '/brands/spotify.svg' },
    { name: 'Dropbox', image: '/brands/dropbox.svg' },
  ];
  await prisma.logo.createMany({
    data: logos.map((l, i) => ({ name: l.name, image: l.image, order: i, active: true })),
  });
  log(`   ✓ ${logos.length} logos`);

  // ---------------- Redes sociales ----------------
  await prisma.socialLink.deleteMany();
  await prisma.socialLink.createMany({
    data: [
      { platform: 'WhatsApp', url: 'https://wa.me/584225200631', icon: 'MessageCircle', order: 0, active: true },
      { platform: 'Instagram', url: 'https://instagram.com/', icon: 'Instagram', order: 1, active: true },
      { platform: 'Facebook', url: 'https://facebook.com/', icon: 'Facebook', order: 2, active: true },
      { platform: 'TikTok', url: 'https://tiktok.com/', icon: 'Music2', order: 3, active: true },
    ],
  });
  log('   ✓ Redes sociales');

  // ---------------- Información de contacto ----------------
  await prisma.contactInfo.deleteMany();
  await prisma.contactInfo.createMany({
    data: [
      { label: 'WhatsApp', value: '+58 4225200631', icon: 'Phone', type: 'whatsapp', order: 0, active: true },
      { label: 'Horario', value: 'Lun a Sáb, 9:00 - 20:00', icon: 'Clock', type: 'hours', order: 1, active: true },
    ],
  });
  log('   ✓ Información de contacto');

  // ---------------- Banners ----------------
  await prisma.banner.deleteMany();
  await prisma.banner.create({
    data: {
      title: '¿Necesitas una licencia hoy mismo?',
      subtitle: 'Escríbenos y actívala en minutos con instalación remota incluida.',
      link: '#contacto',
      position: 'home',
      order: 0,
      active: true,
    },
  });
  log('   ✓ Banners');

  // ---------------- SEO ----------------
  await prisma.seo.deleteMany();
  await prisma.seo.upsert({
    where: { page: 'home' },
    update: {},
    create: {
      page: 'home',
      title: 'Nathan Quevedo | Software Original, Licencias y Suscripciones Premium',
      description:
        'Licencias originales de Microsoft, Office, Adobe, streaming premium, VPN, antivirus y almacenamiento en la nube. Instalación remota y soporte técnico garantizado.',
      keywords:
        'licencias, software original, windows, office, adobe, streaming, netflix, vpn, antivirus, instalación remota, soporte técnico, Nathan Quevedo',
    },
  });
  const pageSeo = [
    {
      page: 'servicios',
      title: 'Servicios: streaming, licencias y soporte',
      description:
        'Plataformas de streaming premium, licencias de software original, nube, seguridad y soporte técnico remoto con garantía.',
    },
    {
      page: 'proyectos',
      title: 'Proyectos y casos de estudio',
      description: 'Casos de estudio de Nathan Quevedo: el reto de cada cliente, la solución y los resultados.',
    },
    {
      page: 'sobre-mi',
      title: 'Sobre Nathan Quevedo',
      description: 'Quién es Nathan Quevedo y cómo trabaja: servicios digitales, streaming, licencias y soporte remoto.',
    },
    {
      page: 'contacto',
      title: 'Contacto y cotizaciones',
      description: 'Escríbeme por WhatsApp o con el formulario y te preparo una cotización a medida.',
    },
  ];
  for (const p of pageSeo) {
    await prisma.seo.upsert({ where: { page: p.page }, update: {}, create: p });
  }
  log('   ✓ SEO');
}

/** ¿La base de datos necesita preparación (no hay tablas o no hay admin)? */
async function needsSetup(prisma) {
  try {
    const n = await prisma.user.count();
    return n === 0;
  } catch {
    return true; // la tabla no existe todavía
  }
}

/**
 * Auto-arranque para app.js: si la BD está vacía, la prepara sola.
 * No hace NADA si ya tiene contenido (seguro ante reinicios).
 */
async function autoBootstrap(log = console.log) {
  // 0) Asegura que la BASE DE DATOS (esquema MySQL) exista.
  const dbRes = await ensureDatabaseExists(log);
  if (!dbRes.ok) {
    return { ok: false, error: new Error(dbRes.message) };
  }

  const prisma = new PrismaClient();
  try {
    // Siempre aplica migraciones pendientes (instalaciones existentes que se
    // actualizan). No toca datos.
    await ensureSchema(prisma, log);
    if (!(await needsSetup(prisma))) {
      return { ok: true, action: 'skip' };
    }
    log('🗄️  Base de datos vacía: preparándola automáticamente...');
    await seedContent(prisma, log);
    log('✅ Base de datos lista.');
    return { ok: true, action: 'created' };
  } catch (e) {
    return { ok: false, error: e };
  } finally {
    await prisma.$disconnect();
  }
}

/** Ejecución manual completa (crea tablas + recarga contenido). */
async function runCli() {
  console.log('🗄️  Verificando la base de datos...');
  const dbRes = await ensureDatabaseExists();
  if (!dbRes.ok) {
    console.error('❌ ' + dbRes.message);
    process.exitCode = 1;
    return;
  }
  const prisma = new PrismaClient();
  try {
    console.log('🗄️  Preparando tablas...');
    await ensureSchema(prisma);
    console.log('🌱 Sembrando contenido...');
    await seedContent(prisma);
    console.log('✅ Base de datos lista.');
  } finally {
    await prisma.$disconnect();
  }
}

module.exports = { ensureDatabaseExists, ensureSchema, seedContent, needsSetup, autoBootstrap };

// Si se ejecuta directamente (node scripts/setup-db.cjs o npm run db:setup)
if (require.main === module) {
  runCli().catch((e) => {
    console.error('❌ Error preparando la base de datos:', e);
    process.exitCode = 1;
  });
}
