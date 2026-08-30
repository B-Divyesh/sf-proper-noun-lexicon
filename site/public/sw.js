// Vite stamps this token with the immutable Git release identifier when it
// builds the deploy artifact. A changed worker URL body forces the browser to
// install the new shell instead of serving an older cache indefinitely.
const CACHE = 'pnl-shell-__PNL_RELEASE__';
const SHELL = ['/', '/demo', '/privacy/', '/terms/', '/404.html', '/lexical-landscape.webp', '/og-preview.webp', '/icon.svg', '/apple-touch-icon.png', '/manifest.webmanifest'];
self.addEventListener('install', event => event.waitUntil((async () => {
  const cache = await caches.open(CACHE);
  await cache.addAll(SHELL);
  const pages = await Promise.all(['/', '/privacy/', '/terms/', '/404.html'].map(path => fetch(path).then(response => response.text())));
  const assets = [...new Set(pages.flatMap(html => [...html.matchAll(/(?:src|href)="(\/assets\/[^\"]+)"/g)].map(match => match[1])))];
  await cache.addAll(assets);
  await self.skipWaiting();
})()));
self.addEventListener('activate', event => event.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(key => key !== CACHE).map(key => caches.delete(key)))).then(() => self.clients.claim())));
self.addEventListener('fetch', event => {
  if (event.request.method !== 'GET' || new URL(event.request.url).origin !== self.location.origin) return;
  event.respondWith(caches.match(event.request).then(cached => cached || fetch(event.request).then(response => {
    const copy = response.clone(); caches.open(CACHE).then(cache => cache.put(event.request, copy)); return response;
  }).catch(() => caches.match('/'))));
});
