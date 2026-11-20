'use client';
import { ShoppingBag } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';

// Programa de afiliados. A tag da Amazon e as lojas extras vêm do CMS
// (Configurações › Afiliados). As variáveis NEXT_PUBLIC_AMAZON_TAG e
// NEXT_PUBLIC_AFFILIATE_EXTRA continuam valendo como reserva.
const ENV_AMAZON_TAG = (process.env.NEXT_PUBLIC_AMAZON_TAG || '').trim();
type Store = { name: string; url: string };
type ExtraStore = { name: string; template: string; types?: string[] };
type PublicAffiliate = { amazonTag?: string; extraStores?: ExtraStore[] };

function envExtraStores(): ExtraStore[] {
  try {
    const parsed = JSON.parse(process.env.NEXT_PUBLIC_AFFILIATE_EXTRA || '[]');
    return Array.isArray(parsed)
      ? parsed.filter(s => typeof s?.name === 'string' && /^https:\/\//.test(s?.template || ''))
      : [];
  } catch {
    return [];
  }
}

function storesFor(title: string, type: string, cfg?: PublicAffiliate): Store[] {
  const q = encodeURIComponent(title);
  const out: Store[] = [];
  const AMAZON_TAG = (cfg?.amazonTag || ENV_AMAZON_TAG).trim();
  if (AMAZON_TAG) {
    const dept =
      { GAME: 'videogames', MANGA: 'stripbooks', COMIC: 'stripbooks', MOVIE: 'dvd', SERIES: 'dvd', ANIME: 'dvd' }[
        type
      ] || 'aps';
    out.push({
      name: 'Amazon',
      url: `https://www.amazon.com.br/s?k=${q}&i=${dept}&tag=${encodeURIComponent(AMAZON_TAG)}`,
    });
  }
  const extras = cfg?.extraStores?.length ? cfg.extraStores : envExtraStores();
  for (const s of extras) {
    if (s.types?.length && !s.types.includes(type)) continue;
    if (!/^https:\/\//.test(s.template)) continue;
    out.push({ name: s.name, url: s.template.replace('{query}', q) });
  }
  return out;
}

export function AffiliateLinks({ title, type, catalogId }: { title: string; type: string; catalogId?: string }) {
  const { data } = useQuery({
    queryKey: ['public-settings'],
    queryFn: () => api<{ affiliate: PublicAffiliate }>('/api/settings/public'),
    staleTime: 5 * 60_000,
  });
  const stores = storesFor(title, type, data?.affiliate);
  if (!stores.length) return null;
  const track = (store: string) =>
    void api(
      '/api/analytics/event',
      {
        method: 'POST',
        keepalive: true,
        body: JSON.stringify({
          type: 'AFFILIATE_CLICK',
          path: location.pathname,
          metadata: { store, catalogId: catalogId || null },
        }),
      },
      false,
    ).catch(() => undefined);
  return (
    <div className="rounded-xl border border-white/10 bg-white/[.02] p-4">
      <h3 className="flex items-center gap-2 text-sm font-bold">
        <ShoppingBag size={16} className="text-amber-300" /> Comprar
      </h3>
      <ul className="mt-3 flex flex-wrap gap-2">
        {stores.map(s => (
          <li key={s.name}>
            <a
              href={s.url}
              target="_blank"
              rel="sponsored nofollow noopener noreferrer"
              onClick={() => track(s.name)}
              className="inline-block rounded-lg border border-white/15 px-3 py-1.5 text-xs font-semibold hover:bg-white/5"
            >
              {s.name}
            </a>
          </li>
        ))}
      </ul>
      {/* Transparência exigida pelo CONAR e pelos programas de afiliados. */}
      <p className="mt-3 text-[10px] leading-4 text-white/35">
        Links de afiliado: o Hypeverso pode receber uma comissão pelas compras, sem custo extra para você.
      </p>
    </div>
  );
}
