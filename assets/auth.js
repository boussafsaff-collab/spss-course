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
function ss(k,v){try{if(v==null)sessionStorage.removeItem(k);else sessionStorage.setItem(k,v)}catch(e){}}
function pj(t){try{return JSON.parse(t||'null')}catch(e){return null}}
function esc(t){var d=document.createElement('span');d.textContent=t==null?'':String(t);return d.innerHTML;}
function cur(){var k=sg('spss_tkey');
 if(k){var t=pj(sg('spss_tstu'));if(t&&/^9900\d{4}$/.test(t.bac||''))return {role:'tstu',key:k,bac:t.bac,nom:t.nom,prenom:t.prenom,sp:t.sp,grp:t.grp,prof:t.prof};return {role:'teacher',key:k};}
 var s=pj(lg('spss_id'));if(s&&/^\d{5,10}$/.test(s.bac||''))return {role:'student',bac:s.bac,nom:s.nom,prenom:s.prenom,sp:s.sp,grp:s.grp,free:s.free};
 return null;}
var ID=cur();
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
'html.spss-flt #picker{display:none!important}html.spss-biztp #mod-attendance,html.spss-biztp #mod-quiz,html.spss-biztp [onclick*="mod-attendance"],html.spss-biztp [onclick*="mod-quiz"],html.spss-biztp a[href="#mod-attendance"],html.spss-biztp a[href="#mod-quiz"],html.spss-biztp #att-frame-wrap,html.spss-biztp #qz-login,html.spss-biztp #qz-wait,html.spss-biztp #tq-go,html.spss-biztp #tq-wait,html.spss-biztp .qzbtn,html.spss-biztp #snav-fbn{display:none!important}html.spss-biz #note{display:none!important}.spss-free{direction:rtl;font-family:Cairo,"Segoe UI",Tahoma,sans-serif;display:flex;gap:10px;align-items:flex-start;background:#eff6ff;border:1px solid #93c5fd;color:#0f2744;border-radius:14px;padding:10px 14px;margin:10px auto;max-width:1100px;line-height:1.7;font-size:14px;box-sizing:border-box}.spss-free b{display:block;font-size:15px}.spss-free .i{flex:0 0 auto;font-size:18px;line-height:1.4}',
'#spss-ub .ham{font-size:20px!important;line-height:1;width:42px;height:38px;padding:0!important;background:rgba(255,255,255,.16)!important;border-radius:10px}',
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
'#spss-ub{direction:rtl;font-family:Cairo,"Segoe UI","Noto Sans Arabic",Tahoma,sans-serif;display:flex;flex-wrap:wrap;align-items:center;gap:8px;padding:8px 12px;background:#0f2744;color:#e2e8f0;font-size:14px;line-height:1.5;position:relative;z-index:50;box-shadow:0 2px 8px rgba(0,0,0,.18)}',
'#spss-ub .who{flex:1 1 200px;min-width:0;font-weight:700;color:#fff}#spss-ub .who small{font-weight:600;color:#93c5fd;margin-right:6px}',
'#spss-ub button,#spss-ub a{font:inherit;font-size:13px;font-weight:800;border:0;border-radius:10px;padding:6px 12px;color:#fff;background:#334155;cursor:pointer;text-decoration:none;white-space:nowrap}',
'#spss-ub .o{background:#be123c}#spss-ub .t{background:#7c3aed}#spss-ub .b{background:#0369a1}#spss-ub .g{background:#047857}',
'#spss-ub.tstu{background:#92400e}#spss-ub.tstu .who{color:#fff7ed}#spss-ub.tstu .tag{background:#fbbf24;color:#451a03;border-radius:999px;padding:2px 10px;font-weight:800;margin-left:6px}',
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
'#spss-ub .ins{background:#e9c46a!important;color:#0f2744!important}',
'body.spss-st #prof-btn,body.spss-st #tlogin{display:none!important}body.spss-auth #login{display:none!important}',
'.spss-hide{display:none!important}.spss-who{grid-column:1/-1;font-size:14px;font-weight:700;color:#0f2744;background:#e0f2fe;border:1px solid #7dd3fc;border-radius:10px;padding:8px 12px}',
'.dark .spss-who,html.dark .spss-who{background:#0c4a6e;color:#e0f2fe;border-color:#0369a1}.spss-slot{display:block;margin-top:6px;font-size:13.5px;font-weight:700}'].join('\n');
function addCss(){if(document.getElementById('spss-auth-css'))return;var s=document.createElement('style');s.id='spss-auth-css';s.textContent=CSS;document.head.appendChild(s);}
function post(o){return fetch(U,{method:'POST',body:new URLSearchParams(o)}).then(function(r){return r.text()}).then(function(t){t=String(t).trim();try{return JSON.parse(t)}catch(e){return {ok:0,err:t||'NET'};}});}
function getJ(q){return fetch(U+'?'+new URLSearchParams(q).toString()+'&t='+Date.now()).then(function(r){return r.text()}).then(function(t){try{return JSON.parse(t)}catch(e){return {ok:0,err:'NET'};}});}
function goNext(){var n='';try{n=new URLSearchParams(location.search).get('next')||'';}catch(e){}
 var base=new URL(ROOT).pathname;if(n&&n.charAt(0)==='/'&&n.indexOf('//')!==0&&n.indexOf(base)===0){location.replace(n);return true;}return false;}
function clearAll(){purge(true);['spss_id','as_bac'].forEach(function(k){ls(k,null)});['spss_tkey','spss_tstu','dk-prof','as_tkey','dk-open','tp-slide'].forEach(function(k){ss(k,null)});try{localStorage.removeItem('dk-prof')}catch(e){}}
function logout(){clearAll();location.href=ROOT+'index.html';}
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
function bar(){if(!ID||document.getElementById('spss-ub'))return;var b=document.createElement('div');b.id='spss-ub';b.setAttribute('data-role',ID.role);
 var home=PAGE==='landing'?'':'<a class="b" href="'+ROOT+'index.html">🏠 الرئيسية</a>';
 var ham=ID.role!=='teacher'?'<button type="button" class="ham" data-x="me" aria-label="لوحة الطالب" aria-controls="spss-me" aria-expanded="false" title="لوحة الطالب">☰</button>':'';
 if(ID.role==='student'){b.innerHTML=ham+'<span class="who">👤 '+esc((ID.nom+' '+ID.prenom).trim())+'<small>'+esc(ID.sp||'')+(ID.grp?' – الفوج '+esc(ID.grp):'')+'</small></span>'+home+'<button type="button" class="o" data-x="out">تغيير المستخدم / خروج</button>';}
 else if(ID.role==='teacher'){b.innerHTML='<span class="who">👨‍🏫 الأستاذ<small>وضع الأستاذ</small></span>'+home+'<a class="t" href="'+ROOT+'assessment/teacher/">لوحة الأستاذ</a><button type="button" class="ins" data-x="inst">📲 تثبيت '+esc(APP_SHORT)+'</button><button type="button" class="g" data-x="tstu">🧪 الدخول كطالب</button><button type="button" data-x="clean">🧹 مسح بيانات التجربة</button><button type="button" class="o" data-x="out">خروج</button>';}
 else{b.className='tstu';b.innerHTML=ham+'<span class="who"><span class="tag">وضع الأستاذ كطالب</span>'+esc(PROFS[ID.prof]||ID.sp||'')+'<small>رقم تجريبي <bdi dir="ltr">'+esc(ID.bac)+'</bdi></small></span>'+home+'<button type="button" class="t" data-x="back">↩️ العودة إلى دور الأستاذ</button><button type="button" class="o" data-x="out">خروج</button>';}
 b.addEventListener('click',function(e){var x=e.target.closest('[data-x]');if(!x)return;var a=x.getAttribute('data-x');
  if(a==='out'){if(confirm(ID.role==='student'?'تسجيل الخروج من المنصة على هذا الجهاز؟ (حضورك ونتائجك المسجَّلة لا تُلغى)':'تسجيل الخروج؟'))logout();}
  else if(a==='me')meOpen(x);else if(a==='inst')instOpen(x);else if(a==='tstu')toStudent();else if(a==='back')toTeacher();else if(a==='clean')cleanT(x);});
 document.body.insertBefore(b,document.body.firstChild);}
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
   fi.innerHTML=IC.card;eye.hidden=true;rc.className='rc';rc.innerHTML=IC.stu+'طالب';hn.textContent='تُدخله مرة واحدة فقط على هذا الجهاز.';}
  else{lab.textContent='الرمز السري للأستاذ';inp.type='password';inp.removeAttribute('inputmode');inp.maxLength=80;inp.placeholder='';inp.autocomplete='current-password';
   fi.innerHTML=IC.lock;eye.hidden=false;eyeSet(false);rc.className='rc t';rc.innerHTML=IC.tea+'أستاذ';hn.textContent='الرمز خاص بالأستاذ ولا يُشارك مع الطلبة.';}
  setTimeout(function(){inp.focus()},50);};});
 w.querySelector('.bk').onclick=function(){role='';f.hidden=true;s1.classList.remove('hide');sErr('');inp.value='';busy(false);if(last)setTimeout(function(){last.focus()},30);};
 w.addEventListener('keydown',function(ev){if(ev.key==='Escape'&&!f.hidden&&!go.disabled){ev.preventDefault();w.querySelector('.bk').click();}});
 // لوحة المفاتيح: التركيز داخل النافذة (Tab يدور بين عناصرها)
 var cc=w.querySelector('.c');cc.setAttribute('tabindex','-1');try{cc.focus({preventScroll:true});}catch(e){}
 w.addEventListener('keydown',function(ev){if(ev.key!=='Tab')return;var F=Array.prototype.filter.call(w.querySelectorAll('button,input'),function(x){return !x.disabled&&x.offsetParent!==null;});if(!F.length)return;
  var a=document.activeElement,i=F.indexOf(a);if(ev.shiftKey&&(i<=0)){ev.preventDefault();F[F.length-1].focus();}else if(!ev.shiftKey&&(i<0||i===F.length-1)){ev.preventDefault();F[0].focus();}});
 f.onsubmit=function(ev){ev.preventDefault();if(go.disabled)return;sErr('');var v=inp.value.trim();
  if(role==='s'){v=v.replace(/\D/g,'');if(!/^\d{5,10}$/.test(v)){sErr('اكتب رقم البكالوريا (أرقام فقط).');inp.focus();return;}busy(true);
   getJ({action:'aslist',sbac:v}).then(function(r){busy(false);
    if(!r.ok||!r.who){sErr(r.err==='UNKNOWN_BAC'?'رقم البكالوريا هذا غير موجود في قوائم الطلبة. تحقّق منه أو راجع الأستاذ.':r.err==='NO_ROSTER'?'قوائم الطلبة غير مهيّأة بعد.':'تعذّر الاتصال بالخادم، أعد المحاولة.');inp.focus();return;}
    clearAll();ls('spss_id',JSON.stringify({bac:v,nom:r.who.nom||'',prenom:r.who.prenom||'',sp:r.who.sp||'',grp:r.who.grp||'',free:r.who.free?1:0,t:Date.now()}));ls('as_bac',v);done();});}
  else if(role==='t'){if(!v){sErr('أدخل الرمز السري.');inp.focus();return;}busy(true);
   post({action:'askey',key:v}).then(function(r){busy(false);if(!r.ok){sErr(r.err==='BAD_KEY'?'الرمز السري غير صحيح.':'تعذّر الاتصال بالخادم، أعد المحاولة.');inp.focus();return;}
    clearAll();ss('spss_tkey',v);ss('dk-prof',v);ss('as_tkey',v);done();});}};
 function done(){ss('spss_inst_after','1');if(goNext())return;location.replace(location.pathname);}}
// ===== صفحات الحصص: زر واحد «تسجيل الحضور» برقم الدخول =====
function lecName(){var r=/LECN\s*=\s*'([^']+)'/,m=null;Array.prototype.some.call(document.querySelectorAll('script:not([src])'),function(s){m=(s.textContent||'').match(r);return !!m;});
 if(m)return m[1];var m2=null;Array.prototype.some.call(document.querySelectorAll('script:not([src])'),function(s){m2=(s.textContent||'').match(/append\('lecture','([^']+)'\)/);return !!m2;});return m2?m2[1]:'';}
function hideLab(inp){var l=inp&&inp.closest('label');if(l)l.classList.add('spss-hide');else if(inp)inp.classList.add('spss-hide');}
function slotMsg(x){var p=String(x||'').split('|');if(p[0]!=='TOO_EARLY')return '';
 return p[2]&&p[3]?'⏰ التسجيل متاح فقط من '+p[2]+' إلى '+p[3]+(p[1]?' (يوم '+p[1]+')':'')+'.':'⏰ لم يحن موعد الحصة بعد'+(p[1]?': تاريخها يوم '+p[1]:'')+'.';}
window.spssSlotMsg=slotMsg;
function sessionUI(){if(!ID||ID.role==='teacher')return;document.body.classList.add('spss-st');
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
function init(){addCss();if(PAGE==='landing')landingUI();bar();filterUI();instInit();copyInit();aboutNav();
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
 document.getElementById('spss-me-b').innerHTML='<p>جارٍ تحميل بياناتك…</p>';
 getJ({action:'asme',sbac:ID.bac}).then(function(r){ME=r;meRender(r);});}
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
window.SPSS_AUTH={id:ID,logout:logout,cur:cur,U:U,root:ROOT,slotMsg:slotMsg,meOpen:function(){if(ID&&ID.role!=='teacher')meOpen();},flt:FLT};
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init);else init();
})();
