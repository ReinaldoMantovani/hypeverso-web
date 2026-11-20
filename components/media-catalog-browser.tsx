'use client';

import { useEffect, useMemo, useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Check, ExternalLink, Film, Gamepad2, Loader2, Plus, Search, Sparkles, Tv2 } from 'lucide-react';
import Link from 'next/link';
import { api } from '@/lib/api';
import { Button, Card, Input } from '@/ui';

type MediaType = 'MOVIE' | 'SERIES' | 'GAME' | 'ANIME' | 'MANGA' | 'COMIC';
type CatalogItem = {
  provider: 'TMDB' | 'IGDB' | 'ANILIST';
  externalId: string;
  mediaType: MediaType;
  title: string;
  originalTitle?: string | null;
  description?: string | null;
  coverUrl?: string | null;
  releaseDate?: string | null;
  genres?: string[];
  rating?: number | null;
  sourceUrl?: string | null;
};
type SearchResponse = { items: CatalogItem[]; providers: { TMDB: boolean; IGDB: boolean; ANILIST: boolean } };

const typeLabels: Record<MediaType, string> = {
  MOVIE: 'Filmes',
  SERIES: 'Séries',
  GAME: 'Games',
  ANIME: 'Anime',
  MANGA: 'Mangá',
  COMIC: 'HQs',
};
const providerLabels = { TMDB: 'TMDB', IGDB: 'IGDB', ANILIST: 'AniList' } as const;
const statusByType: Record<MediaType, { value: string; label: string }[]> = {
  MOVIE: [
    { value: 'WANT_TO_WATCH', label: 'Quero assistir' },
    { value: 'WATCHING', label: 'Assistindo' },
    { value: 'COMPLETED', label: 'Concluído' },
    { value: 'DROPPED', label: 'Abandonado' },
  ],
  SERIES: [
    { value: 'WANT_TO_WATCH', label: 'Quero assistir' },
    { value: 'WATCHING', label: 'Assistindo' },
    { value: 'COMPLETED', label: 'Concluído' },
    { value: 'DROPPED', label: 'Abandonado' },
  ],
  ANIME: [
    { value: 'WANT_TO_WATCH', label: 'Quero assistir' },
    { value: 'WATCHING', label: 'Assistindo' },
    { value: 'COMPLETED', label: 'Concluído' },
    { value: 'DROPPED', label: 'Abandonado' },
  ],
  GAME: [
    { value: 'WANT_TO_PLAY', label: 'Quero jogar' },
    { value: 'PLAYING', label: 'Jogando' },
    { value: 'COMPLETED', label: 'Concluído' },
    { value: 'DROPPED', label: 'Abandonado' },
  ],
  MANGA: [
    { value: 'WANT_TO_READ', label: 'Quero ler' },
    { value: 'READING', label: 'Lendo' },
    { value: 'COMPLETED', label: 'Concluído' },
    { value: 'DROPPED', label: 'Abandonado' },
  ],
  COMIC: [
    { value: 'WANT_TO_READ', label: 'Quero ler' },
    { value: 'READING', label: 'Lendo' },
    { value: 'COMPLETED', label: 'Concluído' },
    { value: 'DROPPED', label: 'Abandonado' },
  ],
};

function useDebounced<T>(value: T, delay = 350) {
  const [state, setState] = useState(value);
  useEffect(() => {
    const t = setTimeout(() => setState(value), delay);
    return () => clearTimeout(t);
  }, [value, delay]);
  return state;
}
function year(date?: string | null) {
  return date?.slice(0, 4) || '';
}

export function MediaCatalogBrowser({ compact = false }: { compact?: boolean }) {
  const qc = useQueryClient();
  const [type, setType] = useState<MediaType>('MOVIE');
  const [query, setQuery] = useState('');
  const debounced = useDebounced(query.trim());
  const [status, setStatus] = useState(statusByType.MOVIE[0].value);
  const [adding, setAdding] = useState<string | null>(null);
  const [added, setAdded] = useState<Record<string, boolean>>({});
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => setStatus(statusByType[type][0].value), [type]);
  const search = useQuery({
    queryKey: ['media-catalog-search', type, debounced],
    queryFn: () => api<SearchResponse>(`/api/catalog/search?q=${encodeURIComponent(debounced)}&type=${type}`),
    enabled: debounced.length >= 2,
    staleTime: 5 * 60 * 1000,
  });
  const items = search.data?.items || [];
  const providerMessage = useMemo(() => {
    if (type === 'MOVIE' || type === 'SERIES')
      return search.data && !search.data.providers.TMDB
        ? 'TMDB ainda não foi configurado no backend. Adicione TMDB_READ_TOKEN para ativar filmes e séries.'
        : null;
    if (type === 'GAME')
      return search.data && !search.data.providers.IGDB
        ? 'IGDB ainda não foi configurado. Adicione IGDB_CLIENT_ID e IGDB_CLIENT_SECRET para ativar games.'
        : null;
    if (type === 'COMIC')
      return 'HQs continuam com cadastro manual nesta primeira fase do Media Hub; um provider dedicado será a próxima etapa.';
    return null;
  }, [type, search.data]);

  async function add(item: CatalogItem) {
    const key = `${item.provider}:${item.mediaType}:${item.externalId}`;
    setAdding(key);
    setMessage(null);
    try {
      await api('/api/library/from-catalog', {
        method: 'POST',
        body: JSON.stringify({
          provider: item.provider,
          externalId: item.externalId,
          mediaType: item.mediaType,
          status,
        }),
      });
      setAdded(v => ({ ...v, [key]: true }));
      await qc.invalidateQueries({ queryKey: ['library'] });
    } catch (e: any) {
      setMessage(e?.message || 'Não foi possível adicionar o item.');
    } finally {
      setAdding(null);
    }
  }

  return (
    <div className={compact ? 'space-y-4' : 'space-y-6'}>
      <div className="grid gap-3 lg:grid-cols-[180px_1fr_200px]">
        <select
          value={type}
          onChange={e => setType(e.target.value as MediaType)}
          className="h-11 rounded-xl border border-white/10 bg-[#0b0714] px-3 text-sm outline-none focus:border-violet-400"
        >
          {(Object.keys(typeLabels) as MediaType[]).map(t => (
            <option key={t} value={t}>
              {typeLabels[t]}
            </option>
          ))}
        </select>
        <div className="relative">
          <Search size={17} className="absolute left-3 top-3 text-white/35" />
          <Input
            value={query}
            onChange={e => setQuery(e.target.value)}
            className="pl-9"
            placeholder={`Buscar ${typeLabels[type].toLowerCase()} no catálogo...`}
          />
        </div>
        <select
          value={status}
          onChange={e => setStatus(e.target.value)}
          className="h-11 rounded-xl border border-white/10 bg-[#0b0714] px-3 text-sm outline-none focus:border-violet-400"
        >
          {statusByType[type].map(s => (
            <option key={s.value} value={s.value}>
              {s.label}
            </option>
          ))}
        </select>
      </div>
      {providerMessage && (
        <div className="rounded-xl border border-amber-400/20 bg-amber-400/10 px-4 py-3 text-sm text-amber-100">
          {providerMessage}
        </div>
      )}
      {message && (
        <div className="rounded-xl border border-rose-500/30 bg-rose-500/10 px-4 py-3 text-sm text-rose-200">
          {message}
        </div>
      )}
      {debounced.length < 2 && (
        <div className="rounded-2xl border border-dashed border-white/10 p-8 text-center text-sm text-white/40">
          <Sparkles className="mx-auto mb-3" />
          Digite pelo menos 2 letras. O Hypeverso busca capa, descrição, lançamento e gêneros automaticamente.
        </div>
      )}
      {search.isFetching && debounced.length >= 2 && (
        <div className="flex items-center justify-center gap-2 py-8 text-white/50">
          <Loader2 className="animate-spin" />
          Buscando catálogo...
        </div>
      )}
      {search.error && (
        <div className="rounded-xl border border-rose-500/30 bg-rose-500/10 px-4 py-3 text-sm text-rose-200">
          {(search.error as Error).message}
        </div>
      )}
      {debounced.length >= 2 && !search.isFetching && !search.error && !items.length && (
        <div className="py-8 text-center text-sm text-white/40">
          Nenhum resultado encontrado com os provedores configurados.
        </div>
      )}
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
        {items.map(item => {
          const key = `${item.provider}:${item.mediaType}:${item.externalId}`;
          const isAdding = adding === key;
          const isAdded = added[key];
          return (
            <Card key={key} className="overflow-hidden p-0">
              <div className="flex min-h-44 gap-4 p-4">
                <div className="h-40 w-28 shrink-0 overflow-hidden rounded-xl bg-white/5">
                  {item.coverUrl ? (
                    <img src={item.coverUrl} alt={`Capa de ${item.title}`} className="h-full w-full object-cover" />
                  ) : (
                    <div className="grid h-full place-items-center text-white/25">
                      {type === 'GAME' ? <Gamepad2 /> : type === 'SERIES' ? <Tv2 /> : <Film />}
                    </div>
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="rounded-full border border-white/10 px-2 py-0.5 text-[10px] font-bold text-cyan-300">
                      {providerLabels[item.provider]}
                    </span>
                    {year(item.releaseDate) && <span className="text-xs text-white/45">{year(item.releaseDate)}</span>}
                    {typeof item.rating === 'number' && item.rating > 0 && (
                      <span className="text-xs text-amber-200">★ {item.rating.toFixed(1)}</span>
                    )}
                  </div>
                  <h3 className="mt-2 line-clamp-2 font-bold">{item.title}</h3>
                  {!!item.genres?.length && (
                    <p className="mt-1 line-clamp-1 text-xs text-violet-200/70">
                      {item.genres.slice(0, 3).join(' · ')}
                    </p>
                  )}
                  <p className="mt-2 line-clamp-3 text-xs leading-5 text-white/45">
                    {item.description || 'Sem sinopse disponível.'}
                  </p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    <Button className="h-9 px-3 text-xs" disabled={isAdding || isAdded} onClick={() => void add(item)}>
                      {isAdding ? (
                        <>
                          <Loader2 size={14} className="animate-spin" />
                          Adicionando
                        </>
                      ) : isAdded ? (
                        <>
                          <Check size={14} />
                          Na biblioteca
                        </>
                      ) : (
                        <>
                          <Plus size={14} />
                          Adicionar
                        </>
                      )}
                    </Button>
                    <Link
                      href={`/catalogo/${item.provider}/${item.mediaType}/${item.externalId}`}
                      className="inline-flex h-9 items-center gap-1 rounded-xl border border-white/10 px-3 text-xs font-semibold text-white/60 hover:bg-white/5 hover:text-white"
                    >
                      <ExternalLink size={13} />
                      Detalhes
                    </Link>
                  </div>
                </div>
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
