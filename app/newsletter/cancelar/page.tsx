'use client';
import { Suspense, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { Button } from '@/ui';
import { api } from '@/lib/api';

// Confirmação explícita (um clique): evita que antivírus/scanners de link cancelem sozinhos.
function Cancel() {
  const sp = useSearchParams();
  const [state, setState] = useState<'idle' | 'done' | 'error'>('idle');
  const token = sp.get('token');
  return (
    <div className="mx-auto max-w-lg px-4 py-24 text-center">
      {state === 'done' ? (
        <>
          <h1 className="text-3xl font-black">Inscrição cancelada</h1>
          <p className="mt-3 text-white/60">Você não receberá mais a newsletter. Sentiremos sua falta!</p>
        </>
      ) : (
        <>
          <h1 className="text-3xl font-black">Cancelar newsletter?</h1>
          <p className="mt-3 text-white/60">Você deixará de receber o resumo semanal do Hypeverso.</p>
          <Button
            className="mt-6"
            disabled={!token}
            onClick={async () => {
              try {
                await api(
                  `/api/newsletter/unsubscribe?token=${encodeURIComponent(token || '')}`,
                  { method: 'POST', body: JSON.stringify({ token }) },
                  false,
                );
                setState('done');
              } catch {
                setState('error');
              }
            }}
          >
            Confirmar cancelamento
          </Button>
          {state === 'error' && <p className="mt-4 text-rose-300">Link inválido ou já utilizado.</p>}
        </>
      )}
    </div>
  );
}
export default function Page() {
  return (
    <Suspense fallback={null}>
      <Cancel />
    </Suspense>
  );
}
