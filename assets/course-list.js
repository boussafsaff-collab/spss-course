/* قائمة المحاضرات أو التطبيقات.
   العناوين والمسارات: content.json (في المستودع).
   التواريخ: ورقة «الإعدادات» عبر Apps Script (?action=course)، لكل تخصص (المحاضرات) أو لكل فوج (التطبيقات)،
   بالقاعدة نفسها التي تقفل تسجيل الحضور قبل تاريخ الحصة. القفل الحقيقي يبقى على الخادم.
   إن تعذّر الوصول إلى Apps Script: القائمة بروابطها دون تواريخ، مع ملاحظة. */
(function(){
var API='https://script.google.com/macros/s/AKfycbysPtnOf5M0_SSFEal76q_XQbV9dtJnxbSnZO2xaXa8NUtfSdCCfcvMT3y2QiCzUjUJ/exec';
var TYPE=document.body.getAttribute('data-type')==='tp'?'tp':'lecture';
var LS=TYPE==='tp'?'spss_course_group':'spss_course_specialty';
var LBL=TYPE==='tp'?'التطبيق':'المحاضرة';
var COLORS=[['#0284c7','#075985','#e0f2fe'],['#7c3aed','#5b21b6','#ede9fe'],['#059669','#065f46','#d1fae5'],['#d97706','#92400e','#fef3c7'],['#db2777','#9d174d','#fce7f3']];
var st={content:null,live:null,liveFailed:false,choice:null};
try{st.choice=localStorage.getItem(LS);}catch(e){}
function $(id){return document.getElementById(id);}
function mk(tag,cls){var e=document.createElement(tag);if(cls)e.className=cls;return e;}
function norm(s){return String(s||'').trim().replace(/\s+/g,' ').toLowerCase();}
function dmy(d){var m=/^(\d{4})-(\d{2})-(\d{2})$/.exec(String(d||''));return m?m[3]+'/'+m[2]+'/'+m[1]:'';}
function isoDate(d){return /^\d{4}-\d{2}-\d{2}$/.test(String(d||''))?String(d):'';}
function algiersToday(){try{return new Intl.DateTimeFormat('en-CA',{timeZone:'Africa/Algiers',year:'numeric',month:'2-digit',day:'2-digit'}).format(new Date());}catch(e){return new Date().toISOString().slice(0,10);}}
function safePath(p){p=String(p||'').trim();if(/^https:\/\//i.test(p))return p;if(/^[A-Za-z0-9_\-][A-Za-z0-9_\-.\/]*(\?[A-Za-z0-9_=&\-.]*)?(#[A-Za-z0-9_\-]*)?$/.test(p)&&p.indexOf('..')<0)return '../'+p;return '';}
function bidiText(el,s){var re=/[A-Za-z][A-Za-z0-9'’.\-]*(?:\s+[A-Za-z0-9][A-Za-z0-9'’.\-]*)*/g,i=0,m;
 while((m=re.exec(s))){if(m.index>i)el.appendChild(document.createTextNode(s.slice(i,m.index)));var b=document.createElement('bdi');b.dir='ltr';b.textContent=m[0];el.appendChild(b);i=m.index+m[0].length;}
 if(i<s.length)el.appendChild(document.createTextNode(s.slice(i)));}
function options(){var L=st.live,C=st.content||{};var k=TYPE==='tp'?'groups':'specialties';return (L&&L[k]&&L[k].length?L[k]:C[k])||[];}
function renderPicker(){
 var box=$('chips');box.textContent='';var opts=options();
 if(st.choice&&opts.length&&opts.indexOf(st.choice)<0)st.choice=null;
 opts.forEach(function(o){var b=mk('button','chip');b.type='button';b.textContent=o;b.setAttribute('aria-pressed',o===st.choice?'true':'false');
  b.onclick=function(){st.choice=o;try{localStorage.setItem(LS,o);}catch(e){}renderPicker();renderList();};box.appendChild(b);});
 $('picker').hidden=st.liveFailed||!opts.length;
}
function setNote(txt,warn){var n=$('note');n.textContent=txt||'';n.className='note'+(warn?' warn':'');n.hidden=!txt;}
function renderList(){
 var box=$('list');box.textContent='';
 var items=((st.content&&st.content.items)||[]).filter(function(x){return x&&x.type===TYPE&&x.visible!==false;})
  .sort(function(a,b){return (Number(a.number)||0)-(Number(b.number)||0);});
 if(!items.length){var p=mk('p','muted');p.textContent=st.content?'لا توجد عناصر منشورة بعد.':'جارٍ تحميل القائمة…';box.appendChild(p);return;}
 var withDates=!!(st.live&&st.choice), today=(st.live&&isoDate(st.live.today))||algiersToday();
 var byS={};if(st.live)(st.live.sessions||[]).forEach(function(s){if(s&&s.type===TYPE)byS[norm(s.session)]=s;});
 if(st.liveFailed)setNote('تعذّر جلب تواريخ الحصص حالياً، فتُعرض القائمة دون تواريخ. موعد كل حصة يُطبَّق عند تسجيل الحضور في صفحتها.',true);
 else if(!st.live)setNote('جارٍ جلب التواريخ…');
 else if(!st.choice)setNote(TYPE==='tp'?'اختر فوجك لعرض تاريخ كل تطبيق.':'اختر تخصصك لعرض تاريخ كل محاضرة.',true);
 else setNote('');
 items.forEach(function(x,k){
  var n=Number(x.number)||k+1,c=COLORS[(n-1)%COLORS.length],href=safePath(x.path),state='open',d='';
  if(withDates){var s=byS[norm(x.session)];d=s&&s.dates?isoDate(s.dates[st.choice]):'';state=!d?'nodate':(d>today?'future':(d===today?'today':'past'));}
  var lock=!href||state==='future'||state==='nodate';
  var a=mk(lock?'div':'a','item'+(lock?' locked':''));if(!lock)a.href=href;else a.setAttribute('aria-disabled','true');
  a.setAttribute('data-state',href?state:'nopath');
  a.style.setProperty('--c',c[0]);a.style.setProperty('--d',c[1]);a.style.setProperty('--bg',c[2]);
  var num=mk('span','num');num.textContent=n;a.appendChild(num);
  var body=mk('span','body');var lbl=mk('span','lbl');lbl.textContent=LBL+' '+n;body.appendChild(lbl);
  var t=mk('span','ttl');bidiText(t,String(x.title||''));body.appendChild(t);
  var mt=null,ic;
  if(state==='future'){mt=mk('span','meta');ic=mk('i','fa-solid fa-lock');mt.appendChild(ic);mt.appendChild(document.createTextNode('يُتاح بتاريخ '));}
  else if(state==='past'||state==='today'){mt=mk('span','meta');ic=mk('i','fa-regular fa-calendar');mt.appendChild(ic);mt.appendChild(document.createTextNode('التاريخ: '));}
  else if(state==='nodate'){mt=mk('span','meta');ic=mk('i','fa-regular fa-clock');mt.appendChild(ic);mt.appendChild(document.createTextNode('لم يُحدَّد التاريخ بعد'));}
  else if(!href){mt=mk('span','meta');mt.textContent='قريباً';}
  if(mt&&d){var bd=document.createElement('bdi');bd.dir='ltr';bd.textContent=dmy(d);mt.appendChild(bd);if(state==='today'){var td=mk('span','today');td.textContent='اليوم';mt.appendChild(td);}}
  if(mt)body.appendChild(mt);
  a.appendChild(body);
  var go=mk('i','fa-solid '+(lock?'fa-lock':'fa-chevron-left')+' go');go.setAttribute('aria-hidden','true');if(!lock||state!=='future')a.appendChild(go);
  box.appendChild(a);
 });
 document.documentElement.setAttribute('data-source',st.live?'sheet':(st.liveFailed?'static':'loading'));
}
function parse(txt){txt=String(txt||'').trim();var m=/^[A-Za-z_$][\w$.]*\(([\s\S]*)\);?$/.exec(txt);return JSON.parse(m?m[1]:txt);}
function get(url,ms){return new Promise(function(res,rej){var done=false,to=setTimeout(function(){if(!done){done=true;rej(new Error('timeout'));}},ms);
 fetch(url,{cache:'no-store'}).then(function(r){if(!r.ok)throw new Error('HTTP '+r.status);return r.text();})
  .then(function(t){if(done)return;done=true;clearTimeout(to);res(parse(t));})
  .catch(function(e){if(done)return;done=true;clearTimeout(to);rej(e);});});}
function refresh(){renderPicker();renderList();}
refresh();
get('../content.json?t='+Date.now(),8000).then(function(d){st.content=d;refresh();}).catch(function(){
 var box=$('list');box.textContent='';var p=mk('p','muted');p.appendChild(document.createTextNode('تعذّر تحميل القائمة. أعد المحاولة بعد قليل أو ارجع إلى '));var a=document.createElement('a');a.href='../index.html';a.textContent='صفحة المقياس';p.appendChild(a);p.appendChild(document.createTextNode('.'));box.appendChild(p);
 document.documentElement.setAttribute('data-source','none');});
get(API+'?action=course&t='+Date.now(),9000).then(function(d){if(d&&d.ok&&Array.isArray(d.sessions)){st.live=d;}else throw new Error('no data');})
 .catch(function(){st.liveFailed=true;}).then(function(){if(st.content)refresh();});
})();
