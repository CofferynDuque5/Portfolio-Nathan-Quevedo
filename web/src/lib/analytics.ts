'use client';

import { API_URL } from '@/lib/api';

/**
 * Medición propia con consentimiento.
 * - Nada se envía hasta que el visitante acepta (o si activó
 *   "Global Privacy Control" / "Do Not Track").
 * - Identificadores aleatorios en localStorage (visitante) y
 *   sessionStorage (visita). No se usan cookies.
 */

export type Consent = 'granted' | 'denied';
export type TrackEvent = 'pageview' | 'whatsapp_click' | 'contact_submit';

const CONSENT_KEY = 'nq_consent';
const VISITOR_KEY = 'nq_vid';
const SESSION_KEY = 'nq_sid';
const SOURCE_KEY = 'nq_src';

/** Eventos del navegador para sincronizar el aviso y el medidor. */
export const CONSENT_CHANGED = 'nq:consent-changed';
export const OPEN_CONSENT = 'nq:open-consent';

function safe<T>(fn: () => T, fallback: T): T {
  try {
    return fn();
  } catch {
    return fallback;
  }
}

/** El navegador pide expresamente no ser rastreado. */
export function browserOptedOut(): boolean {
  if (typeof navigator === 'undefined') return false;
  const nav = navigator as Navigator & { globalPrivacyControl?: boolean };
  return nav.globalPrivacyControl === true || nav.doNotTrack === '1';
}

export function getConsent(): Consent | null {
  if (browserOptedOut()) return 'denied';
  const v = safe(() => localStorage.getItem(CONSENT_KEY), null);
  return v === 'granted' || v === 'denied' ? v : null;
}

export function setConsent(value: Consent) {
  safe(() => {
    localStorage.setItem(CONSENT_KEY, value);
    // Al retirar el consentimiento se borran los identificadores.
    if (value === 'denied') {
      localStorage.removeItem(VISITOR_KEY);
      sessionStorage.removeItem(SESSION_KEY);
      sessionStorage.removeItem(SOURCE_KEY);
    }
  }, undefined);
  window.dispatchEvent(new CustomEvent(CONSENT_CHANGED, { detail: value }));
}

function randomId(): string {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) return crypto.randomUUID();
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 12)}`;
}

function getOrCreate(storage: Storage, key: string): string {
  let id = storage.getItem(key);
  if (!id) {
    id = randomId();
    storage.setItem(key, id);
  }
  return id;
}

/**
 * Procedencia de la visita, calculada una sola vez por sesión:
 * utm_source si existe; si no, el dominio que enlazó; null = directo.
 */
function sessionSource(): string | null {
  const stored = sessionStorage.getItem(SOURCE_KEY);
  if (stored !== null) return stored || null;
  let source = new URLSearchParams(window.location.search).get('utm_source') || '';
  if (!source && document.referrer) {
    const host = safe(() => new URL(document.referrer).hostname, '');
    if (host && host !== window.location.hostname) source = host.replace(/^www\./, '');
  }
  source = source.trim().toLowerCase().slice(0, 100);
  sessionStorage.setItem(SOURCE_KEY, source);
  return source || null;
}

/** Envía un evento si hay consentimiento. Nunca lanza errores. */
export function track(type: TrackEvent, path = window.location.pathname) {
  if (getConsent() !== 'granted') return;
  safe(() => {
    const body = JSON.stringify({
      type,
      path,
      source: sessionSource(),
      visitorId: getOrCreate(localStorage, VISITOR_KEY),
      sessionId: getOrCreate(sessionStorage, SESSION_KEY),
    });
    fetch(`${API_URL}/api/public/track`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body,
      keepalive: true, // sobrevive a la navegación (clic en WhatsApp)
    }).catch(() => {});
  }, undefined);
}
