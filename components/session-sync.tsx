'use client';
import { useEffect, useState } from 'react';
import { MailWarning } from 'lucide-react';
import { useAuth } from '@/stores/auth';
import { api } from '@/lib/api';

/** Revalida a sessão ao abrir o site e avisa quando o e-mail ainda não foi confirmado. */
export function SessionSync() {
  const { user, hydrated, loadMe } = useAuth();
  const [sent, setSent] = useState<'idle' | 'sending' | 'sent' | 'error'>('idle');
  const [dismissed, setDismissed] = useState(false);
  useEffect(() => {
    if (hydrated && user) void loadMe();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hydrated]);
  if (!user || user.emailVerifiedAt || dismissed || user.role !== 'USER') return null;
  return (
    <div className="border-b border-amber-400/20 bg-amber-500/10 text-amber-100">
      <div className="mx-auto flex max-w-7xl flex-wrap items-center gap-3 px-4 py-2 text-sm">
        <MailWarning size={16} />
        <span>Confirme seu e-mail ({user.email}) para comentar, avaliar e publicar.</span>
        <button
          className="rounded-lg border border-amber-300/30 px-2 py-0.5 text-xs hover:bg-amber-500/10 disabled:opacity-50"
          disabled={sent === 'sending' || sent === 'sent'}
          onClick={async () => {
            setSent('sending');
            try {
              await api('/api/auth/resend-verification', { method: 'POST' });
              setSent('sent');
            } catch {
              setSent('error');
            }
          }}
        >
          {sent === 'sent' ? 'Link reenviado' : sent === 'error' ? 'Tente mais tarde' : 'Reenviar link'}
        </button>
        <button className="ml-auto text-xs text-amber-200/70 hover:text-white" onClick={() => setDismissed(true)}>
          Ocultar
        </button>
      </div>
    </div>
  );
}
