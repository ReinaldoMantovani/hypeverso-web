import type { Metadata } from 'next';
import { cache } from 'react';
import Link from 'next/link';
import { notFound, redirect } from 'next/navigation';
import { serverApi } from '@/lib/api';
import { breadcrumbJsonLd, safeJsonLd, siteUrl } from '@/lib/json-ld';
import { ShareButton } from '@/components/lists/share-button';
import { ListViewTracker } from '@/components/lists/list-view-tracker';

const typeLabel: Record<string, string> = {
  MOVIE: 'Filme',
  SERIES: 'Série',
  ANIME: 'Anime',
  GAME: 'Game',
  MANGA: 'Mangá',
  COMIC: 'HQ',
};
type Params = { params: Promise<{ id: string; slug: string }> };
const load = cache((id: string) => serverApi<any>(`/api/lists/${encodeURIComponent(id)}`).catch(() => null));

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { id } = await params;
  const list = await load(id);
  if (!list) return {};
  const cover = list.items?.find((i: any) => i.catalogItem.coverUrl)?.catalogItem.coverUrl;
  return {
    title: `${list.title} — lista de ${list.user.name}`,
    description: list.description || `${list._count.items} itens escolhidos por ${list.user.name} no Hypeverso.`,
    alternates: { canonical: `/listas/${list.id}/${list.slug}` },
    openGraph: { type: 'article', title: list.title, images: cover ? [cover] : [] },
  };
}

export default async function ListPage({ params }: Params) {
  const { id, slug } = await params;
  // Listas privadas não são renderizadas no servidor (o SSR não carrega a sessão do dono).
  const list = await load(id);
  if (!list) notFound();
  if (slug !== list.slug) redirect(`/listas/${list.id}/${list.slug}`);
  const url = `${siteUrl()}/listas/${list.id}/${list.slug}`;
  const jsonLd = [
    {
      '@context': 'https://schema.org',
      '@type': 'ItemList',
      name: list.title,
      description: list.description || undefined,
      url,
      numberOfItems: list.items.length,
      itemListElement: list.items.map((item: any, i: number) => ({
        '@type': 'ListItem',
        position: i + 1,
        name: item.catalogItem.title,
        url: `${siteUrl()}/catalogo/${item.catalogItem.provider}/${item.catalogItem.mediaType}/${item.catalogItem.externalId}`,
      })),
    },
    breadcrumbJsonLd([{ name: 'Listas', path: '/listas' }, { name: list.title }]),
  ];
  return (
    <section className="mx-auto max-w-4xl px-4 py-12">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: safeJsonLd(jsonLd) }} />
      <ListViewTracker listId={list.id} />
      <Link href="/listas" className="text-sm text-white/45 hover:text-white">
        ← Listas da comunidade
      </Link>
      <h1 className="mt-3 text-4xl font-black">{list.title}</h1>
      <p className="mt-2 text-sm text-white/45">
        por{' '}
        <Link href={`/u/${list.user.username}`} className="text-white/75 hover:text-white">
          {list.user.name}
        </Link>{' '}
        · {list.items.length} itens · {list.viewCount} visualizações
      </p>
      {list.description && <p className="mt-4 whitespace-pre-line text-white/65">{list.description}</p>}
      <div className="mt-5">
        <ShareButton title={list.title} url={url} />
      </div>
      <ol className="mt-8 space-y-3">
        {list.items.map((item: any, i: number) => (
          <li key={item.id}>
            <Link
              href={`/catalogo/${item.catalogItem.provider}/${item.catalogItem.mediaType}/${item.catalogItem.externalId}`}
              className="flex gap-4 rounded-2xl border border-white/10 bg-white/[0.03] p-3 hover:border-violet-400/30"
            >
              <span className="w-8 shrink-0 pt-1 text-center text-2xl font-black text-white/25">{i + 1}</span>
              {item.catalogItem.coverUrl ? (
                <img
                  src={item.catalogItem.coverUrl}
                  alt=""
                  loading="lazy"
                  className="h-28 w-20 shrink-0 rounded-lg object-cover"
                />
              ) : (
                <div className="h-28 w-20 shrink-0 rounded-lg bg-white/5" />
              )}
              <div className="min-w-0">
                <div className="text-xs text-cyan-300">
                  {typeLabel[item.catalogItem.mediaType] || item.catalogItem.mediaType}
                  {item.catalogItem.releaseDate && ` · ${String(item.catalogItem.releaseDate).slice(0, 4)}`}
                </div>
                <h2 className="font-bold">{item.catalogItem.title}</h2>
                {item.note && <p className="mt-1 text-sm text-white/65">“{item.note}”</p>}
                {!item.note && item.catalogItem.description && (
                  <p className="mt-1 line-clamp-2 text-sm text-white/45">{item.catalogItem.description}</p>
                )}
              </div>
            </Link>
          </li>
        ))}
      </ol>
    </section>
  );
}
