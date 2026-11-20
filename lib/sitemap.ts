import { backendBase, gatewayHeaders } from './backend';
// Geração de XML de sitemap (sem dependências).
export const xmlEscape = (s: string) =>
  s.replace(/[<>&'"]/g, c => ({ '<': '&lt;', '>': '&gt;', '&': '&amp;', "'": '&apos;', '"': '&quot;' })[c]!);

export function xmlResponse(body: string, maxAge = 600) {
  return new Response(`<?xml version="1.0" encoding="UTF-8"?>\n${body}`, {
    headers: {
      'content-type': 'application/xml; charset=utf-8',
      'cache-control': `public, max-age=${maxAge}, stale-while-revalidate=${maxAge * 6}`,
    },
  });
}

export function urlset(urls: { loc: string; lastmod?: string | Date | null; image?: string | null }[]) {
  const items = urls
    .map(u => {
      const lastmod = u.lastmod ? `<lastmod>${new Date(u.lastmod).toISOString()}</lastmod>` : '';
      const image = u.image ? `<image:image><image:loc>${xmlEscape(u.image)}</image:loc></image:image>` : '';
      return `<url><loc>${xmlEscape(u.loc)}</loc>${lastmod}${image}</url>`;
    })
    .join('');
  return `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">${items}</urlset>`;
}

export async function internalApi<T>(path: string, revalidate = 300): Promise<T | null> {
  try {
    const res = await fetch(`${backendBase()}${path}`, {
      headers: { Accept: 'application/json', ...gatewayHeaders() },
      next: { revalidate },
    });
    if (!res.ok) return null;
    return (await res.json()) as T;
  } catch {
    return null;
  }
}

export const absolute = (path: string, site: string) => (/^https?:\/\//.test(path) ? path : `${site}${path}`);
