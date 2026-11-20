'use client';
import { useEffect } from 'react';
import { api } from '@/lib/api';

export function ListViewTracker({ listId }: { listId: string }) {
  useEffect(() => {
    void api(`/api/lists/${listId}/view`, { method: 'POST' }, false).catch(() => undefined);
  }, [listId]);
  return null;
}
