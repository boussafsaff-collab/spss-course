# برمجيات إحصائية SPSS

موقع ثابت لمقياس **برمجيات إحصائية (SPSS 25)**، السنة الثانية ماستر إدارة مالية، جامعة قسنطينة 2 عبد الحميد مهري، د. بوصفصاف فريد.

الموقع: https://boussafsaff-collab.github.io/spss-course/

يتيح الموقع لجميع الطلبة الوصول إلى المحاضرات والتطبيقات وملفات البيانات دون حساب على منصة Moodle ودون تسجيل الدخول.

## المحتوى

| المجلد | المحاضرة | التطبيق | ملفات البيانات |
|---|---|---|---|
| `l1/` | تطهير البيانات (`spss25-data-cleaning.html`) | `spss25-tp1-data-cleaning.html` | `Bank_Customer_Satisfaction.xlsx` |
| `l2/` | الثبات والصدق (`spss25-reliability-validity.html`) | `spss25-tp2-reliability-validity.html` | `Bank_Customer_Satisfaction.xlsx`، `Library_Satisfaction_Training.xlsx` |
| `l3/` | التحليل العاملي الاستكشافي EFA (`spss25-efa.html`) | `spss25-efa-tp.html` | `Bank_Service_Quality.xlsx` |

الصفحة الرئيسية الدائمة: `index.html` (رابط واحد ثابت في Moodle ورمز QR واحد ثابت).

- المحاضرات: `index.html#lectures`
- التطبيقات: `index.html#tps`
- التقييم المستمر: `assessment/index.html` (قريباً)

### قائمة المحاضرات والتطبيقات (العنوان والتاريخ)

تُقرأ القائمة من ورقة «المحتوى» في Google Sheet عبر Apps Script (`?action=course`):
الأعمدة: النوع (`lecture` / `tp`)، الرقم، العنوان، التاريخ (yyyy-mm-dd)، المسار (مثل `l1/spss25-data-cleaning.html`)، ظاهر.
إن تعذّر الوصول إلى Apps Script تُعرض النسخة الاحتياطية `content.json` (حدّثها عند إضافة صفحة جديدة).

## ملاحظات

- تسجيل الحضور والاختبارات ترسل إلى خدمة Google Apps Script الخاصة بالمقياس، وتتطلب اتصالاً بالإنترنت.
- البيانات مولّدة لأغراض تعليمية.
- الملف `.nojekyll` يمنع GitHub Pages من معالجة الموقع بـ Jekyll.
