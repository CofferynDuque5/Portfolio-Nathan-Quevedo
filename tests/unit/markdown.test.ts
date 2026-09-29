import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  markdownToText,
  parseInline,
  parseMarkdown,
  readingMinutes,
  safeHref,
  tableOfContents,
} from '../../web/src/lib/markdown';
import { preparePost, readingMinutes as serverMinutes } from '../../server/src/lib/posts';

test('títulos, párrafos, listas, citas, código, imágenes y separadores', () => {
  const blocks = parseMarkdown(
    [
      '## Qué necesitas',
      'Primera línea',
      'segunda línea',
      '',
      '- uno',
      '- dos',
      '',
      '1. primero',
      '2. segundo',
      '> Una cita',
      '```bash',
      'echo **no es negrita**',
      '```',
      '![Captura](/uploads/a.webp)',
      '---',
    ].join('\n')
  );
  assert.deepEqual(
    blocks.map((b) => b.type),
    ['heading', 'paragraph', 'list', 'list', 'quote', 'code', 'image', 'hr']
  );
  assert.deepEqual(blocks[0], { type: 'heading', level: 2, id: 'que-necesitas', children: [{ type: 'text', value: 'Qué necesitas' }] });
  assert.deepEqual(blocks[1], {
    type: 'paragraph',
    children: [{ type: 'text', value: 'Primera línea' }, { type: 'br' }, { type: 'text', value: 'segunda línea' }],
  });
  assert.equal(blocks[2].type === 'list' && !blocks[2].ordered && blocks[2].items.length, 2);
  assert.equal(blocks[3].type === 'list' && blocks[3].ordered, true);
  assert.deepEqual(blocks[5], { type: 'code', value: 'echo **no es negrita**', lang: 'bash' });
  assert.deepEqual(blocks[6], { type: 'image', src: '/uploads/a.webp', alt: 'Captura' });
});

test('negrita, cursiva, código y enlaces en línea', () => {
  assert.deepEqual(parseInline('Hola **mundo** y *todos* con `npm i` en [la web](https://example.com).'), [
    { type: 'text', value: 'Hola ' },
    { type: 'strong', children: [{ type: 'text', value: 'mundo' }] },
    { type: 'text', value: ' y ' },
    { type: 'em', children: [{ type: 'text', value: 'todos' }] },
    { type: 'text', value: ' con ' },
    { type: 'code', value: 'npm i' },
    { type: 'text', value: ' en ' },
    { type: 'link', href: 'https://example.com', external: true, children: [{ type: 'text', value: 'la web' }] },
    { type: 'text', value: '.' },
  ]);
  // Los guiones bajos dentro de palabras no son cursiva.
  assert.deepEqual(parseInline('mi_archivo_final.txt'), [{ type: 'text', value: 'mi_archivo_final.txt' }]);
  // Enlaces internos: sin abrir pestaña nueva.
  assert.deepEqual(parseInline('[contacto](/contacto)'), [
    { type: 'link', href: '/contacto', external: false, children: [{ type: 'text', value: 'contacto' }] },
  ]);
});

test('los enlaces e imágenes peligrosos se quedan en texto', () => {
  for (const bad of ['javascript:alert(1)', 'data:text/html,x', '//evil.example', 'vbscript:x', 'JaVaScRiPt:alert(1)']) {
    assert.equal(safeHref(bad), null, bad);
  }
  // Solo queda el texto del enlace (el último paréntesis sobra de la URL).
  assert.deepEqual(parseInline('[clic](javascript:alert(1))'), [{ type: 'text', value: 'clic)' }]);
  assert.deepEqual(parseMarkdown('![x](javascript:alert(1))').filter((b) => b.type === 'image'), []);
  // El HTML se trata como texto: nunca se interpreta.
  assert.deepEqual(parseMarkdown('<script>alert(1)</script>'), [
    { type: 'paragraph', children: [{ type: 'text', value: '<script>alert(1)</script>' }] },
  ]);
});

test('anclas únicas e índice de contenidos', () => {
  const blocks = parseMarkdown('## Paso\n\n## Paso\n\n### Detalle\n\n## ¿Y después?');
  assert.deepEqual(tableOfContents(blocks), [
    { id: 'paso', text: 'Paso' },
    { id: 'paso-2', text: 'Paso' },
    { id: 'y-despues', text: '¿Y después?' },
  ]);
});

test('texto plano y minutos de lectura', () => {
  assert.equal(markdownToText('## Hola\n\nUn **texto** con [enlace](https://x.y).'), 'Hola Un texto con enlace.');
  assert.equal(readingMinutes(''), 1);
  const long = Array(1000).fill('palabra').join(' ');
  assert.equal(readingMinutes(long), 5);
  assert.equal(serverMinutes(long), 5);
  assert.equal(serverMinutes('![img](/uploads/x.webp) ## **Hola** [a](https://b.c)'), 1);
});

test('artículos: slug automático, opcionales vacíos y fecha al publicar', () => {
  const out = preparePost({ title: ' ¿Cómo elegir una VPN? ', slug: '', excerpt: ' ', content: '' });
  assert.equal(out.slug, 'como-elegir-una-vpn');
  assert.equal(out.excerpt, null);
  assert.equal(out.content, null);
  assert.ok(preparePost({ title: 'x', status: 'PUBLISHED' }).publishedAt instanceof Date);
  assert.throws(() => preparePost({ title: 'x', slug: 'Mal Slug' }), /slug/);
  assert.throws(() => preparePost({ title: 'x', status: 'OTRO' }), /Estado/);
  assert.throws(() => preparePost({ title: 'x', content: 'a'.repeat(200_001) }), /largo/);
});
