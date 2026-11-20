'use client';
import { Suspense, useEffect, useState } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { api } from '@/lib/api';

function Confirm() {
  const sp = useSearchParams();
  const [state, setState] = useState<'loading' | 'ok' | 'error'>('loading');
  const [error, setError] = useState('');
  useEffect(() => {
    const token = sp.get('token');
    if (!token) {
      setState('error');
      setError('Link incompleto.');
      return;
    }
    api('/api/newsletter/confirm', { method: 'POST', body: JSON.stringify({ token }) }, false)
      .then(() => setState('ok'))
      .catch(e => {
        setState('error');
        setError(e.message);
      });
  }, [sp]);
  return (
    <div className="mx-auto max-w-lg px-4 py-24 text-center">
      {state === 'loading' && <p className="text-white/55">Confirmando...</p>}
      {state === 'ok' && (
        <>
          <h1 className="text-3xl font-black">Inscrição confirmada! 📬</h1>
          <p className="mt-3 text-white/60">Você vai receber o melhor da semana do Hypeverso.</p>
          <Link href="/" className="mt-6 inline-block text-violet-300">
            Voltar ao início
          </Link>
        </>
      )}
      {state === 'error' && (
        <>
          <h1 className="text-2xl font-black">Não foi possível confirmar</h1>
          <p className="mt-3 text-rose-300">{error}</p>
          <Link href="/newsletter" className="mt-6 inline-block text-violet-300">
            Inscrever novamente
          </Link>
        </>
      )}
    </div>
  );
}
export default function Page() {
  return (
    <Suspense fallback={null}>
      <Confirm />
    </Suspense>
  );
}
