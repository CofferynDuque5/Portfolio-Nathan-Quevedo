'use client';

import { OPEN_CONSENT } from '@/lib/analytics';
import { useI18n } from '@/i18n/client';

/** Reabre el aviso de privacidad para cambiar la elección. */
export default function PrivacyPreferencesButton({ className }: { className?: string }) {
  const { t } = useI18n();
  return (
    <button type="button" onClick={() => window.dispatchEvent(new Event(OPEN_CONSENT))} className={className}>
      {t.footer.privacy}
    </button>
  );
}
