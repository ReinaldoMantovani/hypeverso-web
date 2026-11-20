'use client';
import { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Heart, Flag, Reply } from 'lucide-react';
import { api } from '@/lib/api';
import { Button, Textarea, Card } from '@/ui';
import { SpoilerText } from '@/components/spoiler-text';

export function Comments({ postId }: { postId: string }) {
  const qc = useQueryClient();
  const [content, setContent] = useState('');
  const [replyTo, setReplyTo] = useState<string | null>(null);
  const [replyText, setReplyText] = useState('');
  const { data = [] } = useQuery({
    queryKey: ['comments', postId],
    queryFn: () => api<any[]>(`/api/posts/${postId}/comments`),
  });
  async function send(parentId?: string) {
    const text = parentId ? replyText : content;
    if (!text.trim()) return;
    try {
      await api(`/api/posts/${postId}/comments`, {
        method: 'POST',
        body: JSON.stringify({ content: text, ...(parentId ? { parentId } : {}) }),
      });
      setContent('');
      setReplyText('');
      setReplyTo(null);
      qc.invalidateQueries({ queryKey: ['comments', postId] });
    } catch (e: any) {
      alert(e.message);
    }
  }
  async function like(id: string) {
    try {
      await api(`/api/comments/${id}/like`, { method: 'POST' });
      qc.invalidateQueries({ queryKey: ['comments', postId] });
    } catch (e: any) {
      alert(e.message);
    }
  }
  async function report(id: string) {
    const reason = prompt('Motivo da denúncia');
    if (!reason) return;
    try {
      await api(`/api/comments/${id}/report`, { method: 'POST', body: JSON.stringify({ reason }) });
      alert('Denúncia enviada para moderação.');
    } catch (e: any) {
      alert(e.message);
    }
  }
  return (
    <section className="mt-16 border-t border-white/10 pt-10">
      <h2 className="text-2xl font-black">Comentários</h2>
      <div className="mt-5 flex flex-col gap-3 sm:flex-row">
        <Textarea
          value={content}
          onChange={e => setContent(e.target.value)}
          placeholder="Entre na conversa... use ||texto|| para esconder spoilers."
        />
        <Button onClick={() => send()}>Comentar</Button>
      </div>
      <div className="mt-6 space-y-3">
        {data.map((c: any) => (
          <Card key={c.id} className="p-4">
            <div className="text-sm font-bold">
              {c.user.name} <span className="font-normal text-violet-300">Nv.{c.user.level}</span>
            </div>
            <p className="mt-2 whitespace-pre-wrap text-white/70">
              <SpoilerText text={c.content} />
            </p>
            <div className="mt-3 flex flex-wrap gap-2">
              <Button variant="ghost" className="px-2 py-1 text-xs" onClick={() => like(c.id)}>
                <Heart size={14} />
                {c._count.likes}
              </Button>
              <Button
                variant="ghost"
                className="px-2 py-1 text-xs"
                onClick={() => setReplyTo(replyTo === c.id ? null : c.id)}
              >
                <Reply size={14} />
                Responder
              </Button>
              <Button variant="ghost" className="px-2 py-1 text-xs" onClick={() => report(c.id)}>
                <Flag size={14} />
                Denunciar
              </Button>
            </div>
            {replyTo === c.id && (
              <div className="mt-3 flex gap-2">
                <Textarea
                  className="min-h-20"
                  value={replyText}
                  onChange={e => setReplyText(e.target.value)}
                  placeholder="Escreva sua resposta..."
                />
                <Button onClick={() => send(c.id)}>Enviar</Button>
              </div>
            )}
            {c.replies?.length > 0 && (
              <div className="ml-5 mt-3 space-y-2 border-l border-white/10 pl-4">
                {c.replies.map((r: any) => (
                  <div key={r.id} className="rounded-xl bg-white/[0.025] p-3">
                    <b className="text-sm">{r.user.name}</b>
                    <p className="mt-1 text-sm text-white/60">
                      <SpoilerText text={r.content} />
                    </p>
                    <button
                      onClick={() => like(r.id)}
                      className="mt-2 flex items-center gap-1 text-xs text-white/40 hover:text-pink-300"
                    >
                      <Heart size={13} />
                      {r._count.likes}
                    </button>
                  </div>
                ))}
              </div>
            )}
          </Card>
        ))}
      </div>
    </section>
  );
}
