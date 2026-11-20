'use client';
import { Suspense, useState } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { api } from '@/lib/api';
import { Button, Input, Card } from '@/ui';

function ResetForm() {
  const sp = useSearchParams();
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [done, setDone] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const token = sp.get('token');
  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    if (password !== confirm) {
      setError('As senhas não conferem.');
      return;
    }
    setLoading(true);
    try {
      await api('/api/auth/reset-password', { method: 'POST', body: JSON.stringify({ token, password }) }, false);
      setDone(true);
    } catch (err: any) {
      setError(err?.message || 'Não foi possível redefinir a senha.');
    } finally {
      setLoading(false);
    }
  }
  return (
    <Card className="w-full max-w-md p-7">
      <h1 className="text-2xl font-black">Nova senha</h1>
      {!token ? (
        <p className="mt-4 text-rose-300">Link inválido. Solicite uma nova recuperação de senha.</p>
      ) : done ? (
        <p className="mt-4">
          Senha atualizada. Você já pode{' '}
          <Link href="/login" className="text-violet-300">
            entrar
          </Link>
          .
        </p>
      ) : (
        <form className="mt-5 space-y-3" onSubmit={submit}>
          <Input
            type="password"
            minLength={8}
            maxLength={128}
            required
            autoComplete="new-password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            placeholder="Nova senha"
          />
          <Input
            type="password"
            minLength={8}
            maxLength={128}
            required
            autoComplete="new-password"
            value={confirm}
            onChange={e => setConfirm(e.target.value)}
            placeholder="Confirme a nova senha"
          />
          {error && <p className="text-sm text-rose-300">{error}</p>}
          <Button className="w-full" disabled={loading}>
            {loading ? 'Atualizando...' : 'Atualizar senha'}
          </Button>
        </form>
      )}
    </Card>
  );
}
export default function Reset() {
  return (
    <div className="grid min-h-[65vh] place-items-center px-4">
      <Suspense fallback={null}>
        <ResetForm />
      </Suspense>
    </div>
  );
}
