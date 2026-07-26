/**
 * Definición declarativa de cada módulo del panel.
 * Una sola configuración describe las columnas de la tabla y los campos del
 * formulario, de modo que un componente genérico sirve a los 16 módulos.
 * Añadir una sección nueva = añadir una entrada aquí.
 */

export type FieldType =
  | 'text'
  | 'textarea'
  | 'number'
  | 'boolean'
  | 'image'
  | 'select'
  | 'password';

export interface FieldDef {
  name: string;
  label: string;
  type: FieldType;
  required?: boolean;
  placeholder?: string;
  help?: string;
  options?: { value: string; label: string }[];
  full?: boolean; // ocupa todo el ancho del formulario
}

export interface ColumnDef {
  key: string;
  label: string;
  type?: 'text' | 'image' | 'boolean' | 'badge';
}

export interface ResourceDef {
  key: string; // nombre del recurso en la API
  label: string; // nombre visible
  singular: string;
  icon: string; // icono lucide
  group: string; // agrupación en el sidebar
  columns: ColumnDef[];
  fields: FieldDef[];
  hasActive?: boolean;
  searchable?: boolean;
}

const orderField: FieldDef = { name: 'order', label: 'Orden', type: 'number', placeholder: '0' };
const activeField: FieldDef = { name: 'active', label: 'Activo', type: 'boolean' };

export const RESOURCES: Record<string, ResourceDef> = {
  heroSlides: {
    key: 'heroSlides',
    label: 'Hero',
    singular: 'Slide',
    icon: 'LayoutTemplate',
    group: 'Contenido',
    hasActive: true,
    searchable: true,
    columns: [
      { key: 'title', label: 'Título' },
      { key: 'highlight', label: 'Resaltado' },
      { key: 'order', label: 'Orden' },
      { key: 'active', label: 'Estado', type: 'boolean' },
    ],
    fields: [
      { name: 'title', label: 'Título', type: 'text', required: true, full: true },
      { name: 'highlight', label: 'Texto resaltado', type: 'text' },
      { name: 'subtitle', label: 'Subtítulo', type: 'textarea', full: true },
      { name: 'ctaText', label: 'Texto del botón', type: 'text' },
      { name: 'ctaLink', label: 'Enlace del botón', type: 'text' },
      { name: 'image', label: 'Imagen', type: 'image', full: true },
      orderField,
      activeField,
    ],
  },
  categories: {
    key: 'categories',
    label: 'Categorías',
    singular: 'Categoría',
    icon: 'FolderTree',
    group: 'Contenido',
    hasActive: true,
    searchable: true,
    columns: [
      { key: 'name', label: 'Nombre' },
      { key: 'slug', label: 'Slug' },
      { key: 'order', label: 'Orden' },
      { key: 'active', label: 'Estado', type: 'boolean' },
    ],
    fields: [
      { name: 'name', label: 'Nombre', type: 'text', required: true },
      { name: 'slug', label: 'Slug', type: 'text', required: true, help: 'URL amigable, ej: streaming' },
      { name: 'icon', label: 'Icono (Lucide)', type: 'text', placeholder: 'Play, KeyRound...' },
      { name: 'description', label: 'Descripción', type: 'textarea', full: true },
      orderField,
      activeField,
    ],
  },
  services: {
    key: 'services',
    label: 'Servicios',
    singular: 'Servicio',
    icon: 'Briefcase',
    group: 'Contenido',
    hasActive: true,
    searchable: true,
    columns: [
      { key: 'title', label: 'Título' },
      { key: 'featured', label: 'Destacado', type: 'boolean' },
      { key: 'order', label: 'Orden' },
      { key: 'active', label: 'Estado', type: 'boolean' },
    ],
    fields: [
      { name: 'title', label: 'Título', type: 'text', required: true },
      { name: 'slug', label: 'Slug', type: 'text', required: true },
      { name: 'icon', label: 'Icono (Lucide)', type: 'text', placeholder: 'Play, ShieldCheck...' },
      { name: 'shortDesc', label: 'Descripción corta', type: 'textarea', full: true },
      { name: 'description', label: 'Descripción completa', type: 'textarea', full: true },
      { name: 'image', label: 'Imagen', type: 'image', full: true },
      { name: 'price', label: 'Precio (texto)', type: 'text' },
      { name: 'ctaText', label: 'Texto del botón', type: 'text' },
      { name: 'ctaLink', label: 'Enlace del botón', type: 'text' },
      { name: 'featured', label: 'Destacado', type: 'boolean' },
      orderField,
      activeField,
    ],
  },
  platforms: {
    key: 'platforms',
    label: 'Plataformas',
    singular: 'Plataforma',
    icon: 'MonitorPlay',
    group: 'Catálogo',
    hasActive: true,
    searchable: true,
    columns: [
      { key: 'logo', label: 'Logo', type: 'image' },
      { key: 'name', label: 'Nombre' },
      { key: 'price', label: 'Precio' },
      { key: 'active', label: 'Estado', type: 'boolean' },
    ],
    fields: [
      { name: 'name', label: 'Nombre', type: 'text', required: true },
      { name: 'slug', label: 'Slug', type: 'text', required: true },
      { name: 'logo', label: 'Logo', type: 'image', full: true },
      { name: 'description', label: 'Descripción', type: 'textarea', full: true },
      { name: 'url', label: 'URL', type: 'text' },
      { name: 'price', label: 'Precio (texto)', type: 'text' },
      orderField,
      activeField,
    ],
  },
  licenses: {
    key: 'licenses',
    label: 'Licencias',
    singular: 'Licencia',
    icon: 'KeyRound',
    group: 'Catálogo',
    hasActive: true,
    searchable: true,
    columns: [
      { key: 'name', label: 'Nombre' },
      { key: 'type', label: 'Tipo', type: 'badge' },
      { key: 'price', label: 'Precio' },
      { key: 'active', label: 'Estado', type: 'boolean' },
    ],
    fields: [
      { name: 'name', label: 'Nombre', type: 'text', required: true },
      { name: 'slug', label: 'Slug', type: 'text', required: true },
      { name: 'type', label: 'Tipo', type: 'text', placeholder: 'Sistema Operativo, Diseño...' },
      { name: 'image', label: 'Imagen', type: 'image', full: true },
      { name: 'description', label: 'Descripción', type: 'textarea', full: true },
      { name: 'features', label: 'Características', type: 'textarea', full: true },
      { name: 'price', label: 'Precio (texto)', type: 'text' },
      orderField,
      activeField,
    ],
  },
  faqs: {
    key: 'faqs',
    label: 'FAQ',
    singular: 'Pregunta',
    icon: 'HelpCircle',
    group: 'Contenido',
    hasActive: true,
    searchable: true,
    columns: [
      { key: 'question', label: 'Pregunta' },
      { key: 'order', label: 'Orden' },
      { key: 'active', label: 'Estado', type: 'boolean' },
    ],
    fields: [
      { name: 'question', label: 'Pregunta', type: 'text', required: true, full: true },
      { name: 'answer', label: 'Respuesta', type: 'textarea', required: true, full: true },
      { name: 'category', label: 'Categoría', type: 'text' },
      orderField,
      activeField,
    ],
  },
  gallery: {
    key: 'gallery',
    label: 'Galería',
    singular: 'Elemento',
    icon: 'Images',
    group: 'Contenido',
    hasActive: true,
    searchable: true,
    columns: [
      { key: 'image', label: 'Imagen', type: 'image' },
      { key: 'title', label: 'Título' },
      { key: 'category', label: 'Categoría', type: 'badge' },
      { key: 'active', label: 'Estado', type: 'boolean' },
    ],
    fields: [
      { name: 'title', label: 'Título', type: 'text', required: true },
      { name: 'image', label: 'Imagen', type: 'image', required: true, full: true },
      { name: 'description', label: 'Descripción', type: 'textarea', full: true },
      { name: 'category', label: 'Categoría', type: 'text' },
      orderField,
      activeField,
    ],
  },
  banners: {
    key: 'banners',
    label: 'Banners',
    singular: 'Banner',
    icon: 'GalleryHorizontalEnd',
    group: 'Contenido',
    hasActive: true,
    searchable: true,
    columns: [
      { key: 'title', label: 'Título' },
      { key: 'position', label: 'Posición', type: 'badge' },
      { key: 'active', label: 'Estado', type: 'boolean' },
    ],
    fields: [
      { name: 'title', label: 'Título', type: 'text', required: true, full: true },
      { name: 'subtitle', label: 'Subtítulo', type: 'textarea', full: true },
      { name: 'image', label: 'Imagen', type: 'image', full: true },
      { name: 'link', label: 'Enlace', type: 'text' },
      { name: 'position', label: 'Posición', type: 'text', placeholder: 'home' },
      orderField,
      activeField,
    ],
  },
  logos: {
    key: 'logos',
    label: 'Logos',
    singular: 'Logo',
    icon: 'Shapes',
    group: 'Catálogo',
    hasActive: true,
    searchable: true,
    columns: [
      { key: 'image', label: 'Logo', type: 'image' },
      { key: 'name', label: 'Nombre' },
      { key: 'active', label: 'Estado', type: 'boolean' },
    ],
    fields: [
      { name: 'name', label: 'Nombre', type: 'text', required: true },
      { name: 'image', label: 'Imagen', type: 'image', required: true, full: true },
      { name: 'url', label: 'URL', type: 'text' },
      orderField,
      activeField,
    ],
  },
  socialLinks: {
    key: 'socialLinks',
    label: 'Redes sociales',
    singular: 'Red social',
    icon: 'Share2',
    group: 'Configuración',
    hasActive: true,
    searchable: true,
    columns: [
      { key: 'platform', label: 'Plataforma' },
      { key: 'url', label: 'URL' },
      { key: 'active', label: 'Estado', type: 'boolean' },
    ],
    fields: [
      { name: 'platform', label: 'Plataforma', type: 'text', required: true },
      { name: 'url', label: 'URL', type: 'text', required: true, full: true },
      { name: 'icon', label: 'Icono (Lucide)', type: 'text', placeholder: 'Instagram, Facebook...' },
      orderField,
      activeField,
    ],
  },
  contactInfo: {
    key: 'contactInfo',
    label: 'Contacto',
    singular: 'Dato de contacto',
    icon: 'Contact',
    group: 'Configuración',
    hasActive: true,
    searchable: true,
    columns: [
      { key: 'label', label: 'Etiqueta' },
      { key: 'value', label: 'Valor' },
      { key: 'type', label: 'Tipo', type: 'badge' },
      { key: 'active', label: 'Estado', type: 'boolean' },
    ],
    fields: [
      { name: 'label', label: 'Etiqueta', type: 'text', required: true },
      { name: 'value', label: 'Valor', type: 'text', required: true, full: true },
      { name: 'icon', label: 'Icono (Lucide)', type: 'text', placeholder: 'Mail, Phone...' },
      {
        name: 'type',
        label: 'Tipo',
        type: 'select',
        options: [
          { value: 'text', label: 'Texto' },
          { value: 'email', label: 'Email' },
          { value: 'phone', label: 'Teléfono' },
          { value: 'whatsapp', label: 'WhatsApp' },
          { value: 'address', label: 'Dirección' },
          { value: 'hours', label: 'Horario' },
        ],
      },
      orderField,
      activeField,
    ],
  },
  seo: {
    key: 'seo',
    label: 'SEO',
    singular: 'Página SEO',
    icon: 'Search',
    group: 'Configuración',
    searchable: true,
    columns: [
      { key: 'page', label: 'Página' },
      { key: 'title', label: 'Título' },
      { key: 'noindex', label: 'Noindex', type: 'boolean' },
    ],
    fields: [
      { name: 'page', label: 'Página (clave)', type: 'text', required: true, help: 'ej: home' },
      { name: 'title', label: 'Título SEO', type: 'text', required: true, full: true },
      { name: 'description', label: 'Meta descripción', type: 'textarea', required: true, full: true },
      { name: 'keywords', label: 'Palabras clave', type: 'textarea', full: true },
      { name: 'ogImage', label: 'Imagen Open Graph', type: 'image', full: true },
      { name: 'canonical', label: 'URL canónica', type: 'text' },
      { name: 'noindex', label: 'No indexar', type: 'boolean' },
    ],
  },
  settings: {
    key: 'settings',
    label: 'Configuración general',
    singular: 'Ajuste',
    icon: 'Settings',
    group: 'Configuración',
    searchable: true,
    columns: [
      { key: 'label', label: 'Ajuste' },
      { key: 'key', label: 'Clave' },
      { key: 'value', label: 'Valor' },
      { key: 'group', label: 'Grupo', type: 'badge' },
    ],
    fields: [
      { name: 'key', label: 'Clave', type: 'text', required: true, help: 'ej: siteName' },
      { name: 'label', label: 'Etiqueta', type: 'text' },
      { name: 'value', label: 'Valor', type: 'textarea', full: true },
      { name: 'group', label: 'Grupo', type: 'text', placeholder: 'general' },
      {
        name: 'type',
        label: 'Tipo de campo',
        type: 'select',
        options: [
          { value: 'text', label: 'Texto' },
          { value: 'textarea', label: 'Texto largo' },
          { value: 'color', label: 'Color' },
          { value: 'image', label: 'Imagen' },
          { value: 'boolean', label: 'Booleano' },
        ],
      },
    ],
  },
  users: {
    key: 'users',
    label: 'Usuarios',
    singular: 'Usuario',
    icon: 'Users',
    group: 'Sistema',
    hasActive: true,
    searchable: true,
    columns: [
      { key: 'name', label: 'Nombre' },
      { key: 'email', label: 'Email' },
      { key: 'role', label: 'Rol', type: 'badge' },
      { key: 'active', label: 'Estado', type: 'boolean' },
    ],
    fields: [
      { name: 'name', label: 'Nombre', type: 'text', required: true },
      { name: 'email', label: 'Email', type: 'text', required: true },
      { name: 'password', label: 'Contraseña', type: 'password', help: 'Déjalo vacío para no cambiarla.' },
      {
        name: 'role',
        label: 'Rol',
        type: 'select',
        options: [
          { value: 'ADMIN', label: 'Administrador' },
          { value: 'EDITOR', label: 'Editor' },
        ],
      },
      activeField,
    ],
  },
};

export const RESOURCE_GROUPS = ['Contenido', 'Catálogo', 'Configuración', 'Sistema'];

export function getResourceDef(key: string): ResourceDef | null {
  return RESOURCES[key] ?? null;
}
