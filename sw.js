/* Minimal PWA Service Worker for Bento Glass Navigation */

const CACHE_NAME = 'bento-nav-v20261125-3';
const APP_SHELL_ASSETS = [
  './',
  './index.html',
  './manifest.json',
  './assets/css/tailwind.min.css?v=20261125-3',
  './assets/css/style.css?v=20261125-3',
  './assets/js/crypto-vault.js?v=20261125-3',
  './assets/js/app.js?v=20261125-3',
  './assets/images/favicon.jpg',
  './assets/images/icon-192.png',
  './assets/images/icon-512.png'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(APP_SHELL_ASSETS))
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys
          .filter((key) => key.startsWith('bento-nav-') && key !== CACHE_NAME)
          .map((key) => caches.delete(key))
      )
    ).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  const { request } = event;
  if (request.method !== 'GET') return;

  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return;

  const isDataOrNavigation =
    request.mode === 'navigate' ||
    url.pathname.endsWith('/links.json') ||
    url.pathname.endsWith('/index.html');

  if (isDataOrNavigation) {
    // Network-first so bookmark updates appear immediately while keeping offline fallback
    event.respondWith(
      fetch(request)
        .then((response) => {
          if (response && response.ok) {
            const copy = response.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(request, copy));
          }
          return response;
        })
        .catch(() => caches.match(request).then((cached) => cached || caches.match('./index.html')))
    );
    return;
  }

  // Stale-while-revalidate for local static assets
  event.respondWith(
    caches.match(request).then((cached) => {
      const networkFetch = fetch(request)
        .then((response) => {
          if (response && response.ok) {
            const copy = response.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(request, copy));
          }
          return response;
        })
        .catch(() => cached);

      return cached || networkFetch;
    })
  );
});
