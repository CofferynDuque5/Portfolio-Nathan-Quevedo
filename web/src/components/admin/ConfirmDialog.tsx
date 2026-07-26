'use client';

import { AlertTriangle } from 'lucide-react';

export default function ConfirmDialog({
  open,
  title = '¿Estás seguro?',
  message,
  confirmLabel = 'Eliminar',
  onConfirm,
  onCancel,
  loading,
}: {
  open: boolean;
  title?: string;
  message: string;
  confirmLabel?: string;
  onConfirm: () => void;
  onCancel: () => void;
  loading?: boolean;
}) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-[60] grid place-items-center bg-black/50 p-4 backdrop-blur-sm">
      <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl dark:bg-slate-900">
        <div className="mb-4 flex items-center gap-3">
          <span className="grid h-11 w-11 place-items-center rounded-full bg-red-100 text-red-600 dark:bg-red-500/15">
            <AlertTriangle size={22} />
          </span>
          <h3 className="text-lg font-semibold">{title}</h3>
        </div>
        <p className="text-sm text-slate-600 dark:text-slate-400">{message}</p>
        <div className="mt-6 flex justify-end gap-3">
          <button onClick={onCancel} className="btn-ghost">
            Cancelar
          </button>
          <button
            onClick={onConfirm}
            disabled={loading}
            className="btn bg-red-600 text-white hover:bg-red-700"
          >
            {loading ? 'Procesando…' : confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
