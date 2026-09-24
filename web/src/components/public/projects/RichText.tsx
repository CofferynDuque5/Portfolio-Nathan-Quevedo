/**
 * Texto del panel con formato mínimo y seguro (sin HTML):
 * - Una línea en blanco separa párrafos.
 * - Las líneas que empiezan por "- " forman una lista.
 */
export default function RichText({ text, className }: { text?: string | null; className?: string }) {
  if (!text?.trim()) return null;
  const blocks = text.trim().split(/\n\s*\n/);

  return (
    <div className={className}>
      {blocks.map((block, i) => {
        const lines = block.split('\n').map((l) => l.trim()).filter(Boolean);
        if (lines.every((l) => l.startsWith('- '))) {
          return (
            <ul key={i} className="my-4 space-y-2">
              {lines.map((l, j) => (
                <li key={j} className="flex gap-3">
                  <span aria-hidden className="mt-2.5 h-1.5 w-1.5 shrink-0 rounded-full bg-brand-500" />
                  <span>{l.slice(2)}</span>
                </li>
              ))}
            </ul>
          );
        }
        return (
          <p key={i} className="my-4 first:mt-0 last:mb-0">
            {lines.join(' ')}
          </p>
        );
      })}
    </div>
  );
}
