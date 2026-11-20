'use client';
import { useEffect } from 'react';
import { api } from '@/lib/api';

/** Conta uma visualização real (navegador) por artigo e sessão. */
export function ViewTracker({ postId }: { postId: string }) {
  useEffect(() => {
    const key = `hv-viewed:${postId}`;
    try {
      if (sessionStorage.getItem(key)) return;
      sessionStorage.setItem(key, '1');
    } catch {}
    const timer = setTimeout(() => {
      void api(`/api/posts/${postId}/view`, { method: 'POST' }, false).catch(() => undefined);
    }, 1500);
    return () => clearTimeout(timer);
  }, [postId]);
  return null;
}
