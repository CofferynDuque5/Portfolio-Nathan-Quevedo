'use client';

import { useCallback, useEffect, useState } from 'react';
import {
  Plus, Search, Pencil, Trash2, Eye, EyeOff, ChevronLeft, ChevronRight,
  ArrowUpDown, X, Inbox,
} from 'lucide-react';
import { api } from '@/lib/admin/client';
import { ColumnDef, ResourceDef } from '@/lib/admin/resources';
import ResourceForm from './ResourceForm';
import ConfirmDialog from './ConfirmDialog';
import { Icon } from '@/lib/icon';

export default function ResourceManager({ def }: { def: ResourceDef }) {
  const [rows, setRows] = useState<any[]>([]);
  const [meta, setMeta] = useState({ total: 0, page: 1, perPage: 10, totalPages: 1 });
  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState<string | undefined>();
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc');
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);

  const [editing, setEditing] = useState<Record<string, any> | null>(null);
  const [creating, setCreating] = useState(false);
  const [saving, setSaving] = useState(false);
  const [toDelete, setToDelete] = useState<any | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.list(def.key, { page, perPage: 10, search, sortBy, sortDir });
      setRows(res.data);
      setMeta(res.meta);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Error al cargar.');
    } finally {
      setLoading(false);
    }
  }, [def.key, page, search, sortBy, sortDir]);

  useEffect(() => {
    const t = setTimeout(load, search ? 300 : 0);
    return () => clearTimeout(t);
  }, [load, search]);

  const toggleSort = (key: string) => {
    if (sortBy === key) setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'));
    else { setSortBy(key); setSortDir('asc'); }
  };

  const save = async (values: Record<string, any>) => {
    setSaving(true);
    setError(null);
    try {
      if (editing) await api.update(def.key, editing.id, values);
      else await api.create(def.key, values);
      setEditing(null);
      setCreating(false);
      await load();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Error al guardar.');
    } finally {
      setSaving(false);
    }
  };

  const confirmDelete = async () => {
    if (!toDelete) return;
    setDeleting(true);
    try {
      await api.remove(def.key, toDelete.id);
      setToDelete(null);
      await load();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Error al eliminar.');
    } finally {
      setDeleting(false);
    }
  };

  const doToggle = async (row: any) => {
    await api.toggle(def.key, row.id);
    await load();
  };

  const showForm = creating || editing !== null;

  return (
    <div>
      {/* Cabecera */}
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="flex items-center gap-2 text-2xl font-bold">
            <Icon name={def.icon} size={24} className="text-brand-500" /> {def.label}
          </h1>
          <p className="mt-1 text-sm text-slate-500">{meta.total} registro(s)</p>
        </div>
        <button onClick={() => { setCreating(true); setEditing(null); }} className="btn-primary">
          <Plus size={16} /> Nuevo {def.singular.toLowerCase()}
        </button>
      </div>

      {/* Búsqueda */}
      {def.searchable !== false && (
        <div className="relative mb-4 max-w-sm">
          <Search className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input
            className="field pl-10"
            placeholder="Buscar…"
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
          />
          {search && (
            <button onClick={() => setSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400">
              <X size={16} />
            </button>
          )}
        </div>
      )}

      {error && <div className="mb-4 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-600 dark:bg-red-500/10">{error}</div>}

      {/* Tabla */}
      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white dark:border-white/10 dark:bg-white/[0.02]">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="border-b border-slate-200 bg-slate-50 text-left dark:border-white/10 dark:bg-white/5">
              <tr>
                {def.columns.map((c) => (
                  <th key={c.key} className="px-4 py-3 font-semibold">
                    <button onClick={() => toggleSort(c.key)} className="inline-flex items-center gap-1 hover:text-brand-600">
                      {c.label}
                      <ArrowUpDown size={12} className={sortBy === c.key ? 'text-brand-500' : 'text-slate-300'} />
                    </button>
                  </th>
                ))}
                <th className="px-4 py-3 text-right font-semibold">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={def.columns.length + 1} className="px-4 py-12 text-center text-slate-400">Cargando…</td></tr>
              ) : rows.length === 0 ? (
                <tr>
                  <td colSpan={def.columns.length + 1} className="px-4 py-12 text-center text-slate-400">
                    <Inbox className="mx-auto mb-2" size={28} /> Sin registros.
                  </td>
                </tr>
              ) : (
                rows.map((row) => (
                  <tr key={row.id} className="border-b border-slate-100 last:border-0 hover:bg-slate-50 dark:border-white/5 dark:hover:bg-white/5">
                    {def.columns.map((c) => (
                      <td key={c.key} className="px-4 py-3"><Cell col={c} row={row} /></td>
                    ))}
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-1">
                        {def.hasActive && (
                          <button
                            onClick={() => doToggle(row)}
                            title={row.active ? 'Desactivar' : 'Activar'}
                            className="grid h-8 w-8 place-items-center rounded-lg text-slate-500 hover:bg-slate-100 dark:hover:bg-white/10"
                          >
                            {row.active ? <Eye size={16} /> : <EyeOff size={16} className="text-slate-400" />}
                          </button>
                        )}
                        <button
                          onClick={() => { setEditing(row); setCreating(false); }}
                          title="Editar"
                          className="grid h-8 w-8 place-items-center rounded-lg text-slate-500 hover:bg-slate-100 dark:hover:bg-white/10"
                        >
                          <Pencil size={16} />
                        </button>
                        <button
                          onClick={() => setToDelete(row)}
                          title="Eliminar"
                          className="grid h-8 w-8 place-items-center rounded-lg text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Paginación */}
        {meta.totalPages > 1 && (
          <div className="flex items-center justify-between border-t border-slate-200 px-4 py-3 text-sm dark:border-white/10">
            <span className="text-slate-500">Página {meta.page} de {meta.totalPages}</span>
            <div className="flex gap-2">
              <button
                disabled={page <= 1}
                onClick={() => setPage((p) => p - 1)}
                className="grid h-9 w-9 place-items-center rounded-lg border border-slate-200 disabled:opacity-40 dark:border-white/10"
              >
                <ChevronLeft size={16} />
              </button>
              <button
                disabled={page >= meta.totalPages}
                onClick={() => setPage((p) => p + 1)}
                className="grid h-9 w-9 place-items-center rounded-lg border border-slate-200 disabled:opacity-40 dark:border-white/10"
              >
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Modal formulario */}
      {showForm && (
        <div className="fixed inset-0 z-50 grid place-items-center overflow-y-auto bg-black/50 p-4 backdrop-blur-sm">
          <div className="my-8 w-full max-w-2xl rounded-2xl bg-white p-6 shadow-xl dark:bg-slate-900">
            <div className="mb-5 flex items-center justify-between">
              <h2 className="text-xl font-semibold">
                {editing ? `Editar ${def.singular.toLowerCase()}` : `Nuevo ${def.singular.toLowerCase()}`}
              </h2>
              <button
                onClick={() => { setEditing(null); setCreating(false); }}
                className="grid h-9 w-9 place-items-center rounded-full hover:bg-slate-100 dark:hover:bg-white/10"
              >
                <X size={18} />
              </button>
            </div>
            <ResourceForm
              def={def}
              initial={editing ?? undefined}
              saving={saving}
              onSubmit={save}
              onCancel={() => { setEditing(null); setCreating(false); }}
            />
          </div>
        </div>
      )}

      <ConfirmDialog
        open={toDelete !== null}
        message={`Esta acción eliminará el registro de forma permanente. ¿Deseas continuar?`}
        loading={deleting}
        onConfirm={confirmDelete}
        onCancel={() => setToDelete(null)}
      />
    </div>
  );
}

function Cell({ col, row }: { col: ColumnDef; row: any }) {
  const value = row[col.key];
  if (col.type === 'image') {
    return value ? (
      // eslint-disable-next-line @next/next/no-img-element
      <img src={value} alt="" className="h-10 w-10 rounded-lg object-cover" />
    ) : (
      <span className="text-slate-300">—</span>
    );
  }
  if (col.type === 'boolean') {
    return (
      <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium ${
        value ? 'bg-green-100 text-green-700 dark:bg-green-500/15 dark:text-green-400'
              : 'bg-slate-100 text-slate-500 dark:bg-white/10'
      }`}>
        <span className={`h-1.5 w-1.5 rounded-full ${value ? 'bg-green-500' : 'bg-slate-400'}`} />
        {value ? 'Activo' : 'Inactivo'}
      </span>
    );
  }
  if (col.type === 'badge') {
    return value ? (
      <span className="rounded-full bg-brand-500/10 px-2.5 py-1 text-xs font-medium text-brand-600 dark:text-brand-300">{value}</span>
    ) : <span className="text-slate-300">—</span>;
  }
  const text = String(value ?? '');
  return <span className="line-clamp-1 max-w-xs">{text || <span className="text-slate-300">—</span>}</span>;
}
