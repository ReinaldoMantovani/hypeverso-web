import type { Metadata } from 'next';
import { PostView, postMetadata } from '@/components/article/post-view';

// Artigo no idioma original (pt-BR). Traduções: /en/post/[slug] e /es/post/[slug].
export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  return postMetadata((await params).slug, 'pt-BR');
}

export default async function PostPage({ params }: { params: Promise<{ slug: string }> }) {
  return <PostView slug={(await params).slug} locale="pt-BR" />;
}
