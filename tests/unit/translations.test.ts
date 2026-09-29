import { test } from 'node:test';
import assert from 'node:assert/strict';
import { parseLocale, translatableFields, TRANSLATABLE } from '../../server/src/lib/translations';
import { es } from '../../web/src/i18n/dictionaries/es';
import { LOCALES, DEFAULT_LOCALE } from '../../web/src/i18n/config';

test('solo se aceptan idiomas distintos del español', () => {
  assert.equal(parseLocale('en'), 'en');
  assert.equal(parseLocale('es'), null);
  assert.equal(parseLocale('fr'), null);
  assert.equal(parseLocale(undefined), null);
  assert.equal(parseLocale(['en']), null);
});

test('la API y el sitio conocen los mismos idiomas', () => {
  const siteExtra = LOCALES.filter((l) => l !== DEFAULT_LOCALE);
  for (const l of siteExtra) assert.equal(parseLocale(l), l);
});

test('en Configuración general solo se traducen los textos visibles', () => {
  assert.deepEqual(translatableFields('settings', { key: 'aboutText' }), ['value']);
  assert.deepEqual(translatableFields('settings', { key: 'whatsapp' }), []);
  assert.deepEqual(translatableFields('settings', { key: 'primaryColor' }), []);
});

test('no se traducen campos técnicos (slug, enlaces, imágenes, estado)', () => {
  const technical = ['slug', 'ctaLink', 'link', 'image', 'logo', 'coverImage', 'url', 'status', 'order', 'page'];
  for (const [resource, fields] of Object.entries(TRANSLATABLE)) {
    for (const f of technical) assert.ok(!fields.includes(f), `${resource}.${f}`);
  }
  assert.deepEqual(translatableFields('users'), []);
  assert.ok(es); // el diccionario carga sin errores
});
