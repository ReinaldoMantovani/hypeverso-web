/* Hypeverso service worker: PWA instalável, leitura offline dos favoritos e Web Push. */
const VERSION = 'hv-v19-1';
const STATIC_CACHE = `${VERSION}-static`;
const PAGE_CACHE = `${VERSION}-pages`;
const OFFLINE_CACHE = 'hv-offline-articles'; // persiste entre versões: favoritos salvos
const OFFLINE_URL = '/offline.html';
const PRECACHE = [OFFLINE_URL, '/icons/icon-192.png', '/logo.svg'];

self.addEventListener('install', event => {
  event.waitUntil(
    caches
      .open(STATIC_CACHE)
      .then(cache => cache.addAll(PRECACHE))
      .then(() => self.skipWaiting()),
  );
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches
      .keys()
      .then(keys =>
        Promise.all(keys.filter(k => !k.startsWith(VERSION) && k !== OFFLINE_CACHE).map(k => caches.delete(k))),
      )
      .then(() => self.clients.claim()),
  );
});

function isStaticAsset(url) {
  return (
    url.pathname.startsWith('/_next/static/') ||
    url.pathname.startsWith('/icons/') ||
    /\.(?:woff2?|svg|png|webp|avif|jpg|jpeg|gif|ico)$/.test(url.pathname)
  );
}

self.addEventListener('fetch', event => {
  const req = event.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);
  if (url.origin !== self.location.origin) return;
  // Nunca cachear API, admin, conta ou anúncios: dados pessoais e sempre frescos.
  if (url.pathname.startsWith('/api/') || url.pathname.startsWith('/admin') || url.pathname.startsWith('/conta'))
    return;

  if (isStaticAsset(url)) {
    event.respondWith(
      caches.match(req).then(
        hit =>
          hit ||
          fetch(req).then(res => {
            if (res.ok) {
              const copy = res.clone();
              caches.open(STATIC_CACHE).then(c => c.put(req, copy));
            }
            return res;
          }),
      ),
    );
    return;
  }

  if (req.mode === 'navigate') {
    // Rede primeiro; offline cai para o artigo salvo, para a última versão vista ou para a página offline.
    event.respondWith(
      fetch(req)
        .then(res => {
          if (res.ok && url.pathname.startsWith('/post/')) {
            const copy = res.clone();
            caches.open(PAGE_CACHE).then(c => c.put(req, copy));
          }
          return res;
        })
        .catch(async () => {
          const saved =
            (await caches.open(OFFLINE_CACHE).then(c => c.match(url.pathname))) || (await caches.match(req));
          return saved || (await caches.match(OFFLINE_URL));
        }),
    );
  }
});

// Mensagens da página: salvar/remover artigos para leitura offline.
self.addEventListener('message', event => {
  const data = event.data || {};
  if (data.type === 'SAVE_OFFLINE' && Array.isArray(data.urls)) {
    event.waitUntil(
      caches.open(OFFLINE_CACHE).then(async cache => {
        let saved = 0;
        for (const path of data.urls.slice(0, 100)) {
          if (typeof path !== 'string' || !path.startsWith('/post/')) continue;
          try {
            const res = await fetch(path, { credentials: 'same-origin' });
            if (res.ok) {
              await cache.put(path, res);
              saved++;
            }
          } catch (_e) {}
        }
        event.source && event.source.postMessage({ type: 'OFFLINE_SAVED', saved });
      }),
    );
  }
  if (data.type === 'LIST_OFFLINE') {
    event.waitUntil(
      caches.open(OFFLINE_CACHE).then(async cache => {
        const keys = await cache.keys();
        event.source &&
          event.source.postMessage({ type: 'OFFLINE_LIST', urls: keys.map(k => new URL(k.url).pathname) });
      }),
    );
  }
  if (data.type === 'CLEAR_OFFLINE') event.waitUntil(caches.delete(OFFLINE_CACHE));
});

// Web Push
self.addEventListener('push', event => {
  let payload = {};
  try {
    payload = event.data ? event.data.json() : {};
  } catch (_e) {
    payload = { title: 'Hypeverso', body: event.data ? event.data.text() : '' };
  }
  const title = payload.title || 'Hypeverso';
  event.waitUntil(
    self.registration.showNotification(title, {
      body: payload.body || '',
      icon: '/icons/icon-192.png',
      badge: '/icons/icon-192.png',
      image: payload.image || undefined,
      tag: payload.tag || undefined,
      data: { url: typeof payload.url === 'string' && payload.url.startsWith('/') ? payload.url : '/' },
    }),
  );
});

self.addEventListener('notificationclick', event => {
  event.notification.close();
  const target = (event.notification.data && event.notification.data.url) || '/';
  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then(list => {
      for (const client of list) {
        if (new URL(client.url).pathname === target && 'focus' in client) return client.focus();
      }
      return self.clients.openWindow(target);
    }),
  );
});
