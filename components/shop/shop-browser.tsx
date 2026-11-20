'use client';
import { useCallback, useMemo, useState } from 'react';
import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { HeartHandshake, Search, ShoppingBag, X } from 'lucide-react';
import { api } from '@/lib/api';
import { useI18n } from '@/lib/i18n';
import { useAuth } from '@/stores/auth';
import { ProductCard, type ShopProduct } from './product-card';
import { firstName, PurchaseModal, type ShopTexts } from './purchase-modal';

export type ShopCollectionLink = { slug: string; title: string; emoji?: string | null };
export type ShopResponse = {
  items: ShopProduct[];
  categories: string[];
  stores: string[];
  total: number;
  collections?: ShopCollectionLink[];
};
export type CollectionHeading = { title: string; description?: string | null; emoji?: string | null };
export type ShopSettings = ShopTexts & { enabled?: boolean; title?: string; subtitle?: string; disclosure?: string };

const TEXT = {
  'pt-BR': {
    kicker: 'Apoie o projeto',
    title: 'Hypeverso Shop',
    subtitle:
      'Achados nerds escolhidos a dedo: colecionáveis, games, mangás, HQs e tecnologia. Comprando por aqui você paga o mesmo preço e ajuda o Hypeverso a continuar no ar.',
    search: 'Buscar produto...',
    all: 'Tudo',
    allStores: 'Todas as lojas',
    empty: 'Nenhum produto por aqui ainda. Volte em breve!',
    noMatch: 'Nenhum produto encontrado com esses filtros.',
    clear: 'Limpar filtros',
    featured: 'Destaques',
    catalog: 'Todos os produtos',
    disclosure:
      'Transparência: os links desta página são de afiliados. Ao comprar, o Hypeverso pode receber uma comissão da loja, sem custo extra para você. Preços e disponibilidade podem mudar na loja.',
    labels: { buy: 'Comprar', coupon: 'Cupom', featured: 'Destaque', off: 'OFF' },
  },
  en: {
    kicker: 'Support the project',
    title: 'Hypeverso Shop',
    subtitle:
      'Hand-picked geek finds: collectibles, games, manga, comics and tech. Buying through here costs you the same and helps keep Hypeverso online.',
    search: 'Search products...',
    all: 'All',
    allStores: 'All stores',
    empty: 'No products yet. Come back soon!',
    noMatch: 'No products match these filters.',
    clear: 'Clear filters',
    featured: 'Featured',
    catalog: 'All products',
    disclosure:
      'Disclosure: links on this page are affiliate links. When you buy, Hypeverso may earn a commission from the store at no extra cost to you. Prices and availability may change.',
    labels: { buy: 'Buy', coupon: 'Coupon', featured: 'Featured', off: 'OFF' },
  },
  es: {
    kicker: 'Apoya el proyecto',
    title: 'Hypeverso Shop',
    subtitle:
      'Hallazgos nerds elegidos a mano: coleccionables, videojuegos, manga, cómics y tecnología. Comprando aquí pagas lo mismo y ayudas a Hypeverso a seguir en línea.',
    search: 'Buscar producto...',
    all: 'Todo',
    allStores: 'Todas las tiendas',
    empty: 'Aún no hay productos. ¡Vuelve pronto!',
    noMatch: 'No hay productos con estos filtros.',
    clear: 'Limpiar filtros',
    featured: 'Destacados',
    catalog: 'Todos los productos',
    disclosure:
      'Transparencia: los enlaces de esta página son de afiliados. Al comprar, Hypeverso puede recibir una comisión de la tienda sin costo extra para ti. Precios y disponibilidad pueden cambiar.',
    labels: { buy: 'Comprar', coupon: 'Cupón', featured: 'Destacado', off: 'OFF' },
  },
} as const;

export function ShopBrowser({
  initial,
  settings,
  collection,
}: {
  initial: ShopResponse | null;
  settings?: ShopSettings | null;
  /** Página de coleção (/shop/c/slug): título próprio e lista fixa (sem buscar a Shop inteira). */
  collection?: CollectionHeading | null;
}) {
  const { locale } = useI18n();
  const { user } = useAuth();
  const base = TEXT[locale] || TEXT['pt-BR'];
  // Em português valem os textos editados no CMS; em inglês/espanhol, as traduções prontas.
  const custom = locale === 'pt-BR' && settings ? settings : null;
  const t = {
    ...base,
    title: custom?.title || base.title,
    subtitle: custom?.subtitle || base.subtitle,
    disclosure: custom?.disclosure || base.disclosure,
    labels: { ...base.labels, buy: custom?.buyLabel || base.labels.buy },
  };
  const [category, setCategory] = useState<string | null>(null);
  const [store, setStore] = useState('');
  const [query, setQuery] = useState('');
  const [selected, setSelected] = useState<ShopProduct | null>(null);
  const closeModal = useCallback(() => setSelected(null), []);

  const { data: fetched } = useQuery({
    queryKey: ['shop-products'],
    queryFn: () => api<ShopResponse>('/api/shop/products'),
    initialData: initial ?? undefined,
    staleTime: 60_000,
    enabled: !collection,
  });
  const data = collection ? initial : fetched;
  const all = useMemo(() => data?.items ?? [], [data]);

  const filtered = useMemo(() => {
    const term = query.trim().toLowerCase();
    return all.filter(
      p =>
        (!category || p.category === category) &&
        (!store || p.store === store) &&
        (!term || `${p.title} ${p.description || ''} ${p.store} ${p.category || ''}`.toLowerCase().includes(term)),
    );
  }, [all, category, store, query]);
  const filtering = Boolean(category || store || query.trim() || collection);
  const featured = filtering ? [] : filtered.filter(p => p.featured);
  const rest = filtering ? filtered : filtered.filter(p => !p.featured);

  const grid = (items: ShopProduct[]) => (
    <div className="grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-3 xl:grid-cols-4">
      {items.map(p => (
        <ProductCard key={p.id} product={p} locale={locale} labels={t.labels} onBuy={setSelected} />
      ))}
    </div>
  );

  return (
    <section className="mx-auto max-w-7xl px-4 py-10 sm:py-14">
      <header className="relative overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-br from-violet-950/70 via-[#0c0818] to-cyan-950/50 p-6 sm:p-10">
        <div className="grid-bg pointer-events-none absolute inset-0 opacity-60" />
        <div className="relative max-w-2xl">
          <span className="inline-flex items-center gap-2 rounded-full border border-violet-300/30 bg-violet-500/10 px-3 py-1 text-xs font-bold uppercase tracking-[.18em] text-violet-200">
            <HeartHandshake size={14} /> {t.kicker}
          </span>
          {collection ? (
            <>
              <Link href="/shop" className="mt-4 block w-fit text-sm text-cyan-300 hover:underline">
                ← {t.title}
              </Link>
              <h1 className="neon-text mt-2 flex items-center gap-3 text-4xl font-black sm:text-5xl">
                <span>{collection.emoji || '🛍️'}</span> {collection.title}
              </h1>
              {collection.description && <p className="mt-4 text-white/65 sm:text-lg">{collection.description}</p>}
            </>
          ) : (
            <>
              <h1 className="neon-text mt-4 flex items-center gap-3 text-4xl font-black sm:text-5xl">
                <ShoppingBag className="text-violet-300" size={40} /> {t.title}
              </h1>
              <p className="mt-4 text-white/65 sm:text-lg">{t.subtitle}</p>
            </>
          )}
          {!collection && (data?.collections?.length || 0) > 0 && (
            <div className="mt-6 flex flex-wrap gap-2">
              {data!.collections!.map(c => (
                <Link
                  key={c.slug}
                  href={`/shop/c/${c.slug}`}
                  className="rounded-full border border-white/15 bg-white/10 px-4 py-1.5 text-sm font-semibold text-white/85 backdrop-blur transition hover:border-violet-300/60 hover:bg-violet-500/20"
                >
                  {c.emoji ? `${c.emoji} ` : ''}
                  {c.title}
                </Link>
              ))}
            </div>
          )}
        </div>
      </header>

      {all.length > 0 && (
        <div className="sticky top-16 z-30 -mx-4 mt-6 border-b border-white/5 bg-[#05030bdd] px-4 py-3 backdrop-blur-xl">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
            <label className="relative flex-1">
              <Search
                className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-white/35"
                size={17}
              />
              <input
                value={query}
                onChange={e => setQuery(e.target.value)}
                placeholder={t.search}
                className="h-11 w-full rounded-xl border border-white/10 bg-white/5 pl-10 pr-3 text-sm outline-none focus:border-violet-400/60"
              />
            </label>
            {(data?.stores.length || 0) > 1 && (
              <select
                value={store}
                onChange={e => setStore(e.target.value)}
                className="h-11 rounded-xl border border-white/10 bg-[#0c0818] px-3 text-sm outline-none focus:border-violet-400/60"
              >
                <option value="">{t.allStores}</option>
                {data?.stores.map(s => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            )}
          </div>
          {(data?.categories.length || 0) > 0 && (
            <div className="mt-3 flex gap-2 overflow-x-auto pb-1 text-sm [scrollbar-width:none]">
              {[null, ...(data?.categories || [])].map(c => (
                <button
                  key={c ?? '__all'}
                  type="button"
                  onClick={() => setCategory(c)}
                  className={`shrink-0 rounded-full border px-4 py-1.5 transition ${
                    category === c
                      ? 'border-violet-400 bg-violet-600 text-white'
                      : 'border-white/10 bg-white/5 text-white/65 hover:text-white'
                  }`}
                >
                  {c ?? t.all}
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {all.length === 0 ? (
        <div className="mt-10 rounded-2xl border border-dashed border-white/15 p-12 text-center text-white/45">
          <ShoppingBag className="mx-auto mb-3 text-white/25" size={40} />
          {t.empty}
        </div>
      ) : filtered.length === 0 ? (
        <div className="mt-10 rounded-2xl border border-dashed border-white/15 p-12 text-center text-white/45">
          {t.noMatch}
          <button
            type="button"
            onClick={() => {
              setCategory(null);
              setStore('');
              setQuery('');
            }}
            className="mx-auto mt-4 flex items-center gap-1 rounded-xl border border-white/10 px-3 py-1.5 text-sm text-white/70 hover:bg-white/5"
          >
            <X size={14} /> {t.clear}
          </button>
        </div>
      ) : (
        <div className="mt-8 space-y-10">
          {featured.length > 0 && (
            <div>
              <h2 className="mb-4 text-xl font-black">{t.featured}</h2>
              {grid(featured)}
            </div>
          )}
          {rest.length > 0 && (
            <div>
              {featured.length > 0 && <h2 className="mb-4 text-xl font-black">{t.catalog}</h2>}
              {grid(rest)}
            </div>
          )}
        </div>
      )}

      <p className="mt-12 rounded-2xl border border-white/10 bg-white/[0.03] p-4 text-xs leading-relaxed text-white/40">
        {t.disclosure}
      </p>

      <PurchaseModal
        product={selected}
        userName={firstName(user?.name)}
        locale={locale}
        onClose={closeModal}
        texts={settings}
      />
    </section>
  );
}
