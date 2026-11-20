import Link from 'next/link';
import { PostCard } from '@/components/post-card';
import { breadcrumbJsonLd, safeJsonLd, siteUrl } from '@/lib/json-ld';

type Props = {
  kind: 'categoria' | 'tag';
  slug: string;
  name: string;
  description?: string | null;
  data: { items: any[]; total: number; page: number; pages: number } | null;
  sort: 'recent' | 'popular';
};

/** Página de categoria/tag renderizada no servidor (indexável, com paginação real). */
export function TaxonomyPage({ kind, slug, name, description, data, sort }: Props) {
  const base = `/${kind}/${slug}`;
  const page = data?.page || 1;
  const pages = data?.pages || 1;
  const href = (p: number, s = sort) => {
    const params = new URLSearchParams();
    if (p > 1) params.set('page', String(p));
    if (s !== 'recent') params.set('ordem', s);
    const qs = params.toString();
    return qs ? `${base}?${qs}` : base;
  };
  const jsonLd = [
    {
      '@context': 'https://schema.org',
      '@type': 'CollectionPage',
      name: kind === 'tag' ? `#${name}` : name,
      url: `${siteUrl()}${base}`,
      description: description || undefined,
      isPartOf: { '@id': `${siteUrl()}/#website` },
    },
    breadcrumbJsonLd([{ name: 'Início', path: '/' }, { name: 'Notícias', path: '/noticias' }, { name }]),
  ];
  return (
    <section className="mx-auto max-w-7xl px-4 py-12">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: safeJsonLd(jsonLd) }} />
      <nav aria-label="Trilha de navegação" className="text-sm text-white/45">
        <Link href="/" className="hover:text-white">
          Início
        </Link>
        <span className="mx-2">/</span>
        <Link href="/noticias" className="hover:text-white">
          Notícias
        </Link>
      </nav>
      <h1 className="mt-3 text-4xl font-black">{kind === 'tag' ? `#${name}` : name}</h1>
      {description && <p className="mt-3 max-w-3xl text-white/55">{description}</p>}
      <div className="mt-6 flex flex-wrap items-center gap-2 text-sm">
        <span className="text-white/40">{data?.total ?? 0} artigos ·</span>
        <Link
          href={href(1, 'recent')}
          aria-current={sort === 'recent' ? 'page' : undefined}
          className={`rounded-full px-3 py-1 ${sort === 'recent' ? 'bg-violet-500/20 text-violet-100' : 'text-white/55 hover:text-white'}`}
        >
          Mais recentes
        </Link>
        <Link
          href={href(1, 'popular')}
          aria-current={sort === 'popular' ? 'page' : undefined}
          className={`rounded-full px-3 py-1 ${sort === 'popular' ? 'bg-violet-500/20 text-violet-100' : 'text-white/55 hover:text-white'}`}
        >
          Mais lidos
        </Link>
      </div>
      {!data?.items?.length ? (
        <p className="mt-10 text-white/50">Ainda não há artigos aqui.</p>
      ) : (
        <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {data.items.map(post => (
            <PostCard key={post.id} post={post} />
          ))}
        </div>
      )}
      {pages > 1 && (
        <nav aria-label="Paginação" className="mt-10 flex items-center justify-center gap-3 text-sm">
          {page > 1 && (
            <Link
              rel="prev"
              href={href(page - 1)}
              className="rounded-xl border border-white/15 px-4 py-2 hover:bg-white/5"
            >
              ← Anterior
            </Link>
          )}
          <span className="text-white/45">
            Página {page} de {pages}
          </span>
          {page < pages && (
            <Link
              rel="next"
              href={href(page + 1)}
              className="rounded-xl border border-white/15 px-4 py-2 hover:bg-white/5"
            >
              Próxima →
            </Link>
          )}
        </nav>
      )}
    </section>
  );
}
