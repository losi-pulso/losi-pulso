const CACHE='losi-pulso-gh-v3.1.1-monetizacao';
const PREFIX='losi-pulso-gh-';
const CORE=['./','./index.html','./styles.css','./sets.css','./offline.css','./background-player.css','./background-player.js','./offline.js','./mp3.js','./app.js','./sets.js','./config.js','./audio-engine.js','./monetizacao.html','./monetizacao.css','./monetizacao.js','./monetizacao-config.js','./direitos.html','./manifest.webmanifest','./icon-192.png','./icon-512.png','./favicon.svg'];
self.addEventListener('install',e=>{e.waitUntil(caches.open(CACHE).then(c=>c.addAll(CORE)));self.skipWaiting()});
self.addEventListener('activate',e=>{e.waitUntil(caches.keys().then(a=>Promise.all(a.filter(k=>k.startsWith(PREFIX)&&k!==CACHE).map(k=>caches.delete(k)))));self.clients.claim()});
self.addEventListener('fetch',e=>{const r=e.request;if(r.method!=='GET'||new URL(r.url).origin!==self.location.origin)return;
// Atualiza arquivos locais por rede para evitar versões antigas após novas publicações.
e.respondWith(fetch(r).then(v=>{if(v.ok&&(/\.(?:html|js|css|svg|png|webmanifest)$/.test(new URL(r.url).pathname))){const c=v.clone();caches.open(CACHE).then(k=>k.put(r,c))}return v}).catch(()=>caches.match(r)))});
