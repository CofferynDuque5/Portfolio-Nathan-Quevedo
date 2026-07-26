'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { ImagePlus, X } from 'lucide-react';
import { FieldDef, ResourceDef } from '@/lib/admin/resources';
import MediaPicker from './MediaPicker';

export default function ResourceForm({
  def,
  initial,
  onSubmit,
  onCancel,
  saving,
}: {
  def: ResourceDef;
  initial?: Record<string, any>;
  onSubmit: (values: Record<string, any>) => void;
  onCancel: () => void;
  saving?: boolean;
}) {
  const { register, handleSubmit, setValue, watch, formState } = useForm({
    defaultValues: initial ?? {},
  });
  const [pickerField, setPickerField] = useState<string | null>(null);

  const submit = (values: Record<string, any>) => {
    // No enviar la contraseña vacía (para no sobreescribirla al editar).
    if (def.key === 'users' && !values.password) delete values.password;
    onSubmit(values);
  };

  return (
    <form onSubmit={handleSubmit(submit)} className="space-y-5">
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

      <div className="flex justify-end gap-3 border-t border-slate-200 pt-5 dark:border-white/10">
        <button type="button" onClick={onCancel} className="btn-ghost">
          Cancelar
        </button>
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
          placeholder={field.placeholder}
          {...register(field.name, { required: field.required })}
        />
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
