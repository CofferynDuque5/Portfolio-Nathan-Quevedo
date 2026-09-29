import { test } from 'node:test';
import assert from 'node:assert/strict';
import { existsSync } from 'node:fs';
import path from 'node:path';

// eslint-disable-next-line @typescript-eslint/no-require-imports
const brands = require('../../scripts/brands.cjs');
const publicDir = path.resolve(__dirname, '../../web/public');

test('todos los logotipos del contenido base existen', () => {
  const files = [
    ...brands.PLATFORMS.map((p: { key: string }, i: number) => brands.platformData(p, i).logo),
    ...brands.LICENSES.map((l: { key: string }, i: number) => brands.licenseData(l, i).image),
    ...brands.LOGOS.map((l: { image: string }) => l.image),
    ...brands.OLD_LOGOS,
  ];
  for (const f of files) assert.ok(existsSync(path.join(publicDir, f)), `falta ${f}`);
});

test('la franja de marcas solo usa logotipos reales', () => {
  for (const l of brands.LOGOS) assert.match(l.image, /\.webp$/, l.name);
});

test('en una instalación existente cambia solo lo que sigue siendo provisional', async () => {
  const rows = {
    platform: [
      { id: 1, slug: 'netflix', logo: '/brands/netflix.svg', order: 0 },
      { id: 2, slug: 'disney-plus', logo: '/uploads/mi-logo.png', order: 1 },
      { id: 3, slug: 'vix', logo: '/uploads/vix.png', order: 2 },
    ],
    license: [{ id: 1, slug: 'windows-11', image: '/brands/windows-11.svg', order: 5 }],
    logo: brands.OLD_LOGOS.map((image: string, i: number) => ({ id: i + 1, image })),
  } as Record<string, Record<string, unknown>[]>;
  const match = (r: Record<string, unknown>, where: Record<string, unknown>) => Object.entries(where).every(([k, v]) => r[k] === v);
  const model = (name: string) => ({
    updateMany: async ({ where, data }: { where: Record<string, unknown>; data: Record<string, unknown> }) => {
      const hit = rows[name].filter((r) => match(r, where));
      hit.forEach((r) => Object.assign(r, data));
      return { count: hit.length };
    },
    findFirst: async () => [...rows[name]].sort((a, b) => (b.order as number) - (a.order as number))[0] ?? null,
    findUnique: async ({ where }: { where: Record<string, unknown> }) => rows[name].find((r) => match(r, where)) ?? null,
    findMany: async () => rows[name],
    create: async ({ data }: { data: Record<string, unknown> }) => {
      const row = { id: rows[name].length + 1, ...data };
      rows[name].push(row);
      return row;
    },
    deleteMany: async () => { rows[name] = []; },
    createMany: async ({ data }: { data: Record<string, unknown>[] }) => { rows[name].push(...data); },
  });
  const prisma = { platform: model('platform'), license: model('license'), logo: model('logo') };
  const translated: string[] = [];
  await brands.applyBrandUpdates(prisma, { translateNew: async (c: [string, { slug: string }][]) => c.forEach(([, r]) => translated.push(r.slug)) }, () => {});

  assert.equal(rows.platform[0].logo, '/brands/netflix.webp');
  assert.equal(rows.platform[1].logo, '/uploads/mi-logo.png', 'no toca un logo cambiado en el panel');
  assert.equal(rows.license[0].image, '/brands/windows-11.webp');
  assert.deepEqual(rows.platform.slice(3).map((p) => [p.slug, p.order]), [['rakuten-viki', 3], ['tele-latino', 4], ['flujo-tv', 5]]);
  assert.equal(rows.license.at(-1)!.slug, 'perplexity');
  assert.deepEqual(translated, ['rakuten-viki', 'tele-latino', 'flujo-tv', 'perplexity']);
  assert.equal(rows.logo.length, brands.LOGOS.length);
});
