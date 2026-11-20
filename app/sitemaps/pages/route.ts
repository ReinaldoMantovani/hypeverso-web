import { internalApi, urlset, xmlResponse } from '@/lib/sitemap';
import { siteUrl } from '@/lib/json-ld';

export const dynamic = 'force-dynamic';
const STATIC = [
  '/',
  '/noticias',
  '/comunidade',
  '/catalogo',
  '/calendario',
  '/listas',
  '/ranking',
  '/shop',
  '/newsletter',
  '/sobre',
  '/contato',
  '/politica-de-privacidade',
  '/termos-de-uso',
  '/politica-de-cookies',
];

export async function GET() {
  const site = siteUrl();
  const [tax, lists, shop] = await Promise.all([
    internalApi<{ categories: { slug: string }[]; tags: { slug: string }[] }>('/api/sitemap/taxonomies'),
    internalApi<{ items: { id: string; slug: string; updatedAt: string }[] }>('/api/sitemap/lists'),
    internalApi<{ collections?: { slug: string }[] }>('/api/shop/products'),
  ]);
  const now = new Date();
  return xmlResponse(
    urlset([
      ...STATIC.map(p => ({ loc: `${site}${p}`, lastmod: now })),
      ...(tax?.categories || []).map(c => ({ loc: `${site}/categoria/${c.slug}`, lastmod: now })),
      ...(tax?.tags || []).map(t => ({ loc: `${site}/tag/${t.slug}` })),
      ...(lists?.items || []).map(l => ({ loc: `${site}/listas/${l.id}/${l.slug}`, lastmod: l.updatedAt })),
      ...(shop?.collections || []).map(c => ({ loc: `${site}/shop/c/${c.slug}`, lastmod: now })),
    ]),
    1800,
  );
}
