/* update67: عامل خدمة بسيط لتثبيت المنصة (PWA) — دون تخزين مؤقت للمحتوى.
   - الصفحات (HTML): من الشبكة دائماً؛ صفحة «دون اتصال» فقط عند انقطاع الشبكة.
   - JS/CSS/الصور وغيرها: لا يتدخل (المتصفح والشبكة كالعادة، مع ?v= كما هي) — لا نسخة قديمة من auth.js أبداً.
   - طلبات Apps Script (script.google.com) ومواقع أخرى: لا يتدخل أبداً. */
var C='spss-pwa-v4',OFF='offline.html';
self.addEventListener('install',function(e){e.waitUntil(caches.open(C).then(function(c){return c.addAll([OFF,'icons/icon-192.png']);}).then(function(){return self.skipWaiting();}));});
self.addEventListener('activate',function(e){e.waitUntil(caches.keys().then(function(ks){return Promise.all(ks.filter(function(k){return k.indexOf('spss-pwa-')===0&&k!==C;}).map(function(k){return caches.delete(k);}));}).then(function(){return self.clients.claim();}));});
self.addEventListener('fetch',function(e){var r=e.request;
 if(r.method!=='GET'||r.mode!=='navigate')return;
 var u=new URL(r.url);if(u.origin!==self.location.origin||u.pathname.indexOf(new URL(self.registration.scope).pathname)!==0)return;
 e.respondWith(fetch(r).catch(function(){return caches.match(OFF,{cacheName:C}).then(function(x){return x||new Response('دون اتصال',{status:503,headers:{'Content-Type':'text/plain; charset=utf-8'}});});}));});
