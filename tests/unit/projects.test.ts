import { test } from 'node:test';
import assert from 'node:assert/strict';
import { prepareProject, slugify } from '../../server/src/lib/projects';

test('slugify quita acentos y símbolos', () => {
  assert.equal(slugify('Caso de Éxito: Streaming 4K'), 'caso-de-exito-streaming-4k');
  assert.equal(slugify('  --Hola  Mundo--  '), 'hola-mundo');
});

test('genera el slug a partir del título y vacía los opcionales', () => {
  const out = prepareProject({ title: ' Migración a la nube ', slug: '', client: '', summary: '  ' });
  assert.equal(out.title, 'Migración a la nube');
  assert.equal(out.slug, 'migracion-a-la-nube');
  assert.equal(out.client, null);
  assert.equal(out.summary, null);
});

test('rechaza slugs, URLs y estados inválidos', () => {
  assert.throws(() => prepareProject({ title: 'x', slug: 'Con Espacios' }), /slug/);
  assert.throws(() => prepareProject({ title: 'x', url: 'javascript:alert(1)' }), /URL/);
  assert.throws(() => prepareProject({ title: 'x', status: 'ARCHIVED' }), /Estado/);
  assert.throws(() => prepareProject({ title: '' }), /título/);
});

test('al publicar sin fecha se fija la fecha actual', () => {
  const out = prepareProject({ title: 'x', status: 'PUBLISHED' });
  assert.ok(out.publishedAt instanceof Date);
  const kept = prepareProject({ title: 'x', status: 'PUBLISHED', publishedAt: '2026-01-15' });
  assert.equal(kept.publishedAt.toISOString().slice(0, 10), '2026-01-15');
});
