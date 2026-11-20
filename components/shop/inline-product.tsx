'use client';
import { useCallback, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { CheckCircle2, ShoppingBag, ShoppingCart } from 'lucide-react';
import { api } from '@/lib/api';
import { assetUrl } from '@/lib/asset-url';
import { useI18n } from '@/lib/i18n';
import { useAuth } from '@/stores/auth';
import { discountPercent, formatPrice, type ShopProduct } from './product-card';
import { firstName, PurchaseModal, type ShopTexts } from './purchase-modal';

/** Card horizontal de produto dentro do artigo (código [[produto:slug]] do CMS). */
export function InlineShopProduct({ product }: { product: ShopProduct }) {
  const { locale } = useI18n();
  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  const close = useCallback(() => setOpen(false), []);
  const { data } = useQuery({
    queryKey: ['public-settings'],
    queryFn: () => api<{ shop: ShopTexts }>('/api/settings/public'),
    staleTime: 5 * 60_000,
  });
  const price = formatPrice(product.priceCents, product.currency || 'BRL', locale);
  const original = formatPrice(product.originalPriceCents, product.currency || 'BRL', locale);
  const off = discountPercent(product);
  return (
    <aside className="not-prose my-8 overflow-hidden rounded-2xl border border-violet-400/25 bg-gradient-to-br from-violet-950/40 to-[#0c0818]">
      <div className="flex items-center gap-1.5 border-b border-white/5 px-4 py-2 text-[11px] font-bold uppercase tracking-[.16em] text-violet-200">
        <ShoppingBag size={13} /> Hypeverso Shop
      </div>
      <div className="flex flex-col gap-4 p-4 sm:flex-row sm:items-center">
        <div className="mx-auto h-36 w-36 shrink-0 overflow-hidden rounded-xl bg-white sm:mx-0">
          {product.imageUrl ? (
            <img src={assetUrl(product.imageUrl)} alt={product.title} loading="lazy" className="h-full w-full object-contain p-2" />
          ) : null}
        </div>
        <div className="min-w-0 flex-1">
          <div className="text-xs text-white/45">{product.store}</div>
          <div className="mt-0.5 text-lg font-bold leading-snug text-white">{product.title}</div>
          {product.highlights?.length ? (
            <ul className="mt-2 list-none space-y-1 !pl-0 text-sm text-white/65">
              {product.highlights.slice(0, 3).map(h => (
                <li key={h} className="flex gap-1.5">
                  <CheckCircle2 size={14} className="mt-0.5 shrink-0 text-emerald-300" /> {h}
                </li>
              ))}
            </ul>
          ) : product.description ? (
            <p className="mt-1 line-clamp-2 text-sm text-white/55">{product.description}</p>
          ) : null}
          <div className="mt-3 flex flex-wrap items-center gap-3">
            {price && (
              <div>
                {original && off ? <div className="text-xs text-white/35 line-through">{original}</div> : null}
                <div className="text-2xl font-black">
                  {price} {off ? <span className="ml-1 rounded-full bg-emerald-500 px-2 py-0.5 text-xs text-[#05030b]">-{off}%</span> : null}
                </div>
              </div>
            )}
            <button
              type="button"
              onClick={() => setOpen(true)}
              className="ml-auto flex items-center gap-2 rounded-xl bg-gradient-to-r from-violet-600 to-fuchsia-600 px-5 py-2.5 text-sm font-bold text-white hover:from-violet-500 hover:to-fuchsia-500"
            >
              <ShoppingCart size={16} /> {data?.shop?.buyLabel || 'Comprar'}
            </button>
          </div>
        </div>
      </div>
      <PurchaseModal
        product={open ? product : null}
        userName={firstName(user?.name)}
        locale={locale}
        onClose={close}
        texts={data?.shop}
      />
    </aside>
  );
}
