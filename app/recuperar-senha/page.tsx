'use client';
import { useState } from 'react';
import { api } from '@/lib/api';
import { Button, Input, Card } from '@/ui';
import { Turnstile, TURNSTILE_SITE_KEY } from '@/components/turnstile';

export default function Forgot() {
  const [email, setEmail] = useState('');
  const [ok, setOk] = useState(false);
  const [captcha, setCaptcha] = useState<string | null>(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    if (TURNSTILE_SITE_KEY && !captcha) {
      setError('Confirme que você não é um robô.');
      return;
    }
    setLoading(true);
    try {
      await api(
        '/api/auth/forgot-password',
        { method: 'POST', body: JSON.stringify({ email, captchaToken: captcha || undefined }) },
        false,
      );
      setOk(true);
    } catch (err: any) {
      setError(err?.message || 'Não foi possível enviar agora.');
    } finally {
      setLoading(false);
    }
  }
  return (
    <div className="grid min-h-[65vh] place-items-center px-4">
      <Card className="w-full max-w-md p-7">
        <h1 className="text-2xl font-black">Recuperar senha</h1>
        {ok ? (
          <p className="mt-4 text-white/60">Se o e-mail estiver cadastrado, enviamos as instruções.</p>
        ) : (
          <form className="mt-5 space-y-3" onSubmit={submit}>
            <Input
              type="email"
              required
              autoComplete="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="Seu e-mail"
            />
            <Turnstile action="forgot-password" onToken={setCaptcha} />
            {error && <p className="text-sm text-rose-300">{error}</p>}
            <Button className="w-full" disabled={loading}>
              {loading ? 'Enviando...' : 'Enviar instruções'}
            </Button>
          </form>
        )}
      </Card>
    </div>
  );
}
