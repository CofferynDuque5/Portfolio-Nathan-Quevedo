import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  DEFAULT_LOCALE,
  LOCALES,
  languageAlternates,
  localizedPath,
  parseLocalizedPath,
  switchLocalePath,
} from '../../web/src/i18n/config';

test('el español no lleva prefijo', () => {
  assert.equal(DEFAULT_LOCALE, 'es');
  assert.equal(localizedPath('/servicios', 'es'), '/servicios');
  assert.equal(localizedPath('/', 'es'), '/');
});

test('inglés: prefijo /en y segmentos traducidos', () => {
  assert.equal(localizedPath('/', 'en'), '/en');
  assert.equal(localizedPath('/servicios', 'en'), '/en/services');
  assert.equal(localizedPath('/proyectos/mi-caso', 'en'), '/en/projects/mi-caso');
  assert.equal(localizedPath('/sobre-mi', 'en'), '/en/about');
  assert.equal(localizedPath('/contacto', 'en'), '/en/contact');
});

test('conserva anclas y parámetros; no toca anclas sueltas ni URLs externas', () => {
  assert.equal(localizedPath('/servicios#licencias', 'en'), '/en/services#licencias');
  assert.equal(localizedPath('/proyectos?categoria=nube', 'en'), '/en/projects?categoria=nube');
  assert.equal(localizedPath('#contacto', 'en'), '#contacto');
  assert.equal(localizedPath('https://wa.me/1', 'en'), 'https://wa.me/1');
});

test('parseLocalizedPath es el inverso de localizedPath', () => {
  for (const path of ['/', '/servicios', '/proyectos/x-y', '/sobre-mi', '/contacto']) {
    for (const locale of LOCALES) {
      const parsed = parseLocalizedPath(localizedPath(path, locale));
      assert.deepEqual(parsed, { locale, basePath: path, canonical: true }, `${locale} ${path}`);
    }
  }
});

test('un segmento en español bajo /en no es canónico (se redirige)', () => {
  assert.deepEqual(parseLocalizedPath('/en/servicios'), { locale: 'en', basePath: '/servicios', canonical: false });
  // Rutas sin traducción conocida pasan tal cual.
  assert.deepEqual(parseLocalizedPath('/en/otra'), { locale: 'en', basePath: '/otra', canonical: true });
  // /es no es un prefijo: el español va sin prefijo.
  assert.equal(parseLocalizedPath('/es/servicios').locale, 'es');
});

test('el selector de idioma lleva a la misma página', () => {
  assert.equal(switchLocalePath('/proyectos/abc', 'en'), '/en/projects/abc');
  assert.equal(switchLocalePath('/en/projects/abc', 'es'), '/proyectos/abc');
  assert.equal(switchLocalePath('/en', 'es'), '/');
});

test('hreflang: todos los idiomas y x-default en español', () => {
  assert.deepEqual(languageAlternates('/servicios'), {
    es: '/servicios',
    en: '/en/services',
    'x-default': '/servicios',
  });
});
