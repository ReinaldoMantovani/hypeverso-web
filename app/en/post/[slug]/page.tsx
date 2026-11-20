import type { Metadata } from 'next';
import { PostView, postMetadata } from '@/components/article/post-view';

// Artigo traduzido pela IA (English). Sem tradução pronta: mostra o original (noindex).
export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  return postMetadata((await params).slug, 'en');
}

export default async function PostPageEN({ params }: { params: Promise<{ slug: string }> }) {
  return <PostView slug={(await params).slug} locale="en" />;
}
