/**
 * Traducción al inglés del contenido base (el que crea setup-db.cjs).
 *
 * Solo traduce un campo si su texto en español sigue siendo el original del
 * contenido base (si ya lo editaste, no se toca) y si no tiene traducción.
 * El auto-arranque lo ejecuta una sola vez; la recarga manual del contenido
 * base (`node scripts/setup-db.cjs`) lo vuelve a ejecutar.
 */

const LOCALE = 'en';

const settings = {
  tagline: ['Servicios y Licencias Digitales Premium', 'Premium Digital Services and Licenses'],
  aboutTitle: ['Sobre Nathan Quevedo', 'About Nathan Quevedo'],
  aboutText: [
    'Especialista en soluciones digitales, licencias de software original y suscripciones premium. Ofrezco instalación remota, soporte técnico y asesoría para que aproveches al máximo tus herramientas tecnológicas, con total confianza y respaldo.',
    'Specialist in digital solutions, genuine software licenses and premium subscriptions. I offer remote installation, technical support and advice so you can get the most out of your technology tools, with complete confidence and backing.',
  ],
  processTitle: ['Proceso de trabajo', 'How it works'],
};

const heroSlides = [
  {
    title: ['Software original y suscripciones premium', 'Genuine software and premium subscriptions'],
    highlight: ['a un solo clic', 'just one click away'],
    subtitle: [
      'Licencias auténticas, plataformas de streaming y herramientas profesionales con instalación remota y soporte garantizado.',
      'Authentic licenses, streaming platforms and professional tools with remote installation and guaranteed support.',
    ],
    ctaText: ['Contactar ahora', 'Contact now'],
  },
  {
    title: ['Instalación remota y soporte técnico', 'Remote installation and technical support'],
    highlight: ['sin complicaciones', 'without the hassle'],
    subtitle: [
      'Configuramos tus licencias y aplicaciones de forma remota, rápida y segura.',
      'We set up your licenses and apps remotely, quickly and securely.',
    ],
    ctaText: ['Ver servicios', 'View services'],
  },
];

const categories = {
  streaming: { name: ['Streaming', 'Streaming'], description: ['Plataformas de entretenimiento premium', 'Premium entertainment platforms'] },
  licencias: { name: ['Licencias', 'Licenses'], description: ['Software original con licencia', 'Genuine licensed software'] },
  nube: { name: ['Nube', 'Cloud'], description: ['Almacenamiento y productividad en la nube', 'Cloud storage and productivity'] },
  seguridad: { name: ['Seguridad', 'Security'], description: ['Protección digital y privacidad', 'Digital protection and privacy'] },
  soporte: { name: ['Soporte', 'Support'], description: ['Instalación remota y soporte técnico', 'Remote installation and technical support'] },
};

const cta = ['Solicitar por WhatsApp', 'Request on WhatsApp'];
const services = {
  'streaming-premium': {
    title: ['Plataformas de Streaming Premium', 'Premium Streaming Platforms'],
    shortDesc: ['Netflix, Disney+, HBO, Prime Video y más.', 'Netflix, Disney+, HBO, Prime Video and more.'],
    description: ['Acceso a las mejores plataformas de streaming con garantía y soporte continuo.', 'Access to the best streaming platforms with a guarantee and ongoing support.'],
    ctaText: cta,
  },
  'instalacion-remota': {
    title: ['Instalación y Configuración Remota', 'Remote Installation and Setup'],
    shortDesc: ['Configuramos todo por ti, de forma remota.', 'We set everything up for you, remotely.'],
    description: ['Instalación y puesta a punto de tus licencias y aplicaciones sin que salgas de casa.', 'Installation and tuning of your licenses and apps without leaving home.'],
    ctaText: cta,
  },
  'licencias-software': {
    title: ['Licencias de Software Original', 'Genuine Software Licenses'],
    shortDesc: ['Claves auténticas y verificadas.', 'Authentic, verified keys.'],
    description: ['Licencias 100% originales para todo tipo de software profesional.', '100% genuine licenses for all kinds of professional software.'],
    ctaText: cta,
  },
  windows: {
    title: ['Licencias Microsoft Windows', 'Microsoft Windows Licenses'],
    shortDesc: ['Windows 10 y 11 Pro/Home.', 'Windows 10 and 11 Pro/Home.'],
    description: ['Activa tu Windows con licencias originales de por vida.', 'Activate your Windows with genuine lifetime licenses.'],
    ctaText: cta,
  },
  'office-365': {
    title: ['Microsoft Office y Microsoft 365', 'Microsoft Office and Microsoft 365'],
    shortDesc: ['Office 2021 y Microsoft 365.', 'Office 2021 and Microsoft 365.'],
    description: ['Word, Excel, PowerPoint y más, con licencia original.', 'Word, Excel, PowerPoint and more, with a genuine license.'],
    ctaText: cta,
  },
  suscripciones: {
    title: ['Suscripciones de Software', 'Software Subscriptions'],
    shortDesc: ['Adobe, Canva Pro, CapCut, ChatGPT.', 'Adobe, Canva Pro, CapCut, ChatGPT.'],
    description: ['Las mejores herramientas creativas y de IA por suscripción.', 'The best creative and AI tools by subscription.'],
    ctaText: cta,
  },
  'seguridad-digital': {
    title: ['Seguridad y Protección Digital', 'Digital Security and Protection'],
    shortDesc: ['Antivirus y VPN premium.', 'Premium antivirus and VPN.'],
    description: ['Protege tus dispositivos y tu privacidad con las mejores soluciones.', 'Protect your devices and your privacy with the best solutions.'],
    ctaText: cta,
  },
  nube: {
    title: ['Almacenamiento en la Nube', 'Cloud Storage'],
    shortDesc: ['Google One, OneDrive, Dropbox.', 'Google One, OneDrive, Dropbox.'],
    description: ['Amplía tu almacenamiento en la nube con planes premium.', 'Expand your cloud storage with premium plans.'],
    ctaText: cta,
  },
  'software-profesional': {
    title: ['Software Profesional y Empresarial', 'Professional and Business Software'],
    shortDesc: ['Soluciones para empresas.', 'Solutions for businesses.'],
    description: ['Software especializado para profesionales y empresas.', 'Specialized software for professionals and businesses.'],
    ctaText: cta,
  },
  'soporte-tecnico': {
    title: ['Soporte Técnico Remoto', 'Remote Technical Support'],
    shortDesc: ['Asistencia cuando la necesites.', 'Help whenever you need it.'],
    description: ['Soporte técnico remoto rápido y confiable.', 'Fast, reliable remote technical support.'],
    ctaText: cta,
  },
};

const licenseTypes = {
  'Sistema Operativo': 'Operating system',
  Ofimática: 'Office suite',
  Suscripción: 'Subscription',
  Diseño: 'Design',
  'Edición de video': 'Video editing',
  'Inteligencia Artificial': 'Artificial intelligence',
  Almacenamiento: 'Storage',
  Seguridad: 'Security',
};

const faqs = [
  [
    ['¿Las licencias son originales?', 'Are the licenses genuine?'],
    ['Sí, todas nuestras licencias son 100% originales y verificadas.', 'Yes, all our licenses are 100% genuine and verified.'],
  ],
  [
    ['¿Cómo se realiza la instalación?', 'How is the installation done?'],
    [
      'La instalación se realiza de forma remota, de manera rápida y segura, sin que tengas que desplazarte.',
      'Installation is done remotely, quickly and securely, without you having to go anywhere.',
    ],
  ],
  [
    ['¿Ofrecen soporte después de la compra?', 'Do you offer support after purchase?'],
    ['Por supuesto. Brindamos soporte técnico continuo tras cada servicio.', 'Of course. We provide ongoing technical support after every service.'],
  ],
  [
    ['¿Qué métodos de pago aceptan?', 'What payment methods do you accept?'],
    ['Aceptamos múltiples métodos de pago. Escríbenos y te asesoramos.', 'We accept multiple payment methods. Message us and we will advise you.'],
  ],
  [
    ['¿Cuánto tarda la activación?', 'How long does activation take?'],
    ['La mayoría de servicios se activan el mismo día de la compra.', 'Most services are activated on the same day of purchase.'],
  ],
];

const contactInfo = {
  hours: { label: ['Horario', 'Hours'], value: ['Lun a Sáb, 9:00 - 20:00', 'Mon to Sat, 9:00 - 20:00'] },
};

const banners = [
  {
    title: ['¿Necesitas una licencia hoy mismo?', 'Need a license today?'],
    subtitle: [
      'Escríbenos y actívala en minutos con instalación remota incluida.',
      'Message us and get it activated in minutes, remote installation included.',
    ],
  },
];

const seo = {
  home: {
    title: [
      'Nathan Quevedo | Software Original, Licencias y Suscripciones Premium',
      'Nathan Quevedo | Genuine Software, Licenses and Premium Subscriptions',
    ],
    description: [
      'Licencias originales de Microsoft, Office, Adobe, streaming premium, VPN, antivirus y almacenamiento en la nube. Instalación remota y soporte técnico garantizado.',
      'Genuine Microsoft, Office and Adobe licenses, premium streaming, VPN, antivirus and cloud storage. Remote installation and guaranteed technical support.',
    ],
    keywords: [
      'licencias, software original, windows, office, adobe, streaming, netflix, vpn, antivirus, instalación remota, soporte técnico, Nathan Quevedo',
      'licenses, genuine software, windows, office, adobe, streaming, netflix, vpn, antivirus, remote installation, technical support, Nathan Quevedo',
    ],
  },
  servicios: {
    title: ['Servicios: streaming, licencias y soporte', 'Services: streaming, licenses and support'],
    description: [
      'Plataformas de streaming premium, licencias de software original, nube, seguridad y soporte técnico remoto con garantía.',
      'Premium streaming platforms, genuine software licenses, cloud, security and remote technical support with a guarantee.',
    ],
  },
  proyectos: {
    title: ['Proyectos y casos de estudio', 'Projects and case studies'],
    description: [
      'Casos de estudio de Nathan Quevedo: el reto de cada cliente, la solución y los resultados.',
      "Case studies by Nathan Quevedo: each client's challenge, the solution and the results.",
    ],
  },
  blog: {
    title: ['Blog: guías y consejos de tecnología', 'Blog: tech guides and tips'],
    description: [
      'Guías prácticas sobre streaming, licencias de software, seguridad y soporte técnico.',
      'Practical guides on streaming, software licenses, security and technical support.',
    ],
  },
  'sobre-mi': {
    title: ['Sobre Nathan Quevedo', 'About Nathan Quevedo'],
    description: [
      'Quién es Nathan Quevedo y cómo trabaja: servicios digitales, streaming, licencias y soporte remoto.',
      'Meet Nathan Quevedo: digital services, streaming, licenses and remote support.',
    ],
  },
  contacto: {
    title: ['Contacto y cotizaciones', 'Contact and quotes'],
    description: [
      'Escríbeme por WhatsApp o con el formulario y te preparo una cotización a medida.',
      "Message me on WhatsApp or use the form and I'll prepare a tailored quote.",
    ],
  },
};

/** Pares [recurso, registro, { campo: [es, en] }] a partir del contenido actual. */
async function collect(prisma) {
  const out = [];
  const add = (resource, record, fields) => record && out.push([resource, record, fields]);

  for (const s of await prisma.setting.findMany({ where: { key: { in: Object.keys(settings) } } })) {
    add('settings', s, { value: settings[s.key] });
  }
  for (const h of heroSlides) {
    add('heroSlides', await prisma.heroSlide.findFirst({ where: { title: h.title[0] } }), h);
  }
  for (const c of await prisma.category.findMany({ where: { slug: { in: Object.keys(categories) } } })) {
    add('categories', c, categories[c.slug]);
  }
  for (const s of await prisma.service.findMany({ where: { slug: { in: Object.keys(services) } } })) {
    add('services', s, services[s.slug]);
  }
  for (const p of await prisma.platform.findMany()) {
    add('platforms', p, { description: [`Suscripción premium a ${p.name}.`, `Premium ${p.name} subscription.`] });
  }
  for (const l of await prisma.license.findMany()) {
    const fields = { description: [`Licencia original de ${l.name}.`, `Genuine ${l.name} license.`] };
    if (l.type && licenseTypes[l.type]) fields.type = [l.type, licenseTypes[l.type]];
    add('licenses', l, fields);
  }
  for (const [q, a] of faqs) {
    add('faqs', await prisma.faq.findFirst({ where: { question: q[0] } }), { question: q, answer: a });
  }
  for (const c of await prisma.contactInfo.findMany({ where: { type: { in: Object.keys(contactInfo) } } })) {
    add('contactInfo', c, contactInfo[c.type]);
  }
  for (const b of banners) {
    add('banners', await prisma.banner.findFirst({ where: { title: b.title[0] } }), b);
  }
  for (const s of await prisma.seo.findMany({ where: { page: { in: Object.keys(seo) } } })) {
    add('seo', s, seo[s.page]);
  }
  return out;
}

async function seedTranslations(prisma, log = console.log) {
  let created = 0;
  for (const [resource, record, fields] of await collect(prisma)) {
    for (const [field, [es, en]] of Object.entries(fields)) {
      if (record[field] !== es || es === en) continue; // editado por el usuario o igual en ambos idiomas
      const where = { locale_resource_recordId_field: { locale: LOCALE, resource, recordId: record.id, field } };
      if (await prisma.contentTranslation.findUnique({ where })) continue; // ya traducido
      await prisma.contentTranslation.create({
        data: { locale: LOCALE, resource, recordId: record.id, field, value: en },
      });
      created++;
    }
  }
  log(`   ✓ ${created} traducciones al inglés del contenido base`);
}

/**
 * Borra traducciones de registros que ya no existen (la recarga manual del
 * contenido base vuelve a crear los registros con otros ids).
 */
async function pruneTranslations(prisma) {
  const models = {
    heroSlides: prisma.heroSlide,
    categories: prisma.category,
    services: prisma.service,
    projects: prisma.project,
    platforms: prisma.platform,
    licenses: prisma.license,
    faqs: prisma.faq,
    banners: prisma.banner,
    contactInfo: prisma.contactInfo,
    seo: prisma.seo,
    settings: prisma.setting,
  };
  for (const [resource, model] of Object.entries(models)) {
    const ids = (await model.findMany({ select: { id: true } })).map((r) => r.id);
    await prisma.contentTranslation.deleteMany({ where: { resource, recordId: { notIn: ids.length ? ids : [0] } } });
  }
}

module.exports = { seedTranslations, pruneTranslations };
