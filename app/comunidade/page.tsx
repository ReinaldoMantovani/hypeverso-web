'use client';
import { useState } from 'react';
import { useInfiniteQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { Button, Textarea, Card } from '@/ui';
import { CommunityPostCard } from '@/components/community-post-card';
import { useAuth } from '@/stores/auth';
export default function Community() {
  const { user } = useAuth();
  const qc = useQueryClient();
  const [text, setText] = useState('');
  const q = useInfiniteQuery({
    queryKey: ['feed'],
    initialPageParam: '',
    queryFn: ({ pageParam }) => api<any>(`/api/community/feed?limit=15${pageParam ? `&cursor=${pageParam}` : ''}`),
    getNextPageParam: p => p.nextCursor || undefined,
  });
  const posts = q.data?.pages.flatMap(p => p.items) || [];
  async function create() {
    if (!text.trim()) return;
    await api('/api/community/posts', { method: 'POST', body: JSON.stringify({ content: text }) });
    setText('');
    qc.invalidateQueries({ queryKey: ['feed'] });
  }
  return (
    <section className="mx-auto max-w-3xl px-4 py-12">
      <p className="text-xs font-bold uppercase tracking-[.2em] text-cyan-300">Comunidade</p>
      <h1 className="mt-2 text-4xl font-black">Feed Hypeverso</h1>
      {user && (
        <Card className="mt-7 p-4">
          <Textarea
            placeholder="Compartilhe algo com a comunidade..."
            value={text}
            onChange={e => setText(e.target.value)}
          />
          <div className="mt-3 text-right">
            <Button onClick={create}>Publicar</Button>
          </div>
        </Card>
      )}
      <div className="mt-6 space-y-4">
        {posts.map((p: any) => (
          <CommunityPostCard key={p.id} post={p} />
        ))}
      </div>
      {q.hasNextPage && (
        <div className="mt-6 text-center">
          <Button variant="outline" onClick={() => q.fetchNextPage()}>
            Carregar mais
          </Button>
        </div>
      )}
    </section>
  );
}
