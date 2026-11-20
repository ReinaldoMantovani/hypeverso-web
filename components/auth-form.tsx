'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button, Input, Card } from '@/ui';
import { useAuth } from '@/stores/auth';
import { LegalLink } from '@/components/legal/legal-link';
import { useI18n } from '@/lib/i18n';
import { Turnstile, TURNSTILE_SITE_KEY } from '@/components/turnstile';
import Link from 'next/link';
export function AuthForm({ mode }: { mode: 'login' | 'register' }) {
  const router = useRouter();
  const auth = useAuth();
  const { t } = useI18n();
  const [accepted, setAccepted] = useState(false);
  const [form, setForm] = useState({ name: '', username: '', email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [captcha, setCaptcha] = useState<string | null>(null);
  const [mfaToken, setMfaToken] = useState<string | null>(null);
  const [code, setCode] = useState('');
  const upd = (k: string, v: string) => setForm({ ...form, [k]: v });
  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    if (mode === 'register' && !accepted) {
      setError(t('acceptTermsRequired'));
      return;
    }
    if (mode === 'register' && TURNSTILE_SITE_KEY && !captcha) {
      setError('Confirme que você não é um robô.');
      return;
    }
    setLoading(true);
    try {
      if (mfaToken) {
        await auth.verifyMfa(mfaToken, code);
      } else if (mode === 'login') {
        const result = await auth.login(form.email, form.password);
        if (result.mfaRequired) {
          setMfaToken(result.mfaToken);
          return;
        }
      } else {
        await auth.register({ ...form, acceptTerms: true, captchaToken: captcha || undefined });
      }
      router.push('/');
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }
  if (mfaToken)
    return (
      <Card className="w-full max-w-md p-7">
        <h1 className="text-2xl font-black">Verificação em duas etapas</h1>
        <p className="mt-2 text-sm text-white/55">
          Digite o código de 6 dígitos do seu app autenticador ou um código de recuperação.
        </p>
        <form onSubmit={submit} className="mt-6 space-y-3">
          <Input
            required
            autoFocus
            inputMode="numeric"
            autoComplete="one-time-code"
            placeholder="123456"
            maxLength={20}
            value={code}
            onChange={e => setCode(e.target.value)}
            className="text-center text-lg tracking-[.4em]"
          />
          {error && <p className="text-sm text-rose-300">{error}</p>}
          <Button className="w-full" disabled={loading || code.trim().length < 6}>
            {loading ? 'Verificando...' : 'Confirmar'}
          </Button>
          <button
            type="button"
            className="w-full text-xs text-white/45 hover:text-white"
            onClick={() => {
              setMfaToken(null);
              setCode('');
              setError('');
            }}
          >
            Voltar
          </button>
        </form>
      </Card>
    );
  return (
    <Card className="w-full max-w-md p-7">
      <h1 className="text-3xl font-black">{mode === 'login' ? 'Entrar no Hypeverso' : 'Criar conta'}</h1>
      <p className="mt-2 text-sm text-white/45">Sua identidade dentro do universo geek.</p>
      <form onSubmit={submit} className="mt-6 space-y-3">
        {mode === 'register' && (
          <>
            <Input required placeholder="Nome" value={form.name} onChange={e => upd('name', e.target.value)} />
            <Input
              required
              placeholder="Usuário"
              value={form.username}
              onChange={e => upd('username', e.target.value)}
            />
          </>
        )}
        <Input
          required
          type="email"
          autoComplete="email"
          placeholder="Email"
          value={form.email}
          onChange={e => upd('email', e.target.value)}
        />
        <Input
          required
          minLength={8}
          type="password"
          autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
          placeholder="Senha"
          value={form.password}
          onChange={e => upd('password', e.target.value)}
        />
        {mode === 'register' && (
          <label className="flex items-start gap-2 text-xs leading-5 text-white/55">
            <input
              type="checkbox"
              required
              checked={accepted}
              onChange={e => setAccepted(e.target.checked)}
              className="mt-0.5 h-4 w-4 shrink-0 accent-violet-500"
            />
            <span>
              {t('acceptTermsPrefix')}{' '}
              <LegalLink kind="terms" className="text-cyan-300 hover:underline">
                {t('terms')}
              </LegalLink>{' '}
              {t('acceptTermsAnd')}{' '}
              <LegalLink kind="privacy" className="text-cyan-300 hover:underline">
                {t('privacy')}
              </LegalLink>
              .
            </span>
          </label>
        )}
        {mode === 'register' && <Turnstile action="register" onToken={setCaptcha} />}
        {error && <p className="text-sm text-rose-300">{error}</p>}
        <Button className="w-full" disabled={loading}>
          {loading ? 'Processando...' : mode === 'login' ? 'Entrar' : 'Criar conta'}
        </Button>
        {mode === 'login' && (
          <p className="text-center text-xs text-white/45">
            <Link href="/recuperar-senha" className="hover:text-white">
              Esqueci minha senha
            </Link>
          </p>
        )}
      </form>
    </Card>
  );
}
