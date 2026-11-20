import { absolute, internalApi, urlset, xmlResponse, type SitemapUrl } from '@/lib/sitemap';
import { postPath } from '@/lib/content-locale';
import { siteUrl } from '@/lib/json-ld';

export const dynamic = 'force-dynamic';
type Data = {
  items: { slug: string; updatedAt: string; publishedAt: string; coverImageUrl?: string | null; locales?: string[] }[];
};

export async function GET(_req: Request, ctx: { params: Promise<{ page: string }> }) {
  const { page } = await ctx.params;
  const n = Math.max(1, Math.min(1000, Number.parseInt(page, 10) || 1));
  const site = siteUrl();
  const data = await internalApi<Data>(`/api/sitemap/posts?page=${n}`);
  const urls: SitemapUrl[] = [];
  for (const p of data?.items || []) {
    // Cada idioma é uma URL própria, e todas apontam umas para as outras (hreflang).
    const langs = ['pt-BR', ...(p.locales || [])];
    const alternates =
      langs.length > 1
        ? [
            ...langs.map(l => ({ hreflang: l, href: `${site}${postPath(p.slug, l)}` })),
            { hreflang: 'x-default', href: `${site}${postPath(p.slug)}` },
          ]
        : undefined;
    for (const l of langs)
      urls.push({
        loc: `${site}${postPath(p.slug, l)}`,
        lastmod: p.updatedAt || p.publishedAt,
        image: p.coverImageUrl ? absolute(p.coverImageUrl, site) : null,
        alternates,
      });
  }
  return xmlResponse(urlset(urls), 900);
}
