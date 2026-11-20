'use client';
import { useQuery } from '@tanstack/react-query';
import { Tv } from 'lucide-react';
import { api } from '@/lib/api';

type Provider = { id: number; name: string; logoUrl: string | null };
type Data = {
  available: boolean;
  providers: {
    link: string | null;
    flatrate: Provider[];
    rent: Provider[];
    buy: Provider[];
    free: Provider[];
    ads: Provider[];
  } | null;
};

const GROUPS: [keyof NonNullable<Data['providers']>, string][] = [
  ['flatrate', 'Streaming'],
  ['free', 'Grátis'],
  ['ads', 'Grátis com anúncios'],
  ['rent', 'Alugar'],
  ['buy', 'Comprar'],
];

/** "Onde assistir" com dados da JustWatch via TMDB (atribuição obrigatória). */
export function WatchProviders({ provider, type, externalId }: { provider: string; type: string; externalId: string }) {
  const enabled = provider === 'TMDB' && (type === 'MOVIE' || type === 'SERIES');
  const q = useQuery({
    queryKey: ['watch-providers', provider, type, externalId],
    queryFn: () => api<Data>(`/api/catalog/${provider}/${type}/${externalId}/watch-providers`),
    enabled,
    staleTime: 60 * 60_000,
  });
  if (!enabled) return null;
  const p = q.data?.providers;
  const groups = p ? GROUPS.filter(([key]) => (p[key] as Provider[]).length) : [];
  return (
    <div className="rounded-xl border border-white/10 bg-white/[.02] p-4">
      <h3 className="flex items-center gap-2 text-sm font-bold">
        <Tv size={16} className="text-cyan-300" /> Onde assistir no Brasil
      </h3>
      {q.isLoading ? (
        <p className="mt-3 text-xs text-white/40">Carregando...</p>
      ) : !groups.length ? (
        <p className="mt-3 text-xs text-white/40">Ainda não disponível em serviços no Brasil.</p>
      ) : (
        <div className="mt-3 space-y-3">
          {groups.map(([key, label]) => (
            <div key={key}>
              <div className="text-[11px] uppercase tracking-wider text-white/35">{label}</div>
              <ul className="mt-1.5 flex flex-wrap gap-2">
                {(p![key] as Provider[]).slice(0, 10).map(item => (
                  <li key={item.id} title={item.name}>
                    {item.logoUrl ? (
                      <img
                        src={item.logoUrl}
                        alt={item.name}
                        width={36}
                        height={36}
                        className="h-9 w-9 rounded-lg"
                        loading="lazy"
                      />
                    ) : (
                      <span className="rounded-lg bg-white/10 px-2 py-1 text-xs">{item.name}</span>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          ))}
          {p?.link && (
            <a
              href={p.link}
              target="_blank"
              rel="noopener noreferrer nofollow"
              className="inline-block text-xs text-cyan-300 hover:underline"
            >
              Ver todas as opções
            </a>
          )}
        </div>
      )}
      <p className="mt-3 text-[10px] text-white/30">Dados de disponibilidade fornecidos por JustWatch.</p>
    </div>
  );
}
