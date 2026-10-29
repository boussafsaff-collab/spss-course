/* auth.js — update61: + لوحة الطالب (☰، action=asme) وتصفية المحتوى حسب تخصص/فوج الطالب.
   update60: الدخول الموحّد إلى المنصة (أستاذ / طالب)
   يُضاف في <head> كل صفحة (قبل سكربتات الصفحة):  <script src="../assets/auth.js" data-page="session"></script>
   data-page: landing | list | assess | teacher | session
   - الطالب: رقم البكالوريا يتحقق منه الخادم (aslist) ثم يُحفظ في هذا الجهاز (localStorage: spss_id).
   - الأستاذ: الرمز السري يتحقق منه الخادم (askey)، ويُحفظ في هذه النافذة فقط (sessionStorage: spss_tkey)؛
     ويُمرَّر إلى الصفحات القديمة (dk-prof لشاشة الأستاذ في الحصص، as_tkey للوحة التقييم).
   - «الأستاذ كطالب»: رقم تجريبي ثابت 9900xxxx (astu، بمفتاح الأستاذ) — نتائجه خارج الإحصاءات وتُمسح بزر واحد.
   - دون هوية: الصفحات (عدا الرئيسية ولوحة الأستاذ) تحوّل إلى الصفحة الرئيسية للدخول ثم تعود (?next=). */
(function(){
'use strict';
if(window.SPSS_AUTH)return;
var U='https://script.google.com/macros/s/AKfycbysPtnOf5M0_SSFEal76q_XQbV9dtJnxbSnZO2xaXa8NUtfSdCCfcvMT3y2QiCzUjUJ/exec';
var me=document.currentScript||document.querySelector('script[src*="auth.js"]');
var PAGE=(me&&me.getAttribute('data-page'))||'session';
var ROOT=new URL('../',(me&&me.src)?me.src:new URL('assets/auth.js',location.href).href).href;
// اسم المنصة (مكان واحد مع manifest.webmanifest؛ للتغيير: tools/set-app-name.sh)
var APP_NAME='بوصلة التعليم',APP_SHORT='بوصلة التعليم';
var APP_TAG='الدرس في هاتفك، أينما كنت',APP_MODULE='برمجيات إحصائية SPSS';
// سطر حقوق النشر (مكان واحد لكل الصفحات ولوحة الطالب وبطاقة الدخول؛ offline.html نسخة ثابتة)
var APP_COPY_YEAR='2026',APP_OWNER='د. بوصفصاف فريد',APP_OWNER_URL='https://www.linkedin.com/in/farid-boussafsaf';
var APP_COPY='© '+APP_COPY_YEAR+' '+APP_OWNER+'، كل الحقوق محفوظة';
function copyHTML(){return '© '+APP_COPY_YEAR+' <a class="spss-li" href="'+APP_OWNER_URL+'" target="_blank" rel="noopener noreferrer" aria-label="'+APP_OWNER+' على LinkedIn (يفتح في نافذة جديدة)"><svg viewBox="0 0 24 24" width="13" height="13" aria-hidden="true" focusable="false"><path fill="currentColor" d="M20.45 20.45h-3.56v-5.57c0-1.33-.02-3.04-1.85-3.04-1.85 0-2.14 1.45-2.14 2.94v5.67H9.35V9h3.41v1.56h.05c.48-.9 1.64-1.85 3.37-1.85 3.6 0 4.27 2.37 4.27 5.46v6.28zM5.34 7.43a2.06 2.06 0 1 1 0-4.13 2.06 2.06 0 0 1 0 4.13zM7.12 20.45H3.56V9h3.56v11.45zM22.22 0H1.77C.79 0 0 .77 0 1.73v20.54C0 23.23.79 24 1.77 24h20.45c.98 0 1.78-.77 1.78-1.73V1.73C24 .77 23.2 0 22.22 0z"/></svg>'+APP_OWNER+'</a>، كل الحقوق محفوظة<span class="spss-sep" aria-hidden="true"> · </span><a class="spss-ab-l" href="'+ROOT+'about.html"'+(PAGE==='about'?' aria-current="page"':'')+'>من نحن</a>';}
var PROFS={f1:'إدارة مالية – الفوج 1',f2:'إدارة مالية – الفوج 2',f3:'إدارة مالية – الفوج 3',ba:'إدارة أعمال'};
function lg(k){try{return localStorage.getItem(k)}catch(e){return null}}
function ls(k,v){try{if(v==null)localStorage.removeItem(k);else localStorage.setItem(k,v)}catch(e){}}
function sg(k){try{return sessionStorage.getItem(k)}catch(e){return null}}
function ss(k,v){try{if(v==null)sessionStorage.removeItem(k);else sessionStorage.setItem(k,v)}catch(e){}if(k==='spss_tkey')ls(k,v);}
// update71b: جلسة الأستاذ تبقى على هذا الجهاز حتى «خروج» صريح (كانت في sessionStorage فتضيع عند غلق التطبيق)
try{if(!sessionStorage.getItem('spss_tkey')&&localStorage.getItem('spss_tkey'))sessionStorage.setItem('spss_tkey',localStorage.getItem('spss_tkey'));}catch(e){}
function pj(t){try{return JSON.parse(t||'null')}catch(e){return null}}
function esc(t){var d=document.createElement('span');d.textContent=t==null?'':String(t);return d.innerHTML;}
/* update83: جلسة الطالب محلية بعد دخول ناجح عبر الشبكة؛ دون اتصال تبقى صالحة 7 أيام منذ آخر فتح متصل */
var OFF_TTL=7*864e5;
function cur(){var k=sg('spss_tkey');
 if(k){var t=pj(sg('spss_tstu'));if(t&&/^9900\d{4}$/.test(t.bac||''))return {role:'tstu',key:k,bac:t.bac,nom:t.nom,prenom:t.prenom,sp:t.sp,grp:t.grp,prof:t.prof};return {role:'teacher',key:k};}
 var s=pj(lg('spss_id'));if(s&&/^\d{5,10}$/.test(s.bac||'')&&(navigator.onLine!==false||Date.now()-Number(lg('spss_seen')||s.t||0)<OFF_TTL))return {role:'student',bac:s.bac,nom:s.nom,prenom:s.prenom,sp:s.sp,grp:s.grp,free:s.free};
 return null;}
var ID=cur();if(ID)window.__spssAL=1;if(ID&&ID.role==='student'&&navigator.onLine!==false)ls('spss_seen',String(Date.now()));
// مفاتيح الحالة المحلية للصفحات (الدخول/الحضور، التقييم الجاري)
var PK=/^((lec|tp)\d+[a-z]*-(login|attendance)-v\d+(-rv)?|as_bac|as_q_.*|as_a_.*|tp\d+-qz.*|tp3cfg-prof)$/;
function bacOf(v){var o=pj(v);if(!o||typeof o!=='object')return '';return String(o.bac||o.matricule||(o.f&&(o.f.bac||o.f.matricule))||'');}
function purge(all){var ks=[];try{for(var i=0;i<localStorage.length;i++)ks.push(localStorage.key(i));}catch(e){}
 ks.forEach(function(k){if(!PK.test(k)||k==='tp3cfg-prof')return;if(all){ls(k,null);return;}
  var b=k==='as_bac'?String(lg(k)||''):bacOf(lg(k));if(ID&&ID.bac&&b&&b!==ID.bac)ls(k,null);});}
// 1) مزامنة الهوية مع مفاتيح الصفحات القديمة (قبل تشغيل سكربتات الصفحة)
if(ID){
 if(ID.role==='teacher'){ss('dk-prof',ID.key);ss('as_tkey',ID.key);}
 else{ss('dk-prof',null);try{localStorage.removeItem('dk-prof')}catch(e){}purge(false);ls('as_bac',ID.bac);if(ID.role==='tstu')ss('as_tkey',ID.key);}
}else if(PAGE==='teacher'&&sg('as_tkey')){ /* لوحة الأستاذ بالرمز مباشرة: يبقى كما كان */ }
// 2) دون هوية: الدخول من الصفحة الرئيسية ثم العودة
if(!ID&&(PAGE==='session'||PAGE==='list'||PAGE==='assess')){
 var nx=location.pathname+location.search+location.hash;
 try{document.documentElement.style.visibility='hidden';}catch(e){}
 location.replace(ROOT+'index.html?next='+encodeURIComponent(nx));return;}
// 3) «الأستاذ كطالب»: مفتاح الأستاذ يُرفق آلياً بطلبات الحضور برقمه التجريبي (يتحقق منه الخادم)
if(ID&&ID.role==='tstu'&&window.fetch){var of=window.fetch;
 window.fetch=function(u,o){try{var url=String(u&&u.url||u);if(url.indexOf(U)===0&&o&&o.body){var b=o.body;
   if(b instanceof FormData){var fb=String(b.get('bac')||'');if(fb===ID.bac&&!b.get('key'))b.append('key',ID.key);}
   else if(b instanceof URLSearchParams){var bb=String(b.get('bac')||'');if(bb===ID.bac&&!b.get('key'))b.append('key',ID.key);}}}catch(e){}
  return of.apply(this,arguments);};}
// 4) update61: تصفية المحتوى حسب الطالب (وضع الأستاذ يرى كل شيء؛ «الأستاذ كطالب» يرى ما يراه الملف المختار؛ رقم الأستاذ التجريبي حر)
var FLT=!!(ID&&ID.role!=='teacher'&&!ID.free);
var FIN=!!(ID&&/مالية/.test(ID.sp||''));
var BIZ=FLT&&!FIN;
var GRPN=ID?String(ID.grp||'').replace(/\D/g,'').replace(/^0+/,''):'';
var TPPAGE=PAGE==='session'&&/-tp[^\/]*\.html$/i.test(location.pathname);
if(FLT){
 if(PAGE==='list'){ls('spss_course_specialty',FIN?'إدارة مالية':'إدارة أعمال');if(FIN&&GRPN)ls('spss_course_group','إدارة مالية - فوج '+GRPN);if(BIZ)try{localStorage.removeItem('spss_course_group');}catch(e){}}
 try{document.documentElement.classList.add('spss-flt');if(BIZ)document.documentElement.classList.add('spss-biz');if(BIZ&&TPPAGE){document.documentElement.classList.add('spss-biztp');window.SNAV_FREE='biz';}}catch(e){}
}
// ===== واجهة =====
var CSS=[
'#spss-ub .bell{position:relative;flex:none;display:inline-flex;align-items:center;justify-content:center;width:42px;height:42px;margin:0;padding:0;border:1px solid rgba(255,255,255,.18);border-radius:12px;background:rgba(255,255,255,.1);color:#fff!important;text-decoration:none!important;-webkit-tap-highlight-color:transparent}#spss-ub .bell:hover{background:rgba(255,255,255,.18)}#spss-ub .bell svg{width:21px;height:21px;display:block}#spss-ub .bell[aria-current]{background:rgba(251,191,36,.22);border-color:#fbbf24}',
'#spss-ub .bell .cnt{position:absolute;top:-6px;left:-6px;min-width:20px;height:20px;padding:0 5px;border-radius:999px;background:#f43f5e;color:#fff;font-size:11.5px;font-weight:800;line-height:20px;text-align:center;box-shadow:0 0 0 2px #0f2744;font-style:normal}#spss-ub .bell .cnt:empty{display:none}',
'#spss-push{background:#fff;border:1px solid #c7d2fe;border-radius:16px;padding:12px 14px;margin:0 0 14px;box-shadow:0 2px 8px rgba(15,39,68,.05)}#spss-push h2{font-size:16px;margin:0 0 4px;color:#0f2744}#spss-push p{margin:4px 0;font-size:14.5px;line-height:1.7;overflow-wrap:anywhere}#spss-push .st.on{color:#166534}#spss-push .st.no{color:#9a3412}#spss-push .hi{font-size:13.5px;color:#475569}#spss-push .pm{font-size:13.5px;font-weight:700;color:#1e3a8a;background:#eff6ff;border-radius:10px;padding:6px 10px;margin-top:8px}#spss-push .ac{display:flex;flex-wrap:wrap;gap:8px;margin-top:8px}#spss-push .go{font:inherit;display:inline-flex;align-items:center;justify-content:center;min-height:46px;padding:6px 16px;border-radius:12px;border:0;background:#0f2744;color:#fff;font-weight:800;font-size:15px;cursor:pointer;flex:1 1 220px}#spss-push .b2{flex:1 1 160px}',
'#spss-at{all:initial;box-sizing:border-box;direction:rtl;font-family:Cairo,"Segoe UI","Noto Sans Arabic",Tahoma,sans-serif;display:flex;align-items:center;gap:8px;max-width:960px;margin:8px auto 10px;padding:7px 8px 7px 12px;background:#fff7ed;border:1.5px solid #fb923c;border-radius:14px;color:#7c2d12;font-size:14px;line-height:1.5;box-shadow:0 4px 12px rgba(234,88,12,.12)}#spss-at *{box-sizing:border-box;font-family:inherit}',
'#spss-at .tx{flex:1 1 auto;min-width:0;overflow:hidden;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical}#spss-at .tx b{color:#9a3412}',
'#spss-at .go{flex:none;display:inline-flex;align-items:center;min-height:36px;padding:4px 12px;border-radius:10px;background:#ea580c;color:#fff!important;font-weight:800;font-size:13.5px;text-decoration:none!important;white-space:nowrap}#spss-at .x{flex:none;width:34px;height:34px;border:0;border-radius:10px;background:transparent;color:#9a3412;font-size:18px;cursor:pointer;padding:0;margin:0}#spss-at .x:hover{background:#ffedd5}#spss-at a:focus-visible,#spss-at button:focus-visible{outline:3px solid #0f2744;outline-offset:2px}',
'#spss-ub .ham{position:relative}#spss-ub .ham.dot::after{content:"";position:absolute;top:6px;left:6px;width:10px;height:10px;border-radius:50%;background:#f43f5e;box-shadow:0 0 0 2px #0f2744}',
'#spss-mn .it .nb{margin-right:auto;font-style:normal;font-size:12px;font-weight:800;border-radius:999px;padding:0 8px;min-width:22px;text-align:center;line-height:20px;background:#e2e8f0;color:#334155}#spss-mn .it .nb.w{background:#ffedd5;color:#9a3412}#spss-mn .it .nb.o{background:#dcfce7;color:#166534}#spss-mn .it .nb:empty{display:none}',
'#spss-mn .it.sub{min-height:42px;font-size:14.5px;padding:6px 10px}#spss-mn .it.sub .ic{width:30px;height:30px;font-size:15px}',
'html.spss-abtp #hb,html.spss-abtp #nav,html.spss-abtp #bdp,html.spss-abtp .nvh{display:none!important}html.spss-abtp .lay{display:block!important}',
'html.spss-abtp .w:has(#panel:not(.hide)) .hd{display:none!important}',
'html.spss-abtp .shd{padding:10px 14px!important;min-height:0!important}html.spss-abtp #stitle::before{content:"لوحة الأستاذ ‹ ";color:#93c5fd;font-weight:700;font-family:Cairo,"Segoe UI",Tahoma,sans-serif}',
'#spss-ub{all:initial;box-sizing:border-box;direction:rtl;font-family:Cairo,"Segoe UI","Noto Sans Arabic",Tahoma,sans-serif;position:sticky;top:0;z-index:45;display:flex;align-items:center;gap:8px;width:100%;min-height:56px;padding:8px max(12px,env(safe-area-inset-right)) 8px max(12px,env(safe-area-inset-left));background:linear-gradient(180deg,#12305a,#0f2744);color:#fff;box-shadow:0 2px 12px rgba(2,6,23,.22);border-bottom:1px solid rgba(255,255,255,.08);line-height:1.4}',
'#spss-ub *{box-sizing:border-box;font-family:inherit}#spss-ub.tstu{border-bottom:3px solid #fbbf24}',
'#spss-ub .br{display:flex;align-items:center;gap:9px;min-width:0;flex:0 1 auto;color:#fff!important;text-decoration:none!important;border-radius:12px;padding:2px 4px 2px 8px;margin:0;background:none}',
'#spss-ub .br img{width:34px;height:34px;border-radius:9px;display:block;flex:none;box-shadow:0 0 0 1px rgba(255,255,255,.18)}',
'#spss-ub .br .nm{font-size:17px;font-weight:800;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;letter-spacing:0;color:#fff}',
'#spss-ub .sp{flex:1 1 0;min-width:4px}',
'#spss-ub .bdg{flex:0 1 auto;min-width:0;max-width:34vw;font-size:12.5px;font-weight:700;color:#dbeafe;background:rgba(255,255,255,.12);border:1px solid rgba(255,255,255,.16);border-radius:999px;padding:3px 10px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}',
'#spss-ub.tstu .bdg{background:#fbbf24;color:#451a03;border-color:#fbbf24}',
'#spss-ub .ham{flex:none;display:inline-flex;align-items:center;justify-content:center;width:42px;height:42px;margin:0;padding:0;border:1px solid rgba(255,255,255,.18);border-radius:12px;background:rgba(255,255,255,.1);color:#fff;cursor:pointer;-webkit-tap-highlight-color:transparent}',
'#spss-ub .ham svg{width:22px;height:22px;display:block}#spss-ub .ham:hover{background:rgba(255,255,255,.18)}',
'#spss-ub a:focus-visible,#spss-ub button:focus-visible,#spss-mn a:focus-visible,#spss-mn button:focus-visible{outline:3px solid #fbbf24;outline-offset:2px}',
'html.spss-ab{scroll-padding-top:calc(var(--spss-abh,56px) + 10px)}'+
'html.spss-abt .shd{top:calc(var(--spss-abh,56px) + 6px)!important}',
'@media (max-width:420px){#spss-ub{gap:6px}#spss-ub .bdg{max-width:84px;padding:3px 8px;font-size:12px}#spss-ub .br .nm{font-size:16px}#spss-ub .br{gap:7px}}',
'@media (max-width:359px){#spss-ub .bdg{display:none}}',
'#spss-mn{all:initial;direction:rtl;font-family:Cairo,"Segoe UI","Noto Sans Arabic",Tahoma,sans-serif;position:fixed;inset:0;z-index:2147482990;display:block;visibility:hidden;pointer-events:none}',
'#spss-mn.open{visibility:visible;pointer-events:auto}#spss-mn *{box-sizing:border-box;font-family:inherit}#spss-mn .ic{font-family:"Segoe UI Emoji","Apple Color Emoji","Noto Color Emoji",sans-serif}',
'#spss-mn .bd{position:absolute;inset:0;background:rgba(2,6,23,.5);opacity:0;transition:opacity .2s}#spss-mn.open .bd{opacity:1}',
'#spss-mn .pn{position:absolute;top:0;bottom:0;left:0;width:min(320px,86vw);background:#fff;color:#1e293b;display:flex;flex-direction:column;box-shadow:12px 0 32px rgba(2,6,23,.28);transform:translateX(-104%);transition:transform .22s ease;border-radius:0 18px 18px 0;overflow:hidden}',
'#spss-mn.open .pn{transform:none}@media (prefers-reduced-motion:reduce){#spss-mn .pn,#spss-mn .bd{transition:none}}',
'#spss-mn .hd{display:flex;align-items:center;gap:10px;padding:14px 14px 12px;background:linear-gradient(180deg,#12305a,#0f2744);color:#fff}',
'#spss-mn .hd img{width:40px;height:40px;border-radius:10px;flex:none}#spss-mn .hd .t{flex:1;min-width:0}',
'#spss-mn .hd b{display:block;font-size:16px;font-weight:800;line-height:1.3}#spss-mn .hd small{display:block;font-size:12.5px;font-weight:600;color:#bfdbfe;line-height:1.5;overflow-wrap:anywhere}',
'#spss-mn.tstu .hd small .tg{display:inline-block;background:#fbbf24;color:#451a03;border-radius:999px;padding:0 8px;font-weight:800;margin-left:4px}',
'#spss-mn .x{flex:none;width:38px;height:38px;border-radius:10px;border:1px solid rgba(255,255,255,.2);background:rgba(255,255,255,.1);color:#fff;font-size:18px;line-height:1;cursor:pointer;padding:0;margin:0}',
'#spss-mn .ls{flex:1;overflow-y:auto;overscroll-behavior:contain;padding:8px 10px 12px}',
'#spss-mn .gh{margin:12px 8px 4px;font-size:12px;font-weight:800;color:#64748b;letter-spacing:0}',
'#spss-mn .it{display:flex;align-items:center;gap:12px;width:100%;min-height:46px;margin:2px 0;padding:8px 10px;border:0;border-radius:12px;background:none;color:#0f2744!important;font-size:15px;font-weight:700;text-align:right;text-decoration:none!important;cursor:pointer;line-height:1.4}',
'#spss-mn .it:hover{background:#eef4fb}#spss-mn .it[aria-current]{background:#e0ecfb}',
'#spss-mn .it .ic{flex:none;width:34px;height:34px;border-radius:10px;display:inline-flex;align-items:center;justify-content:center;background:#eef2f7;font-size:16px}',
'#spss-mn .it .ic img{width:24px;height:24px;border-radius:6px;display:block}',
'#spss-mn .ft{border-top:1px solid #e6edf5;padding:8px 10px calc(10px + env(safe-area-inset-bottom))}',
'#spss-mn .it.dg{color:#be123c!important}#spss-mn .it.dg .ic{background:#ffe4e6}#spss-mn .it.dg:hover{background:#fff1f2}',
'html.spss-flt #picker{display:none!important}html.spss-biztp #mod-attendance,html.spss-biztp #mod-quiz,html.spss-biztp [onclick*="mod-attendance"],html.spss-biztp [onclick*="mod-quiz"],html.spss-biztp a[href="#mod-attendance"],html.spss-biztp a[href="#mod-quiz"],html.spss-biztp #att-frame-wrap,html.spss-biztp #qz-login,html.spss-biztp #qz-wait,html.spss-biztp #tq-go,html.spss-biztp #tq-wait,html.spss-biztp .qzbtn,html.spss-biztp #snav-fbn{display:none!important}html.spss-biz #note{display:none!important}.spss-free{direction:rtl;font-family:Cairo,"Segoe UI",Tahoma,sans-serif;display:flex;gap:10px;align-items:flex-start;background:#eff6ff;border:1px solid #93c5fd;color:#0f2744;border-radius:14px;padding:10px 14px;margin:10px auto;max-width:1100px;line-height:1.7;font-size:14px;box-sizing:border-box}.spss-free b{display:block;font-size:15px}.spss-free .i{flex:0 0 auto;font-size:18px;line-height:1.4}',
'#spss-me{direction:rtl;text-align:right;font-family:Cairo,"Segoe UI","Noto Sans Arabic",Tahoma,sans-serif;line-height:1.8;position:fixed;inset:0;z-index:2147483601;background:#f4f7fb;color:#1e293b;overflow-y:auto;overscroll-behavior:contain;opacity:0;visibility:hidden;transition:opacity .2s ease,visibility .2s}#spss-me.open{opacity:1;visibility:visible}#spss-me *{box-sizing:border-box}',
'#spss-me .mw{max-width:760px;margin:0 auto;padding:clamp(6px,2vw,24px) clamp(4px,1.5vw,16px) 28px}',
'#spss-me .shd{position:sticky;top:0;z-index:30;display:flex;align-items:center;gap:10px;background:#0f2744;color:#fff;border-radius:14px;padding:6px 8px;margin:0 0 10px;box-shadow:0 8px 20px rgba(15,23,42,.18)}',
'#spss-me .shd button{flex:0 0 auto;width:46px;height:46px;border-radius:12px;border:0;background:rgba(255,255,255,.14);color:#fff;font-size:22px;line-height:1;cursor:pointer;font-family:inherit;padding:0}#spss-me .shd .x{font-size:18px}#spss-me .shd button:focus-visible,#spss-me .mnx:focus-visible{outline:3px solid #93c5fd;outline-offset:2px}',
'#spss-me .stt{flex:1 1 auto;min-width:0;font-weight:800;font-size:16px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}#spss-me .stt i{color:#e9c46a;margin-left:7px}',
'#spss-me .mnav{position:fixed;top:0;right:0;bottom:0;width:min(310px,86vw);z-index:60;background:#fff;display:flex;flex-direction:column;gap:4px;padding:12px;overflow-y:auto;overscroll-behavior:contain;transform:translateX(105%);visibility:hidden;transition:transform .22s ease,visibility .22s;box-shadow:-12px 0 30px rgba(0,0,0,.25);border-radius:18px 0 0 18px}#spss-me .mnav.open{transform:none;visibility:visible}',
'#spss-me .nvh{display:flex;align-items:center;justify-content:space-between;gap:8px;font-weight:800;color:#0f2744;font-size:16px;margin:0 0 6px;padding:0 4px 8px;border-bottom:1px solid #e3e9f2}#spss-me .nvh small{display:block;font-size:12px;font-weight:600;color:#64748b;line-height:1.5}#spss-me .mnx{flex:0 0 auto;width:44px;height:44px;border-radius:12px;border:1.5px solid #cbd5e1;background:#f8fafc;color:#0f2744;font-size:18px;cursor:pointer;font-family:inherit}',
'#spss-me .tl{display:flex;flex-direction:column;gap:4px}#spss-me .tl [role=tab]{display:flex;align-items:center;gap:9px;width:100%;min-height:48px;padding:8px 12px;border-radius:12px;border:0;background:transparent;color:#0f2744;font:inherit;font-weight:800;font-size:15px;text-align:right;cursor:pointer;line-height:1.5}#spss-me .tl [role=tab] i{color:#1d4f86;width:20px;text-align:center}#spss-me .tl [role=tab]:hover{background:#eef2f7}#spss-me .tl [role=tab][aria-selected=true]{background:#0f2744;color:#fff;box-shadow:0 6px 16px rgba(15,23,42,.18)}#spss-me .tl [role=tab][aria-selected=true] i{color:#e9c46a}#spss-me .tl [role=tab]:focus-visible{outline:3px solid #93c5fd;outline-offset:1px}',
'#spss-me .bdp{position:fixed;inset:0;background:rgba(15,23,42,.5);z-index:55}#spss-me .hide{display:none!important}html.spss-lock,html.spss-lock body{overflow:hidden}@media (prefers-reduced-motion:reduce){#spss-me,#spss-me .mnav{transition:none}}',
'@media (min-width:1024px){#spss-me .mw{max-width:1180px}#spss-me .lay{display:grid;grid-template-columns:250px minmax(0,1fr);gap:16px;align-items:start}#spss-me .lay.col{grid-template-columns:minmax(0,1fr)}#spss-me .mnav{position:sticky;top:70px;bottom:auto;width:auto;z-index:1;transform:none;visibility:visible;transition:none;border:1px solid #e3e9f2;border-radius:18px;padding:10px;box-shadow:0 8px 24px rgba(15,23,42,.06);overflow:visible}#spss-me .lay.col .mnav{display:none}#spss-me .nvh .mnx{display:none}#spss-me .nvh{padding-bottom:6px}#spss-me .bdp{display:none!important}}',
'#spss-me .who{color:#475569;font-size:13.5px;font-weight:700;margin:0 4px 8px}#spss-me section{background:#fff;border:1px solid #e3e9f2;border-radius:18px;padding:clamp(12px,4vw,24px);margin:0 0 14px;box-shadow:0 1px 2px rgba(15,23,42,.04),0 8px 24px rgba(15,23,42,.06)}#spss-me h3{margin:0 0 10px;font-size:16px;font-weight:800;color:#14365c;display:flex;align-items:center;gap:8px}#spss-me h3 i{color:#1d4f86}#spss-me h4{margin:12px 0 6px;font-size:14px;color:#334155}#spss-me .bd>p{background:#fff;border:1px solid #e3e9f2;border-radius:18px;padding:16px}',
'#spss-me .rw{display:flex;align-items:center;gap:8px;padding:7px 0;border-top:1px solid #e2e8f0;font-size:13.5px}#spss-me .rw:first-of-type{border-top:0}#spss-me .rw .t{flex:1;min-width:0}#spss-me .rw .v{font-weight:800;white-space:nowrap}#spss-me .rw.nx{background:#fef9c3;border-radius:8px;padding:7px 6px}',
'#spss-me .bg{display:inline-block;flex:none;width:auto;height:auto;min-height:0;margin:0;border:0;box-shadow:none;border-radius:999px;padding:2px 9px;font-size:12px;line-height:1.5;font-weight:800;white-space:nowrap;text-align:center}#spss-me .mk-ok{background:#dcfce7;color:#166534}#spss-me .mk-no{background:#fee2e2;color:#991b1b}#spss-me .mk-op{background:#dbeafe;color:#1e40af}#spss-me .mk-cl{background:#e2e8f0;color:#475569}#spss-me .mk-rj{background:#fde68a;color:#78350f}',
'#spss-me .avg{display:flex;gap:8px;flex-wrap:wrap;margin:6px 0}#spss-me .avg div{flex:1 1 92px;background:#eff6ff;border-radius:10px;padding:8px;text-align:center;font-size:12.5px}#spss-me .avg b{display:block;font-size:20px;color:#0f2744}#spss-me .nt{font-size:12px;color:#64748b;margin:6px 0 0}#spss-me .rw.mga{flex-wrap:wrap;align-items:center;row-gap:6px}#spss-me .rw.mga>.t{flex:1 1 100%;min-width:0;white-space:normal;overflow-wrap:anywhere}#spss-me .mgl{flex:1 1 100%;display:flex;align-items:center;flex-wrap:wrap;gap:6px 8px;min-width:0}#spss-me .mrem{display:inline-flex;align-items:center;gap:5px;min-width:0;font-size:12px;font-weight:700;color:#92400e;line-height:1.4}#spss-me .mrem i{color:#d97706}#spss-me .mgo{display:inline-flex;align-items:center;justify-content:center;gap:8px;flex:0 0 auto;width:auto;margin:2px 0 0;margin-inline-end:auto;min-height:42px;padding:8px 18px;border-radius:12px;border:0;background:#0f2744;color:#fff;font:inherit;font-weight:800;font-size:14px;line-height:1.2;white-space:nowrap;text-decoration:none;box-shadow:0 4px 12px rgba(15,39,68,.22);transition:background .15s}#spss-me .mgo i{color:#e9c46a}#spss-me .mgo:hover{background:#1d4f86}#spss-me .mgo:focus-visible{outline:3px solid #93c5fd;outline-offset:2px}#spss-me .a3 b{color:#0f2744}#spss-me .mrq{display:inline-flex;align-items:center;justify-content:center;gap:7px;flex:0 0 auto;width:auto;height:auto;margin:2px 0 0;margin-inline-end:auto;min-height:38px;padding:6px 14px;border-radius:12px;border:1.5px solid #0f2744;background:#fff;color:#0f2744;font:inherit;font-weight:800;font-size:13.5px;line-height:1.2;white-space:nowrap;cursor:pointer;box-shadow:none}#spss-me .mrq:hover{background:#eff6ff}#spss-me .mrq:focus-visible,#spss-me .mrqs:focus-visible,#spss-me .mrqc:focus-visible{outline:3px solid #93c5fd;outline-offset:2px}#spss-me .mrqr{flex:1 1 100%;min-width:0;font-size:12.5px;line-height:1.5;color:#334155;background:#f8fafc;border-inline-start:3px solid #94a3b8;padding:4px 8px;border-radius:6px;overflow-wrap:anywhere}#spss-me .mrqk{font-size:11.5px;color:#64748b;white-space:nowrap}#spss-me .mrqf{flex:1 1 100%;display:flex;flex-direction:column;gap:6px;margin:4px 0 0;min-width:0}#spss-me .mrqf label{font-size:12.5px;font-weight:700;color:#334155}#spss-me .mrqf textarea{display:block;width:100%;box-sizing:border-box;min-height:64px;margin:0;font:inherit;font-size:14px;line-height:1.5;padding:8px 10px;border:1.5px solid #cbd5e1;border-radius:10px;background:#fff;color:#0f172a;resize:vertical}#spss-me .mrqb{display:flex;gap:8px;flex-wrap:wrap;align-items:center}#spss-me .mrqs,#spss-me .mrqc{display:inline-flex;align-items:center;gap:6px;width:auto;min-height:38px;margin:0;padding:6px 14px;border-radius:12px;border:0;font:inherit;font-weight:800;font-size:13.5px;white-space:nowrap;cursor:pointer;box-shadow:none}#spss-me .mrqs{background:#0f2744;color:#fff}#spss-me .mrqs[disabled]{opacity:.6;cursor:wait}#spss-me .mrqc{background:#e2e8f0;color:#0f2744}#spss-me .rw.mrw{display:block}#spss-me .mr1{display:flex;align-items:flex-start;gap:8px}#spss-me .mr1 .t{flex:1 1 auto;min-width:0;overflow-wrap:anywhere}#spss-me .mr1 .bg{margin-top:1px}#spss-me .mr2{display:flex;align-items:center;gap:6px;min-height:28px;margin-top:1px}#spss-me .mr2 .md{flex:0 0 auto;color:#64748b;white-space:nowrap}#spss-me .mr2 .mc{flex:1 1 auto;display:flex;justify-content:center;min-width:0}#spss-me .mr3{display:flex;align-items:center;flex-wrap:wrap;gap:6px 10px;margin-top:4px}#spss-me .mrw .mrqr{display:block;margin-top:4px}#spss-me .mrw .mrq{margin:0;min-height:30px;padding:3px 10px;gap:5px;border-radius:999px;font-size:12px;border-width:1.5px}#spss-me .mrw .mrq i{font-size:11px}#spss-me .mrw .mrqf{display:flex;margin-top:8px}#spss-me .mrqe{color:#b91c1c;font-size:12.5px;font-weight:700;margin:0;min-height:0}#spss-me .mrqe:empty{display:none}',
'#spss-blk{direction:rtl;font-family:Cairo,"Segoe UI",Tahoma,sans-serif;position:fixed;inset:0;background:rgba(15,23,42,.88);z-index:2147483602;display:flex;align-items:center;justify-content:center;padding:16px}#spss-blk .c{background:#fff;border-radius:16px;padding:22px;max-width:440px;text-align:center}#spss-blk a{display:inline-block;margin-top:12px;background:#0f2744;color:#fff;border-radius:10px;padding:9px 16px;font-weight:800;text-decoration:none}',
'.spss-polite{direction:rtl;background:#fff7ed;border:1px solid #fdba74;color:#7c2d12;border-radius:14px;padding:14px;font-weight:700;text-align:center}.spss-polite a{color:#0f2744}',
'#spss-lg,#spss-lg *{box-sizing:border-box}',
'#spss-lg{position:fixed;inset:0;z-index:2147483000;overflow:auto;direction:rtl;font-family:Cairo,"Segoe UI","Noto Sans Arabic",Tahoma,sans-serif;display:flex;padding:clamp(14px,4vw,40px) 14px;color:#1e293b;background:radial-gradient(1100px 600px at 110% -10%,rgba(233,196,106,.22),transparent 60%),radial-gradient(900px 600px at -10% 110%,rgba(56,130,220,.35),transparent 60%),linear-gradient(155deg,#081627 0%,#0f2744 45%,#1d4f86 100%)}',
'#spss-lg .bgx{position:fixed;inset:0;pointer-events:none;opacity:.5;background-image:radial-gradient(rgba(255,255,255,.09) 1px,transparent 1.4px);background-size:22px 22px;-webkit-mask-image:linear-gradient(180deg,#000,transparent 85%);mask-image:linear-gradient(180deg,#000,transparent 85%)}',
'#spss-lg .c{position:relative;margin:auto;width:100%;max-width:440px;background:rgba(255,255,255,.97);border:1px solid rgba(255,255,255,.6);border-radius:26px;padding:clamp(20px,5.5vw,32px);box-shadow:0 30px 60px -12px rgba(2,8,23,.55),0 0 0 1px rgba(15,39,68,.04);text-align:right;animation:spssUp .5s cubic-bezier(.2,.8,.2,1) both}',
'@supports ((-webkit-backdrop-filter:blur(1px)) or (backdrop-filter:blur(1px))){#spss-lg .c{background:rgba(255,255,255,.965);-webkit-backdrop-filter:blur(18px) saturate(1.3);backdrop-filter:blur(18px) saturate(1.3)}}',
'#spss-lg .hd{display:flex;align-items:center;gap:14px;margin:0 0 12px}#spss-lg .bn{min-width:0}#spss-lg .tg{margin:2px 0 0;color:#64748b;font-size:13.5px;font-weight:600;line-height:1.5}#spss-lg .chp{display:flex;flex-wrap:wrap;align-items:center;gap:6px 8px;margin:0 0 14px}#spss-lg .md{display:inline-flex;align-items:center;gap:6px;max-width:100%;font-size:12.5px;font-weight:700;color:#1e3a5f;background:#eef3fa;border:1px solid #dbe5f2;border-radius:999px;padding:3px 11px;line-height:1.5}#spss-lg .md b{font-weight:800;color:#0f2744}#spss-lg .md .dt{flex:none;width:7px;height:7px;border-radius:50%;background:#e9c46a;box-shadow:0 0 0 2px rgba(233,196,106,.3)}#spss-lg .lg{flex:none;width:60px;height:60px;border-radius:17px;display:grid;place-items:center;background:linear-gradient(145deg,#0f2744,#1d4f86);color:#e9c46a;box-shadow:0 10px 22px -6px rgba(15,39,68,.55)}#spss-lg .lg svg{width:28px;height:28px}',
'#spss-lg .kk{display:inline-block;font-size:12px;font-weight:800;color:#8a6a12;background:#fdf3d7;border-radius:999px;padding:3px 11px;line-height:1.5}#spss-lg h1{margin:0;font-size:clamp(26px,7.4vw,30px);line-height:1.2;font-weight:800;color:#0f2744;letter-spacing:0}',
'#spss-lg .wl{margin:0 0 18px;color:#475569;font-size:14.5px;line-height:1.75}',
'#spss-lg .q{margin:0 0 10px;font-size:13.5px;font-weight:800;color:#334155}',
'#spss-lg .rl{display:grid;gap:12px;margin:0}#spss-lg .rl button{display:flex;align-items:center;gap:14px;width:100%;margin:0;padding:14px 16px;min-height:76px;font:inherit;text-align:right;color:#0f2744;background:#fff;border:1.5px solid #dbe3ee;border-radius:18px;cursor:pointer;box-shadow:0 2px 6px rgba(15,39,68,.05);transition:border-color .18s,box-shadow .18s,transform .18s,background .18s}',
'#spss-lg .rl button:hover{border-color:#1d4f86;box-shadow:0 10px 24px -10px rgba(29,79,134,.45);transform:translateY(-2px)}#spss-lg .rl button:focus-visible,#spss-lg .bk:focus-visible,#spss-lg .eye:focus-visible,#spss-lg .go:focus-visible{outline:3px solid #93c5fd;outline-offset:2px}',
'#spss-lg .rl .ic{flex:none;width:50px;height:50px;border-radius:15px;display:grid;place-items:center}#spss-lg .rl .ic svg{width:27px;height:27px}#spss-lg .rl [data-r=s] .ic{background:#e0ecff;color:#1d4f86}#spss-lg .rl [data-r=t] .ic{background:#fdf3d7;color:#8a6a12}',
'#spss-lg .rl .tx{flex:1;min-width:0;display:flex;flex-direction:column;gap:2px}#spss-lg .rl b{font-size:17.5px;font-weight:800}#spss-lg .rl small{font-size:13px;color:#64748b;font-weight:600;line-height:1.5}#spss-lg .rl .ch{flex:none;color:#94a3b8;transition:transform .18s,color .18s}#spss-lg .rl .ch svg{width:20px;height:20px;display:block}#spss-lg .rl button:hover .ch{color:#1d4f86;transform:translateX(-3px)}',
'#spss-lg .rl button.on{border-color:#1d4f86;background:#f3f7ff}',
'#spss-lg .stp{animation:spssIn .32s ease both}#spss-lg .hide{display:none!important}#spss-lg form[hidden]{display:none}',
'#spss-lg .fh{display:flex;align-items:center;justify-content:space-between;gap:10px;margin:0 0 16px}#spss-lg .bk{display:inline-flex;align-items:center;gap:6px;margin:0;padding:7px 12px 7px 14px;min-height:38px;font:inherit;font-size:14px;font-weight:800;color:#0f2744;background:#eef2f7;border:0;border-radius:999px;cursor:pointer;transition:background .15s}#spss-lg .bk:hover{background:#e2e8f0}#spss-lg .bk svg{width:18px;height:18px}',
'#spss-lg .rc{display:inline-flex;align-items:center;gap:6px;font-size:13px;font-weight:800;border-radius:999px;padding:5px 12px;background:#e0ecff;color:#1d4f86}#spss-lg .rc.t{background:#fdf3d7;color:#8a6a12}#spss-lg .rc svg{width:16px;height:16px}',
'#spss-lg label{display:block;margin:0 0 8px;font-size:14.5px;font-weight:800;color:#1e293b}',
'#spss-lg .fld{position:relative}#spss-lg .fi{position:absolute;top:50%;right:14px;transform:translateY(-50%);color:#64748b;pointer-events:none;display:flex;transition:color .15s}#spss-lg .fi svg{width:22px;height:22px}',
'#spss-lg input{display:block;width:100%;margin:0;min-height:58px;padding:12px 50px;font:inherit;font-size:20px;font-weight:700;letter-spacing:.06em;color:#0f172a;background:#f8fafc;border:1.5px solid #cbd5e1;border-radius:16px;direction:ltr;text-align:center;box-shadow:none;transition:border-color .15s,box-shadow .15s,background .15s}',
'#spss-lg input:placeholder-shown{direction:rtl}#spss-lg input::placeholder{color:#94a3b8;font-weight:600;letter-spacing:0;font-size:16px}#spss-lg input:focus{outline:none;background:#fff;border-color:#1d4f86;box-shadow:0 0 0 4px rgba(29,79,134,.16)}#spss-lg .fld:focus-within .fi{color:#1d4f86}',
'#spss-lg .fld.bad input{border-color:#dc2626;background:#fff7f7}#spss-lg .fld.bad input:focus{box-shadow:0 0 0 4px rgba(220,38,38,.14)}#spss-lg .fld.bad .fi{color:#dc2626}',
'#spss-lg .eye{position:absolute;top:50%;left:8px;transform:translateY(-50%);width:42px;height:42px;margin:0;padding:0;display:grid;place-items:center;border:0;border-radius:12px;background:transparent;color:#64748b;cursor:pointer}#spss-lg .eye:hover{background:#eef2f7;color:#0f2744}#spss-lg .eye svg{width:22px;height:22px}#spss-lg .eye[hidden]{display:none}',
'#spss-lg .hn{margin:8px 2px 0;font-size:12.5px;color:#64748b;line-height:1.6}',
'#spss-lg .go{position:relative;display:flex;align-items:center;justify-content:center;gap:10px;width:100%;margin:18px 0 0;min-height:56px;padding:12px;font:inherit;font-size:17px;font-weight:800;color:#fff;background:linear-gradient(135deg,#0f2744,#1d4f86);border:0;border-radius:16px;cursor:pointer;box-shadow:0 12px 24px -10px rgba(15,39,68,.7);transition:transform .15s,box-shadow .15s,filter .15s}',
'#spss-lg .go:hover:not(:disabled){transform:translateY(-1px);filter:brightness(1.08);box-shadow:0 16px 28px -10px rgba(15,39,68,.75)}#spss-lg .go:active:not(:disabled){transform:translateY(0)}#spss-lg .go:disabled{cursor:wait;filter:saturate(.4) brightness(1.15);box-shadow:none}#spss-lg .go svg{width:20px;height:20px}',
'#spss-lg .sp{display:none;width:20px;height:20px;border-radius:50%;border:2.5px solid rgba(255,255,255,.35);border-top-color:#fff;animation:spssSp .8s linear infinite}#spss-lg .go.ld .sp{display:inline-block}#spss-lg .go.ld svg{display:none}',
'#spss-lg .er{display:flex;align-items:flex-start;gap:8px;margin:12px 0 0;padding:10px 12px;font-size:14px;font-weight:700;line-height:1.6;color:#991b1b;background:#fef2f2;border:1px solid #fecaca;border-radius:12px;animation:spssSh .35s ease}#spss-lg .er:empty{display:none}#spss-lg .er::before{content:"!";flex:none;width:20px;height:20px;margin-top:2px;border-radius:50%;background:#dc2626;color:#fff;font-size:13px;font-weight:900;line-height:20px;text-align:center}',
'#spss-lg .qr{display:flex;align-items:center;gap:14px;margin:22px 0 0;padding:14px 0 0;border-top:1px solid #e2e8f0;font-size:13px;color:#475569;line-height:1.6}#spss-lg .qr img{flex:none;width:76px;height:76px;display:block;margin:0;padding:5px;background:#fff;border:1px solid #e2e8f0;border-radius:12px}#spss-lg .qr b{display:block;color:#0f2744;font-size:13.5px}',
'#spss-lg .c:focus{outline:none}#spss-lg .ft{margin:14px 0 0;text-align:center;font-size:12px;color:#94a3b8}',
'@keyframes spssUp{from{opacity:0;transform:translateY(18px) scale(.985)}to{opacity:1;transform:none}}@keyframes spssIn{from{opacity:0;transform:translateX(-14px)}to{opacity:1;transform:none}}@keyframes spssSp{to{transform:rotate(360deg)}}@keyframes spssSh{0%,100%{transform:none}25%{transform:translateX(5px)}75%{transform:translateX(-5px)}}',
'@media (max-width:380px){#spss-lg .rl button{padding:12px;gap:12px}#spss-lg .rl .ic{width:44px;height:44px}#spss-lg .qr img{width:64px;height:64px}}',
'@media (prefers-reduced-motion:reduce){#spss-lg *,#spss-lg .c{animation:none!important;transition:none!important}#spss-lg .sp{animation:spssSp 1.6s linear infinite!important}}',
'#spss-dl{position:fixed;inset:0;z-index:2147483001;background:rgba(2,6,23,.72);display:flex;align-items:center;justify-content:center;padding:16px;direction:rtl;font-family:Cairo,"Segoe UI",Tahoma,sans-serif}',
'#spss-dl .c{background:#fff;color:#1e293b;border-radius:16px;padding:18px;max-width:420px;width:100%;box-sizing:border-box}#spss-dl h3{margin:0 0 8px;font-size:18px}#spss-dl p{margin:0 0 10px;font-size:14px;color:#475569;line-height:1.7}',
'#spss-dl .g2{display:grid;grid-template-columns:1fr 1fr;gap:8px}#spss-dl button{font:inherit;font-weight:800;font-size:15px;border:0;border-radius:12px;padding:11px 10px;color:#fff;background:#1d4f86;cursor:pointer}#spss-dl button.n{background:#64748b;width:100%;margin-top:10px}',
'#spss-ins{direction:rtl;text-align:right;font-family:Cairo,"Segoe UI","Noto Sans Arabic",Tahoma,sans-serif;position:fixed;inset:0;z-index:2147483605;display:flex;align-items:flex-end;justify-content:center;line-height:1.7;color:#0f2744}#spss-ins *{box-sizing:border-box}',
'#spss-ins .bd{position:absolute;inset:0;background:rgba(2,6,23,.55);animation:spssIn .25s ease both}',
'#spss-ins .sh{position:relative;width:100%;max-width:480px;max-height:92vh;overflow-y:auto;background:#fff;border-radius:24px 24px 0 0;padding:10px 20px calc(18px + env(safe-area-inset-bottom,0px));box-shadow:0 -18px 50px -12px rgba(2,6,23,.45);animation:spssSU .32s cubic-bezier(.2,.8,.2,1) both}',
'#spss-ins .sh:focus{outline:none}#spss-ins .gr{width:44px;height:5px;border-radius:9px;background:#cbd5e1;margin:0 auto 12px}',
'#spss-ins .hd{display:flex;align-items:center;gap:12px;margin:0 0 8px}#spss-ins .lg{flex:none;width:52px;height:52px;border-radius:15px;display:grid;place-items:center;background:linear-gradient(145deg,#0f2744,#1d4f86);color:#e9c46a;box-shadow:0 10px 22px -8px rgba(15,39,68,.6)}#spss-ins .lg svg{width:27px;height:27px}',
'#spss-ins .kk{display:inline-block;font-size:11.5px;font-weight:800;color:#8a6d1f;background:#fdf3d7;border-radius:99px;padding:1px 10px}#spss-ins h2{margin:2px 0 0;font-size:19px;font-weight:800;color:#0f2744;line-height:1.4}',
'#spss-ins .x{margin-inline-start:auto;flex:none;width:40px;height:40px;border:0;border-radius:12px;background:#f1f5f9;color:#334155;font-size:17px;cursor:pointer}',
'#spss-ins p{margin:0 0 12px;font-size:14.5px;color:#475569}#spss-ins .ok{color:#047857;font-weight:800}',
'#spss-ins ol{list-style:none;margin:0 0 14px;padding:0;display:grid;gap:8px}#spss-ins li{display:flex;align-items:center;gap:10px;background:#f8fafc;border:1px solid #e2e8f0;border-radius:14px;padding:9px 12px;font-size:14px;font-weight:700;color:#1e293b}',
'#spss-ins li .n{flex:none;width:26px;height:26px;border-radius:50%;background:#0f2744;color:#fff;display:grid;place-items:center;font-size:13px}#spss-ins li svg{flex:none;width:24px;height:24px;color:#2563eb}#spss-ins li b{color:#0f2744}',
'#spss-ins .lk{display:flex;gap:8px;margin:0 0 14px}#spss-ins .lk input{flex:1;min-width:0;font:inherit;font-size:13px;direction:ltr;text-align:left;border:1.5px solid #cbd5e1;border-radius:12px;padding:10px 12px;color:#0f2744;background:#f8fafc}',
'#spss-ins .bt{display:flex;gap:10px;flex-wrap:wrap}#spss-ins .bt button,#spss-ins .lk button,#spss-ins .bt a{font:inherit;font-weight:800;font-size:15px;border-radius:14px;padding:12px 16px;min-height:48px;cursor:pointer;border:0;text-decoration:none;display:inline-flex;align-items:center;justify-content:center;gap:6px}',
'#spss-ins .bt .p{flex:1 1 140px;color:#fff;background:linear-gradient(135deg,#0f2744,#1d4f86);box-shadow:0 10px 20px -10px rgba(15,39,68,.7)}#spss-ins .bt .s{flex:1 1 110px;color:#334155;background:#f1f5f9}#spss-ins .lk button{flex:none;color:#fff;background:#1d4f86}',
'#spss-ins button:focus-visible,#spss-ins a:focus-visible,#spss-ins input:focus-visible{outline:3px solid #e9c46a;outline-offset:2px}',
'@keyframes spssSU{from{transform:translateY(40px);opacity:0}to{transform:none;opacity:1}}',
'footer#spss-copy{display:block;margin:28px auto 0;padding:14px 16px calc(14px + env(safe-area-inset-bottom));text-align:center;font:500 12.5px/1.7 Cairo,"Segoe UI",Tahoma,sans-serif;color:#64748b;direction:rtl;clear:both}#spss-copy.in{margin:10px 0 0;padding:0;text-align:center;font-size:12px;color:inherit;opacity:.85;direction:rtl}#spss-me .cpy{margin:18px 0 4px;text-align:center;font-size:12px;color:#64748b}a.spss-li{color:inherit;font-weight:700;text-decoration:none;display:inline-flex;align-items:center;gap:4px;border-radius:4px}a.spss-li svg{flex:none;color:#0a66c2}#spss-copy.in a.spss-li svg{color:#70b5f9}a.spss-li:hover,a.spss-li:focus-visible{text-decoration:underline}a.spss-li:focus-visible{outline:2px solid #e9c46a;outline-offset:2px}#spss-lg .ft a.spss-li{color:#475569}a.spss-ab-l{color:inherit;font-weight:700;text-decoration:underline;text-underline-offset:3px}#spss-lg .ft a.spss-ab-l{color:#475569}#spss-me .nab,a.spss-tab{display:flex;align-items:center;gap:8px;margin:6px 8px 4px;padding:10px 12px;border-radius:12px;font-weight:700;font-size:14px;color:#0f2744;background:#f1f5f9;border:1px solid #e2e8f0;text-decoration:none;min-height:44px}#spss-me .nab:hover,a.spss-tab:hover{background:#e2e8f0}#spss-me .nab:focus-visible,a.spss-tab:focus-visible{outline:3px solid #e9c46a;outline-offset:2px}',
'@media (min-width:700px){#spss-ins{align-items:center}#spss-ins .sh{border-radius:24px;padding-bottom:20px}#spss-ins .gr{display:none}}',
'@media (prefers-reduced-motion:reduce){#spss-ins .sh,#spss-ins .bd{animation:none!important}}',
'#spss-me .nins{display:flex;align-items:center;gap:8px;width:calc(100% - 16px);margin:10px 8px 4px;font:inherit;font-weight:800;font-size:14px;color:#0f2744;background:#fdf3d7;border:1px solid #f1d58a;border-radius:12px;padding:10px 12px;cursor:pointer;text-align:right}#spss-me .nins svg{width:20px;height:20px;flex:none}',
'#spss-lg .lg img,#spss-ins .lg img{width:100%!important;height:100%!important;border-radius:inherit;display:block;object-fit:cover}#spss-lg .lg,#spss-ins .lg{overflow:hidden}#spss-me .nins img{flex:none}',
'body.spss-st #prof-btn,body.spss-st #tlogin{display:none!important}body.spss-auth #login{display:none!important}',
'.spss-hide{display:none!important}.spss-who{grid-column:1/-1;font-size:14px;font-weight:700;color:#0f2744;background:#e0f2fe;border:1px solid #7dd3fc;border-radius:10px;padding:8px 12px}',
'.dark .spss-who,html.dark .spss-who{background:#0c4a6e;color:#e0f2fe;border-color:#0369a1}.spss-slot{display:block;margin-top:6px;font-size:13.5px;font-weight:700}'].join('\n');
function addCss(){if(document.getElementById('spss-auth-css'))return;var s=document.createElement('style');s.id='spss-auth-css';s.textContent=CSS;document.head.appendChild(s);}
function post(o){return fetch(U,{method:'POST',body:new URLSearchParams(o)}).then(function(r){return r.text()}).then(function(t){t=String(t).trim();try{return JSON.parse(t)}catch(e){return {ok:0,err:t||'NET'};}});}
// update73: بيانات الطالب (asme): طلب واحد مشترك بين الجرس ولوحة «بياناتي»، ونسخة محلية تُعرض فوراً ثم تُحدَّث
var ME_P=null;
function meKey(){return 'spss_me_'+(ID&&ID.bac||'');}
function meCache(){var c=pj(lg(meKey()));return c&&c.r&&c.r.ok&&Date.now()-c.t<6*3600e3?c:null;}
// update74: الحضور من Firestore عند تفعيله لهذا الطالب (r.fs)، وإلا/عند أي خطأ تبقى بيانات الورقة كما هي
var FS_P=null;function meFs(r){if(!r||!r.ok||!r.fs||!r.att){FS_P=null;return r;}var q=FS_P||getJ({action:'asattfs',sbac:ID.bac});FS_P=null;return q.then(function(f){if(f&&f.ok&&f.list){var M={};f.list.forEach(function(d){M[d.type+'|'+d.num]=d.st;});
 ['lec','tp'].forEach(function(t){(r.att[t]||[]).forEach(function(x){var s=M[t+'|'+x.num];if(s==='present'||s==='pending')x.st='present';else if(s==='absent')x.st='rejected';});});r.attSrc='fs';}return r;},function(){return r;});}
function meGet(){if(ME_P)return ME_P;try{var c0=meCache();if(c0&&c0.r&&c0.r.fs)FS_P=getJ({action:'asattfs',sbac:ID.bac});}catch(e){}ME_P=getJ({action:'asme',sbac:ID.bac}).then(meFs).then(function(r){ME_P=null;if(r&&r.ok){try{ls(meKey(),JSON.stringify({t:Date.now(),r:r}));}catch(e){}}return r;},function(e){ME_P=null;throw e;});return ME_P;}
// أي فعل كتابة إلى الخادم (تسجيل حضور، تقييم، طلب…) يمسح النسخ المحلية فوراً كي لا تظهر علامة أو حضور قديم
var RD_ACT={course:1,aslist:1,asme:1,asnotes:1,askey:1,asrqlist:1,asrqmine:1,asadmin:1,asstudlist:1,asstats:1,asattstats:1,asmsglist:1,asroll:1,qzgate:1,qzstatus:1,lqstatus:1,tsver:1,checkkey:1,slide:1,monitor:1,stsum:1,qzlist:1,qzstats:1,asfind:1,ascnt:1,lecqzst:1};
function dataPurge(){try{Object.keys(localStorage).forEach(function(k){if(/^(spss_me_|spss_alc_|tp_c_)/.test(k))localStorage.removeItem(k);});}catch(e){}}
(function(){if(!window.fetch||window.__spssF)return;window.__spssF=1;var F0=window.fetch;window.fetch=function(u,o){try{var s=String(u&&u.url||u);if(/script\.google/.test(s)){var b=o&&o.body,t=s+'&'+(b?String(b):'');var m=t.match(/[?&]action=([a-z0-9_]+)/i)||t.match(/"action"\s*:\s*"([a-z0-9_]+)"/i);var a=m?m[1]:'';if(!RD_ACT[a]){dataPurge();var p=F0.apply(this,arguments);p.then(dataPurge,function(){});return p;}}}catch(e){}return F0.apply(this,arguments);};})();
function getJ(q){return fetch(U+'?'+new URLSearchParams(q).toString()+'&t='+Date.now()).then(function(r){return r.text()}).then(function(t){try{return JSON.parse(t)}catch(e){return {ok:0,err:'NET'};}});}
function goNext(){var n='';try{n=new URLSearchParams(location.search).get('next')||'';}catch(e){}
 var base=new URL(ROOT).pathname;if(n&&n.charAt(0)==='/'&&n.indexOf('//')!==0&&n.indexOf(base)===0){location.replace(n);return true;}return false;}
function clearAll(){purge(true);dataPurge();try{Object.keys(localStorage).forEach(function(k){if(k.indexOf('spss_alc_')===0)localStorage.removeItem(k);});}catch(e){}['spss_id','as_bac'].forEach(function(k){ls(k,null)});['spss_tkey','spss_tstu','dk-prof','as_tkey','dk-open','tp-slide'].forEach(function(k){ss(k,null)});try{localStorage.removeItem('dk-prof')}catch(e){}}
function logout(){if(navigator.onLine===false){alert('الخروج الآمن يحتاج الاتصال بالإنترنت.\nتبقى جلستك على هذا الجهاز لقراءة الدروس المحمّلة؛ أعد المحاولة عند عودة الاتصال.');return;}appBadge(0);var pt=lg('spss_push_tok');if(pt){try{post({action:'aspushunreg',token:pt}).catch(function(){});}catch(e){}['spss_push_tok','spss_push_on','spss_push_who','spss_push_at'].forEach(function(k){ls(k,null);});}clearAll();location.href=ROOT+'index.html';}
function dlg(h,setup){var o=document.getElementById('spss-dl');if(o)o.remove();var w=document.createElement('div');w.id='spss-dl';w.innerHTML='<div class="c">'+h+'</div>';
 (document.fullscreenElement||document.body).appendChild(w);w.addEventListener('click',function(e){if(e.target===w)w.remove();});setup&&setup(w);return w;}
function toStudent(){dlg('<h3>🧪 الدخول كطالب (تجربة)</h3><p>اختر الملف: تتصفح المنصة كطالب من هذا التخصص/الفوج برقم تجريبي، والتسجيل والتقييم يمرّان بالخادم الحقيقي دون المساس بالقوائم (نتائج تجريبية تُمسح بزر).</p><div class="g2">'+
  Object.keys(PROFS).map(function(k){return '<button type="button" data-p="'+k+'">'+PROFS[k]+'</button>';}).join('')+'</div><div class="er" style="color:#b91c1c;font-weight:700;margin-top:8px"></div><button type="button" class="n">إلغاء</button>',function(w){
  w.querySelector('.n').onclick=function(){w.remove();};
  Array.prototype.forEach.call(w.querySelectorAll('[data-p]'),function(b){b.onclick=function(){var p=b.getAttribute('data-p'),er=w.querySelector('.er');er.textContent='… جارٍ التفعيل';
   post({action:'astu',op:'on',prof:p,key:ID.key}).then(function(r){if(!r.ok){er.textContent=r.err==='BAD_KEY'?'الرمز السري غير صحيح (أعد الدخول كأستاذ).':'تعذّر: '+(r.err||'');return;}
    purge(true);ss('spss_tstu',JSON.stringify({bac:r.bac,prof:p,nom:r.who.nom,prenom:r.who.prenom,sp:r.who.sp,grp:r.who.grp,t:Date.now()}));ss('dk-prof',null);ls('as_bac',r.bac);location.reload();});};});});}
function toTeacher(){purge(true);ls('as_bac',null);ss('spss_tstu',null);location.reload();}
function cleanT(btn){if(!confirm('حذف كل بيانات «الأستاذ كطالب» (الحضور، التقييمات، السجلات) من ورقة Google وإلغاء تفعيل الأرقام التجريبية؟'))return;btn.disabled=true;
 post({action:'astu',op:'off',key:ID.key}).then(function(r){btn.disabled=false;if(!r.ok){alert('تعذّر: '+(r.err||''));return;}var d=r.deleted||{},n=0;for(var k in d)n+=d[k];alert('✅ تم الحذف: '+n+' سطراً تجريبياً.');});}
function abH(){var b=document.getElementById('spss-ub');if(!b)return;try{var cs=getComputedStyle(document.body),px=function(v){return parseFloat(v)||0;};
 b.style.marginTop=-(px(cs.paddingTop)+px(cs.marginTop))+'px';b.style.marginRight=-(px(cs.paddingRight)+px(cs.marginRight))+'px';b.style.marginLeft=-(px(cs.paddingLeft)+px(cs.marginLeft))+'px';b.style.marginBottom=(cs.display==='flex'||cs.display==='grid')?'0':px(cs.paddingTop)+'px';
 b.style.width='calc(100% + '+(px(cs.paddingLeft)+px(cs.paddingRight)+px(cs.marginLeft)+px(cs.marginRight))+'px)';}catch(e){}
 document.documentElement.style.setProperty('--spss-abh',Math.ceil(b.getBoundingClientRect().height)+'px');}
function instGone(){return isSA()||lg('spss_inst')==='1';}
var HAM='<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" aria-hidden="true" focusable="false"><path d="M4 7h16M4 12h16M4 17h16"/></svg>';
var BELL='<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><path d="M6 8a6 6 0 1 1 12 0c0 7 3 9 3 9H3s3-2 3-9"/><path d="M10.3 21a1.94 1.94 0 0 0 3.4 0"/></svg>';
function bar(){if(!ID||document.getElementById('spss-ub'))return;var b=document.createElement('header');b.id='spss-ub';b.setAttribute('data-role',ID.role);b.setAttribute('role','banner');
 if(ID.role==='tstu')b.className='tstu';
 var bd=ID.role==='teacher'?'الأستاذ':(ID.role==='tstu'?'طالب تجريبي':(ID.prenom||ID.nom||'طالب'));
 b.innerHTML='<a class="br" href="'+ROOT+'index.html" aria-label="'+esc(APP_NAME)+': الصفحة الرئيسية"><img src="'+ROOT+'icons/logo-128.png?v=3" alt="" width="34" height="34" decoding="async"><span class="nm">'+esc(APP_NAME)+'</span></a><span class="sp"></span>'+
  '<span class="bdg" title="'+esc(bd)+'">'+esc(bd)+'</span><a class="bell" href="'+ROOT+'alerts.html" aria-label="التنبيهات" title="التنبيهات"'+(PAGE==='alerts'?' aria-current="page"':'')+'>'+BELL+'<em class="cnt" aria-hidden="true"></em></a><button type="button" class="ham" data-x="menu" aria-label="القائمة" aria-haspopup="dialog" aria-controls="spss-mn" aria-expanded="false" title="القائمة">'+HAM+'</button>';
 b.addEventListener('click',function(e){var x=e.target.closest('[data-x]');if(!x)return;mnOpen(x);});
 document.body.insertBefore(b,document.body.firstChild);
 document.documentElement.classList.add('spss-ab'); if(PAGE==='teacher')document.documentElement.classList.add('spss-abt');
 if(PAGE==='teacher'&&ID.role==='teacher')document.documentElement.classList.add('spss-abtp');
 if(ID.role==='teacher')rqWatch();
 alInit();
 abH();addEventListener('resize',abH);}
var TPT=[['open','🔓','الفتح والغلق'],['sched','🗓️','الجدولة'],['time','⏱️','الوقت وعدد الأسئلة'],['ex','🎓','التخصصات المعنية'],['stats','📈','الإحصائيات والتنبيهات'],['attst','📊','إحصائيات الحضور'],['roll','📝','النداء'],['rq','📥','طلبات المراجعة'],['cancel','🚫','إلغاء النتائج'],['add','➕','إضافة طالب'],['alcfg','⚙️','إعدادات التنبيهات'],['bank','🗃️','بنك الأسئلة']];
function tpCur(){var h=(location.hash||'').slice(1);if(TPT.some(function(x){return x[0]===h;}))return h;var t=null;try{t=sessionStorage.getItem('as_ttab');}catch(e){}return t||'open';}
function rqN(){var v=String(sg('spss_rqn')||'').split('|');return {n:Number(v[0])||0,t:Number(v[1])||0};}
function tpBadge(k){var e=document.getElementById('bd-'+k);if(e&&PAGE==='teacher'){var c=/\bw\b/.test(e.className)?'w':(/\bo\b/.test(e.className)?'o':'');return {n:e.textContent.trim(),c:c};}
 if(k==='rq'){var r=rqN();return {n:r.n?String(r.n):'',c:r.n?'w':''};}return {n:'',c:''};}
function rqSet(n){n=Number(n)||0;var o=rqN();ss('spss_rqn',n+'|'+Date.now());if(PAGE==='teacher'&&AL.list&&AL.list.length!==n&&o.t)alLoad(true);}
function rqWatch(){if(PAGE==='teacher'){var e=document.getElementById('bd-rq');if(!e)return;var f=function(){rqSet(parseInt(e.textContent,10)||0);};if(e.textContent.trim())f();try{new MutationObserver(f).observe(e,{childList:true,characterData:true,subtree:true});}catch(x){}return;}
 /* update69: خارج اللوحة يأتي العدد من alLoad (asrqlist) */}
// ===== update69: التنبيهات (الجرس، صفحة التنبيهات، شارة أيقونة التطبيق) =====
// المصادر (قراءة فقط، دون أي كتابة في الورقة): الطالب ← asme (تنبيهات الأستاذ، التقييمات المفتوحة، تسجيل الحضور المفتوح، نتائج طلبات المراجعة)؛ الأستاذ ← asrqlist (طلبات المراجعة المعلّقة).
// حالة القراءة محلية في هذا الجهاز لكل رقم بكالوريا (أو للأستاذ).
var AL={list:null,busy:false};
function alWho(){return ID?(ID.role==='teacher'?'T':String(ID.bac||'')):'';}
function alMap(k){var o=pj(lg(k+alWho()));return o&&typeof o==='object'?o:{};}
function alPut(k,o){ls(k+alWho(),JSON.stringify(o));}
function alTs(t){var m=/^(\d{2})\/(\d{2})\/(\d{4})(?:\s+(\d{2}):(\d{2}))?/.exec(String(t||''));return m?new Date(+m[3],+m[2]-1,+m[1],+(m[4]||0),+(m[5]||0)).getTime():0;}
function alAgo(ts){if(!ts)return '';var d=new Date(ts),p=function(n){return (n<10?'0':'')+n;};return p(d.getDate())+'/'+p(d.getMonth()+1)+'/'+d.getFullYear()+' '+p(d.getHours())+':'+p(d.getMinutes());}
function alBuild(r){var out=[],AS=ROOT+'assessment/index.html',C=r.alc||{},on=function(k){return !(C[k]&&C[k].b===0);};
 if(ID.role==='teacher'){if(!on('trq'))return out;(r.rows||[]).filter(function(x){return x.st==='pending';}).forEach(function(x){
   out.push({id:'trq:'+x.id,ic:'📥',urg:1,ttl:'طلب مراجعة حضور'+(x.test?' (اختبار)':''),body:esc(((x.nom||'')+' '+(x.prenom||'')).trim())+(x.g?' · '+esc(x.g):'')+' · '+(x.type==='tp'?'التطبيق ':'المحاضرة ')+esc(x.num)+(x.note?' · «'+esc(x.note)+'»':''),ts:Number(x.ts)||alTs(x.t),href:ROOT+'assessment/teacher/#rq',lb:'فتح طلبات المراجعة'});});
  return out;}
 var mk=r.marks||{},its=(mk.lec||[]).concat(mk.tp||[]);
 its.forEach(function(o){if(o.st!=='open')return;
  if(o.rem&&on('rem'))out.push({id:'rem:'+o.id+':'+o.rem,ic:'🔔',urg:1,ttl:'تنبيه من الأستاذ',body:'لم تُجرِ بعد <b>'+esc(o.title)+'</b>'+(o.topic?' ('+esc(o.topic)+')':'')+'. التقييم مفتوح الآن، أجره قبل غلقه.',ts:alTs(o.rem),href:AS+'#'+encodeURIComponent(o.id),lb:'الذهاب إلى التقييم الآن'});
  else if(o.go&&on('open'))out.push({id:'open:'+o.id,ic:'📝',ttl:'تقييم مفتوح',body:'<b>'+esc(o.title)+'</b>'+(o.topic?' ('+esc(o.topic)+')':'')+' مفتوح الآن ولم تُجره بعد.',href:AS+'#'+encodeURIComponent(o.id),lb:'اجتياز التقييم'});});
 if(on('att'))(r.openNow||[]).forEach(function(sn){out.push({id:'att:'+sn+':'+new Date().toDateString(),ic:'🟢',ttl:'تسجيل الحضور مفتوح',body:'التسجيل في الحضور مفتوح الآن: <b>'+esc(sn)+'</b>.',x:'me',g:'a',lb:'تتبع الحضور'});});
 if(on('rq'))(r.rq||[]).forEach(function(q){if(q.st!=='accepted'&&q.st!=='rejected')return;var ok=q.st==='accepted';
  out.push({id:'rq:'+q.id+':'+q.st,ic:ok?'✅':'❌',ttl:ok?'قُبل طلب مراجعة الحضور':'رُفض طلب مراجعة الحضور',body:'طلبك الخاص ب'+(q.type==='tp'?'التطبيق ':'المحاضرة ')+esc(q.num)+(q.s?' ('+esc(q.s)+')':'')+(ok?' قُبل، وسُجّلت حاضراً.':' رُفض.')+(q.reply?' ردّ الأستاذ: «'+esc(q.reply)+'»':''),ts:alTs(q.dt),x:'me',g:'a',lb:'تتبع الحضور'});});
 if(on('msg'))(r.msg||[]).forEach(function(m){var l=String(m.link||''),me=/^me:([malp])$/.exec(l);
  out.push({id:'msg:'+m.id,ic:'✉️',urg:1,ttl:'رسالة من الأستاذ',body:'<b>'+esc(m.title)+'</b>: '+esc(m.body),ts:Number(m.ts)||alTs(m.t),href:me?'':ROOT+(l||'alerts.html'),x:me?'me':'',g:me?me[1]:'',lb:me?({m:'تتبع علاماتي',a:'تتبع الحضور',l:'توقيت المحاضرات',p:'توقيت التطبيقات'}[me[1]]):(l?(/assessment\/index/.test(l)?'الذهاب إلى التقييم':'فتح الصفحة'):'')});});
 return out;}
function alFix(list){var f=alMap('spss_alf_'),r=alMap('spss_alr_'),now=Date.now(),f2={},r2={};
 list.forEach(function(a){f2[a.id]=f[a.id]||now;if(!a.ts)a.ts=f2[a.id];if(r[a.id])r2[a.id]=r[a.id];a.read=!!r[a.id];});
 alPut('spss_alf_',f2);alPut('spss_alr_',r2);list.sort(function(a,b){return (b.ts-a.ts)||((b.urg?1:0)-(a.urg?1:0));});return list;}
function alUnread(){return AL.list?AL.list.filter(function(a){return !a.read;}).length:0;}
function appBadge(n){try{if('setAppBadge' in navigator){(n?navigator.setAppBadge(n):navigator.clearAppBadge()).catch(function(){});}}catch(e){}
 try{var c=navigator.serviceWorker&&navigator.serviceWorker.controller;if(c)c.postMessage({t:'badge',n:n||0});}catch(e){}}
function alPaint(){var n=alUnread(),b=document.querySelector('#spss-ub .bell');
 if(b){b.querySelector('.cnt').textContent=n?(n>99?'99+':String(n)):'';b.setAttribute('aria-label','التنبيهات'+(n?' ('+n+' غير مقروءة)':''));b.title=b.getAttribute('aria-label');}
 appBadge(n);if(PAGE==='alerts')alRender();else alToast();}
function alLoad(force){if(!ID||AL.busy)return;var who=alWho();if(!who)return;var ck='spss_alc_'+who,hit=pj(lg(ck));
 if(hit&&hit.l&&!AL.list){AL.list=alFix(hit.l);alPaint();}
 if(!force&&hit&&Date.now()-hit.t<120000&&hit.l)return;
 AL.busy=true;var q=ID.role==='teacher'?post({action:'asrqlist',key:ID.key}):meGet();
 q.then(function(r){AL.busy=false;if(!r||!r.ok){if(PAGE==='alerts'&&!AL.list){AL.err=1;alRender();}return;}
  if(ID.role==='teacher')ss('spss_rqn',(r.pending||0)+'|'+Date.now());
  var l=alBuild(r);ls(ck,JSON.stringify({t:Date.now(),l:l}));AL.err=0;AL.list=alFix(l);alPaint();}).catch(function(){AL.busy=false;});}
function alInit(){window.__spssAL=1;var o=document.getElementById('as-remind');if(o)o.remove();alLoad(false);
 document.addEventListener('visibilitychange',function(){if(document.visibilityState==='visible'){var h=pj(lg('spss_alc_'+alWho()));if(!h||Date.now()-h.t>120000)alLoad(true);}});}
function alRead(ids){var r=alMap('spss_alr_'),now=Date.now();ids.forEach(function(i){r[i]=now;});alPut('spss_alr_',r);(AL.list||[]).forEach(function(a){if(r[a.id])a.read=true;});alPaint();}
function alGo(a){alRead([a.id]);if(a.href){location.href=a.href;return;}if(a.x==='me'){meTab=a.g||meTab;meOpen(document.querySelector('#spss-ub .ham'));if(!meDesk())meDrawer(false,true);}}
function alToast(){var t=document.getElementById('spss-at');if(t)t.remove();if(PAGE==='teacher'||PAGE==='assess')return;
 var a=(AL.list||[]).filter(function(x){return x.urg&&!x.read&&!sg('spss_alt_'+x.id);})[0];if(!a)return;var ub=document.getElementById('spss-ub');if(!ub)return;
 t=document.createElement('div');t.id='spss-at';t.setAttribute('role','status');
 t.innerHTML='<span aria-hidden="true">'+a.ic+'</span><span class="tx"><b>'+esc(a.ttl)+':</b> '+a.body+'</span><a class="go" href="'+(a.href||ROOT+'alerts.html')+'">'+(a.urg&&a.href&&/assessment\/index/.test(a.href)?'أجره الآن':'فتح')+'</a><button type="button" class="x" aria-label="إخفاء التنبيه" title="إخفاء">✕</button>';
 ub.parentNode.insertBefore(t,ub.nextSibling);
 t.querySelector('.go').onclick=function(e){if(!a.href){e.preventDefault();}alGo(a);};
 t.querySelector('.x').onclick=function(){ss('spss_alt_'+a.id,'1');t.remove();};}
function alRender(){var c=document.getElementById('spss-alp');if(!c)return;
 if(!ID){c.innerHTML='<p class="emp">سجّل الدخول أولاً لعرض تنبيهاتك. <a href="'+ROOT+'index.html">الدخول إلى المنصة</a></p>';return;}
 if(!AL.list){c.innerHTML='<p class="emp">'+(AL.err?'تعذّر جلب التنبيهات الآن. أعد المحاولة بعد قليل.':'جارٍ تحميل التنبيهات…')+'</p>';return;}
 var n=alUnread(),L=AL.list;
 var h='<div class="tb"><p class="sm" aria-live="polite">'+(L.length?(n?'<b>'+n+'</b> غير مقروءة من '+L.length:'كل التنبيهات مقروءة ('+L.length+')'):'')+'</p><button type="button" class="b2" data-a="rf">🔄 تحديث</button>'+(n?'<button type="button" class="b2" data-a="all">✔️ تعليم الكل كمقروء</button>':'')+'</div>';
 if(!L.length)h+='<p class="emp">✨ لا توجد تنبيهات حالياً.<br><small>'+(ID.role==='teacher'?'تظهر هنا طلبات مراجعة الحضور المعلّقة.':'تظهر هنا تنبيهات الأستاذ، والتقييمات المفتوحة، وتسجيل الحضور المفتوح، ونتائج طلبات المراجعة.')+'</small></p>';
 h+='<ul class="al">'+L.map(function(a,i){return '<li class="it'+(a.read?'':' un')+(a.urg?' urg':'')+'" data-i="'+i+'"><div class="hd"><span class="ic" aria-hidden="true">'+a.ic+'</span><b>'+esc(a.ttl)+'</b>'+(a.read?'':'<span class="nw">جديد</span>')+'<time>'+alAgo(a.ts)+'</time></div><p>'+a.body+'</p><div class="ac">'+
  (a.lb?'<a class="go" href="'+(a.href||'#')+'" data-a="go">'+esc(a.lb)+'</a>':'')+(a.read?'':'<button type="button" class="b2" data-a="rd">تعليم كمقروء</button>')+'</div></li>';}).join('')+'</ul>';
 c.innerHTML=h;}
function alPage(){var c=document.getElementById('spss-alp');if(!c)return;puCard();alRender();
 c.addEventListener('click',function(e){var b=e.target.closest('[data-a]');if(!b)return;var k=b.getAttribute('data-a'),li=b.closest('li'),a=li&&AL.list[+li.getAttribute('data-i')];
  if(k==='rf'){AL.list=AL.list||null;alLoad(true);return;}
  if(k==='all'){alRead(AL.list.map(function(x){return x.id;}));return;}
  if(k==='rd'&&a){alRead([a.id]);return;}
  if(k==='go'&&a){e.preventDefault();alGo(a);}});}
/* update70: إشعارات الهاتف (Firebase Cloud Messaging للتوصيل فقط؛ الخلفية تبقى Apps Script والورقة).
   الإذن يُطلب عند النقر فقط. الرمز يُسجَّل في الخادم (aspushreg) ويُجدَّد عند الفتح إن كان الإذن ممنوحاً. */
var FB={apiKey:'AIzaSyCCa57qR77IIZ4sZPpBHnUIH6jkMcth1lo',authDomain:'boussala-taalim.firebaseapp.com',projectId:'boussala-taalim',storageBucket:'boussala-taalim.firebasestorage.app',messagingSenderId:'378682963978',appId:'1:378682963978:web:d2f693d849dbdae4a787f3'};
var FB_VAPID='BCuvhlSr8lMgpQ7oRUbXfL3TNFw9BOsR_H2jzX8EO3L1foW4zijsN9LxBlM2ArGdtrj5O3R0Bu5UlcjSh70hZCQ',FB_V='12.4.0';
var PU={busy:0,msg:'',sdk:null};
function puOk(){try{return location.protocol==='https:'&&'serviceWorker' in navigator&&'PushManager' in window&&'Notification' in window;}catch(e){return false;}}
function puWho(){return ID?(ID.role==='teacher'?'teacher':String(ID.bac||'')):'';}
function puAuth(){return ID.role==='teacher'?{key:ID.key}:{sbac:ID.bac};}
function puState(){if(!puOk())return IOS&&!isSA()?'ios':'na';var p=Notification.permission;if(p==='denied')return 'denied';
 if(p==='granted'&&lg('spss_push_on')==='1'&&lg('spss_push_tok'))return 'on';return 'off';}
function puJs(src){return new Promise(function(ok,no){var s=document.createElement('script');s.src=src;s.async=true;s.onload=ok;s.onerror=function(){no(new Error('SDK'));};document.head.appendChild(s);});}
function puSdk(){if(PU.sdk)return PU.sdk;var b='https://www.gstatic.com/firebasejs/'+FB_V+'/';
 PU.sdk=(window.firebase&&window.firebase.messaging?Promise.resolve():puJs(b+'firebase-app-compat.js').then(function(){return puJs(b+'firebase-messaging-compat.js');})).then(function(){
  var f=window.firebase;if(!f.apps.length)f.initializeApp(FB);return Promise.resolve(f.messaging.isSupported?f.messaging.isSupported():true).then(function(ok){if(!ok)throw new Error('NA');return f.messaging();});});
 PU.sdk.catch(function(){PU.sdk=null;});return PU.sdk;}
function puReg(){var sc=new URL(ROOT).pathname;return navigator.serviceWorker.register(ROOT+'sw.js',{scope:sc}).then(function(){return navigator.serviceWorker.ready;});}
function puPlat(){return (IOS?'iOS':(ANDR?'Android':(/Windows/.test(UA)?'Windows':(/Mac/.test(UA)?'Mac':(/Linux/.test(UA)?'Linux':'?')))))+' · '+(/Edg\//.test(UA)?'Edge':(/SamsungBrowser/.test(UA)?'Samsung':(/Firefox\//.test(UA)?'Firefox':(/Chrome\//.test(UA)?'Chrome':(/Safari\//.test(UA)?'Safari':'?')))))+(isSA()?' · app':'');}
function puToken(){return Promise.all([puSdk(),puReg()]).then(function(x){return x[0].getToken({vapidKey:FB_VAPID,serviceWorkerRegistration:x[1]});});}
function puSave(tok){var o=puAuth();o.action='aspushreg';o.token=tok;o.plat=puPlat();
 return post(o).then(function(r){if(!r||!r.ok)throw new Error((r&&r.err)||'NET');ls('spss_push_off_u',null);ls('spss_push_tok',tok);ls('spss_push_on','1');ls('spss_push_who',puWho());ls('spss_push_at',String(Date.now()));return r;});}
function puEnable(){if(PU.busy)return Promise.resolve();var s=puState();if(s!=='off'){puPaint();return Promise.resolve();}
 PU.busy=1;PU.msg='';puPaint();
 return Notification.requestPermission().then(function(p){if(p!=='granted')throw new Error(p==='denied'?'DENIED':'DISMISSED');return puToken();})
  .then(function(tok){if(!tok)throw new Error('NO_TOKEN');return puSave(tok);})
  .then(function(){PU.busy=0;PU.msg='✅ تم التفعيل. ستصلك تنبيهات المنصة على هذا الجهاز.';puPaint();})
  .catch(function(e){PU.busy=0;var m=String(e&&e.message||e);
   PU.msg=m==='DENIED'?'':(m==='DISMISSED'?'لم تُمنح الموافقة. أعد المحاولة واختر «سماح».':(m==='NA'?'':(/push service|Registration failed|AbortError|not supported/i.test(m)?'هذا المتصفح لا يوفّر خدمة الإشعارات على هذا الجهاز. جرّب Chrome (Android/الحاسوب) أو Safari بعد تثبيت المنصة (iPhone).':'تعذّر التفعيل الآن ('+esc(m.slice(0,60))+'). أعد المحاولة بعد قليل.')));
   if(m==='NA')ls('spss_push_na','1');puPaint();});}
function puDisable(){if(PU.busy)return;var tok=lg('spss_push_tok');PU.busy=1;puPaint();
 var done=function(){ls('spss_push_off_u','1');ls('spss_push_tok',null);ls('spss_push_on',null);ls('spss_push_who',null);ls('spss_push_at',null);PU.busy=0;PU.msg='تم إيقاف الإشعارات على هذا الجهاز.';puPaint();};
 Promise.all([tok?post({action:'aspushunreg',token:tok}).catch(function(){}):0,puSdk().then(function(m){return m.deleteToken();}).catch(function(){})]).then(done,done);}
function puTest(btn){var tok=lg('spss_push_tok');if(!tok)return;btn.disabled=true;var o=puAuth();o.action='aspushme';o.token=tok;
 post(o).then(function(r){btn.disabled=false;PU.msg=r&&r.ok&&r.sent?'📨 أُرسل إشعار تجريبي، سيظهر خلال ثوانٍ.':(r&&r.err==='TOO_SOON'?'انتظر دقيقة قبل تجربة أخرى.':(r&&r.err==='NOT_REG'?'أعد تفعيل الإشعارات على هذا الجهاز.':'تعذّر الإرسال الآن، والخدمة قيد الإعداد. أعد المحاولة لاحقاً.'));
  if(r&&r.err==='NOT_REG'){ls('spss_push_on',null);}puPaint();}).catch(function(){btn.disabled=false;});}
// عند الفتح: تجديد الرمز إن تغيّر أو مرّت 3 أيام أو تغيّر المستخدم؛ وإن سُحب الإذن يُلغى التسجيل
function puRefresh(){if(!ID||!puOk())return;var tok=lg('spss_push_tok');
 if(lg('spss_push_on')!=='1'||!tok){if(Notification.permission==='granted'&&lg('spss_push_off_u')!=='1')puToken().then(function(t){if(t)return puSave(t).then(function(){puPaint();pnStrip();});}).catch(function(){});return;}
 if(Notification.permission!=='granted'){if(tok)post({action:'aspushunreg',token:tok}).catch(function(){});ls('spss_push_on',null);ls('spss_push_tok',null);return;}
 var old=Date.now()-Number(lg('spss_push_at')||0)>3*864e5,who=lg('spss_push_who')!==puWho();
 puToken().then(function(t){if(t&&(t!==tok||old||who))return puSave(t);}).catch(function(){});}
function puMsg(){if(!('serviceWorker' in navigator))return;navigator.serviceWorker.addEventListener('message',function(e){var d=e.data||{};if(d.t!=='push')return;
 if(ID)alLoad(true);var t=document.getElementById('spss-at');if(t)t.remove();var ub=document.getElementById('spss-ub');if(!ub||PAGE==='alerts')return;
 t=document.createElement('div');t.id='spss-at';t.setAttribute('role','status');
 t.innerHTML='<span class="tx"><b>'+esc(d.title||'')+'</b> '+esc(d.body||'')+'</span><a class="go" href="'+esc(d.url||ROOT+'alerts.html')+'">فتح</a><button type="button" class="x" aria-label="إخفاء التنبيه" title="إخفاء">✕</button>';
 ub.parentNode.insertBefore(t,ub.nextSibling);t.querySelector('.x').onclick=function(){t.remove();};});}
function puPaint(){var c=document.getElementById('spss-push');if(c)c.innerHTML=puHtml();var m=document.querySelector('#spss-mn [data-x="push"] span:last-child');if(m)m.textContent=puLabel();}
function puLabel(){var s=puState();return s==='on'?'الإشعارات مفعّلة على هاتفي':'تفعيل الإشعارات على هاتفي';}
function puHtml(){var s=PU.busy?'busy':puState(),h='',msg=PU.msg?'<p class="pm" role="status">'+PU.msg+'</p>':'';
 if(lg('spss_push_na')==='1'&&s==='off')s='na';
 if(s==='busy')h='<p class="st">⏳ جارٍ المعالجة… إن ظهرت نافذة من المتصفح فاختر «سماح».</p>';
 else if(s==='on')h='<p class="st on">✅ <b>الإشعارات مفعّلة</b> على هذا الجهاز. تصلك تنبيهات المنصة حتى وهي مغلقة.</p><div class="ac"><button type="button" class="b2" data-p="test">📨 إرسال إشعار تجريبي</button><button type="button" class="b2" data-p="off">🔕 إيقاف الإشعارات</button></div>';
 else if(s==='denied')h='<p class="st no">⛔ <b>الإشعارات مرفوضة</b> لهذا الموقع في إعدادات المتصفح.</p><p class="hi">لتفعيلها: افتح إعدادات الموقع (رمز القفل 🔒 بجانب العنوان) ← الإشعارات ← سماح، ثم أعد تحميل الصفحة.</p>';
 else if(s==='ios')h='<p class="st">📱 <b>على iPhone وiPad</b> تعمل الإشعارات بعد تثبيت المنصة على الشاشة الرئيسية (iOS 16.4 أو أحدث).</p><p class="hi">في Safari: زر المشاركة ⬆️ ← «إضافة إلى الشاشة الرئيسية»، ثم افتح المنصة من أيقونتها وعُد إلى هذه الصفحة.</p><div class="ac"><button type="button" class="b2" data-p="inst">طريقة التثبيت</button></div>';
 else if(s==='na')h='<p class="st no">ℹ️ <b>الإشعارات غير مدعومة</b> في هذا المتصفح.</p><p class="hi">'+(INAPP?'افتح المنصة في Chrome أو Safari بدل متصفح التطبيق.':'جرّب Chrome على Android أو الحاسوب، أو Safari على iPhone بعد تثبيت المنصة.')+'</p>';
 else h='<p class="st">احصل على تنبيهات الأستاذ والتقييمات وطلبات المراجعة مباشرة على هاتفك، حتى والمنصة مغلقة.</p><div class="ac"><button type="button" class="go" data-p="on">🔔 تفعيل الإشعارات على هاتفي</button></div>';
 return '<h2>إشعارات الهاتف</h2>'+h+msg;}
function puCard(){var a=document.getElementById('spss-alp');if(!a||document.getElementById('spss-push'))return;var c=document.createElement('section');c.id='spss-push';c.setAttribute('aria-label','إشعارات الهاتف');
 a.parentNode.insertBefore(c,a);c.innerHTML=puHtml();
 c.addEventListener('click',function(e){var b=e.target.closest('[data-p]');if(!b)return;var k=b.getAttribute('data-p');
  if(k==='on')puEnable();else if(k==='off')puDisable();else if(k==='test')puTest(b);else if(k==='inst')instOpen(b);});
 if(location.hash==='#push')setTimeout(function(){try{c.scrollIntoView({block:'start'});}catch(e){}},50);}
function mnItem(x,ic,lb,cls,href,cur){var c='it'+(cls?' '+cls:'');var i='<span class="ic" aria-hidden="true">'+ic+'</span><span>'+lb+'</span>';
 return href?'<a class="'+c+'" href="'+href+'"'+(cur?' aria-current="page"':'')+'>'+i+'</a>':'<button type="button" class="'+c+'" data-x="'+x+'">'+i+'</button>';}
function mnBuild(){var r=ID.role,h='',home=ROOT+'index.html';
 var insIc='<img src="'+ROOT+'icons/logo-128.png?v=3" alt="" width="24" height="24">';
 var who=r==='teacher'?'<small>وضع الأستاذ</small>':(r==='tstu'?'<small><span class="tg">وضع الأستاذ كطالب</span>'+esc(PROFS[ID.prof]||ID.sp||'')+' · رقم تجريبي <bdi dir="ltr">'+esc(ID.bac)+'</bdi></small>':'<small>'+esc((ID.nom+' '+ID.prenom).trim())+(ID.sp?' · '+esc(ID.sp):'')+(ID.grp?' · الفوج '+esc(ID.grp):'')+'</small>');
 h+='<div class="hd"><img src="'+ROOT+'icons/logo-128.png?v=3" alt="" width="40" height="40"><div class="t"><b id="spss-mn-h">'+esc(APP_NAME)+'</b>'+who+'</div><button type="button" class="x" data-x="close" aria-label="إغلاق القائمة" title="إغلاق">✕</button></div><div class="ls">';
 h+=mnItem('','🏠','الرئيسية','',home,PAGE==='landing');
 var un=alUnread();h+='<a class="it" href="'+ROOT+'alerts.html"'+(PAGE==='alerts'?' aria-current="page"':'')+(un?' aria-label="التنبيهات، '+un+' غير مقروءة"':'')+'><span class="ic" aria-hidden="true">🔔</span><span>التنبيهات</span><em class="nb w">'+(un||'')+'</em></a>';
 if(r==='teacher'){
  var ct=PAGE==='teacher'?tpCur():'';
  h+='<p class="gh">لوحة الأستاذ</p>'+TPT.map(function(x){var b=tpBadge(x[0]),on=ct===x[0];
   return '<a class="it sub" data-tab="'+x[0]+'" href="'+ROOT+'assessment/teacher/#'+x[0]+'"'+(on?' aria-current="true"':'')+(b.n?' aria-label="'+esc(x[2]+'، '+(x[0]==='rq'?'قيد المراجعة ':'')+b.n)+'"':'')+'><span class="ic" aria-hidden="true">'+x[1]+'</span><span>'+x[2]+'</span><em class="nb'+(b.c?' '+b.c:'')+'">'+esc(b.n)+'</em></a>';}).join('');
  h+='<p class="gh">أدوات الأستاذ</p>'+mnItem('tstu','🧪','الدخول كطالب')+mnItem('clean','🧹','مسح بيانات التجربة');}
 else{
  h+='<p class="gh">لوحة الطالب</p>'+MET.map(function(x){return '<button type="button" class="it" data-x="me" data-g="'+x[0]+'"><span class="ic" aria-hidden="true">'+({m:'📊',a:'🗓️',l:'🧑‍🏫',p:'💻'}[x[0]]||'•')+'</span><span>'+x[2]+'</span></button>';}).join('');
  if(r==='tstu')h+='<p class="gh">وضع التجربة</p>'+mnItem('back','↩️','العودة إلى دور الأستاذ');}
 h+='<p class="gh">المنصة</p>'+mnItem('push','🔔',puLabel())+(instGone()?'':mnItem('inst',insIc,'تثبيت '+esc(APP_SHORT)))+mnItem('','ℹ️','من نحن','',ROOT+'about.html',PAGE==='about');
 h+='</div><div class="ft">'+mnItem('out','🚪',r==='student'?'تغيير المستخدم / خروج':'خروج','dg')+'</div>';
 return h;}
var MN={ret:null};
function mnOpen(btn){var m=document.getElementById('spss-mn');if(m)m.remove();
 m=document.createElement('div');m.id='spss-mn';if(ID.role==='tstu')m.className='tstu';
 m.innerHTML='<div class="bd" data-x="close"></div><div class="pn" role="dialog" aria-modal="true" aria-labelledby="spss-mn-h" tabindex="-1">'+mnBuild()+'</div>';
 document.body.appendChild(m);MN.ret=btn||null;
 m.addEventListener('click',function(e){var tb=e.target.closest('a[data-tab]');if(tb){if(PAGE==='teacher'&&document.getElementById('s-'+tb.getAttribute('data-tab'))){e.preventDefault();mnClose(true);var k=tb.getAttribute('data-tab');if(location.hash!=='#'+k)location.hash=k;else try{window.dispatchEvent(new HashChangeEvent('hashchange'));}catch(er){}setTimeout(function(){try{var sc=document.getElementById('s-'+k);sc.setAttribute('tabindex','-1');sc.focus({preventScroll:true});}catch(er){}},60);}else mnClose(true);return;}
  var x=e.target.closest('[data-x]');if(!x)return;var a=x.getAttribute('data-x');
  if(a==='close'){mnClose();return;}
  if(a==='out'){if(confirm(ID.role==='student'?'تسجيل الخروج من المنصة على هذا الجهاز؟ (حضورك ونتائجك المسجَّلة لا تُلغى)':'تسجيل الخروج؟'))logout();return;}
  var hb=document.querySelector('#spss-ub .ham');mnClose(true);
  if(a==='me'){meTab=x.getAttribute('data-g')||meTab;meOpen(hb);if(!meDesk()){meDrawer(false,true);setTimeout(function(){try{document.getElementById('spss-me').focus();}catch(e){}},80);}}else if(a==='inst')instOpen(hb);else if(a==='push'){if(puState()==='off'&&PAGE==='alerts'){puEnable();}else if(puState()==='off'&&lg('spss_push_na')!=='1'){puEnable().then(function(){location.href=ROOT+'alerts.html#push';});}else location.href=ROOT+'alerts.html#push';}else if(a==='tstu')toStudent();else if(a==='back')toTeacher();else if(a==='clean')cleanT(x);});
 m.addEventListener('keydown',function(e){if(e.key==='Escape'){e.preventDefault();mnClose();return;}
  if(e.key==='Tab'){var f=[].slice.call(m.querySelectorAll('.pn a,.pn button'));if(!f.length)return;var a=document.activeElement,f0=f[0],f1=f[f.length-1];
   if(e.shiftKey&&a===f0){e.preventDefault();f1.focus();}else if(!e.shiftKey&&a===f1){e.preventDefault();f0.focus();}}});
 void m.offsetWidth;m.classList.add('open');document.documentElement.classList.add('spss-lock');
 var hb=document.querySelector('#spss-ub .ham');if(hb)hb.setAttribute('aria-expanded','true');
 setTimeout(function(){try{m.querySelector('.x').focus();}catch(e){}},30);}
function mnClose(keep){var m=document.getElementById('spss-mn');if(!m)return;m.classList.remove('open');
 if(!document.querySelector('#spss-me.open'))document.documentElement.classList.remove('spss-lock');
 var hb=document.querySelector('#spss-ub .ham');if(hb)hb.setAttribute('aria-expanded','false');
 setTimeout(function(){if(m.parentNode&&!m.classList.contains('open'))m.remove();},260);
 if(!keep)try{(MN.ret||hb).focus();}catch(e){}}
// ===== شاشة الدخول (الصفحة الرئيسية) =====
function loginUI(){if(document.getElementById('spss-lg'))return;var w=document.createElement('div');w.id='spss-lg';w.setAttribute('role','dialog');w.setAttribute('aria-modal','true');w.setAttribute('aria-labelledby','spss-lg-h');w.setAttribute('aria-describedby','spss-lg-d');
 // update66: تصميم جديد (الشكل فقط؛ السلوك والتحقق والاستدعاءات كما هي)
 var IC={"logo": "<svg viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"1.9\" stroke-linecap=\"round\" stroke-linejoin=\"round\" aria-hidden=\"true\" focusable=\"false\"><path d=\"M3 20h18\"/><path d=\"M6 16v-5\"/><path d=\"M11 16V6\"/><path d=\"M16 16v-8\"/><path d=\"M20 16v-3\"/></svg>", "stu": "<svg viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"1.9\" stroke-linecap=\"round\" stroke-linejoin=\"round\" aria-hidden=\"true\" focusable=\"false\"><path d=\"M22 9 12 4 2 9l10 5 10-5z\"/><path d=\"M6 11.2V16c2.5 2 9.5 2 12 0v-4.8\"/><path d=\"M22 9v5\"/></svg>", "tea": "<svg viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"1.9\" stroke-linecap=\"round\" stroke-linejoin=\"round\" aria-hidden=\"true\" focusable=\"false\"><rect x=\"3\" y=\"4\" width=\"18\" height=\"12\" rx=\"2\"/><path d=\"M12 16v4M8 20h8\"/><path d=\"m7 12 3-3 2 2 4-4\"/></svg>", "card": "<svg viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"1.9\" stroke-linecap=\"round\" stroke-linejoin=\"round\" aria-hidden=\"true\" focusable=\"false\"><rect x=\"3\" y=\"5\" width=\"18\" height=\"14\" rx=\"2.5\"/><circle cx=\"8.5\" cy=\"11\" r=\"2\"/><path d=\"M5.5 16c.8-1.6 5.2-1.6 6 0M14 10h4.5M14 13.5h3.5\"/></svg>", "lock": "<svg viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"1.9\" stroke-linecap=\"round\" stroke-linejoin=\"round\" aria-hidden=\"true\" focusable=\"false\"><rect x=\"5\" y=\"11\" width=\"14\" height=\"10\" rx=\"2.2\"/><path d=\"M8 11V7.5a4 4 0 0 1 8 0V11\"/><circle cx=\"12\" cy=\"16\" r=\"1.2\"/></svg>", "eye": "<svg viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"1.9\" stroke-linecap=\"round\" stroke-linejoin=\"round\" aria-hidden=\"true\" focusable=\"false\"><path d=\"M2 12s3.6-7 10-7 10 7 10 7-3.6 7-10 7S2 12 2 12z\"/><circle cx=\"12\" cy=\"12\" r=\"3\"/></svg>", "eyeoff": "<svg viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"1.9\" stroke-linecap=\"round\" stroke-linejoin=\"round\" aria-hidden=\"true\" focusable=\"false\"><path d=\"M10.6 5.1A10.9 10.9 0 0 1 12 5c6.4 0 10 7 10 7a17 17 0 0 1-3.2 4.1M6.1 6.1A17.4 17.4 0 0 0 2 12s3.6 7 10 7a10 10 0 0 0 5.9-1.9\"/><path d=\"M9.9 9.9a3 3 0 0 0 4.2 4.2\"/><path d=\"m3 3 18 18\"/></svg>", "back": "<svg viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"1.9\" stroke-linecap=\"round\" stroke-linejoin=\"round\" aria-hidden=\"true\" focusable=\"false\"><path d=\"m9 6 6 6-6 6\"/></svg>", "chev": "<svg viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"1.9\" stroke-linecap=\"round\" stroke-linejoin=\"round\" aria-hidden=\"true\" focusable=\"false\"><path d=\"m15 6-6 6 6 6\"/></svg>", "in": "<svg viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"1.9\" stroke-linecap=\"round\" stroke-linejoin=\"round\" aria-hidden=\"true\" focusable=\"false\"><path d=\"M14 4h4a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2h-4\"/><path d=\"m9 8-4 4 4 4\"/><path d=\"M5 12h11\"/></svg>"};
 w.innerHTML='<div class="bgx" aria-hidden="true"></div><div class="c"><div class="hd"><div class="lg">'+LOGO_IMG+'</div><div class="bn"><h1 id="spss-lg-h">'+esc(APP_NAME)+'</h1><p class="tg">'+esc(APP_TAG)+'</p></div></div>'+
 '<div class="chp"><span class="md"><span class="dt" aria-hidden="true"></span>مقياس: <b dir="auto">'+esc(APP_MODULE)+'</b></span><span class="kk">جامعة قسنطينة 2</span></div>'+
 '<p class="wl" id="spss-lg-d">مرحباً بك في '+esc(APP_NAME)+'. اختر صفتك ثم أدخل بياناتك مرة واحدة، وبعدها تتنقل في المنصة بحرية.</p>'+
 '<div class="stp" id="spss-s1"><p class="q">الدخول بصفة</p><div class="rl" role="group" aria-label="اختر صفتك">'+
 '<button type="button" data-r="s"><span class="ic">'+IC.stu+'</span><span class="tx"><b>طالب</b><small>برقم شهادة البكالوريا</small></span><span class="ch">'+IC.chev+'</span></button>'+
 '<button type="button" data-r="t"><span class="ic">'+IC.tea+'</span><span class="tx"><b>أستاذ</b><small>بالرمز السري للأستاذ</small></span><span class="ch">'+IC.chev+'</span></button></div></div>'+
 '<form id="spss-lf" class="stp" autocomplete="off" hidden novalidate><div class="fh"><button type="button" class="bk" aria-label="رجوع إلى اختيار الصفة">'+IC.back+'رجوع</button><span class="rc" id="spss-rc"></span></div>'+
 '<label for="spss-in"></label><div class="fld"><span class="fi"></span><input id="spss-in" aria-describedby="spss-hn spss-er"><button type="button" class="eye" hidden aria-pressed="false" aria-label="إظهار الرمز">'+IC.eye+'</button></div><p class="hn" id="spss-hn"></p>'+
 '<button class="go" type="submit"><span class="sp" aria-hidden="true"></span>'+IC['in']+'<span class="gt">دخول</span></button><div class="er" id="spss-er" role="alert" aria-live="assertive"></div></form>'+
 '<div class="qr"><img src="'+ROOT+'assets/qr-spss.png" alt="رمز QR للمنصة"><span><b>شارك المنصة</b>امسح الرمز للوصول إلى المنصة من هاتفك.</span></div><p class="ft" dir="rtl">'+copyHTML()+'</p></div>';
 document.body.appendChild(w);document.documentElement.style.overflow='hidden';
 var f=w.querySelector('#spss-lf'),s1=w.querySelector('#spss-s1'),inp=w.querySelector('#spss-in'),lab=w.querySelector('label'),er=w.querySelector('#spss-er'),go=f.querySelector('.go'),gt=go.querySelector('.gt'),fld=w.querySelector('.fld'),fi=w.querySelector('.fi'),eye=w.querySelector('.eye'),hn=w.querySelector('#spss-hn'),rc=w.querySelector('#spss-rc'),role='',last=null;
 function sErr(m){er.textContent=m||'';fld.classList.toggle('bad',!!m);if(m)inp.setAttribute('aria-invalid','true');else inp.removeAttribute('aria-invalid');}
 function busy(on){go.disabled=on;go.classList.toggle('ld',on);go.setAttribute('aria-busy',on?'true':'false');gt.textContent=on?'جارٍ التحقق…':'دخول';inp.readOnly=on;}
 function eyeSet(show){inp.type=show?'text':'password';eye.setAttribute('aria-pressed',show?'true':'false');eye.setAttribute('aria-label',show?'إخفاء الرمز':'إظهار الرمز');eye.innerHTML=show?IC.eyeoff:IC.eye;}
 eye.onclick=function(){var p=inp.selectionStart;eyeSet(inp.type==='password');try{inp.focus();inp.setSelectionRange(p,p);}catch(e){}};
 inp.addEventListener('input',function(){if(er.textContent)sErr('');});
 Array.prototype.forEach.call(w.querySelectorAll('[data-r]'),function(b){b.onclick=function(){role=b.getAttribute('data-r');last=b;Array.prototype.forEach.call(w.querySelectorAll('[data-r]'),function(x){x.classList.toggle('on',x===b)});
  s1.classList.add('hide');f.hidden=false;sErr('');inp.value='';busy(false);
  if(role==='s'){lab.textContent='رقم شهادة البكالوريا';inp.type='tel';inp.setAttribute('inputmode','numeric');inp.maxLength=10;inp.placeholder='6 إلى 9 أرقام';inp.autocomplete='off';
   fi.innerHTML=IC.card;eye.hidden=true;rc.className='rc';rc.innerHTML=IC.stu+'طالب';hn.textContent='تُدخله مرة واحدة فقط على هذا الجهاز.';if(!inp.value&&/^\d{5,10}$/.test(lg('spss_last_bac')||''))inp.value=lg('spss_last_bac');}
  else{lab.textContent='الرمز السري للأستاذ';inp.type='password';inp.removeAttribute('inputmode');inp.maxLength=80;inp.placeholder='';inp.autocomplete='current-password';
   fi.innerHTML=IC.lock;eye.hidden=false;eyeSet(false);rc.className='rc t';rc.innerHTML=IC.tea+'أستاذ';hn.textContent='الرمز خاص بالأستاذ ولا يُشارك مع الطلبة.';}
  setTimeout(function(){inp.focus()},50);};});
 w.querySelector('.bk').onclick=function(){role='';f.hidden=true;s1.classList.remove('hide');sErr('');inp.value='';busy(false);if(last)setTimeout(function(){last.focus()},30);};
 w.addEventListener('keydown',function(ev){if(ev.key==='Escape'&&!f.hidden&&!go.disabled){ev.preventDefault();w.querySelector('.bk').click();}});
 // لوحة المفاتيح: التركيز داخل النافذة (Tab يدور بين عناصرها)
 var cc=w.querySelector('.c');cc.setAttribute('tabindex','-1');try{cc.focus({preventScroll:true});}catch(e){}
 w.addEventListener('keydown',function(ev){if(ev.key!=='Tab')return;var F=Array.prototype.filter.call(w.querySelectorAll('button,input'),function(x){return !x.disabled&&x.offsetParent!==null;});if(!F.length)return;
  var a=document.activeElement,i=F.indexOf(a);if(ev.shiftKey&&(i<=0)){ev.preventDefault();F[F.length-1].focus();}else if(!ev.shiftKey&&(i<0||i===F.length-1)){ev.preventDefault();F[0].focus();}});
 f.onsubmit=function(ev){ev.preventDefault();if(go.disabled)return;sErr('');if(navigator.onLine===false){sErr('تسجيل الدخول يحتاج الاتصال بالإنترنت (أول مرة أو بعد الخروج). اتصل ثم أعد المحاولة.');return;}var v=inp.value.trim();
  if(role==='s'){v=v.replace(/\D/g,'');if(!/^\d{5,10}$/.test(v)){sErr('اكتب رقم البكالوريا (أرقام فقط).');inp.focus();return;}busy(true);
   getJ({action:'aslist',sbac:v}).then(function(r){busy(false);
    if(!r.ok||!r.who){sErr(r.err==='UNKNOWN_BAC'?'رقم البكالوريا هذا غير موجود في قوائم الطلبة. تحقّق منه أو راجع الأستاذ.':r.err==='NO_ROSTER'?'قوائم الطلبة غير مهيّأة بعد.':'تعذّر الاتصال بالخادم، أعد المحاولة.');inp.focus();return;}
    clearAll();ls('spss_last_bac',v);ls('spss_id',JSON.stringify({bac:v,nom:r.who.nom||'',prenom:r.who.prenom||'',sp:r.who.sp||'',grp:r.who.grp||'',free:r.who.free?1:0,t:Date.now()}));ls('as_bac',v);done();});}
  else if(role==='t'){if(!v){sErr('أدخل الرمز السري.');inp.focus();return;}busy(true);
   post({action:'askey',key:v}).then(function(r){busy(false);if(!r.ok){sErr(r.err==='BAD_KEY'?'الرمز السري غير صحيح.':'تعذّر الاتصال بالخادم، أعد المحاولة.');inp.focus();return;}
    clearAll();ss('spss_tkey',v);ss('dk-prof',v);ss('as_tkey',v);done();});}};
 function done(){ss('spss_inst_after','1');ss('spss_pn_after','1');if(goNext())return;location.replace(location.pathname);}}
// ===== صفحات الحصص: زر واحد «تسجيل الحضور» برقم الدخول =====
function lecName(){var r=/LECN\s*=\s*'([^']+)'/,m=null;Array.prototype.some.call(document.querySelectorAll('script:not([src])'),function(s){m=(s.textContent||'').match(r);return !!m;});
 if(m)return m[1];var m2=null;Array.prototype.some.call(document.querySelectorAll('script:not([src])'),function(s){m2=(s.textContent||'').match(/append\('lecture','([^']+)'\)/);return !!m2;});return m2?m2[1]:'';}
function hideLab(inp){var l=inp&&inp.closest('label');if(l)l.classList.add('spss-hide');else if(inp)inp.classList.add('spss-hide');}
function slotMsg(x){var p=String(x||'').split('|');if(p[0]!=='TOO_EARLY')return '';
 return p[2]&&p[3]?'⏰ التسجيل متاح فقط من '+p[2]+' إلى '+p[3]+(p[1]?' (يوم '+p[1]+')':'')+'.':'⏰ لم يحن موعد الحصة بعد'+(p[1]?': تاريخها يوم '+p[1]:'')+'.';}
window.spssSlotMsg=slotMsg;
function teacherSessionUI(){var b=document.body;b.classList.add('spss-tch');
 var un=function(){if(b.classList.contains('att-locked'))b.classList.remove('att-locked');};un();
 try{new MutationObserver(un).observe(b,{attributes:true,attributeFilter:['class']});}catch(e){}
 ['att-form','att-lock-note','att-frame-wrap'].forEach(function(i){var e=document.getElementById(i);if(e)e.style.display='none';});
 ['qz-bac','qz-code','qz-go'].forEach(function(i){var e=document.getElementById(i);if(e)hideLab(e);});
 var ma=document.getElementById('mod-attendance');if(ma&&!ma.querySelector('.spss-tnote')){var n=document.createElement('div');n.className='spss-who spss-tnote';n.innerHTML='👨‍🏫 وضع الأستاذ: المحتوى مفتوح لك دون تسجيل حضور. (الطالب يرى هنا زر <strong>تسجيل الحضور</strong> فقط.)';ma.appendChild(n);}
 var db=document.getElementById('deck-btn');if(db){db.removeAttribute('onclick');db.disabled=false;db.innerHTML='<i class="fa-solid fa-display ml-2"></i>عرض الشرائح';
  db.addEventListener('click',function(e){e.preventDefault();e.stopImmediatePropagation();try{if(window.dkLate)window.dkLate();if(window.dkCtl&&window.dkCtl.lock)window.dkCtl.lock(false);}catch(x){}if(typeof window.openDeck==='function')window.openDeck();},true);}}
function sessionUI(){if(ID&&ID.role==='teacher'){teacherSessionUI();return;}if(!ID)return;document.body.classList.add('spss-st');
 var fm=document.getElementById('att-form'),btn=null,msg=null;
 var who=document.createElement('div');who.className='spss-who';who.innerHTML='👤 '+esc((ID.nom+' '+ID.prenom).trim())+(ID.role==='tstu'?' <small>(وضع الأستاذ كطالب)</small>':'')+' – <bdi dir="ltr">'+esc(ID.bac)+'</bdi>';
 if(fm){var bi=fm.querySelector('input[name="bac"]');
  if(!bi){bi=document.createElement('input');bi.type='hidden';bi.name='bac';fm.appendChild(bi);
   [['nom',ID.nom],['prenom',ID.prenom],['groupe',(ID.sp?ID.sp+' - ':'')+'فوج '+(ID.grp||'')]].forEach(function(a){var e=fm.querySelector('input[name="'+a[0]+'"]');if(e){e.value=a[1]||'';e.removeAttribute('required');hideLab(e);}});}
  else hideLab(bi);
  bi.value=ID.bac;var ci=fm.querySelector('input[name="code"]');if(ci){ci.removeAttribute('required');ci.value='';hideLab(ci);}
  fm.insertBefore(who,fm.firstChild);btn=document.getElementById('att-btn');msg=document.getElementById('att-msg');
  if(btn)btn.textContent='تسجيل الحضور';}
 var qb=document.getElementById('qz-bac');
 if(qb){qb.value=ID.bac;hideLab(qb);var qc=document.getElementById('qz-code');if(qc)hideLab(qc);var g=document.getElementById('qz-go');if(g){g.textContent='تسجيل الحضور';var grid=qb.closest('.qg');if(grid)grid.insertBefore(who,grid.firstChild);}
  var db=document.getElementById('deck-btn');if(db)db.innerHTML='<i class="fa-solid fa-right-to-bracket ml-2"></i>تسجيل الحضور';btn=g;msg=document.getElementById('qz-lmsg');}
 Array.prototype.forEach.call(document.querySelectorAll('#mod-attendance p, #att-lock-note'),function(p){if(/رمز الحصة|رقم البكالوريا|رقم شهادة البكالوريا/.test(p.textContent||'')&&!p.querySelector('#att-review'))p.innerHTML=p.id==='att-lock-note'?'<i class="fa-solid fa-lock ml-1 text-amber-600"></i> محتوى الحصة محجوب حتى تضغط <strong>تسجيل الحضور</strong> (أثناء وقت الحصة) أو تدخل للمراجعة.':'تسجيل الحضور <strong>خطوة إجبارية</strong> قبل الاطلاع على محتوى الحصة: اضغط <strong>تسجيل الحضور</strong> أثناء وقت حصتك.';});
 // فحص مسبق (دون أي كتابة): نافذة الحصة ونوع الدخول
 var L=lecName();if(!L||!btn)return;var sl=document.createElement('span');sl.className='spss-slot';sl.id='spss-slot';(msg&&msg.parentNode?msg.parentNode:btn.parentNode).appendChild(sl);
 var T0=btn.textContent;
 var nP=0;function pre(){if(fm?!document.body.classList.contains('att-locked'):nP++>0)return;
  post({bac:ID.bac,lecture:L,dry:'1',fmt:'json'}).then(function(r){var x=r&&r.err?String(r.err):'';
   if(/^TOO_EARLY/.test(x)){btn.disabled=true;btn.style.opacity='.6';sl.style.color='#b45309';sl.textContent=slotMsg(x);return;}
   btn.disabled=false;btn.style.opacity='';
   if(!r||!r.status){sl.textContent='';return;}
   var md=r.mode;if(md==='normal'){btn.textContent=T0;sl.style.color='#047857';sl.textContent=r.slotE?'✅ التسجيل متاح الآن حتى '+r.slotE+' (من '+r.slotS+' إلى '+r.slotE+').':'✅ التسجيل متاح الآن.';}
   else if(md==='review_late'){btn.textContent='الدخول للمراجعة';sl.style.color='#b91c1c';sl.textContent='⏰ انتهى وقت تسجيل الحضور'+(r.slotE?' ('+r.slotS+'–'+r.slotE+')':'')+': تُعدّ غائباً، والدخول للمراجعة فقط.';}
   else if(md==='review_attended'){btn.textContent='الدخول إلى الحصة';sl.style.color='#047857';sl.textContent='✅ حضورك مسجَّل مسبقاً في هذه الحصة.';}
   else{btn.textContent='الدخول للمراجعة';sl.style.color='#475569';sl.textContent='🔒 انقضى تاريخ الحصة'+(r.date?' ('+r.date+')':'')+': الدخول للمراجعة فقط.';}}).catch(function(){});}
 pre();setInterval(pre,60000);}
function assessUI(){if(!ID)return;document.body.classList.add('spss-auth');if(ID.role!=='teacher')document.body.classList.add('spss-st');
 if(ID.role==='teacher'){location.replace(ROOT+'assessment/teacher/');return;}
 var o=document.getElementById('out');if(o){var n=o.cloneNode(true);n.textContent='تغيير المستخدم';o.parentNode.replaceChild(n,o);n.addEventListener('click',function(){if(confirm('تسجيل الخروج من المنصة على هذا الجهاز؟'))logout();});if(ID.role==='tstu')n.style.display='none';}
 // «بدء التقييم» مباشرة برقم الدخول
 var fix=function(){Array.prototype.forEach.call(document.querySelectorAll('[data-go]'),function(b){if(b.textContent.indexOf('ابدأ التقييم')>=0)b.innerHTML=b.innerHTML.replace('ابدأ التقييم','بدء التقييم');});};
 new MutationObserver(fix).observe(document.body,{childList:true,subtree:true});fix();}
function landingUI(){if(!ID){loginUI();return;}if(goNext())return;}
// ===== update72: تهيئة الإشعارات بعد الدخول/التثبيت (نافذة + شريط تذكير مؤجَّل) =====
function isMiui(){return /Xiaomi|Redmi|POCO|MIUI|HyperOS|\bM2\d{3}|\b2\d{3}[A-Z0-9]{4,}\b/i.test(UA);}
function pnSnz(){return Date.now()<Number(lg('spss_pn_snz')||0);}
function pnSnooze(d){ls('spss_pn_snz',String(Date.now()+d*864e5));}
function pnCss(){if(document.getElementById('spss-pn-css'))return;var s=document.createElement('style');s.id='spss-pn-css';s.textContent=
 '#spss-pn{position:fixed;inset:0;z-index:10050;background:rgba(15,23,42,.55);display:flex;align-items:flex-end;justify-content:center;direction:rtl;font-family:inherit}'+
 '#spss-pn .c{background:#fff;width:100%;max-width:520px;max-height:88vh;overflow:auto;border-radius:18px 18px 0 0;padding:18px 18px 22px;box-shadow:0 -8px 30px rgba(0,0,0,.25);color:#0f172a}'+
 '@media(min-width:700px){#spss-pn{align-items:center}#spss-pn .c{border-radius:18px}}'+
 '#spss-pn .hd{display:flex;align-items:center;gap:10px}#spss-pn h2{font-size:19px;margin:0;flex:1;line-height:1.5}#spss-pn .x{border:0;background:#f1f5f9;border-radius:50%;width:36px;height:36px;font-size:16px;cursor:pointer}'+
 '#spss-pn .bigic{font-size:34px}#spss-pn p{font-size:15px;line-height:1.8;margin:10px 0}#spss-pn ol{margin:8px 0;padding-inline-start:22px;font-size:14.5px;line-height:1.9}'+
 '#spss-pn .bt{display:flex;flex-wrap:wrap;gap:8px;margin-top:14px}#spss-pn .bt button{flex:1 1 140px;min-height:46px;border-radius:12px;font:inherit;font-weight:700;font-size:15px;cursor:pointer}'+
 '#spss-pn .p{background:#0f2747;color:#fff;border:0}#spss-pn .p[disabled]{opacity:.6}#spss-pn .s{background:#fff;color:#0f2747;border:1.5px solid #cbd5e1}'+
 '#spss-pn .st{min-height:22px;font-weight:700;font-size:14.5px;color:#15803d}#spss-pn .st.e{color:#b91c1c}#spss-pn .tip{background:#fff7ed;border:1px solid #fed7aa;border-radius:10px;padding:8px 10px;font-size:13.5px}'+
 '#spss-pns{display:flex;align-items:center;gap:8px;background:#fff7ed;border-bottom:1px solid #fed7aa;padding:8px 12px;direction:rtl;font-size:14px;color:#7c2d12}'+
 '#spss-pns .tx{flex:1;line-height:1.6}#spss-pns .go{background:#ea580c;color:#fff;border:0;border-radius:10px;padding:7px 12px;font:inherit;font-weight:700;cursor:pointer;white-space:nowrap}'+
 '#spss-pns .x{background:none;border:0;font-size:16px;color:#9a3412;cursor:pointer;min-width:32px;min-height:32px}';document.head.appendChild(s);}
function pnGuide(s){
 if(s==='ios')return '<p>على iPhone وiPad تعمل الإشعارات فقط من المنصة المثبّتة على الشاشة الرئيسية (iOS 16.4 أو أحدث):</p><ol><li>افتح المنصة في <b>Safari</b>.</li><li>اضغط زر المشاركة <b>⬆️</b> ثم «<b>إضافة إلى الشاشة الرئيسية</b>».</li><li>افتح المنصة من أيقونتها الجديدة وسجّل الدخول مرة واحدة فيها.</li><li>اضغط «تفعيل الإشعارات» ثم «سماح».</li></ol>';
 if(s==='na')return '<p>هذا المتصفح لا يدعم الإشعارات. افتح المنصة في <b>Chrome</b> على Android أو الحاسوب، أو ثبّتها من Safari على iPhone.</p>';
 var h='<p>الإشعارات محظورة لهذا الموقع في المتصفح. لتفعيلها:</p>';
 if(ANDR){h+='<ol><li>اضغط مطوّلاً على أيقونة '+esc(APP_SHORT)+' ثم «معلومات التطبيق»، أو افتح المنصة في Chrome واضغط رمز القفل 🔒 بجانب العنوان.</li><li>اختر «<b>الإشعارات</b>» ثم «<b>سماح</b>».</li><li>أغلق التطبيق تماماً ثم افتحه، واضغط «تفعيل الإشعارات».</li></ol>';
  if(isMiui())h+='<p class="tip"><b>هاتف Xiaomi / Redmi / POCO:</b> افتح الإعدادات ← التطبيقات ← إدارة التطبيقات ← <b>Chrome</b>:<br>• الإشعارات: <b>سماح</b> (وسماح لموقع '+esc(APP_SHORT)+' داخلها).<br>• التشغيل التلقائي (Autostart): <b>مفعّل</b>.<br>• توفير البطارية: <b>بلا قيود</b> (No restrictions).</p>';}
 else if(IOS)h+='<ol><li>افتح الإعدادات ← الإشعارات ← '+esc(APP_SHORT)+'.</li><li>فعّل «<b>السماح بالإشعارات</b>».</li></ol>';
 else h+='<ol><li>اضغط رمز القفل 🔒 بجانب عنوان الموقع.</li><li>اجعل «<b>الإشعارات</b>» على «<b>سماح</b>».</li><li>أعد تحميل الصفحة ثم اضغط «تفعيل الإشعارات».</li></ol>';
 return h;}
function pnClose(){var w=document.getElementById('spss-pn');if(w)w.remove();pnStrip();}
function pnOpen(){if(!ID||document.getElementById('spss-pn'))return;var s=puState();if(s==='on')return;pnCss();ss('spss_pn_seen','1');ss('spss_pn_after',null);
 var w=document.createElement('div');w.id='spss-pn';w.setAttribute('role','dialog');w.setAttribute('aria-modal','true');w.setAttribute('aria-labelledby','spss-pn-h');
 var ttl=s==='off'?'فعّل الإشعارات على هذا الجهاز':(s==='ios'?'ثبّت المنصة لتصلك الإشعارات':'الإشعارات غير مفعّلة');
 var body=s==='off'?'<p>'+(ID.role==='teacher'?'تصلك فوراً طلبات المراجعة وتنبيهات المنصة، حتى والتطبيق مغلق.':'يصلك فوراً تنبيه عند فتح تقييم أو تسجيل الحضور، ونتائج طلبات المراجعة ورسائل الأستاذ، حتى والتطبيق مغلق.')+'</p><p>اضغط الزر ثم اختر «<b>سماح</b>». سنرسل إشعاراً تجريبياً للتأكد.</p>'+(isMiui()?'<p class="tip">هاتف Xiaomi: إن لم يظهر الإشعار التجريبي، اجعل توفير البطارية لـ Chrome «بلا قيود» وفعّل التشغيل التلقائي.</p>':''):pnGuide(s);
 w.innerHTML='<div class="c"><div class="hd"><span class="bigic" aria-hidden="true">🔔</span><h2 id="spss-pn-h">'+ttl+'</h2><button type="button" class="x" data-a="x" aria-label="إغلاق">✕</button></div>'+body+
  '<div class="st" role="status" aria-live="polite"></div><div class="bt">'+(s==='off'?'<button type="button" class="p" data-a="go">🔔 تفعيل الإشعارات</button>':'')+'<button type="button" class="s" data-a="later">'+(s==='off'?'لاحقاً':'حسناً')+'</button></div></div>';
 document.body.appendChild(w);var st=w.querySelector('.st'),sp=document.getElementById('spss-pns');if(sp)sp.remove();
 w.addEventListener('click',function(e){var b=e.target.closest('[data-a]');if(e.target===w){pnSnooze(1);return pnClose();}if(!b)return;var a=b.getAttribute('data-a');
  if(a==='x'||a==='later'){pnSnooze(a==='later'?1:3);return pnClose();}
  if(a==='go'){b.disabled=true;st.className='st';st.textContent='جارٍ التفعيل…';
   puEnable().then(function(){if(puState()!=='on'){b.disabled=false;st.className='st e';var ns=puState();
     if(ns==='denied'){w.querySelector('.c').insertAdjacentHTML('beforeend',pnGuide('denied'));b.remove();}st.textContent=PU.msg?PU.msg.replace(/<[^>]+>/g,''):'لم يكتمل التفعيل. أعد المحاولة.';return;}
    st.textContent='✅ تم التفعيل. جارٍ إرسال إشعار تجريبي…';var o=puAuth();o.action='aspushme';o.token=lg('spss_push_tok');
    return post(o).then(function(r){st.textContent=r&&r.ok&&r.sent?'✅ تم التفعيل، وأُرسل إشعار تجريبي سيظهر خلال ثوانٍ.':'✅ تم التفعيل. يمكنك تجربة الإشعار لاحقاً من صفحة التنبيهات.';
     b.remove();var l=w.querySelector('[data-a="later"]');if(l)l.textContent='تم';}).catch(function(){st.textContent='✅ تم التفعيل.';b.remove();});});}});
 w.addEventListener('keydown',function(e){if(e.key==='Escape')pnClose();});
 setTimeout(function(){var f=w.querySelector('[data-a="go"]')||w.querySelector('[data-a="later"]');try{f.focus();}catch(e){}},60);}
function pnStrip(){var o=document.getElementById('spss-pns');if(o)o.remove();if(!ID||(puOk()&&Notification.permission==='granted')||PAGE==='alerts'||pnSnz()||document.getElementById('spss-pn'))return;var s=puState();if(s==='on'||s==='na')return;
 var ub=document.getElementById('spss-ub');if(!ub)return;pnCss();var t=document.createElement('div');t.id='spss-pns';t.setAttribute('role','region');t.setAttribute('aria-label','تذكير الإشعارات');
 t.innerHTML='<span class="tx">🔔 '+(s==='ios'?'ثبّت المنصة على الشاشة الرئيسية لتصلك الإشعارات.':(s==='denied'?'الإشعارات محظورة على هذا الجهاز.':'فعّل الإشعارات لتصلك التنبيهات فوراً.'))+'</span><button type="button" class="go">'+(s==='off'?'تفعيل':'كيف؟')+'</button><button type="button" class="x" aria-label="إخفاء التذكير لثلاثة أيام" title="إخفاء">✕</button>';
 ub.parentNode.insertBefore(t,ub.nextSibling);t.querySelector('.go').onclick=pnOpen;t.querySelector('.x').onclick=function(){pnSnooze(3);t.remove();};}
function pnInit(){if(!ID)return;var s=puState();
 window.addEventListener('appinstalled',function(){ss('spss_pn_after','1');setTimeout(pnAuto,1500);});
 if(s==='on'||s==='na'){return;}
 pnStrip();pnAuto();}
function pnAuto(n){n=n||0;if(!ID||(puOk()&&Notification.permission==='granted')||puState()==='on'||puState()==='na'||document.getElementById('spss-pn'))return;
 var want=sg('spss_pn_after')==='1'||(isSA()&&sg('spss_pn_seen')!=='1'&&!pnSnz());if(!want)return;
 if(document.getElementById('spss-ins')||document.getElementById('spss-lg')){if(n<40)setTimeout(function(){pnAuto(n+1);},1500);return;}
 setTimeout(function(){if(!document.getElementById('spss-ins'))pnOpen();else pnAuto(n+1);},n?400:1800);}
function init(){addCss();if(PAGE==='landing')landingUI();bar();if(PAGE==='alerts')alPage();puMsg();if(ID)setTimeout(puRefresh,2500);if(ID)setTimeout(pnInit,600);filterUI();instInit();copyInit();aboutNav();
 if(ID&&ID.role==='student'&&ID.free===undefined)getJ({action:'aslist',sbac:ID.bac}).then(function(r){if(r&&r.ok&&r.who){var s=pj(lg('spss_id'))||{};if(s.bac===ID.bac){s.free=r.who.free?1:0;ls('spss_id',JSON.stringify(s));if(s.free&&FLT)location.reload();}}});
 if(PAGE==='session'){if(!(BIZ&&TPPAGE))sessionUI();}else if(PAGE==='assess')assessUI();
 else if(PAGE==='teacher'&&ID&&ID.role==='tstu'){/* لوحة الأستاذ متاحة دائماً بالرمز */}}
// ===== update61: تصفية الصفحات =====
function filterUI(){if(!FLT)return;
 if(BIZ){var fm='يمكنك تصفح محتوى التطبيقات وشرائحها بحرية (تخصص «إدارة أعمال»)، دون تسجيل حضور ودون تقييم.';
  if(PAGE==='list'&&document.body.getAttribute('data-type')==='tp'){var l=document.getElementById('list');if(l&&l.parentNode&&!document.querySelector('.spss-free'))l.parentNode.insertBefore(freeNote(fm),l);}
  if(TPPAGE)bizTp(fm);}
}
function freeNote(t){var d=document.createElement('div');d.className='spss-free';d.setAttribute('role','note');d.innerHTML='<span class="i" aria-hidden="true">🔓</span><span><b>تصفح حر، دون تسجيل حضور أو تقييم</b>'+esc(t)+'</span>';return d;}
function bizTp(fm){var b=document.body;window.SNAV_FREE='biz';
 var un=function(){if(b.classList.contains('att-locked'))b.classList.remove('att-locked');};un();
 try{new MutationObserver(un).observe(b,{attributes:true,attributeFilter:['class']});}catch(e){}
 var w=document.getElementById('main-content-wrapper');if(!document.querySelector('.spss-free')){var n=freeNote(fm);var ms=document.getElementById('mod-slides');if(w)w.insertBefore(n,w.firstChild);else if(ms&&ms.parentNode)ms.parentNode.insertBefore(n,ms);else b.insertBefore(n,b.firstChild);}
 var db=document.getElementById('deck-btn');if(db){db.removeAttribute('onclick');db.disabled=false;db.textContent='عرض الشرائح';
  db.addEventListener('click',function(e){e.preventDefault();e.stopImmediatePropagation();try{if(window.dkLate)window.dkLate();if(window.dkCtl&&window.dkCtl.lock)window.dkCtl.lock(false);}catch(x){}if(typeof window.openDeck==='function')window.openDeck();},true);
  try{new MutationObserver(function(){if(db.disabled)db.disabled=false;}).observe(db,{attributes:true,attributeFilter:['disabled']});}catch(e){}}
}
function block(msg){if(document.getElementById('spss-blk'))return;var w=document.createElement('div');w.id='spss-blk';w.setAttribute('role','dialog');w.setAttribute('aria-modal','true');
 w.innerHTML='<div class="c"><h3 style="margin:0 0 8px">🙏 هذه الصفحة ليست لفوجك</h3><p style="margin:0">'+esc(msg)+'</p><a href="'+ROOT+'lectures/index.html">← العودة إلى محاضراتك</a> <a href="'+ROOT+'index.html" style="background:#475569">🏠 الرئيسية</a></div>';
 document.body.appendChild(w);document.documentElement.style.overflow='hidden';}
// ===== update61: لوحة الطالب =====
var ME=null;
function bgS(st){return {done:['ok','منجز'],open:['op','مفتوح الآن'],missed:['no','لم يُنجز'],closed:['cl','مغلق']}[st]||['cl',st||''];}
function bgA(st){return {present:['ok','حاضر'],absent:['no','غائب'],rejected:['rj','مرفوض (غ)'],upcoming:['cl','قادم'],open:['op','التسجيل مفتوح الآن'],nodate:['cl','لم يُحدَّد التاريخ']}[st]||['cl',st||''];}
function rqB(st){return {pending:['op','طلب المراجعة: قيد المراجعة'],accepted:['ok','طلب المراجعة: مقبول'],rejected:['no','طلب المراجعة: مرفوض']}[st]||['cl',st||''];}
var RQE={TOO_SOON:'انتظر قليلاً ثم أعد المحاولة.',DUPLICATE:'لديك طلب قيد المراجعة لهذه الحصة.',ALREADY_PRESENT:'أنت مسجَّل حاضراً في هذه الحصة.',NOT_PAST:'لا يمكن طلب المراجعة إلا لحصة مضت.',NOT_YOURS:'هذه الحصة ليست من حصصك.',TOO_MANY:'لديك 10 طلبات قيد المراجعة؛ انتظر قرار الأستاذ.',BUSY:'الخادم مشغول، أعد المحاولة بعد لحظات.'};
function bdg(a){return '<span class="bg mk-'+a[0]+'">'+esc(a[1])+'</span>';}
function dm(d){var m=/^(\d{4})-(\d{2})-(\d{2})$/.exec(String(d||''));return m?m[3]+'/'+m[2]+'/'+m[1]:'';}
function n2(x){return x==null?'–':String(Math.round(x*100)/100).replace('.',',');}
// update63: لوحة الطالب بقائمة عمودية بتصميم لوحة الأستاذ (درج يميني تحت 1024px، وشريط جانبي قابل للطي على الحاسوب)
var MET=[['m','fa-square-poll-vertical','تتبع علاماتي'],['a','fa-clipboard-user','تتبع الحضور'],['l','fa-chalkboard-user','توقيت المحاضرات'],['p','fa-laptop-code','توقيت التطبيقات']];
var meTab=sg('spss_metab')||'m',meD=false,meMQ=window.matchMedia?window.matchMedia('(min-width:1024px)'):{matches:true};
function meDesk(){return !!meMQ.matches;}
function meCol(){return lg('spss_menav')==='0';}
function meEl(x){return document.getElementById('spss-me-'+x);}
function meSync(){var d=document.getElementById('spss-me');if(!d)return;var hb=meEl('hb'),nv=meEl('nav'),lay=meEl('lay');
 if(meDesk()){meD=false;nv.classList.remove('open');meEl('bdp').classList.add('hide');var c=meCol();lay.classList.toggle('col',c);hb.setAttribute('aria-expanded',c?'false':'true');hb.setAttribute('aria-label',c?'القائمة (إظهار الشريط الجانبي)':'القائمة (طي الشريط الجانبي)');nv.removeAttribute('aria-hidden');nv.removeAttribute('role');nv.removeAttribute('aria-modal');}
 else{lay.classList.remove('col');nv.classList.toggle('open',meD);meEl('bdp').classList.toggle('hide',!meD);hb.setAttribute('aria-expanded',meD?'true':'false');hb.setAttribute('aria-label','القائمة');
  if(meD){nv.removeAttribute('aria-hidden');nv.setAttribute('role','dialog');nv.setAttribute('aria-modal','true');}else{nv.setAttribute('aria-hidden','true');nv.removeAttribute('role');nv.removeAttribute('aria-modal');}}}
function meDrawer(o,nofocus){meD=!!o;meSync();if(meD){var f=function(){var t=meEl('t-'+meTab);if(meD&&t&&!meEl('nav').contains(document.activeElement))try{t.focus();}catch(e){}};f();setTimeout(f,40);setTimeout(f,250);}else if(!nofocus)try{meEl('hb').focus();}catch(e){}}
function meSel(g,focus){if(!MET.some(function(x){return x[0]===g;}))g='m';meTab=g;ss('spss_metab',g);
 MET.forEach(function(x){var b=meEl('t-'+x[0]),on=x[0]===g,sc=meEl(x[0]);if(b){b.setAttribute('aria-selected',on?'true':'false');b.tabIndex=on?0:-1;b.classList.toggle('on',on);}if(sc)sc.classList.toggle('hide',!on);});
 var t=MET.filter(function(x){return x[0]===g;})[0];meEl('t').innerHTML='<i class="fa-solid '+t[1]+'" aria-hidden="true"></i>'+esc(t[2]);
 if(focus)try{meEl('t-'+g).focus();}catch(e){}}
function meOpen(btn){var d=document.getElementById('spss-me');
 if(!d){d=document.createElement('div');d.id='spss-me';d.setAttribute('role','dialog');d.setAttribute('aria-modal','true');d.setAttribute('aria-label','لوحة الطالب');d.tabIndex=-1;
  d.innerHTML='<div class="mw"><div class="shd"><button type="button" id="spss-me-hb" aria-label="القائمة" aria-expanded="false" aria-controls="spss-me-nav">☰</button><span class="stt" id="spss-me-t" aria-live="polite"></span><button type="button" class="x" aria-label="إغلاق لوحة الطالب" title="إغلاق">✕</button></div>'+
  '<div class="bdp hide" id="spss-me-bdp"></div><div class="lay" id="spss-me-lay"><nav class="mnav" id="spss-me-nav" aria-label="أقسام لوحة الطالب"><div class="nvh"><span>📊 لوحة الطالب<small id="spss-me-w2"></small></span><button type="button" class="mnx" aria-label="إغلاق القائمة">✕</button></div>'+
  '<div class="tl tb" role="tablist" aria-orientation="vertical" aria-label="أقسام لوحة الطالب">'+MET.map(function(x){return '<button type="button" role="tab" id="spss-me-t-'+x[0]+'" data-g="'+x[0]+'" aria-controls="spss-me-'+x[0]+'" aria-selected="false" tabindex="-1"><i class="fa-solid '+x[1]+'" aria-hidden="true"></i><span>'+x[2]+'</span></button>';}).join('')+'</div><button type="button" class="nins" id="spss-me-ins"><img src="'+ROOT+'icons/logo-128.png?v=3" alt="" width="22" height="22" style="border-radius:6px"><span>تثبيت '+esc(APP_NAME)+' على هاتفك</span></button><a class="nab" href="'+ROOT+'about.html"><span aria-hidden="true">ℹ️</span><span>من نحن</span></a></nav>'+
  '<div class="mn"><p class="who" id="spss-me-w"></p><div class="bd" id="spss-me-b"><p>جارٍ التحميل…</p></div></div></div><p class="cpy" dir="rtl">'+copyHTML()+'</p></div>';
  document.body.appendChild(d);
  d.querySelector('.shd .x').onclick=meClose;meEl('ins').onclick=function(){instOpen(this);};d.querySelector('.mnx').onclick=function(){meDrawer(false);};meEl('bdp').onclick=function(){meDrawer(false);};
  meEl('hb').onclick=function(){if(meDesk()){ls('spss_menav',meCol()?'1':'0');meSync();}else meDrawer(!meD);};
  var tl=d.querySelector('.tl');
  tl.onclick=function(e){var b=e.target.closest('[data-g]');if(!b)return;meSel(b.getAttribute('data-g'));if(!meDesk())meDrawer(false,true);try{d.scrollTo(0,0);}catch(x){d.scrollTop=0;}};
  tl.addEventListener('keydown',function(e){var k=e.key,n=MET.map(function(x){return x[0];}),i=n.indexOf(meTab),j=null;
   if(k==='ArrowDown')j=i+1;else if(k==='ArrowUp')j=i-1;else if(k==='Home')j=0;else if(k==='End')j=n.length-1;if(j==null)return;e.preventDefault();meSel(n[(j+n.length)%n.length],true);});
  document.addEventListener('keydown',function(e){if(!d.classList.contains('open'))return;
   if(e.key==='Escape'){e.preventDefault();if(meD)meDrawer(false);else meClose();return;}
   if(e.key==='Tab'){var box=meD?meEl('nav'):d,f=[].slice.call(box.querySelectorAll('button')).filter(function(x){return x.tabIndex>=0&&x.offsetParent!==null;});if(!f.length)return;var a=document.activeElement,f0=f[0],f1=f[f.length-1];
    if(!box.contains(a)){e.preventDefault();f0.focus();}else if(e.shiftKey&&a===f0){e.preventDefault();f1.focus();}else if(!e.shiftKey&&a===f1){e.preventDefault();f0.focus();}}});
  if(meMQ.addEventListener)meMQ.addEventListener('change',meSync);else if(meMQ.addListener)meMQ.addListener(meSync);}
 d.classList.add('open');document.documentElement.classList.add('spss-lock');var hb=document.querySelector('#spss-ub .ham');if(hb)hb.setAttribute('aria-expanded','true');
 meSel(meTab);meD=!meDesk();meSync();
 if(meD)meDrawer(true);else setTimeout(function(){try{meEl('t-'+meTab).focus();}catch(e){}},60);
 var mc=meCache();if(mc){ME=mc.r;meRender(mc.r);}else document.getElementById('spss-me-b').innerHTML='<p>جارٍ تحميل بياناتك…</p>';
 meGet().then(function(r){if(r&&r.ok||!mc){ME=r;meRender(r);}});}
function meClose(){var d=document.getElementById('spss-me');meD=false;if(d){d.classList.remove('open');meSync();}document.documentElement.classList.remove('spss-lock');var hb=document.querySelector('#spss-ub .ham');if(hb){hb.setAttribute('aria-expanded','false');hb.focus();}}
function meRender(r){var b=document.getElementById('spss-me-b');
 if(!r||!r.ok){b.innerHTML='<p class="spss-polite">'+(r&&r.err==='UNKNOWN_BAC'?'رقمك غير موجود في القوائم. راجع الأستاذ.':'تعذّر جلب بياناتك الآن. أعد المحاولة بعد قليل.')+'</p>';return;}
 var w=r.who||{},fin=/مالية/.test(w.sp||'');
 var wt=((w.nom||'')+' '+(w.prenom||'')).trim()+' · '+(w.sp||'')+(fin&&w.grp?' · الفوج '+w.grp:'');document.getElementById('spss-me-w').textContent=wt;document.getElementById('spss-me-w2').textContent=wt;
 var M=r.marks||{},A=r.att||{},T=r.tt||{},nx=r.next,h='';
 function mrow(o){var sc=o.st==='done'?'<span class="v"><bdi dir="ltr">'+n2(o.s)+'/'+n2(o.tot)+'</bdi> · <bdi dir="ltr">'+n2(o.m20)+'/20</bdi></span>':(o.st==='missed'?'<span class="v"><bdi dir="ltr">0/20</bdi></span>':'');
  if(o.go){ // update64b: سطر 1 العنوان، سطر 2 الحالة + التنبيه، سطر 3 الزر
    var rm=o.rem?'<span class="mrem"><i class="fa-solid fa-bell" aria-hidden="true"></i><span>تنبيه من الأستاذ (<bdi dir="ltr">'+esc(o.rem)+'</bdi>): أجره قبل غلقه</span></span>':'';
    return '<div class="rw mga"><span class="t">'+esc(o.title||o.topic||'')+'</span><div class="mgl">'+bdg(bgS(o.st))+sc+rm+'</div>'+
      '<a class="mgo" href="'+ROOT+'assessment/index.html?go='+encodeURIComponent(o.id)+'"><i class="fa-solid fa-play" aria-hidden="true"></i>اجتياز التقييم</a></div>';}
  return '<div class="rw"><span class="t">'+esc(o.title||o.topic||'')+'</span>'+sc+bdg(bgS(o.st))+'</div>';}
 h+='<section id="spss-me-m" role="tabpanel" aria-labelledby="spss-me-t-m"><h3><i class="fa-solid fa-square-poll-vertical" aria-hidden="true"></i>تتبع علاماتي</h3><div class="avg"><div>معدل تقييمات المحاضرات<b><bdi dir="ltr">'+(M.lecAvg==null?'–':n2(M.lecAvg)+'/20')+'</bdi></b></div>'+(fin?'<div>معدل التطبيقات<b><bdi dir="ltr">'+(M.tpAvg==null?'–':n2(M.tpAvg)+'/20')+'</bdi></b></div>':'')+(M.att3&&!M.att3.na?'<div>حضور التطبيق<b><bdi dir="ltr">'+(M.att3.m3==null?'–':n2(M.att3.m3)+'/3')+'</bdi></b></div>':'')+'</div>';
 h+='<h4>تقييمات المحاضرات</h4>'+((M.lec||[]).map(mrow).join('')||'<p class="nt">لا تقييمات بعد.</p>');
 if(fin){h+='<h4>تقييمات التطبيقات</h4>'+((M.tp||[]).map(mrow).join('')||'<p class="nt">لا تقييمات بعد.</p>');
  }
 else h+='<p class="nt">تخصص «إدارة أعمال»: لا تطبيقات، فالمعدل من تقييمات المحاضرات وحدها.</p>';
 // update64b: علامة الحضور /3 = عمود «حضور التطبيق /3» في قائمة فوجك (حصص التطبيق فقط، مقارنة بأعلى حضور في الفوج)
 var X=M.att3;
 if(X&&X.na)h+='<h4>علامة الحضور <bdi dir="ltr">(/3)</bdi></h4><p class="nt" style="margin-top:0">لا تنطبق على تخصص «إدارة أعمال»: هذه العلامة تخص حضور حصص التطبيق، وتخصصك بلا حصص تطبيقية.</p>';
 else if(X){h+='<h4>علامة الحضور <bdi dir="ltr">(/3)</bdi>: حضور التطبيق</h4><div class="a3">'+
  '<div class="rw"><span class="t">حضورك في حصص التطبيق (ح)</span><span class="v">'+X.n+' من '+X.held+' حصة جرت</span></div>'+
  '<div class="rw"><span class="t">غياباتك المسجَّلة (غ)</span><span class="v">'+X.g+'</span></div>'+
  '<div class="rw"><span class="t">أعلى حضور في فوجك (المرجع)</span><span class="v">'+X.max+'</span></div>'+
  '<div class="rw"><span class="t">علامتك</span><span class="v"><b><bdi dir="ltr">'+(X.m3==null?'–':n2(X.m3)+'/3')+'</bdi></b></span></div></div>'+
  (X.m3==null?'<p class="nt">تظهر العلامة بعد تسجيل أول حضور أو غياب لك في حصص التطبيق.</p>':'');}
 h+='<p class="nt">المعدل بطريقة «النداء»: المحاضرة = العلامة/المجموع × 20، ومتوسطها على التقييمات التي أُجريت فعلاً؛ التطبيق = علامة الحصة /7 × 20؛ التقييم الذي أُجري ولم تنجزه يُحسب 0. '+(fin?'علامة الحضور (/3) هي نفسها عمود «حضور التطبيق /3» في قائمة فوجك: 3 × عدد حصص التطبيق التي حضرتها (ح) ÷ أعلى عدد حضور في فوجك، فيأخذ الأكثر حضوراً 3/3، والغياب (غ) لا يُحتسب حضوراً. ':'')+'علامات مؤقتة تتغير مع كل حصة وكل تقييم.</p></section>';
 function cnt(c){if(!c)return '';return '<div class="avg"><div>حاضر<b>'+c.present+'</b></div><div>غائب<b>'+c.absent+'</b></div><div>مرفوض (غ)<b>'+c.rejected+'</b></div><div>قادم<b>'+c.upcoming+'</b></div><div>نسبة الحضور<b><bdi dir="ltr">'+(c.rate==null?'–':c.rate+'%')+'</bdi></b></div></div>';}
 function arow(x){var isN=nx&&nx.session===x.session;return '<div class="rw'+(isN?' nx':'')+'"><span class="t">'+esc(x.session)+'<br><small style="color:#64748b">'+(x.dt?'<bdi dir="ltr">'+dm(x.dt)+'</bdi>':'')+(x.s?' · <bdi dir="ltr">'+esc(x.s)+'–'+esc(x.e)+'</bdi>':'')+'</small></span>'+bdg(bgA(x.st))+'</div>';}
 // update65: «طلب مراجعة» لكل حصة مضت سُجّلت فيها غائباً (لا تسجيل أو «غ» في النداء)، وحالة الطلب ورد الأستاذ
 var RQ={};(r.rq||[]).forEach(function(q){RQ[q.type+q.num]=q;});
 // update65b: السطر 1 = العنوان + حالة الحضور يساراً؛ السطر 2 = التاريخ يميناً وعنصر المراجعة في الوسط؛ ثم وقت الإرسال/رد الأستاذ
 function arowA(typ){return function(x){var q=RQ[typ+x.num],el=(x.st==='absent'||x.st==='rejected')&&!(q&&q.st==='pending'),isN=nx&&nx.session===x.session;
  var bt=function(lbl){return '<button type="button" class="mrq" data-rqt="'+typ+'" data-rqn="'+x.num+'" aria-expanded="false"><i class="fa-solid fa-flag" aria-hidden="true"></i>'+lbl+'</button>';};
  var mid=q?bdg(rqB(q.st)):(el?bt('طلب مراجعة'):'');
  var low=(q&&q.t?'<div class="mr3"><span class="mrqk">أُرسل الطلب <bdi dir="ltr">'+esc(q.t)+'</bdi></span>'+(q&&el?bt('طلب مراجعة جديد'):'')+'</div>':'')+
   (q&&q.reply?'<div class="mrqr"><i class="fa-solid fa-comment-dots" aria-hidden="true"></i> رد الأستاذ: '+esc(q.reply)+'</div>':'');
  return '<div class="rw mrw'+(isN?' nx':'')+'" data-rqk="'+typ+x.num+'"><div class="mr1"><span class="t">'+esc(x.session)+'</span>'+bdg(bgA(x.st))+'</div>'+
   '<div class="mr2"><small class="md">'+(x.dt?'<bdi dir="ltr">'+dm(x.dt)+'</bdi>':'')+(x.s?' · <bdi dir="ltr">'+esc(x.s)+'–'+esc(x.e)+'</bdi>':'')+'</small>'+(mid?'<span class="mc">'+mid+'</span>':'')+'</div>'+low+'</div>';};}
 h+='<section id="spss-me-a" role="tabpanel" aria-labelledby="spss-me-t-a"><h3><i class="fa-solid fa-clipboard-user" aria-hidden="true"></i>تتبع الحضور</h3><p class="nt" style="margin:0 0 4px">سُجّلت غائباً في حصة حضرتها فعلاً؟ اضغط «طلب مراجعة» بجانبها، فيصل طلبك إلى الأستاذ ويظهر قراره هنا.</p><h4>المحاضرات</h4>'+cnt(A.cLec)+(A.lec||[]).map(arowA('lec')).join('');
 if(fin&&A.tp)h+='<h4>التطبيقات (الفوج '+esc(w.grp||'')+')</h4>'+cnt(A.cTp)+A.tp.map(arowA('tp')).join('');
 h+='</section>';
 function slot(o,lst,lbl){if(!o)return '<p class="nt">'+lbl+'</p>';var up=(lst||[]).filter(function(x){return x.st==='open'||x.st==='upcoming';});var op=up.filter(function(x){return x.st==='open';})[0];
  var s='<div class="rw"><span class="t">اليوم</span><span class="v">'+esc(o.day)+'</span></div><div class="rw"><span class="t">التوقيت</span><span class="v"><bdi dir="ltr">'+esc(o.s)+' – '+esc(o.e)+'</bdi></span></div>'+
  '<div class="rw"><span class="t">المكان</span><span class="v">'+esc(o.room||(lbl.indexOf('فوجك')>=0?'قاعة الإنترنت، المبنى أ، الطابق الأول':'يُعلَن لاحقاً'))+'</span></div>';
  if(op)s+='<div class="rw nx"><span class="t">🟢 التسجيل مفتوح الآن: '+esc(op.session)+'</span></div>';
  if(up.length){var u=up[0];s+='<div class="rw nx"><span class="t">⏭️ الحصة القادمة: '+esc(u.session)+'<br><small><bdi dir="ltr">'+dm(u.dt)+' · '+esc(u.s)+'–'+esc(u.e)+'</bdi></small></span></div>';}
  else s+='<p class="nt">لا حصص قادمة مبرمجة حالياً.</p>';
  s+='<h4>كل الحصص</h4>'+(lst||[]).map(arow).join('');return s;}
 h+='<section id="spss-me-l" role="tabpanel" aria-labelledby="spss-me-t-l"><h3><i class="fa-solid fa-chalkboard-user" aria-hidden="true"></i>توقيت المحاضرات</h3>'+slot(T.lec,A.lec,'لا توقيت محدد.')+'</section>';
 h+='<section id="spss-me-p" role="tabpanel" aria-labelledby="spss-me-t-p"><h3><i class="fa-solid fa-laptop-code" aria-hidden="true"></i>توقيت التطبيقات</h3>'+(fin?slot(T.tp,A.tp,'لا توقيت محدد لفوجك.'):'<p class="nt">تخصص «إدارة أعمال» ليست له حصص تطبيقية.</p>')+'</section>';
 h+='<p class="nt">التسجيل في الحصة يُفتح في توقيتها فقط. آخر تحديث: <bdi dir="ltr">'+esc(r.now||'')+'</bdi></p>';
 b.innerHTML=h;meSel(meTab);b.onclick=rqClick;}
function rqClick(ev){var t=ev.target.closest('button');if(!t)return;var row=t.closest('[data-rqk]');if(!row)return;
 if(t.classList.contains('mrq')){var f=row.querySelector('.mrqf');if(f){f.remove();t.setAttribute('aria-expanded','false');return;}
  [].forEach.call(document.querySelectorAll('#spss-me .mrqf'),function(x){var b=x.parentNode.querySelector('.mrq');if(b)b.setAttribute('aria-expanded','false');x.remove();});
  var id='spss-rqn-'+row.getAttribute('data-rqk');f=document.createElement('div');f.className='mrqf';
  f.innerHTML='<label for="'+id+'">ملاحظة للأستاذ (اختيارية، 200 حرف على الأكثر)</label><textarea id="'+id+'" maxlength="200" rows="2" placeholder="مثال: كنت حاضراً في المدرج ولم يُسجَّل حضوري."></textarea><div class="mrqb"><button type="button" class="mrqs" data-t="'+t.getAttribute('data-rqt')+'" data-n="'+t.getAttribute('data-rqn')+'"><i class="fa-solid fa-paper-plane" aria-hidden="true"></i>إرسال الطلب</button><button type="button" class="mrqc">إلغاء</button><span class="mrqk" aria-live="polite">0/200</span></div><p class="mrqe" role="alert"></p>';
  row.appendChild(f);t.setAttribute('aria-expanded','true');var ta=f.querySelector('textarea');ta.oninput=function(){f.querySelector('.mrqk').textContent=ta.value.length+'/200';};try{ta.focus();}catch(e){}return;}
 if(t.classList.contains('mrqc')){var f2=row.querySelector('.mrqf'),b2=row.querySelector('.mrq');if(f2)f2.remove();if(b2){b2.setAttribute('aria-expanded','false');b2.focus();}return;}
 if(t.classList.contains('mrqs')){var f3=row.querySelector('.mrqf'),er=f3.querySelector('.mrqe'),k=row.getAttribute('data-rqk');t.disabled=true;er.textContent='';
  post({action:'asrqadd',sbac:ID.bac,type:t.getAttribute('data-t'),num:t.getAttribute('data-n'),note:f3.querySelector('textarea').value.slice(0,200)}).then(function(r){
   if(r&&r.ok){if(ME){ME.rq=r.rq;meRender(ME);}var nr=document.querySelector('#spss-me [data-rqk="'+k+'"] .mr2');if(nr){nr.setAttribute('tabindex','-1');try{nr.focus();}catch(e){}}return;}
   t.disabled=false;er.textContent=RQE[r&&r.err]||'تعذّر إرسال الطلب الآن. أعد المحاولة بعد قليل.';}).catch(function(){t.disabled=false;er.textContent='تعذّر الاتصال. أعد المحاولة.';});}}

// ===== update67b: رابط «من نحن» في قائمة لوحة الأستاذ =====
function aboutNav(){if(PAGE!=='teacher')return;var n=document.getElementById('nav');if(!n||document.getElementById('spss-tab'))return;var a=document.createElement('a');a.id='spss-tab';a.className='spss-tab';a.href=ROOT+'about.html';a.innerHTML='<span aria-hidden="true">ℹ️</span><span>من نحن</span>';n.appendChild(a);}
// ===== update67b: سطر حقوق النشر أسفل الصفحات =====
function copyInit(){var ex=document.getElementById('spss-copy');if(ex&&ex.getAttribute('data-static')){ex.innerHTML=copyHTML();return;}if(ex||!document.body)return;
 var f=document.querySelector('body > footer')||document.querySelector('footer'),el;
 if(f){el=document.createElement('p');el.className='in';f.appendChild(el);}else{el=document.createElement('footer');document.body.appendChild(el);}
 el.id='spss-copy';el.setAttribute('dir','rtl');el.setAttribute('lang','ar');el.innerHTML=copyHTML();
 var t=0;function fix(){var h=0,H=innerHeight;var a=document.querySelectorAll('body *');for(var i=0;i<a.length;i++){var e=a[i];if(e.closest&&e.closest('#spss-lg,#spss-ins,#spss-me,#spss-copy'))continue;var cs=getComputedStyle(e);if(cs.position!=='fixed'||cs.display==='none'||cs.visibility==='hidden')continue;var r=e.getBoundingClientRect();if(r.height>0&&r.height<H*0.4&&r.width>innerWidth*0.3&&r.bottom>=H-4&&r.top>H*0.5)h=Math.max(h,H-r.top);}el.style.marginBottom=h?Math.ceil(h+6)+'px':'';}
 function q(){clearTimeout(t);t=setTimeout(fix,250);}fix();setTimeout(fix,1500);addEventListener('resize',q);addEventListener('load',q);}
// ===== update67: تثبيت المنصة على الهاتف (PWA) =====
var LOGO_IMG='<img src="'+ROOT+'icons/logo-128.png?v=3" alt="" width="54" height="54" decoding="async">';
var SVG_SHARE='<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><path d="M12 3v12"/><path d="m7.5 7.5 4.5-4.5 4.5 4.5"/><path d="M6 11H5a1 1 0 0 0-1 1v8a1 1 0 0 0 1 1h14a1 1 0 0 0 1-1v-8a1 1 0 0 0-1-1h-1"/></svg>';
var SVG_ADD='<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><rect x="4" y="4" width="16" height="16" rx="4"/><path d="M12 8v8M8 12h8"/></svg>';
var UA=navigator.userAgent||'';
var IOS=/iPhone|iPad|iPod/i.test(UA)||(/Macintosh/.test(UA)&&navigator.maxTouchPoints>1);
var ANDR=/Android/i.test(UA);
var INAPP=/FBAN|FBAV|FB_IAB|FBIOS|FB4A|Messenger|Instagram|Line\/|MicroMessenger|Snapchat|TikTok|musical_ly|Twitter|MoodleMobile|; wv\)|GSA\//i.test(UA);
var INS={bip:null,want:0,ret:null,why:''};
function isSA(){try{if(navigator.standalone===true)return true;return ['standalone','fullscreen','minimal-ui','window-controls-overlay'].some(function(m){return window.matchMedia('(display-mode: '+m+')').matches;});}catch(e){return false;}}
function instMark(src){ls('spss_inst','1');ls('spss_inst_src',src||'');instClose();}
function instSnz(){var t=Number(lg('spss_inst_snz')||0);return t&&t>Date.now();}
function instInit(){
 try{document.documentElement.setAttribute('data-ins',isSA()?'sa':(IOS?'ios':(INAPP?'inapp':'web')));}catch(e){}
 if(isSA()){if(lg('spss_inst')!=='1')ls('spss_inst_src','standalone');ls('spss_inst','1');}
 if('serviceWorker' in navigator&&location.protocol==='https:'){try{navigator.serviceWorker.register(ROOT+'sw.js',{scope:new URL(ROOT).pathname}).catch(function(){});}catch(e){}}
 if(isSA())return;
 window.addEventListener('beforeinstallprompt',function(e){e.preventDefault();INS.bip=e;
  // المتصفح لا يعرض هذا الحدث إن كانت المنصة مثبتة: علامة «مثبتة» قديمة ⇒ أُزيلت التطبيق
  if(lg('spss_inst')==='1'&&lg('spss_inst_src')!=='ios-btn'){ls('spss_inst',null);}
  if(INS.want===1)instShow('bip');});
 window.addEventListener('appinstalled',function(){instMark('appinstalled');});
 if(navigator.getInstalledRelatedApps){try{navigator.getInstalledRelatedApps().then(function(a){if(a&&a.length)instMark('related');}).catch(function(){});}catch(e){}}
 if(!ID)return;
 var after=sg('spss_inst_after')==='1';
 var auto=ID.role==='teacher'?(after&&lg('spss_inst_t')!=='1'):(after||(PAGE!=='session'&&sg('spss_inst_seen')!=='1'));
 if(!auto)return;
 setTimeout(function(){
  if(lg('spss_inst')==='1'||isSA()||instSnz()||document.getElementById('spss-ins')||document.getElementById('spss-lg'))return;
  if(INAPP)return instShow('inapp');
  if(IOS)return instShow('ios');
  if(INS.bip)return instShow('bip');
  // لم يصل beforeinstallprompt بعد: ننتظره قليلاً؛ إن لم يصل (مثبتة على الأرجح أو متصفح لا يدعم) لا نُلحّ
  INS.want=1;setTimeout(function(){INS.want=2;},5000);
 },1200);}
function instClose(){var w=document.getElementById('spss-ins');if(!w)return;w.remove();try{if(INS.ret&&INS.ret.focus)INS.ret.focus();}catch(e){}INS.ret=null;}
function instOpen(btn){INS.ret=btn||null;
 if(isSA())return instShow('done',1);
 if(INAPP)return instShow('inapp',1);
 if(IOS)return instShow('ios',1);
 if(INS.bip)return instShow('bip',1);
 instShow('manual',1);}
function instShow(kind,manual){if(document.getElementById('spss-ins'))return;
 if(!manual){ss('spss_inst_seen','1');ss('spss_inst_after',null);if(ID&&ID.role==='teacher')ls('spss_inst_t','1');}
 INS.why=kind;var link=ROOT+'index.html';
 var head='<div class="hd"><div class="lg">'+LOGO_IMG+'</div><div><span class="kk">'+esc(APP_NAME)+'</span><h2 id="spss-ins-h">';
 var x='</h2></div><button type="button" class="x" data-a="x" aria-label="إغلاق">✕</button></div>';
 var lead='<p id="spss-ins-d">افتح '+esc(APP_NAME)+' مباشرة من الشاشة الرئيسية بلمسة واحدة، دون المرور برابط Moodle أو رمز QR في كل مرة.</p>';
 var later='<button type="button" class="s" data-a="later">لاحقًا</button>',h='';
 if(kind==='bip')h=head+'ثبّت '+esc(APP_NAME)+' على هاتفك'+x+lead+'<div class="bt"><button type="button" class="p" data-a="go">📲 تثبيت</button>'+later+'</div>';
 else if(kind==='ios')h=head+'ثبّت '+esc(APP_NAME)+' على هاتفك'+x+lead+'<p><b>اضغط زر المشاركة ثم إضافة إلى الشاشة الرئيسية</b></p><ol><li><span class="n">1</span>'+SVG_SHARE+'<span>اضغط زر <b>المشاركة</b> في شريط Safari</span></li><li><span class="n">2</span>'+SVG_ADD+'<span>اختر <b>«إضافة إلى الشاشة الرئيسية»</b></span></li><li><span class="n">3</span><span class="lg" style="width:24px;height:24px;border-radius:7px;box-shadow:none">'+LOGO_IMG+'</span><span>اضغط <b>«إضافة»</b> ثم افتح المنصة من أيقونتها في الشاشة الرئيسية</span></li></ol><div class="bt"><button type="button" class="p" data-a="added">✓ تمت الإضافة</button>'+later+'</div>';
 else if(kind==='inapp')h=head+'افتح الرابط في Chrome أو Safari'+x+'<p id="spss-ins-d">أنت تتصفح من داخل تطبيق (فيسبوك، ماسنجر، Moodle…) لا يسمح بتثبيت المنصة. افتح الرابط في <b>Chrome</b> (أندرويد) أو <b>Safari</b> (آيفون) أولاً، ثم ثبّتها من هناك.</p><div class="lk"><input type="text" readonly value="'+esc(link)+'" aria-label="رابط المنصة"><button type="button" data-a="copy">نسخ الرابط</button></div><div class="bt">'+(ANDR?'<a class="p" data-a="chrome" href="intent://'+esc(link.replace(/^https?:\/\//,''))+'#Intent;scheme=https;package=com.android.chrome;end">فتح في Chrome</a>':'')+later+'</div>';
 else if(kind==='done')h=head+esc(APP_NAME)+' مثبتة'+x+'<p id="spss-ins-d" class="ok">✓ '+esc(APP_NAME)+' مثبتة على هذا الجهاز وتعمل الآن كتطبيق.</p><div class="bt"><button type="button" class="p" data-a="x">حسناً</button></div>';
 else h=head+'ثبّت '+esc(APP_NAME)+' على هاتفك'+x+(lg('spss_inst')==='1'?'<p id="spss-ins-d" class="ok">✓ المنصة مثبتة على هذا الجهاز على الأرجح: ابحث عن أيقونة «'+esc(APP_SHORT)+'» في الشاشة الرئيسية.</p>':lead)+'<p>إن لم تكن مثبتة: من قائمة المتصفح <b>⋮</b> اختر <b>«تثبيت التطبيق»</b> أو <b>«إضافة إلى الشاشة الرئيسية»</b>.</p><div class="bt"><button type="button" class="p" data-a="x">حسناً</button></div>';
 var w=document.createElement('div');w.id='spss-ins';w.setAttribute('data-k',kind);
 w.innerHTML='<div class="bd" data-a="x"></div><div class="sh" role="dialog" aria-modal="true" aria-labelledby="spss-ins-h" aria-describedby="spss-ins-d" tabindex="-1"><div class="gr" aria-hidden="true"></div>'+h+'</div>';
 document.body.appendChild(w);
 var sh=w.querySelector('.sh'),f=w.querySelector('.bt .p')||w.querySelector('.bt button')||sh;try{f.focus({preventScroll:true});}catch(e){}
 w.addEventListener('keydown',function(e){if(e.key==='Escape'){e.stopPropagation();instClose();return;}
  if(e.key==='Tab'){var fs=Array.prototype.filter.call(sh.querySelectorAll('button,a[href],input'),function(n){return n.offsetParent!==null;});if(!fs.length)return;var a0=fs[0],a1=fs[fs.length-1];
   if(e.shiftKey&&document.activeElement===a0){e.preventDefault();a1.focus();}else if(!e.shiftKey&&document.activeElement===a1){e.preventDefault();a0.focus();}}});
 w.addEventListener('click',function(e){var b=e.target.closest('[data-a]');if(!b)return;var a=b.getAttribute('data-a');
  if(a==='x')instClose();
  else if(a==='later'){ls('spss_inst_snz',String(Date.now()+3*864e5));instClose();}
  else if(a==='added')instMark('ios-btn');
  else if(a==='go'&&INS.bip){var ev=INS.bip;INS.bip=null;try{ev.prompt();ev.userChoice.then(function(c){if(c&&c.outcome==='accepted')instMark('prompt');else instClose();}).catch(function(){instClose();});}catch(err){instClose();}}
  else if(a==='copy'){var inp=w.querySelector('.lk input'),okf=function(){b.textContent='✓ تم النسخ';};
   try{if(navigator.clipboard&&navigator.clipboard.writeText)navigator.clipboard.writeText(link).then(okf,function(){inp.select();try{document.execCommand('copy');okf();}catch(x){}});else{inp.select();document.execCommand('copy');okf();}}catch(err){inp.select();}}});}

/* update82: تحميل الدرس للعمل دون اتصال (قراءة فقط). الحضور والتقييم والتنبيهات تبقى عبر الشبكة. */
function offLesson(){if(PAGE!=='session'||!('caches' in window)||!navigator.serviceWorker)return;
 var LC='spss-lesson-v1',pg=location.href.split('#')[0].split('?')[0],K='spss_off_'+location.pathname,b=document.body;
 var FA='https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/webfonts/';
 function urls(){var u=[pg];Array.prototype.forEach.call(document.querySelectorAll('script[src],link[rel="stylesheet"][href],img[src],link[rel="icon"][href],link[rel="manifest"][href]'),function(e){var x=e.src||e.href;if(x&&/^https?:/.test(x)&&!/script\.google|googleapis\.com\/.*(identitytoolkit|firestore)|gstatic\.com\/firebasejs/.test(x))u.push(x);});
  ['fa-solid-900.woff2','fa-regular-400.woff2','fa-brands-400.woff2'].forEach(function(f){u.push(FA+f);});
  return u.filter(function(x,i){return u.indexOf(x)===i;});}
 if(!navigator.onLine&&lg(K)){var un=function(){if(b.classList.contains('att-locked'))b.classList.remove('att-locked');};un();try{new MutationObserver(un).observe(b,{attributes:true,attributeFilter:['class']});}catch(e){}}
 var box=null;
 function paint(st,t){if(!box)return;var m={none:['📥 تحميل دون اتصال','غير محمَّل'],ing:['⏳ جارٍ التحميل…',t||''],ok:['✅ متاح دون اتصال',t||''],err:['⚠️ تعذّر التحميل — أعد المحاولة',t||'']}[st];
  box.innerHTML='<button type="button" class="ol-go" '+(st==='ing'||st==='ok'?'disabled':'')+'>'+m[0]+'</button> <small class="ol-s">'+esc(m[1])+'</small>'+(st==='ok'?' <button type="button" class="ol-rm" title="حذف النسخة" aria-label="حذف النسخة">🗑️</button>':'')+(navigator.onLine?'':' <small>(أنت دون اتصال: الحضور والتقييم يحتاجان الشبكة)</small>');
  var g=box.querySelector('.ol-go'),r=box.querySelector('.ol-rm');if(g&&st!=='ok')g.onclick=dl;if(r)r.onclick=rm;}
 function dl(){if(!navigator.onLine){paint('err','لا يوجد اتصال');return;}paint('ing');var L=urls(),n=0,bad=0;
  caches.open(LC).then(function(c){return Promise.all(L.map(function(u){var same=u.indexOf(location.origin)===0;
   return fetch(u,same?{cache:'reload',credentials:'same-origin'}:{mode:'no-cors'}).then(function(r){if(r&&(r.ok||r.type==='opaque'))return c.put(u,r).then(function(){n++;paint('ing',n+' / '+L.length);});bad++;}).catch(function(){bad++;});}));})
  .then(function(){if(bad&&n<2)throw 0;ls(K,JSON.stringify({t:Date.now(),n:n}));paint('ok',stamp());}).catch(function(){paint('err');});}
 function rm(){caches.open(LC).then(function(c){return c.delete(pg);}).then(function(){ls(K,null);paint('none');});}
 function stamp(){var o=pj(lg(K));return o?('حُمِّل '+new Date(o.t).toLocaleString('ar-DZ',{dateStyle:'short',timeStyle:'short'})):'';}
 function show(){if(box||b.classList.contains('att-locked'))return;box=document.createElement('div');box.className='spss-off';box.setAttribute('role','status');
  var a=document.getElementById('mod-attendance')||document.getElementById('mod-slides'),w=document.getElementById('main-content-wrapper');if(a&&a.parentNode)a.parentNode.insertBefore(box,a.nextSibling);else if(w)w.insertBefore(box,w.firstChild);else b.insertBefore(box,b.firstChild);
  if(lg(K))caches.open(LC).then(function(c){return c.match(pg);}).then(function(h){if(h)paint('ok',stamp());else{ls(K,null);paint('none');}});else paint('none');}
 var st=document.createElement('style');st.textContent='.spss-off{margin:12px auto;max-width:56rem;padding:10px 12px;border:1px solid #f59e0b55;border-radius:12px;background:#fffbeb;color:#78350f;font-size:14px;display:flex;flex-wrap:wrap;gap:8px;align-items:center}.dark .spss-off{background:#1e293b;color:#fde68a}.spss-off button{padding:6px 12px;border-radius:10px;background:#d97706;color:#fff;font-weight:700}.spss-off button[disabled]{opacity:.75}.spss-off .ol-rm{background:#64748b}';document.head.appendChild(st);
 show();try{new MutationObserver(show).observe(b,{attributes:true,attributeFilter:['class']});}catch(e){}
 window.addEventListener('online',function(){if(box)paint(lg(K)?'ok':'none',stamp());});window.addEventListener('offline',function(){if(box)paint(lg(K)?'ok':'none',stamp());});}

/* update86: بوابة الدرس (زرّان: عرض الشرائح / عرض المحتوى) + قارئ كتاب بملء الشاشة صفحةً صفحة، يُغلق بـ ✕ إلى البوابة؛ حفظ الموضع محلياً لكل درس ومستخدم. */
function bookMode(){if(PAGE!=='session')return;var b=document.body;
 var S=Array.prototype.filter.call(document.querySelectorAll('section.module-card[id^="mod-"]'),function(x){return x.id!=='mod-attendance'&&x.id!=='mod-slides';});
 var SL=document.getElementById('mod-slides'),SYN=false;
 /* update87: صفحات مبنية على الشرائح فقط (مثل التطبيق 2): يُبنى «المحتوى» من نسخ الشرائح دون المساس بالعارض الأصلي */
 if(S.length<2){var SS=document.querySelectorAll('#dk .trk > .sl');if(SS.length<2)return;SYN=true;
  var hold=document.createElement('div');hold.id='bk-syn';var anc=document.getElementById('mod-intro')||SL;anc.parentNode.insertBefore(hold,anc.nextSibling);
  S=Array.prototype.map.call(SS,function(sl,i){var c=sl.cloneNode(true);Array.prototype.forEach.call(c.querySelectorAll('[id]'),function(e){e.removeAttribute('id');});Array.prototype.forEach.call(c.querySelectorAll('script,button,input,video,audio,iframe'),function(e){e.remove();});
   var h=c.querySelector('h3,h2'),sec=document.createElement('section');sec.id='mod-bk'+(i+1);sec.className='module-card bk-sl';
   sec.innerHTML='<div class="bk-sh">'+(h?esc((h.textContent||'').trim()):('الشريحة '+(i+1)))+'</div><div class="bk-sb"></div>';if(h)h.remove();
   var bd=sec.querySelector('.bk-sb');while(c.firstChild)bd.appendChild(c.firstChild);hold.appendChild(sec);return sec;});
  var s2=document.createElement('style');s2.textContent='.bk-sl{background:#fff;border-radius:16px;box-shadow:0 4px 18px -10px #0f274466;color:#0f172a;line-height:1.8;font-size:15px}.dark .bk-sl{background:#1e293b;color:#e2e8f0}.bk-sl .bk-sh{padding:14px 16px;font-weight:800;font-size:17px;border-bottom:1px solid #e2e8f0;background:#f8fafc;border-radius:16px 16px 0 0}.dark .bk-sl .bk-sh{background:#0f172a;border-color:#334155}.bk-sl .bk-sb{padding:12px 16px}.bk-sl .bk-sb>*{margin:6px 0}.bk-sl .hdr{font-size:13px;opacity:.75}.bk-sl .tag{display:inline-block;background:#fef3c7;color:#92400e;border-radius:8px;padding:2px 8px;font-size:12px;font-weight:700}.bk-sl table{width:100%;border-collapse:collapse;font-size:13px}.bk-sl td,.bk-sl th{border:1px solid #cbd5e1;padding:4px}.bk-sl img{max-width:100%;height:auto}';document.head.appendChild(s2);}
 var who=ID?(ID.role==='teacher'?'T':String(ID.bac||'')):'g',K='spss_book_'+location.pathname+'|'+who;
 var st=document.createElement('style');st.textContent='#bk-hub .s3{background:#4f46e5}#bk-hub .rw{flex-wrap:nowrap!important;align-items:stretch!important}#bk-hub .rw>a,#bk-hub .rw>.ofs{flex:1 1 0;min-width:0;display:flex}#bk-hub .rw>a{align-items:center;justify-content:center;text-decoration:none}#bk-hub .rw .spss-off{width:100%;justify-content:center}header.sticky{display:none!important}#spss-ub .thm{flex:none;width:38px;height:38px;border-radius:12px;border:1px solid rgba(255,255,255,.18);background:rgba(255,255,255,.1);color:#fbbf24;font-size:17px;display:inline-flex;align-items:center;justify-content:center;margin:0;padding:0;cursor:pointer}#spss-pns{display:none!important}.bk-lkh,html.bk-lk .spss-off,html.bk-lk #bk-hub{display:none!important}html.bk-lk #main-content-wrapper{padding-top:12px}.bk-off{display:none!important}.bk-in{animation:bkIn .26s ease}.bk-inr{animation:bkInR .26s ease}@keyframes bkIn{from{opacity:.2;transform:translateX(-36px)}to{opacity:1;transform:none}}@keyframes bkInR{from{opacity:.2;transform:translateX(36px)}to{opacity:1;transform:none}}'+
  '#bk-hub{max-width:56rem;margin:16px auto;padding:18px 16px;border-radius:18px;background:#fff;color:#0f172a;box-shadow:0 8px 30px -12px #0f274455;text-align:center}.dark #bk-hub{background:#1e293b;color:#e2e8f0}#bk-hub h2{font-weight:800;font-size:18px;margin:0 0 12px}#bk-hub .bt{display:flex;flex-direction:column;gap:12px}#bk-hub button{padding:14px 16px;border-radius:14px;font-weight:800;font-size:16px;color:#fff}#bk-hub .s1{background:#0284c7}#bk-hub .s2{background:#d97706}#bk-hub small{display:block;margin-top:10px;opacity:.75}#bk-hub .sm{font-size:14px;opacity:.8;margin:-6px 0 10px;line-height:1.7}#bk-hub .stt{display:inline-block;font-size:13px;font-weight:700;padding:4px 12px;border-radius:999px;background:#ecfdf5;color:#047857;margin-bottom:12px}.dark #bk-hub .stt{background:#064e3b;color:#a7f3d0}#bk-hub .rw{display:flex;flex-wrap:wrap;justify-content:center;align-items:center;gap:8px;margin-top:12px}#bk-hub .rw>button,#bk-hub .rw>a,#bk-hub .rw .spss-off{padding:6px 12px!important;border-radius:10px;font-size:13px!important;font-weight:700;background:#f1f5f9;color:#0f172a;border:1px solid #cbd5e1;margin:0!important;box-shadow:none!important;min-height:0!important;max-width:100%}.dark #bk-hub .rw>button,.dark #bk-hub .rw>a,.dark #bk-hub .rw .spss-off{background:#334155;color:#e2e8f0;border-color:#475569}#bk-hub .rw .spss-off *{font-size:13px!important;margin:0!important;padding:0!important}#bk-hub .rw .spss-off p,#bk-hub .rw .spss-off small{display:none}#bk-hub .rw .spss-off button{background:none!important;color:inherit!important;border:0!important}.bk-meta{display:grid;grid-template-columns:1fr 1fr;gap:8px;margin:10px 0}.bk-meta>div{background:#0c4a6e!important}#bk-top .ix{padding:6px 10px;border-radius:10px;background:#e2e8f0;color:#0f172a;font-weight:700;font-size:13px;flex:none}.dark #bk-top .ix{background:#334155;color:#e2e8f0}#bk-ix{position:absolute;inset:0;z-index:5;background:#0008;display:flex;align-items:flex-start;justify-content:center;padding:56px 12px}#bk-ix .c{background:#fff;color:#0f172a;border-radius:16px;width:100%;max-width:30rem;max-height:80vh;overflow:auto;padding:8px}.dark #bk-ix .c{background:#1e293b;color:#e2e8f0}#bk-ix .hd{display:flex;justify-content:space-between;font-weight:800;padding:8px}#bk-ix .c>button{display:block;width:100%;text-align:right;padding:10px;border-top:1px solid #e2e8f055;font-size:14px}'+
  'html.bk-lock,html.bk-lock body{overflow:hidden!important}#bk-rd{position:fixed;inset:0;z-index:9000;background:#f8fafc;display:flex;flex-direction:column}.dark #bk-rd{background:#0f172a}#bk-top{display:flex;align-items:center;gap:8px;padding:calc(6px + env(safe-area-inset-top)) 10px 4px;font-size:13px;color:#475569}.dark #bk-top{color:#cbd5e1}#bk-top .x{width:38px;height:38px;border-radius:50%;background:#0f2744;color:#fff;font-size:18px;flex:none}#bk-top .t{flex:1;overflow:hidden;white-space:nowrap;text-overflow:ellipsis}#bk-pg{height:3px;background:#e2e8f0}#bk-pg i{display:block;height:3px;background:#f59e0b;transition:width .25s}#bk-sc{flex:1;overflow-y:auto;-webkit-overflow-scrolling:touch;padding:8px 8px calc(76px + env(safe-area-inset-bottom))}#bk-sc>section{margin:0 auto!important;max-width:56rem}.bk-ar{position:fixed;bottom:calc(12px + env(safe-area-inset-bottom));height:48px;padding:0 16px;border-radius:24px;background:#d97706;color:#fff;font-size:16px;font-weight:800;z-index:9001;box-shadow:0 6px 18px -4px #0007;border:2px solid #fff;display:flex;align-items:center;gap:6px}.bk-ar[disabled]{opacity:.25}#bk-nx{left:10px}#bk-pv{right:10px}';
 document.head.appendChild(st);
 var P=[],AT=[],cur=0,rd=null,sc=null,ph=[],tm=0,open=false;
 function vis(e){return e.offsetHeight>0;}
 function isHd(x){if(/^H[1-6]$/.test(x.tagName))return true;if(x.offsetHeight>130)return false;var t=(x.textContent||'').trim().length;var h=x.querySelector&&x.querySelector('h1,h2,h3,h4,h5,h6');return !!h&&t<=(h.textContent||'').trim().length+40;}
 function atoms(e,H,out){var k=Array.prototype.filter.call(e.children,function(x){return !/^(SCRIPT|STYLE)$/.test(x.tagName);});if(e.offsetHeight>H&&k.filter(vis).length>=1)k.forEach(function(x){atoms(x,H,out);});else out.push(e);}
 function measure(){AT.concat(S).forEach(function(x){x.classList.remove('bk-off');});P=[];AT=[];var H=Math.max(300,sc.clientHeight-50);
  S.forEach(function(sec){var kids=Array.prototype.filter.call(sec.children,function(x){return !/^(SCRIPT|STYLE)$/.test(x.tagName);});
   var head=kids.length>1?kids[0]:null,body=kids.slice(head?1:0),hh=head?head.offsetHeight:0,L=[];body.forEach(function(x){atoms(x,H-hh,L);});
   var pg={s:sec,a:[]},used=hh;L.forEach(function(x){var h=x.offsetHeight;if(pg.a.length&&h>0&&used+h>H){var mv=[];while(pg.a.length>1&&isHd(pg.a[pg.a.length-1]))mv.unshift(pg.a.pop());P.push(pg);pg={s:sec,a:mv};used=hh;mv.forEach(function(m){used+=m.offsetHeight;});}pg.a.push(x);used+=h;AT.push(x);});P.push(pg);});
  P.forEach(function(p){var n=P.filter(function(q){return q.s===p.s;});p.k=n.indexOf(p)+1;p.n=n.length;});}
 function title(p){var h=p.s.querySelector('.bk-sh,h2,h3');return (h?(h.textContent||'').trim().replace(/\s+/g,' ').slice(0,60):'')+(p.n>1?' ('+p.k+'/'+p.n+')':'');}
 function save(){if(!P[cur])return;ls(K,JSON.stringify({i:cur,n:P.length,sid:P[cur].s.id,k:P[cur].k,t:Date.now()}));}
 function go(i,dir){i=Math.max(0,Math.min(P.length-1,i));var p=P[i];
  S.forEach(function(x){x.classList.toggle('bk-off',x!==p.s);x.classList.remove('bk-in','bk-inr');});
  AT.forEach(function(x){x.classList.toggle('bk-off',p.a.indexOf(x)<0&&x.closest('section')===p.s);});cur=i;
  if(dir){void p.s.offsetWidth;p.s.classList.add(dir>0?'bk-in':'bk-inr');}sc.scrollTop=0;
  rd.querySelector('.t').innerHTML='<b>'+(cur+1)+' / '+P.length+'</b> · '+esc(title(p));rd.querySelector('#bk-pg i').style.width=Math.round((cur+1)*100/P.length)+'%';
  rd.querySelector('#bk-pv').disabled=cur<=0;rd.querySelector('#bk-nx').disabled=cur>=P.length-1;save();}
 function find(o){if(!o)return 0;if(o.n===P.length&&o.i<P.length)return o.i;var j=-1;P.forEach(function(p,i){if(j<0&&p.s.id===o.sid&&p.k>=Math.min(o.k||1,p.n))j=i;});return j<0?0:j;}
 function enter(target){if(open)return;open=true;
  rd=document.createElement('div');rd.id='bk-rd';rd.setAttribute('role','dialog');rd.setAttribute('aria-label','قارئ الدرس');
  rd.innerHTML='<div id="bk-top"><button type="button" class="x" aria-label="إغلاق والعودة">✕</button><button type="button" class="ix">📑 الفهرس</button><div class="t"></div></div><div id="bk-pg"><i></i></div><div id="bk-sc"></div><button type="button" class="bk-ar" id="bk-pv" aria-label="الصفحة السابقة"><bdi dir="ltr">→</bdi> السابقة</button><button type="button" class="bk-ar" id="bk-nx" aria-label="الصفحة التالية">التالية <bdi dir="ltr">←</bdi></button>';
  b.appendChild(rd);sc=rd.querySelector('#bk-sc');ph=S.map(function(x){var c=document.createComment('bk');x.parentNode.insertBefore(c,x);sc.appendChild(x);return c;});
  document.documentElement.classList.add('bk-lock');try{var de=document.documentElement;if(de.requestFullscreen&&!document.fullscreenElement)de.requestFullscreen().catch(function(){});}catch(e){}
  rd.querySelector('.x').onclick=exit;rd.querySelector('.ix').onclick=idx;rd.querySelector('#bk-pv').onclick=function(){go(cur-1,-1);};rd.querySelector('#bk-nx').onclick=function(){go(cur+1,1);};
  setTimeout(function(){measure();var o=pj(lg(K)),i=target!=null?target:find(o);go(i,0);if(target==null&&i>0)toast('تابعتَ من حيث توقفت: صفحة '+(i+1)+' من '+P.length);},60);}
 function exit(){if(!open)return;open=false;AT.concat(S).forEach(function(x){x.classList.remove('bk-off','bk-in','bk-inr');});
  S.forEach(function(x,i){ph[i].parentNode.insertBefore(x,ph[i]);ph[i].remove();});rd.remove();rd=null;document.documentElement.classList.remove('bk-lock');
  try{if(document.fullscreenElement&&document.exitFullscreen)document.exitFullscreen().catch(function(){});}catch(e){}hubShow();}
 function toast(t){var d=document.createElement('div');d.textContent=t;d.style.cssText='position:fixed;top:60px;left:50%;transform:translateX(-50%);background:#0f2744;color:#fff;padding:8px 14px;border-radius:12px;z-index:9999;font-size:14px;box-shadow:0 6px 20px #0005';b.appendChild(d);setTimeout(function(){d.remove();},2800);}
 function lean(h,sm){b.classList.add('bk-lean');
  var q=function(sel){return Array.prototype.slice.call(document.querySelectorAll(sel));};
  q('#spss-pns,.spss-free,#btn-font-dec,#btn-font-reset,#btn-font-inc,#btn-expand-all').forEach(function(e){(e.id==='btn-font-dec'?e.parentNode:e).classList.add('bk-off');});
  var cs=document.getElementById('content-search');if(cs){var stp=cs.closest('div.sticky,div[class*="sticky"]')||cs.parentNode;stp.classList.add('bk-off');}
  Array.prototype.forEach.call(b.children,function(e){if(e.tagName!=='DIV'||e.id||e===hub)return;var c=getComputedStyle(e);if(c.position!=='fixed')return;var r=e.getBoundingClientRect();if(r.height<=8||(r.height<=70&&r.width<=90))e.classList.add('bk-off');});
  q('.fixed').forEach(function(e){if(e.tagName==='BUTTON'||(e.querySelector&&e.querySelector('.fa-arrow-up,.fa-chevron-up,.fa-angle-up')&&e.offsetWidth<90))if(!e.closest('#bk-rd,#spss-ub,#dk'))e.classList.add('bk-off');});
  if(h){var ban=h.closest('section.relative');if(ban){var g=ban.querySelector('.grid');if(g&&S[0]&&!SYN){var kids=Array.prototype.filter.call(S[0].children,function(x){return !/^(SCRIPT|STYLE)$/.test(x.tagName);});g.classList.add('bk-meta');if(kids.length>1)kids[0].parentNode.insertBefore(g,kids[1]);else S[0].insertBefore(g,S[0].firstChild);}ban.classList.add('bk-off');}}
  var a=document.getElementById('mod-attendance');if(a)a.classList.add('bk-off');
  var o=b.querySelector('.spss-off');if(o)hub.querySelector('.ofs').appendChild(o);
  if(SL)Array.prototype.forEach.call(SL.querySelectorAll('ol>li'),function(li){if(/^\s*①/.test(li.textContent||''))li.classList.add('bk-off');});}
 function idx(){if(!rd||rd.querySelector('#bk-ix'))return;var d=document.createElement('div');d.id='bk-ix';var seen={};
  d.innerHTML='<div class="c"><div class="hd">📑 الفهرس <button type="button" class="z">✕</button></div>'+P.map(function(p,i){if(seen[p.s.id])return'';seen[p.s.id]=1;var t=p.s.querySelector('.bk-sh,h2,h3');return '<button type="button" data-i="'+i+'">'+esc(t?(t.textContent||'').trim().replace(/\s+/g,' ').slice(0,70):('قسم '+(i+1)))+'</button>';}).join('')+'</div>';
  d.onclick=function(e){var t=e.target.closest('button');if(e.target===d||(t&&t.classList.contains('z'))){d.remove();return;}if(t&&t.dataset.i){d.remove();go(+t.dataset.i,0);}};rd.appendChild(d);}
 function thm(){var u=document.getElementById('spss-ub');if(!u||u.querySelector('.thm'))return!!u;var g=u.querySelector('.bdg');var t=document.createElement('button');t.type='button';t.className='thm';t.setAttribute('aria-label','تبديل المظهر: فاتح/داكن');t.title='تبديل المظهر';
  var pt=function(){t.textContent=document.documentElement.classList.contains('dark')?'☀️':'🌙';};pt();
  t.onclick=function(){var o=document.getElementById('btn-theme-toggle');if(o)o.click();else{var d=!document.documentElement.classList.contains('dark');document.documentElement.classList.toggle('dark',d);try{localStorage.setItem('theme',d?'dark':'light');}catch(e){}}setTimeout(pt,50);};
  if(g)g.parentNode.insertBefore(t,g);else u.appendChild(t);return true;}
 if(!thm()){var tq=0,ti=setInterval(function(){if(thm()||++tq>40)clearInterval(ti);},250);}
 var hub=null;
 function hubShow(){S.forEach(function(x){x.classList.add('bk-off');});if(SL&&!SYN)SL.classList.add('bk-off');if(SYN){var db0=document.getElementById('deck-btn'),w0=db0&&db0.closest('.text-center');if(w0)w0.classList.add('bk-off');}var a=document.getElementById('mod-attendance');
  if(!hub){hub=document.createElement('div');hub.id='bk-hub';
   var h=Array.prototype.filter.call(document.querySelectorAll('h1'),function(x){return (x.textContent||'').trim()&&!x.closest('header.sticky,#spss-ub,#bk-rd');})[0],sm=h&&h.nextElementSibling&&h.nextElementSibling.tagName==='P'?h.nextElementSibling:null;
   var T=function(e){return e?(e.textContent||'').trim().replace(/\s+/g,' '):'';};
   var tch=ID&&ID.role==='teacher',free=!tch&&!!b.querySelector('.spss-free');
   hub.innerHTML='<h2>'+esc(h?T(h).slice(0,110):'الدرس')+'</h2>'+(sm?'<p class="sm">'+esc(T(sm).slice(0,170))+'</p>':'')+'<div class="stt">'+(tch?'👨‍🏫 وضع الأستاذ':free?'🔓 تصفح حر':'✅ حضورك مسجَّل')+'</div><div class="bt">'+(typeof window.openDeck==='function'?'<button type="button" class="s1">🖥️ عرض الشرائح</button>':'')+'<button type="button" class="s2">📖 '+(TPPAGE?'عرض محتوى التطبيق':'عرض محتوى المحاضرة')+'</button><button type="button" class="s3">📑 الفهرس</button></div><div class="rw"><a class="hm" href="'+((document.getElementById('btn-home')||{}).getAttribute?document.getElementById('btn-home').getAttribute('href'):'../index.html')+'">🏛️ العودة إلى قائمة المحاضرات</a><span class="ofs"></span></div>';
   var mw=document.getElementById('main-content-wrapper');
   if(SYN&&SL&&SL.parentNode)SL.parentNode.insertBefore(hub,SL);else if(mw)mw.insertBefore(hub,mw.firstChild);else S[0].parentNode.insertBefore(hub,S[0]);
   var s1=hub.querySelector('.s1');if(s1)s1.onclick=function(){try{if(window.dkLate)window.dkLate();}catch(x){}var db=document.getElementById('deck-btn');if(db&&ID&&ID.role==='teacher')db.click();else window.openDeck();};
   hub.querySelector('.s2').onclick=function(){enter(null);};hub.querySelector('.s3').onclick=function(){enter(null);setTimeout(idx,140);};
   var hm=hub.querySelector('.hm');hm.onclick=function(e){var o=document.querySelector('[data-snav-home]');if(o){e.preventDefault();o.click();}};
   lean(h,sm);}
  var mo2=function(){var o=b.querySelector('.spss-off'),f=hub.querySelector('.ofs');if(o&&f&&!f.contains(o))f.appendChild(o);};mo2();setTimeout(mo2,400);setTimeout(mo2,1500);
  hub.classList.remove('bk-off');}
 var x0=0,y0=0,t0=0;document.addEventListener('touchstart',function(e){if(!open)return;var t=e.touches[0];x0=t.clientX;y0=t.clientY;t0=1;},{passive:true});
 document.addEventListener('touchend',function(e){if(!open||!t0)return;t0=0;var t=e.changedTouches[0],dx=t.clientX-x0,dy=t.clientY-y0,el=e.target;
  if(el&&el.closest&&el.closest('table,pre,.overflow-x-auto,input,textarea,select,[data-noswipe]'))return;
  if(Math.abs(dx)>60&&Math.abs(dy)<Math.abs(dx)*0.6)go(cur+(dx>0?1:-1),dx>0?1:-1);},{passive:true});
 document.addEventListener('keydown',function(e){if(!open||/INPUT|TEXTAREA|SELECT/.test((e.target||{}).tagName||''))return;if(e.key==='ArrowLeft')go(cur+1,1);else if(e.key==='ArrowRight')go(cur-1,-1);else if(e.key==='Escape')exit();});
 document.addEventListener('click',function(e){var a=e.target.closest&&e.target.closest('a[href^="#"]');if(!a)return;var t=document.getElementById(a.getAttribute('href').slice(1));if(!t)return;var si=-1;S.forEach(function(s,i){if(si<0&&s.contains(t))si=i;});if(si<0)return;e.preventDefault();
  if(!open){enter(0);setTimeout(function(){var j=-1;P.forEach(function(p,i){if(j<0&&p.s===S[si]&&(p.s===t||p.a.some(function(x){return x===t||x.contains(t);})))j=i;});if(j<0)P.forEach(function(p,i){if(j<0&&p.s===S[si])j=i;});go(j<0?0:j,0);},120);}
  else{var j=-1;P.forEach(function(p,i){if(j<0&&p.s===S[si]&&(p.s===t||p.a.some(function(x){return x===t||x.contains(t);})))j=i;});if(j>=0)go(j,j>cur?1:-1);}},true);
 var rz=0,lw=window.innerWidth;window.addEventListener('resize',function(){clearTimeout(rz);rz=setTimeout(function(){if(!open||window.innerWidth===lw)return;lw=window.innerWidth;var o={sid:P[cur].s.id,k:P[cur].k};measure();go(find(o),0);},300);});
 function lkOn(){var c=document.getElementById('mod-attendance')||SL;if(!c)return;document.documentElement.classList.add('bk-lk');
  for(var e=c;e&&e!==b;e=e.parentNode){Array.prototype.forEach.call(e.parentNode.children,function(x){if(x===e||/^(SCRIPT|STYLE|LINK|TEMPLATE|FOOTER)$/.test(x.tagName)||x.querySelector('footer'))return;
   if(x.id==='spss-ub'||x.id==='dk'||x.id==='bk-rd'||/^(snav|qz|att|spss-m|swal)/.test(x.id||'')||x.getAttribute('role')==='dialog')return;
   var cs=getComputedStyle(x);if(cs.position==='fixed'){var r=x.getBoundingClientRect();if(!(r.height<=8||(r.height<=70&&r.width<=90)))return;}
   x.classList.add('bk-lkh');});}}
 function lkOff(){document.documentElement.classList.remove('bk-lk');Array.prototype.forEach.call(document.querySelectorAll('.bk-lkh'),function(x){x.classList.remove('bk-lkh');});}
 function start(){if(b.classList.contains('att-locked')){lkOn();return false;}lkOff();setTimeout(hubShow,200);return true;}
 if(b.classList.contains('att-locked')){setTimeout(function(){if(b.classList.contains('att-locked'))lkOn();},600);setTimeout(function(){if(b.classList.contains('att-locked'))lkOn();},2500);}
 if(!start()){var mo=new MutationObserver(function(){if(start())mo.disconnect();});mo.observe(b,{attributes:true,attributeFilter:['class']});}}
window.SPSS_AUTH={id:ID,logout:logout,cur:cur,U:U,root:ROOT,slotMsg:slotMsg,meOpen:function(){if(ID&&ID.role!=='teacher')meOpen();},flt:FLT};
function init2(){init();try{offLesson();}catch(e){}try{bookMode();}catch(e){}}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init2);else init2();
})();
