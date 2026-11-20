'use client';
import { Bookmark } from 'lucide-react';
import { Button } from '@/ui';
import { api } from '@/lib/api';
import { useState } from 'react';
export function ArticleActions({ postId }: { postId: string }) {
  const [saved, setSaved] = useState(false);
  return (
    <div className="mt-6 flex gap-2">
      <Button
        variant="outline"
        onClick={async () => {
          try {
            const r = await api<any>(`/api/favorites/${postId}`, { method: 'POST' });
            setSaved(r.favorite);
          } catch (e: any) {
            alert(e.message);
          }
        }}
      >
        <Bookmark size={17} />
        {saved ? 'Salvo' : 'Salvar'}
      </Button>
    </div>
  );
}
