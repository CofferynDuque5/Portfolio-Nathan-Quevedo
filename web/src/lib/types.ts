export interface HeroSlide {
  id: number;
  title: string;
  subtitle?: string | null;
  highlight?: string | null;
  ctaText?: string | null;
  ctaLink?: string | null;
  image?: string | null;
  order: number;
  active: boolean;
}

export interface Category {
  id: number;
  name: string;
  slug: string;
  description?: string | null;
  icon?: string | null;
  order: number;
  active: boolean;
}

export interface Service {
  id: number;
  title: string;
  slug: string;
  shortDesc?: string | null;
  description?: string | null;
  icon?: string | null;
  image?: string | null;
  price?: string | null;
  ctaText?: string | null;
  ctaLink?: string | null;
  featured: boolean;
  order: number;
  active: boolean;
  categoryId?: number | null;
  category?: Category | null;
}

export interface Platform {
  id: number;
  name: string;
  slug: string;
  description?: string | null;
  logo?: string | null;
  url?: string | null;
  price?: string | null;
  order: number;
  active: boolean;
}

export interface License {
  id: number;
  name: string;
  slug: string;
  type?: string | null;
  description?: string | null;
  image?: string | null;
  price?: string | null;
  features?: string | null;
  order: number;
  active: boolean;
}

export interface Faq {
  id: number;
  question: string;
  answer: string;
  category?: string | null;
  order: number;
  active: boolean;
}

export interface Testimonial {
  id: number;
  name: string;
  role?: string | null;
  quote: string;
  rating?: number | null;
  avatar?: string | null;
  order: number;
  active: boolean;
}

export interface GalleryItem {
  id: number;
  title: string;
  description?: string | null;
  image: string;
  category?: string | null;
  order: number;
  active: boolean;
}

export interface Banner {
  id: number;
  title: string;
  subtitle?: string | null;
  image?: string | null;
  link?: string | null;
  position?: string | null;
  order: number;
  active: boolean;
}

export interface Logo {
  id: number;
  name: string;
  image: string;
  url?: string | null;
  order: number;
  active: boolean;
}

export interface SocialLink {
  id: number;
  platform: string;
  url: string;
  icon?: string | null;
  order: number;
  active: boolean;
}

export interface ContactInfo {
  id: number;
  label: string;
  value: string;
  icon?: string | null;
  type?: string | null;
  order: number;
  active: boolean;
}

export interface MediaFile {
  id: number;
  filename: string;
  originalName: string;
  url: string;
  path: string;
  mimeType: string;
  size: number;
  width?: number | null;
  height?: number | null;
  folder: string;
  createdAt: string;
}

export type ProjectStatus = 'DRAFT' | 'PUBLISHED';

/** Categoría resumida que acompaña a cada proyecto. */
export type ProjectCategory = Pick<Category, 'id' | 'name' | 'slug' | 'icon'>;

/** Proyecto tal como aparece en listados y tarjetas. */
export interface ProjectSummary {
  id: number;
  title: string;
  slug: string;
  client?: string | null;
  year?: string | null;
  summary?: string | null;
  coverImage?: string | null;
  tags?: string | null;
  featured: boolean;
  publishedAt?: string | null;
  updatedAt: string;
  category?: ProjectCategory | null;
}

/** Caso de estudio completo. */
export interface Project extends ProjectSummary {
  challenge?: string | null;
  solution?: string | null;
  results?: string | null;
  gallery?: string | null;
  url?: string | null;
  status: ProjectStatus;
  order: number;
  seoTitle?: string | null;
  seoDescription?: string | null;
  categoryId?: number | null;
}

export interface ProjectLink {
  slug: string;
  title: string;
}

/** Artículo del blog tal como aparece en el listado. */
export interface PostSummary {
  id: number;
  title: string;
  slug: string;
  excerpt?: string | null;
  coverImage?: string | null;
  tags?: string | null;
  publishedAt?: string | null;
  updatedAt: string;
  /** Lo calcula la API en el sitio público; en el panel se calcula al vuelo. */
  readingMinutes?: number;
  category?: ProjectCategory | null;
}

/** Artículo completo. */
export interface Post extends PostSummary {
  content?: string | null;
  status: ProjectStatus;
  seoTitle?: string | null;
  seoDescription?: string | null;
  categoryId?: number | null;
}

export interface PostLink {
  slug: string;
  title: string;
}

export interface SiteContent {
  heroSlides: HeroSlide[];
  categories: Category[];
  services: Service[];
  platforms: Platform[];
  licenses: License[];
  faqs: Faq[];
  gallery: GalleryItem[];
  banners: Banner[];
  logos: Logo[];
  socialLinks: SocialLink[];
  contactInfo: ContactInfo[];
  projects: ProjectSummary[];
  testimonials: Testimonial[];
  settings: Record<string, string>;
}
