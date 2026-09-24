'use client';

import * as Icons from 'lucide-react';
import { LucideProps } from 'lucide-react';

/**
 * Versión del panel: incluye todos los iconos de Lucide (el sitio público
 * usa @/lib/icon, que solo carga los habituales).
 *
 * Renderiza un icono de lucide-react a partir de su nombre (string) guardado
 * en la base de datos. Si el nombre no existe, usa un icono por defecto.
 */
export function Icon({ name, ...props }: { name?: string | null } & Omit<LucideProps, 'name'>) {
  const key = (name || 'Sparkles') as keyof typeof Icons;
  const Cmp = (Icons[key] as React.ComponentType<LucideProps>) || Icons.Sparkles;
  return <Cmp {...props} />;
}
