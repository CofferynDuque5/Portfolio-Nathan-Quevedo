const fs = require('fs');
const path = require('path');

const OUT = path.resolve(__dirname, '../web/public/brands');
fs.mkdirSync(OUT, { recursive: true });

// Glyphs reutilizables (blanco), centrados en (100,100).
const GLYPH = {
  windows: `<g fill="#fff"><rect x="34" y="34" width="28" height="28" rx="3"/><rect x="72" y="34" width="28" height="28" rx="3"/><rect x="34" y="72" width="28" height="28" rx="3"/><rect x="72" y="72" width="28" height="28" rx="3"/></g>`,
  cloud: `<path d="M 52 128 a 26 26 0 0 1 4 -51 a 30 30 0 0 1 56 8 a 22 22 0 0 1 -6 43 Z" transform="translate(-16 -18)" fill="none" stroke="#fff" stroke-width="8" stroke-linejoin="round"/>`,
  shield: `<path d="M 100 48 L 140 64 V 100 C 140 124 122 138 100 144 C 78 138 60 124 60 100 V 64 Z" fill="none" stroke="#fff" stroke-width="8" stroke-linejoin="round"/><path d="M 84 98 l 12 12 l 22 -26" fill="none" stroke="#fff" stroke-width="8" stroke-linecap="round" stroke-linejoin="round"/>`,
  play: `<path d="M 80 62 L 138 100 L 80 138 Z" fill="#fff"/>`,
};

function tile({ bg, fg = '#ffffff', text, glyph, sub }) {
  const grad = Array.isArray(bg);
  const fill = grad ? 'url(#g)' : bg;
  const defs = grad
    ? `<defs><linearGradient id="g" x1="0" y1="0" x2="200" y2="200" gradientUnits="userSpaceOnUse"><stop stop-color="${bg[0]}"/><stop offset="1" stop-color="${bg[1]}"/></linearGradient></defs>`
    : '';
  let content = '';
  if (glyph) {
    content = GLYPH[glyph];
    if (sub) content += `<text x="100" y="172" text-anchor="middle" font-family="Arial, Helvetica, sans-serif" font-size="30" font-weight="700" fill="${fg}">${sub}</text>`;
  } else {
    const len = text.replace(/[^A-Za-z0-9+]/g, '').length;
    const size = len <= 1 ? 108 : len === 2 ? 76 : len === 3 ? 54 : 44;
    content = `<text x="100" y="100" dy="0.35em" text-anchor="middle" font-family="Arial, Helvetica, sans-serif" font-size="${size}" font-weight="800" letter-spacing="-1" fill="${fg}">${text}</text>`;
  }
  return `<svg xmlns="http://www.w3.org/2000/svg" width="200" height="200" viewBox="0 0 200 200" role="img">${defs}<rect width="200" height="200" rx="44" fill="${fill}"/>${content}</svg>`;
}

// ---- Plataformas de streaming ----
const PLATFORMS = {
  'netflix':          { text: 'N',   bg: '#141414', fg: '#E50914' },
  'disney-plus':      { text: 'D+',  bg: ['#1f2a6d', '#0e1747'] },
  'hbo-max':          { text: 'HBO', bg: ['#7b2ff7', '#5b21b6'] },
  'prime-video':      { text: 'PV',  bg: ['#00A8E1', '#0d6efd'] },
  'spotify':          { text: 'S',   bg: '#1DB954', fg: '#0b0b0b' },
  'youtube':          { glyph: 'play', bg: '#FF0000' },
  'paramount-plus':   { text: 'P+',  bg: ['#0064FF', '#0047b3'] },
  'crunchyroll':      { text: 'C',   bg: '#F47521' },
};

// ---- Licencias de software ----
const LICENSES = {
  'windows-11':    { glyph: 'windows', bg: ['#0078D4', '#00A4EF'] },
  'office-2021':   { text: 'O',   bg: '#D83B01' },
  'microsoft-365': { text: 'M',   bg: ['#E8590C', '#F97316'] },
  'adobe-cc':      { text: 'Ac',  bg: '#FA0F00' },
  'canva':         { text: 'C',   bg: ['#00C4CC', '#7D2AE8'] },
  'capcut':        { text: 'CC',  bg: ['#111827', '#000000'] },
  'chatgpt':       { text: 'AI',  bg: '#10A37F' },
  'google-one':    { text: 'G1',  bg: ['#4285F4', '#34A853'] },
  'onedrive':      { glyph: 'cloud', bg: ['#0364B8', '#0a84ff'] },
  'dropbox':       { text: 'D',   bg: '#0061FF' },
  'vpn':           { glyph: 'shield', bg: ['#4f46e5', '#7c3aed'], sub: 'VPN' },
  'antivirus':     { glyph: 'shield', bg: ['#059669', '#10b981'], sub: 'ANTIVIRUS' },
};

let n = 0;
for (const [key, cfg] of Object.entries({ ...PLATFORMS, ...LICENSES })) {
  fs.writeFileSync(path.join(OUT, `${key}.svg`), tile(cfg));
  n++;
}
console.log(`Generados ${n} logos en web/public/brands/`);
