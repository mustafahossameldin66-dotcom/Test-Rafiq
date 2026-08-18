const CACHE='rafiq-v79-shell-v1';
const CORE=['./','./index.html','./assets/css/app.css','./assets/js/storage.js','./assets/js/prayer.js','./assets/js/data-loader.js','./assets/js/app.js','./manifest.webmanifest','./icon.svg','./icon-192.png','./icon-512.png'];
self.addEventListener('install',e=>e.waitUntil(caches.open(CACHE).then(c=>c.addAll(CORE)).then(()=>self.skipWaiting())));
self.addEventListener('activate',e=>e.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(k=>k!==CACHE).map(k=>caches.delete(k)))).then(()=>self.clients.claim())));
self.addEventListener('fetch',e=>{if(e.request.method!=='GET')return;e.respondWith(caches.match(e.request).then(c=>c||fetch(e.request).then(r=>{const u=new URL(e.request.url);if(r.ok&&u.origin===location.origin){const copy=r.clone();caches.open(CACHE).then(x=>x.put(e.request,copy)).catch(()=>{})}return r}).catch(()=>c)));});
