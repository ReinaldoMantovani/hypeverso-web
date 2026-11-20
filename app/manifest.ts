import type { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    id: '/',
    name: 'Hypeverso — Universo Geek',
    short_name: 'Hypeverso',
    description: 'Notícias, catálogo e comunidade sobre cinema, séries, games, animes, mangás e HQs.',
    start_url: '/?source=pwa',
    scope: '/',
    display: 'standalone',
    background_color: '#07050d',
    theme_color: '#07050d',
    lang: 'pt-BR',
    categories: ['news', 'entertainment', 'games'],
    icons: [
      { src: '/icons/icon-192.png', sizes: '192x192', type: 'image/png', purpose: 'any' },
      { src: '/icons/icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'any' },
      { src: '/icons/maskable-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
    ],
    shortcuts: [
      { name: 'Notícias', url: '/noticias', icons: [{ src: '/icons/icon-192.png', sizes: '192x192' }] },
      { name: 'Favoritos (offline)', url: '/favoritos', icons: [{ src: '/icons/icon-192.png', sizes: '192x192' }] },
      { name: 'Calendário', url: '/calendario', icons: [{ src: '/icons/icon-192.png', sizes: '192x192' }] },
    ],
  };
}
