/* eslint-disable no-restricted-globals */
const CACHE_NAME = 'google-calendar-3';
const urlsToCache = [
  'index.js',
  'index.css',
];

self.addEventListener('install', (e) => {
  e.waitUntil(caches.open(CACHE_NAME).then((cache) => cache.addAll(urlsToCache)));
});

self.addEventListener('fetch', (e) => {
  e.respondWith(caches.match(e.request).then((response) => response || fetch(e.request)));
});
