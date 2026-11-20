import { internalApi, xmlEscape, xmlResponse } from '@/lib/sitemap';
import { siteUrl } from '@/lib/json-ld';

// Sitemap do Google Notícias: artigos das últimas 48 horas.
export const dynamic = 'force-dynamic';
type Data = { items: { slug: string; title: string; publishedAt: string; tags: { tag: { name: string } }[] }[] };

export async function GET() {
  const site = siteUrl();
  const data = await internalApi<Data>('/api/sitemap/news', 120);
  const urls = (data?.items || [])
    .map(
      p =>
        `<url><loc>${xmlEscape(`${site}/post/${p.slug}`)}</loc><news:news><news:publication><news:name>Hypeverso</news:name><news:language>pt</news:language></news:publication><news:publication_date>${new Date(p.publishedAt).toISOString()}</news:publication_date><news:title>${xmlEscape(p.title)}</news:title>${
          p.tags?.length
            ? `<news:keywords>${xmlEscape(
                p.tags
                  .map(t => t.tag.name)
                  .slice(0, 10)
                  .join(', '),
              )}</news:keywords>`
            : ''
        }</news:news></url>`,
    )
    .join('');
  return xmlResponse(
    `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:news="http://www.google.com/schemas/sitemap-news/0.9">${urls}</urlset>`,
    300,
  );
}
