import { describe, test } from 'node:test';
import assert from 'node:assert/strict';
import { jsonLdHtml } from '../../web/src/lib/jsonld';
import { isUnsafeSecret } from '../../server/src/lib/secrets';

describe('datos estructurados (JSON-LD)', () => {
  const data = { name: '</script><script>alert(1)</script>', text: 'a & b > c\u2028d' };

  test('un texto del panel no puede cerrar la etiqueta <script>', () => {
    const html = jsonLdHtml(data);
    assert.doesNotMatch(html, /[<>&\u2028\u2029]/);
  });

  test('sigue siendo el mismo JSON', () => {
    assert.deepEqual(JSON.parse(jsonLdHtml(data)), data);
  });
});

describe('clave de las sesiones', () => {
  test('se rechazan claves vacías, cortas o de ejemplo', () => {
    assert.equal(isUnsafeSecret(undefined), true);
    assert.equal(isUnsafeSecret(''), true);
    assert.equal(isUnsafeSecret('corta'), true);
    assert.equal(isUnsafeSecret('dev-secret-change-me'), true);
    assert.equal(isUnsafeSecret('pon-aqui-cualquier-clave-larga-1234567890'), true);
  });

  test('una clave larga y propia es válida', () => {
    assert.equal(isUnsafeSecret('f3a9c1d27b64e8a05c9e1b73d4f2a6c8e0b5d7f1a3c9e2b4'), false);
  });
});
