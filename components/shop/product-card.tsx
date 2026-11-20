'use client';
import { ShoppingCart, Sparkles, Store, Tag } from 'lucide-react';
import { assetUrl } from '@/lib/asset-url';

export type ShopProduct = {
  id: string;
  slug: string;
  title: string;
  description?: string | null;
  imageUrl?: string | null;
  store: string;
  category?: string | null;
  badge?: string | null;
  priceCents?: number | null;
  originalPriceCents?: number | null;
  currency?: string | null;
  couponCode?: string | null;
  highlights?: string[] | null;
  featured?: boolean;
};

export function formatPrice(cents: number | null | undefined, currency = 'BRL', locale = 'pt-BR') {
  if (cents === null || cents === undefined) return null;
  try {
    return new Intl.NumberFormat(locale, { style: 'currency', currency: currency || 'BRL' }).format(cents / 100);
  } catch {
    return `R$ ${(cents / 100).toFixed(2).replace('.', ',')}`;
  }
}

export function discountPercent(p: Pick<ShopProduct, 'priceCents' | 'originalPriceCents'>) {
  if (!p.priceCents || !p.originalPriceCents || p.originalPriceCents <= p.priceCents) return null;
  return Math.round((1 - p.priceCents / p.originalPriceCents) * 100);
}

const STORE_COLORS: Record<string, string> = {
  Amazon: 'bg-amber-400/15 text-amber-200 border-amber-300/25',
  'Mercado Livre': 'bg-yellow-300/15 text-yellow-100 border-yellow-200/25',
  Shopee: 'bg-orange-500/15 text-orange-200 border-orange-300/25',
  AliExpress: 'bg-red-500/15 text-red-200 border-red-300/25',
  Magalu: 'bg-sky-500/15 text-sky-200 border-sky-300/25',
  'KaBuM!': 'bg-orange-400/15 text-orange-100 border-orange-200/25',
};

/**
 * Card de produto da Hypeverso Shop (o mesmo visual é usado na pré-visualização do CMS).
 */
export function ProductCard({
  product,
  locale = 'pt-BR',
  onBuy,
  labels = { buy: 'Comprar', coupon: 'Cupom', featured: 'Destaque', off: 'OFF' },
}: {
  product: ShopProduct;
  locale?: string;
  onBuy?: (product: ShopProduct) => void;
  labels?: { buy: string; coupon: string; featured: string; off: string };
}) {
  const price = formatPrice(product.priceCents, product.currency || 'BRL', locale);
  const original = formatPrice(product.originalPriceCents, product.currency || 'BRL', locale);
  const off = discountPercent(product);
  const storeClass = STORE_COLORS[product.store] || 'bg-white/10 text-white/75 border-white/15';

  return (
    <article
      className={`group relative flex h-full flex-col overflow-hidden rounded-2xl border bg-white/[0.04] transition duration-300 hover:-translate-y-1 hover:shadow-[0_18px_50px_-20px_rgba(139,92,246,.55)] ${
        product.featured ? 'border-violet-400/40' : 'border-white/10 hover:border-violet-400/30'
      }`}
    >
      <div className="relative aspect-square overflow-hidden bg-gradient-to-br from-white to-violet-50">
        {product.imageUrl ? (
          <img
            src={assetUrl(product.imageUrl)}
            alt={product.title}
            loading="lazy"
            referrerPolicy="no-referrer"
            onError={e => {
              // Foto removida pela loja: esconde o ícone de imagem quebrada.
              e.currentTarget.style.visibility = 'hidden';
            }}
            className="h-full w-full object-contain p-5 transition duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="grid h-full place-items-center bg-gradient-to-br from-violet-950 to-cyan-950 text-white/30">
            <ShoppingCart size={48} />
          </div>
        )}
        <div className="absolute left-3 top-3 flex flex-wrap gap-1.5">
          {product.featured && (
            <span className="inline-flex items-center gap-1 rounded-full bg-violet-600 px-2.5 py-1 text-[11px] font-bold text-white shadow">
              <Sparkles size={12} /> {labels.featured}
            </span>
          )}
          {product.badge && (
            <span className="rounded-full bg-cyan-500 px-2.5 py-1 text-[11px] font-bold text-[#05030b] shadow">
              {product.badge}
            </span>
          )}
        </div>
        {off ? (
          <span className="absolute right-3 top-3 rounded-full bg-emerald-500 px-2.5 py-1 text-[11px] font-black text-[#05030b] shadow">
            -{off}% {labels.off}
          </span>
        ) : null}
      </div>

      <div className="flex flex-1 flex-col p-4">
        <div className="flex items-center gap-2 text-[11px]">
          <span
            className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 font-semibold ${storeClass}`}
          >
            <Store size={11} /> {product.store}
          </span>
          {product.category && <span className="truncate text-white/40">{product.category}</span>}
        </div>
        <h3 className="mt-2 line-clamp-2 min-h-[2.5rem] text-[15px] font-bold leading-snug text-white">
          {product.title}
        </h3>
        {product.description && (
          <p className="mt-1.5 line-clamp-2 text-xs leading-relaxed text-white/50">{product.description}</p>
        )}

        <div className="mt-auto pt-4">
          {original && off ? <div className="text-xs text-white/35 line-through">{original}</div> : null}
          {price ? <div className="text-2xl font-black tracking-tight text-white">{price}</div> : null}
          {product.couponCode && (
            <div className="mt-2 inline-flex items-center gap-1 rounded-lg border border-dashed border-cyan-300/40 px-2 py-1 text-[11px] text-cyan-200">
              <Tag size={11} /> {labels.coupon}: <strong className="font-mono">{product.couponCode}</strong>
            </div>
          )}
          <button
            type="button"
            onClick={() => onBuy?.(product)}
            className="mt-3 flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-violet-600 to-fuchsia-600 px-4 py-2.5 text-sm font-bold text-white shadow-lg shadow-violet-900/30 transition hover:from-violet-500 hover:to-fuchsia-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-violet-300"
          >
            <ShoppingCart size={16} /> {labels.buy}
          </button>
        </div>
      </div>
    </article>
  );
}
