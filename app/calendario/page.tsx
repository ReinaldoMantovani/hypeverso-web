'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Bell, BellOff, CalendarDays, ChevronLeft, ChevronRight, Loader2, Star } from 'lucide-react';
import { api } from '@/lib/api';
import { useAuth } from '@/stores/auth';
import { Button, Card } from '@/ui';

type MediaType = 'MOVIE' | 'SERIES' | 'GAME' | 'ANIME' | 'MANGA' | 'COMIC';
type ReleaseItem = {
  provider: 'TMDB' | 'IGDB' | 'ANILIST' | 'METRON' | 'GOOGLE_BOOKS';
  externalId: string;
  mediaType: MediaType;
  title: string;
  coverUrl?: string | null;
  releaseDate?: string | null;
  rating?: number | null;
  genres?: string[];
};
type Reminder = {
  id: string;
  catalogItemId: string;
  remindBeforeDays: number;
  notifiedAt?: string | null;
  catalogItem: {
    id: string;
    provider: string;
    externalId: string;
    mediaType: string;
    title: string;
    releaseDate?: string | null;
  };
};

const typeLabels: Record<MediaType, string> = {
  MOVIE: 'Filmes',
  SERIES: 'Séries',
  GAME: 'Games',
  ANIME: 'Anime',
  MANGA: 'Mangá',
  COMIC: 'HQ',
};
const weekdays = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
const pad = (n: number) => String(n).padStart(2, '0');
const localKey = (d: Date) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
const itemKey = (i: { provider: string; mediaType: string; externalId: string }) =>
  `${i.provider}:${i.mediaType}:${i.externalId}`;

export default function CalendarPage() {
  const { user } = useAuth();
  const qc = useQueryClient();
  const [month, setMonth] = useState(() => {
    const d = new Date();
    return new Date(d.getFullYear(), d.getMonth(), 1);
  });
  const [type, setType] = useState<MediaType | ''>('');
  const [remindDays, setRemindDays] = useState(1);
  const [busy, setBusy] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const from = localKey(new Date(month.getFullYear(), month.getMonth(), 1));
  const to = localKey(new Date(month.getFullYear(), month.getMonth() + 1, 0));
  const releases = useQuery({
    queryKey: ['catalog-releases', from, to, type],
    queryFn: () =>
      api<{ items: ReleaseItem[] }>(`/api/catalog/releases?from=${from}&to=${to}${type ? `&type=${type}` : ''}`),
    staleTime: 15 * 60_000,
  });
  const reminders = useQuery({
    queryKey: ['media-release-reminders'],
    queryFn: () => api<Reminder[]>('/api/catalog/reminders'),
    enabled: Boolean(user),
    staleTime: 30_000,
  });
  const reminderMap = useMemo(
    () => new Map((reminders.data || []).map(r => [itemKey(r.catalogItem), r])),
    [reminders.data],
  );
  const byDate = useMemo(() => {
    const m = new Map<string, ReleaseItem[]>();
    for (const item of releases.data?.items || []) {
      if (!item.releaseDate) continue;
      const key = item.releaseDate.slice(0, 10);
      const list = m.get(key) || [];
      list.push(item);
      m.set(key, list);
    }
    return m;
  }, [releases.data]);
  const cells = useMemo(() => {
    const first = new Date(month.getFullYear(), month.getMonth(), 1);
    const start = new Date(first);
    start.setDate(first.getDate() - first.getDay());
    return Array.from({ length: 42 }, (_, i) => {
      const d = new Date(start);
      d.setDate(start.getDate() + i);
      return d;
    });
  }, [month]);
  async function toggleReminder(item: ReleaseItem) {
    if (!user) {
      setMessage('Entre na sua conta para criar lembretes de lançamento.');
      return;
    }
    const key = itemKey(item);
    const existing = reminderMap.get(key);
    setBusy(key);
    setMessage(null);
    try {
      if (existing) await api(`/api/catalog/reminders/${existing.catalogItemId}`, { method: 'DELETE' });
      else
        await api('/api/catalog/reminders', {
          method: 'POST',
          body: JSON.stringify({
            provider: item.provider,
            externalId: item.externalId,
            mediaType: item.mediaType,
            remindBeforeDays: remindDays,
          }),
        });
      await qc.invalidateQueries({ queryKey: ['media-release-reminders'] });
    } catch (e: any) {
      setMessage(e?.message || 'Não foi possível atualizar o lembrete.');
    } finally {
      setBusy(null);
    }
  }
  const monthLabel = month.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' });
  return (
    <section className="mx-auto max-w-7xl px-4 py-10">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-xs font-black uppercase tracking-[.28em] text-cyan-300">Hypeverso Media Hub</p>
          <h1 className="mt-2 text-4xl font-black">Calendário de lançamentos</h1>
          <p className="mt-2 max-w-3xl text-white/50">
            Acompanhe estreias de filmes, séries, games, anime e mangás e crie lembretes pessoais.
          </p>
        </div>
        <Link href="/catalogo">
          <Button variant="outline">Explorar catálogo</Button>
        </Link>
      </div>
      <Card className="mt-7 p-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <button
              aria-label="Mês anterior"
              onClick={() => setMonth(new Date(month.getFullYear(), month.getMonth() - 1, 1))}
              className="rounded-xl border border-white/10 p-2 hover:bg-white/5"
            >
              <ChevronLeft size={18} />
            </button>
            <div className="min-w-44 text-center text-lg font-black capitalize">{monthLabel}</div>
            <button
              aria-label="Próximo mês"
              onClick={() => setMonth(new Date(month.getFullYear(), month.getMonth() + 1, 1))}
              className="rounded-xl border border-white/10 p-2 hover:bg-white/5"
            >
              <ChevronRight size={18} />
            </button>
          </div>
          <div className="flex flex-wrap gap-2">
            <select
              value={type}
              onChange={e => setType(e.target.value as MediaType | '')}
              className="h-10 rounded-xl border border-white/10 bg-[#0b0714] px-3 text-sm"
            >
              <option value="">Todos os tipos</option>
              {Object.entries(typeLabels).map(([v, l]) => (
                <option key={v} value={v}>
                  {l}
                </option>
              ))}
            </select>
            {user && (
              <select
                value={remindDays}
                onChange={e => setRemindDays(Number(e.target.value))}
                className="h-10 rounded-xl border border-white/10 bg-[#0b0714] px-3 text-sm"
              >
                <option value={0}>Lembrar no dia</option>
                <option value={1}>1 dia antes</option>
                <option value={3}>3 dias antes</option>
                <option value={7}>7 dias antes</option>
              </select>
            )}
          </div>
        </div>
      </Card>
      {message && (
        <div className="mt-4 rounded-xl border border-amber-400/20 bg-amber-400/10 px-4 py-3 text-sm text-amber-100">
          {message}
        </div>
      )}
      {releases.error && (
        <div className="mt-5 rounded-xl border border-rose-400/20 bg-rose-400/10 p-4 text-rose-200">
          {(releases.error as Error).message}
        </div>
      )}
      <div className="mt-6 overflow-hidden rounded-2xl border border-white/10 bg-[#090611]/80">
        <div className="grid grid-cols-7 border-b border-white/10 bg-white/[.025]">
          {weekdays.map(w => (
            <div key={w} className="px-2 py-3 text-center text-xs font-bold uppercase tracking-wider text-white/35">
              {w}
            </div>
          ))}
        </div>
        <div className="grid grid-cols-7">
          {cells.map((day, index) => {
            const key = localKey(day);
            const items = byDate.get(key) || [];
            const inMonth = day.getMonth() === month.getMonth();
            const today = key === localKey(new Date());
            return (
              <div
                key={key}
                className={`min-h-32 border-b border-r border-white/[.06] p-2 ${!inMonth ? 'bg-black/20 opacity-35' : ''}`}
              >
                <div
                  className={`mb-2 inline-grid h-7 w-7 place-items-center rounded-full text-xs font-bold ${today ? 'bg-violet-600 text-white' : 'text-white/50'}`}
                >
                  {day.getDate()}
                </div>
                <div className="space-y-1.5">
                  {items.slice(0, 3).map(item => {
                    const r = reminderMap.get(itemKey(item));
                    return (
                      <div key={itemKey(item)} className="group relative">
                        <Link
                          href={`/catalogo/${item.provider}/${item.mediaType}/${item.externalId}`}
                          className="flex min-w-0 items-center gap-2 rounded-lg border border-white/[.06] bg-white/[.035] p-1.5 hover:border-violet-400/30 hover:bg-white/[.06]"
                        >
                          {item.coverUrl ? (
                            <img src={item.coverUrl} alt="" className="h-9 w-7 shrink-0 rounded object-cover" />
                          ) : (
                            <div className="h-9 w-7 shrink-0 rounded bg-white/5" />
                          )}
                          <div className="min-w-0">
                            <div className="truncate text-[11px] font-semibold">{item.title}</div>
                            <div className="text-[9px] uppercase text-cyan-300/70">{typeLabels[item.mediaType]}</div>
                          </div>
                        </Link>
                        {user && (
                          <button
                            title={r ? 'Remover lembrete' : 'Criar lembrete'}
                            disabled={busy === itemKey(item)}
                            onClick={() => void toggleReminder(item)}
                            className="absolute right-1 top-1 rounded-md bg-black/75 p-1 text-white/60 opacity-0 transition hover:text-white group-hover:opacity-100 focus:opacity-100"
                          >
                            {busy === itemKey(item) ? (
                              <Loader2 size={11} className="animate-spin" />
                            ) : r ? (
                              <BellOff size={11} />
                            ) : (
                              <Bell size={11} />
                            )}
                          </button>
                        )}
                      </div>
                    );
                  })}
                  {items.length > 3 && <div className="text-[10px] text-white/35">+{items.length - 3} lançamentos</div>}
                </div>
              </div>
            );
          })}
        </div>
      </div>
      {releases.isLoading && (
        <div className="mt-8 flex items-center justify-center gap-2 text-white/45">
          <Loader2 className="animate-spin" size={18} />
          Carregando lançamentos...
        </div>
      )}
      <div className="mt-10">
        <div className="mb-4 flex items-center gap-2">
          <CalendarDays className="text-violet-300" />
          <h2 className="text-2xl font-black">Lançamentos do mês</h2>
        </div>
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          {(releases.data?.items || []).map(item => {
            const r = reminderMap.get(itemKey(item));
            return (
              <Card key={itemKey(item)} className="flex gap-3 p-3">
                <Link
                  href={`/catalogo/${item.provider}/${item.mediaType}/${item.externalId}`}
                  className="h-28 w-20 shrink-0 overflow-hidden rounded-xl bg-white/5"
                >
                  {item.coverUrl && (
                    <img src={item.coverUrl} alt={`Capa de ${item.title}`} className="h-full w-full object-cover" />
                  )}
                </Link>
                <div className="min-w-0 flex-1">
                  <div className="text-xs font-semibold text-cyan-300">
                    {item.releaseDate
                      ? new Date(`${item.releaseDate.slice(0, 10)}T12:00:00`).toLocaleDateString('pt-BR', {
                          day: '2-digit',
                          month: 'short',
                        })
                      : 'Sem data'}{' '}
                    · {typeLabels[item.mediaType]}
                  </div>
                  <Link
                    href={`/catalogo/${item.provider}/${item.mediaType}/${item.externalId}`}
                    className="mt-1 line-clamp-2 font-bold hover:text-violet-200"
                  >
                    {item.title}
                  </Link>
                  {typeof item.rating === 'number' && (
                    <div className="mt-1 inline-flex items-center gap-1 text-xs text-amber-200">
                      <Star size={12} />
                      {item.rating.toFixed(1)}
                    </div>
                  )}
                  {user && (
                    <button
                      disabled={busy === itemKey(item)}
                      onClick={() => void toggleReminder(item)}
                      className={`mt-3 inline-flex items-center gap-1.5 rounded-lg border px-2.5 py-1.5 text-xs font-semibold ${r ? 'border-violet-400/30 bg-violet-400/10 text-violet-200' : 'border-white/10 text-white/60 hover:bg-white/5'}`}
                    >
                      {busy === itemKey(item) ? (
                        <Loader2 size={13} className="animate-spin" />
                      ) : r ? (
                        <BellOff size={13} />
                      ) : (
                        <Bell size={13} />
                      )}{' '}
                      {r ? 'Lembrete ativo' : 'Criar lembrete'}
                    </button>
                  )}
                </div>
              </Card>
            );
          })}
        </div>
        {!releases.isLoading && !releases.data?.items?.length && (
          <div className="rounded-2xl border border-white/10 p-8 text-center text-white/40">
            Nenhum lançamento encontrado para este período com os provedores atualmente configurados.
          </div>
        )}
      </div>
    </section>
  );
}
