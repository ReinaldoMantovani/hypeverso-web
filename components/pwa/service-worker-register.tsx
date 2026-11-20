'use client';
import { useEffect } from 'react';

/** Registra o service worker (PWA, leitura offline e Web Push). */
export function ServiceWorkerRegister() {
  useEffect(() => {
    if (!('serviceWorker' in navigator)) return;
    if (process.env.NODE_ENV !== 'production' && process.env.NEXT_PUBLIC_SW_DEV !== 'true') return;
    const register = () => navigator.serviceWorker.register('/sw.js', { scope: '/' }).catch(() => undefined);
    if (document.readyState === 'complete') register();
    else window.addEventListener('load', register, { once: true });
  }, []);
  return null;
}

export async function swMessage<T = any>(
  message: Record<string, unknown>,
  expect: string,
  timeoutMs = 20000,
): Promise<T | null> {
  if (!('serviceWorker' in navigator)) return null;
  const reg = await navigator.serviceWorker.ready;
  if (!reg.active) return null;
  return new Promise(resolve => {
    const timer = setTimeout(() => {
      navigator.serviceWorker.removeEventListener('message', onMessage);
      resolve(null);
    }, timeoutMs);
    function onMessage(e: MessageEvent) {
      if (e.data?.type !== expect) return;
      clearTimeout(timer);
      navigator.serviceWorker.removeEventListener('message', onMessage);
      resolve(e.data as T);
    }
    navigator.serviceWorker.addEventListener('message', onMessage);
    reg.active!.postMessage(message);
  });
}
