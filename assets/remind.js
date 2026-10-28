/* update69: مع الدخول عبر auth.js تُعرض التنبيهات في الجرس وصفحة «التنبيهات» (alerts.html) وشريط صغير تحت الشريط العلوي، فلا تُعرض هذه البطاقة.
   تبقى البطاقة فقط لمن يحمل رقم بكالوريا محفوظاً دون جلسة دخول. */
/* update54: تنبيه الأستاذ للطالب الذي لم يُجرِ تقييماً مفتوحاً (يظهر برقم البكالوريا المحفوظ في هذا الجهاز) */
(function(){
'use strict';
var API='https://script.google.com/macros/s/AKfycbysPtnOf5M0_SSFEal76q_XQbV9dtJnxbSnZO2xaXa8NUtfSdCCfcvMT3y2QiCzUjUJ/exec';
var me=document.currentScript, base=me&&me.src?me.src:location.href;
var AS=new URL('../assessment/index.html',base).href;
function ls(k){try{return localStorage.getItem(k);}catch(e){return null;}}
function bacOf(){
  var b=String(ls('as_bac')||'').replace(/\D/g,'');
  if(/^\d{5,14}$/.test(b))return b;
  try{for(var i=0;i<localStorage.length;i++){var k=localStorage.key(i);if(!/(login|attendance)/.test(k))continue;
    try{var v=JSON.parse(localStorage.getItem(k)||'null');var x=v&&String(v.bac||'').replace(/\D/g,'');if(x&&/^\d{5,14}$/.test(x))return x;}catch(e){}}}catch(e){}
  return '';
}
function esc(s){return String(s==null?'':s).replace(/[&<>"']/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c];});}
function show(notes){
  var old=document.getElementById('as-remind'); if(old)old.remove();
  if(!notes||!notes.length)return;
  var d=document.createElement('div'); d.id='as-remind'; d.setAttribute('role','alert'); d.dir='rtl';
  d.style.cssText='font-family:Cairo,"Segoe UI","Noto Sans Arabic",Tahoma,sans-serif;max-width:960px;margin:8px auto 12px;padding:0 4px;box-sizing:border-box;';
  d.innerHTML=notes.map(function(x){
    return '<div style="background:linear-gradient(135deg,#fff7ed,#ffedd5);border:2px solid #fb923c;border-radius:16px;padding:12px 14px;margin:0 0 8px;color:#7c2d12;box-shadow:0 8px 20px rgba(234,88,12,.18);text-align:right;line-height:1.7;">'+
      '<div style="font-weight:800;font-size:16.5px;color:#9a3412;margin:0 0 4px;">🔔 تنبيه من الأستاذ</div>'+
      '<div style="font-size:15px;margin:0 0 8px;">لم تُجرِ بعد <b>'+esc(x.title)+'</b> ('+esc(x.topic)+'). التقييم مفتوح الآن، أجره قبل غلقه.</div>'+
      '<a href="'+AS+'#'+encodeURIComponent(x.id)+'" style="display:flex;align-items:center;justify-content:center;min-height:46px;border-radius:14px;background:#ea580c;color:#fff;font-weight:800;font-size:15.5px;text-decoration:none;">الذهاب إلى التقييم الآن</a></div>';
  }).join('');
  document.body.insertBefore(d,document.body.firstChild);
}
function run(){
  if(window.__spssAL)return;
  var b=bacOf(); if(!b)return;
  var ck='as-notes-'+b, hit=null;
  try{hit=JSON.parse(sessionStorage.getItem(ck)||'null');}catch(e){}
  if(hit&&Date.now()-hit.t<90000){show(hit.n);return;}
  fetch(API+'?action=asnotes&sbac='+encodeURIComponent(b)+'&t='+Date.now(),{cache:'no-store'}).then(function(r){return r.json();}).then(function(r){
    if(!r||!r.ok)return; try{sessionStorage.setItem(ck,JSON.stringify({t:Date.now(),n:r.notes||[]}));}catch(e){}
    show(r.notes||[]);
  }).catch(function(){});
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',run);else run();
})();
