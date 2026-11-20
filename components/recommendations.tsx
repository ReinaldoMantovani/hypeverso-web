'use client';
import { useQuery } from '@tanstack/react-query';
import { Sparkles } from 'lucide-react';
import { api } from '@/lib/api';
import { PostCard } from './post-card';

export function Recommendations() {
  const { data = [] } = useQuery({
    queryKey: ['recommendations-v16'],
    queryFn: () => api<any[]>('/api/recommendations'),
    staleTime: 60_000,
  });
  if (!data.length) return null;
  const semantic = data.some((p: any) => p.recommendationStrategy === 'hybrid-semantic');
  return (
    <section className="mx-auto max-w-7xl px-4 py-10">
      <p className="flex items-center gap-2 text-xs font-bold uppercase tracking-[.2em] text-violet-300">
        <Sparkles size={14} /> Para você
      </p>
      <h2 className="mt-2 text-3xl font-black">Recomendações inteligentes</h2>
      <p className="mt-2 text-sm text-white/45">
        {semantic
          ? 'Similaridade semântica + seus favoritos, leituras e categorias.'
          : 'A seleção evolui conforme seus favoritos, leituras e preferências.'}
      </p>
      <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {data.slice(0, 8).map((p: any) => (
          <div key={p.id} className="min-w-0">
            <div className="mb-2 line-clamp-1 text-xs font-medium text-cyan-300">
              {p.recommendationReason || 'Selecionado para você'}
            </div>
            <PostCard post={p} />
          </div>
        ))}
      </div>
    </section>
  );
}
