/**
 * Serializa datos estructurados (JSON-LD) para un <script> en línea.
 * JSON.stringify no escapa "<", así que un texto del panel con "</script>"
 * cerraría la etiqueta e inyectaría HTML. Se escapan <, > y & (y los
 * separadores de línea U+2028/U+2029) como secuencias \uXXXX, que siguen
 * siendo JSON válido.
 */
export function jsonLdHtml(data: unknown): string {
  return JSON.stringify(data)
    .replace(/</g, '\\u003c')
    .replace(/>/g, '\\u003e')
    .replace(/&/g, '\\u0026')
    .replace(/\u2028/g, '\\u2028')
    .replace(/\u2029/g, '\\u2029');
}
