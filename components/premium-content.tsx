'use client';
import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { Button, Card } from '@/ui';
export function PremiumContent({ slug }: { slug: string }) {
  const { data, isLoading } = useQuery({
    queryKey: ['premium-post', slug],
    queryFn: () => api<any>(`/api/posts/${slug}`),
  });
  if (isLoading) return <Card className="my-10 p-8 text-white/50">Validando seu acesso Premium...</Card>;
  if (!data || data.premiumLocked)
    return (
      <Card className="my-10 border-violet-400/30 bg-violet-500/10 p-8">
        <h2 className="text-xl font-bold">Conteúdo Hypeverso Premium</h2>
        <p className="mt-2 text-white/55">Este artigo está disponível para assinantes Premium.</p>
        <Link href="/shop">
          <Button className="mt-5">Apoiar o Hypeverso</Button>
        </Link>
      </Card>
    );
  return <div className="prose-nv mt-10 text-lg" dangerouslySetInnerHTML={{ __html: data.content }} />;
}
