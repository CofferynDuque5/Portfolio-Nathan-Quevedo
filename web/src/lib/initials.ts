/** "María José Pérez" -> "MP" (si no hay foto). Ignora signos como "(" o "[". */
export function initials(name: string): string {
  const letters = name
    .split(/\s+/)
    .map((w) => w.match(/[\p{L}\p{N}]/u)?.[0])
    .filter((c): c is string => Boolean(c));
  return ((letters[0] ?? '') + (letters.length > 1 ? letters[letters.length - 1] : '')).toUpperCase();
}
