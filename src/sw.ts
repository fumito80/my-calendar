export default null;
declare const self: ServiceWorkerGlobalScope;

const cacheName = 'g-cal3-v1.0.0';

const urlsToCache = [
  'index.html',
  'index.css',
  'index.js',
  'sw.js',
  'calendar_192.png',
  'calendar_512.png',
];

self.addEventListener('install', (e) => {
  e.waitUntil(caches.open(cacheName).then((cache) => cache.addAll(urlsToCache)));
});

self.addEventListener('fetch', (e) => {
  e.respondWith(caches.match(e.request).then((response) => response || fetch(e.request)));
});
