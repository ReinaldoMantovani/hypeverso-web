import type { NextConfig } from 'next';

const isProd = process.env.NODE_ENV === 'production';

// Cabeçalhos de segurança aplicados a todas as páginas. Uma CSP estrita não é
// usada porque o Google AdSense injeta scripts/iframes de dezenas de domínios
// dinâmicos; mesmo assim bloqueamos clickjacking, sniffing e APIs sensíveis.
const securityHeaders = [
  { key: 'X-Frame-Options', value: 'SAMEORIGIN' },
  { key: 'X-Content-Type-Options', value: 'nosniff' },
  { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
  {
    key: 'Permissions-Policy',
    value: 'camera=(), microphone=(), geolocation=(), payment=(self "https://checkout.stripe.com"), browsing-topics=()',
  },
  // A CSP completa (com nonce) é definida em proxy.ts. Esta versão mínima cobre
  // rotas que não passam pelo proxy (arquivos, gateway /api).
  { key: 'Content-Security-Policy', value: "frame-ancestors 'self'; base-uri 'self'; object-src 'none'" },
  { key: 'Cross-Origin-Opener-Policy', value: 'same-origin-allow-popups' },
  ...(isProd ? [{ key: 'Strict-Transport-Security', value: 'max-age=63072000; includeSubDomains; preload' }] : []),
];

const nextConfig: NextConfig = {
  // A Hostinger também força "standalone"; mantemos aqui para builds locais/Docker iguais.
  output: 'standalone',
  poweredByHeader: false,
  transpilePackages: ['@/ui'],
  // O app usa <img> comum; o otimizador do Next não deve funcionar como proxy
  // aberto para qualquer host HTTPS (abuso de banda / SSRF de imagem).
  images: {
    remotePatterns: [
      { protocol: 'http', hostname: 'localhost' },
      { protocol: 'https', hostname: 'image.tmdb.org' },
      { protocol: 'https', hostname: 'images.igdb.com' },
      { protocol: 'https', hostname: 'upload.wikimedia.org' },
      { protocol: 'https', hostname: 's4.anilist.co' },
    ],
  },
  // A antiga página Premium virou a Hypeverso Shop.
  async redirects() {
    return [{ source: '/premium', destination: '/shop', permanent: true }];
  },
  async headers() {
    return [
      { source: '/:path*', headers: securityHeaders },
      {
        source: '/conta/:path*',
        headers: [
          { key: 'X-Robots-Tag', value: 'noindex, nofollow' },
          { key: 'Cache-Control', value: 'no-store' },
        ],
      },
    ];
  },
};
export default nextConfig;
