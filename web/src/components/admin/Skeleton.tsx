/** Bloques de carga (skeleton) reutilizables para el panel. */

export function Skeleton({ className = '', style }: { className?: string; style?: React.CSSProperties }) {
  return <div style={style} className={`animate-pulse rounded-md bg-slate-200 dark:bg-white/10 ${className}`} />;
}

/** Filas de skeleton para tablas del panel. */
export function TableSkeleton({ cols, rows = 5 }: { cols: number; rows?: number }) {
  return (
    <>
      {Array.from({ length: rows }).map((_, r) => (
        <tr key={r} className="border-b border-slate-100 last:border-0 dark:border-white/5">
          {Array.from({ length: cols }).map((_, c) => (
            <td key={c} className="px-4 py-3.5">
              <Skeleton className="h-4" style={{ width: `${60 + ((r + c) % 4) * 10}%` }} />
            </td>
          ))}
          <td className="px-4 py-3.5">
            <div className="flex justify-end gap-2">
              <Skeleton className="h-8 w-8 rounded-lg" />
              <Skeleton className="h-8 w-8 rounded-lg" />
            </div>
          </td>
        </tr>
      ))}
    </>
  );
}

/** Skeleton para tarjetas del dashboard. */
export function CardSkeleton() {
  return (
    <div className="card flex items-center gap-4">
      <Skeleton className="h-12 w-12 rounded-2xl" />
      <div className="flex-1 space-y-2">
        <Skeleton className="h-6 w-16" />
        <Skeleton className="h-3 w-24" />
      </div>
    </div>
  );
}
