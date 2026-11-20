import type { Metadata } from 'next';
import { cache } from 'react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Clock } from 'lucide-react';
import { serverApi } from '@/lib/api';
import { formatDate } from '@/lib/utils';
import { ArticleActions } from '@/components/article-actions';
import { Comments } from '@/components/comments';
import { PremiumContent } from '@/components/premium-content';
import { normalizeManagedAssetHtml } from '@/lib/asset-url';
import { AdSlot } from '@/components/adsense';
import { SmartImage } from '@/components/smart-image';
import { ReadingTools } from '@/components/article/reading-tools';
import { TableOfContents } from '@/components/article/table-of-contents';
import { ViewTracker } from '@/components/article/view-tracker';
import { readingTimeMinutes, withHeadingIds } from '@/lib/article';
import { breadcrumbJsonLd, safeJsonLd, siteUrl } from '@/lib/json-ld';
import { productKeys, splitPostHtml, stripLeftoverCodes } from '@/lib/shop-embeds';
import { InlineShopProduct } from '@/components/shop/inline-product';
import type { ShopProduct } from '@/components/shop/product-card';

// cache(): generateMetadata e a página compartilham UMA chamada à API por requisição.
const load = cache(async (slug: string) => {
  try {
    return await serverApi<any>(`/api/posts/${encodeURIComponent(slug)}`);
  } catch {
    return null;
  }
});

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const p = await load(slug);
  if (!p) return {};
  const canonical = `${siteUrl()}/post/${p.slug}`;
  const title = p.seoTitle || p.title;
  const description = p.seoDescription || p.description;
  const tags = (p.tags || []).map((x: any) => x.tag?.name).filter(Boolean);
  return {
    title,
    description,
    keywords: tags,
    alternates: { canonical },
    robots: { 'max-image-preview': 'large' },
    openGraph: {
      type: 'article',
      url: canonical,
      title,
      description,
      siteName: 'Hypeverso',
      publishedTime: p.publishedAt || p.createdAt,
      modifiedTime: p.updatedAt,
      authors: [p.author.name],
      section: p.category?.name,
      tags,
      images: p.coverImageUrl ? [{ url: p.coverImageUrl, alt: p.title }] : [],
    },
    twitter: { card: 'summary_large_image', title, description, images: p.coverImageUrl ? [p.coverImageUrl] : [] },
  };
}

export default async function PostPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const p = await load(slug);
  if (!p) notFound();
  const site = siteUrl();
  const canonical = `${site}/post/${p.slug}`;
  const tags: { name: string; slug: string }[] = (p.tags || []).map((x: any) => x.tag).filter(Boolean);
  const { html, toc } = p.isPremium ? { html: '', toc: [] } : withHeadingIds(normalizeManagedAssetHtml(p.content));
  // Produtos da Shop inseridos no artigo pelo CMS ([[produto:slug]]).
  const keys = productKeys(html);
  const embedded: ShopProduct[] = keys.length
    ? ((
        await serverApi<{ items: ShopProduct[] }>(`/api/shop/products?ids=${encodeURIComponent(keys.join(','))}`).catch(
          () => null,
        )
      )?.items ?? [])
    : [];
  const minutes = p.isPremium ? null : readingTimeMinutes(p.content || '');
  const jsonLd = [
    {
      '@context': 'https://schema.org',
      '@type': 'NewsArticle',
      headline: p.title,
      description: p.seoDescription || p.description,
      datePublished: p.publishedAt || p.createdAt,
      dateModified: p.updatedAt,
      mainEntityOfPage: { '@type': 'WebPage', '@id': canonical },
      author: { '@type': 'Person', name: p.author.name, url: `${site}/u/${p.author.username}` },
      publisher: { '@id': `${site}/#organization` },
      image: p.coverImageUrl ? [p.coverImageUrl] : undefined,
      keywords: tags.map(t => t.name).join(', '),
      articleSection: p.category.name,
      isAccessibleForFree: !p.isPremium,
      ...(p.isPremium
        ? { hasPart: { '@type': 'WebPageElement', isAccessibleForFree: false, cssSelector: '.premium-content' } }
        : {}),
    },
    breadcrumbJsonLd([
      { name: 'Início', path: '/' },
      { name: p.category.name, path: `/categoria/${p.category.slug}` },
      { name: p.title },
    ]),
  ];
  return (
    <article id="artigo" className="reading-article mx-auto max-w-4xl px-4 py-12">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: safeJsonLd(jsonLd) }} />
      <ViewTracker postId={p.id} />
      <nav aria-label="Trilha de navegação" className="reading-hide mb-6 text-sm text-white/45">
        <Link href="/" className="hover:text-white">
          Início
        </Link>
        <span className="mx-2">/</span>
        <Link href={`/categoria/${p.category.slug}`} className="text-cyan-300 hover:underline">
          {p.category.name}
        </Link>
      </nav>
      <h1 className="text-4xl font-black leading-tight sm:text-6xl">{p.title}</h1>
      <p className="mt-5 text-xl leading-8 text-white/55">{p.description}</p>
      <div className="mt-6 flex flex-wrap items-center gap-3 text-sm text-white/45">
        <span>
          Por{' '}
          <Link href={`/u/${p.author.username}`} className="font-bold text-white/75 hover:text-white">
            {p.author.name}
          </Link>
        </span>
        <span>•</span>
        <time dateTime={p.publishedAt || p.createdAt}>{formatDate(p.publishedAt || p.createdAt)}</time>
        {minutes && (
          <>
            <span>•</span>
            <span className="flex items-center gap-1">
              <Clock size={14} /> {minutes} min de leitura
            </span>
          </>
        )}
      </div>
      {p.coverImageUrl && (
        <>
          <div className="relative mt-9 aspect-video w-full overflow-hidden rounded-3xl bg-white/5">
            <SmartImage
              src={p.coverImageUrl}
              alt={p.title}
              priority
              sizes="(max-width: 896px) 100vw, 896px"
              className="object-cover"
            />
          </div>
          {p.aiDraft?.coverImageCredit && (
            <div className="mt-2 text-xs text-white/35">
              Imagem: {p.aiDraft.coverImageCredit}
              {p.aiDraft.coverImageSourceUrl && (
                <>
                  {' '}
                  ·{' '}
                  <a
                    className="text-cyan-300"
                    href={p.aiDraft.coverImageSourceUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Wikimedia Commons
                  </a>
                </>
              )}
            </div>
          )}
        </>
      )}
      <div className="reading-hide">
        <ArticleActions postId={p.id} />
      </div>
      <ReadingTools targetId="artigo" />
      <TableOfContents items={toc} />
      {p.isPremium ? (
        <div className="premium-content">
          <PremiumContent slug={slug} />
        </div>
      ) : embedded.length ? (
        <div className="prose-nv mt-10 text-lg">
          {splitPostHtml(html).map((seg, i) =>
            seg.type === 'html' ? (
              <div key={i} dangerouslySetInnerHTML={{ __html: stripLeftoverCodes(seg.html) }} />
            ) : embedded.find(p => p.slug === seg.key || p.id === seg.key) ? (
              <InlineShopProduct key={i} product={embedded.find(p => p.slug === seg.key || p.id === seg.key)!} />
            ) : null,
          )}
        </div>
      ) : (
        <div className="prose-nv mt-10 text-lg" dangerouslySetInnerHTML={{ __html: stripLeftoverCodes(html) }} />
      )}
      {tags.length > 0 && (
        <ul className="reading-hide mt-10 flex flex-wrap gap-2" aria-label="Tags">
          {tags.map(tag => (
            <li key={tag.slug}>
              <Link
                href={`/tag/${tag.slug}`}
                className="rounded-full border border-white/10 px-3 py-1 text-xs text-white/60 hover:text-white"
              >
                #{tag.name}
              </Link>
            </li>
          ))}
        </ul>
      )}
      <AdSlot slot={process.env.NEXT_PUBLIC_ADSENSE_SLOT_ARTICLE} />
      <div className="reading-hide">
        <Comments postId={p.id} />
      </div>
    </article>
  );
}
