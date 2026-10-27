/* session-nav.js — أزرار «🚪 الخروج من الحصة» و«🏠 العودة إلى الصفحة الرئيسية» لكل صفحات المحاضرات وحصص التطبيق.
   يُضاف في آخر الصفحة: <script src="../assets/session-nav.js" defer></script>
   - بطاقة الدخول/تسجيل الحضور، شاشات الانتظار والملخص (#tq-go, #tq-wait, #qz-login, #qz-wait, #qz-end)، وشريط أدوات الشرائح (#dk).
   - الخروج: يوقف المتابعة/الاستطلاع، يمسح حالة الجلسة المحلية لهذه الصفحة فقط (البكالوريا ورمز الحصة) ثم يعيد الصفحة إلى حالة الدخول.
     لا يرسل أي طلب إلى الخادم، فلا يُلغى أي حضور مسجَّل.
   - update50: التصفح الحر: تضع الصفحة window.SNAV_FREE = السبب (review_attended | review_past | after15) فيظهر شريط «تصفح حر» في الشرائح وتنبيه في بطاقة الدخول.
   - مفاتيح الحالة: تُكتشف تلقائياً من سكربتات الصفحة (lecN/tpN-login|attendance-vN) أو من data-keys="k1,k2" في وسم السكربت. */
(function(){
'use strict';
if(window.__snav)return;window.__snav=1;
var me=document.currentScript||document.querySelector('script[src*="session-nav.js"]');
var HOME=(me&&me.getAttribute('data-home'))||'../';
var $=function(x){return document.getElementById(x)};
function lsGet(k){try{return localStorage.getItem(k)}catch(e){return null}}
function ssGet(k){try{return sessionStorage.getItem(k)}catch(e){return null}}
// ===== مفاتيح حالة الجلسة لهذه الصفحة =====
var KEYS=[];
function addKey(k){k=String(k||'').trim();if(k&&KEYS.indexOf(k)<0)KEYS.push(k);}
if(me&&me.getAttribute('data-keys'))me.getAttribute('data-keys').split(',').forEach(addKey);
Array.prototype.forEach.call(document.querySelectorAll('script:not([src])'),function(s){var t=s.textContent||'',m,re=/['"]((?:lec|tp)\d+[a-z]*-(?:login|attendance)-v\d+)['"]/g;while((m=re.exec(t)))addKey(m[1]);});
var SS=['dk-prof','dk-open','tp-slide'];
function hasState(){if(ssGet('dk-prof'))return true;for(var i=0;i<KEYS.length;i++)if(lsGet(KEYS[i]))return true;return false;}
function dk(){return $('dk');}
function isLive(){var d=dk();return !!(d&&d.classList.contains('on'));}
// ===== الأنماط =====
var css=document.createElement('style');css.id='snav-css';
css.textContent=[
'.snav-row{display:flex;flex-wrap:wrap;gap:8px;margin-top:12px;direction:rtl}',
':is(#dk,#tqz,body) .snav-row .snav-b{flex:1 1 180px;display:inline-flex;align-items:center;justify-content:center;gap:6px;box-sizing:border-box;width:auto;height:auto;min-height:44px;font:inherit;font-weight:800;font-size:15px;line-height:1.35;border:0;border-radius:12px;padding:10px 16px;color:#fff;cursor:pointer;text-decoration:none;box-shadow:0 1px 2px rgba(0,0,0,.18);transition:background .15s,transform .15s;white-space:normal;text-align:center}',
':is(#dk,#tqz,body) .snav-row .snav-b:hover{transform:translateY(-1px)}',
':is(#dk,#tqz,body) .snav-row .snav-h{background:#075985}:is(#dk,#tqz,body) .snav-row .snav-h:hover{background:#0369a1}',
':is(#dk,#tqz,body) .snav-row .snav-x{background:#be123c}:is(#dk,#tqz,body) .snav-row .snav-x:hover{background:#9f1239}',
':is(#dk,#tqz,body) .snav-row .snav-b[hidden]{display:none}',
'#dk .qz .snav-row .snav-b{font-size:.85em;min-height:0;padding:.45em 1em;border-radius:10px}',
'@media (min-width:640px){.snav-row.lt .snav-b{flex:0 0 auto!important}}',
'.snav-row.lt{border-top:1px dashed rgba(148,163,184,.5);padding-top:12px}',
/* أزرار شريط الشرائح: صغيرة وبجانب زر الإغلاق، فلا تغطي الشرائح */
'#dk button.snav-i{display:inline-flex;align-items:center;justify-content:center;gap:5px;font-size:18px}',
'#dk button.snav-i.snav-x{background:rgba(190,18,60,.6)}#dk button.snav-i.snav-h{background:rgba(7,89,133,.75)}',
'#dk button.snav-i .t{display:none;font-size:14px;font-weight:800;white-space:nowrap}',
'@media (min-width:640px){#dk button.snav-i{width:auto!important;padding:0 14px!important}#dk button.snav-i .t{display:inline}}',
'#snav-fab{position:absolute;top:8px;left:8px;z-index:40;display:flex;gap:6px}',
/* نافذة التأكيد */
'#snav-dlg{position:fixed;inset:0;z-index:2147483646;background:rgba(2,6,23,.72);display:flex;align-items:center;justify-content:center;padding:16px;direction:rtl;font-family:inherit}',
'#snav-dlg .c{background:#12304f;color:#f1f5f9;border:1px solid #1e4a73;border-radius:16px;padding:18px;max-width:420px;width:100%;box-sizing:border-box;box-shadow:0 10px 30px rgba(0,0,0,.4)}',
'#snav-dlg h3{margin:0 0 8px;font-size:18px;font-weight:800;color:#fff}#snav-dlg p{margin:0 0 6px;font-size:15px;line-height:1.7;color:#e2e8f0}#snav-dlg p.k{font-size:13.5px;color:#86efac}',
'#snav-dlg .r{display:flex;flex-wrap:wrap;gap:8px;margin-top:14px}#snav-dlg button{flex:1 1 140px;font:inherit;font-weight:800;font-size:15px;border:0;border-radius:12px;padding:11px 14px;color:#fff;cursor:pointer;width:auto;height:auto;line-height:1.35}',
'#snav-dlg button.y{background:#be123c}#snav-dlg button.y.h{background:#075985}#snav-dlg button.n{background:#334155}',
'#snav-toast{margin-top:10px;padding:10px 12px;border-radius:10px;background:#ecfdf5;border:1px solid #6ee7b7;color:#065f46;font-size:14px;font-weight:700;direction:rtl}',
'.dark #snav-toast{background:rgba(6,78,59,.45);border-color:#047857;color:#a7f3d0}',
/* update50: التصفح الحر */
'#snav-fz{position:absolute;top:10px;left:50%;transform:translateX(-50%);z-index:46;pointer-events:none;direction:rtl;background:rgba(220,38,38,.94);color:#fff;font-weight:800;font-size:13px;padding:5px 14px;border-radius:999px;box-shadow:0 2px 8px rgba(0,0,0,.35);white-space:nowrap;font-family:inherit}#snav-fb{position:absolute;bottom:10px;left:50%;transform:translateX(-50%);z-index:45;pointer-events:none;direction:rtl;background:rgba(5,150,105,.92);color:#fff;font-weight:800;font-size:13px;line-height:1.4;padding:5px 14px;border-radius:999px;box-shadow:0 2px 8px rgba(0,0,0,.35);white-space:nowrap;max-width:92%;overflow:hidden;text-overflow:ellipsis;font-family:inherit}',
'#snav-fb small{font-weight:600;opacity:.9;font-size:12px}#dk:has(> .nav) #snav-fb{bottom:calc(68px + env(safe-area-inset-bottom))}',
'@media (max-width:639px){#snav-fb small{display:none}}',
'#snav-fbn{margin-top:10px;padding:10px 12px;border-radius:10px;background:#ecfdf5;border:1.5px solid #10b981;color:#065f46;font-size:14px;font-weight:700;line-height:1.7;direction:rtl}',
'.dark #snav-fbn,html.dark #snav-fbn{background:rgba(6,78,59,.45);border-color:#059669;color:#a7f3d0}',
'#dk.snav-free .fl{display:none!important}#dk.snav-free .sy{display:none!important}'
].join('\n');
document.head.appendChild(css);
// ===== التأكيد =====
function ask(kind,ok){var old=$('snav-dlg');if(old)old.remove();
 var w=document.createElement('div');w.id='snav-dlg';w.setAttribute('role','alertdialog');w.setAttribute('aria-modal','true');
 var ex=kind==='exit';
 w.innerHTML='<div class="c"><h3>'+(ex?'🚪 الخروج من الحصة؟':'🏠 مغادرة الحصة؟')+'</h3><p>'+(ex?'سيتوقف تتبّع شرائح الأستاذ، وتُمسح بيانات الدخول من هذا الجهاز، وتعود إلى صفحة الدخول.':'ستغادر الحصة وتنتقل إلى الصفحة الرئيسية للمقياس.')+'</p><p class="k">✅ حضورك المسجَّل في الحصة لا يُلغى.</p><div class="r"><button type="button" class="y'+(ex?'':' h')+'">'+(ex?'نعم، الخروج':'نعم، الصفحة الرئيسية')+'</button><button type="button" class="n">إلغاء والبقاء في الحصة</button></div></div>';
 (document.fullscreenElement&&document.fullscreenElement!==document.documentElement?document.fullscreenElement:document.body).appendChild(w);
 var y=w.querySelector('.y'),n=w.querySelector('.n');
 function close(){w.remove();document.removeEventListener('keydown',kd,true);}
 function kd(e){if(e.key==='Escape'){e.stopPropagation();e.preventDefault();close();}}
 document.addEventListener('keydown',kd,true);
 n.onclick=function(e){e.stopPropagation();close();};w.onclick=function(e){e.stopPropagation();if(e.target===w)close();};
 y.onclick=function(e){e.stopPropagation();close();ok();};n.focus();}
// ===== الخروج =====
function stopAll(){try{var hi=setTimeout(function(){},0);for(var i=0;i<=hi;i++){clearTimeout(i);clearInterval(i);}}catch(e){}}
function exitNow(){
 window.__snavOut=1;stopAll();   // يوقف متابعة الأستاذ وكل الاستطلاعات فوراً
 KEYS.forEach(function(k){try{localStorage.removeItem(k);localStorage.removeItem(k+'-rv');}catch(e){}});
 SS.forEach(function(k){try{sessionStorage.removeItem(k)}catch(e){}});
 try{sessionStorage.setItem('snav-out','1')}catch(e){}
 try{if(screen.orientation&&screen.orientation.unlock)screen.orientation.unlock()}catch(e){}
 var go=function(){location.replace(location.pathname+location.search);};
 try{if(document.fullscreenElement&&document.exitFullscreen){document.exitFullscreen().then(go,go);return;}}catch(e){}
 go();}
function onExit(e){if(e){e.preventDefault();e.stopPropagation();}if(isLive())ask('exit',exitNow);else exitNow();}
function onHome(e){if(e){e.stopPropagation();}if(isLive()){e&&e.preventDefault();ask('home',function(){location.href=HOME;});}}
// ===== الصفوف داخل البطاقات =====
function row(light){var r=document.createElement('div');r.className='snav-row'+(light?' lt':'');r.setAttribute('data-snav-row','');
 var x=document.createElement('button');x.type='button';x.className='snav-b snav-x';x.setAttribute('data-snav-exit','');x.innerHTML='🚪 الخروج من الحصة';x.addEventListener('click',onExit);
 var h=document.createElement('a');h.className='snav-b snav-h';h.href=HOME;h.setAttribute('data-snav-home','');h.innerHTML='🏠 العودة إلى الصفحة الرئيسية';h.addEventListener('click',onHome);
 r.appendChild(x);r.appendChild(h);return r;}
function mount(){
 // 1) بطاقة تسجيل الحضور في الصفحة (المحاضرات والتطبيقات 1 و3)
 var note=$('att-lock-note'),box=note&&note.parentNode;
 if(box&&!box.querySelector(':scope > [data-snav-row]'))box.appendChild(row(true));
 // 2) بطاقة الدخول في الصفحة بدون att-lock-note (التطبيق 2): بعد زر دخول الأستاذ
 if(!note){var pb=$('prof-btn'),pw=pb&&pb.parentNode;if(pw&&!(pw.nextElementSibling&&pw.nextElementSibling.hasAttribute('data-snav-row'))){var r2=row(true);r2.style.justifyContent='center';pw.parentNode.insertBefore(r2,pw.nextSibling);}}
 // 3) شاشات الدخول والانتظار والملخص داخل الطبقات
 ['tq-go','tq-wait'].forEach(function(id){var e=$(id);if(e&&!e.querySelector(':scope > [data-snav-row]'))e.appendChild(row(false));});
 ['qz-login','qz-wait','qz-end'].forEach(function(id){var e=$(id),c=e&&(e.querySelector(':scope > .qc')||e);if(c&&!c.querySelector(':scope > [data-snav-row]'))c.appendChild(row(false));});
 Array.prototype.forEach.call(document.querySelectorAll('[data-snav]'),function(e){if(!e.querySelector(':scope > [data-snav-row]'))e.appendChild(row(false));});
 // 3ب) شاشة «أدر الهاتف» فوق الشرائح: تبقى أزرار الخروج والرئيسية متاحة
 var d0=dk();if(d0)Array.prototype.forEach.call(d0.querySelectorAll('.rot,.qrot'),function(e){if(!e.querySelector(':scope > [data-snav-row]')){var r=row(false);r.style.cssText='margin:14px auto 0;max-width:420px;width:100%;padding:0 12px;box-sizing:border-box';r.setAttribute('data-snav-live','');e.appendChild(r);}});
 // 4) واجهة الشرائح (متابعة الأستاذ والتصفح الحر): بجانب زر الإغلاق
 var d=dk();if(d&&!d.querySelector('[data-snav-i]')){var xb=d.querySelector('[data-a="x"]'),host,cls='';
  if(xb){host=xb.parentNode;cls=xb.className||'';}else{host=document.createElement('div');host.id='snav-fab';d.appendChild(host);}
  var bi=function(kind){var b=document.createElement('button');b.type='button';b.className=(cls?cls+' ':'')+'snav-i '+(kind==='exit'?'snav-x':'snav-h');b.setAttribute('data-snav-i',kind);
   var full=kind==='exit'?'الخروج من الحصة':'العودة إلى الصفحة الرئيسية';b.title=full;b.setAttribute('aria-label',full);
   b.innerHTML=(kind==='exit'?'🚪':'🏠')+'<span class="t">'+(kind==='exit'?'خروج':'الرئيسية')+'</span>';
   b.addEventListener('click',kind==='exit'?onExit:function(e){e.preventDefault();e.stopPropagation();ask('home',function(){location.href=HOME;});});
   ['touchstart','touchend','pointerdown','mousedown'].forEach(function(ev){b.addEventListener(ev,function(e){e.stopPropagation();},{passive:true});});
   return b;};
  host.appendChild(bi('exit'));host.appendChild(bi('home'));}
 refresh();}
// ===== update50: التصفح الحر (يحدده الخادم: دخول ثانٍ، أو بعد تاريخ الحصة، أو بعد انتهاء وقت الحصة يوم الحصة) =====
var FBR={review_attended:'دخول ثانٍ: حضورك مسجَّل مسبقاً',review_past:'مراجعة بعد تاريخ الحصة',after15:'بعد انتهاء وقت الحصة'};
function freeR(){var r=window.SNAV_FREE;if(!r||ssGet('dk-prof')||window.SNAV_FORCED)return '';return String(r);}
function fbPaint(){var r=freeR(),d=dk(),why=FBR[r]||'';
 if(d){var fz=$('snav-fz');if(window.SNAV_FORCED&&!ssGet('dk-prof')){if(!fz){fz=document.createElement('div');fz.id='snav-fz';fz.setAttribute('role','status');fz.textContent='🔗 الأستاذ ربط الشاشات: تتبع شريحته الآن';d.appendChild(fz);}}else if(fz)fz.remove();}
 if(d){d.classList.toggle('snav-free',!!r);var b=$('snav-fb');
  if(r&&!b){b=document.createElement('div');b.id='snav-fb';b.setAttribute('role','status');d.appendChild(b);}
  if(b){if(!r)b.remove();else{var h='🔓 تصفح حر: تنقّل بين الشرائح بحرية'+(why?' <small>('+why+')</small>':'');if(b.innerHTML!==h)b.innerHTML=h;}}}
 var note=$('att-lock-note'),n=$('snav-fbn');
 if(r&&note&&note.parentNode&&!document.body.classList.contains('att-locked')){if(!n){n=document.createElement('div');n.id='snav-fbn';n.setAttribute('data-fb',r);note.parentNode.insertBefore(n,note.nextSibling);}
  var t='🔓 التصفح الحر مفعَّل'+(why?' ('+why+')':'')+': افتح الشرائح وتنقّل بينها بحرية بالسابق والتالي، دون متابعة شاشة الأستاذ ودون انتظار.';if(n.textContent!==t){n.textContent=t;n.setAttribute('data-fb',r);}}
 else if(n&&!r)n.remove();}
function refresh(){fbPaint();var s=hasState();Array.prototype.forEach.call(document.querySelectorAll('[data-snav-exit]'),function(b){b.hidden=!s;});
 Array.prototype.forEach.call(document.querySelectorAll('[data-snav-i="exit"]'),function(b){b.style.display=s?'':'none';});}
mount();setInterval(function(){if(!window.__snavOut)refresh();},800);
window.snav={exit:exitNow,keys:KEYS,mount:mount,hasState:hasState,refresh:refresh,free:function(r){window.SNAV_FREE=r||'';refresh();}};
// ===== رسالة بعد الخروج =====
if(ssGet('snav-out')){try{sessionStorage.removeItem('snav-out')}catch(e){}
 var t=document.createElement('div');t.id='snav-toast';t.setAttribute('role','status');t.textContent='🚪 تم الخروج من الحصة على هذا الجهاز. حضورك المسجَّل محفوظ، ويمكنك الدخول من جديد.';
 var tgt=$('att-frame-wrap')||($('prof-btn')&&$('prof-btn').parentNode);
 if(tgt&&tgt.parentNode){tgt.parentNode.insertBefore(t,tgt);setTimeout(function(){var s=$('mod-attendance')||t;try{s.scrollIntoView({block:'start'})}catch(e){}},400);setTimeout(function(){t.remove()},12000);}}
})();
