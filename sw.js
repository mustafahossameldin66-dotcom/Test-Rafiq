const VERSION='rafiq-v86';
const SHELL=[
  './','./index.html','./app.css','./app.js','./ui-engine.js','./data.js','./deep-loader.js','./storage.js','./prayer.js','./content-manager.js','./hifz-engine.js','./manifest.webmanifest','./icon.svg','./icon-192.png','./icon-512.png'
];
self.addEventListener('install',e=>e.waitUntil(caches.open(VERSION).then(c=>c.addAll(SHELL)).then(()=>self.skipWaiting())));
self.addEventListener('activate',e=>e.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(k=>k!==VERSION&&!k.startsWith('rafiq-content-')).map(k=>caches.delete(k)))).then(()=>self.clients.claim())));
self.addEventListener('fetch',e=>{
  const u=new URL(e.request.url);if(u.origin!==location.origin)return;
  e.respondWith(caches.match(e.request).then(cached=>cached||fetch(e.request).then(r=>{if(e.request.method==='GET'&&r.ok){const copy=r.clone();caches.open(VERSION).then(c=>c.put(e.request,copy)).catch(()=>{})}return r}).catch(()=>caches.match('./index.html'))));
});
