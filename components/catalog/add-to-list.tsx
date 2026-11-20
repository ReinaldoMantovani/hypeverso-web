'use client';
import { useState } from 'react';
import Link from 'next/link';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Check, ListPlus } from 'lucide-react';
import { Button, Input } from '@/ui';
import { api } from '@/lib/api';
import { useAuth } from '@/stores/auth';

type MyList = { id: string; title: string; _count: { items: number } };

/** Adiciona a obra a uma lista pública/privada do usuário (ou cria uma nova). */
export function AddToList({
  provider,
  mediaType,
  externalId,
}: {
  provider: string;
  mediaType: string;
  externalId: string;
}) {
  const { user } = useAuth();
  const qc = useQueryClient();
  const [open, setOpen] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [done, setDone] = useState<string | null>(null);
  const [error, setError] = useState('');
  const lists = useQuery({
    queryKey: ['my-lists'],
    queryFn: () => api<MyList[]>('/api/lists/mine'),
    enabled: !!user && open,
  });
  if (!user)
    return (
      <Link href="/login">
        <Button variant="outline">
          <ListPlus size={16} /> Adicionar a uma lista
        </Button>
      </Link>
    );

  async function addTo(listId: string) {
    setError('');
    try {
      await api(`/api/lists/${listId}/items`, {
        method: 'POST',
        body: JSON.stringify({ provider, mediaType, externalId }),
      });
      setDone(listId);
      await qc.invalidateQueries({ queryKey: ['my-lists'] });
    } catch (e: any) {
      setError(e?.message || 'Não foi possível adicionar.');
    }
  }

  return (
    <div className="relative">
      <Button variant="outline" onClick={() => setOpen(v => !v)} aria-expanded={open}>
        <ListPlus size={16} /> Adicionar a uma lista
      </Button>
      {open && (
        <div className="absolute left-0 top-12 z-30 w-72 rounded-2xl border border-white/10 bg-[#0b0814] p-3 shadow-2xl">
          <ul className="max-h-56 space-y-1 overflow-y-auto">
            {(lists.data || []).map(l => (
              <li key={l.id}>
                <button
                  onClick={() => void addTo(l.id)}
                  className="flex w-full items-center justify-between rounded-lg px-3 py-2 text-left text-sm hover:bg-white/5"
                >
                  <span className="line-clamp-1">{l.title}</span>
                  {done === l.id ? (
                    <Check size={15} className="text-emerald-300" />
                  ) : (
                    <span className="text-xs text-white/35">{l._count.items}</span>
                  )}
                </button>
              </li>
            ))}
            {lists.data && !lists.data.length && (
              <li className="px-3 py-2 text-xs text-white/40">Você ainda não tem listas.</li>
            )}
          </ul>
          <form
            className="mt-2 flex gap-2 border-t border-white/10 pt-2"
            onSubmit={async e => {
              e.preventDefault();
              if (newTitle.trim().length < 3) return;
              try {
                const list = await api<MyList>('/api/lists', {
                  method: 'POST',
                  body: JSON.stringify({ title: newTitle, isPublic: true }),
                });
                setNewTitle('');
                await addTo(list.id);
              } catch (err: any) {
                setError(err?.message || 'Não foi possível criar a lista.');
              }
            }}
          >
            <Input
              className="h-9"
              placeholder="Nova lista"
              value={newTitle}
              onChange={e => setNewTitle(e.target.value)}
            />
            <Button className="h-9 px-3">Criar</Button>
          </form>
          {error && <p className="mt-2 text-xs text-rose-300">{error}</p>}
        </div>
      )}
    </div>
  );
}
