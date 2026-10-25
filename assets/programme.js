/* «محتوى المادة»: المحاضرات ومحاورها من ورقة «الإعدادات» (action=course) — نص فقط، بلا روابط ولا تواريخ.
   عند تعذّر الاتصال تبقى القائمة الثابتة المضمّنة في الصفحة. */
(function(){
var API='https://script.google.com/macros/s/AKfycbysPtnOf5M0_SSFEal76q_XQbV9dtJnxbSnZO2xaXa8NUtfSdCCfcvMT3y2QiCzUjUJ/exec';
var PAL=[['#0284c7','#075985','#e0f2fe'],['#7c3aed','#5b21b6','#ede9fe'],['#059669','#065f46','#d1fae5'],['#d97706','#92400e','#fef3c7'],['#e11d48','#9f1239','#ffe4e6']];
function esc(s){return String(s==null?'':s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');}
function bidi(s){return esc(s).replace(/\([A-Za-z][A-Za-z0-9'’.\-\/ ]*\)|[A-Za-z][A-Za-z0-9'’.\-]*(?:\s+[A-Za-z0-9][A-Za-z0-9'’.\-]*)*/g,function(m){return '<bdi dir="ltr">'+m+'</bdi>';});}
function title(s){return String(s||'').replace(/^\s*المحاضرة\s*\d+\s*[:：\-–]\s*/,'').trim();}
function countLabel(n){var w=n===1?'محاضرة واحدة':n===2?'محاضرتان':(n>=3&&n<=10)?n+' محاضرات':n+' محاضرة';
 return w+'، لكل محاضرة تطبيق عملي على <bdi dir="ltr" style="white-space:nowrap;">SPSS 27</bdi>';}
function cards(list){var h='';list.forEach(function(L,i){var c=PAL[i%PAL.length],nx=PAL[(i+1)%PAL.length];
 h+='<div class="prog-item" style="position:relative;background:#fff;border:1px solid #e3e9f2;border-right:5px solid '+c[0]+';border-radius:16px;padding:clamp(12px,3vw,16px);box-shadow:0 6px 18px rgba(15,23,42,.06);display:flex;align-items:flex-start;gap:clamp(10px,2.5vw,14px);">'
 +'<div style="flex:0 0 clamp(40px,11vw,52px);width:clamp(40px,11vw,52px);height:clamp(40px,11vw,52px);border-radius:13px;background:linear-gradient(145deg,'+c[0]+','+c[1]+');color:#fff;font-weight:800;font-size:clamp(19px,5vw,24px);display:flex;align-items:center;justify-content:center;box-shadow:0 6px 14px '+c[0]+'40;">'+L.n+'</div>'
 +'<div style="flex:1 1 0;min-width:0;"><span style="display:inline-block;background:'+c[2]+';color:'+c[1]+';font-size:13px;font-weight:800;border-radius:8px;padding:2px 10px;margin-bottom:6px;">المحاضرة '+L.n+'</span>'
 +'<div class="prog-title" style="font-size:clamp(15px,4vw,17px);font-weight:800;color:#0f2744;line-height:1.65;margin:0 0 4px;overflow-wrap:anywhere;">'+bidi(L.t)+'</div>'
 +(L.a?'<div class="prog-axes" style="font-size:13.5px;color:#475569;line-height:1.75;overflow-wrap:anywhere;"><b style="color:'+c[1]+';font-weight:700;">المحاور: </b>'+bidi(L.a)+'</div>':'')
 +'</div></div>';
 if(i<list.length-1)h+='<div style="display:flex;justify-content:flex-start;padding-right:calc(clamp(12px,3vw,16px) + 5px + clamp(40px,11vw,52px) / 2 - 1.5px);height:16px;" aria-hidden="true"><span style="width:3px;height:16px;border-radius:3px;background:linear-gradient('+c[0]+','+nx[0]+');"></span></div>';});
 return h;}
function fromSessions(ss){var seen={},out=[];(ss||[]).forEach(function(s){if(!s||s.type!=='lecture')return;var n=Number(s.number)||0;if(n<1||seen[n])return;seen[n]=1;out.push({n:n,t:title(s.session),a:String(s.axes||'').trim()});});
 out.sort(function(x,y){return x.n-y.n;});return out;}
function render(list,src){var box=document.getElementById('prog-list'),cnt=document.getElementById('prog-count');if(!box||!list.length)return;
 box.innerHTML=cards(list);if(cnt)cnt.innerHTML=countLabel(list.length);box.setAttribute('data-source',src);}
if(typeof module!=='undefined'&&module.exports){module.exports={cards:cards,countLabel:countLabel,fromSessions:fromSessions};return;}
var done=false,ctl=window.AbortController?new AbortController():null,to=setTimeout(function(){done=true;if(ctl)ctl.abort();},9000);
try{fetch(API+'?action=course&t='+Date.now(),{cache:'no-store',signal:ctl?ctl.signal:undefined}).then(function(r){if(!r.ok)throw 0;return r.text();}).then(function(t){
 if(done)return;clearTimeout(to);t=String(t||'').trim();var m=/^[A-Za-z_$][\w$.]*\(([\s\S]*)\);?$/.exec(t);var d=JSON.parse(m?m[1]:t);
 if(d&&d.ok&&Array.isArray(d.sessions)){var L=fromSessions(d.sessions);if(L.length)render(L,'sheet');}}).catch(function(){});}catch(e){}
})();
