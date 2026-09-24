import { test } from 'node:test';
import assert from 'node:assert/strict';
import { es } from '../../web/src/i18n/dictionaries/es';
import { en } from '../../web/src/i18n/dictionaries/en';

/** Recorre un diccionario y devuelve { ruta: valor } de cada hoja. */
function leaves(obj: unknown, prefix = ''): Record<string, unknown> {
  if (typeof obj !== 'object' || obj === null) return { [prefix]: obj };
  return Object.entries(obj).reduce<Record<string, unknown>>(
    (acc, [k, v]) => ({ ...acc, ...leaves(v, prefix ? `${prefix}.${k}` : k) }),
    {}
  );
}

const esLeaves = leaves(es);
const enLeaves = leaves(en);

test('inglés y español tienen exactamente las mismas claves', () => {
  assert.deepEqual(Object.keys(enLeaves).sort(), Object.keys(esLeaves).sort());
});

test('ningún texto está vacío', () => {
  for (const [lang, dict] of [['es', esLeaves], ['en', enLeaves]] as const) {
    for (const [key, value] of Object.entries(dict)) {
      if (typeof value === 'string') assert.ok(value.trim(), `${lang}.${key} vacío`);
    }
  }
});

test('las funciones reciben los mismos parámetros y devuelven texto', () => {
  for (const [key, value] of Object.entries(esLeaves)) {
    if (typeof value !== 'function') continue;
    const other = enLeaves[key];
    assert.equal(typeof other, 'function', key);
    assert.equal((other as Function).length, value.length, key);
    const sample = value.length ? ['X', 2].slice(0, value.length) : [];
    assert.equal(typeof (other as Function)(...sample), 'string', key);
  }
});

test('el inglés no se quedó en español por error', () => {
  // Textos que deben diferir (los nombres propios como "Streaming" pueden coincidir).
  for (const key of ['nav.services', 'contact.send', 'consent.accept', 'notFound.title', 'pages.services.title']) {
    assert.notEqual(enLeaves[key], esLeaves[key], key);
  }
});
