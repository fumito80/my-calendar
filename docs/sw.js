(()=>{"use strict";const e=["index.js","index.css"];self.addEventListener("install",(t=>{t.waitUntil(caches.open("google-calendar-3").then((t=>t.addAll(e))))})),self.addEventListener("fetch",(e=>{e.respondWith(caches.match(e.request).then((t=>t||fetch(e.request))))}))})();