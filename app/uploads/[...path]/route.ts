import type { NextRequest } from 'next/server';
import { backendBase } from '@/lib/backend';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';


async function forwardAsset(request: NextRequest, context: { params: Promise<{ path: string[] }> }) {
  const { path } = await context.params;
  const segments = path || [];
  if (
    !segments.length ||
    segments.some(
      segment => !segment || segment === '.' || segment === '..' || segment.includes('\\') || segment.includes('/'),
    )
  ) {
    return new Response('Not found', { status: 404 });
  }
  const safePath = segments.map(segment => encodeURIComponent(segment)).join('/');

  const headers = new Headers();
  const range = request.headers.get('range');
  if (range) headers.set('range', range);
  const ifNoneMatch = request.headers.get('if-none-match');
  if (ifNoneMatch) headers.set('if-none-match', ifNoneMatch);
  const ifModifiedSince = request.headers.get('if-modified-since');
  if (ifModifiedSince) headers.set('if-modified-since', ifModifiedSince);
  headers.set('accept-encoding', 'identity');

  try {
    const upstream = await fetch(`${backendBase()}/uploads/${safePath}`, {
      method: request.method,
      headers,
      redirect: 'manual',
      cache: 'no-store',
    });

    const responseHeaders = new Headers();
    for (const key of ['content-type', 'content-length', 'etag', 'last-modified', 'accept-ranges', 'content-range']) {
      const value = upstream.headers.get(key);
      if (value) responseHeaders.set(key, value);
    }
    responseHeaders.set('cache-control', upstream.ok ? 'public, max-age=31536000, immutable' : 'no-store');
    responseHeaders.set('x-nexverse-asset-gateway', 'v12');
    // Arquivos enviados por usuários nunca podem ser interpretados como página/script.
    responseHeaders.set('x-content-type-options', 'nosniff');
    responseHeaders.set(
      'content-security-policy',
      "default-src 'none'; img-src 'self'; style-src 'unsafe-inline'; sandbox",
    );
    const type = responseHeaders.get('content-type') || '';
    if (type && !/^image\/(jpeg|png|webp|gif|avif|bmp)/i.test(type))
      responseHeaders.set('content-disposition', 'attachment');

    const body = request.method === 'HEAD' || upstream.status === 304 ? null : await upstream.arrayBuffer();
    return new Response(body, { status: upstream.status, headers: responseHeaders });
  } catch {
    return new Response('Asset temporarily unavailable', {
      status: 502,
      headers: { 'cache-control': 'no-store', 'x-nexverse-asset-gateway': 'v12' },
    });
  }
}

export const GET = forwardAsset;
export const HEAD = forwardAsset;
