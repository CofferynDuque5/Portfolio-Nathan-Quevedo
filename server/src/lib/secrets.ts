import crypto from 'crypto';

/** Huellas (SHA-256) de claves publicadas: nunca deben usarse. */
const LEAKED_SECRETS = new Set([
  '4102e3be9e065053d6cd4b9b95f71a0cf11b987e19ce990e270317b5cdcd66e1', // la que traía .env.cpanel
]);
/** Valores de ejemplo de la documentación. */
const PLACEHOLDER_SECRETS = new Set(['dev-secret-change-me', 'pon-aqui-cualquier-clave-larga-1234567890']);

/** true si la clave de sesiones falta, es corta, es de ejemplo o está publicada. */
export function isUnsafeSecret(secret: string | undefined): boolean {
  if (!secret || secret.length < 32 || PLACEHOLDER_SECRETS.has(secret)) return true;
  return LEAKED_SECRETS.has(crypto.createHash('sha256').update(secret).digest('hex'));
}
