const fs = require('fs');
const path = require('path');

const OUT = path.resolve(__dirname, '../web/public/services');
fs.mkdirSync(OUT, { recursive: true });

// Símbolos tipo "line icon" (blanco, trazo), estética coherente con Lucide.
// Coordenadas pensadas para un área centrada de ~180x180.
const S = {
  play: `<path d="M -28 -34 L 34 0 L -28 34 Z" fill="#fff"/>`,
  monitor: `<rect x="-46" y="-38" width="92" height="60" rx="8" fill="none" stroke="#fff" stroke-width="7"/><path d="M -14 22 v 14 M 14 22 v 14 M -26 40 h 52" stroke="#fff" stroke-width="7" stroke-linecap="round"/>`,
  key: `<circle cx="-22" cy="22" r="20" fill="none" stroke="#fff" stroke-width="7"/><path d="M -8 8 L 42 -42 M 26 -26 l 12 12 M 12 -12 l 12 12" stroke="#fff" stroke-width="7" stroke-linecap="round" stroke-linejoin="round"/>`,
  windows: `<g fill="#fff"><rect x="-40" y="-40" width="34" height="34" rx="4"/><rect x="6" y="-40" width="34" height="34" rx="4"/><rect x="-40" y="6" width="34" height="34" rx="4"/><rect x="6" y="6" width="34" height="34" rx="4"/></g>`,
  document: `<path d="M -32 -44 h 44 l 22 22 v 66 a 4 4 0 0 1 -4 4 h -62 a 4 4 0 0 1 -4 -4 v -84 a 4 4 0 0 1 4 -4 Z" fill="none" stroke="#fff" stroke-width="7" stroke-linejoin="round"/><path d="M 12 -44 v 22 h 22 M -18 8 h 36 M -18 26 h 36" stroke="#fff" stroke-width="7" stroke-linecap="round"/>`,
  sparkle: `<path d="M 0 -46 C 6 -14 14 -6 46 0 C 14 6 6 14 0 46 C -6 14 -14 6 -46 0 C -14 -6 -6 -14 0 -46 Z" fill="#fff"/>`,
  shield: `<path d="M 0 -46 L 40 -30 V 6 C 40 30 22 44 0 50 C -22 44 -40 30 -40 6 V -30 Z" fill="none" stroke="#fff" stroke-width="7" stroke-linejoin="round"/><path d="M -16 2 l 12 12 l 22 -26" fill="none" stroke="#fff" stroke-width="7" stroke-linecap="round" stroke-linejoin="round"/>`,
  cloud: `<path d="M -34 24 a 26 26 0 0 1 4 -51 a 30 30 0 0 1 56 8 a 22 22 0 0 1 -6 43 Z" fill="none" stroke="#fff" stroke-width="7" stroke-linejoin="round"/>`,
  briefcase: `<rect x="-46" y="-16" width="92" height="60" rx="8" fill="none" stroke="#fff" stroke-width="7"/><path d="M -20 -16 v -12 a 6 6 0 0 1 6 -6 h 28 a 6 6 0 0 1 6 6 v 12 M -46 12 h 92" stroke="#fff" stroke-width="7" stroke-linecap="round"/>`,
  headset: `<path d="M -40 12 v -6 a 40 40 0 0 1 80 0 v 6" fill="none" stroke="#fff" stroke-width="7" stroke-linecap="round"/><rect x="-48" y="10" width="20" height="34" rx="8" fill="#fff"/><rect x="28" y="10" width="20" height="34" rx="8" fill="#fff"/>`,
};

// slug -> { símbolo, paleta [color1, color2] }
const SERVICES = {
  'streaming-premium':   { sym: 'play',      c: ['#7c3aed', '#db2777'] },
  'instalacion-remota':  { sym: 'monitor',   c: ['#2563eb', '#06b6d4'] },
  'licencias-software':  { sym: 'key',       c: ['#4f46e5', '#7c3aed'] },
  'windows':             { sym: 'windows',   c: ['#0078d4', '#00a4ef'] },
  'office-365':          { sym: 'document',  c: ['#e8590c', '#f97316'] },
  'suscripciones':       { sym: 'sparkle',   c: ['#9333ea', '#ec4899'] },
  'seguridad-digital':   { sym: 'shield',    c: ['#059669', '#10b981'] },
  'nube':                { sym: 'cloud',     c: ['#0ea5e9', '#6366f1'] },
  'software-profesional':{ sym: 'briefcase', c: ['#475569', '#6366f1'] },
  'soporte-tecnico':     { sym: 'headset',   c: ['#0d9488', '#6366f1'] },
};

function svg(slug, { sym, c }) {
  const [c1, c2] = c;
  return `<svg xmlns="http://www.w3.org/2000/svg" width="800" height="500" viewBox="0 0 800 500" fill="none" role="img" aria-label="${slug}">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="800" y2="500" gradientUnits="userSpaceOnUse">
      <stop stop-color="${c1}"/><stop offset="1" stop-color="${c2}"/>
    </linearGradient>
    <radialGradient id="glow" cx="0.25" cy="0.2" r="0.9">
      <stop stop-color="#ffffff" stop-opacity="0.35"/><stop offset="1" stop-color="#ffffff" stop-opacity="0"/>
    </radialGradient>
    <filter id="blur"><feGaussianBlur stdDeviation="40"/></filter>
    <pattern id="dots" width="26" height="26" patternUnits="userSpaceOnUse">
      <circle cx="2" cy="2" r="2" fill="#ffffff" fill-opacity="0.10"/>
    </pattern>
  </defs>
  <rect width="800" height="500" fill="url(#bg)"/>
  <rect width="800" height="500" fill="url(#dots)"/>
  <circle cx="650" cy="120" r="150" fill="#ffffff" fill-opacity="0.12" filter="url(#blur)"/>
  <circle cx="120" cy="430" r="140" fill="#000000" fill-opacity="0.10" filter="url(#blur)"/>
  <rect width="800" height="500" fill="url(#glow)"/>
  <g transform="translate(400 250)">
    <rect x="-95" y="-95" width="190" height="190" rx="42" fill="#ffffff" fill-opacity="0.14"/>
    <rect x="-95" y="-95" width="190" height="190" rx="42" fill="none" stroke="#ffffff" stroke-opacity="0.35" stroke-width="1.5"/>
    <g transform="scale(0.92)">${S[sym]}</g>
  </g>
</svg>`;
}

let n = 0;
for (const [slug, cfg] of Object.entries(SERVICES)) {
  fs.writeFileSync(path.join(OUT, `${slug}.svg`), svg(slug, cfg));
  n++;
}
console.log(`Generadas ${n} ilustraciones en web/public/services/`);
