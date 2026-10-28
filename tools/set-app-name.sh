#!/usr/bin/env bash
# تغيير اسم المنصة في مكان واحد: ./tools/set-app-name.sh "الاسم الكامل" "الاسم القصير" ["الوصف"]
# يحدّث: manifest.webmanifest (name, short_name, description)، assets/auth.js (APP_NAME, APP_SHORT)، وسم apple-mobile-web-app-title في كل الصفحات،
# وعنوان offline.html. (الشعار APP_TAG واسم المقياس APP_MODULE يُعدَّلان يدوياً في أعلى assets/auth.js؛ لاحقة «، الاسم القصير» في عناوين صفحات الموقع تُعدَّل يدوياً.)
# بعد التشغيل: ارفع رقم ?v= لـ auth.js في الصفحات ثم ادفع التغييرات.
set -euo pipefail
cd "$(dirname "$0")/.."
NAME="$1"; SHORT="$2"; DESC="${3:-}"
python3 - "$NAME" "$SHORT" "$DESC" <<'PY'
import json,re,sys,glob
name,short,desc=sys.argv[1],sys.argv[2],sys.argv[3]
m=json.load(open('manifest.webmanifest',encoding='utf-8')); m['name']=name; m['short_name']=short
if desc: m['description']=desc
open('manifest.webmanifest','w',encoding='utf-8').write(json.dumps(m,ensure_ascii=False,indent=2)+'\n')
a=open('assets/auth.js',encoding='utf-8').read()
a=re.sub(r"var APP_NAME='[^']*',APP_SHORT='[^']*';","var APP_NAME=%s,APP_SHORT=%s;"%(json.dumps(name,ensure_ascii=False).replace('"',"'"),json.dumps(short,ensure_ascii=False).replace('"',"'")),a,count=1)
open('assets/auth.js','w',encoding='utf-8').write(a)
for f in glob.glob('**/*.html',recursive=True):
    s=open(f,encoding='utf-8').read(); t=re.sub(r'<meta name="apple-mobile-web-app-title" content="[^"]*">','<meta name="apple-mobile-web-app-title" content="%s">'%short.replace('"','&quot;'),s)
    if t!=s: open(f,'w',encoding='utf-8').write(t); print('updated',f)
o=open('offline.html',encoding='utf-8').read(); o2=re.sub(r'<title>دون اتصال، [^<]*</title>','<title>دون اتصال، %s</title>'%short,o)
if o2!=o: open('offline.html','w',encoding='utf-8').write(o2); print('updated offline.html')
print('ok:',name,'/',short)
PY
