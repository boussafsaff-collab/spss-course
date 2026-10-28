/* update67: عامل خدمة بسيط لتثبيت المنصة (PWA) — دون تخزين مؤقت للمحتوى.
   - الصفحات (HTML): من الشبكة دائماً؛ صفحة «دون اتصال» فقط عند انقطاع الشبكة؛ وصفحة «من نحن» (about.html) تُحفظ وتُعرض كما هي دون اتصال.
   - JS/CSS/الصور وغيرها: لا يتدخل (المتصفح والشبكة كالعادة، مع ?v= كما هي) — لا نسخة قديمة من auth.js أبداً.
   - update69: شارة أيقونة التطبيق (عدد التنبيهات غير المقروءة) عبر رسالة من الصفحة، حيث يدعمها النظام.
   - update70: إشعارات الهاتف (Web Push عبر Firebase Cloud Messaging، رسائل data فقط): يعرض الإشعار، ويفتح رابطه عند النقر،
     ويُعلم الصفحة المفتوحة (شريط داخل المنصة + تحديث الجرس). لا كود Firebase داخل هذا الملف.
   - طلبات Apps Script (script.google.com) ومواقع أخرى: لا يتدخل أبداً. */
var C='spss-pwa-v11',OFF='offline.html',ABOUT='about.html';
self.addEventListener('install',function(e){e.waitUntil(caches.open(C).then(function(c){return c.addAll([OFF,ABOUT,'icons/icon-192.png','icons/logo-128.png?v=3','icons/badge-96.png']);}).then(function(){return self.skipWaiting();}));});
self.addEventListener('activate',function(e){e.waitUntil(caches.keys().then(function(ks){return Promise.all(ks.filter(function(k){return k.indexOf('spss-pwa-')===0&&k!==C;}).map(function(k){return caches.delete(k);}));}).then(function(){return self.clients.claim();}));});
self.addEventListener('fetch',function(e){var r=e.request;
 if(r.method!=='GET'||r.mode!=='navigate')return;
 var u=new URL(r.url);if(u.origin!==self.location.origin||u.pathname.indexOf(new URL(self.registration.scope).pathname)!==0)return;
 var ab=/\/about\.html$/.test(u.pathname);
 e.respondWith(fetch(r).then(function(res){if(ab&&res&&res.ok){var cp=res.clone();caches.open(C).then(function(c){c.put(ABOUT,cp);});}return res;}).catch(function(){return caches.match(ab?ABOUT:OFF,{cacheName:C}).then(function(x){return x||new Response('دون اتصال',{status:503,headers:{'Content-Type':'text/plain; charset=utf-8'}});});}));});
self.addEventListener('message',function(e){var d=e.data||{};if(d.t!=='badge')return;var n=Number(d.n)||0,nv=self.navigator;
 try{if(nv&&'setAppBadge' in nv){var p=n?nv.setAppBadge(n):nv.clearAppBadge();if(p&&e.waitUntil)e.waitUntil(p.catch(function(){}));}}catch(x){}});
self.addEventListener('push',function(e){var j={},d={};
 try{j=e.data?e.data.json():{};}catch(x){try{j={data:{body:e.data.text()}};}catch(y){}}
 d=j.data||j||{};if(j.notification){d.title=d.title||j.notification.title;d.body=d.body||j.notification.body;}
 var sc=self.registration.scope,url;try{url=new URL(d.url||'alerts.html',sc).href;}catch(x){url=sc+'alerts.html';}
 var ttl=String(d.title||'بوصلة التعليم'),bd=String(d.body||''),ios=/iPhone|iPad|iPod|Macintosh/i.test((self.navigator&&self.navigator.userAgent)||'');
 e.waitUntil(self.clients.matchAll({type:'window',includeUncontrolled:true}).then(function(cs){
  var fg=false;cs.forEach(function(c){try{c.postMessage({t:'push',title:ttl,body:bd,url:url,kind:d.kind||'',tag:d.tag||''});}catch(x){}if(c.visibilityState==='visible'&&c.focused)fg=true;});
  var nv=self.navigator;try{if(nv&&'setAppBadge' in nv)nv.setAppBadge().catch(function(){});}catch(x){}
  if(fg&&!ios)return;   // المنصة مفتوحة أمام المستخدم: يكفي الشريط داخلها
  return self.registration.showNotification(ttl,{body:bd,icon:sc+'icons/icon-192.png',badge:sc+'icons/badge-96.png',tag:d.tag||'spss',renotify:true,lang:'ar',dir:'rtl',data:{url:url}});
 }));});
self.addEventListener('notificationclick',function(e){e.notification.close();var url=(e.notification.data&&e.notification.data.url)||self.registration.scope;
 e.waitUntil(self.clients.matchAll({type:'window',includeUncontrolled:true}).then(function(cs){
  for(var i=0;i<cs.length;i++){var c=cs[i];if(c.url.indexOf(self.registration.scope)===0&&'focus' in c){return (c.navigate&&c.url!==url?c.navigate(url).catch(function(){return c;}):Promise.resolve(c)).then(function(w){return (w||c).focus();});}}
  return self.clients.openWindow?self.clients.openWindow(url):null;}));});
