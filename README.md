# پرگار — نسخه‌ی Electron

## اجرا و ساخت exe (روی ویندوز)
1. Node.js (نسخه‌ی LTS) را نصب کنید.
2. روی `build-exe.bat` دوبار کلیک کنید (یا `npm install` و سپس `npm run dist`).
3. خروجی در پوشه‌ی `dist/` ساخته می‌شود: نسخه‌ی قابل‌حمل (`Pargar-*-portable.exe`) و نصاب (NSIS).
   برای اجرای آزمایشی بدون ساخت exe: `npm start`
   آیکون: فایل `build/icon.ico` را بگذارید و در package.json زیر `build.win` مقدار `"icon": "build/icon.ico"` را اضافه کنید.

## ساختار
- `main.js` / `preload.js` — پوسته‌ی Electron (پروتکل امن `pargar://app/`، بدون Node در صفحه، لینک‌های اینترنتی در مرورگر سیستم).
- `www/index.html` — خود برنامه (به‌جای ~۱ مگابایت دارایی جاسازی‌شده، اکنون ~۲۲۰ کیلوبایت).
- `www/assets/fonts/vazirmatn-fd` — وزیرمتن با ارقام فارسی (۵ وزن).
- `www/assets/vendor` — KaTeX، MathLive، JSXGraph، three.js (r128 سراسری + نسخه‌ی ماژولی جدید) با مجوزها.
- `www/assets/js/vendor.js` — بارگذاری تنبل کتابخانه‌ها (`Vendor.load('jsxgraph')`) و تبدیل خودکار آدرس CDN در اپلت‌های HTML.
- `www/assets/js/math-editor.js` — ویرایشگر فرمول سبک Word.
- `www/assets/js/geometry.js` — بلوک «شکل هندسی تعاملی» (سازنده‌ی بدون‌کدنویسی روی JSXGraph).
- `www/assets/js/block-picker.js` — انتخاب‌گر جست‌وجودار بخش‌ها.

## نکته‌ی داده‌ها
درس‌ها در پروفایل کاربر ویندوز (`%APPDATA%\Pargar`) نگه‌داری می‌شوند و با جابه‌جایی exe از بین نمی‌روند.
درس‌های نسخه‌ی مرورگری را با «خروجی گرفتن» (zip) از نسخه‌ی قدیمی و «وارد کردن درس» در نسخه‌ی جدید منتقل کنید.

## فایل‌های جئوجبرا (.ggb) و اپلت‌های HTML
- در بلوک «اپلت تعاملی» حالت «فایل» را بزنید؛ فایل `.html`، `.ggb` یا یک `.zip` (برای اپلت چندفایلی) را مستقیم انتخاب کنید. لینک لازم نیست.
- `.ggb` با اینترنت مستقیم کار می‌کند. برای اجرای **کاملاً آفلاین**: «GeoGebra Math Apps Bundle» را از geogebra.org/download بگیرید، باز کنید و **محتوای پوشه‌ی `GeoGebra`** را در `www/assets/vendor/geogebra/` بگذارید
  (باید `www/assets/vendor/geogebra/deployggb.js` و `www/assets/vendor/geogebra/HTML5/5.0/web3d/` وجود داشته باشد)، سپس دوباره exe را بسازید.
- اپلت‌های HTML که JSXGraph، three.js یا KaTeX را از CDN صدا می‌زنند، خودکار با نسخه‌ی داخلی اجرا می‌شوند.
