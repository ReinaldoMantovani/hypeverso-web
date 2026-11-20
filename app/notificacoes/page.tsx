'use client';
import Link from 'next/link';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { Button, Card } from '@/ui';

function hrefFor(n: any) {
  if (n.entityType === 'news' && n.entityId) return `/post/${n.entityId}`;
  if (n.entityType === 'communityPost' && n.entityId) return `/comunidade#post-${n.entityId}`;
  if (n.entityType === 'mediaRelease' && n.entityId) {
    const [provider, type, externalId] = String(n.entityId).split('|');
    if (provider && type && externalId) return `/catalogo/${provider}/${type}/${externalId}`;
  }
  if (n.entityType === 'user' && n.actor?.username) return `/u/${n.actor.username}`;
  return '/notificacoes';
}

export default function Notifications() {
  const qc = useQueryClient();
  const q = useQuery({
    queryKey: ['notifications'],
    queryFn: () => api<any[]>('/api/notifications'),
    refetchInterval: 20_000,
  });
  async function mark(ids?: string[]) {
    await api('/api/notifications/read', { method: 'POST', body: JSON.stringify(ids?.length ? { ids } : {}) });
    await Promise.all([
      qc.invalidateQueries({ queryKey: ['notifications'] }),
      qc.invalidateQueries({ queryKey: ['notifications-unread-count'] }),
    ]);
  }
  return (
    <section className="mx-auto max-w-4xl px-4 py-12">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-4xl font-black">Notificações</h1>
          <p className="mt-2 text-white/50">Atividades de pessoas que você segue e novidades das suas categorias.</p>
        </div>
        <Button variant="outline" onClick={() => mark()}>
          Marcar como lidas
        </Button>
      </div>
      {q.error && <p className="mt-8 text-amber-300">Entre na sua conta para acessar as notificações.</p>}
      <div className="mt-8 space-y-3">
        {(q.data || []).map((n: any) => (
          <Link
            key={n.id}
            href={hrefFor(n)}
            onClick={() => {
              if (!n.readAt) void mark([n.id]);
            }}
          >
            <Card className={`p-4 transition hover:border-violet-400/30 ${n.readAt ? 'opacity-55' : ''}`}>
              <div className="flex items-start gap-3">
                <div
                  className={`mt-1 h-2.5 w-2.5 shrink-0 rounded-full ${n.readAt ? 'bg-white/15' : 'bg-violet-400'}`}
                />
                <div>
                  <b>{n.title}</b>
                  {n.body && <p className="mt-1 text-sm text-white/55">{n.body}</p>}
                  <div className="mt-2 text-xs text-white/30">{new Date(n.createdAt).toLocaleString('pt-BR')}</div>
                </div>
              </div>
            </Card>
          </Link>
        ))}
      </div>
    </section>
  );
}
