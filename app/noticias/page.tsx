'use client';
import { Suspense, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { PostCard } from '@/components/post-card';
import { useI18n } from '@/lib/i18n';
function NewsContent() {
  const sp = useSearchParams();
  const { t } = useI18n();
  const category = sp.get('categoria') || '';
  const q = sp.get('q') || '';
  const params = new URLSearchParams({ limit: '24' });
  if (category) params.set('category', category);
  if (q) params.set('q', q);
  const query = useQuery({
    queryKey: ['public-news', category, q],
    queryFn: () => api<any>(`/api/posts?${params}`),
    refetchInterval: 5000,
    refetchOnWindowFocus: true,
    staleTime: 0,
  });
  useEffect(() => {
    let channel: BroadcastChannel | undefined;
    try {
      channel = new BroadcastChannel('hyperverso-news');
      channel.onmessage = () => {
        void query.refetch();
      };
    } catch {}
    const onStorage = (e: StorageEvent) => {
      if (e.key === 'hyperverso:last-published-at') void query.refetch();
    };
    window.addEventListener('storage', onStorage);
    return () => {
      channel?.close();
      window.removeEventListener('storage', onStorage);
    };
  }, [query]);
  const items = query.data?.items || [];
  return (
    <section className="mx-auto max-w-7xl px-4 py-12">
      <p className="text-xs font-bold uppercase tracking-[.2em] text-cyan-300">{t('portal')}</p>
      <h1 className="mt-2 text-4xl font-black">{t('newsTitle')}</h1>
      <p className="mt-3 text-white/50">{t('newsDesc')}</p>
      {query.isFetching && items.length > 0 && <div className="mt-4 text-xs text-white/30">{t('loadingNews')}</div>}
      <div className="mt-9 grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {items.map((p: any) => (
          <PostCard key={p.id} post={p} />
        ))}
      </div>
      {!query.isLoading && !items.length && <div className="py-20 text-center text-white/40">{t('emptyNews')}</div>}
    </section>
  );
}
export default function News() {
  return (
    <Suspense fallback={<div className="mx-auto max-w-7xl px-4 py-20 text-white/40">...</div>}>
      <NewsContent />
    </Suspense>
  );
}
