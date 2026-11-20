'use client';
import { useQuery } from '@tanstack/react-query';
import Link from 'next/link';
import { api } from '@/lib/api';
import { Card } from '@/ui';
export default function History() {
  const q = useQuery({ queryKey: ['history'], queryFn: () => api<any[]>('/api/me/history') });
  return (
    <section className="mx-auto max-w-4xl px-4 py-12">
      <h1 className="text-4xl font-black">Histórico</h1>
      <p className="mt-2 text-white/50">Conteúdos que você acessou recentemente.</p>
      {q.error && <p className="mt-8 text-amber-300">Entre na sua conta para ver o histórico.</p>}
      <div className="mt-8 space-y-3">
        {(q.data || []).map((x: any) => (
          <Link key={x.id} href={`/post/${x.post.slug}`}>
            <Card className="mb-3 p-4">
              <b>{x.post.title}</b>
              <p className="mt-1 text-sm text-white/45">{x.post.category.name}</p>
            </Card>
          </Link>
        ))}
      </div>
    </section>
  );
}
