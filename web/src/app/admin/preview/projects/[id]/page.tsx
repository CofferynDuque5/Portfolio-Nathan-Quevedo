'use client';

import { use } from 'react';
import { Project } from '@/lib/types';
import PublishPreview from '@/components/admin/PublishPreview';
import ProjectDetail from '@/components/public/projects/ProjectDetail';

/** Vista previa de un proyecto desde el panel (incluidos los borradores). */
export default function ProjectPreviewPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  return (
    <PublishPreview<Project>
      resource="projects"
      id={Number(id)}
      backHref="/admin/projects"
      backLabel="Volver a proyectos"
      publicPath={(p) => `/proyectos/${p.slug}`}
      notFound="Proyecto no encontrado."
    >
      {(project) => <ProjectDetail project={project} />}
    </PublishPreview>
  );
}
