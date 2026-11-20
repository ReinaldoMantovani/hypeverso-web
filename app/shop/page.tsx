import type { Metadata } from 'next';
import { serverApi } from '@/lib/api';
import { ShopBrowser, type ShopResponse, type ShopSettings } from '@/components/shop/shop-browser';

export const revalidate = 60;
export const metadata: Metadata = {
  title: 'Hypeverso Shop',
  description:
    'Colecionáveis, games, mangás, HQs e tecnologia escolhidos pela equipe do Hypeverso. Comprando pelos nossos links você apoia o projeto.',
  alternates: { canonical: '/shop' },
  openGraph: {
    title: 'Hypeverso Shop',
    description: 'Achados nerds escolhidos a dedo. Compre pelos nossos links e apoie o Hypeverso.',
    url: '/shop',
  },
};

export default async function ShopPage() {
  const [initial, settings] = await Promise.all([
    serverApi<ShopResponse>('/api/shop/products').catch(() => null),
    serverApi<{ shop: ShopSettings }>('/api/settings/public').catch(() => null),
  ]);
  if (settings?.shop?.enabled === false)
    return (
      <section className="mx-auto max-w-3xl px-4 py-24 text-center text-white/55">
        A Hypeverso Shop está temporariamente fechada. Volte em breve!
      </section>
    );
  return <ShopBrowser initial={initial} settings={settings?.shop ?? null} />;
}
