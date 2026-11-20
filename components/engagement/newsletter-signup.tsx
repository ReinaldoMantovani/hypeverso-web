'use client';
import { useState } from 'react';
import { Mail } from 'lucide-react';
import { Button, Input } from '@/ui';
import { api } from '@/lib/api';
import { useAuth } from '@/stores/auth';
import { Turnstile, TURNSTILE_SITE_KEY } from '@/components/turnstile';
import { LegalLink } from '@/components/legal/legal-link';

/** Inscrição na newsletter semanal com double opt-in (confirmação por e-mail). */
export function NewsletterSignup({ compact = false, categoryIds = [] }: { compact?: boolean; categoryIds?: string[] }) {
  const { user } = useAuth();
  const [email, setEmail] = useState('');
  const [consent, setConsent] = useState(false);
  const [captcha, setCaptcha] = useState<string | null>(null);
  const [state, setState] = useState<'idle' | 'sending' | 'pending' | 'confirmed' | 'error'>('idle');
  const [error, setError] = useState('');
  const needsCaptcha = !user && !!TURNSTILE_SITE_KEY;

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!consent) return setError('Marque a caixa de consentimento.');
    if (needsCaptcha && !captcha) return setError('Confirme que você não é um robô.');
    setState('sending');
    setError('');
    try {
      const r = await api<{ status: 'pending' | 'confirmed' }>('/api/newsletter/subscribe', {
        method: 'POST',
        body: JSON.stringify({
          email: email || user?.email,
          categoryIds,
          consent: true,
          captchaToken: captcha || undefined,
        }),
      });
      setState(r.status);
    } catch (err: any) {
      setState('error');
      setError(err?.message || 'Não foi possível inscrever agora.');
    }
  }

  if (state === 'pending')
    return <p className="text-sm text-emerald-300">Quase lá! Enviamos um link de confirmação para o seu e-mail.</p>;
  if (state === 'confirmed') return <p className="text-sm text-emerald-300">Inscrição confirmada. Até sexta! 📬</p>;

  return (
    <form onSubmit={submit} className={compact ? 'space-y-2' : 'space-y-3'}>
      {!compact && (
        <p className="flex items-center gap-2 text-sm font-bold">
          <Mail size={16} className="text-violet-300" /> Newsletter semanal
        </p>
      )}
      <div className="flex gap-2">
        <Input
          type="email"
          required={!user}
          autoComplete="email"
          placeholder={user?.email || 'seu@email.com'}
          value={email}
          onChange={e => setEmail(e.target.value)}
        />
        <Button disabled={state === 'sending'}>{state === 'sending' ? '...' : 'Assinar'}</Button>
      </div>
      <label className="flex items-start gap-2 text-[11px] leading-4 text-white/45">
        <input
          type="checkbox"
          checked={consent}
          onChange={e => setConsent(e.target.checked)}
          className="mt-0.5 accent-violet-500"
        />
        <span>
          Quero receber o resumo semanal por e-mail. Posso cancelar a qualquer momento. Veja a{' '}
          <LegalLink kind="privacy" className="text-cyan-300 hover:underline">
            Política de Privacidade
          </LegalLink>
          .
        </span>
      </label>
      {needsCaptcha && <Turnstile action="newsletter" onToken={setCaptcha} />}
      {error && <p className="text-xs text-rose-300">{error}</p>}
    </form>
  );
}
