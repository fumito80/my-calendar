export default null;
declare const self: ServiceWorkerGlobalScope;

const cacheName = 'google-calendar-3';

const urlsToCache = [
  'index.js',
  'index.css',
];

self.addEventListener('install', (e) => {
  e.waitUntil(caches.open(cacheName).then((cache) => cache.addAll(urlsToCache)));
});

self.addEventListener('fetch', (e) => {
  e.respondWith(caches.match(e.request).then((response) => response || fetch(e.request)));
});
