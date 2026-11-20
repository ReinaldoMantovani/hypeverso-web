import { NextResponse, type NextRequest } from 'next/server';

/**
 * CSP estrita baseada em nonce + 'strict-dynamic' (recomendação do Google, compatível
 * com AdSense, Turnstile e o próprio Next.js): só scripts com o nonce desta resposta
 * — e os que eles carregarem — executam. Um XSS injetado no HTML não roda.
 * 'https:' e 'unsafe-inline' são ignorados por navegadores modernos quando há nonce
 * e 'strict-dynamic'; ficam apenas como fallback para navegadores muito antigos.
 *
 * Desative com CSP_STRICT=false (as páginas voltam a poder ser estáticas).
 */
export function proxy(request: NextRequest) {
  if (process.env.CSP_STRICT === 'false') return NextResponse.next();
  const nonce = Buffer.from(crypto.randomUUID()).toString('base64');
  const isDev = process.env.NODE_ENV === 'development';
  const csp = [
    `script-src 'self' 'nonce-${nonce}' 'strict-dynamic' https: 'unsafe-inline'${isDev ? " 'unsafe-eval'" : ''}`,
    "object-src 'none'",
    "base-uri 'self'",
    "frame-ancestors 'self'",
    "form-action 'self' https://checkout.stripe.com",
    "worker-src 'self'",
    "manifest-src 'self'",
    ...(isDev ? [] : ['upgrade-insecure-requests']),
  ].join('; ');

  const requestHeaders = new Headers(request.headers);
  requestHeaders.set('x-nonce', nonce);
  requestHeaders.set('Content-Security-Policy', csp);
  const response = NextResponse.next({ request: { headers: requestHeaders } });
  response.headers.set('Content-Security-Policy', csp);
  return response;
}

export const config = {
  matcher: [
    {
      source:
        '/((?!api/|uploads/|_next/static|_next/image|favicon.ico|icons/|logo|sw.js|manifest.webmanifest|robots.txt|sitemap|news-sitemap.xml|ads.txt|offline.html).*)',
      missing: [
        { type: 'header', key: 'next-router-prefetch' },
        { type: 'header', key: 'purpose', value: 'prefetch' },
      ],
    },
  ],
};
