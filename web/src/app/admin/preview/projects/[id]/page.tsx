'use client';

import { use, useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowLeft, ExternalLink, Globe, GlobeLock } from 'lucide-react';
import { api } from '@/lib/admin/client';
import { useAuth } from '@/lib/admin/auth';
import { useToast } from '@/components/admin/Toast';
import { Project } from '@/lib/types';
import ProjectDetail from '@/components/public/projects/ProjectDetail';

/**
 * Vista previa de un proyecto desde el panel (incluidos los borradores).
 * Usa el mismo componente que la página pública, así que lo que se ve aquí
 * es exactamente lo que se publicará.
 */
export default function ProjectPreviewPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { user, loading } = useAuth();
  const router = useRouter();
  const toast = useToast();
  const [project, setProject] = useState<Project | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!loading && !user) router.replace('/admin/login');
  }, [user, loading, router]);

  const load = useCallback(async () => {
    try {
      const res = await api.get<Project>('projects', Number(id));
      setProject(res.data);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'No se pudo cargar el proyecto.');
    }
  }, [id]);

  useEffect(() => {
    if (user) load();
  }, [user, load]);

  const togglePublish = async () => {
    if (!project) return;
    const publish = project.status !== 'PUBLISHED';
    setBusy(true);
    try {
      const res = await api.publish<Project>('projects', project.id, publish);
      setProject(res.data);
      toast.success(publish ? 'Publicado: ya es visible en el sitio.' : 'Despublicado: vuelve a ser un borrador.');
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'No se pudo cambiar la publicación.');
    } finally {
      setBusy(false);
    }
  };

  if (loading || !user || (!project && !error)) {
    return (
      <div className="grid min-h-screen place-items-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-brand-500 border-t-transparent" />
      </div>
    );
  }

  if (error || !project) {
    return (
      <div className="grid min-h-screen place-items-center p-6 text-center">
        <div>
          <p className="font-semibold">{error ?? 'Proyecto no encontrado.'}</p>
          <Link href="/admin/projects" className="btn-ghost mt-4">
            <ArrowLeft size={16} /> Volver a proyectos
          </Link>
        </div>
      </div>
    );
  }

  const published = project.status === 'PUBLISHED';

  return (
    <>
      <div className="fixed inset-x-0 top-0 z-50 border-b border-slate-200 bg-white/90 backdrop-blur-xl dark:border-white/10 dark:bg-slate-950/90">
        <div className="container-x flex h-16 items-center justify-between gap-3">
          <div className="flex min-w-0 items-center gap-3">
            <Link
              href="/admin/projects"
              className="grid h-9 w-9 shrink-0 place-items-center rounded-full hover:bg-slate-100 dark:hover:bg-white/10"
              title="Volver a proyectos"
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
                href={`/proyectos/${project.slug}`}
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
      <main className="pb-24">
        <ProjectDetail project={project} />
      </main>
    </>
  );
}
