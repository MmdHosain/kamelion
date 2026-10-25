# سند جامع نیازمندی‌ها و مشخصات فنی تیونینگ منابع سرور (Resource Tuning Specification)
## پروژه سامانه جامع درمانی کاملین (Kamelion Healthcare Platform)
### وضعیت: آماده بررسی، هماهنگی تیمی و تصویب پیش از پیاده‌سازی (Spec-First / No Code Changed)

---

## فهرست مطالب (Table of Contents)
1. [خلاصه مدیریتی و اهداف تیونینگ منابع (Executive Summary)](#۱-خلاصه-مدیریتی-و-اهداف-تیونینگ-منابع)
2. [ماتریس تطبیق و تحلیل نقایص وضعیت فعلی (Current vs. Proposed Matrix)](#۲-ماتریس-تطبیق-و-تحلیل-نقایص-وضعیت-فعلی)
3. [بخش اول: بهینه‌سازی و تیونینگ وب‌سرور Nginx](#۳-بخش-اول-بهینه‌سازی-و-تیونینگ-وب‌سرور-nginx)
4. [بخش دوم: بهینه‌سازی و تیونینگ سرویس بک‌اند (Django & Gunicorn)](#۴-بخش-دوم-بهینه‌سازی-و-تیونینگ-سرویس-بک‌اند-django--gunicorn)
5. [بخش سوم: بهینه‌سازی و تیونینگ پایگاه داده PostgreSQL 16](#۵-بخش-سوم-بهینه‌سازی-و-تیونینگ-پایگاه-داده-postgresql-16)
6. [بخش چهارم: بهینه‌سازی خط بیلد و دارایی‌های فرانت‌اند (Vite & Frontend)](#۶-بخش-چهارم-بهینه‌سازی-خط-بیلد-و-دارایی‌های-فرانت‌اند-vite--frontend)
7. [بخش پنجم: تنظیمات سطح سیستم‌عامل لینوکس و کانتینرهای داکر (OS & Docker Host)](#۷-بخش-پنجم-تنظیمات-سطح-سیستم‌عامل-لینوکس-و-کانتینرهای-داکر-os--docker-host)
8. [پروفایل‌های تفکیکی بر اساس منابع سخت‌افزاری سرور (1GB / 2GB / 4GB RAM)](#۸-پروفایل‌های-تفکیکی-بر-اساس-منابع-سخت‌افزاری-سرور)
9. [چک‌لیست گام‌به‌گام اجرایی و دستورالعمل هماهنگی با تیم (Team Coordination Checklist)](#۹-چک‌لیست-گام‌به‌گام-اجرایی-و-دستورالعمل-هماهنگی-با-تیم)
10. [دستورالعمل پایش، بنچمارک و سناریوی بازگشت (Monitoring & Rollback Plan)](#۱۰-دستورالعمل-پایش-بنچمارک-و-سناریوی-بازگشت)

---

## ۱. خلاصه مدیریتی و اهداف تیونینگ منابع

### ۱.۱. بیان مسئله
در حال حاضر سامانه کاملین از ۳ سرویس اصلی تحت داکر کامپوز (`kamelion-db` مبتنی بر PostgreSQL 16، `kamelion-backend` مبتنی بر جنگو و گانیکورن، و `kamelion-frontend` مبتنی بر Nginx آلپاین) تشکیل شده است. بررسی عمیق کدهای مخزن نشان می‌دهد که:
1. هیچ محدودیت حافظه و پردازنده‌ای (`mem_limit` / `cpus`) برای کانتینرها تعیین نشده است. در صورت بروز هرگونه جهش مصرف، هسته لینوکس فرآیندها را از طریق OOM Killer متوقف می‌کند.
2. گانیکورن با ۳ ورکر همگام (`sync`) ساده اجرا می‌شود. در صورت اشغال ورکرها توسط پاسخ‌های طولانی سرویس تریاژ هوش مصنوعی (که تایم‌اوت ۳۰ ثانیه‌ای دارد) یا ارسال پیامک، کل سایت برای سایر مراجعین دچار خطای ۵۰۴ / ۵۰۲ می‌شود.
3. ارتباط جنگو با پایگاه داده فاقد نگهداری اتصال (`CONN_MAX_AGE = 0`) است؛ یعنی به ازای هر درخواست وب، یک اتصال TCP و هندشیک جدید با دیتابیس ساخته و فوراً نابود می‌شود که بار پردازشی شدیدی روی CPU و RAM می‌گذارد.
4. سرور Nginx بدون فشرده‌سازی Gzip/Brotli و بدون هدرهای کش دائمی پیکربندی شده و فایل‌های رسانه (`/media/`) را به جای سرو مستقیم از دیسک، به سمت ورکر‌های گانیکورن هدایت می‌کند.
5. فایل لاگ‌های داکر هیچ محدودیتی ندارند و در طولانی‌مدت دیسک سرور لینوکس را پر می‌کنند.

### ۱.۲. اهداف کلیدی تیونینگ
- **پایداری حداکثری (Zero Crash / Anti-OOM):** مهار کامل نشت حافظه و تعریف سقف مصرف برای هر سرویس متناسب با RAM سرور.
- **افزایش ظرفیت پاسخگویی هم‌زمان (Concurrency):** افزایش توان پاسخگویی هم‌زمان از ۳ کاربر به حداقل ۳۰ تا ۶۰ درخواست هم‌زمان در کمترین منابع سخت‌افزاری.
- **کاهش مصرف پردازنده و رم:** بازاستفاده از اتصالات دیتابیس و اتصال دائمی (`Keepalive`) میان Nginx و گانیکورن.
- **فشرده‌سازی استاتیک در زمان بیلد (Zero-CPU Precompression):** حذف کامل سربار فشرده‌سازی پویا از روی CPU سرور با پیش‌فشرده‌سازی در فرانت‌اند.

---

## ۲. ماتریس تطبیق و تحلیل نقایص وضعیت فعلی

جدول زیر تطابق مستقیم تنظیمات موجود در مخزن پروژه را با چالش‌های لینوکسی و راهکار پیشنهادی نشان می‌دهد:

| بخش | تنظیم فعلی در مخزن | چالش در سرور لینوکسی با منابع کم | وضعیت اصلاحی پیشنهادی |
|---|---|---|---|
| **گانیکورن (ورکرها)** | `--workers 3` (همگام / sync) در `backend_core/Dockerfile` | مسدود شدن کامل ورکرها در زمان فراخوانی AI (تایم‌اوت ۳۰ ثانیه) یا پنل‌چی؛ خطای ۵۰۲/۵۰۴ در لود همزمان ۴ کاربر | سوئیچ به ورکر چندنخی `gthread` با ۲ ورکر و ۴ نخ (پاسخگویی به ۸ درخواست همزمان با مصرف حافظه کمتر از ۳ ورکر مجزا) |
| **بازیافت حافظه پایتون** | بدون پارامترهای `--max-requests` و `--max-requests-jitter` | نشت حافظه تدریجی پایتون بر اثر فراخوانی‌های Pillow و psycopg2 و رشد رم تا سقف مصرف سرور | افزودن `--max-requests 1000` و `--max-requests-jitter 100` جهت ری‌استارت نرم دوره‌ای ورکرها |
| **اشتراک حافظه کدهای جنگو** | پرچم `--preload` غیرفعال است | هر ورکر جنگو تمام ماژول‌ها و مدل‌ها را به طور مستقل در رم لود می‌کند (حدود ۸۰ تا ۱۲۰ مگابایت به ازای هر ورکر) | فعال‌سازی `--preload` در گانیکورن جهت استفاده از ویژگی Copy-on-Write لینوکس و کاهش ۳۰ تا ۵۰ درصدی رم مصرفی |
| **طول عمر اتصال به دیتابیس** | `CONN_MAX_AGE` در `settings.py` تنظیم نشده (مقدار پیش‌فرض ۰) | باز و بسته شدن مکرر سوکت دیتابیس در هر ریکوئست، اتلاف CPU و ایجاد گلوگاه پردازشی در پستگرس | تنظیم `CONN_MAX_AGE = 60` (یا ۱۲۰ ثانیه) و فعال‌سازی `CONN_HEALTH_CHECKS = True` در جنگو |
| **سرو فایل‌های Media** | Nginx در `location /media/` ریکوئست را به `backend:8000` پاس می‌دهد | اولاً در محیط پروداکشن جنگو به دلیل `DEBUG=False` اصلاً مدیا را سرو نمی‌کند (خطای ۴۰۴)؛ ثانیاً ورکر باارزش گانیکورن معطل ارسال بایت‌های عکس می‌شود | مانت کردن ولوم `media_data` در کانتینر فرانت‌اند و سرو مستقیم و فوق‌سریع عکس‌ها توسط Nginx با `sendfile` |
| **فشرده‌سازی Nginx** | هیچ تنظیمی برای `gzip` در `front-end/nginx.conf` وجود ندارد | ارسال فایل‌های JS و CSS بدون فشرده‌سازی (چانک‌های ۴۵۰ کیلوبایتی و ۶۰۰ کیلوبایتی)؛ افزایش ترافیک، زمان انتقال و مصرف رم سوکت‌ها | فعال‌سازی `gzip_static on;` و فشرده‌سازی پویا به عنوان فال‌بک برای فایل‌های JSON و SVG و متنی |
| **کش کلاینت در Nginx** | هدرهای `Cache-Control` برای دارایی‌های هش‌شده Vite تنظیم نشده | کلاینت با هر بار رفرش دارایی‌ها را مجدداً درخواست می‌کند که منجر به اشغال پردازنده و لاگ‌های غیرضروری می‌شود | افزودن `Cache-Control: "public, max-age=31536000, immutable"` برای فایل‌های `/assets/` و `no-cache` برای `index.html` |
| **ارتباط Nginx با گانیکورن** | `proxy_pass http://backend:8000;` بدون Keepalive و با HTTP/1.0 | ایجاد اتصال TCP جدید میان کانتینر Nginx و کانتینر بک‌اند به ازای هر درخواست API | ایجاد بلاک `upstream backend` با `keepalive 32;` و تنظیم `proxy_http_version 1.1;` |
| **تنظیمات حافظه PostgreSQL** | اجرای پیش‌فرض `postgres:16-alpine` با `max_connections=100` | مصرف بی‌رویه رم به ازای هر اتصال و احتمال بسیار بالای OOM دیتابیس در سرور‌های ۱ تا ۲ گیگابایتی | کاهش `max_connections` به ۲۵ و تنظیم دقیق `shared_buffers`، `work_mem`، `maintenance_work_mem` و `effective_cache_size` |
| **محدودیت منابع داکر** | هیچ محدودیتی در `docker-compose.yml` درج نشده | در صورت بروز لوپ یا حافظه‌خواری در یک سرویس، کل سرور لینوکس هنگ می‌کند و دسترسی SSH قطع می‌شود | تعریف `deploy.resources.limits` و `mem_reservation` مشخص برای هر کانتینر |
| **لاگ‌های کانتینرها** | بدون تنظیم درایور و سایز لاگ در داکر کامپوز | فایل‌های لاگ JSON داکر تا بی‌نهایت رشد کرده و دیسک سرور را ۱۰۰٪ پر می‌کنند | تنظیم `logging: driver: json-file` با سقف `max-size: 10m` و `max-file: 3` برای تمام سرویس‌ها |

---

## ۳. بخش اول: بهینه‌سازی و تیونینگ وب‌سرور Nginx

### ۳.۱. فایل پیکربندی پیشنهادی کامل برای Nginx (`front-end/nginx.conf`)
این فایل باید جایگزین فایل فعلی شود. کلیه نیازهای SEO، پیش‌نمایش بات‌ها، سرو فایل‌های مدیا، کش کلاینت، فشرده‌سازی و اتصال بهینه به گانیکورن در این فایل دیده شده است:

```nginx
# front-end/nginx.conf
# پیکربندی بهینه‌سازی شده Nginx برای سرورهای کم‌منبع لینوکسی

# تعریف Upstream به همراه Keepalive جهت کاهش چشمگیر Handshake های TCP بین Nginx و Django
upstream backend_cluster {
    server backend:8000;
    keepalive 32;
}

# نقشه‌برداری بات‌های شبکه‌های اجتماعی برای سئو و پیش‌نمایش (بدون تغییر لاجیک قبلی)
map $http_user_agent $seo_preview_bot {
    default 0;
    ~*googlebot|bingbot 0;
    ~*telegram|whatsapp|twitterbot|facebookexternalhit|linkedinbot|slackbot|discordbot|baiduspider 1;
}

# تعریف Zone های Rate Limiting جهت محافظت از منابع سرور در برابر حملات داس و کراولرهای غیرمجاز
limit_req_zone $binary_remote_addr zone=api_general:10m rate=20r/s;
limit_req_zone $binary_remote_addr zone=api_sensitive:10m rate=3r/s;
limit_conn_zone $binary_remote_addr zone=addr_conn:10m;

server {
    listen 80;
    server_name _;

    root /usr/share/nginx/html;
    index index.html;

    # سقف مجاز برای آپلود فایل (مطابق با ۵ مگابایت مجاز سرویس مقالات)
    client_max_body_size 10M;
    client_body_buffer_size 128k;

    # فعال‌سازی ارسال مستقیم فایل از هسته لینوکس بدون کپی در فضای کاربر
    sendfile on;
    tcp_nopush on;
    tcp_nodelay on;

    # بهینه‌سازی تایم‌اوت‌های کلاینت جهت آزاد کردن سریع منابع در اتصالات مرده
    keepalive_timeout 65;
    keepalive_requests 1000;
    client_header_timeout 15;
    client_body_timeout 15;
    send_timeout 15;

    # تنظیمات فشرده‌سازی Gzip
    gzip on;
    gzip_static on; # اولویت با فایل‌های از پیش فشرده شده در بیلد فرانت
    gzip_vary on;
    gzip_proxied any;
    gzip_comp_level 5;
    gzip_min_length 256;
    gzip_types
        text/plain
        text/css
        text/xml
        application/json
        application/javascript
        application/x-javascript
        application/xml
        application/xml+rss
        text/javascript
        image/svg+xml;

    # محدودیت تعداد اتصالات همزمان به ازای هر IP
    limit_conn addr_conn 30;

    # ----------------------------------------------------
    # ۱. کش دائمی برای دارایی‌های استاتیک فرانت‌اند (JS/CSS/Fonts)
    # ----------------------------------------------------
    location /assets/ {
        # چون دارایی‌های بیلد Vite دارای هش نامگذاری هستند، می‌توانند ۱ سال کش شوند
        expires 1y;
        add_header Cache-Control "public, max-age=31536000, immutable";
        access_log off;
        try_files $uri =404;
    }

    location ~* \.(?:ico|png|jpg|jpeg|gif|webp|svg|woff|woff2|ttf|eot)$ {
        expires 30d;
        add_header Cache-Control "public, max-age=2592000";
        access_log off;
        try_files $uri =404;
    }

    # ----------------------------------------------------
    # ۲. سرو مستقیم فایل‌های آپلود شده (Media) توسط Nginx
    # ----------------------------------------------------
    location /media/ {
        alias /usr/share/nginx/media/;
        expires 30d;
        add_header Cache-Control "public, max-age=2592000";
        add_header X-Content-Type-Options "nosniff" always;
        access_log off;
        try_files $uri =404;
    }

    # ----------------------------------------------------
    # ۳. صفحات فرانت‌اند و مدیریت بات‌های سئو
    # ----------------------------------------------------
    location = / {
        add_header Vary User-Agent always;
        add_header Cache-Control "no-cache, no-store, must-revalidate";
        error_page 418 = @seo_preview;
        if ($seo_preview_bot) { return 418; }
        try_files /index.html =404;
    }

    location / {
        try_files $uri $uri/ @frontend_page;
    }

    location @frontend_page {
        add_header Vary User-Agent always;
        add_header Cache-Control "no-cache, no-store, must-revalidate";
        error_page 418 = @seo_preview;
        if ($seo_preview_bot) { return 418; }
        try_files /index.html =404;
    }

    location @seo_preview {
        add_header Vary User-Agent always;
        rewrite ^ /api/seo/bot-preview/? break;
        proxy_pass http://backend_cluster;
        proxy_http_version 1.1;
        proxy_set_header Connection "";
        proxy_set_header X-SEO-Path $request_uri;
        proxy_set_header Host $http_host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # ----------------------------------------------------
    # ۴. مسیرهای ویژه SEO و نقشه سایت
    # ----------------------------------------------------
    location = /sitemap.xml {
        proxy_pass http://backend_cluster;
        proxy_http_version 1.1;
        proxy_set_header Connection "";
        proxy_set_header Host $http_host;
    }

    location = /robots.txt {
        proxy_pass http://backend_cluster;
        proxy_http_version 1.1;
        proxy_set_header Connection "";
        proxy_set_header Host $http_host;
    }

    # ----------------------------------------------------
    # ۵. مسیرهای API بک‌اند به همراه Rate Limiting و بافرینگ بهینه
    # ----------------------------------------------------
    # اندپوینت‌های حساس احراز هویت و ارسال پیامک
    location ~ ^/api/(users/request-otp|users/verify-otp)/ {
        limit_req zone=api_sensitive burst=5 nodelay;
        proxy_pass http://backend_cluster;
        proxy_http_version 1.1;
        proxy_set_header Connection "";
        proxy_set_header Host $http_host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_read_timeout 30s;
    }

    # سایر اندپوینت‌های عمومی API
    location /api/ {
        limit_req zone=api_general burst=30 nodelay;
        proxy_pass http://backend_cluster;
        proxy_http_version 1.1;
        proxy_set_header Connection "";
        proxy_set_header Host $http_host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;

        # تنظیم تایم‌اوت ۳۵ ثانیه‌ای متناسب با تایم‌اوت سرویس AI
        proxy_connect_timeout 5s;
        proxy_send_timeout 35s;
        proxy_read_timeout 35s;

        # بافرهای پروکسی برای جلوگیری از اشغال رم و ذخیره در دیسک
        proxy_buffering on;
        proxy_buffer_size 8k;
        proxy_buffers 8 16k;
        proxy_busy_buffers_size 32k;
    }
}
```

---

## ۴. بخش دوم: بهینه‌سازی و تیونینگ سرویس بک‌اند (Django & Gunicorn)

### ۴.۱. تغییر دستور اجرای گانیکورن (`backend_core/Dockerfile`)
دستور فعلی در خط ۲۹ فایل داکرفایل:
```dockerfile
# دستور فعلی (اشکال: ۳ ورکر همگام و فاقد بازیافت حافظه)
CMD ["gunicorn", "config.wsgi:application", "--bind", "0.0.0.0:8000", "--workers", "3", "--access-logfile", "-"]
```

**دستور بهینه‌سازی شده پیشنهادی:**
```dockerfile
CMD ["gunicorn", "config.wsgi:application", \
     "--bind", "0.0.0.0:8000", \
     "--worker-class", "gthread", \
     "--workers", "2", \
     "--threads", "4", \
     "--preload", \
     "--max-requests", "1000", \
     "--max-requests-jitter", "100", \
     "--keep-alive", "5", \
     "--timeout", "40", \
     "--access-logfile", "-"]
```

#### چرا این تغییر الزامی است؟
1. **مدل چندنخی `gthread`:**
   - به جای اینکه ۳ فرآیند سنگین پایتون اجرا شود (که هر کدام حدود ۱۰۰ مگابایت رم می‌گیرند)، ۲ فرآیند با ۴ نخ (Thread) اجرا می‌شوند.
   - ظرفیت هم‌زمانی از ۳ ریکوئست به `2 * 4 = 8` ریکوئست هم‌زمان افزایش می‌یابد.
   - زمانی که یک ریکوئست در حال انتظار برای پاسخ سرویس هوش مصنوعی یا پنل پیامک است، نخ‌های دیگر همان فرآیند به راحتی به درخواست‌های رزرو، لاگین یا مقالات پاسخ می‌دهند و کل سیستم مسدود نمی‌شود.
2. **پرچم `--preload`:**
   - کدهای جنگو یک بار در فرآیند Master لود شده و سپس فرآیندهای Worker فورک می‌شوند. با مکانیزم Copy-On-Write لینوکس، صفحات حافظه اشتراکی بین ورکرها به اشتراک گذاشته شده و مصرف رم حدود ۳۵ تا ۴۰ درصد کاهش می‌یابد.
3. **پارامترهای `--max-requests 1000` و `--max-requests-jitter 100`:**
   - پایتون و ماژول‌های C (مانند psycopg2 و Pillow) پس از پردازش هزاران تصویر و رکورد دیتابیس دچار قطعه‌قطعه شدن حافظه (Memory Fragmentation) می‌شوند.
   - گانیکورن پس از رسیدن به حدود ۱۰۰۰ ریکوئست، به آرامی ورکر را ری‌استارت کرده و حافظه اشغال شده را تماماً به سیستم‌عامل پس می‌دهد.

---

### ۴.۲. اصلاحات پیکربندی جنگو (`backend_core/config/settings.py`)

#### ۱. فعال‌سازی بازاستفاده از اتصالات دیتابیس (`CONN_MAX_AGE`)
در فایل `settings.py` بخش تنظیم دیتابیس، این پارامترها باید اضافه شوند:

```python
# ── Database (PostgreSQL) ──────────────────────────────
DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.postgresql',
        'NAME': config('DB_NAME'),
        'USER': config('DB_USER'),
        'PASSWORD': config('DB_PASSWORD'),
        'HOST': config('DB_HOST', default='localhost'),
        'PORT': config('DB_PORT', default='5432'),
        # نگهداری اتصال تا ۶۰ ثانیه برای هر ورکر/ترد
        'CONN_MAX_AGE': config('DB_CONN_MAX_AGE', default=60, cast=int),
        # بررسی زنده بودن سوکت پیش از استفاده مجدد (Django 4.1+)
        'CONN_HEALTH_CHECKS': True,
    }
}
```
> **تأثیر:** کاهش بیش از ۷۰٪ بار پردازنده دیتابیس و حذف تاخیر ساخت اتصال TCP در ریکوئست‌های متوالی.

#### ۲. لایه کش سبک درون‌حافظه‌ای (In-Memory Cache)
برای جلوگیری از اجرای مکرر کوئری‌های سنگین (مانند محاسبات داشبورد ادمین، تنظیمات تم، لیست ویدیوها و دسته‌بندی مقالات)، کش پیش‌فرض حافظه‌ای جنگو فعال شود:

```python
# ── Caches (In-Memory LocMem Cache for constrained servers) ───
CACHES = {
    'default': {
        'BACKEND': 'django.core.cache.backends.locmem.LocMemCache',
        'LOCATION': 'kamelion-cache',
        'TIMEOUT': 300, # ۵ دقیقه کش پیش‌فرض
        'OPTIONS': {
            'MAX_ENTRIES': 500, # محدود کردن تعداد کلیدها برای جلوگیری از رشد رم
            'CULL_FREQUENCY': 3,
        }
    }
}
```

---

## ۵. بخش سوم: بهینه‌سازی و تیونینگ پایگاه داده PostgreSQL 16

کانتینر فعلی از ایمیج `postgres:16-alpine` با تنظیمات پیش‌فرض استفاده می‌کند. تنظیمات پیش‌فرض پستگرس برای یک سرور غول‌پیکر یا استفاده عمومی تنظیم شده که در آن ۱۰۰ اتصال همزمان مجاز است. اگر ۱۰۰ اتصال هرکدام ۴ مگابایت رم کاری بخواهند، به راحتی رم سرور تخلیه می‌شود.

### ۵.۱. دستور تیونینگ دیتابیس در `docker-compose.yml`
به جای نیاز به فایل پیکربندی دستی، می‌توان پارامترها را مستقیماً از طریق آرگومان‌های `command` در داکر کامپوز به پستگرس تزریق کرد:

```yaml
  db:
    image: postgres:16-alpine
    container_name: kamelion-db
    restart: unless-stopped
    command: >
      postgres
      -c max_connections=25
      -c shared_buffers=128MB
      -c work_mem=4MB
      -c maintenance_work_mem=32MB
      -c effective_cache_size=384MB
      -c checkpoint_completion_target=0.9
      -c wal_buffers=4MB
      -c default_statistics_target=100
      -c random_page_cost=1.1
      -c effective_io_concurrency=200
      -c min_wal_size=80MB
      -c max_wal_size=1GB
    env_file:
      - .env
    environment:
      POSTGRES_DB: ${DB_NAME}
      POSTGRES_USER: ${DB_USER}
      POSTGRES_PASSWORD: ${DB_PASSWORD}
    volumes:
      - postgres_data:/var/lib/postgresql/data
    ports:
      - "5433:5432"
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U ${DB_USER} -d ${DB_NAME}"]
      interval: 5s
      timeout: 5s
      retries: 10
```

#### تحلیل ریاضی و فنی پارامترها:
- `max_connections = 25`: گانیکورن دارای ۲ ورکر و ۴ نخ است (حداکثر ۸ اتصال نیاز دارد). ۲۵ اتصال به معنای پوشش کامل گانیکورن + دستورات manage.py + اتصال ادمین با حفظ ایمنی کامل حافظه است.
- `shared_buffers = 128MB`: مقدار ایده‌آل برای سرورهای ۱ تا ۲ گیگابایتی.
- `work_mem = 4MB`: حافظه مورد استفاده برای مرتب‌سازی و جوین‌ها به ازای هر عملیات کوئری. جلوگیری از تخصیص رم‌های مگابایتی سنگین.
- `checkpoint_completion_target = 0.9`: پخش کردن نوشتن دیسک در طول بازه زمانی و جلوگیری از فریز شدن I/O دیسک سرور لینوکس.
- `random_page_cost = 1.1`: بهینه‌سازی شده برای دیسک‌های SSD و NVMe سرورهای ابری مدرن (مقدار پیش‌فرض ۴٫۰ برای دیسک‌های مکانیکی قدیمی بود).

---

## ۶. بخش چهارم: بهینه‌سازی خط بیلد و دارایی‌های فرانت‌اند (Vite & Frontend)

### ۶.۱. پیش‌فشرده‌سازی در زمان بیلد (Build-Time Precompression)
اگر Nginx بخواهد کدهای جاوااسکریپت ۴۰۰ کیلوبایتی را در زمان پرواز (On-the-fly) فشرده کند، پردازنده ضعیف سرور به شدت داغ شده و زمان پاسخ کند می‌شود. راهکار استاندارد صنعتی این است که فایل‌های `.gz` در مرحله بیلد تولید و در کنار دارایی‌ها قرار گیرند تا Nginx با `gzip_static on;` آن‌ها را با مصرف **صفر درصد CPU** ارسال کند.

پیکربندی پیشنهادی در `front-end/vite.config.js`:
```javascript
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import viteCompression from 'vite-plugin-compression'

export default defineConfig({
  plugins: [
    react(),
    // تولید فایل‌های .gz در زمان build
    viteCompression({
      algorithm: 'gzip',
      ext: '.gz',
      threshold: 1024, // فشرده‌سازی فایل‌های بزرگتر از ۱ کیلوبایت
      deleteOriginFile: false
    })
  ],
  build: {
    // تقسیم چانک‌های حجیم به چانک‌های تفکیک‌شده
    rollupOptions: {
      output: {
        manualChunks: {
          vendor_react: ['react', 'react-dom', 'react-router-dom'],
          vendor_ui: ['lucide-react', 'swiper'],
        }
      }
    },
    chunkSizeWarningLimit: 600,
  }
})
```

---

## ۷. بخش پنجم: تنظیمات سطح سیستم‌عامل لینوکس و کانتینرهای داکر (OS & Docker Host)

### ۷.۱. فایل اصلاح‌شده `docker-compose.yml` کامل
این فایل شامل اصلاح مانت حجم فایل‌های مدیا برای Nginx، محدودیت لاگ‌ها و سقف منابع رم برای جلوگیری از OOM است:

```yaml
services:
  db:
    image: postgres:16-alpine
    container_name: kamelion-db
    restart: unless-stopped
    command: >
      postgres
      -c max_connections=25
      -c shared_buffers=128MB
      -c work_mem=4MB
      -c maintenance_work_mem=32MB
      -c effective_cache_size=384MB
      -c checkpoint_completion_target=0.9
      -c wal_buffers=4MB
      -c random_page_cost=1.1
    env_file:
      - .env
    environment:
      POSTGRES_DB: ${DB_NAME}
      POSTGRES_USER: ${DB_USER}
      POSTGRES_PASSWORD: ${DB_PASSWORD}
    volumes:
      - postgres_data:/var/lib/postgresql/data
    ports:
      - "5433:5432"
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U ${DB_USER} -d ${DB_NAME}"]
      interval: 5s
      timeout: 5s
      retries: 10
    deploy:
      resources:
        limits:
          memory: 350M
        reservations:
          memory: 150M
    logging:
      driver: "json-file"
      options:
        max-size: "10m"
        max-file: "3"

  backend:
    build:
      context: ./backend_core
      dockerfile: Dockerfile
    container_name: kamelion-backend
    restart: unless-stopped
    env_file:
      - .env
    environment:
      DB_HOST: db
      DB_PORT: 5432
    depends_on:
      db:
        condition: service_healthy
    expose:
      - "8000"
    volumes:
      - media_data:/app/media
    deploy:
      resources:
        limits:
          memory: 450M
        reservations:
          memory: 200M
    logging:
      driver: "json-file"
      options:
        max-size: "10m"
        max-file: "3"

  frontend:
    build:
      context: ./front-end
      dockerfile: Dockerfile
    container_name: kamelion-frontend
    restart: unless-stopped
    ports:
      - "8080:80"
    volumes:
      # مانت ولوم مدیا به صورت فقط خواندنی (Read-Only) در Nginx جهت سرو مستقیم
      - media_data:/usr/share/nginx/media:ro
    depends_on:
      - backend
    deploy:
      resources:
        limits:
          memory: 120M
        reservations:
          memory: 50M
    logging:
      driver: "json-file"
      options:
        max-size: "10m"
        max-file: "3"

volumes:
  postgres_data:
  media_data:
```

### ۷.۲. تنظیمات پارامترهای کرنل لینوکس (Kernel Sysctl) روی سرور
برای جلوگیری از رفتن بی‌دلیل رم فیزیکی به Swap و بهبود هندلینگ سوکت‌ها در سیستم‌عامل لینوکس، فایل `/etc/sysctl.conf` سرور باید دارای مقادیر زیر باشد:

```bash
# جلوگیری از سوآپ زودهنگام در سرورهای با رم پایین (مقدار پیش‌فرض ۶۰ است)
vm.swappiness = 10

# جلوگیری از خطاهای OOM و اجازه تخصیص منعطف رم برای سرویس‌های پایتون و ردیس/دیتابیس
vm.overcommit_memory = 1

# افزایش سقف صف سوکت‌های در انتظار لینوکس (پیش‌فرض ۱۲۸ بسیار کم است)
net.core.somaxconn = 1024
net.ipv4.tcp_max_syn_backlog = 2048

# استفاده مجدد از سوکت‌های TIME_WAIT برای ارتباطات داخلی
net.ipv4.tcp_tw_reuse = 1
```
اعمال فوری بدون ریبوت سرور:
```bash
sudo sysctl -p
```

### ۷.۳. ایجاد حافظه کمکی اضطراری (۲ گیگابایت Swap File)
در سرورهای ۱ یا ۲ گیگابایتی، داشتن ۲ گیگابایت حافظه Swap به عنوان سپر دفاعی مانع از کرش کردن سیستم در زمان بیلد داکر یا ترافیک ناگهانی می‌شود:
```bash
# ایجاد فایل سوآپ ۲ گیگابایتی در لینوکس در صورت عدم وجود
sudo fallocate -l 2G /swapfile
sudo chmod 600 /swapfile
sudo mkswap /swapfile
sudo swapon /swapfile
echo '/swapfile none swap sw 0 0' | sudo tee -a /etc/fstab
```

---

## ۸. پروفایل‌های تفکیکی بر اساس منابع سخت‌افزاری سرور

جدول زیر تخصیص دقیق حافظه رم را بر اساس پلن سخت‌افزاری VPS لینوکس شما شفاف‌سازی می‌کند:

| بخش مصرف‌کننده | پروفایل A: سرور ۱ گیگابایت RAM | پروفایل B: سرور ۲ گیگابایت RAM (پیشنهادی نرمال) | پروفایل C: سرور ۴ گیگابایت RAM (بهترین حالت) |
|---|---|---|---|
| **سیستم‌عامل و سرویس‌های لینوکس (SSH/Systemd)** | ~۱۵۰ MB | ~۲۰۰ MB | ~۳۰۰ MB |
| **دیتابیس PostgreSQL (سقف داکر)** | ۲۵۰ MB (shared_buffers=64MB) | ۳۵۰ MB (shared_buffers=128MB) | ۸۰۰ MB (shared_buffers=512MB) |
| **بک‌اند جنگو + گانیکورن (سقف داکر)** | ۳۸۰ MB (2 ورکر / 3 نخ) | ۴۵۰ MB (2 ورکر / 4 نخ) | ۹۰۰ MB (3 ورکر / 4 نخ) |
| **فرانت‌اند Nginx (سقف داکر)** | ۸۰ MB | ۱۲۰ MB | ۲۰۰ MB |
| **بافر ذخیره آزاد (Buffer / Page Cache)** | ~۱۴۰ MB + 2GB Swap | ~۸۸۰ MB + 2GB Swap | ~۱۸۰۰ MB + 2GB Swap |
| **حداکثر کاربران همزمان پشتیبانی‌شده** | ۲۰ تا ۳۰ کاربر همزمان | ۵۰ تا ۱۰۰ کاربر همزمان | ۲۰۰+ کاربر همزمان |

---

## ۹. چک‌لیست گام‌به‌گام اجرایی و دستورالعمل هماهنگی با تیم

این سند صرفاً جهت بررسی و هماهنگی فنی تدوین شده است. در صورت تایید تیم فنی و دواپس، مراحل زیر باید به ترتیب اجرا شوند:

```text
[ ] ۱. جلسه بررسی و هماهنگی با تیم (بررسی پارامترهای gunicorn و postgres)
[ ] ۲. بررسی فضای دیسک و ایجاد فایل ۲ گیگابایتی Swap روی سرور لینوکس میزبان
[ ] ۳. اعمال پارامترهای sysctl روی سرور لینوکس (swappiness=10, somaxconn=1024)
[ ] ۴. نصب پکیج vite-plugin-compression در فرانت‌اند و تست بیلد لوکال
[ ] ۵. به‌روزرسانی front-end/nginx.conf با تنظیمات gzip_static و سرو مستقیم /media/
[ ] ۶. اصلاح Dockerfile بک‌اند با دستور ورکر چندنخی gthread و بازیافت دوره‌ای
[ ] ۷. افزودن CONN_MAX_AGE = 60 و CONN_HEALTH_CHECKS = True در backend_core/config/settings.py
[ ] ۸. اصلاح docker-compose.yml جهت افزودن مانت media_data به Nginx، دستور postgres و لیمیت‌های رم و لاگ
[ ] ۹. اجرای بیلد و استقرار آزمایشی در محیط تست / دمو
[ ] ۱۰. سنجش سلامت و بنچمارک با ابزار لاگ و docker stats
```

---

## ۱۰. دستورالعمل پایش، بنچمارک و سناریوی بازگشت

### ۱۰.۱. نحوه پایش مصرف منابع روی سرور لینوکس
پس از اعمال تنظیمات، با این دستورات می‌توانید سلامت سرور را به صورت زنده ارزیابی کنید:

```bash
# پایش زنده مصرف CPU و RAM تمام کانتینرها
docker stats --no-stream

# بررسی عدم بروز خطای کمبود حافظه در کرنل لینوکس
dmesg -T | grep -i -E "oom|killed process"

# بررسی تعداد اتصالات فعال در دیتابیس پستگرس
docker exec -it kamelion-db psql -U postgres -d kamelion -c "SELECT count(*), state FROM pg_stat_activity GROUP BY state;"

# بررسی حجم فایل‌های لاگ داکر روی سرور
docker ps -q | xargs -I {} docker inspect --format='{{.LogPath}}' {} | xargs ls -lh
```

### ۱۰.۲. سناریوی بازگشت اضطراری (Rollback Plan)
در صورتی که هرگونه ناسازگاری در محیط سرور لینوکس مشاهده شود:
1. برگرداندن فایل‌های `docker-compose.yml` و `Dockerfile` با دستور `git checkout`
2. اجرای فوری `docker compose up -d --build` جهت برگرداندن کانتینرها به حالت پایدار اولیه کمتر از ۱ دقیقه.
