'use client';
import { Suspense, useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { api } from '@/lib/api';
function Verify() {
  const sp = useSearchParams();
  const [msg, setMsg] = useState('Confirmando seu email...');
  useEffect(() => {
    const t = sp.get('token');
    if (!t) {
      setMsg('Token ausente.');
      return;
    }
    api('/api/auth/verify-email', { method: 'POST', body: JSON.stringify({ token: t }) }, false)
      .then(() => setMsg('Email confirmado com sucesso.'))
      .catch(e => setMsg(e.message));
  }, [sp]);
  return <div className="mx-auto max-w-xl px-4 py-24 text-center text-xl">{msg}</div>;
}
export default function Page() {
  return (
    <Suspense
      fallback={<div className="mx-auto max-w-xl px-4 py-24 text-center text-xl">Confirmando seu email...</div>}
    >
      <Verify />
    </Suspense>
  );
}
