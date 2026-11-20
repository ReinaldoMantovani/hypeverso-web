'use client';
import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { ArrowLeft, Bell, BellOff, Check, ExternalLink, Loader2, Play, Plus, Star, Users } from 'lucide-react';
import Link from 'next/link';
import { api } from '@/lib/api';
import { useAuth } from '@/stores/auth';
import { assetUrl } from '@/lib/asset-url';
import { Button, Card } from '@/ui';
import { WatchProviders } from '@/components/catalog/watch-providers';
import { AffiliateLinks } from '@/components/catalog/affiliate-links';
import { CatalogReviews } from '@/components/catalog/catalog-reviews';
import { CatalogThreads } from '@/components/catalog/catalog-threads';
import { AddToList } from '@/components/catalog/add-to-list';

const statusByType: any = {
  MOVIE: [
    ['WANT_TO_WATCH', 'Quero assistir'],
    ['WATCHING', 'Assistindo'],
    ['COMPLETED', 'Concluído'],
  ],
  SERIES: [
    ['WANT_TO_WATCH', 'Quero assistir'],
    ['WATCHING', 'Assistindo'],
    ['COMPLETED', 'Concluído'],
  ],
  ANIME: [
    ['WANT_TO_WATCH', 'Quero assistir'],
    ['WATCHING', 'Assistindo'],
    ['COMPLETED', 'Concluído'],
  ],
  GAME: [
    ['WANT_TO_PLAY', 'Quero jogar'],
    ['PLAYING', 'Jogando'],
    ['COMPLETED', 'Concluído'],
  ],
  MANGA: [
    ['WANT_TO_READ', 'Quero ler'],
    ['READING', 'Lendo'],
    ['COMPLETED', 'Concluído'],
  ],
  COMIC: [
    ['WANT_TO_READ', 'Quero ler'],
    ['READING', 'Lendo'],
    ['COMPLETED', 'Concluído'],
  ],
};
const typeLabel: any = { MOVIE: 'Filme', SERIES: 'Série', ANIME: 'Anime', GAME: 'Game', MANGA: 'Mangá', COMIC: 'HQ' };

export default function CatalogDetailPage() {
  const params = useParams<{ provider: string; type: string; externalId: string }>();
  const qc = useQueryClient();
  const { user } = useAuth();
  const [status, setStatus] = useState((statusByType[params.type] || statusByType.MOVIE)[0][0]);
  const [adding, setAdding] = useState(false);
  const [added, setAdded] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [reminderBusy, setReminderBusy] = useState(false);
  const [remindDays, setRemindDays] = useState(1);
  const query = useQuery({
    queryKey: ['catalog-detail', params.provider, params.type, params.externalId],
    queryFn: () => api<any>(`/api/catalog/${params.provider}/${params.type}/${params.externalId}`),
  });
  const catalogId = query.data?.catalogId as string | undefined;
  const related = useQuery({
    queryKey: ['catalog-related-posts', catalogId],
    queryFn: () => api<{ posts: any[] }>(`/api/catalog/items/${catalogId}/related-posts`),
    enabled: Boolean(catalogId),
    staleTime: 5 * 60_000,
  });
  const reminder = useQuery({
    queryKey: ['media-release-reminder', catalogId],
    queryFn: () => api<{ reminder: any }>(`/api/catalog/reminders/${catalogId}`),
    enabled: Boolean(user && catalogId),
    staleTime: 20_000,
  });
  useEffect(() => {
    if (reminder.data?.reminder?.remindBeforeDays !== undefined) setRemindDays(reminder.data.reminder.remindBeforeDays);
  }, [reminder.data]);
  async function add() {
    setAdding(true);
    setMessage(null);
    try {
      await api('/api/library/from-catalog', {
        method: 'POST',
        body: JSON.stringify({
          provider: params.provider,
          externalId: params.externalId,
          mediaType: params.type,
          status,
        }),
      });
      setAdded(true);
      await qc.invalidateQueries({ queryKey: ['library'] });
    } catch (e: any) {
      setMessage(e?.message || 'Não foi possível adicionar.');
    } finally {
      setAdding(false);
    }
  }
  async function toggleReminder() {
    if (!user) {
      setMessage('Entre na sua conta para criar um lembrete de lançamento.');
      return;
    }
    if (!catalogId) return;
    setReminderBusy(true);
    setMessage(null);
    try {
      if (reminder.data?.reminder) await api(`/api/catalog/reminders/${catalogId}`, { method: 'DELETE' });
      else
        await api('/api/catalog/reminders', {
          method: 'POST',
          body: JSON.stringify({ catalogItemId: catalogId, remindBeforeDays: remindDays }),
        });
      await Promise.all([
        qc.invalidateQueries({ queryKey: ['media-release-reminder', catalogId] }),
        qc.invalidateQueries({ queryKey: ['media-release-reminders'] }),
      ]);
    } catch (e: any) {
      setMessage(e?.message || 'Não foi possível atualizar o lembrete.');
    } finally {
      setReminderBusy(false);
    }
  }
  if (query.isLoading)
    return (
      <div className="mx-auto flex max-w-5xl items-center justify-center gap-2 px-4 py-24 text-white/50">
        <Loader2 className="animate-spin" />
        Carregando detalhes...
      </div>
    );
  if (query.error || !query.data)
    return (
      <div className="mx-auto max-w-5xl px-4 py-16">
        <p className="text-rose-300">{(query.error as Error)?.message || 'Item não encontrado.'}</p>
      </div>
    );
  const item = query.data;
  const metadata = item.metadata || {};
  const futureRelease =
    item.releaseDate && new Date(`${String(item.releaseDate).slice(0, 10)}T23:59:59`).getTime() >= Date.now();
  const cast = Array.isArray(metadata.cast) ? metadata.cast : [];
  const crew = Array.isArray(metadata.crew) ? metadata.crew : [];
  const studios = Array.isArray(metadata.studios) ? metadata.studios : [];
  const tags = Array.isArray(metadata.tags) ? metadata.tags : [];
  const info = [
    metadata.runtime && ['Duração', `${metadata.runtime} min`],
    metadata.numberOfSeasons && ['Temporadas', metadata.numberOfSeasons],
    metadata.numberOfEpisodes && ['Episódios', metadata.numberOfEpisodes],
    metadata.episodes && ['Episódios', metadata.episodes],
    metadata.chapters && ['Capítulos', metadata.chapters],
    metadata.volumes && ['Volumes', metadata.volumes],
    metadata.format && ['Formato', metadata.format],
    metadata.status && ['Status', metadata.status],
    Array.isArray(metadata.platforms) &&
      metadata.platforms.length && ['Plataformas', metadata.platforms.slice(0, 8).join(', ')],
    Array.isArray(metadata.companies) &&
      metadata.companies.length && ['Empresas', metadata.companies.slice(0, 6).join(', ')],
  ].filter(Boolean) as any[];
  return (
    <section className="mx-auto max-w-7xl px-4 py-10">
      <Link href="/catalogo" className="mb-6 inline-flex items-center gap-2 text-sm text-white/50 hover:text-white">
        <ArrowLeft size={16} />
        Voltar ao catálogo
      </Link>
      <Card className="overflow-hidden p-0">
        <div className="relative min-h-56 bg-white/5">
          {item.backdropUrl && (
            <img src={item.backdropUrl} alt="" className="absolute inset-0 h-full w-full object-cover opacity-35" />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-[#090611] via-[#090611cc] to-[#09061122]" />
          <div className="relative flex flex-col gap-6 p-6 md:flex-row md:p-8">
            {item.coverUrl && (
              <img
                src={item.coverUrl}
                alt={`Capa de ${item.title}`}
                className="h-80 w-52 shrink-0 rounded-2xl object-cover shadow-2xl"
              />
            )}
            <div className="min-w-0 self-end">
              <div className="flex flex-wrap gap-2 text-xs font-semibold text-cyan-300">
                <span>{typeLabel[item.mediaType] || item.mediaType}</span>
                <span>•</span>
                <span>{item.provider}</span>
                {item.releaseDate && (
                  <>
                    <span>•</span>
                    <span>
                      {new Date(`${String(item.releaseDate).slice(0, 10)}T12:00:00`).toLocaleDateString('pt-BR')}
                    </span>
                  </>
                )}
                {typeof item.rating === 'number' && (
                  <>
                    <span>•</span>
                    <span className="inline-flex items-center gap-1 text-amber-200">
                      <Star size={13} />
                      {item.rating.toFixed(1)}
                    </span>
                  </>
                )}
              </div>
              <h1 className="mt-3 max-w-4xl text-4xl font-black md:text-5xl">{item.title}</h1>
              {metadata.tagline && <p className="mt-2 text-lg italic text-white/50">{metadata.tagline}</p>}
              {item.originalTitle && item.originalTitle !== item.title && (
                <p className="mt-2 text-white/40">Título original: {item.originalTitle}</p>
              )}
              <div className="mt-4 flex flex-wrap gap-2">
                {(item.genres || []).map((g: string) => (
                  <span
                    key={g}
                    className="rounded-full border border-white/10 bg-black/20 px-3 py-1 text-xs text-white/65"
                  >
                    {g}
                  </span>
                ))}
              </div>
              <div className="mt-6 flex flex-wrap items-center gap-3">
                <select
                  value={status}
                  onChange={e => setStatus(e.target.value)}
                  className="h-10 rounded-xl border border-white/10 bg-[#0b0714] px-3 text-sm"
                >
                  {(statusByType[params.type] || statusByType.MOVIE).map(([v, l]: string[]) => (
                    <option key={v} value={v}>
                      {l}
                    </option>
                  ))}
                </select>
                <Button disabled={adding || added} onClick={() => void add()}>
                  {adding ? (
                    <>
                      <Loader2 size={16} className="animate-spin" />
                      Adicionando
                    </>
                  ) : added ? (
                    <>
                      <Check size={16} />
                      Na biblioteca
                    </>
                  ) : (
                    <>
                      <Plus size={16} />
                      Adicionar à biblioteca
                    </>
                  )}
                </Button>
                <AddToList provider={params.provider} mediaType={params.type} externalId={params.externalId} />
                {item.trailerUrl && (
                  <a href={item.trailerUrl} target="_blank" rel="noopener noreferrer">
                    <Button variant="outline">
                      <Play size={16} />
                      Trailer
                    </Button>
                  </a>
                )}
                {item.sourceUrl && (
                  <a
                    href={item.sourceUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 text-sm text-white/55 hover:text-white"
                  >
                    <ExternalLink size={15} />
                    Fonte
                  </a>
                )}
              </div>
              {futureRelease && (
                <div className="mt-4 flex flex-wrap items-center gap-2">
                  <select
                    value={remindDays}
                    disabled={Boolean(reminder.data?.reminder)}
                    onChange={e => setRemindDays(Number(e.target.value))}
                    className="h-9 rounded-xl border border-white/10 bg-[#0b0714] px-3 text-xs"
                  >
                    <option value={0}>Avisar no dia</option>
                    <option value={1}>1 dia antes</option>
                    <option value={3}>3 dias antes</option>
                    <option value={7}>7 dias antes</option>
                  </select>
                  <button
                    onClick={() => void toggleReminder()}
                    disabled={reminderBusy}
                    className={`inline-flex h-9 items-center gap-2 rounded-xl border px-3 text-xs font-bold ${reminder.data?.reminder ? 'border-violet-400/30 bg-violet-400/10 text-violet-200' : 'border-white/10 text-white/65 hover:bg-white/5'}`}
                  >
                    {reminderBusy ? (
                      <Loader2 size={14} className="animate-spin" />
                    ) : reminder.data?.reminder ? (
                      <BellOff size={14} />
                    ) : (
                      <Bell size={14} />
                    )}{' '}
                    {reminder.data?.reminder ? 'Remover lembrete' : 'Avisar no lançamento'}
                  </button>
                </div>
              )}
              {message && <p className="mt-4 text-sm text-rose-300">{message}</p>}
            </div>
          </div>
        </div>
        <div className="grid gap-8 p-6 lg:grid-cols-[1fr_320px] lg:p-8">
          <div className="space-y-8">
            <div>
              <h2 className="text-xl font-bold">Sobre</h2>
              <p className="mt-3 whitespace-pre-line leading-7 text-white/65">
                {item.description || 'Ainda não há sinopse disponível para este item.'}
              </p>
            </div>
            {cast.length > 0 && (
              <div>
                <div className="mb-4 flex items-center gap-2">
                  <Users size={18} className="text-violet-300" />
                  <h2 className="text-xl font-bold">Elenco</h2>
                </div>
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                  {cast.slice(0, 8).map((p: any) => (
                    <div key={`${p.id}-${p.name}`} className="rounded-xl border border-white/10 bg-white/[.025] p-3">
                      {p.profileUrl ? (
                        <img
                          src={p.profileUrl}
                          alt={p.name}
                          className="mb-3 aspect-[3/4] w-full rounded-lg object-cover"
                        />
                      ) : (
                        <div className="mb-3 aspect-[3/4] w-full rounded-lg bg-white/5" />
                      )}
                      <div className="text-sm font-bold">{p.name}</div>
                      {p.character && <div className="mt-1 text-xs text-white/40">{p.character}</div>}
                    </div>
                  ))}
                </div>
              </div>
            )}
            {(studios.length > 0 || crew.length > 0) && (
              <div>
                <h2 className="text-xl font-bold">Produção</h2>
                <div className="mt-3 grid gap-2 sm:grid-cols-2">
                  {studios.slice(0, 6).map((s: any) => (
                    <div key={s.name} className="rounded-xl border border-white/10 p-3 text-sm">
                      <span className="text-white/45">Estúdio</span>
                      <div className="mt-1 font-semibold">{s.name}</div>
                    </div>
                  ))}
                  {crew.slice(0, 6).map((p: any) => (
                    <div key={`${p.id}-${p.job}`} className="rounded-xl border border-white/10 p-3 text-sm">
                      <span className="text-white/45">{p.job}</span>
                      <div className="mt-1 font-semibold">{p.name}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}
            {tags.length > 0 && (
              <div>
                <h2 className="text-xl font-bold">Temas</h2>
                <div className="mt-3 flex flex-wrap gap-2">
                  {tags.slice(0, 12).map((t: string) => (
                    <span key={t} className="rounded-full bg-violet-400/10 px-3 py-1 text-xs text-violet-200">
                      {t}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
          <aside className="space-y-4">
            <WatchProviders provider={params.provider} type={params.type} externalId={params.externalId} />
            <AffiliateLinks title={item.title} type={item.mediaType} catalogId={catalogId} />
            <h2 className="text-lg font-bold">Informações</h2>
            {info.map(([label, value]: any) => (
              <div key={label} className="rounded-xl border border-white/10 bg-white/[.02] p-3">
                <div className="text-xs uppercase tracking-wider text-white/35">{label}</div>
                <div className="mt-1 text-sm font-semibold">{String(value)}</div>
              </div>
            ))}
          </aside>
        </div>
      </Card>
      <section className="mt-10">
        <div className="mb-4 flex items-end justify-between gap-4">
          <div>
            <p className="text-xs font-black uppercase tracking-[.24em] text-cyan-300">Hypeverso Editorial</p>
            <h2 className="mt-1 text-2xl font-black">Notícias relacionadas</h2>
          </div>
          <Link
            href={`/buscar?q=${encodeURIComponent(item.title)}`}
            className="text-sm text-violet-300 hover:text-violet-200"
          >
            Ver busca completa
          </Link>
        </div>
        {related.isLoading ? (
          <div className="flex items-center gap-2 text-white/40">
            <Loader2 size={16} className="animate-spin" />
            Buscando notícias...
          </div>
        ) : related.data?.posts?.length ? (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {related.data.posts.map((post: any) => (
              <Link key={post.id} href={`/post/${post.slug}`}>
                <Card className="h-full overflow-hidden p-0 transition hover:-translate-y-0.5 hover:border-violet-400/30">
                  {post.coverImageUrl && (
                    <img src={assetUrl(post.coverImageUrl)} alt="" className="h-36 w-full object-cover" />
                  )}
                  <div className="p-4">
                    <div className="text-xs font-semibold text-cyan-300">{post.category?.name}</div>
                    <h3 className="mt-1 line-clamp-2 font-bold">{post.title}</h3>
                    <p className="mt-2 line-clamp-2 text-sm text-white/45">{post.description}</p>
                  </div>
                </Card>
              </Link>
            ))}
          </div>
        ) : (
          <Card className="p-6 text-sm text-white/40">
            Ainda não há notícias relacionadas a esta obra. Quando o CMS ou AI News Studio publicar conteúdo
            relacionado, ele aparecerá aqui automaticamente.
          </Card>
        )}
      </section>
      {catalogId && <CatalogReviews catalogId={catalogId} />}
      {catalogId && <CatalogThreads catalogId={catalogId} mediaType={item.mediaType} />}
    </section>
  );
}
