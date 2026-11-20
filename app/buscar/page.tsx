'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { Search, SlidersHorizontal, Sparkles, UserRound, Tag as TagIcon } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { assetUrl } from '@/lib/asset-url';
import { Input, Button, Card } from '@/ui';

type SearchResponse = {
  posts: any[];
  users: any[];
  categories: any[];
  tags: any[];
  meta: { engine: string; total: number; page: number; pages: number; facets: any };
};

export default function SearchPage() {
  const [q, setQ] = useState('');
  const [debounced, setDebounced] = useState('');
  const [result, setResult] = useState<SearchResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [focused, setFocused] = useState(false);
  const [category, setCategory] = useState('');
  const [sort, setSort] = useState<'relevance' | 'recent' | 'oldest' | 'title'>('relevance');
  const [premium, setPremium] = useState<'all' | 'free' | 'premium'>('all');
  const [type, setType] = useState<'all' | 'posts' | 'users' | 'categories' | 'tags'>('all');

  useEffect(() => {
    const t = setTimeout(() => setDebounced(q.trim()), 180);
    return () => clearTimeout(t);
  }, [q]);

  const categories = useQuery({
    queryKey: ['search-categories'],
    queryFn: () => api<any[]>('/api/categories'),
    staleTime: 5 * 60_000,
  });

  const suggestions = useQuery({
    queryKey: ['search-suggest', debounced],
    queryFn: () => api<{ posts: any[]; engine?: string }>(`/api/search/suggest?q=${encodeURIComponent(debounced)}`),
    enabled: debounced.length >= 1,
    staleTime: 20_000,
  });

  const suggestPosts = suggestions.data?.posts || [];
  const params = useMemo(() => {
    const p = new URLSearchParams({ q: q.trim(), type, sort });
    if (category) p.set('category', category);
    if (premium !== 'all') p.set('premium', premium === 'premium' ? 'true' : 'false');
    return p;
  }, [q, type, sort, category, premium]);

  async function runSearch(page = 1) {
    if (q.trim().length < 1) return;
    setLoading(true);
    setFocused(false);
    const next = new URLSearchParams(params);
    next.set('page', String(page));
    try {
      setResult(await api<SearchResponse>(`/api/search?${next.toString()}`));
    } finally {
      setLoading(false);
    }
  }
  async function go(e?: React.FormEvent) {
    e?.preventDefault();
    await runSearch(1);
  }

  return (
    <section className="mx-auto max-w-6xl px-4 py-12">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 rounded-full border border-violet-400/25 bg-violet-500/10 px-3 py-1 text-xs font-bold uppercase tracking-[.18em] text-violet-200">
            <Sparkles size={13} /> Search 2.0
          </div>
          <h1 className="mt-4 text-4xl font-black">Busca inteligente</h1>
          <p className="mt-2 text-white/45">Tolerância a erros de digitação, filtros e resultados instantâneos.</p>
        </div>
        {result?.meta?.engine && (
          <div className="rounded-full border border-white/10 bg-white/5 px-3 py-2 text-xs text-white/45">
            Motor:{' '}
            <b className="text-white/75">
              {result.meta.engine === 'meilisearch' ? 'Meilisearch' : 'PostgreSQL fallback'}
            </b>
          </div>
        )}
      </div>

      <form onSubmit={go} className="relative mt-7">
        <div className="flex gap-2">
          <div className="relative min-w-0 flex-1">
            <Input
              value={q}
              onFocus={() => setFocused(true)}
              onBlur={() => setTimeout(() => setFocused(false), 180)}
              onChange={e => {
                setQ(e.target.value);
                if (!e.target.value.trim()) setResult(null);
              }}
              placeholder="Batman, Marvel, RPG, One Piece..."
              autoComplete="off"
              className="h-12"
            />
            {focused && debounced.length >= 1 && (
              <div className="absolute left-0 right-0 top-[calc(100%+8px)] z-40 overflow-hidden rounded-2xl border border-white/10 bg-[#0b0812] shadow-2xl">
                {suggestions.isFetching && <div className="px-4 py-3 text-sm text-white/45">Buscando...</div>}
                {!suggestions.isFetching && suggestPosts.length === 0 && (
                  <div className="px-4 py-3 text-sm text-white/45">Nenhuma notícia encontrada.</div>
                )}
                {suggestPosts.map((p: any) => (
                  <Link
                    key={p.id}
                    href={`/post/${p.slug}`}
                    className="flex gap-3 border-b border-white/5 p-3 last:border-0 hover:bg-white/5"
                  >
                    <div className="h-16 w-24 shrink-0 overflow-hidden rounded-xl bg-white/5">
                      {p.coverImageUrl ? (
                        <img src={assetUrl(p.coverImageUrl)} alt="" className="h-full w-full object-cover" />
                      ) : (
                        <div className="grid h-full place-items-center text-[10px] uppercase text-white/25">
                          Sem capa
                        </div>
                      )}
                    </div>
                    <div className="min-w-0">
                      <div className="line-clamp-2 font-semibold">{p.title}</div>
                      <div className="mt-1 text-xs text-cyan-300">{p.category?.name}</div>
                      <p className="mt-1 line-clamp-1 text-xs text-white/40">{p.description}</p>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
          <Button className="h-12 px-5">
            <Search size={18} />
            {loading ? 'Buscando...' : 'Buscar'}
          </Button>
        </div>

        <Card className="mt-3 grid gap-3 p-4 md:grid-cols-4">
          <label className="text-xs text-white/45">
            <span className="mb-1.5 flex items-center gap-1.5">
              <SlidersHorizontal size={13} /> Tipo
            </span>
            <select
              value={type}
              onChange={e => setType(e.target.value as any)}
              className="h-10 w-full rounded-xl border border-white/10 bg-black/25 px-3 text-sm text-white"
            >
              <option value="all">Tudo</option>
              <option value="posts">Notícias</option>
              <option value="users">Pessoas</option>
              <option value="categories">Categorias</option>
              <option value="tags">Tags</option>
            </select>
          </label>
          <label className="text-xs text-white/45">
            <span className="mb-1.5 block">Categoria</span>
            <select
              value={category}
              onChange={e => setCategory(e.target.value)}
              className="h-10 w-full rounded-xl border border-white/10 bg-black/25 px-3 text-sm text-white"
            >
              <option value="">Todas</option>
              {(categories.data || []).map((c: any) => (
                <option key={c.id} value={c.slug}>
                  {c.name}
                </option>
              ))}
            </select>
          </label>
          <label className="text-xs text-white/45">
            <span className="mb-1.5 block">Ordenação</span>
            <select
              value={sort}
              onChange={e => setSort(e.target.value as any)}
              className="h-10 w-full rounded-xl border border-white/10 bg-black/25 px-3 text-sm text-white"
            >
              <option value="relevance">Mais relevantes</option>
              <option value="recent">Mais recentes</option>
              <option value="oldest">Mais antigas</option>
              <option value="title">Título A–Z</option>
            </select>
          </label>
          <label className="text-xs text-white/45">
            <span className="mb-1.5 block">Acesso</span>
            <select
              value={premium}
              onChange={e => setPremium(e.target.value as any)}
              className="h-10 w-full rounded-xl border border-white/10 bg-black/25 px-3 text-sm text-white"
            >
              <option value="all">Todos</option>
              <option value="free">Grátis</option>
              <option value="premium">Premium</option>
            </select>
          </label>
        </Card>
      </form>

      {result && (
        <div className="mt-8 space-y-9">
          {['all', 'posts'].includes(type) && (
            <div>
              <div className="mb-4 flex items-end justify-between">
                <div>
                  <h2 className="text-xl font-bold">Conteúdos</h2>
                  <p className="text-xs text-white/40">{result.meta.total} resultado(s)</p>
                </div>
              </div>
              {result.posts.length ? (
                <div className="grid gap-3 sm:grid-cols-2">
                  {result.posts.map((p: any) => (
                    <Link key={p.id} href={`/post/${p.slug}`}>
                      <Card className="flex h-full gap-3 p-3 transition hover:border-violet-400/30">
                        <div className="h-28 w-36 shrink-0 overflow-hidden rounded-xl bg-white/5">
                          {p.coverImageUrl ? (
                            <img src={assetUrl(p.coverImageUrl)} alt="" className="h-full w-full object-cover" />
                          ) : (
                            <div className="grid h-full place-items-center text-[10px] uppercase text-white/25">
                              Sem capa
                            </div>
                          )}
                        </div>
                        <div className="min-w-0">
                          <div className="flex flex-wrap gap-2">
                            <span className="text-xs text-cyan-300">{p.category?.name}</span>
                            {p.isPremium && (
                              <span className="rounded-full bg-violet-500/15 px-2 py-0.5 text-[10px] text-violet-200">
                                Premium
                              </span>
                            )}
                          </div>
                          <b className="mt-1 line-clamp-2 block">{p.title}</b>
                          <p className="mt-1 line-clamp-2 text-sm text-white/50">{p.description}</p>
                          {p.tags?.length > 0 && (
                            <div className="mt-2 flex flex-wrap gap-1">
                              {p.tags.slice(0, 3).map((t: any) => (
                                <span
                                  key={t.slug || t.tag?.slug}
                                  className="rounded-full bg-white/5 px-2 py-0.5 text-[10px] text-white/35"
                                >
                                  #{t.name || t.tag?.name}
                                </span>
                              ))}
                            </div>
                          )}
                        </div>
                      </Card>
                    </Link>
                  ))}
                </div>
              ) : (
                <Card className="p-8 text-center text-white/45">Nenhum conteúdo encontrado com estes filtros.</Card>
              )}
            </div>
          )}

          {['all', 'users'].includes(type) && result.users.length > 0 && (
            <div>
              <h2 className="mb-3 flex items-center gap-2 text-xl font-bold">
                <UserRound size={19} /> Pessoas
              </h2>
              <div className="flex flex-wrap gap-3">
                {result.users.map((u: any) => (
                  <Link
                    key={u.id}
                    href={`/u/${u.username}`}
                    className="rounded-xl border border-white/10 px-4 py-3 hover:border-violet-400/30"
                  >
                    @{u.username} · Nv.{u.level}
                  </Link>
                ))}
              </div>
            </div>
          )}
          {['all', 'categories'].includes(type) && result.categories.length > 0 && (
            <div>
              <h2 className="mb-3 text-xl font-bold">Categorias</h2>
              <div className="flex flex-wrap gap-2">
                {result.categories.map((c: any) => (
                  <button
                    key={c.id}
                    type="button"
                    onClick={() => {
                      setCategory(c.slug);
                      setType('posts');
                    }}
                    className="rounded-full border border-white/10 px-3 py-1.5 text-sm text-white/60 hover:border-violet-400/30 hover:text-white"
                  >
                    {c.name}
                  </button>
                ))}
              </div>
            </div>
          )}
          {['all', 'tags'].includes(type) && result.tags.length > 0 && (
            <div>
              <h2 className="mb-3 flex items-center gap-2 text-xl font-bold">
                <TagIcon size={19} /> Tags
              </h2>
              <div className="flex flex-wrap gap-2">
                {result.tags.map((t: any) => (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() => {
                      setQ(t.name);
                      setType('posts');
                    }}
                    className="rounded-full border border-white/10 px-3 py-1.5 text-sm text-white/60 hover:border-cyan-400/30 hover:text-white"
                  >
                    #{t.name}
                  </button>
                ))}
              </div>
            </div>
          )}
          {result.meta.pages > 1 && ['all', 'posts'].includes(type) && (
            <div className="flex items-center justify-center gap-3 pt-2">
              <Button
                variant="outline"
                disabled={result.meta.page <= 1 || loading}
                onClick={() => runSearch(result.meta.page - 1)}
              >
                Anterior
              </Button>
              <span className="text-sm text-white/45">
                Página {result.meta.page} de {result.meta.pages}
              </span>
              <Button
                variant="outline"
                disabled={result.meta.page >= result.meta.pages || loading}
                onClick={() => runSearch(result.meta.page + 1)}
              >
                Próxima
              </Button>
            </div>
          )}
        </div>
      )}
    </section>
  );
}
