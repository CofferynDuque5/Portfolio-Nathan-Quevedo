import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '../.env') });
dotenv.config();

const prisma = new PrismaClient();

const admin = {
  name: process.env.ADMIN_NAME ?? 'Nathan Quevedo',
  email: process.env.ADMIN_EMAIL ?? 'admin@nathanquevedo.com',
  password: process.env.ADMIN_PASSWORD ?? 'Admin1234!',
};

async function main() {
  console.log('🌱 Sembrando base de datos...');

  // ---------------- Usuario administrador ----------------
  const passwordHash = await bcrypt.hash(admin.password, 10);
  await prisma.user.upsert({
    where: { email: admin.email },
    update: { name: admin.name, passwordHash, active: true },
    create: { name: admin.name, email: admin.email, passwordHash, role: 'ADMIN' },
  });
  console.log(`   ✓ Admin: ${admin.email}`);

  // ---------------- Configuración general ----------------
  const settings: { key: string; value: string; group: string; label: string; type: string }[] = [
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
  ];
  for (const s of settings) {
    await prisma.setting.upsert({ where: { key: s.key }, update: { value: s.value, label: s.label, group: s.group, type: s.type }, create: s });
  }
  console.log(`   ✓ ${settings.length} ajustes generales`);

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
  console.log('   ✓ Hero');

  // ---------------- Categorías ----------------
  await prisma.category.deleteMany();
  const categoryData = [
    { name: 'Streaming', slug: 'streaming', icon: 'Play', description: 'Plataformas de entretenimiento premium', order: 0 },
    { name: 'Licencias', slug: 'licencias', icon: 'KeyRound', description: 'Software original con licencia', order: 1 },
    { name: 'Nube', slug: 'nube', icon: 'Cloud', description: 'Almacenamiento y productividad en la nube', order: 2 },
    { name: 'Seguridad', slug: 'seguridad', icon: 'ShieldCheck', description: 'Protección digital y privacidad', order: 3 },
    { name: 'Soporte', slug: 'soporte', icon: 'Headset', description: 'Instalación remota y soporte técnico', order: 4 },
  ];
  for (const c of categoryData) await prisma.category.create({ data: c });
  const categories = await prisma.category.findMany();
  const catId = (slug: string) => categories.find((c) => c.slug === slug)?.id ?? null;
  console.log('   ✓ Categorías');

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
      image: `/services/${s.slug}.svg`, // ilustración por defecto (editable en el panel)
      featured: s.featured ?? false,
      categoryId: catId(s.category),
      ctaText: 'Solicitar por WhatsApp',
      ctaLink: '#contacto',
      order: i,
      active: true,
    })),
  });
  console.log(`   ✓ ${services.length} servicios`);

  // ---------------- Plataformas de streaming ----------------
  await prisma.platform.deleteMany();
  const platforms = ['Netflix', 'Disney+', 'HBO Max', 'Prime Video', 'Spotify', 'YouTube Premium', 'Paramount+', 'Crunchyroll'];
  await prisma.platform.createMany({
    data: platforms.map((name, i) => ({
      name,
      slug: name.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
      description: `Suscripción premium a ${name}.`,
      order: i,
      active: true,
    })),
  });
  console.log(`   ✓ ${platforms.length} plataformas`);

  // ---------------- Licencias ----------------
  await prisma.license.deleteMany();
  const licenses = [
    { name: 'Windows 11 Pro', type: 'Sistema Operativo' },
    { name: 'Microsoft Office 2021', type: 'Ofimática' },
    { name: 'Microsoft 365', type: 'Suscripción' },
    { name: 'Adobe Creative Cloud', type: 'Diseño' },
    { name: 'Canva Pro', type: 'Diseño' },
    { name: 'CapCut Pro', type: 'Edición de video' },
    { name: 'ChatGPT Plus', type: 'Inteligencia Artificial' },
    { name: 'Google One', type: 'Almacenamiento' },
    { name: 'OneDrive', type: 'Almacenamiento' },
    { name: 'Dropbox', type: 'Almacenamiento' },
    { name: 'VPN Premium', type: 'Seguridad' },
    { name: 'Antivirus Premium', type: 'Seguridad' },
  ];
  await prisma.license.createMany({
    data: licenses.map((l, i) => ({
      name: l.name,
      slug: l.name.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
      type: l.type,
      description: `Licencia original de ${l.name}.`,
      order: i,
      active: true,
    })),
  });
  console.log(`   ✓ ${licenses.length} licencias`);

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
  console.log(`   ✓ ${faqs.length} preguntas frecuentes`);

  // ---------------- Logos ----------------
  await prisma.logo.deleteMany();
  const logos = ['Microsoft', 'Adobe', 'Netflix', 'Google', 'Spotify', 'Canva'];
  await prisma.logo.createMany({
    data: logos.map((name, i) => ({ name, image: `/uploads/general/placeholder-logo.svg`, order: i, active: true })),
  });
  console.log(`   ✓ ${logos.length} logos`);

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
  console.log('   ✓ Redes sociales');

  // ---------------- Información de contacto ----------------
  await prisma.contactInfo.deleteMany();
  await prisma.contactInfo.createMany({
    data: [
      { label: 'WhatsApp', value: '+58 4225200631', icon: 'Phone', type: 'whatsapp', order: 0, active: true },
      { label: 'Horario', value: 'Lun a Sáb, 9:00 - 20:00', icon: 'Clock', type: 'hours', order: 1, active: true },
    ],
  });
  console.log('   ✓ Información de contacto');

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
  console.log('   ✓ Banners');

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
  console.log('   ✓ SEO');

  console.log('✅ Seed completado.');
}

main()
  .catch((e) => {
    console.error('❌ Error en el seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
