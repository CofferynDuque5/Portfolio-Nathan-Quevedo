import { test } from 'node:test';
import assert from 'node:assert/strict';
import { prepareTestimonial } from '../../server/src/lib/testimonials';
import { initials } from '../../web/src/lib/initials';

test('testimonios: recorta textos y vacía los opcionales', () => {
  const out = prepareTestimonial({ name: ' Ana ', role: '', quote: ' Muy rápido. ', avatar: '', rating: null });
  assert.deepEqual(out, { name: 'Ana', role: null, quote: 'Muy rápido.', avatar: null, rating: null });
});

test('testimonios: estrellas de 1 a 5 o ninguna', () => {
  assert.equal(prepareTestimonial({ rating: 5 }).rating, 5);
  assert.equal(prepareTestimonial({ rating: NaN }).rating, null);
  for (const bad of [0, 6, 4.5]) assert.throws(() => prepareTestimonial({ rating: bad }), /1 a 5/);
});

test('testimonios: nombre y texto obligatorios, texto con límite', () => {
  assert.throws(() => prepareTestimonial({ name: '  ', quote: 'x' }), /nombre/);
  assert.throws(() => prepareTestimonial({ name: 'Ana', quote: '' }), /testimonio/);
  assert.throws(() => prepareTestimonial({ name: 'Ana', quote: 'a'.repeat(1001) }), /1000/);
});

test('iniciales cuando no hay foto', () => {
  assert.equal(initials('María José Pérez'), 'MP');
  assert.equal(initials('ana'), 'A');
  assert.equal(initials('[Ejemplo] Cliente A'), 'EA');
  assert.equal(initials('  '), '');
});
