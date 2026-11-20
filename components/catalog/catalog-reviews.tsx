'use client';
import { useState } from 'react';
import Link from 'next/link';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Star, Trash2 } from 'lucide-react';
import { Button, Card, Input, Textarea } from '@/ui';
import { api } from '@/lib/api';
import { useAuth } from '@/stores/auth';
import { SpoilerText } from '@/components/spoiler-text';

type Review = {
  id: string;
  rating: number;
  title: string | null;
  body: string | null;
  spoiler: boolean;
  createdAt: string;
  user: { id: string; name: string; username: string; level: number };
};
type Data = {
  summary: { average: number | null; count: number; distribution: Record<string, number> };
  items: Review[];
  viewerReview: Review | null;
};

/** Avaliações da comunidade (nota 1–10) com média, distribuição e proteção de spoiler. */
export function CatalogReviews({ catalogId }: { catalogId: string }) {
  const { user } = useAuth();
  const qc = useQueryClient();
  const q = useQuery({
    queryKey: ['reviews', catalogId],
    queryFn: () => api<Data>(`/api/catalog/items/${catalogId}/reviews`),
  });
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({ rating: 0, title: '', body: '', spoiler: false });
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const mine = q.data?.viewerReview;
  const summary = q.data?.summary;
  const max = Math.max(1, ...Object.values(summary?.distribution || { a: 0 }));

  function startEdit() {
    setForm({
      rating: mine?.rating || 0,
      title: mine?.title || '',
      body: mine?.body || '',
      spoiler: mine?.spoiler || false,
    });
    setEditing(true);
  }
  async function save(e: React.FormEvent) {
    e.preventDefault();
    if (!form.rating) return setError('Escolha uma nota de 1 a 10.');
    setBusy(true);
    setError('');
    try {
      await api(`/api/catalog/items/${catalogId}/reviews`, { method: 'PUT', body: JSON.stringify(form) });
      setEditing(false);
      await qc.invalidateQueries({ queryKey: ['reviews', catalogId] });
    } catch (err: any) {
      setError(err?.message || 'Não foi possível salvar.');
    } finally {
      setBusy(false);
    }
  }

  return (
    <section className="mt-10" aria-labelledby="reviews-title">
      <div className="mb-4 flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-xs font-black uppercase tracking-[.24em] text-cyan-300">Comunidade</p>
          <h2 id="reviews-title" className="mt-1 text-2xl font-black">
            Avaliações
          </h2>
        </div>
        {user ? (
          !editing && (
            <Button variant="outline" onClick={startEdit}>
              <Star size={15} /> {mine ? 'Editar minha avaliação' : 'Avaliar'}
            </Button>
          )
        ) : (
          <Link href="/login" className="text-sm text-violet-300">
            Entre para avaliar
          </Link>
        )}
      </div>
      <div className="grid gap-6 lg:grid-cols-[260px_1fr]">
        <Card className="p-5">
          <div className="flex items-end gap-2">
            <span className="text-5xl font-black">{summary?.average ?? '—'}</span>
            <span className="pb-2 text-white/40">/10</span>
          </div>
          <p className="mt-1 text-sm text-white/45">{summary?.count || 0} avaliações</p>
          <div className="mt-4 space-y-1">
            {Array.from({ length: 10 }, (_, i) => 10 - i).map(n => (
              <div key={n} className="flex items-center gap-2 text-xs text-white/50">
                <span className="w-4 text-right">{n}</span>
                <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-white/5">
                  <div
                    className="h-full rounded-full bg-amber-300/80"
                    style={{ width: `${((summary?.distribution[n] || 0) / max) * 100}%` }}
                  />
                </div>
                <span className="w-6 text-right">{summary?.distribution[n] || 0}</span>
              </div>
            ))}
          </div>
        </Card>
        <div className="space-y-3">
          {editing && (
            <Card className="p-5">
              <form onSubmit={save} className="space-y-3">
                <div role="radiogroup" aria-label="Nota" className="flex flex-wrap gap-1">
                  {Array.from({ length: 10 }, (_, i) => i + 1).map(n => (
                    <button
                      type="button"
                      role="radio"
                      aria-checked={form.rating === n}
                      key={n}
                      onClick={() => setForm(f => ({ ...f, rating: n }))}
                      className={`h-9 w-9 rounded-lg border text-sm font-bold ${form.rating >= n ? 'border-amber-300/60 bg-amber-300/20 text-amber-100' : 'border-white/10 text-white/50 hover:bg-white/5'}`}
                    >
                      {n}
                    </button>
                  ))}
                </div>
                <Input
                  placeholder="Título (opcional)"
                  maxLength={120}
                  value={form.title}
                  onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
                />
                <Textarea
                  placeholder="O que você achou? Use ||texto|| para esconder um trecho com spoiler."
                  maxLength={5000}
                  value={form.body}
                  onChange={e => setForm(f => ({ ...f, body: e.target.value }))}
                />
                <label className="flex items-center gap-2 text-sm text-white/60">
                  <input
                    type="checkbox"
                    checked={form.spoiler}
                    onChange={e => setForm(f => ({ ...f, spoiler: e.target.checked }))}
                    className="accent-violet-500"
                  />
                  Minha avaliação inteira contém spoilers
                </label>
                {error && <p className="text-sm text-rose-300">{error}</p>}
                <div className="flex gap-2">
                  <Button disabled={busy}>{busy ? 'Salvando...' : 'Publicar avaliação'}</Button>
                  <Button type="button" variant="ghost" onClick={() => setEditing(false)}>
                    Cancelar
                  </Button>
                  {mine && (
                    <Button
                      type="button"
                      variant="ghost"
                      onClick={async () => {
                        await api(`/api/catalog/items/${catalogId}/reviews`, { method: 'DELETE' });
                        setEditing(false);
                        await qc.invalidateQueries({ queryKey: ['reviews', catalogId] });
                      }}
                    >
                      <Trash2 size={15} /> Excluir
                    </Button>
                  )}
                </div>
              </form>
            </Card>
          )}
          {!q.data?.items.length && !editing && (
            <Card className="p-6 text-sm text-white/45">Seja o primeiro a avaliar.</Card>
          )}
          {q.data?.items.map(r => (
            <Card key={r.id} className="p-5">
              <div className="flex flex-wrap items-center gap-2 text-sm">
                <span className="rounded-lg bg-amber-300/15 px-2 py-0.5 font-black text-amber-100">{r.rating}/10</span>
                <Link href={`/u/${r.user.username}`} className="font-bold hover:text-violet-200">
                  {r.user.name}
                </Link>
                <span className="text-xs text-white/35">
                  Nv.{r.user.level} · {new Date(r.createdAt).toLocaleDateString('pt-BR')}
                </span>
                {r.spoiler && (
                  <span className="rounded-full bg-rose-500/15 px-2 py-0.5 text-[11px] text-rose-200">Spoiler</span>
                )}
              </div>
              {r.title && <h3 className="mt-2 font-bold">{r.title}</h3>}
              {r.body && (
                <p className="mt-1 whitespace-pre-line text-sm leading-6 text-white/65">
                  <SpoilerText text={r.body} whole={r.spoiler} />
                </p>
              )}
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
