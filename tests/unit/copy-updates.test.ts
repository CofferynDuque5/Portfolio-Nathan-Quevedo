import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import path from 'node:path';

// eslint-disable-next-line @typescript-eslint/no-require-imports
const { applyCopyUpdates, FIRST_PERSON } = require('../../scripts/copy-updates.cjs');
const scripts = path.resolve(__dirname, '../../scripts');
const setupDb = readFileSync(path.join(scripts, 'setup-db.cjs'), 'utf8');
const seedTr = readFileSync(path.join(scripts, 'seed-translations.cjs'), 'utf8');

test('el contenido base nuevo ya usa los textos en primera persona', () => {
  for (const [, , , [before, after], en] of FIRST_PERSON as [string, string, string, [string, string], [string, string]?][]) {
    assert.ok(setupDb.includes(after), `setup-db: falta "${after}"`);
    assert.ok(!setupDb.includes(before), `setup-db: sigue "${before}"`);
    assert.ok(seedTr.includes(after), `seed-translations: falta "${after}"`);
    if (en) assert.ok(seedTr.includes(en[1]), `seed-translations: falta "${en[1]}"`);
  }
});

test('solo cambia los textos que siguen siendo los originales', async () => {
  const faqs = [
    { id: 1, answer: 'Sí, todas nuestras licencias son 100% originales y verificadas.' },
    { id: 2, answer: 'Mi respuesta editada en el panel.' },
  ];
  const translations = [
    { resource: 'faqs', recordId: 1, field: 'answer', locale: 'en', value: 'Yes, all our licenses are 100% genuine and verified.' },
  ];
  const match = (row: Record<string, unknown>, where: Record<string, unknown>) =>
    Object.entries(where).every(([k, v]) =>
      v && typeof v === 'object' && 'in' in v ? (v.in as unknown[]).includes(row[k]) : row[k] === v,
    );
  const table = (rows: Record<string, unknown>[]) => ({
    findMany: async ({ where }: { where: Record<string, unknown> }) => rows.filter((r) => match(r, where)),
    updateMany: async ({ where, data }: { where: Record<string, unknown>; data: Record<string, unknown> }) => {
      rows.filter((r) => match(r, where)).forEach((r) => Object.assign(r, data));
    },
  });
  const empty = table([]);
  const prisma = { faq: table(faqs), heroSlide: empty, service: empty, banner: empty, contentTranslation: table(translations) };

  await applyCopyUpdates(prisma, () => {});
  assert.equal(faqs[0].answer, 'Sí, todas las licencias que ofrezco son 100% originales y verificadas.');
  assert.equal(faqs[1].answer, 'Mi respuesta editada en el panel.');
  assert.equal(translations[0].value, 'Yes, every license I offer is 100% genuine and verified.');
});
