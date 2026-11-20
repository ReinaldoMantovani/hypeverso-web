import { absolute, internalApi, urlset, xmlResponse } from '@/lib/sitemap';
import { siteUrl } from '@/lib/json-ld';

export const dynamic = 'force-dynamic';
type Data = { items: { slug: string; updatedAt: string; publishedAt: string; coverImageUrl?: string | null }[] };

export async function GET(_req: Request, ctx: { params: Promise<{ page: string }> }) {
  const { page } = await ctx.params;
  const n = Math.max(1, Math.min(1000, Number.parseInt(page, 10) || 1));
  const site = siteUrl();
  const data = await internalApi<Data>(`/api/sitemap/posts?page=${n}`);
  return xmlResponse(
    urlset(
      (data?.items || []).map(p => ({
        loc: `${site}/post/${p.slug}`,
        lastmod: p.updatedAt || p.publishedAt,
        image: p.coverImageUrl ? absolute(p.coverImageUrl, site) : null,
      })),
    ),
    900,
  );
}
