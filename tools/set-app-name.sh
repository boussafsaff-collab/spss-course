#!/usr/bin/env bash
# تغيير اسم المنصة في مكان واحد: ./tools/set-app-name.sh "الاسم الكامل" "الاسم القصير"
# يحدّث: manifest.webmanifest (name, short_name)، assets/auth.js (APP_NAME, APP_SHORT)، وسم apple-mobile-web-app-title في كل الصفحات.
# بعد التشغيل: ارفع رقم ?v= لـ auth.js في الصفحات ثم ادفع التغييرات.
set -euo pipefail
cd "$(dirname "$0")/.."
NAME="$1"; SHORT="$2"
python3 - "$NAME" "$SHORT" <<'PY'
import json,re,sys,glob
name,short=sys.argv[1],sys.argv[2]
m=json.load(open('manifest.webmanifest',encoding='utf-8')); m['name']=name; m['short_name']=short
open('manifest.webmanifest','w',encoding='utf-8').write(json.dumps(m,ensure_ascii=False,indent=2)+'\n')
a=open('assets/auth.js',encoding='utf-8').read()
a=re.sub(r"var APP_NAME='[^']*',APP_SHORT='[^']*';","var APP_NAME=%s,APP_SHORT=%s;"%(json.dumps(name,ensure_ascii=False).replace('"',"'"),json.dumps(short,ensure_ascii=False).replace('"',"'")),a,count=1)
open('assets/auth.js','w',encoding='utf-8').write(a)
for f in glob.glob('**/*.html',recursive=True):
    s=open(f,encoding='utf-8').read(); t=re.sub(r'<meta name="apple-mobile-web-app-title" content="[^"]*">','<meta name="apple-mobile-web-app-title" content="%s">'%short.replace('"','&quot;'),s)
    if t!=s: open(f,'w',encoding='utf-8').write(t); print('updated',f)
print('ok:',name,'/',short)
PY
