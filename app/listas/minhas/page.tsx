'use client';
import { useState } from 'react';
import Link from 'next/link';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { ArrowDown, ArrowUp, ExternalLink, Globe, Lock, Trash2, X } from 'lucide-react';
import { Button, Card, Input, Textarea } from '@/ui';
import { api } from '@/lib/api';
import { useAuth } from '@/stores/auth';
import { AccountNav } from '@/components/account-nav';
import type { ListSummary } from '@/components/lists/list-card';

type ListDetail = Omit<ListSummary, 'items'> & {
  items: { id: string; note: string | null; catalogItem: { title: string; coverUrl: string | null } }[];
};

export default function MyListsPage() {
  const { user, hydrated } = useAuth();
  const qc = useQueryClient();
  const lists = useQuery({
    queryKey: ['my-lists'],
    queryFn: () => api<ListSummary[]>('/api/lists/mine'),
    enabled: !!user,
  });
  const [selected, setSelected] = useState<string | null>(null);
  const detail = useQuery({
    queryKey: ['list', selected],
    queryFn: () => api<ListDetail>(`/api/lists/${selected}`),
    enabled: !!selected,
  });
  const [form, setForm] = useState({ title: '', description: '', isPublic: true });
  const [error, setError] = useState('');
  const refresh = () =>
    Promise.all([
      qc.invalidateQueries({ queryKey: ['my-lists'] }),
      qc.invalidateQueries({ queryKey: ['list', selected] }),
    ]);

  if (hydrated && !user)
    return (
      <section className="mx-auto max-w-2xl px-4 py-14">
        <Card className="p-7">
          <h1 className="text-2xl font-black">Minhas listas</h1>
          <p className="mt-2 text-white/55">Entre para criar listas como “Top 10 animes de 2026”.</p>
          <Link href="/login">
            <Button className="mt-5">Entrar</Button>
          </Link>
        </Card>
      </section>
    );

  async function move(index: number, dir: -1 | 1) {
    const items = detail.data?.items || [];
    const next = [...items];
    const [it] = next.splice(index, 1);
    next.splice(index + dir, 0, it);
    await api(`/api/lists/${selected}/order`, {
      method: 'PUT',
      body: JSON.stringify({ itemIds: next.map(i => i.id) }),
    });
    await refresh();
  }

  return (
    <section className="mx-auto max-w-5xl space-y-6 px-4 py-12" data-no-i18n>
      <AccountNav />
      <h1 className="text-3xl font-black">Minhas listas</h1>
      <Card className="p-5">
        <h2 className="font-bold">Nova lista</h2>
        <form
          className="mt-3 grid gap-3"
          onSubmit={async e => {
            e.preventDefault();
            setError('');
            try {
              const list = await api<ListSummary>('/api/lists', { method: 'POST', body: JSON.stringify(form) });
              setForm({ title: '', description: '', isPublic: true });
              setSelected(list.id);
              await refresh();
            } catch (err: any) {
              setError(err?.message || 'Não foi possível criar.');
            }
          }}
        >
          <Input
            required
            minLength={3}
            maxLength={120}
            placeholder="Ex.: Top 10 animes de 2026"
            value={form.title}
            onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
          />
          <Textarea
            maxLength={1000}
            placeholder="Descrição (opcional)"
            value={form.description}
            onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
          />
          <label className="flex items-center gap-2 text-sm text-white/60">
            <input
              type="checkbox"
              checked={form.isPublic}
              onChange={e => setForm(f => ({ ...f, isPublic: e.target.checked }))}
              className="accent-violet-500"
            />
            Pública (aparece em Listas da comunidade e pode ser compartilhada)
          </label>
          {error && <p className="text-sm text-rose-300">{error}</p>}
          <div>
            <Button>Criar lista</Button>
          </div>
        </form>
        <p className="mt-3 text-xs text-white/40">
          Adicione itens pelo botão “Adicionar a uma lista” na página de qualquer obra do catálogo.
        </p>
      </Card>

      <div className="grid gap-4 md:grid-cols-[280px_1fr]">
        <ul className="space-y-2">
          {(lists.data || []).map(l => (
            <li key={l.id}>
              <button
                onClick={() => setSelected(l.id)}
                className={`flex w-full items-center justify-between rounded-xl border px-3 py-2 text-left text-sm ${selected === l.id ? 'border-violet-400/40 bg-violet-500/10' : 'border-white/10 hover:bg-white/5'}`}
              >
                <span className="line-clamp-1">{l.title}</span>
                <span className="flex items-center gap-1 text-xs text-white/40">
                  {l.isPublic ? <Globe size={12} /> : <Lock size={12} />} {l._count.items}
                </span>
              </button>
            </li>
          ))}
          {lists.data && !lists.data.length && <li className="text-sm text-white/40">Nenhuma lista ainda.</li>}
        </ul>
        {detail.data && (
          <Card className="p-5">
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="mr-auto text-xl font-bold">{detail.data.title}</h2>
              {detail.data.isPublic && (
                <Link href={`/listas/${detail.data.id}/${detail.data.slug}`} className="text-sm text-cyan-300">
                  <ExternalLink size={14} className="inline" /> Ver página pública
                </Link>
              )}
              <Button
                variant="outline"
                onClick={async () => {
                  await api(`/api/lists/${detail.data!.id}`, {
                    method: 'PATCH',
                    body: JSON.stringify({ isPublic: !detail.data!.isPublic }),
                  });
                  await refresh();
                }}
              >
                {detail.data.isPublic ? 'Tornar privada' : 'Tornar pública'}
              </Button>
              <Button
                variant="danger"
                onClick={async () => {
                  if (!confirm('Excluir esta lista?')) return;
                  await api(`/api/lists/${detail.data!.id}`, { method: 'DELETE' });
                  setSelected(null);
                  await refresh();
                }}
              >
                <Trash2 size={15} />
              </Button>
            </div>
            <ol className="mt-4 space-y-2">
              {detail.data.items.map((item, i) => (
                <li key={item.id} className="flex items-center gap-3 rounded-xl bg-black/20 p-2">
                  <span className="w-6 text-center font-black text-white/30">{i + 1}</span>
                  <span className="min-w-0 flex-1 truncate text-sm">{item.catalogItem.title}</span>
                  <button
                    aria-label="Subir"
                    disabled={i === 0}
                    onClick={() => void move(i, -1)}
                    className="p-1 disabled:opacity-20"
                  >
                    <ArrowUp size={14} />
                  </button>
                  <button
                    aria-label="Descer"
                    disabled={i === detail.data!.items.length - 1}
                    onClick={() => void move(i, 1)}
                    className="p-1 disabled:opacity-20"
                  >
                    <ArrowDown size={14} />
                  </button>
                  <button
                    aria-label="Remover"
                    onClick={async () => {
                      await api(`/api/lists/${detail.data!.id}/items/${item.id}`, { method: 'DELETE' });
                      await refresh();
                    }}
                    className="p-1 text-rose-300"
                  >
                    <X size={14} />
                  </button>
                </li>
              ))}
              {!detail.data.items.length && <li className="text-sm text-white/40">Lista vazia.</li>}
            </ol>
          </Card>
        )}
      </div>
    </section>
  );
}
