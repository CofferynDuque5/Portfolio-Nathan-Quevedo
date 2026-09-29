'use client';

import { useEffect, useState } from 'react';
import { Languages } from 'lucide-react';
import { FieldDef, ResourceDef } from '@/lib/admin/resources';
import { api } from '@/lib/admin/client';
import { useToast } from './Toast';

/**
 * Traducción al inglés de un registro. Cada campo muestra debajo el texto en
 * español como referencia; un campo vacío hace que el sitio en inglés muestre
 * el texto en español.
 */
export default function TranslationEditor({
  def,
  record,
  locale = 'en',
  onAvailable,
}: {
  def: ResourceDef;
  record: Record<string, any>;
  locale?: string;
  /** Avisa si el registro tiene campos traducibles (para mostrar la pestaña). */
  onAvailable?: (available: boolean) => void;
}) {
  const toast = useToast();
  const [fields, setFields] = useState<FieldDef[] | null>(null);
  const [values, setValues] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    let alive = true;
    api.translations
      .get(def.key, record.id, locale)
      .then((res) => {
        if (!alive) return;
        const defs = res.fields.map(
          (name) => def.fields.find((f) => f.name === name) ?? { name, label: name, type: 'text' as const }
        );
        setFields(defs);
        setValues(res.values);
        onAvailable?.(defs.length > 0);
      })
      .catch(() => {
        if (!alive) return;
        setFields([]);
        onAvailable?.(false);
      });
    return () => {
      alive = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [def.key, record.id, locale]);

  if (!fields) return <p className="py-10 text-center text-sm text-slate-400">Cargando…</p>;
  if (!fields.length) return null;

  const save = async () => {
    setSaving(true);
    try {
      const payload = Object.fromEntries(fields.map((f) => [f.name, values[f.name] ?? '']));
      const res = await api.translations.save(def.key, record.id, locale, payload);
      setValues(res.values);
      toast.success('Traducción guardada.');
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'No se pudo guardar la traducción.');
    } finally {
      setSaving(false);
    }
  };

  const done = fields.filter((f) => values[f.name]?.trim()).length;

  return (
    <div className="space-y-5">
      <p className="flex items-start gap-2 rounded-xl bg-slate-50 px-4 py-3 text-sm text-slate-600 dark:bg-white/5 dark:text-slate-300">
        <Languages size={16} className="mt-0.5 shrink-0 text-brand-500" />
        <span>
          Texto para la versión en inglés del sitio (/en). Lo que dejes vacío se mostrará en español.{' '}
          <strong className="font-semibold">{done} de {fields.length}</strong> campos traducidos.
        </span>
      </p>
      <div className="grid gap-x-5 gap-y-4 sm:grid-cols-2">
        {fields.map((f) => {
          const source = record[f.name] == null ? '' : String(record[f.name]);
          const long = f.type === 'textarea' || source.length > 80;
          const id = `tr-${f.name}`;
          return (
            <div key={f.name} className={f.full || long ? 'sm:col-span-2' : ''}>
              <label htmlFor={id} className="label">
                {f.label} <span className="font-normal text-slate-400">(inglés)</span>
              </label>
              {long ? (
                <textarea
                  id={id}
                  className="field min-h-[90px] resize-y"
                  rows={f.rows}
                  lang={locale}
                  value={values[f.name] ?? ''}
                  onChange={(e) => setValues((v) => ({ ...v, [f.name]: e.target.value }))}
                />
              ) : (
                <input
                  id={id}
                  className="field"
                  lang={locale}
                  value={values[f.name] ?? ''}
                  onChange={(e) => setValues((v) => ({ ...v, [f.name]: e.target.value }))}
                />
              )}
              {source && (
                <p className="mt-1 line-clamp-3 text-xs text-slate-400" lang="es">
                  Español: {source}
                </p>
              )}
            </div>
          );
        })}
      </div>
      <div className="flex justify-end border-t border-slate-200 pt-5 dark:border-white/10">
        <button type="button" onClick={save} disabled={saving} className="btn-primary">
          {saving ? 'Guardando…' : 'Guardar inglés'}
        </button>
      </div>
    </div>
  );
}
