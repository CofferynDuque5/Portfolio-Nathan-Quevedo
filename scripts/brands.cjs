/**
 * Plataformas, licencias y franja de marcas del contenido base, con los
 * logotipos reales que envió Nathan (web/public/brands/*.webp). Las marcas
 * sin logotipo real siguen con su baldosa provisional (*.svg).
 *
 * setup-db.cjs las usa para las instalaciones nuevas. En las que ya existen,
 * applyBrandUpdates() se ejecuta una sola vez: cambia el logotipo provisional
 * por el real (si no lo cambiaste en el panel), añade las plataformas y
 * licencias nuevas que falten y renueva la franja de marcas si sigue siendo
 * la original.
 */

const PLATFORMS = [
  { name: 'Netflix', key: 'netflix', logo: 'netflix.webp' },
  { name: 'Disney+', key: 'disney-plus', logo: 'disney-plus.webp' },
  { name: 'HBO Max', key: 'hbo-max' },
  { name: 'Prime Video', key: 'prime-video', logo: 'prime-video.webp' },
  { name: 'Spotify', key: 'spotify' },
  { name: 'YouTube Premium', key: 'youtube' },
  { name: 'Paramount+', key: 'paramount-plus' },
  { name: 'Crunchyroll', key: 'crunchyroll' },
  { name: 'ViX Premium', key: 'vix', logo: 'vix.webp', added: true },
  { name: 'Rakuten Viki', key: 'rakuten-viki', logo: 'rakuten-viki.webp', added: true },
  { name: 'Tele Latino', key: 'tele-latino', logo: 'tele-latino.webp', added: true },
  { name: 'Flujo TV', key: 'flujo-tv', logo: 'flujo-tv.webp', added: true },
];

const LICENSES = [
  { name: 'Windows 11 Pro', type: 'Sistema Operativo', key: 'windows-11', image: 'windows-11.webp' },
  { name: 'Microsoft Office 2021', type: 'Ofimática', key: 'office-2021' },
  { name: 'Microsoft 365', type: 'Suscripción', key: 'microsoft-365', image: 'microsoft-365.webp' },
  { name: 'Adobe Creative Cloud', type: 'Diseño', key: 'adobe-cc' },
  { name: 'Canva Pro', type: 'Diseño', key: 'canva' },
  { name: 'CapCut Pro', type: 'Edición de video', key: 'capcut' },
  { name: 'ChatGPT Plus', type: 'Inteligencia Artificial', key: 'chatgpt' },
  { name: 'Google One', type: 'Almacenamiento', key: 'google-one' },
  { name: 'OneDrive', type: 'Almacenamiento', key: 'onedrive' },
  { name: 'Dropbox', type: 'Almacenamiento', key: 'dropbox' },
  { name: 'VPN Premium', type: 'Seguridad', key: 'vpn' },
  { name: 'Antivirus Premium', type: 'Seguridad', key: 'antivirus' },
  { name: 'Perplexity Pro', type: 'Inteligencia Artificial', key: 'perplexity', image: 'perplexity.webp', added: true },
];

/** Franja de marcas: solo logotipos reales. */
const LOGOS = [
  { name: 'Windows 11', image: '/brands/windows-11-wordmark.webp' },
  { name: 'Office 365', image: '/brands/office-365-wordmark.webp' },
  { name: 'Netflix', image: '/brands/netflix.webp' },
  { name: 'Disney+', image: '/brands/disney-plus.webp' },
  { name: 'Prime Video', image: '/brands/prime-video.webp' },
  { name: 'ViX', image: '/brands/vix.webp' },
  { name: 'Rakuten Viki', image: '/brands/rakuten-viki.webp' },
  { name: 'Tele Latino', image: '/brands/tele-latino.webp' },
  { name: 'Flujo TV', image: '/brands/flujo-tv.webp' },
  { name: 'Perplexity', image: '/brands/perplexity.webp' },
];

/** Franja de marcas de las primeras versiones (baldosas provisionales). */
const OLD_LOGOS = ['windows-11', 'adobe-cc', 'netflix', 'canva', 'spotify', 'dropbox'].map((k) => `/brands/${k}.svg`);

const platformLogo = (p) => `/brands/${p.logo || `${p.key}.svg`}`;
const licenseImage = (l) => `/brands/${l.image || `${l.key}.svg`}`;

const platformData = (p, order) => ({
  name: p.name,
  slug: p.key,
  description: `Suscripción premium a ${p.name}.`,
  logo: platformLogo(p),
  order,
  active: true,
});
const licenseData = (l, order) => ({
  name: l.name,
  slug: l.key,
  type: l.type,
  description: `Licencia original de ${l.name}.`,
  image: licenseImage(l),
  order,
  active: true,
});

async function applyBrandUpdates(prisma, { translateNew } = {}, log = console.log) {
  let changed = 0;
  // 1) Logotipo provisional -> real, solo si sigue siendo el provisional.
  for (const p of PLATFORMS.filter((x) => x.logo && !x.added)) {
    const r = await prisma.platform.updateMany({ where: { slug: p.key, logo: `/brands/${p.key}.svg` }, data: { logo: platformLogo(p) } });
    changed += r.count;
  }
  for (const l of LICENSES.filter((x) => x.image && !x.added)) {
    const r = await prisma.license.updateMany({ where: { slug: l.key, image: `/brands/${l.key}.svg` }, data: { image: licenseImage(l) } });
    changed += r.count;
  }
  // 2) Plataformas y licencias nuevas, al final de la lista, si faltan.
  const created = [];
  for (const [model, resource, list, data] of [
    [prisma.platform, 'platforms', PLATFORMS, platformData],
    [prisma.license, 'licenses', LICENSES, licenseData],
  ]) {
    const last = await model.findFirst({ orderBy: { order: 'desc' }, select: { order: true } });
    let order = (last?.order ?? -1) + 1;
    for (const item of list.filter((x) => x.added)) {
      if (await model.findUnique({ where: { slug: item.key } })) continue;
      created.push([resource, await model.create({ data: data(item, order++) })]);
    }
  }
  changed += created.length;
  if (translateNew && created.length) await translateNew(created);
  // 3) Franja de marcas: se renueva solo si sigue siendo la original.
  const logos = await prisma.logo.findMany({ select: { image: true } });
  if (logos.length && logos.every((l) => OLD_LOGOS.includes(l.image))) {
    await prisma.logo.deleteMany();
    await prisma.logo.createMany({ data: LOGOS.map((l, i) => ({ ...l, order: i, active: true })) });
    changed += LOGOS.length;
  }
  if (changed) log(`   ✓ ${changed} cambios de logotipos, plataformas y licencias`);
}

module.exports = { PLATFORMS, LICENSES, LOGOS, OLD_LOGOS, platformData, licenseData, applyBrandUpdates };
