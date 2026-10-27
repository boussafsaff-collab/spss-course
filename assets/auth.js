/* auth.js — update60: الدخول الموحّد إلى المنصة (أستاذ / طالب)
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
 var s=pj(lg('spss_id'));if(s&&/^\d{5,10}$/.test(s.bac||''))return {role:'student',bac:s.bac,nom:s.nom,prenom:s.prenom,sp:s.sp,grp:s.grp};
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
// ===== واجهة =====
var CSS=['#spss-ub{direction:rtl;font-family:Cairo,"Segoe UI","Noto Sans Arabic",Tahoma,sans-serif;display:flex;flex-wrap:wrap;align-items:center;gap:8px;padding:8px 12px;background:#0f2744;color:#e2e8f0;font-size:14px;line-height:1.5;position:relative;z-index:50;box-shadow:0 2px 8px rgba(0,0,0,.18)}',
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
 if(ID.role==='student'){b.innerHTML='<span class="who">👤 '+esc((ID.nom+' '+ID.prenom).trim())+'<small>'+esc(ID.sp||'')+(ID.grp?' – الفوج '+esc(ID.grp):'')+'</small></span>'+home+'<button type="button" class="o" data-x="out">تغيير المستخدم / خروج</button>';}
 else if(ID.role==='teacher'){b.innerHTML='<span class="who">👨‍🏫 الأستاذ<small>وضع الأستاذ</small></span>'+home+'<a class="t" href="'+ROOT+'assessment/teacher/">لوحة الأستاذ</a><button type="button" class="g" data-x="tstu">🧪 الدخول كطالب</button><button type="button" data-x="clean">🧹 مسح بيانات التجربة</button><button type="button" class="o" data-x="out">خروج</button>';}
 else{b.className='tstu';b.innerHTML='<span class="who"><span class="tag">وضع الأستاذ كطالب</span>'+esc(PROFS[ID.prof]||ID.sp||'')+'<small>رقم تجريبي <bdi dir="ltr">'+esc(ID.bac)+'</bdi></small></span>'+home+'<button type="button" class="t" data-x="back">↩️ العودة إلى دور الأستاذ</button><button type="button" class="o" data-x="out">خروج</button>';}
 b.addEventListener('click',function(e){var x=e.target.closest('[data-x]');if(!x)return;var a=x.getAttribute('data-x');
  if(a==='out'){if(confirm(ID.role==='student'?'تسجيل الخروج من المنصة على هذا الجهاز؟ (حضورك ونتائجك المسجَّلة لا تُلغى)':'تسجيل الخروج؟'))logout();}
  else if(a==='tstu')toStudent();else if(a==='back')toTeacher();else if(a==='clean')cleanT(x);});
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
    clearAll();ls('spss_id',JSON.stringify({bac:v,nom:r.who.nom||'',prenom:r.who.prenom||'',sp:r.who.sp||'',grp:r.who.grp||'',t:Date.now()}));ls('as_bac',v);done();});}
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
function init(){addCss();if(PAGE==='landing')landingUI();bar();
 if(PAGE==='session')sessionUI();else if(PAGE==='assess')assessUI();
 else if(PAGE==='teacher'&&ID&&ID.role==='tstu'){/* لوحة الأستاذ متاحة دائماً بالرمز */}}
window.SPSS_AUTH={id:ID,logout:logout,cur:cur,U:U,root:ROOT,slotMsg:slotMsg};
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init);else init();
})();
