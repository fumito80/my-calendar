const CACHE_NAME="google-calendar-3",urlsToCache=["index.js","index.css"];self.addEventListener("install",(e=>{e.waitUntil(caches.open(CACHE_NAME).then((e=>e.addAll(urlsToCache))))})),self.addEventListener("fetch",(e=>{e.respondWith(caches.match(e.request).then((s=>s||fetch(e.request))))}));