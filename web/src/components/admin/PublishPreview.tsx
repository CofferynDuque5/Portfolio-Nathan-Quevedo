'use client';

import { ReactNode, useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowLeft, ExternalLink, Globe, GlobeLock } from 'lucide-react';
import { api } from '@/lib/admin/client';
import { useAuth } from '@/lib/admin/auth';
import { useToast } from '@/components/admin/Toast';

type Publishable = { id: number; slug: string; status: 'DRAFT' | 'PUBLISHED' };

/**
 * Vista previa desde el panel de un registro con borrador/publicado
 * (proyectos, artículos). Pinta el mismo componente que la página pública,
 * así que lo que se ve aquí es exactamente lo que se publicará.
 */
export default function PublishPreview<T extends Publishable>({
  resource,
  id,
  backHref,
  backLabel,
  publicPath,
  notFound,
  children,
}: {
  resource: string;
  id: number;
  backHref: string;
  backLabel: string;
  /** Ruta pública del registro publicado. */
  publicPath: (record: T) => string;
  notFound: string;
  children: (record: T) => ReactNode;
}) {
  const { user, loading } = useAuth();
  const router = useRouter();
  const toast = useToast();
  const [record, setRecord] = useState<T | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!loading && !user) router.replace('/admin/login');
  }, [user, loading, router]);

  const load = useCallback(async () => {
    try {
      const res = await api.get<T>(resource, id);
      setRecord(res.data);
    } catch (e) {
      setError(e instanceof Error ? e.message : notFound);
    }
  }, [resource, id, notFound]);

  useEffect(() => {
    if (user) load();
  }, [user, load]);

  const togglePublish = async () => {
    if (!record) return;
    const publish = record.status !== 'PUBLISHED';
    setBusy(true);
    try {
      const res = await api.publish<T>(resource, record.id, publish);
      setRecord(res.data);
      toast.success(publish ? 'Publicado: ya es visible en el sitio.' : 'Despublicado: vuelve a ser un borrador.');
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'No se pudo cambiar la publicación.');
    } finally {
      setBusy(false);
    }
  };

  if (loading || !user || (!record && !error)) {
    return (
      <div className="grid min-h-screen place-items-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-brand-500 border-t-transparent" />
      </div>
    );
  }

  if (error || !record) {
    return (
      <div className="grid min-h-screen place-items-center p-6 text-center">
        <div>
          <p className="font-semibold">{error ?? notFound}</p>
          <Link href={backHref} className="btn-ghost mt-4">
            <ArrowLeft size={16} /> {backLabel}
          </Link>
        </div>
      </div>
    );
  }

  const published = record.status === 'PUBLISHED';

  return (
    <>
      <div className="fixed inset-x-0 top-0 z-50 border-b border-slate-200 bg-white/90 backdrop-blur-xl dark:border-white/10 dark:bg-slate-950/90">
        <div className="container-x flex h-16 items-center justify-between gap-3">
          <div className="flex min-w-0 items-center gap-3">
            <Link
              href={backHref}
              className="grid h-9 w-9 shrink-0 place-items-center rounded-full hover:bg-slate-100 dark:hover:bg-white/10"
              title={backLabel}
              aria-label={backLabel}
            >
              <ArrowLeft size={18} />
            </Link>
            <span
              className={`shrink-0 rounded-full px-2.5 py-1 text-xs font-semibold ${
                published
                  ? 'bg-green-100 text-green-700 dark:bg-green-500/15 dark:text-green-400'
                  : 'bg-amber-100 text-amber-700 dark:bg-amber-500/15 dark:text-amber-400'
              }`}
            >
              {published ? 'Publicado' : 'Borrador'}
            </span>
            <span className="hidden truncate text-sm text-slate-500 sm:inline">Vista previa</span>
          </div>
          <div className="flex items-center gap-2">
            {published && (
              <a
                href={publicPath(record)}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-ghost hidden px-4 py-2 sm:inline-flex"
              >
                <ExternalLink size={16} /> Ver en el sitio
              </a>
            )}
            <button onClick={togglePublish} disabled={busy} className={published ? 'btn-ghost px-4 py-2' : 'btn-primary px-4 py-2'}>
              {published ? <GlobeLock size={16} /> : <Globe size={16} />}
              {published ? 'Despublicar' : 'Publicar'}
            </button>
          </div>
        </div>
      </div>
      <main className="pb-24">{children(record)}</main>
    </>
  );
}
