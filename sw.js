const CACHE_NAME='biology-study-app-shared-viewer-v1';
self.addEventListener('install',event=>event.waitUntil(caches.open(CACHE_NAME).then(c=>c.addAll(['./index.html','./open.html'])).then(()=>self.skipWaiting())));
self.addEventListener('activate',event=>event.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(k=>k.startsWith('biology-study-app-')&&k!==CACHE_NAME).map(k=>caches.delete(k)))).then(()=>self.clients.claim())));
self.addEventListener('fetch',event=>{
 const req=event.request,url=new URL(req.url);
 if(req.method!=='GET'||url.origin!==self.location.origin||url.pathname.endsWith('/teacher.html'))return;
 const home=url.pathname.endsWith('/')||url.pathname.endsWith('/index.html'),viewer=url.pathname.endsWith('/open.html');
 if(req.mode==='navigate'||home||viewer||url.pathname.endsWith('.html')){
  const key=home?'./index.html':viewer?'./open.html':req;
  event.respondWith(fetch(req).then(async r=>{if(r.ok){const c=await caches.open(CACHE_NAME);await c.put(key,r.clone())}return r}).catch(async()=>{
   const c=await caches.open(CACHE_NAME),saved=await c.match(key);if(saved)return saved;
   return new Response('<meta charset="utf-8"><p>通信できません。接続してから再度開いてください。</p>',{status:503,headers:{'Content-Type':'text/html;charset=utf-8'}});
  }));return;
 }
 event.respondWith(caches.match(req).then(cached=>cached||fetch(req)));
});
