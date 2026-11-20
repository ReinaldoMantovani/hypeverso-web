'use client';
import { useEffect, useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { BellRing, Check } from 'lucide-react';
import { api } from '@/lib/api';
import { useAuth } from '@/stores/auth';
import { Button, Card } from '@/ui';

type Category = { id: string; name: string; slug: string; icon?: string | null; enabled: boolean };

export function NewsNotificationPreferences({ profileUsername }: { profileUsername: string }) {
  const me = useAuth(s => s.user);
  const own = !!me && me.username === profileUsername;
  const q = useQuery({
    queryKey: ['news-notification-preferences'],
    queryFn: () => api<{ categories: Category[]; selectedCategoryIds: string[] }>('/api/me/news-preferences'),
    enabled: own,
  });
  const [selected, setSelected] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  useEffect(() => {
    if (q.data) setSelected(q.data.selectedCategoryIds);
  }, [q.data]);
  const selectedSet = useMemo(() => new Set(selected), [selected]);
  if (!own) return null;
  const categories = q.data?.categories || [];
  async function save() {
    setSaving(true);
    setMessage('');
    try {
      await api('/api/me/news-preferences', { method: 'PUT', body: JSON.stringify({ categoryIds: selected }) });
      setMessage(
        'Preferências salvas. Você receberá alertas quando novas notícias dessas categorias forem publicadas.',
      );
      await q.refetch();
    } catch (e: any) {
      setMessage(e.message || 'Não foi possível salvar as preferências.');
    } finally {
      setSaving(false);
    }
  }
  return (
    <Card className="mt-8 p-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <BellRing size={19} className="text-violet-300" />
            <h2 className="font-bold">Notificações de notícias</h2>
          </div>
          <p className="mt-1 text-sm text-white/45">
            Escolha as categorias que deseja acompanhar. Sem categorias selecionadas, você não receberá alertas de novas
            notícias.
          </p>
        </div>
        {categories.length > 0 && (
          <div className="flex gap-2">
            <button
              className="text-xs text-violet-300 hover:text-violet-200"
              onClick={() => setSelected(categories.map(c => c.id))}
            >
              Selecionar todas
            </button>
            <span className="text-white/20">·</span>
            <button className="text-xs text-white/45 hover:text-white" onClick={() => setSelected([])}>
              Limpar
            </button>
          </div>
        )}
      </div>
      {q.isLoading ? (
        <p className="mt-4 text-sm text-white/45">Carregando categorias...</p>
      ) : q.error ? (
        <p className="mt-4 text-sm text-rose-300">Não foi possível carregar as categorias.</p>
      ) : (
        <div className="mt-4 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
          {categories.map(c => {
            const active = selectedSet.has(c.id);
            return (
              <button
                type="button"
                key={c.id}
                onClick={() => setSelected(v => (active ? v.filter(id => id !== c.id) : [...v, c.id]))}
                className={`flex min-h-11 items-center justify-between rounded-xl border px-3 py-2 text-left text-sm transition ${active ? 'border-violet-400/50 bg-violet-500/10 text-white' : 'border-white/10 bg-black/10 text-white/55 hover:border-white/20'}`}
              >
                <span>{c.name}</span>
                {active && <Check size={16} className="text-violet-300" />}
              </button>
            );
          })}
        </div>
      )}
      <div className="mt-4 flex flex-wrap items-center gap-3">
        <Button onClick={save} disabled={saving || q.isLoading}>
          {saving ? 'Salvando...' : 'Salvar preferências'}
        </Button>
        {message && (
          <span className={`text-sm ${message.startsWith('Preferências') ? 'text-emerald-300' : 'text-rose-300'}`}>
            {message}
          </span>
        )}
      </div>
    </Card>
  );
}
