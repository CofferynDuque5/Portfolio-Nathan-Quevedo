'use client';

import { use } from 'react';
import { notFound } from 'next/navigation';
import { getResourceDef } from '@/lib/admin/resources';
import ResourceManager from '@/components/admin/ResourceManager';

/**
 * Página genérica que renderiza el gestor CRUD para cualquier módulo
 * registrado en RESOURCES (servicios, licencias, plataformas, etc.).
 */
export default function ResourcePage({ params }: { params: Promise<{ resource: string }> }) {
  const { resource } = use(params);
  const def = getResourceDef(resource);
  if (!def) notFound();
  return <ResourceManager def={def} />;
}
