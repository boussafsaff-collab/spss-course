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
 if(PAGE==='list'){ls('spss_course_specialty',FIN?'إدارة مالية':'إدارة أعمال');if(FIN&&GRPN)ls('spss_course_group','إدارة مالية - فوج '+GRPN);}
 try{document.documentElement.classList.add('spss-flt');if(BIZ)document.documentElement.classList.add('spss-biz');}catch(e){}
}
// ===== واجهة =====
var CSS=[
'html.spss-flt #picker{display:none!important}html.spss-biz a[href$="tps/index.html"]{display:none!important}',
'#spss-ub .ham{font-size:20px!important;line-height:1;width:42px;height:38px;padding:0!important;background:rgba(255,255,255,.16)!important;border-radius:10px}',
'#spss-me-s{position:fixed;inset:0;background:rgba(15,23,42,.45);z-index:2147483600;opacity:0;visibility:hidden;transition:opacity .2s}#spss-me-s.open{opacity:1;visibility:visible}',
'#spss-me{direction:rtl;font-family:Cairo,"Segoe UI","Noto Sans Arabic",Tahoma,sans-serif;position:fixed;top:0;bottom:0;right:0;width:min(440px,94vw);background:#f8fafc;color:#0f172a;z-index:2147483601;transform:translateX(105%);visibility:hidden;transition:transform .25s ease,visibility .25s;display:flex;flex-direction:column;box-shadow:-12px 0 30px rgba(15,23,42,.25)}#spss-me.open{transform:none;visibility:visible}',
'#spss-me .hd{background:#0f2744;color:#fff;padding:12px 14px;display:flex;align-items:center;gap:10px}#spss-me .hd h2{margin:0;font-size:18px;flex:1}#spss-me .hd small{display:block;color:#93c5fd;font-size:12px;font-weight:600}#spss-me .x{border:0;background:rgba(255,255,255,.14);color:#fff;width:40px;height:40px;border-radius:10px;font-size:18px;cursor:pointer}',
'#spss-me .tb{display:flex;gap:6px;flex-wrap:wrap;padding:8px 10px;background:#e2e8f0}#spss-me .tb button{font:inherit;font-size:13px;font-weight:800;border:0;border-radius:999px;padding:6px 12px;background:#fff;color:#0f2744;cursor:pointer}#spss-me .tb button.on{background:#0f2744;color:#fff}',
'#spss-me .bd{flex:1;overflow:auto;padding:10px 12px 24px}#spss-me section{background:#fff;border-radius:14px;padding:12px;margin:0 0 12px;box-shadow:0 2px 10px rgba(15,23,42,.08)}#spss-me h3{margin:0 0 8px;font-size:16px;color:#0f2744}#spss-me h4{margin:10px 0 6px;font-size:14px;color:#334155}',
'#spss-me .rw{display:flex;align-items:center;gap:8px;padding:7px 0;border-top:1px solid #e2e8f0;font-size:13.5px}#spss-me .rw:first-of-type{border-top:0}#spss-me .rw .t{flex:1;min-width:0}#spss-me .rw .v{font-weight:800;white-space:nowrap}#spss-me .rw.nx{background:#fef9c3;border-radius:8px;padding:7px 6px}',
'#spss-me .bg{display:inline-block;border-radius:999px;padding:2px 9px;font-size:12px;font-weight:800;white-space:nowrap}#spss-me .ok{background:#dcfce7;color:#166534}#spss-me .no{background:#fee2e2;color:#991b1b}#spss-me .op{background:#dbeafe;color:#1e40af}#spss-me .cl{background:#e2e8f0;color:#475569}#spss-me .rj{background:#fde68a;color:#78350f}',
'#spss-me .avg{display:flex;gap:8px;flex-wrap:wrap;margin:6px 0}#spss-me .avg div{flex:1 1 120px;background:#eff6ff;border-radius:10px;padding:8px;text-align:center;font-size:12.5px}#spss-me .avg b{display:block;font-size:20px;color:#0f2744}#spss-me .nt{font-size:12px;color:#64748b;margin:6px 0 0}',
'#spss-blk{direction:rtl;font-family:Cairo,"Segoe UI",Tahoma,sans-serif;position:fixed;inset:0;background:rgba(15,23,42,.88);z-index:2147483602;display:flex;align-items:center;justify-content:center;padding:16px}#spss-blk .c{background:#fff;border-radius:16px;padding:22px;max-width:440px;text-align:center}#spss-blk a{display:inline-block;margin-top:12px;background:#0f2744;color:#fff;border-radius:10px;padding:9px 16px;font-weight:800;text-decoration:none}',
'.spss-polite{direction:rtl;background:#fff7ed;border:1px solid #fdba74;color:#7c2d12;border-radius:14px;padding:14px;font-weight:700;text-align:center}.spss-polite a{color:#0f2744}',
'#spss-ub{direction:rtl;font-family:Cairo,"Segoe UI","Noto Sans Arabic",Tahoma,sans-serif;display:flex;flex-wrap:wrap;align-items:center;gap:8px;padding:8px 12px;background:#0f2744;color:#e2e8f0;font-size:14px;line-height:1.5;position:relative;z-index:50;box-shadow:0 2px 8px rgba(0,0,0,.18)}',
'#spss-ub .who{flex:1 1 200px;min-width:0;font-weight:700;color:#fff}#spss-ub .who small{font-weight:600;color:#93c5fd;margin-right:6px}',
'#spss-ub button,#spss-ub a{font:inherit;font-size:13px;font-weight:800;border:0;border-radius:10px;padding:6px 12px;color:#fff;background:#334155;cursor:pointer;text-decoration:none;white-space:nowrap}',
'#spss-ub .o{background:#be123c}#spss-ub .t{background:#7c3aed}#spss-ub .b{background:#0369a1}#spss-ub .g{background:#047857}',
'#spss-ub.tstu{background:#92400e}#spss-ub.tstu .who{color:#fff7ed}#spss-ub.tstu .tag{background:#fbbf24;color:#451a03;border-radius:999px;padding:2px 10px;font-weight:800;margin-left:6px}',
'#spss-lg{position:fixed;inset:0;z-index:2147483000;background:linear-gradient(160deg,#0b1e33,#14365c 60%,#1d4f86);overflow:auto;direction:rtl;font-family:Cairo,"Segoe UI","Noto Sans Arabic",Tahoma,sans-serif;display:flex;align-items:flex-start;justify-content:center;padding:clamp(12px,4vw,40px) 12px}',
'#spss-lg .c{background:#fff;color:#1e293b;border-radius:20px;max-width:440px;width:100%;padding:clamp(16px,5vw,26px);box-shadow:0 18px 40px rgba(0,0,0,.35);box-sizing:border-box;text-align:right}',
'#spss-lg h1{margin:0 0 4px;font-size:22px;color:#0f2744}#spss-lg p{margin:0 0 12px;color:#475569;font-size:14.5px;line-height:1.7}',
'#spss-lg .rl{display:grid;grid-template-columns:1fr 1fr;gap:10px;margin:10px 0 14px}#spss-lg .rl button{font:inherit;font-weight:800;font-size:17px;border:2px solid #cbd5e1;background:#f8fafc;color:#0f2744;border-radius:16px;padding:16px 8px;cursor:pointer;display:flex;flex-direction:column;align-items:center;gap:4px}',
'#spss-lg .rl button span{font-size:30px}#spss-lg .rl button.on{border-color:#1d4f86;background:#e0ecff;box-shadow:0 0 0 3px rgba(29,79,134,.15)}',
'#spss-lg label{display:block;font-weight:700;font-size:14px;margin:4px 0 6px;color:#334155}#spss-lg input{width:100%;box-sizing:border-box;font:inherit;font-size:18px;padding:10px 12px;border:1.5px solid #94a3b8;border-radius:12px;direction:ltr;text-align:center}',
'#spss-lg .go{width:100%;margin-top:12px;font:inherit;font-weight:800;font-size:17px;border:0;border-radius:14px;padding:12px;background:#1d4f86;color:#fff;cursor:pointer}#spss-lg .go:disabled{background:#94a3b8}',
'#spss-lg .er{color:#b91c1c;font-weight:700;font-size:14px;min-height:1.4em;margin-top:8px}#spss-lg .qr{margin-top:16px;padding-top:12px;border-top:1px dashed #cbd5e1;text-align:center;font-size:13px;color:#475569}#spss-lg .qr img{width:120px;height:120px;display:block;margin:0 auto 4px}',
'#spss-dl{position:fixed;inset:0;z-index:2147483001;background:rgba(2,6,23,.72);display:flex;align-items:center;justify-content:center;padding:16px;direction:rtl;font-family:Cairo,"Segoe UI",Tahoma,sans-serif}',
'#spss-dl .c{background:#fff;color:#1e293b;border-radius:16px;padding:18px;max-width:420px;width:100%;box-sizing:border-box}#spss-dl h3{margin:0 0 8px;font-size:18px}#spss-dl p{margin:0 0 10px;font-size:14px;color:#475569;line-height:1.7}',
'#spss-dl .g2{display:grid;grid-template-columns:1fr 1fr;gap:8px}#spss-dl button{font:inherit;font-weight:800;font-size:15px;border:0;border-radius:12px;padding:11px 10px;color:#fff;background:#1d4f86;cursor:pointer}#spss-dl button.n{background:#64748b;width:100%;margin-top:10px}',
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
 else if(ID.role==='teacher'){b.innerHTML='<span class="who">👨‍🏫 الأستاذ<small>وضع الأستاذ</small></span>'+home+'<a class="t" href="'+ROOT+'assessment/teacher/">لوحة الأستاذ</a><button type="button" class="g" data-x="tstu">🧪 الدخول كطالب</button><button type="button" data-x="clean">🧹 مسح بيانات التجربة</button><button type="button" class="o" data-x="out">خروج</button>';}
 else{b.className='tstu';b.innerHTML=ham+'<span class="who"><span class="tag">وضع الأستاذ كطالب</span>'+esc(PROFS[ID.prof]||ID.sp||'')+'<small>رقم تجريبي <bdi dir="ltr">'+esc(ID.bac)+'</bdi></small></span>'+home+'<button type="button" class="t" data-x="back">↩️ العودة إلى دور الأستاذ</button><button type="button" class="o" data-x="out">خروج</button>';}
 b.addEventListener('click',function(e){var x=e.target.closest('[data-x]');if(!x)return;var a=x.getAttribute('data-x');
  if(a==='out'){if(confirm(ID.role==='student'?'تسجيل الخروج من المنصة على هذا الجهاز؟ (حضورك ونتائجك المسجَّلة لا تُلغى)':'تسجيل الخروج؟'))logout();}
  else if(a==='me')meOpen(x);else if(a==='tstu')toStudent();else if(a==='back')toTeacher();else if(a==='clean')cleanT(x);});
 document.body.insertBefore(b,document.body.firstChild);}
// ===== شاشة الدخول (الصفحة الرئيسية) =====
function loginUI(){if(document.getElementById('spss-lg'))return;var w=document.createElement('div');w.id='spss-lg';w.setAttribute('role','dialog');w.setAttribute('aria-modal','true');
 w.innerHTML='<div class="c"><h1>🎓 الدخول إلى المنصة</h1><p>برمجيات إحصائية SPSS – جامعة قسنطينة 2. اختر صفتك ثم أدخل بياناتك مرة واحدة، وبعدها تتنقل في المنصة بحرية.</p>'+
 '<div class="rl"><button type="button" data-r="s"><span>👨‍🎓</span>طالب</button><button type="button" data-r="t"><span>👨‍🏫</span>أستاذ</button></div>'+
 '<form id="spss-lf" autocomplete="off" hidden><label for="spss-in"></label><input id="spss-in"><button class="go" type="submit">دخول</button><div class="er" id="spss-er"></div></form>'+
 '<div class="qr"><img src="'+ROOT+'assets/qr-spss.png" alt="رمز QR للمنصة">امسح الرمز للوصول إلى المنصة</div></div>';
 document.body.appendChild(w);document.documentElement.style.overflow='hidden';
 var f=w.querySelector('#spss-lf'),inp=w.querySelector('#spss-in'),lab=w.querySelector('label'),er=w.querySelector('#spss-er'),go=f.querySelector('.go'),role='';
 Array.prototype.forEach.call(w.querySelectorAll('[data-r]'),function(b){b.onclick=function(){role=b.getAttribute('data-r');Array.prototype.forEach.call(w.querySelectorAll('[data-r]'),function(x){x.classList.toggle('on',x===b)});
  f.hidden=false;er.textContent='';inp.value='';
  if(role==='s'){lab.textContent='رقم شهادة البكالوريا';inp.type='tel';inp.setAttribute('inputmode','numeric');inp.maxLength=10;inp.placeholder='6 إلى 9 أرقام';inp.autocomplete='off';}
  else{lab.textContent='الرمز السري للأستاذ';inp.type='password';inp.removeAttribute('inputmode');inp.maxLength=80;inp.placeholder='';inp.autocomplete='current-password';}
  setTimeout(function(){inp.focus()},50);};});
 f.onsubmit=function(ev){ev.preventDefault();er.textContent='';var v=inp.value.trim();
  if(role==='s'){v=v.replace(/\D/g,'');if(!/^\d{5,10}$/.test(v)){er.textContent='اكتب رقم البكالوريا (أرقام فقط).';return;}go.disabled=true;go.textContent='جارٍ التحقق…';
   getJ({action:'aslist',sbac:v}).then(function(r){go.disabled=false;go.textContent='دخول';
    if(!r.ok||!r.who){er.textContent=r.err==='UNKNOWN_BAC'?'رقم البكالوريا هذا غير موجود في قوائم الطلبة. تحقّق منه أو راجع الأستاذ.':r.err==='NO_ROSTER'?'قوائم الطلبة غير مهيّأة بعد.':'تعذّر الاتصال بالخادم، أعد المحاولة.';return;}
    clearAll();ls('spss_id',JSON.stringify({bac:v,nom:r.who.nom||'',prenom:r.who.prenom||'',sp:r.who.sp||'',grp:r.who.grp||'',free:r.who.free?1:0,t:Date.now()}));ls('as_bac',v);done();});}
  else if(role==='t'){if(!v){er.textContent='أدخل الرمز السري.';return;}go.disabled=true;go.textContent='جارٍ التحقق…';
   post({action:'askey',key:v}).then(function(r){go.disabled=false;go.textContent='دخول';if(!r.ok){er.textContent=r.err==='BAD_KEY'?'الرمز السري غير صحيح.':'تعذّر الاتصال بالخادم، أعد المحاولة.';return;}
    clearAll();ss('spss_tkey',v);ss('dk-prof',v);ss('as_tkey',v);done();});}};
 function done(){if(goNext())return;location.replace(location.pathname);}}
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
function init(){addCss();if(PAGE==='landing')landingUI();bar();filterUI();
 if(ID&&ID.role==='student'&&ID.free===undefined)getJ({action:'aslist',sbac:ID.bac}).then(function(r){if(r&&r.ok&&r.who){var s=pj(lg('spss_id'))||{};if(s.bac===ID.bac){s.free=r.who.free?1:0;ls('spss_id',JSON.stringify(s));if(s.free&&FLT)location.reload();}}});
 if(PAGE==='session')sessionUI();else if(PAGE==='assess')assessUI();
 else if(PAGE==='teacher'&&ID&&ID.role==='tstu'){/* لوحة الأستاذ متاحة دائماً بالرمز */}}
// ===== update61: تصفية الصفحات =====
function filterUI(){if(!FLT)return;
 if(BIZ){Array.prototype.forEach.call(document.querySelectorAll('a[href$="tps/index.html"]'),function(a){a.style.display='none';});
  var msg='التطبيقات خاصة بطلبة تخصص «إدارة مالية». تخصصك «إدارة أعمال» ليست له حصص تطبيقية.';
  if(PAGE==='list'&&document.body.getAttribute('data-type')==='tp'){var l=document.getElementById('list');
   if(l){var mo=new MutationObserver(function(){if(!l.querySelector('.spss-polite'))put();});var put=function(){mo.disconnect();l.innerHTML='<div class="spss-polite">'+esc(msg)+'<br><a href="'+ROOT+'lectures/index.html">← العودة إلى محاضراتك</a></div>';mo.observe(l,{childList:true});};put();}
   var n=document.getElementById('note');if(n)n.style.display='none';}
  if(TPPAGE)block(msg);}
}
function block(msg){if(document.getElementById('spss-blk'))return;var w=document.createElement('div');w.id='spss-blk';w.setAttribute('role','dialog');w.setAttribute('aria-modal','true');
 w.innerHTML='<div class="c"><h3 style="margin:0 0 8px">🙏 هذه الصفحة ليست لفوجك</h3><p style="margin:0">'+esc(msg)+'</p><a href="'+ROOT+'lectures/index.html">← العودة إلى محاضراتك</a> <a href="'+ROOT+'index.html" style="background:#475569">🏠 الرئيسية</a></div>';
 document.body.appendChild(w);document.documentElement.style.overflow='hidden';}
// ===== update61: لوحة الطالب =====
var ME=null;
function bgS(st){return {done:['ok','منجز'],open:['op','مفتوح الآن'],missed:['no','لم يُنجز'],closed:['cl','مغلق']}[st]||['cl',st||''];}
function bgA(st){return {present:['ok','حاضر'],absent:['no','غائب'],rejected:['rj','مرفوض (غ)'],upcoming:['cl','قادم'],open:['op','التسجيل مفتوح الآن'],nodate:['cl','لم يُحدَّد التاريخ']}[st]||['cl',st||''];}
function bdg(a){return '<span class="bg '+a[0]+'">'+esc(a[1])+'</span>';}
function dm(d){var m=/^(\d{4})-(\d{2})-(\d{2})$/.exec(String(d||''));return m?m[3]+'/'+m[2]+'/'+m[1]:'';}
function n2(x){return x==null?'–':String(Math.round(x*100)/100).replace('.',',');}
function meOpen(btn){var d=document.getElementById('spss-me'),sc=document.getElementById('spss-me-s');
 if(!d){sc=document.createElement('div');sc.id='spss-me-s';sc.onclick=meClose;d=document.createElement('aside');d.id='spss-me';d.setAttribute('role','dialog');d.setAttribute('aria-modal','true');d.setAttribute('aria-label','لوحة الطالب');d.tabIndex=-1;
  d.innerHTML='<div class="hd"><h2>📊 لوحة الطالب<small id="spss-me-w"></small></h2><button type="button" class="x" aria-label="إغلاق">✕</button></div>'+
  '<div class="tb" role="tablist"><button type="button" data-g="m">تتبع علاماتي</button><button type="button" data-g="a">تتبع الحضور</button><button type="button" data-g="l">توقيت المحاضرات</button><button type="button" data-g="p">توقيت التطبيقات</button></div><div class="bd" id="spss-me-b"><p>جارٍ التحميل…</p></div>';
  document.body.appendChild(sc);document.body.appendChild(d);d.querySelector('.x').onclick=meClose;
  d.querySelector('.tb').onclick=function(e){var b=e.target.closest('[data-g]');if(!b)return;var t=document.getElementById('spss-me-'+b.getAttribute('data-g'));
   Array.prototype.forEach.call(d.querySelectorAll('.tb button'),function(x){x.classList.toggle('on',x===b)});if(t)t.scrollIntoView({behavior:'smooth',block:'start'});};
  document.addEventListener('keydown',function(e){if(e.key==='Escape'&&d.classList.contains('open'))meClose();});}
 d.classList.add('open');sc.classList.add('open');var hb=document.querySelector('#spss-ub .ham');if(hb)hb.setAttribute('aria-expanded','true');setTimeout(function(){d.focus()},60);
 document.getElementById('spss-me-b').innerHTML='<p>جارٍ تحميل بياناتك…</p>';
 getJ({action:'asme',sbac:ID.bac}).then(function(r){ME=r;meRender(r);});}
function meClose(){var d=document.getElementById('spss-me'),sc=document.getElementById('spss-me-s');if(d)d.classList.remove('open');if(sc)sc.classList.remove('open');var hb=document.querySelector('#spss-ub .ham');if(hb){hb.setAttribute('aria-expanded','false');hb.focus();}}
function meRender(r){var b=document.getElementById('spss-me-b');
 if(!r||!r.ok){b.innerHTML='<p class="spss-polite">'+(r&&r.err==='UNKNOWN_BAC'?'رقمك غير موجود في القوائم. راجع الأستاذ.':'تعذّر جلب بياناتك الآن. أعد المحاولة بعد قليل.')+'</p>';return;}
 var w=r.who||{},fin=/مالية/.test(w.sp||'');
 document.getElementById('spss-me-w').textContent=((w.nom||'')+' '+(w.prenom||'')).trim()+' · '+(w.sp||'')+(fin&&w.grp?' · الفوج '+w.grp:'');
 var M=r.marks||{},A=r.att||{},T=r.tt||{},nx=r.next,h='';
 function mrow(o){var sc=o.st==='done'?'<span class="v"><bdi dir="ltr">'+n2(o.s)+'/'+n2(o.tot)+'</bdi> · <bdi dir="ltr">'+n2(o.m20)+'/20</bdi></span>':(o.st==='missed'?'<span class="v"><bdi dir="ltr">0/20</bdi></span>':'');
  return '<div class="rw"><span class="t">'+esc(o.title||o.topic||'')+'</span>'+sc+bdg(bgS(o.st))+'</div>';}
 h+='<section id="spss-me-m"><h3>📝 تتبع علاماتي</h3><div class="avg"><div>معدل تقييمات المحاضرات<b><bdi dir="ltr">'+(M.lecAvg==null?'–':n2(M.lecAvg)+'/20')+'</bdi></b></div>'+(fin?'<div>معدل التطبيقات<b><bdi dir="ltr">'+(M.tpAvg==null?'–':n2(M.tpAvg)+'/20')+'</bdi></b></div>':'')+'</div>';
 h+='<h4>تقييمات المحاضرات</h4>'+((M.lec||[]).map(mrow).join('')||'<p class="nt">لا تقييمات بعد.</p>');
 if(fin){h+='<h4>تقييمات التطبيقات</h4>'+((M.tp||[]).map(mrow).join('')||'<p class="nt">لا تقييمات بعد.</p>');
  if((M.tpMarks||[]).length)h+='<h4>علامات حصص التطبيق (/7)</h4>'+M.tpMarks.map(function(x){return '<div class="rw"><span class="t">'+esc(x.title||('الحصة '+x.n))+'</span><span class="v"><bdi dir="ltr">'+(x.m7==null?'0':n2(x.m7))+'/7 · '+n2(x.m20)+'/20</bdi></span></div>';}).join('');}
 else h+='<p class="nt">تخصص «إدارة أعمال»: لا تطبيقات، فالمعدل من تقييمات المحاضرات وحدها.</p>';
 h+='<p class="nt">المعدل بطريقة «النداء»: المحاضرة = العلامة/المجموع × 20، ومتوسطها على التقييمات التي أُجريت فعلاً؛ التطبيق = علامة الحصة /7 × 20؛ التقييم الذي أُجري ولم تنجزه يُحسب 0. معدل مؤقت يتغير مع كل تقييم.</p></section>';
 function cnt(c){if(!c)return '';return '<div class="avg"><div>حاضر<b>'+c.present+'</b></div><div>غائب<b>'+c.absent+'</b></div><div>مرفوض (غ)<b>'+c.rejected+'</b></div><div>قادم<b>'+c.upcoming+'</b></div><div>نسبة الحضور<b><bdi dir="ltr">'+(c.rate==null?'–':c.rate+'%')+'</bdi></b></div></div>';}
 function arow(x){var isN=nx&&nx.session===x.session;return '<div class="rw'+(isN?' nx':'')+'"><span class="t">'+esc(x.session)+'<br><small style="color:#64748b">'+(x.dt?'<bdi dir="ltr">'+dm(x.dt)+'</bdi>':'')+(x.s?' · <bdi dir="ltr">'+esc(x.s)+'–'+esc(x.e)+'</bdi>':'')+'</small></span>'+bdg(bgA(x.st))+'</div>';}
 h+='<section id="spss-me-a"><h3>✅ تتبع الحضور</h3><h4>المحاضرات</h4>'+cnt(A.cLec)+(A.lec||[]).map(arow).join('');
 if(fin&&A.tp)h+='<h4>التطبيقات (الفوج '+esc(w.grp||'')+')</h4>'+cnt(A.cTp)+A.tp.map(arow).join('');
 h+='</section>';
 function slot(o,lst,lbl){if(!o)return '<p class="nt">'+lbl+'</p>';var up=(lst||[]).filter(function(x){return x.st==='open'||x.st==='upcoming';});var op=up.filter(function(x){return x.st==='open';})[0];
  var s='<div class="rw"><span class="t">اليوم</span><span class="v">'+esc(o.day)+'</span></div><div class="rw"><span class="t">التوقيت</span><span class="v"><bdi dir="ltr">'+esc(o.s)+' – '+esc(o.e)+'</bdi></span></div>'+
  '<div class="rw"><span class="t">المكان</span><span class="v">'+esc(o.room||'يُعلَن لاحقاً')+'</span></div>';
  if(op)s+='<div class="rw nx"><span class="t">🟢 التسجيل مفتوح الآن: '+esc(op.session)+'</span></div>';
  if(up.length){var u=up[0];s+='<div class="rw nx"><span class="t">⏭️ الحصة القادمة: '+esc(u.session)+'<br><small><bdi dir="ltr">'+dm(u.dt)+' · '+esc(u.s)+'–'+esc(u.e)+'</bdi></small></span></div>';}
  else s+='<p class="nt">لا حصص قادمة مبرمجة حالياً.</p>';
  s+='<h4>كل الحصص</h4>'+(lst||[]).map(arow).join('');return s;}
 h+='<section id="spss-me-l"><h3>🏛️ توقيت المحاضرات</h3>'+slot(T.lec,A.lec,'لا توقيت محدد.')+'</section>';
 h+='<section id="spss-me-p"><h3>💻 توقيت التطبيقات</h3>'+(fin?slot(T.tp,A.tp,'لا توقيت محدد لفوجك.'):'<p class="nt">تخصص «إدارة أعمال» ليست له حصص تطبيقية.</p>')+'</section>';
 h+='<p class="nt">التسجيل في الحصة يُفتح في توقيتها فقط. آخر تحديث: <bdi dir="ltr">'+esc(r.now||'')+'</bdi></p>';
 b.innerHTML=h;}
window.SPSS_AUTH={id:ID,logout:logout,cur:cur,U:U,root:ROOT,slotMsg:slotMsg,meOpen:function(){if(ID&&ID.role!=='teacher')meOpen();},flt:FLT};
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init);else init();
})();
