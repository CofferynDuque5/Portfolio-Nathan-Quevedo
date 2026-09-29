import { prisma } from './prisma';
import { prepareProject, PROJECT_STATUSES } from './projects';
import { preparePost, POST_STATUSES } from './posts';
import { prepareTestimonial } from './testimonials';

/**
 * Registro central de recursos administrables.
 *
 * Cada entrada describe cómo un módulo del panel se conecta con su modelo de
 * Prisma. Esto permite un único controlador CRUD genérico que sirve a todos los
 * módulos (Servicios, Categorías, Plataformas, Licencias, FAQ, etc.) y facilita
 * añadir nuevas secciones en el futuro: basta con registrar el modelo aquí.
 */
export interface ResourceConfig {
  /** Delegado de Prisma (prisma.service, prisma.category, ...) */
  model: any;
  /** Campos de texto sobre los que se aplica la búsqueda */
  searchable: string[];
  /** Orden por defecto en los listados */
  defaultOrderBy: Record<string, 'asc' | 'desc'>;
  /** Campos numéricos/normalizados que deben convertirse a Int */
  intFields?: string[];
  /** Campos booleanos */
  boolFields?: string[];
  /** ¿Expone un endpoint público? (para el sitio) */
  public?: boolean;
  /** Relaciones a incluir en las respuestas */
  include?: Record<string, boolean>;
  /** ¿Tiene columna `active` para activar/desactivar? */
  hasActive?: boolean;
  /** Filtros exactos admitidos en el listado (?campo=valor) y sus valores válidos. */
  filterable?: Record<string, readonly string[]>;
  /** Validación / normalización propia del recurso antes de guardar. */
  prepare?: (data: Record<string, any>) => Record<string, any>;
}

export const resources: Record<string, ResourceConfig> = {
  heroSlides: {
    model: prisma.heroSlide,
    searchable: ['title', 'subtitle', 'highlight'],
    defaultOrderBy: { order: 'asc' },
    intFields: ['order'],
    boolFields: ['active'],
    public: true,
    hasActive: true,
  },
  categories: {
    model: prisma.category,
    searchable: ['name', 'slug', 'description'],
    defaultOrderBy: { order: 'asc' },
    intFields: ['order'],
    boolFields: ['active'],
    public: true,
    hasActive: true,
  },
  services: {
    model: prisma.service,
    searchable: ['title', 'slug', 'shortDesc', 'description'],
    defaultOrderBy: { order: 'asc' },
    intFields: ['order', 'categoryId'],
    boolFields: ['active', 'featured'],
    public: true,
    include: { category: true },
    hasActive: true,
  },
  projects: {
    model: prisma.project,
    searchable: ['title', 'slug', 'client', 'summary', 'tags'],
    defaultOrderBy: { updatedAt: 'desc' },
    intFields: ['order', 'categoryId'],
    boolFields: ['featured'],
    // Sin endpoint público genérico: el sitio usa /public/projects, que solo
    // devuelve proyectos PUBLICADOS.
    public: false,
    include: { category: true },
    filterable: { status: PROJECT_STATUSES },
    prepare: prepareProject,
  },
  posts: {
    model: prisma.post,
    searchable: ['title', 'slug', 'excerpt', 'tags'],
    defaultOrderBy: { updatedAt: 'desc' },
    intFields: ['categoryId'],
    // Sin endpoint público genérico: el sitio usa /public/posts, que solo
    // devuelve artículos PUBLICADOS.
    public: false,
    include: { category: true },
    filterable: { status: POST_STATUSES },
    prepare: preparePost,
  },
  platforms: {
    model: prisma.platform,
    searchable: ['name', 'slug', 'description'],
    defaultOrderBy: { order: 'asc' },
    intFields: ['order'],
    boolFields: ['active'],
    public: true,
    hasActive: true,
  },
  licenses: {
    model: prisma.license,
    searchable: ['name', 'slug', 'type', 'description'],
    defaultOrderBy: { order: 'asc' },
    intFields: ['order'],
    boolFields: ['active'],
    public: true,
    hasActive: true,
  },
  faqs: {
    model: prisma.faq,
    searchable: ['question', 'answer', 'category'],
    defaultOrderBy: { order: 'asc' },
    intFields: ['order'],
    boolFields: ['active'],
    public: true,
    hasActive: true,
  },
  testimonials: {
    model: prisma.testimonial,
    searchable: ['name', 'role', 'quote'],
    defaultOrderBy: { order: 'asc' },
    intFields: ['order', 'rating'],
    boolFields: ['active'],
    public: true,
    hasActive: true,
    prepare: prepareTestimonial,
  },
  gallery: {
    model: prisma.galleryItem,
    searchable: ['title', 'description', 'category'],
    defaultOrderBy: { order: 'asc' },
    intFields: ['order'],
    boolFields: ['active'],
    public: true,
    hasActive: true,
  },
  banners: {
    model: prisma.banner,
    searchable: ['title', 'subtitle', 'position'],
    defaultOrderBy: { order: 'asc' },
    intFields: ['order'],
    boolFields: ['active'],
    public: true,
    hasActive: true,
  },
  logos: {
    model: prisma.logo,
    searchable: ['name'],
    defaultOrderBy: { order: 'asc' },
    intFields: ['order'],
    boolFields: ['active'],
    public: true,
    hasActive: true,
  },
  socialLinks: {
    model: prisma.socialLink,
    searchable: ['platform', 'url'],
    defaultOrderBy: { order: 'asc' },
    intFields: ['order'],
    boolFields: ['active'],
    public: true,
    hasActive: true,
  },
  contactInfo: {
    model: prisma.contactInfo,
    searchable: ['label', 'value', 'type'],
    defaultOrderBy: { order: 'asc' },
    intFields: ['order'],
    boolFields: ['active'],
    public: true,
    hasActive: true,
  },
  seo: {
    model: prisma.seo,
    searchable: ['page', 'title', 'description'],
    defaultOrderBy: { page: 'asc' },
    boolFields: ['noindex'],
    public: false,
  },
  settings: {
    model: prisma.setting,
    searchable: ['key', 'label', 'group'],
    defaultOrderBy: { key: 'asc' },
    public: false,
  },
  media: {
    model: prisma.mediaFile,
    searchable: ['filename', 'originalName', 'folder'],
    defaultOrderBy: { createdAt: 'desc' },
    intFields: ['size', 'width', 'height'],
    public: false,
  },
  messages: {
    model: prisma.contactMessage,
    searchable: ['name', 'email', 'subject', 'message'],
    defaultOrderBy: { createdAt: 'desc' },
    boolFields: ['read'],
    public: false,
  },
  users: {
    model: prisma.user,
    searchable: ['name', 'email'],
    defaultOrderBy: { createdAt: 'desc' },
    boolFields: ['active'],
    public: false,
    hasActive: true,
  },
};

export function getResource(name: string): ResourceConfig | null {
  return resources[name] ?? null;
}

/**
 * Normaliza los tipos de un payload según la configuración del recurso
 * (convierte a Int / Boolean cuando corresponde).
 */
export function normalizePayload(config: ResourceConfig, data: Record<string, any>) {
  const out: Record<string, any> = { ...data };
  for (const field of config.intFields ?? []) {
    if (out[field] !== undefined && out[field] !== null && out[field] !== '') {
      out[field] = parseInt(out[field], 10);
    } else if (out[field] === '') {
      out[field] = null;
    }
  }
  for (const field of config.boolFields ?? []) {
    if (out[field] !== undefined) {
      out[field] = out[field] === true || out[field] === 'true' || out[field] === 1;
    }
  }
  // Nunca permitir sobreescribir campos internos.
  delete out.id;
  delete out.createdAt;
  delete out.updatedAt;
  // Las relaciones incluidas en las respuestas (ej: `category`) vuelven en el
  // payload al editar; se guardan por su clave foránea, no como objeto.
  for (const rel of Object.keys(config.include ?? {})) delete out[rel];
  return config.prepare ? config.prepare(out) : out;
}
