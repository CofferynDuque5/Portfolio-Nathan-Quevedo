'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { UploadCloud, Trash2, Copy, Check, Image as ImageIcon } from 'lucide-react';
import { api } from '@/lib/admin/client';
import { MediaFile } from '@/lib/types';
import { formatBytes } from '@/lib/utils';
import ConfirmDialog from '@/components/admin/ConfirmDialog';
import { useToast } from '@/components/admin/Toast';

const FOLDERS = ['general', 'services', 'platforms', 'licenses', 'logos', 'gallery', 'banners', 'heroSlides', 'seo'];

export default function MediaPage() {
  const toast = useToast();
  const [files, setFiles] = useState<MediaFile[]>([]);
  const [folder, setFolder] = useState('general');
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const [copied, setCopied] = useState<number | null>(null);
  const [toDelete, setToDelete] = useState<MediaFile | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.list<MediaFile>('media', { perPage: 200, search: '' });
      setFiles(res.data);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const doUpload = async (list: FileList | File[]) => {
    if (!list || (list as FileList).length === 0) return;
    setUploading(true);
    try {
      const res = await api.upload(list, folder);
      toast.success(`${res.data.length} archivo(s) subido(s) y optimizado(s) a WebP.`);
      await load();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Error al subir.');
    } finally {
      setUploading(false);
    }
  };

  const copy = (file: MediaFile) => {
    navigator.clipboard.writeText(file.url);
    setCopied(file.id);
    toast.success('URL copiada al portapapeles.');
    setTimeout(() => setCopied(null), 1500);
  };

  const visible = files.filter((f) => folder === 'all' || f.folder === folder);

  return (
    <div>
      <div className="mb-6">
        <h1 className="flex items-center gap-2 text-2xl font-bold"><ImageIcon size={24} className="text-brand-500" /> Gestor multimedia</h1>
        <p className="mt-1 text-sm text-slate-500">Sube, organiza y reutiliza tus imágenes.</p>
      </div>

      {/* Carpetas */}
      <div className="mb-4 flex flex-wrap gap-2">
        {['all', ...FOLDERS].map((f) => (
          <button
            key={f}
            onClick={() => setFolder(f)}
            className={`rounded-full px-4 py-1.5 text-sm font-medium transition ${
              folder === f ? 'bg-brand-600 text-white' : 'border border-slate-200 text-slate-600 hover:bg-slate-100 dark:border-white/10 dark:text-slate-300'
            }`}
          >
            {f === 'all' ? 'Todas' : f}
          </button>
        ))}
      </div>

      {/* Zona de subida */}
      <div
        onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
        onDragLeave={() => setDragOver(false)}
        onDrop={(e) => { e.preventDefault(); setDragOver(false); doUpload(e.dataTransfer.files); }}
        onClick={() => inputRef.current?.click()}
        className={`mb-6 cursor-pointer rounded-2xl border-2 border-dashed p-8 text-center transition ${
          dragOver ? 'border-brand-500 bg-brand-500/5' : 'border-slate-300 dark:border-white/15'
        }`}
      >
        <UploadCloud className="mx-auto mb-2 text-brand-500" size={32} />
        <p className="text-sm font-medium">
          {uploading ? 'Subiendo…' : `Arrastra imágenes o haz clic para subir a "${folder === 'all' ? 'general' : folder}"`}
        </p>
        <p className="mt-1 text-xs text-slate-500">Optimización automática a WebP · múltiples archivos</p>
        <input ref={inputRef} type="file" accept="image/*" multiple hidden onChange={(e) => e.target.files && doUpload(e.target.files)} />
      </div>

      {/* Grid */}
      {loading ? (
        <p className="py-10 text-center text-sm text-slate-500">Cargando…</p>
      ) : visible.length === 0 ? (
        <p className="py-10 text-center text-sm text-slate-500">No hay archivos en esta carpeta.</p>
      ) : (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
          {visible.map((f) => (
            <div key={f.id} className="group overflow-hidden rounded-xl border border-slate-200 bg-white dark:border-white/10 dark:bg-white/[0.02]">
              <div className="relative aspect-square">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={f.url} alt={f.originalName} className="h-full w-full object-cover" />
                <div className="absolute inset-0 flex items-center justify-center gap-2 bg-black/60 opacity-0 transition group-hover:opacity-100">
                  <button onClick={() => copy(f)} title="Copiar URL" className="grid h-9 w-9 place-items-center rounded-lg bg-white/90 text-slate-800">
                    {copied === f.id ? <Check size={16} /> : <Copy size={16} />}
                  </button>
                  <button onClick={() => setToDelete(f)} title="Eliminar" className="grid h-9 w-9 place-items-center rounded-lg bg-red-600 text-white">
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
              <div className="p-2">
                <p className="truncate text-xs font-medium">{f.originalName}</p>
                <p className="text-[10px] text-slate-400">{formatBytes(f.size)}{f.width ? ` · ${f.width}×${f.height}` : ''}</p>
              </div>
            </div>
          ))}
        </div>
      )}

      <ConfirmDialog
        open={toDelete !== null}
        message="El archivo se eliminará del servidor de forma permanente."
        onConfirm={async () => {
          if (toDelete) {
            await api.deleteMedia(toDelete.id);
            setFiles((prev) => prev.filter((x) => x.id !== toDelete.id));
            toast.success('Archivo eliminado.');
            setToDelete(null);
          }
        }}
        onCancel={() => setToDelete(null)}
      />
    </div>
  );
}
