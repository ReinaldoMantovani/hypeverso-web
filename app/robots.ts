import type { MetadataRoute } from 'next';
export default function robots(): MetadataRoute.Robots {
  const site = (process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000').replace(/\/$/, '');
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: [
          '/admin/',
          '/api/',
          '/conta/',
          '/notificacoes',
          '/favoritos',
          '/historico',
          '/reset-password',
          '/verify-email',
        ],
      },
      // O robô do AdSense precisa ler as páginas para escolher anúncios relevantes.
      { userAgent: 'Mediapartners-Google', allow: '/' },
    ],
    sitemap: [`${site}/sitemap.xml`, `${site}/news-sitemap.xml`],
  };
}
