'use client';

import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { ImagePlus, ScanEye, X } from 'lucide-react';
import { FieldDef, ResourceDef } from '@/lib/admin/resources';
import { api } from '@/lib/admin/client';
import MediaPicker from './MediaPicker';

/** Adapta los valores de la API a los inputs (fechas ISO -> YYYY-MM-DD). */
function toFormValues(def: ResourceDef, initial?: Record<string, any>) {
  const out: Record<string, any> = { ...(initial ?? {}) };
  for (const f of def.fields) {
    if (f.type === 'date') out[f.name] = out[f.name] ? String(out[f.name]).slice(0, 10) : '';
    if (f.type === 'relation') out[f.name] = out[f.name] == null ? '' : String(out[f.name]);
  }
  return out;
}

export default function ResourceForm({
  def,
  initial,
  onSubmit,
  onCancel,
  saving,
}: {
  def: ResourceDef;
  initial?: Record<string, any>;
  /** `preview` indica que, tras guardar, se debe abrir la vista previa. */
  onSubmit: (values: Record<string, any>, preview?: boolean) => void;
  onCancel: () => void;
  saving?: boolean;
}) {
  const { register, handleSubmit, setValue, watch, formState } = useForm({
    defaultValues: toFormValues(def, initial),
  });
  const [pickerField, setPickerField] = useState<string | null>(null);

  const submit = (values: Record<string, any>, preview = false) => {
    // No enviar la contraseña vacía (para no sobreescribirla al editar).
    if (def.key === 'users' && !values.password) delete values.password;
    onSubmit(values, preview);
  };

  return (
    <form onSubmit={handleSubmit((v) => submit(v))} className="space-y-5">
      <div className="grid gap-x-5 gap-y-4 sm:grid-cols-2">
        {def.fields.map((field) => (
          <FieldControl
            key={field.name}
            field={field}
            register={register}
            watch={watch}
            setValue={setValue}
            onPick={() => setPickerField(field.name)}
          />
        ))}
      </div>

      <div className="flex flex-wrap justify-end gap-3 border-t border-slate-200 pt-5 dark:border-white/10">
        <button type="button" onClick={onCancel} className="btn-ghost">
          Cancelar
        </button>
        {def.previewPath && (
          <button
            type="button"
            disabled={saving || formState.isSubmitting}
            onClick={handleSubmit((v) => submit(v, true))}
            className="btn-ghost"
          >
            <ScanEye size={16} /> Guardar y previsualizar
          </button>
        )}
        <button type="submit" disabled={saving || formState.isSubmitting} className="btn-primary">
          {saving ? 'Guardando…' : 'Guardar'}
        </button>
      </div>

      <MediaPicker
        open={pickerField !== null}
        folder={def.key}
        onClose={() => setPickerField(null)}
        onSelect={(file) => {
          if (pickerField) setValue(pickerField, file.url, { shouldDirty: true });
          setPickerField(null);
        }}
      />
    </form>
  );
}

function FieldControl({
  field,
  register,
  watch,
  setValue,
  onPick,
}: {
  field: FieldDef;
  register: any;
  watch: any;
  setValue: any;
  onPick: () => void;
}) {
  const wrapClass = field.full ? 'sm:col-span-2' : '';
  const value = watch(field.name);

  if (field.type === 'boolean') {
    return (
      <div className={wrapClass}>
        <label className="flex cursor-pointer items-center gap-3 rounded-xl border border-slate-200 px-4 py-3 dark:border-white/10">
          <input type="checkbox" className="h-4 w-4 accent-brand-600" {...register(field.name)} />
          <span className="text-sm font-medium">{field.label}</span>
        </label>
      </div>
    );
  }

  return (
    <div className={wrapClass}>
      <label className="label">
        {field.label} {field.required && <span className="text-red-500">*</span>}
      </label>

      {field.type === 'textarea' ? (
        <textarea
          className="field min-h-[90px] resize-y"
          rows={field.rows}
          placeholder={field.placeholder}
          {...register(field.name, { required: field.required })}
        />
      ) : field.type === 'relation' && field.relation ? (
        <RelationSelect field={field} register={register} watch={watch} setValue={setValue} />
      ) : field.type === 'date' ? (
        <input type="date" className="field" {...register(field.name, { required: field.required })} />
      ) : field.type === 'select' ? (
        <select className="field" {...register(field.name)}>
          {field.options?.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
      ) : field.type === 'image' ? (
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <input
              className="field flex-1"
              placeholder="/uploads/… o pega una URL"
              {...register(field.name)}
            />
            <button type="button" onClick={onPick} className="btn-ghost shrink-0 px-4 py-2.5">
              <ImagePlus size={16} /> Biblioteca
            </button>
          </div>
          {value ? (
            <div className="relative inline-block">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={value} alt="preview" className="h-24 w-auto rounded-lg border border-slate-200 object-cover dark:border-white/10" />
              <button
                type="button"
                onClick={() => setValue(field.name, '', { shouldDirty: true })}
                className="absolute -right-2 -top-2 grid h-6 w-6 place-items-center rounded-full bg-red-600 text-white"
              >
                <X size={12} />
              </button>
            </div>
          ) : null}
        </div>
      ) : (
        <input
          type={field.type === 'password' ? 'password' : field.type === 'number' ? 'number' : 'text'}
          className="field"
          placeholder={field.placeholder}
          {...register(field.name, { required: field.required })}
        />
      )}

      {field.help && <p className="mt-1 text-xs text-slate-400">{field.help}</p>}
    </div>
  );
}

/** Select cuyas opciones vienen de otro recurso (ej: categorías). */
function RelationSelect({
  field,
  register,
  watch,
  setValue,
}: {
  field: FieldDef;
  register: any;
  watch: any;
  setValue: any;
}) {
  const [options, setOptions] = useState<{ value: string; label: string }[] | null>(null);
  const { resource, labelKey } = field.relation!;

  useEffect(() => {
    let alive = true;
    api
      .list(resource, { perPage: 100, sortBy: labelKey, sortDir: 'asc' })
      .then((res) => {
        if (alive) setOptions(res.data.map((r: any) => ({ value: String(r.id), label: String(r[labelKey]) })));
      })
      .catch(() => alive && setOptions([]));
    return () => {
      alive = false;
    };
  }, [resource, labelKey]);

  // Al llegar las opciones, reasigna el valor para que el select lo muestre.
  const current = watch(field.name);
  useEffect(() => {
    if (options) setValue(field.name, current ?? '');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [options]);

  return (
    <select className="field" disabled={!options} {...register(field.name)}>
      <option value="">{options ? 'Sin categoría' : 'Cargando…'}</option>
      {options?.map((o) => (
        <option key={o.value} value={o.value}>
          {o.label}
        </option>
      ))}
    </select>
  );
}
