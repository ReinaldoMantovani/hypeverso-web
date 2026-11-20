import type { Metadata } from 'next';
import { cache } from 'react';
import { notFound } from 'next/navigation';
import { serverApi } from '@/lib/api';
import { TaxonomyPage } from '@/components/taxonomy/taxonomy-page';

// Dados com cache de 5 min (revalidação incremental no Data Cache do Next).
export const revalidate = 300;
type Params = { params: Promise<{ slug: string }>; searchParams: Promise<{ page?: string; ordem?: string }> };

const loadCategory = cache((slug: string) =>
  serverApi<any>(`/api/categories/${encodeURIComponent(slug)}`).catch(() => null),
);

export async function generateMetadata({ params, searchParams }: Params): Promise<Metadata> {
  const { slug } = await params;
  const { page } = await searchParams;
  const category = await loadCategory(slug);
  if (!category) return {};
  const n = Number(page) || 1;
  return {
    title: n > 1 ? `${category.name} — página ${n}` : `${category.name}: notícias e novidades`,
    description: category.description || `Últimas notícias de ${category.name} no Hypeverso.`,
    alternates: { canonical: n > 1 ? `/categoria/${slug}?page=${n}` : `/categoria/${slug}` },
  };
}

export default async function CategoryPage({ params, searchParams }: Params) {
  const { slug } = await params;
  const { page, ordem } = await searchParams;
  const category = await loadCategory(slug);
  if (!category) notFound();
  const sort = ordem === 'popular' ? 'popular' : 'recent';
  const n = Math.max(1, Number(page) || 1);
  const data = await serverApi<any>(
    `/api/posts?category=${encodeURIComponent(slug)}&page=${n}&limit=24&sort=${sort}`,
  ).catch(() => null);
  return (
    <TaxonomyPage
      kind="categoria"
      slug={slug}
      name={category.name}
      description={category.description}
      data={data}
      sort={sort}
    />
  );
}
