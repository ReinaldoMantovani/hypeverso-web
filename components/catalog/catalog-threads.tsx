'use client';
import { useState } from 'react';
import Link from 'next/link';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { CalendarClock, MessagesSquare, Plus } from 'lucide-react';
import { Button, Card, Input, Textarea } from '@/ui';
import { api } from '@/lib/api';
import { useAuth } from '@/stores/auth';

export type Thread = {
  id: string;
  kind: 'EPISODE' | 'WATCH_PARTY' | 'GENERAL';
  title: string;
  season: number | null;
  episode: number | null;
  startsAt: string | null;
  lockedAt: string | null;
  createdAt: string;
  _count: { messages: number };
  createdBy: { name: string; username: string };
  catalogItem?: { title: string } | null;
};

export const kindLabel = { EPISODE: 'Episódio', WATCH_PARTY: 'Watch party', GENERAL: 'Discussão' } as const;

/** Threads de episódio e watch parties ligadas a uma obra do catálogo. */
export function CatalogThreads({ catalogId, mediaType }: { catalogId: string; mediaType: string }) {
  const { user } = useAuth();
  const qc = useQueryClient();
  const q = useQuery({
    queryKey: ['threads', catalogId],
    queryFn: () => api<Thread[]>(`/api/catalog/items/${catalogId}/threads`),
  });
  const episodic = ['SERIES', 'ANIME'].includes(mediaType);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({
    kind: episodic ? 'EPISODE' : 'GENERAL',
    title: '',
    description: '',
    season: '',
    episode: '',
    startsAt: '',
  });
  const [error, setError] = useState('');

  async function create(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    try {
      const thread = await api<Thread>('/api/threads', {
        method: 'POST',
        body: JSON.stringify({
          catalogItemId: catalogId,
          kind: form.kind,
          title: form.title,
          description: form.description || null,
          season: form.season ? Number(form.season) : null,
          episode: form.episode ? Number(form.episode) : null,
          startsAt: form.startsAt ? new Date(form.startsAt).toISOString() : null,
        }),
      });
      setOpen(false);
      await qc.invalidateQueries({ queryKey: ['threads', catalogId] });
      window.location.href = `/discussoes/${thread.id}`;
    } catch (err: any) {
      setError(err?.message || 'Não foi possível criar.');
    }
  }

  return (
    <section className="mt-10" aria-labelledby="threads-title">
      <div className="mb-4 flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-xs font-black uppercase tracking-[.24em] text-cyan-300">Sem spoilers por acidente</p>
          <h2 id="threads-title" className="mt-1 text-2xl font-black">
            Discussões e watch parties
          </h2>
        </div>
        {user && (
          <Button variant="outline" onClick={() => setOpen(v => !v)}>
            <Plus size={15} /> Nova discussão
          </Button>
        )}
      </div>
      {open && (
        <Card className="mb-4 p-5">
          <form onSubmit={create} className="grid gap-3 sm:grid-cols-2">
            <select
              value={form.kind}
              onChange={e => setForm(f => ({ ...f, kind: e.target.value }))}
              className="h-11 rounded-xl border border-white/10 bg-[#0b0714] px-3 text-sm"
            >
              {episodic && <option value="EPISODE">Thread de episódio</option>}
              <option value="WATCH_PARTY">Watch party (data marcada)</option>
              <option value="GENERAL">Discussão geral</option>
            </select>
            <Input
              required
              minLength={3}
              maxLength={160}
              placeholder="Título"
              value={form.title}
              onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
            />
            {form.kind === 'EPISODE' && (
              <>
                <Input
                  type="number"
                  min={0}
                  placeholder="Temporada"
                  value={form.season}
                  onChange={e => setForm(f => ({ ...f, season: e.target.value }))}
                />
                <Input
                  type="number"
                  min={0}
                  placeholder="Episódio"
                  value={form.episode}
                  onChange={e => setForm(f => ({ ...f, episode: e.target.value }))}
                />
              </>
            )}
            {form.kind === 'WATCH_PARTY' && (
              <Input
                type="datetime-local"
                required
                value={form.startsAt}
                onChange={e => setForm(f => ({ ...f, startsAt: e.target.value }))}
              />
            )}
            <Textarea
              className="sm:col-span-2"
              maxLength={2000}
              placeholder="Descrição (opcional)"
              value={form.description}
              onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
            />
            {error && <p className="text-sm text-rose-300 sm:col-span-2">{error}</p>}
            <div className="sm:col-span-2">
              <Button>Criar</Button>
            </div>
          </form>
        </Card>
      )}
      {!q.data?.length ? (
        <Card className="p-6 text-sm text-white/45">Nenhuma discussão ainda. Que tal começar uma?</Card>
      ) : (
        <ul className="grid gap-3 md:grid-cols-2">
          {q.data.map(t => (
            <li key={t.id}>
              <ThreadCard thread={t} />
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

export function ThreadCard({ thread: t }: { thread: Thread }) {
  return (
    <Link href={`/discussoes/${t.id}`}>
      <Card className="h-full p-4 transition hover:border-violet-400/30">
        <div className="flex items-center gap-2 text-xs text-cyan-300">
          {t.kind === 'WATCH_PARTY' ? <CalendarClock size={14} /> : <MessagesSquare size={14} />}
          {kindLabel[t.kind]}
          {t.kind === 'EPISODE' && t.season != null && (
            <span className="text-white/45">
              T{t.season}
              {t.episode != null ? `E${t.episode}` : ''}
            </span>
          )}
          {t.lockedAt && <span className="text-white/40">· trancada</span>}
        </div>
        <h3 className="mt-1 line-clamp-2 font-bold">{t.title}</h3>
        <p className="mt-1 text-xs text-white/40">
          {t.catalogItem?.title ? `${t.catalogItem.title} · ` : ''}
          {t.startsAt
            ? `Começa ${new Date(t.startsAt).toLocaleString('pt-BR', { dateStyle: 'short', timeStyle: 'short' })} · `
            : ''}
          {t._count.messages} mensagens · por {t.createdBy.name}
        </p>
      </Card>
    </Link>
  );
}
