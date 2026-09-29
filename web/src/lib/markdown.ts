/**
 * Markdown sencillo y seguro para los artículos del blog.
 *
 * Se convierte a un árbol de bloques que el componente <Markdown> pinta con
 * elementos de React: nunca se inserta HTML, así que el texto del panel no
 * puede inyectar scripts. Solo se aceptan enlaces http(s), mailto, rutas del
 * propio sitio (/…) y anclas (#…); cualquier otro enlace se muestra como texto.
 *
 * Admite:
 *   ## Título / ### Subtítulo      - lista / 1. lista numerada
 *   **negrita**  *cursiva*  `código`  [texto](https://…)
 *   > cita      ![texto alternativo](/uploads/…)      ```bloque de código```
 *   ---  (separador)
 * Un salto de línea simple dentro de un párrafo se respeta.
 */

export type Inline =
  | { type: 'text'; value: string }
  | { type: 'br' }
  | { type: 'strong'; children: Inline[] }
  | { type: 'em'; children: Inline[] }
  | { type: 'code'; value: string }
  | { type: 'link'; href: string; external: boolean; children: Inline[] };

export type Block =
  | { type: 'heading'; level: 2 | 3 | 4; id: string; children: Inline[] }
  | { type: 'paragraph'; children: Inline[] }
  | { type: 'list'; ordered: boolean; items: Inline[][] }
  | { type: 'quote'; children: Inline[] }
  | { type: 'code'; value: string; lang?: string }
  | { type: 'image'; src: string; alt: string }
  | { type: 'hr' };

/** Enlace permitido o null. */
export function safeHref(url: string): string | null {
  const u = url.trim();
  if (/^https?:\/\/[^\s]+$/i.test(u) || /^mailto:[^\s]+$/i.test(u)) return u;
  if (/^\/(?!\/)[^\s]*$/.test(u) || /^#[^\s]*$/.test(u)) return u;
  return null;
}

/** Imagen permitida (http(s) o ruta del sitio) o null. */
export function safeImageSrc(url: string): string | null {
  const u = url.trim();
  return /^https?:\/\/[^\s]+$/i.test(u) || /^\/(?!\/)[^\s]*$/.test(u) ? u : null;
}

/** "¿Qué es un VPN?" -> "que-es-un-vpn" (para anclas de títulos). */
export function slugifyHeading(text: string): string {
  return text
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 80);
}

// ------------------------------------------------------------ inline

const INLINE_PATTERNS: { re: RegExp; make: (m: RegExpExecArray) => Inline | Inline[] }[] = [
  { re: /`([^`\n]+)`/, make: (m) => ({ type: 'code', value: m[1] }) },
  {
    re: /\[([^\]\n]+)\]\(([^)\s]+)\)/,
    make: (m) => {
      const href = safeHref(m[2]);
      const children = parseInline(m[1]);
      return href ? { type: 'link', href, external: /^https?:/i.test(href), children } : children;
    },
  },
  { re: /\*\*(?=\S)([^\n]*?\S)\*\*/, make: (m) => ({ type: 'strong', children: parseInline(m[1]) }) },
  { re: /__(?=\S)([^\n]*?\S)__/, make: (m) => ({ type: 'strong', children: parseInline(m[1]) }) },
  { re: /\*(?=\S)([^*\n]*?\S)\*/, make: (m) => ({ type: 'em', children: parseInline(m[1]) }) },
  // _cursiva_ solo entre límites de palabra, para no romper nombres_con_guiones.
  { re: /(?<![\p{L}\p{N}])_(?=\S)([^_\n]*?\S)_(?![\p{L}\p{N}])/u, make: (m) => ({ type: 'em', children: parseInline(m[1]) }) },
];

function pushText(out: Inline[], text: string) {
  text.split('\n').forEach((part, i) => {
    if (i > 0) out.push({ type: 'br' });
    if (!part) return;
    const last = out[out.length - 1];
    if (last?.type === 'text') last.value += part;
    else out.push({ type: 'text', value: part });
  });
}

export function parseInline(text: string): Inline[] {
  const out: Inline[] = [];
  let rest = text;
  while (rest) {
    let best: { m: RegExpExecArray; make: (m: RegExpExecArray) => Inline | Inline[] } | null = null;
    for (const p of INLINE_PATTERNS) {
      const m = p.re.exec(rest);
      if (m && (!best || m.index < best.m.index)) best = { m, make: p.make };
    }
    if (!best) {
      pushText(out, rest);
      break;
    }
    pushText(out, rest.slice(0, best.m.index));
    const node = best.make(best.m);
    for (const n of Array.isArray(node) ? node : [node]) {
      if (n.type === 'text') pushText(out, n.value);
      else out.push(n);
    }
    rest = rest.slice(best.m.index + best.m[0].length);
  }
  return out;
}

// ------------------------------------------------------------ bloques

const FENCE = /^\s*```\s*([\w+-]*)\s*$/;
const HEADING = /^(#{1,6})\s+(.+?)\s*#*\s*$/;
const HR = /^\s*([-*_])(\s*\1){2,}\s*$/;
const IMAGE = /^\s*!\[([^\]\n]*)\]\(([^)\s]+)\)\s*$/;
const BULLET = /^\s*[-*+]\s+(.*)$/;
const NUMBERED = /^\s*\d{1,9}[.)]\s+(.*)$/;
const QUOTE = /^\s*>\s?(.*)$/;

const startsBlock = (line: string) =>
  FENCE.test(line) || HEADING.test(line) || HR.test(line) || IMAGE.test(line) ||
  BULLET.test(line) || NUMBERED.test(line) || QUOTE.test(line);

/** Texto plano de un fragmento inline (para anclas y textos alternativos). */
export function inlineText(nodes: Inline[]): string {
  return nodes
    .map((n) => (n.type === 'text' || n.type === 'code' ? n.value : n.type === 'br' ? ' ' : inlineText(n.children)))
    .join('');
}

export function parseMarkdown(source?: string | null): Block[] {
  const lines = (source ?? '').replace(/\r\n?/g, '\n').split('\n');
  const blocks: Block[] = [];
  const ids = new Map<string, number>();
  const uniqueId = (text: string) => {
    const base = slugifyHeading(text) || 'seccion';
    const n = (ids.get(base) ?? 0) + 1;
    ids.set(base, n);
    return n === 1 ? base : `${base}-${n}`;
  };

  let i = 0;
  while (i < lines.length) {
    const line = lines[i];

    if (!line.trim()) {
      i++;
      continue;
    }

    const fence = FENCE.exec(line);
    if (fence) {
      const body: string[] = [];
      i++;
      while (i < lines.length && !/^\s*```\s*$/.test(lines[i])) body.push(lines[i++]);
      i++; // cierre (o fin del texto)
      blocks.push({ type: 'code', value: body.join('\n'), lang: fence[1] || undefined });
      continue;
    }

    const heading = HEADING.exec(line);
    if (heading) {
      const level = Math.min(Math.max(heading[1].length, 2), 4) as 2 | 3 | 4;
      const children = parseInline(heading[2]);
      blocks.push({ type: 'heading', level, id: uniqueId(inlineText(children)), children });
      i++;
      continue;
    }

    if (HR.test(line)) {
      blocks.push({ type: 'hr' });
      i++;
      continue;
    }

    const image = IMAGE.exec(line);
    if (image) {
      const src = safeImageSrc(image[2]);
      if (src) blocks.push({ type: 'image', src, alt: image[1].trim() });
      i++;
      continue;
    }

    const bullet = BULLET.test(line);
    if (bullet || NUMBERED.test(line)) {
      const re = bullet ? BULLET : NUMBERED;
      const items: Inline[][] = [];
      while (i < lines.length && re.test(lines[i])) {
        items.push(parseInline(re.exec(lines[i])![1]));
        i++;
      }
      blocks.push({ type: 'list', ordered: !bullet, items });
      continue;
    }

    if (QUOTE.test(line)) {
      const body: string[] = [];
      while (i < lines.length && QUOTE.test(lines[i])) body.push(QUOTE.exec(lines[i++])![1]);
      blocks.push({ type: 'quote', children: parseInline(body.join('\n').trim()) });
      continue;
    }

    const body: string[] = [];
    while (i < lines.length && lines[i].trim() && (body.length === 0 || !startsBlock(lines[i]))) {
      body.push(lines[i++].trim());
    }
    blocks.push({ type: 'paragraph', children: parseInline(body.join('\n')) });
  }

  return blocks;
}

/** Texto plano de un artículo (para el tiempo de lectura y descripciones). */
export function markdownToText(source?: string | null): string {
  return parseMarkdown(source)
    .map((b) => {
      switch (b.type) {
        case 'heading':
        case 'paragraph':
        case 'quote':
          return inlineText(b.children);
        case 'list':
          return b.items.map(inlineText).join(' ');
        case 'code':
          return b.value;
        default:
          return '';
      }
    })
    .filter(Boolean)
    .join(' ')
    .replace(/\s+/g, ' ')
    .trim();
}

/** Minutos de lectura (≈ 200 palabras por minuto, mínimo 1). */
export function readingMinutes(source?: string | null): number {
  const words = markdownToText(source).split(' ').filter(Boolean).length;
  return Math.max(1, Math.round(words / 200));
}

/** Títulos de primer nivel del artículo, para el índice. */
export function tableOfContents(blocks: Block[]): { id: string; text: string }[] {
  return blocks
    .filter((b): b is Extract<Block, { type: 'heading' }> => b.type === 'heading' && b.level === 2)
    .map((b) => ({ id: b.id, text: inlineText(b.children) }));
}
