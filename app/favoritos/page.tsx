'use client';
import { useEffect, useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import Link from 'next/link';
import { CloudDownload, CloudOff, Trash2, WifiOff } from 'lucide-react';
import { api } from '@/lib/api';
import { Card, Button } from '@/ui';
import { swMessage } from '@/components/pwa/service-worker-register';

type Fav = { id: string; post: { id: string; slug: string; title: string; description: string } };
const SNAPSHOT_KEY = 'hv-favorites-snapshot';

export default function Favorites() {
  const qc = useQueryClient();
  const q = useQuery({
    queryKey: ['favorites'],
    queryFn: async () => {
      const data = await api<Fav[]>('/api/favorites');
      // Cópia dos títulos para exibir a lista mesmo sem internet.
      try {
        localStorage.setItem(SNAPSHOT_KEY, JSON.stringify(data.map(f => ({ id: f.id, post: f.post }))));
      } catch {}
      return data;
    },
  });
  const [offline, setOffline] = useState<Set<string>>(new Set());
  const [saving, setSaving] = useState(false);
  const [notice, setNotice] = useState('');
  const [snapshot, setSnapshot] = useState<Fav[]>([]);
  const isOffline = typeof navigator !== 'undefined' && !navigator.onLine;

  useEffect(() => {
    try {
      setSnapshot(JSON.parse(localStorage.getItem(SNAPSHOT_KEY) || '[]'));
    } catch {}
    void swMessage<{ urls: string[] }>({ type: 'LIST_OFFLINE' }, 'OFFLINE_LIST', 5000).then(
      r => r && setOffline(new Set(r.urls)),
    );
  }, []);

  const items = q.data || (q.error || isOffline ? snapshot : []);

  async function saveOffline() {
    setSaving(true);
    setNotice('');
    const urls = items.map(f => `/post/${f.post.slug}`);
    const r = await swMessage<{ saved: number }>({ type: 'SAVE_OFFLINE', urls }, 'OFFLINE_SAVED', 60000);
    if (!r) setNotice('A leitura offline exige o app instalado ou o navegador com service worker ativo.');
    else {
      setNotice(`${r.saved} artigo(s) disponíveis sem internet.`);
      setOffline(new Set([...offline, ...urls]));
    }
    setSaving(false);
  }

  return (
    <section className="mx-auto max-w-5xl px-4 py-12">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-4xl font-black">Favoritos</h1>
          <p className="mt-2 text-white/50">Conteúdos salvos para ler depois — inclusive offline.</p>
        </div>
        {items.length > 0 && !isOffline && (
          <Button variant="outline" onClick={saveOffline} disabled={saving}>
            <CloudDownload size={16} />
            {saving ? 'Salvando...' : 'Salvar todos para ler offline'}
          </Button>
        )}
      </div>
      {isOffline && (
        <p className="mt-6 flex items-center gap-2 rounded-xl border border-amber-400/30 bg-amber-500/10 p-3 text-sm text-amber-100">
          <WifiOff size={16} /> Você está offline. Os artigos marcados como disponíveis abrem normalmente.
        </p>
      )}
      {notice && <p className="mt-4 text-sm text-emerald-300">{notice}</p>}
      {q.error && !snapshot.length && (
        <p className="mt-8 text-amber-300">Entre na sua conta para ver seus favoritos.</p>
      )}
      <div className="mt-8 space-y-3">
        {items.map(f => {
          const path = `/post/${f.post.slug}`;
          const available = offline.has(path);
          return (
            <Card key={f.id} className="flex items-center gap-4 p-4">
              <Link className="min-w-0 flex-1" href={path}>
                <b className="line-clamp-1">{f.post.title}</b>
                <p className="mt-1 line-clamp-1 text-sm text-white/45">{f.post.description}</p>
              </Link>
              <span
                className={`hidden shrink-0 items-center gap-1 text-xs sm:flex ${available ? 'text-emerald-300' : 'text-white/30'}`}
                title={available ? 'Disponível offline' : 'Somente online'}
              >
                {available ? <CloudDownload size={14} /> : <CloudOff size={14} />}
                {available ? 'Offline' : 'Online'}
              </span>
              {!isOffline && (
                <Button
                  variant="ghost"
                  aria-label="Remover dos favoritos"
                  onClick={async () => {
                    await api(`/api/favorites/${f.post.id}`, { method: 'POST' });
                    qc.invalidateQueries({ queryKey: ['favorites'] });
                  }}
                >
                  <Trash2 size={16} />
                </Button>
              )}
            </Card>
          );
        })}
      </div>
    </section>
  );
}
