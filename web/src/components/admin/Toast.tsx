'use client';

import { createContext, useCallback, useContext, useState, ReactNode } from 'react';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';

type ToastType = 'success' | 'error' | 'info';
interface ToastItem {
  id: number;
  type: ToastType;
  message: string;
}

interface ToastCtx {
  success: (message: string) => void;
  error: (message: string) => void;
  info: (message: string) => void;
}

const Ctx = createContext<ToastCtx | null>(null);

const config: Record<ToastType, { icon: typeof Info; cls: string }> = {
  success: { icon: CheckCircle2, cls: 'text-green-600 dark:text-green-400' },
  error: { icon: AlertCircle, cls: 'text-red-600 dark:text-red-400' },
  info: { icon: Info, cls: 'text-brand-600 dark:text-brand-300' },
};

let counter = 0;

export function ToastProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<ToastItem[]>([]);

  const remove = useCallback((id: number) => {
    setItems((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const push = useCallback(
    (type: ToastType, message: string) => {
      const id = ++counter;
      setItems((prev) => [...prev, { id, type, message }]);
      setTimeout(() => remove(id), 4200);
    },
    [remove]
  );

  const value: ToastCtx = {
    success: (m) => push('success', m),
    error: (m) => push('error', m),
    info: (m) => push('info', m),
  };

  return (
    <Ctx.Provider value={value}>
      {children}
      <div
        aria-live="polite"
        aria-atomic="true"
        className="pointer-events-none fixed bottom-4 right-4 z-[100] flex w-full max-w-sm flex-col gap-2"
      >
        {items.map((t) => {
          const C = config[t.type].icon;
          return (
            <div
              key={t.id}
              role="status"
              className="pointer-events-auto flex animate-fade-up items-start gap-3 rounded-xl border border-slate-200 bg-white p-4 shadow-soft dark:border-white/10 dark:bg-slate-900"
            >
              <C size={20} className={`mt-0.5 shrink-0 ${config[t.type].cls}`} />
              <p className="flex-1 text-sm font-medium">{t.message}</p>
              <button
                onClick={() => remove(t.id)}
                aria-label="Cerrar notificación"
                className="text-slate-400 transition hover:text-slate-600 dark:hover:text-slate-200"
              >
                <X size={16} />
              </button>
            </div>
          );
        })}
      </div>
    </Ctx.Provider>
  );
}

export function useToast() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error('useToast debe usarse dentro de ToastProvider.');
  return ctx;
}
