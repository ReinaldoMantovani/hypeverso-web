'use client';
import { useState } from 'react';
import { Share2 } from 'lucide-react';
import { Button } from '@/ui';

export function ShareButton({ title, url }: { title: string; url: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <Button
      variant="outline"
      onClick={async () => {
        try {
          if (navigator.share) await navigator.share({ title, url });
          else {
            await navigator.clipboard.writeText(url);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
          }
        } catch {}
      }}
    >
      <Share2 size={15} /> {copied ? 'Link copiado' : 'Compartilhar'}
    </Button>
  );
}
