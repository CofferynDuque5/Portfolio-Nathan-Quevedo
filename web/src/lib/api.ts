import { Project, ProjectLink, ProjectSummary, SiteContent } from './types';
import { fallbackContent } from './fallback';

/**
 * URL base de la API.
 * - En el cliente: usa NEXT_PUBLIC_API_URL; si está vacío, usa rutas
 *   relativas ("/api/..."), ideal para el despliegue de un solo proceso
 *   (web y API en el mismo dominio).
 * - En el servidor (SSR): usa API_URL o NEXT_PUBLIC_API_URL; si están vacíos,
 *   apunta al propio proceso local (127.0.0.1:PORT).
 */
const LOCAL_API = `http://127.0.0.1:${process.env.PORT || '3000'}`;
export const API_URL =
  typeof window === 'undefined'
    ? process.env.API_URL || process.env.NEXT_PUBLIC_API_URL || LOCAL_API
    : process.env.NEXT_PUBLIC_API_URL || '';

export const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';

/**
 * Obtiene todo el contenido del sitio desde la API (Server Component).
 * Si la API falla, devuelve contenido de respaldo para no romper el render.
 */
export async function getSiteContent(): Promise<SiteContent> {
  try {
    const res = await fetch(`${API_URL}/api/public/content`, {
      // Siempre datos frescos: los cambios del panel se ven al instante.
      cache: 'no-store',
    });
    if (!res.ok) throw new Error(`API respondió ${res.status}`);
    const data = (await res.json()) as SiteContent;
    return { ...fallbackContent, ...data, settings: { ...fallbackContent.settings, ...data.settings } };
  } catch {
    return fallbackContent;
  }
}

export interface SeoData {
  page: string;
  title: string;
  description: string;
  keywords?: string | null;
  ogImage?: string | null;
  canonical?: string | null;
  noindex: boolean;
}

/** Obtiene los metadatos SEO de una página concreta. */
export async function getSeo(page: string): Promise<SeoData | null> {
  try {
    const res = await fetch(`${API_URL}/api/public/seo/${page}`, { cache: 'no-store' });
    if (!res.ok) return null;
    const json = await res.json();
    return json.data ?? null;
  } catch {
    return null;
  }
}

/** Proyectos publicados (portfolio). Lista vacía si la API no responde. */
export async function getProjects(): Promise<ProjectSummary[]> {
  try {
    const res = await fetch(`${API_URL}/api/public/projects`, { cache: 'no-store' });
    if (!res.ok) return [];
    const json = await res.json();
    return json.data ?? [];
  } catch {
    return [];
  }
}

export interface ProjectPage {
  data: Project;
  prev: ProjectLink | null;
  next: ProjectLink | null;
}

/** Caso de estudio publicado por slug; null si no existe o es un borrador. */
export async function getProject(slug: string): Promise<ProjectPage | null> {
  try {
    const res = await fetch(`${API_URL}/api/public/projects/${encodeURIComponent(slug)}`, {
      cache: 'no-store',
    });
    if (!res.ok) return null;
    return (await res.json()) as ProjectPage;
  } catch {
    return null;
  }
}
