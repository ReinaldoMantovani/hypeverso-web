import { internalApi, xmlEscape, xmlResponse } from '@/lib/sitemap';
import { siteUrl } from '@/lib/json-ld';

// Sitemap index: aponta para os sitemaps paginados de artigos, páginas/taxonomias e Google Notícias.
export const dynamic = 'force-dynamic';
export async function GET() {
  const site = siteUrl();
  const meta = await internalApi<{ pages: number }>('/api/sitemap/posts?page=1');
  const pages = Math.max(1, meta?.pages || 1);
  const now = new Date().toISOString();
  const entries = [
    `${site}/sitemaps/pages`,
    ...Array.from({ length: pages }, (_, i) => `${site}/sitemaps/posts/${i + 1}`),
    `${site}/news-sitemap.xml`,
  ];
  return xmlResponse(
    `<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${entries
      .map(loc => `<sitemap><loc>${xmlEscape(loc)}</loc><lastmod>${now}</lastmod></sitemap>`)
      .join('')}</sitemapindex>`,
    600,
  );
}
