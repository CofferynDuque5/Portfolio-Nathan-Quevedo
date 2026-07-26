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
  settings: Record<string, string>;
}
