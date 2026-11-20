'use client';
import Link from 'next/link';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Gavel, ShieldCheck, ThumbsDown, ThumbsUp } from 'lucide-react';
import { Button, Card } from '@/ui';
import { api } from '@/lib/api';
import { useAuth } from '@/stores/auth';

type Status = {
  eligible: boolean;
  staff?: boolean;
  reasons: string[];
  reputation: number;
  weight: number;
  rules: { minLevel: number; minAccountDays: number; hideThreshold: number };
};
type Item = {
  id: string;
  reason: string;
  details: string | null;
  comment: { content: string; post: { title: string; slug: string } };
};

/** Triagem comunitária: usuários experientes ajudam a avaliar denúncias. */
export default function CommunityTriagePage() {
  const { user } = useAuth();
  const qc = useQueryClient();
  const status = useQuery({
    queryKey: ['triage-status'],
    queryFn: () => api<Status>('/api/community-mod/status'),
    enabled: !!user,
  });
  const queue = useQuery({
    queryKey: ['triage-queue'],
    queryFn: () => api<{ items: Item[] }>('/api/community-mod/queue'),
    enabled: !!status.data?.eligible,
  });

  async function vote(id: string, verdict: 'VIOLATES' | 'OK') {
    await api(`/api/community-mod/reports/${id}/vote`, { method: 'POST', body: JSON.stringify({ verdict }) }).catch(
      () => undefined,
    );
    await qc.invalidateQueries({ queryKey: ['triage-queue'] });
  }

  return (
    <section className="mx-auto max-w-3xl px-4 py-12">
      <h1 className="flex items-center gap-2 text-3xl font-black">
        <Gavel className="text-violet-300" /> Triagem da comunidade
      </h1>
      <p className="mt-2 text-white/55">
        Membros experientes ajudam a avaliar denúncias. Quando votos suficientes indicam violação, o comentário fica
        oculto até a decisão final da equipe. Acertar a decisão final aumenta sua reputação (e o peso do seu voto);
        errar diminui.
      </p>
      {!user && (
        <p className="mt-6 text-sm">
          <Link href="/login" className="text-violet-300">
            Entre
          </Link>{' '}
          para participar.
        </p>
      )}
      {status.data && (
        <Card className="mt-6 p-5">
          <p className="flex items-center gap-2 text-sm">
            <ShieldCheck size={16} className="text-emerald-300" /> Reputação: <b>{status.data.reputation}</b> · peso do
            voto: <b>{status.data.weight}</b>
          </p>
          {!status.data.eligible && (
            <ul className="mt-3 list-disc pl-5 text-sm text-white/55">
              {status.data.reasons.map(r => (
                <li key={r}>{r}</li>
              ))}
            </ul>
          )}
        </Card>
      )}
      {status.data?.eligible && (
        <div className="mt-6 space-y-3">
          {!queue.data?.items.length && (
            <Card className="p-6 text-sm text-white/45">Nada para avaliar agora. Obrigado por ajudar!</Card>
          )}
          {queue.data?.items.map(item => (
            <Card key={item.id} className="p-5">
              <div className="text-xs text-rose-300">Motivo: {item.reason}</div>
              {item.details && <p className="mt-1 text-xs text-white/45">{item.details}</p>}
              <blockquote className="mt-3 border-l-2 border-white/15 pl-3 text-white/75">
                {item.comment.content}
              </blockquote>
              <p className="mt-2 text-xs text-white/35">
                Em{' '}
                <Link href={`/post/${item.comment.post.slug}`} className="hover:text-white">
                  {item.comment.post.title}
                </Link>
              </p>
              <div className="mt-4 flex gap-2">
                <Button variant="danger" onClick={() => void vote(item.id, 'VIOLATES')}>
                  <ThumbsDown size={15} /> Viola as regras
                </Button>
                <Button variant="outline" onClick={() => void vote(item.id, 'OK')}>
                  <ThumbsUp size={15} /> Está ok
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}
    </section>
  );
}
