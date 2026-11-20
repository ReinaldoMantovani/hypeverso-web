import type { Metadata } from 'next';
import Link from 'next/link';
import { serverApi } from '@/lib/api';
import { ListCard, type ListSummary } from '@/components/lists/list-card';

export const revalidate = 300;
export const metadata: Metadata = {
  title: 'Listas da comunidade',
  description: 'Rankings e coleções criadas pela comunidade do Hypeverso: filmes, séries, animes, games e mangás.',
  alternates: { canonical: '/listas' },
};

export default async function ListsPage({
  searchParams,
}: {
  searchParams: Promise<{ ordem?: string; page?: string }>;
}) {
  const { ordem, page } = await searchParams;
  const sort = ordem === 'popular' ? 'popular' : 'recent';
  const n = Math.max(1, Number(page) || 1);
  const data = await serverApi<{ items: ListSummary[]; pages: number }>(`/api/lists?sort=${sort}&page=${n}`).catch(
    () => null,
  );
  return (
    <section className="mx-auto max-w-7xl px-4 py-12">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-4xl font-black">Listas da comunidade</h1>
          <p className="mt-2 text-white/50">Tops, maratonas e coleções para descobrir algo novo.</p>
        </div>
        <Link
          href="/listas/minhas"
          className="rounded-xl bg-violet-600 px-4 py-2 text-sm font-semibold hover:bg-violet-500"
        >
          Criar minha lista
        </Link>
      </div>
      <div className="mt-6 flex gap-2 text-sm">
        <Link
          href="/listas"
          className={`rounded-full px-3 py-1 ${sort === 'recent' ? 'bg-violet-500/20 text-violet-100' : 'text-white/55'}`}
        >
          Recentes
        </Link>
        <Link
          href="/listas?ordem=popular"
          className={`rounded-full px-3 py-1 ${sort === 'popular' ? 'bg-violet-500/20 text-violet-100' : 'text-white/55'}`}
        >
          Populares
        </Link>
      </div>
      {!data?.items.length ? (
        <p className="mt-10 text-white/45">Nenhuma lista pública ainda.</p>
      ) : (
        <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {data.items.map(list => (
            <ListCard key={list.id} list={list} />
          ))}
        </div>
      )}
      {data && data.pages > 1 && (
        <nav className="mt-10 flex justify-center gap-3 text-sm" aria-label="Paginação">
          {n > 1 && (
            <Link
              href={`/listas?${new URLSearchParams({ ...(sort === 'popular' ? { ordem: 'popular' } : {}), page: String(n - 1) })}`}
            >
              ← Anterior
            </Link>
          )}
          <span className="text-white/45">
            Página {n} de {data.pages}
          </span>
          {n < data.pages && (
            <Link
              href={`/listas?${new URLSearchParams({ ...(sort === 'popular' ? { ordem: 'popular' } : {}), page: String(n + 1) })}`}
            >
              Próxima →
            </Link>
          )}
        </nav>
      )}
    </section>
  );
}
