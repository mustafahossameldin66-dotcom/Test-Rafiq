# رفيق القرآن — V81

هذه نسخة مبنية بنية نظيفة قابلة للرفع مباشرة إلى GitHub Pages.

## الملفات
- index.html: الواجهة فقط
- app.css: التصميم والأنيميشن
- app.js: منطق التطبيق
- data-loader.js: تحميل البيانات
- storage.js: IndexedDB
- prayer.js: حساب مواقيت محلي
- core-content.json: المحتوى الأساسي
- content-meta.json: فهرس الكتب والمصادر
- sw.js: Service Worker
- manifest.webmanifest + icon-192.png + icon-512.png + icon.svg: PWA

## الرفع
ارفع **كل الملفات الموجودة في هذا المجلد** إلى جذر Repository. لا ترفع ZIP داخل الموقع. لا توجد مجلدات فرعية مطلوبة لهذه النسخة، لتجنب مشكلة نسيان مجلد assets التي كانت تجعل الصفحة تظهر HTML خامًا.

الكتب والتلاوات الكبيرة تظل في GitHub Release `content-v1`، ولا تدخل في Core.
