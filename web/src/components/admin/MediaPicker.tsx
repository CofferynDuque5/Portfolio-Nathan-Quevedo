'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { UploadCloud, X, Trash2, Check } from 'lucide-react';
import { api } from '@/lib/admin/client';
import { MediaFile } from '@/lib/types';
import { formatBytes } from '@/lib/utils';
import { useToast } from './Toast';
import ConfirmDialog from './ConfirmDialog';

/**
 * Selector / biblioteca multimedia reutilizable.
 * Permite drag & drop, subir varias imágenes, previsualizar, elegir y eliminar.
 */
export default function MediaPicker({
  open,
  folder = 'general',
  onClose,
  onSelect,
}: {
  open: boolean;
  folder?: string;
  onClose: () => void;
  onSelect?: (file: MediaFile) => void;
}) {
  const toast = useToast();
  const [files, setFiles] = useState<MediaFile[]>([]);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const [toDelete, setToDelete] = useState<MediaFile | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.list<MediaFile>('media', { perPage: 100 });
      setFiles(res.data);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (open) load();
  }, [open, load]);

  const doUpload = async (fileList: FileList | File[]) => {
    if (!fileList || (fileList as FileList).length === 0) return;
    setUploading(true);
    try {
      const res = await api.upload(fileList, folder);
      toast.success(`${res.data.length} archivo(s) subido(s) y optimizado(s).`);
      await load();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Error al subir.');
    } finally {
      setUploading(false);
    }
  };

  const del = async () => {
    if (!toDelete) return;
    try {
      await api.deleteMedia(toDelete.id);
      setFiles((prev) => prev.filter((f) => f.id !== toDelete.id));
      toast.success('Archivo eliminado.');
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'No se pudo eliminar.');
    } finally {
      setToDelete(null);
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[70] grid place-items-center bg-black/50 p-4 backdrop-blur-sm">
      <div className="flex h-[85vh] w-full max-w-4xl flex-col rounded-2xl bg-white shadow-xl dark:bg-slate-900">
        <div className="flex items-center justify-between border-b border-slate-200 p-4 dark:border-white/10">
          <h3 className="text-lg font-semibold">Biblioteca multimedia</h3>
          <button onClick={onClose} className="grid h-9 w-9 place-items-center rounded-full hover:bg-slate-100 dark:hover:bg-white/10">
            <X size={18} />
          </button>
        </div>

        {/* Zona de subida */}
        <div className="p-4">
          <div
            onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
            onDragLeave={() => setDragOver(false)}
            onDrop={(e) => {
              e.preventDefault();
              setDragOver(false);
              doUpload(e.dataTransfer.files);
            }}
            onClick={() => inputRef.current?.click()}
            className={`cursor-pointer rounded-2xl border-2 border-dashed p-8 text-center transition ${
              dragOver ? 'border-brand-500 bg-brand-500/5' : 'border-slate-300 dark:border-white/15'
            }`}
          >
            <UploadCloud className="mx-auto mb-2 text-brand-500" size={32} />
            <p className="text-sm font-medium">
              {uploading ? 'Subiendo…' : 'Arrastra imágenes aquí o haz clic para subir'}
            </p>
            <p className="mt-1 text-xs text-slate-500">Se optimizan automáticamente a WebP</p>
            <input
              ref={inputRef}
              type="file"
              accept="image/*"
              multiple
              hidden
              onChange={(e) => e.target.files && doUpload(e.target.files)}
            />
          </div>
        </div>

        {/* Grid de archivos */}
        <div className="flex-1 overflow-y-auto p-4">
          {loading ? (
            <p className="py-10 text-center text-sm text-slate-500">Cargando…</p>
          ) : files.length === 0 ? (
            <p className="py-10 text-center text-sm text-slate-500">Aún no hay archivos.</p>
          ) : (
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
              {files.map((f) => (
                <div key={f.id} className="group relative overflow-hidden rounded-xl border border-slate-200 dark:border-white/10">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={f.url} alt={f.originalName} className="aspect-square w-full object-cover" />
                  <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-black/60 opacity-0 transition group-hover:opacity-100">
                    {onSelect && (
                      <button
                        onClick={() => onSelect(f)}
                        className="btn bg-brand-600 px-4 py-2 text-xs text-white hover:bg-brand-700"
                      >
                        <Check size={14} /> Usar
                      </button>
                    )}
                    <button
                      onClick={() => setToDelete(f)}
                      className="btn bg-red-600 px-4 py-2 text-xs text-white hover:bg-red-700"
                    >
                      <Trash2 size={14} /> Eliminar
                    </button>
                  </div>
                  <div className="truncate px-2 py-1 text-[10px] text-slate-500">{formatBytes(f.size)}</div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <ConfirmDialog
        open={toDelete !== null}
        message="El archivo se eliminará del servidor de forma permanente."
        onConfirm={del}
        onCancel={() => setToDelete(null)}
      />
    </div>
  );
}
