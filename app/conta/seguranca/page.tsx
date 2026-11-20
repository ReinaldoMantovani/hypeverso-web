'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Copy, KeyRound, ShieldAlert, ShieldCheck } from 'lucide-react';
import { Button, Card, Input } from '@/ui';
import { api } from '@/lib/api';
import { useAuth } from '@/stores/auth';
import { AccountNav } from '@/components/account-nav';

type MfaStatus = {
  enabled: boolean;
  enabledAt: string | null;
  recoveryCodesLeft: number;
  required: boolean;
  sessionVerified: boolean;
};
type Setup = { secret: string; otpauthUrl: string; qrCode: string };

export default function SecurityPage() {
  const { user, hydrated, loadMe } = useAuth();
  const [status, setStatus] = useState<MfaStatus | null>(null);
  const [setup, setSetup] = useState<Setup | null>(null);
  const [code, setCode] = useState('');
  const [password, setPassword] = useState('');
  const [codes, setCodes] = useState<string[] | null>(null);
  const [message, setMessage] = useState<{ type: 'ok' | 'error'; text: string } | null>(null);
  const [busy, setBusy] = useState(false);

  const refresh = () =>
    api<MfaStatus>('/api/me/mfa')
      .then(setStatus)
      .catch(() => setStatus(null));
  useEffect(() => {
    if (user) void refresh();
  }, [user]);

  async function run(fn: () => Promise<void>) {
    setBusy(true);
    setMessage(null);
    try {
      await fn();
    } catch (e: any) {
      setMessage({ type: 'error', text: e?.message || 'Não foi possível concluir.' });
    } finally {
      setBusy(false);
    }
  }

  if (hydrated && !user)
    return (
      <section className="mx-auto max-w-2xl px-4 py-14">
        <Card className="p-7">
          <h1 className="text-2xl font-black">Segurança</h1>
          <p className="mt-2 text-white/55">Entre na sua conta para gerenciar a verificação em duas etapas.</p>
          <Link href="/login">
            <Button className="mt-5">Entrar</Button>
          </Link>
        </Card>
      </section>
    );

  return (
    <section className="mx-auto max-w-3xl space-y-5 px-4 py-14" data-no-i18n>
      <AccountNav />
      <div>
        <h1 className="flex items-center gap-2 text-3xl font-black">
          <KeyRound className="text-violet-300" />
          Segurança da conta
        </h1>
        <p className="mt-2 text-white/55">
          A verificação em duas etapas (2FA) exige um código do seu celular além da senha. É obrigatória para contas de
          administração e edição.
        </p>
      </div>
      {message && (
        <p
          role="status"
          className={`rounded-xl border p-3 text-sm ${message.type === 'ok' ? 'border-emerald-400/30 bg-emerald-500/10 text-emerald-200' : 'border-rose-400/30 bg-rose-500/10 text-rose-200'}`}
        >
          {message.text}
        </p>
      )}
      {status?.required && !status.enabled && (
        <p className="flex items-start gap-2 rounded-xl border border-amber-400/30 bg-amber-500/10 p-3 text-sm text-amber-100">
          <ShieldAlert size={18} className="shrink-0" />
          Sua conta tem acesso administrativo: ative o 2FA para liberar o painel.
        </p>
      )}

      {codes && (
        <Card className="border-emerald-400/30 p-6">
          <h2 className="text-lg font-bold">Guarde seus códigos de recuperação</h2>
          <p className="mt-1 text-sm text-white/55">
            Cada código funciona uma única vez caso você perca o celular. Eles não serão exibidos novamente.
          </p>
          <ul className="mt-4 grid grid-cols-2 gap-2 font-mono text-sm">
            {codes.map(c => (
              <li key={c} className="rounded-lg bg-black/30 px-3 py-2">
                {c}
              </li>
            ))}
          </ul>
          <Button
            variant="outline"
            className="mt-4"
            onClick={() => navigator.clipboard?.writeText(codes.join('\n')).catch(() => undefined)}
          >
            <Copy size={15} />
            Copiar códigos
          </Button>
        </Card>
      )}

      <Card className="p-6">
        <h2 className="flex items-center gap-2 text-lg font-bold">
          {status?.enabled ? <ShieldCheck size={18} className="text-emerald-300" /> : <ShieldAlert size={18} />}
          Verificação em duas etapas: {status?.enabled ? 'ativa' : 'desativada'}
        </h2>

        {!status?.enabled && !setup && (
          <Button
            className="mt-4"
            disabled={busy}
            onClick={() => run(async () => setSetup(await api<Setup>('/api/me/mfa/setup', { method: 'POST' })))}
          >
            Configurar app autenticador
          </Button>
        )}

        {!status?.enabled && setup && (
          <div className="mt-4 grid gap-5 sm:grid-cols-[240px_1fr]">
            <img
              src={setup.qrCode}
              alt="QR Code para o app autenticador"
              className="h-60 w-60 rounded-xl bg-white p-2"
            />
            <div className="space-y-3 text-sm text-white/60">
              <ol className="list-decimal space-y-1 pl-5">
                <li>Abra Google Authenticator, Authy, 1Password ou similar.</li>
                <li>Escaneie o QR Code (ou digite a chave abaixo).</li>
                <li>Informe o código de 6 dígitos gerado.</li>
              </ol>
              <code className="block break-all rounded-lg bg-black/30 px-3 py-2 text-xs">{setup.secret}</code>
              <form
                className="flex gap-2"
                onSubmit={e => {
                  e.preventDefault();
                  void run(async () => {
                    const r = await api<{ recoveryCodes: string[] }>('/api/me/mfa/enable', {
                      method: 'POST',
                      body: JSON.stringify({ code }),
                    });
                    setCodes(r.recoveryCodes);
                    setSetup(null);
                    setCode('');
                    await Promise.all([refresh(), loadMe()]);
                    setMessage({ type: 'ok', text: 'Verificação em duas etapas ativada.' });
                  });
                }}
              >
                <Input
                  inputMode="numeric"
                  autoComplete="one-time-code"
                  placeholder="123456"
                  maxLength={6}
                  value={code}
                  onChange={e => setCode(e.target.value)}
                />
                <Button disabled={busy || code.length !== 6}>Ativar</Button>
              </form>
            </div>
          </div>
        )}

        {status?.enabled && (
          <div className="mt-4 space-y-5 text-sm">
            <p className="text-white/55">
              Ativa desde {status.enabledAt ? new Date(status.enabledAt).toLocaleDateString('pt-BR') : '—'} ·{' '}
              {status.recoveryCodesLeft} códigos de recuperação restantes.
            </p>
            <form
              className="flex flex-wrap gap-2"
              onSubmit={e => {
                e.preventDefault();
                void run(async () => {
                  const r = await api<{ recoveryCodes: string[] }>('/api/me/mfa/recovery-codes', {
                    method: 'POST',
                    body: JSON.stringify({ code }),
                  });
                  setCodes(r.recoveryCodes);
                  setCode('');
                  await refresh();
                });
              }}
            >
              <Input
                className="max-w-40"
                inputMode="numeric"
                placeholder="Código 2FA"
                maxLength={6}
                value={code}
                onChange={e => setCode(e.target.value)}
              />
              <Button variant="outline" disabled={busy || code.length !== 6}>
                Gerar novos códigos de recuperação
              </Button>
            </form>
            {!status.required && (
              <form
                className="flex flex-wrap gap-2 border-t border-white/10 pt-4"
                onSubmit={e => {
                  e.preventDefault();
                  void run(async () => {
                    await api('/api/me/mfa/disable', { method: 'POST', body: JSON.stringify({ code, password }) });
                    setCode('');
                    setPassword('');
                    await Promise.all([refresh(), loadMe()]);
                    setMessage({ type: 'ok', text: 'Verificação em duas etapas desativada.' });
                  });
                }}
              >
                <Input
                  className="max-w-48"
                  type="password"
                  autoComplete="current-password"
                  placeholder="Senha"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                />
                <Input
                  className="max-w-32"
                  inputMode="numeric"
                  placeholder="Código"
                  maxLength={6}
                  value={code}
                  onChange={e => setCode(e.target.value)}
                />
                <Button variant="danger" disabled={busy || !password || code.length !== 6}>
                  Desativar 2FA
                </Button>
              </form>
            )}
          </div>
        )}
      </Card>
    </section>
  );
}
