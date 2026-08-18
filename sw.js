const CACHE_NAME = 'rafiq-v81-shell-v1';
const CORE = [
  './', './index.html', './app.css', './storage.js', './prayer.js', './app.js', './data-loader.js',
  './core-content.json', './content-meta.json', './manifest.webmanifest', './icon.svg', './icon-192.png', './icon-512.png'
];
self.addEventListener('install', event => {
  event.waitUntil(caches.open(CACHE_NAME).then(cache => cache.addAll(CORE)).then(() => self.skipWaiting()));
});
self.addEventListener('activate', event => {
  event.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k)))).then(() => self.clients.claim()));
});
self.addEventListener('fetch', event => {
  if (event.request.method !== 'GET') return;
  event.respondWith(
    caches.match(event.request).then(cached => cached || fetch(event.request).then(response => {
      const url = new URL(event.request.url);
      if (response.ok && url.origin === location.origin) {
        const copy = response.clone();
        caches.open(CACHE_NAME).then(cache => cache.put(event.request, copy)).catch(() => {});
      }
      return response;
    }).catch(() => cached))
  );
});
