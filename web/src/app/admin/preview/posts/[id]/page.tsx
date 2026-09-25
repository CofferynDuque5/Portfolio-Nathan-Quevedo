'use client';

import { use } from 'react';
import { Post } from '@/lib/types';
import PublishPreview from '@/components/admin/PublishPreview';
import PostDetail from '@/components/public/blog/PostDetail';

/** Vista previa de un artículo desde el panel (incluidos los borradores). */
export default function PostPreviewPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  return (
    <PublishPreview<Post>
      resource="posts"
      id={Number(id)}
      backHref="/admin/posts"
      backLabel="Volver al blog"
      publicPath={(p) => `/blog/${p.slug}`}
      notFound="Artículo no encontrado."
    >
      {(post) => <PostDetail post={post} />}
    </PublishPreview>
  );
}
