'use client';
import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { ArrowLeft, Lock, Radio, Trash2, Unlock } from 'lucide-react';
import { Button, Card, Textarea } from '@/ui';
import { api } from '@/lib/api';
import { useAuth } from '@/stores/auth';
import { SpoilerText } from '@/components/spoiler-text';
import { kindLabel, type Thread } from '@/components/catalog/catalog-threads';

type Message = {
  id: string;
  content: string;
  spoiler: boolean;
  hidden: boolean;
  createdAt: string;
  user: { id: string; name: string; username: string; level: number };
};

export default function ThreadPage() {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const thread = useQuery({
    queryKey: ['thread', id],
    queryFn: () =>
      api<Thread & { description?: string; createdBy: { id?: string; name: string; username: string } }>(
        `/api/threads/${id}`,
      ),
  });
  const [messages, setMessages] = useState<Message[]>([]);
  const [text, setText] = useState('');
  const [spoiler, setSpoiler] = useState(false);
  const [error, setError] = useState('');
  const lastAt = useRef<string | null>(null);
  const bottom = useRef<HTMLDivElement>(null);

  const live = (() => {
    const t = thread.data;
    if (!t?.startsAt) return false;
    const start = new Date(t.startsAt).getTime();
    return Date.now() >= start - 15 * 60_000 && Date.now() <= start + 4 * 3600_000;
  })();

  // Carga inicial + polling incremental (3 s durante a watch party, 15 s fora dela).
  useEffect(() => {
    let stopped = false;
    let timer: ReturnType<typeof setTimeout>;
    const load = async () => {
      try {
        const url = lastAt.current
          ? `/api/threads/${id}/messages?after=${encodeURIComponent(lastAt.current)}`
          : `/api/threads/${id}/messages`;
        const rows = await api<Message[]>(url);
        if (rows.length) {
          lastAt.current = rows[rows.length - 1].createdAt;
          setMessages(prev => {
            const seen = new Set(prev.map(m => m.id));
            return [...prev, ...rows.filter(m => !seen.has(m.id))];
          });
        }
      } catch {}
      if (!stopped) timer = setTimeout(load, document.hidden ? 30_000 : live ? 3_000 : 15_000);
    };
    void load();
    return () => {
      stopped = true;
      clearTimeout(timer);
    };
  }, [id, live]);

  useEffect(() => {
    bottom.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }, [messages.length]);

  async function send(e: React.FormEvent) {
    e.preventDefault();
    if (!text.trim()) return;
    setError('');
    try {
      const msg = await api<Message>(`/api/threads/${id}/messages`, {
        method: 'POST',
        body: JSON.stringify({ content: text, spoiler }),
      });
      setText('');
      setSpoiler(false);
      lastAt.current = msg.createdAt;
      setMessages(prev => (prev.some(m => m.id === msg.id) ? prev : [...prev, msg]));
    } catch (err: any) {
      setError(err?.message || 'Não foi possível enviar.');
    }
  }

  const t = thread.data;
  if (thread.isLoading) return <p className="p-12 text-center text-white/40">Carregando...</p>;
  if (!t) return <p className="p-12 text-center text-rose-300">Discussão não encontrada.</p>;
  const canModerate =
    user && (user.role === 'ADMIN' || user.role === 'MODERATOR' || user.username === t.createdBy.username);

  return (
    <section className="mx-auto max-w-3xl px-4 py-10">
      <Link href="/discussoes" className="inline-flex items-center gap-2 text-sm text-white/50 hover:text-white">
        <ArrowLeft size={15} /> Discussões
      </Link>
      <div className="mt-4 flex flex-wrap items-center gap-2 text-xs text-cyan-300">
        {kindLabel[t.kind]}
        {t.kind === 'EPISODE' && t.season != null && (
          <span className="text-white/45">
            T{t.season}
            {t.episode != null ? `E${t.episode}` : ''}
          </span>
        )}
        {live && (
          <span className="flex items-center gap-1 rounded-full bg-rose-500/20 px-2 py-0.5 text-rose-200">
            <Radio size={12} /> Ao vivo
          </span>
        )}
      </div>
      <h1 className="mt-2 text-3xl font-black">{t.title}</h1>
      <p className="mt-1 text-sm text-white/45">
        {t.catalogItem?.title && <>{t.catalogItem.title} · </>}
        {t.startsAt && (
          <>Começa {new Date(t.startsAt).toLocaleString('pt-BR', { dateStyle: 'long', timeStyle: 'short' })} · </>
        )}
        por {t.createdBy.name}
      </p>
      {t.description && <p className="mt-4 whitespace-pre-line text-white/65">{t.description}</p>}
      {canModerate && (
        <Button
          variant="ghost"
          className="mt-3"
          onClick={async () => {
            await api(`/api/threads/${id}/lock`, { method: 'PATCH', body: JSON.stringify({ locked: !t.lockedAt }) });
            void thread.refetch();
          }}
        >
          {t.lockedAt ? <Unlock size={15} /> : <Lock size={15} />} {t.lockedAt ? 'Destrancar' : 'Trancar'}
        </Button>
      )}

      <Card className="mt-6 max-h-[60vh] space-y-3 overflow-y-auto p-4" aria-live="polite">
        {!messages.length && <p className="text-sm text-white/40">Nenhuma mensagem ainda.</p>}
        {messages.map(m => (
          <div key={m.id} className="group rounded-xl bg-black/20 p-3">
            <div className="flex items-center gap-2 text-xs text-white/40">
              <Link href={`/u/${m.user.username}`} className="font-bold text-white/80 hover:text-violet-200">
                {m.user.name}
              </Link>
              <span>Nv.{m.user.level}</span>
              <span>{new Date(m.createdAt).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}</span>
              {(user?.id === m.user.id || canModerate) && !m.hidden && (
                <button
                  aria-label="Remover mensagem"
                  className="ml-auto opacity-0 group-hover:opacity-100"
                  onClick={async () => {
                    await api(`/api/threads/messages/${m.id}`, { method: 'DELETE' });
                    setMessages(prev => prev.map(x => (x.id === m.id ? { ...x, hidden: true, content: '' } : x)));
                  }}
                >
                  <Trash2 size={13} />
                </button>
              )}
            </div>
            <p className="mt-1 whitespace-pre-line text-sm text-white/75">
              {m.hidden ? (
                <em className="text-white/35">Mensagem removida</em>
              ) : (
                <SpoilerText text={m.content} whole={m.spoiler} />
              )}
            </p>
          </div>
        ))}
        <div ref={bottom} />
      </Card>

      {user ? (
        t.lockedAt ? (
          <p className="mt-4 text-sm text-white/45">Discussão trancada.</p>
        ) : (
          <form onSubmit={send} className="mt-4 space-y-2">
            <Textarea
              maxLength={2000}
              placeholder="Escreva... use ||texto|| para esconder spoilers."
              value={text}
              onChange={e => setText(e.target.value)}
            />
            <div className="flex flex-wrap items-center gap-3">
              <label className="flex items-center gap-2 text-sm text-white/55">
                <input
                  type="checkbox"
                  checked={spoiler}
                  onChange={e => setSpoiler(e.target.checked)}
                  className="accent-violet-500"
                />{' '}
                Mensagem inteira é spoiler
              </label>
              <Button className="ml-auto">Enviar</Button>
            </div>
            {error && <p className="text-sm text-rose-300">{error}</p>}
          </form>
        )
      ) : (
        <p className="mt-4 text-sm text-white/45">
          <Link href="/login" className="text-violet-300">
            Entre
          </Link>{' '}
          para participar.
        </p>
      )}
    </section>
  );
}
