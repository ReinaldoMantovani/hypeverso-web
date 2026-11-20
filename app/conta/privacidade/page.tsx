'use client';
import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Download, ShieldCheck, Trash2, Cookie } from 'lucide-react';
import { Button, Card, Input } from '@/ui';
import { api, setToken } from '@/lib/api';
import { useAuth } from '@/stores/auth';
import { openCookieSettings } from '@/components/cookie-consent';
import { LegalLink } from '@/components/legal/legal-link';
import { AccountNav } from '@/components/account-nav';

// Central de privacidade: direitos do titular (LGPD art. 18) em autoatendimento.
export default function PrivacyCenter() {
  const router = useRouter();
  const { user, hydrated } = useAuth();
  const [busy, setBusy] = useState<'export' | 'delete' | null>(null);
  const [message, setMessage] = useState<{ type: 'ok' | 'error'; text: string } | null>(null);
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');

  async function exportData() {
    setBusy('export');
    setMessage(null);
    try {
      const data = await api<any>('/api/me/export');
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `hypeverso-meus-dados-${new Date().toISOString().slice(0, 10)}.json`;
      a.click();
      setTimeout(() => URL.revokeObjectURL(url), 1000);
      setMessage({ type: 'ok', text: 'Arquivo gerado. Guarde-o em local seguro.' });
    } catch (e: any) {
      setMessage({ type: 'error', text: e?.message || 'Não foi possível exportar os dados.' });
    } finally {
      setBusy(null);
    }
  }

  async function deleteAccount(e: React.FormEvent) {
    e.preventDefault();
    if (confirm !== 'EXCLUIR') return;
    setBusy('delete');
    setMessage(null);
    try {
      await api('/api/me', { method: 'DELETE', body: JSON.stringify({ password, confirm }) });
      setToken(null);
      useAuth.setState({ user: null });
      router.push('/?conta-excluida=1');
    } catch (err: any) {
      setMessage({ type: 'error', text: err?.message || 'Não foi possível excluir a conta.' });
    } finally {
      setBusy(null);
    }
  }

  if (hydrated && !user)
    return (
      <section className="mx-auto max-w-2xl px-4 py-14">
        <Card className="p-7">
          <h1 className="text-2xl font-black">Privacidade e dados</h1>
          <p className="mt-2 text-white/55">Entre na sua conta para exportar ou excluir seus dados.</p>
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
        <p className="text-xs font-black uppercase tracking-[.25em] text-cyan-300">Conta</p>
        <h1 className="mt-2 flex items-center gap-2 text-3xl font-black">
          <ShieldCheck className="text-violet-300" />
          Privacidade e dados
        </h1>
        <p className="mt-2 text-white/55">
          Exerça seus direitos previstos na LGPD. Detalhes na{' '}
          <LegalLink kind="privacy" className="text-cyan-300 hover:underline">
            Política de Privacidade
          </LegalLink>
          .
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
      <Card className="p-6">
        <h2 className="flex items-center gap-2 text-lg font-bold">
          <Download size={18} />
          Exportar meus dados
        </h2>
        <p className="mt-1 text-sm text-white/55">
          Baixe um arquivo JSON com seu perfil, comentários, publicações, favoritos, biblioteca, preferências e
          histórico de buscas.
        </p>
        <Button className="mt-4" onClick={exportData} disabled={busy !== null}>
          {busy === 'export' ? 'Gerando...' : 'Exportar dados'}
        </Button>
      </Card>
      <Card className="p-6">
        <h2 className="flex items-center gap-2 text-lg font-bold">
          <Cookie size={18} />
          Cookies e publicidade
        </h2>
        <p className="mt-1 text-sm text-white/55">
          Altere ou revogue seu consentimento de análise, personalização e anúncios do Google.
        </p>
        <div className="mt-4 flex flex-wrap gap-2">
          <Button variant="outline" onClick={openCookieSettings}>
            Configurar cookies
          </Button>
          <a href="https://adssettings.google.com" target="_blank" rel="noopener noreferrer">
            <Button variant="outline" type="button">
              Configurações de anúncios do Google
            </Button>
          </a>
        </div>
      </Card>
      <Card className="border-rose-400/20 p-6">
        <h2 className="flex items-center gap-2 text-lg font-bold text-rose-200">
          <Trash2 size={18} />
          Excluir minha conta
        </h2>
        <p className="mt-1 text-sm text-white/55">
          A exclusão é permanente e remove perfil, comentários, publicações, favoritos e biblioteca. Assinaturas Premium
          ativas precisam ser canceladas antes.
        </p>
        <form onSubmit={deleteAccount} className="mt-4 grid gap-3 sm:max-w-sm">
          <Input
            type="password"
            required
            autoComplete="current-password"
            placeholder="Sua senha"
            value={password}
            onChange={e => setPassword(e.target.value)}
          />
          <Input
            required
            placeholder="Digite EXCLUIR para confirmar"
            value={confirm}
            onChange={e => setConfirm(e.target.value)}
          />
          <Button variant="danger" disabled={busy !== null || confirm !== 'EXCLUIR' || !password}>
            {busy === 'delete' ? 'Excluindo...' : 'Excluir conta definitivamente'}
          </Button>
        </form>
      </Card>
    </section>
  );
}
