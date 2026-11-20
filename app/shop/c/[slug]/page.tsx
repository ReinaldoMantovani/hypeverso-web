import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { serverApi } from '@/lib/api';
import { ShopBrowser, type ShopSettings } from '@/components/shop/shop-browser';
import type { ShopProduct } from '@/components/shop/product-card';

export const revalidate = 60;

type CollectionResponse = {
  collection: { slug: string; title: string; description: string | null; emoji: string | null };
  items: ShopProduct[];
};

async function load(slug: string) {
  return serverApi<CollectionResponse>(`/api/shop/collections/${encodeURIComponent(slug)}`).catch(() => null);
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const data = await load(slug);
  if (!data) return { title: 'Coleção não encontrada' };
  const title = `${data.collection.title} · Hypeverso Shop`;
  const description = data.collection.description || `Seleção “${data.collection.title}” da Hypeverso Shop.`;
  const image = data.items.find(p => p.imageUrl)?.imageUrl || undefined;
  return {
    title,
    description,
    alternates: { canonical: `/shop/c/${slug}` },
    openGraph: { title, description, url: `/shop/c/${slug}`, ...(image ? { images: [{ url: image }] } : {}) },
  };
}

export default async function CollectionPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const [data, settings] = await Promise.all([
    load(slug),
    serverApi<{ shop: ShopSettings }>('/api/settings/public').catch(() => null),
  ]);
  if (!data) notFound();
  return (
    <ShopBrowser
      collection={data.collection}
      settings={settings?.shop ?? null}
      initial={{ items: data.items, categories: [], stores: [], total: data.items.length }}
    />
  );
}
