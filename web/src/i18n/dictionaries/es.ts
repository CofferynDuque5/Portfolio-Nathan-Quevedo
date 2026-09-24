/**
 * Textos de la interfaz del sitio público en español.
 * El contenido administrable (servicios, proyectos, FAQ…) vive en la base de
 * datos; aquí solo están los textos fijos de la interfaz.
 */
export const es = {
  nav: {
    services: 'Servicios',
    streaming: 'Streaming',
    projects: 'Proyectos',
    about: 'Sobre mí',
    faq: 'FAQ',
    contact: 'Contactar',
    menu: 'Menú',
    language: 'Idioma',
  },
  footer: {
    defaultTagline: 'Servicios y licencias digitales premium con soporte garantizado.',
    links: 'Enlaces',
    services: 'Servicios',
    projects: 'Proyectos',
    about: 'Sobre mí',
    licenses: 'Licencias',
    process: 'Proceso',
    faq: 'Preguntas frecuentes',
    contact: 'Contacto',
    contactForm: 'Formulario de contacto',
    admin: 'Panel administrativo',
    privacy: 'Preferencias de privacidad',
    rights: 'Todos los derechos reservados.',
    builtWith: 'Hecho con Next.js · TailwindCSS · Prisma',
  },
  common: {
    whatsappAria: 'Contactar por WhatsApp',
    quoteWhatsapp: 'Cotizar por WhatsApp',
    writeMessage: 'Escribir un mensaje',
    requestWhatsapp: 'Solicitar por WhatsApp',
    request: 'Solicitar',
    featured: 'Destacado',
    seeAll: 'Ver todos',
    contactNow: 'Contactar ahora',
    contact: 'Contactar',
    seeServices: 'Ver servicios',
    tags: 'Etiquetas',
    toggleTheme: 'Cambiar tema',
  },
  whatsapp: {
    default: 'Hola, me interesa un servicio.',
    quote: 'Hola, me gustaría solicitar una cotización.',
    service: (name: string) => `Hola, me interesa el servicio: ${name}`,
    license: (name: string) => `Hola, me interesa la licencia de ${name}`,
    project: (title: string) => `Hola, vi el proyecto "${title}" y me gustaría cotizar algo similar.`,
  },
  hero: {
    badge: 'Servicios digitales premium',
    trust: ['Licencias 100% originales', 'Activación rápida', 'Soporte garantizado'],
  },
  logos: { title: 'Trabajamos con las mejores marcas' },
  about: {
    eyebrow: 'Sobre mí',
    titleFor: (name: string) => `Sobre ${name}`,
    commitment:
      'Mi compromiso es ofrecerte tecnología de confianza, con procesos claros y atención cercana. Trabajo con transparencia para que contratar servicios digitales sea simple y seguro.',
    stats: {
      statClients: 'Clientes satisfechos',
      statOriginal: 'Software original',
      statSupport: 'Soporte disponible',
      statProducts: 'Productos y licencias',
    },
  },
  services: {
    eyebrow: 'Servicios',
    title: 'Todo lo que necesitas, en un solo lugar',
    lead: 'Soluciones digitales premium con instalación remota y soporte incluido.',
    seeAll: 'Ver todos los servicios',
  },
  platforms: {
    eyebrow: 'Streaming premium',
    title: 'Las mejores plataformas de entretenimiento',
    lead: 'Suscripciones premium con activación inmediata y garantía.',
  },
  licenses: {
    eyebrow: 'Licencias originales',
    title: 'Software con licencia auténtica',
    lead: 'Windows, Office, Adobe y mucho más, con garantía y activación verificada.',
    guarantee: 'Original y garantizado',
  },
  process: {
    eyebrow: 'Cómo trabajo',
    defaultTitle: 'Proceso de trabajo',
    step: (n: number) => `Paso ${n}`,
    steps: [
      { title: 'Escríbenos', desc: 'Cuéntanos qué servicio o licencia necesitas.' },
      { title: 'Confirma tu pedido', desc: 'Te asesoramos y eliges el método de pago.' },
      { title: 'Instalación remota', desc: 'Activamos y configuramos todo por ti.' },
      { title: 'Soporte continuo', desc: 'Quedamos disponibles para lo que necesites.' },
    ],
  },
  faq: { eyebrow: 'Preguntas frecuentes', title: 'Resolvemos tus dudas' },
  contact: {
    eyebrow: 'Contacto',
    title: 'Hablemos de tu proyecto',
    lead: 'Cuéntanos qué necesitas y te responderemos lo antes posible. Estamos aquí para ayudarte.',
    whatsappButton: 'Escribir por WhatsApp',
    name: 'Nombre',
    namePlaceholder: 'Tu nombre',
    nameRequired: 'El nombre es requerido.',
    email: 'Correo',
    emailPlaceholder: 'tu@correo.com',
    emailRequired: 'El correo es requerido.',
    emailInvalid: 'Correo inválido.',
    phone: 'Teléfono',
    subject: 'Asunto',
    optional: 'Opcional',
    message: 'Mensaje',
    messagePlaceholder: '¿En qué podemos ayudarte?',
    messageRequired: 'El mensaje es requerido.',
    messageShort: 'El mensaje es demasiado corto.',
    send: 'Enviar mensaje',
    sending: 'Enviando…',
    sendError: 'No se pudo enviar el mensaje.',
    unexpectedError: 'Error inesperado.',
    sentTitle: '¡Mensaje enviado!',
    sentText: 'Gracias por escribirnos. Te contactaremos muy pronto.',
    sendAnother: 'Enviar otro mensaje',
  },
  consent: {
    title: 'Tu privacidad, primero',
    text: '¿Nos permites medir de forma anónima cómo se usa el sitio? Nos ayuda a mejorarlo. No usamos cookies de terceros ni publicidad.',
    details: [
      'Se registran las páginas vistas, el tipo de dispositivo y navegador, y de qué sitio llegas.',
      'También los clics en WhatsApp y los formularios enviados.',
      'No guardamos tu IP. Se usa un identificador aleatorio en tu navegador.',
      'Los datos se borran a los 13 meses. Puedes cambiar tu elección en el pie de página.',
    ],
    accept: 'Aceptar',
    reject: 'Rechazar',
    more: 'Qué medimos',
  },
  projects: {
    eyebrow: 'Proyectos',
    homeTitle: 'Casos de estudio',
    homeLead: 'Trabajos reales, explicados de principio a fin.',
    filterLabel: 'Filtrar por categoría',
    all: 'Todos',
    shown: (n: number) => `${n} proyecto(s) mostrados`,
    emptyTitle: 'Muy pronto, nuevos casos de estudio',
    emptyText: 'Estamos documentando los proyectos más recientes. Mientras tanto, cuéntanos qué necesitas.',
    emptyCta: 'Solicitar cotización',
  },
  caseStudy: {
    back: 'Todos los proyectos',
    client: 'Cliente',
    year: 'Año',
    category: 'Categoría',
    published: 'Publicado',
    challenge: 'El reto',
    solution: 'La solución',
    results: 'Resultados',
    gallery: 'Galería del proyecto',
    live: 'Ver proyecto en vivo',
    ctaTitle: '¿Buscas un resultado similar?',
    otherProjects: 'Otros proyectos',
    prev: 'Anterior',
    next: 'Siguiente',
  },
  cta: {
    title: '¿Hablamos de tu proyecto?',
    text: 'Cuéntame qué necesitas y te preparo una propuesta a medida.',
  },
  pages: {
    home: {
      metaTitle: 'Nathan Quevedo | Software y Licencias Premium',
      metaDescription:
        'Licencias originales, streaming premium, VPN, antivirus y almacenamiento en la nube con instalación remota y soporte técnico.',
      ogAlt: 'Nathan Quevedo — Software y Licencias Premium',
      ogTitle: 'Software original y suscripciones premium',
      ogSubtitle: 'Licencias, streaming, seguridad y nube · Instalación remota y soporte garantizado',
    },
    services: {
      metaTitle: 'Servicios: streaming, licencias y soporte',
      metaDescription:
        'Plataformas de streaming premium, licencias de software original, nube, seguridad y soporte técnico remoto con garantía.',
      eyebrow: 'Servicios',
      title: 'Streaming, software y soporte, con garantía',
      lead: 'Activación de plataformas de streaming premium, licencias originales y asistencia técnica remota. Elige lo que necesitas y te lo dejo funcionando.',
      categoriesLabel: 'Categorías de servicios',
      others: 'Otros servicios',
      count: (n: number) => `${n} ${n === 1 ? 'servicio' : 'servicios'}`,
      ctaTitle: '¿No ves lo que buscas?',
      ctaText: 'Escríbeme y te preparo una cotización a medida, sin compromiso.',
    },
    projects: {
      metaTitle: 'Proyectos y casos de estudio',
      metaDescription:
        'Casos de estudio de Nathan Quevedo: proyectos de streaming, licencias, soporte técnico y soluciones digitales.',
      eyebrow: 'Portfolio',
      title: 'Proyectos que hablan por sí mismos',
      lead: 'Una selección de trabajos: el reto de cada cliente, cómo lo resolví y qué resultados obtuvimos.',
      notFound: 'Proyecto no encontrado',
    },
    about: {
      metaTitle: 'Sobre Nathan Quevedo',
      metaDescription:
        'Quién es Nathan Quevedo y cómo trabaja: servicios digitales, streaming, licencias originales y soporte técnico remoto.',
      eyebrow: 'Sobre mí',
      areasTitle: 'En qué te puedo ayudar',
    },
    contact: {
      metaTitle: 'Contacto y cotizaciones',
      metaDescription:
        'Escríbeme por WhatsApp o con el formulario y te preparo una cotización para streaming, licencias o soporte técnico.',
    },
  },
  notFound: {
    title: 'Página no encontrada',
    text: 'La página que buscas no existe o fue movida.',
    back: 'Volver al inicio',
  },
};

/**
 * Forma que debe cumplir cualquier otro idioma: mismas claves, textos
 * libres (y las funciones con los mismos parámetros).
 */
type Widen<T> = T extends string
  ? string
  : T extends (...args: infer A) => string
    ? (...args: A) => string
    : T extends readonly (infer U)[]
      ? Widen<U>[]
      : { [K in keyof T]: Widen<T[K]> };

export type Dictionary = Widen<typeof es>;
