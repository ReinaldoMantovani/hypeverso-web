import type { Metadata } from 'next';
import { cache } from 'react';
import { notFound } from 'next/navigation';
import { serverApi } from '@/lib/api';
import { TaxonomyPage } from '@/components/taxonomy/taxonomy-page';

export const revalidate = 300;
type Params = { params: Promise<{ slug: string }>; searchParams: Promise<{ page?: string; ordem?: string }> };

const loadTag = cache((slug: string) => serverApi<any>(`/api/tags/${encodeURIComponent(slug)}`).catch(() => null));

export async function generateMetadata({ params, searchParams }: Params): Promise<Metadata> {
  const { slug } = await params;
  const { page } = await searchParams;
  const tag = await loadTag(slug);
  if (!tag) return {};
  const n = Number(page) || 1;
  return {
    title: n > 1 ? `#${tag.name} — página ${n}` : `#${tag.name}: notícias`,
    description: `Artigos do Hypeverso sobre ${tag.name}.`,
    alternates: { canonical: n > 1 ? `/tag/${slug}?page=${n}` : `/tag/${slug}` },
  };
}

export default async function TagPage({ params, searchParams }: Params) {
  const { slug } = await params;
  const { page, ordem } = await searchParams;
  const tag = await loadTag(slug);
  if (!tag) notFound();
  const sort = ordem === 'popular' ? 'popular' : 'recent';
  const n = Math.max(1, Number(page) || 1);
  const data = await serverApi<any>(`/api/posts?tag=${encodeURIComponent(slug)}&page=${n}&limit=24&sort=${sort}`).catch(
    () => null,
  );
  return <TaxonomyPage kind="tag" slug={slug} name={tag.name} data={data} sort={sort} />;
}
