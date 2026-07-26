import { SiteContent } from './types';

/**
 * Contenido de respaldo. Se usa cuando la API o la base de datos no están
 * disponibles (por ejemplo durante el primer build antes de sembrar la BD),
 * de modo que el sitio siempre renderiza sin errores.
 * En cuanto la API responde, este contenido se reemplaza por el real.
 */
export const fallbackContent: SiteContent = {
  heroSlides: [
    {
      id: 1,
      title: 'Software original y suscripciones premium',
      highlight: 'a un solo clic',
      subtitle:
        'Licencias auténticas, plataformas de streaming y herramientas profesionales con instalación remota y soporte garantizado.',
      ctaText: 'Contactar ahora',
      ctaLink: '#contacto',
      order: 0,
      active: true,
    },
  ],
  categories: [],
  services: [
    { id: 1, title: 'Plataformas de Streaming Premium', slug: 'streaming', icon: 'Play', shortDesc: 'Netflix, Disney+, HBO y más.', featured: true, order: 0, active: true },
    { id: 2, title: 'Instalación y Configuración Remota', slug: 'instalacion', icon: 'MonitorSmartphone', shortDesc: 'Configuramos todo por ti, de forma remota.', featured: true, order: 1, active: true },
    { id: 3, title: 'Licencias de Software Original', slug: 'licencias', icon: 'KeyRound', shortDesc: 'Claves auténticas y verificadas.', featured: true, order: 2, active: true },
    { id: 4, title: 'Microsoft Windows y Office', slug: 'microsoft', icon: 'Monitor', shortDesc: 'Windows 10/11 y Office 365 originales.', featured: false, order: 3, active: true },
    { id: 5, title: 'Seguridad y Protección Digital', slug: 'seguridad', icon: 'ShieldCheck', shortDesc: 'Antivirus y VPN premium.', featured: false, order: 4, active: true },
    { id: 6, title: 'Almacenamiento en la Nube', slug: 'nube', icon: 'Cloud', shortDesc: 'Google One, OneDrive, Dropbox.', featured: false, order: 5, active: true },
  ],
  platforms: [],
  licenses: [],
  faqs: [
    { id: 1, question: '¿Las licencias son originales?', answer: 'Sí, todas nuestras licencias son 100% originales y verificadas.', order: 0, active: true },
    { id: 2, question: '¿Cómo se realiza la instalación?', answer: 'De forma remota, rápida y segura, sin que tengas que desplazarte.', order: 1, active: true },
  ],
  gallery: [],
  banners: [],
  logos: [],
  socialLinks: [],
  contactInfo: [
    { id: 1, label: 'Email', value: 'contacto@nathanquevedo.com', icon: 'Mail', type: 'email', order: 0, active: true },
  ],
  settings: {
    siteName: 'Nathan Quevedo',
    tagline: 'Servicios y Licencias Digitales Premium',
    aboutTitle: 'Sobre Nathan Quevedo',
    aboutText:
      'Especialista en soluciones digitales, licencias de software original y suscripciones premium. Ofrezco instalación remota, soporte técnico y asesoría personalizada.',
  },
};
