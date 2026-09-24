'use client';

import { OPEN_CONSENT } from '@/lib/analytics';

/** Reabre el aviso de privacidad para cambiar la elección. */
export default function PrivacyPreferencesButton({ className }: { className?: string }) {
  return (
    <button type="button" onClick={() => window.dispatchEvent(new Event(OPEN_CONSENT))} className={className}>
      Preferencias de privacidad
    </button>
  );
}
