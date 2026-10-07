# راهنمای جامع معماری و پیاده‌سازی بک‌اند — ماژول مقالات و آموزش پزشکی
## Backend Architecture & Implementation Guide: Medical Articles Module (`apps.articles`)

> **مخاطب:** تیم توسعه بک‌اند پلتفرم کملین (`backend_core`)  
> **هدف:** ارائه نقشه راه دقیق، استاندارد و در عین حال چابک (Lean & Pragmatic) برای پیاده‌سازی سریع فیچر مقالات با رعایت اصول امنیتی، پرفورمنس، بدون بار اضافه و قابل توسعه در آینده.

---

## ۱. ساختار ماژولار اپلیکیشن در جنگو (App Layout)

ماژول مقالات باید به عنوان یک اپلیکیشن مستقل تحت عنوان `articles` در دایرکتوری `backend_core/apps/` ایجاد شود و پیرو همان ساختار لایه‌بندی اثبات‌شده در اپلیکیشن `appointments` پیاده‌سازی گردد:

```text
backend_core/apps/articles/
├── __init__.py
├── models.py              # مدل‌های دیتابیس (Article, Category)
├── serializers.py         # سریالایزرها و اعتبارسنجی/تصفیه امنیتی محتوا (Sanitization)
├── services.py            # توابع بیزینس لاجیک (محاسبه زمان مطالعه، بهینه‌سازی عکس، افزایش بازدید)
├── views.py               # اندپوینت‌های عمومی پرتال کاربران (List, Detail, Categories)
├── views_admin.py         # اندپوینت‌های مدیریت و نویسندگی ادمین/پزشک (CRUD, Upload)
├── urls.py                # مسیرهای عمومی (/api/articles/...)
├── admin_urls.py          # مسیرهای پنل ادمین (/api/admin/articles/...)
├── admin.py               # رجیستر در پنل ادمین نیتیو جنگو
└── migrations/            # مایگریشن‌های دیتابیس
```

### فعال‌سازی در تنظیمات پروژه:
در فایل `backend_core/config/settings.py` عبارت `'apps.articles'` به لیست `LOCAL_APPS` اضافه می‌شود و فایل‌های روت در `config/urls.py` متصل می‌گردند:
```python
# config/urls.py
path('api/articles/', include('apps.articles.urls')),
path('api/admin/articles/', include('apps.articles.admin_urls')),
```

---

## ۲. مدل‌های پایگاه داده (Data Models & Schema)

### ۲.۱. مدل دسته‌بندی موضوعی (`Category`)
```python
# apps/articles/models.py
from django.db import models

class Category(models.Model):
    name = models.CharField(max_length=100, unique=True, verbose_name="نام دسته‌بندی")
    slug = models.SlugField(max_length=120, unique=True, allow_unicode=True)
    description = models.TextField(blank=True, default="", verbose_name="توضیحات کوتاه")
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        verbose_name = "دسته‌بندی مقاله"
        verbose_name_plural = "دسته‌بندی‌های مقالات"
        ordering = ['name']

    def __str__(self):
        return self.name
```

### ۲.۲. مدل اصلی مقاله (`Article`)
```python
# apps/articles/models.py
from django.db import models
from django.conf import settings

class Article(models.Model):
    DRAFT = 'draft'
    PUBLISHED = 'published'

    STATUS_CHOICES = [
        (DRAFT, 'پیش‌نویس'),
        (PUBLISHED, 'منتشرشده'),
    ]

    title = models.CharField(max_length=255, verbose_name="عنوان مقاله")
    slug = models.SlugField(max_length=280, unique=True, allow_unicode=True, verbose_name="نامک یکتا (Slug)")
    excerpt = models.TextField(max_length=600, blank=True, default="", verbose_name="خلاصه / چکیده")
    
    # محتوای غنی متنی که به صورت HTML تمیز و ضدعفونی‌شده ذخیره می‌شود
    content = models.TextField(verbose_name="متن کامل مقاله")
    
    # تصویر شاخص
    cover_image = models.ImageField(upload_to="articles/covers/%Y/%m/", null=True, blank=True, verbose_name="تصویر شاخص")
    
    # فیلد ساده جهت درج ویدیوهای امبد آپارات یا یوتیوب
    video_embed_url = models.CharField(max_length=500, blank=True, default="", verbose_name="لینک یا کد امبد ویدیو")

    category = models.ForeignKey(
        Category,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="articles",
        verbose_name="دسته‌بندی"
    )
    author = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="articles",
        verbose_name="نویسنده / پزشک"
    )
    
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default=DRAFT, verbose_name="وضعیت انتشار")
    reading_time_minutes = models.PositiveSmallIntegerField(default=5, verbose_name="زمان مطالعه تقریبی (دقیقه)")
    views_count = models.PositiveIntegerField(default=0, verbose_name="تعداد بازدید")

    created_at = models.DateTimeField(auto_now_add=True, verbose_name="تاریخ نگارش")
    updated_at = models.DateTimeField(auto_now=True, verbose_name="تاریخ آخرین ویرایش")

    class Meta:
        verbose_name = "مقاله پزشکی"
        verbose_name_plural = "مقالات پزشکی"
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['status', '-created_at']),
            models.Index(fields=['slug']),
        ]

    def __str__(self):
        return f"{self.title} ({self.get_status_display()})"
```

---

## ۳. فرمت محتوا و امنیت پیشرفته در برابر حملات XSS (Stored XSS Prevention)

برای اجتناب از پیچیدگی‌های نگهداری ASTهای کاستوم و در عین حال حفظ امنیت صددرصدی:
1. محتوا به صورت رشته HTML استاندارد ارسال و ذخیره می‌شود.
2. **لایه ضدعفونی اجباری در بک‌اند (Backend Sanitizer):** در متد `validate_content` سریالایزر، ورودی از طریق کتابخانه استاندارد `bleach` یا `nh3` فیلتر می‌شود تا تمامی اسکریپت‌ها، رویدادهای خطرناک (`onload`, `onerror`)، و تگ‌های مخرب حذف گردند:

```python
# apps/articles/serializers.py
import bleach
from rest_framework import serializers

ALLOWED_TAGS = [
    'p', 'h2', 'h3', 'h4', 'strong', 'em', 'u', 's', 'ul', 'ol', 'li',
    'blockquote', 'a', 'img', 'table', 'thead', 'tbody', 'tr', 'th', 'td',
    'br', 'hr', 'iframe'
]

ALLOWED_ATTRIBUTES = {
    'a': ['href', 'title', 'target', 'rel'],
    'img': ['src', 'alt', 'title', 'width', 'height', 'loading'],
    'iframe': ['src', 'width', 'height', 'allowfullscreen', 'frameborder'],
    '*': ['class']
}

class ArticleAdminWriteSerializer(serializers.ModelSerializer):
    class Meta:
        model = Article
        fields = [
            'id', 'title', 'slug', 'excerpt', 'content', 'cover_image',
            'video_embed_url', 'category', 'status', 'reading_time_minutes'
        ]

    def validate_content(self, value):
        # پاکسازی خودکار کلیه کدهای مخرب بدون شکستن ساختار متن
        cleaned_html = bleach.clean(
            value,
            tags=ALLOWED_TAGS,
            attributes=ALLOWED_ATTRIBUTES,
            strip=True
        )
        return cleaned_html
```

---

## ۴. مدیریت آپلود تصاویر و رسانه‌ها (Media Upload Handling)

برای اینکه پزشک بتواند تصاویر درون‌متنی یا کاور را با سرعت و امنیت آپلود کند:

### ۴.۱. اندپوینت اختصاصی آپلود فایل
* **مسیر:** `POST /api/admin/articles/upload-image/`
* **مجوز:** فقط کاربران با دسترسی ادمین/استاف (`IsAdminUser`).
* **منطق امنیتی و بهینه‌سازی در `services.py`:**
  1. بررسی پسوندهای مجاز (`.jpg`, `.jpeg`, `.png`, `.webp`).
  2. بررسی حجم فایل (حداکثر ۵ مگابایت).
  3. استفاده از کتابخانه `Pillow` برای تغییر نام به یک هش `UUID` تصادفی (جلوگیری از حملات دستکاری نام و مسیر فایل).
  4. فشرده‌سازی و تبدیل خودکار به فرمت کم‌حجم **WebP** جهت افزایش چشمگیر سرعت لود سایت.

```python
# apps/articles/services.py
import uuid
import os
from PIL import Image
from django.core.files.storage import default_storage

def save_and_optimize_image(uploaded_file, folder="articles/inline"):
    ext = os.path.splitext(uploaded_file.name)[1].lower()
    if ext not in ['.jpg', '.jpeg', '.png', '.webp']:
        raise ValueError("فرمت فایل نامعتبر است. فقط JPG, PNG و WebP مجاز هستند.")

    image = Image.open(uploaded_file)
    if image.mode in ('RGBA', 'P'):
        image = image.convert('RGB')

    # تغییر اندازه در صورتی که عکس بسیار بزرگ باشد (مثلاً عرض بیش از 1600px)
    max_width = 1600
    if image.width > max_width:
        ratio = max_width / float(image.width)
        height = int((float(image.height) * float(ratio)))
        image = image.resize((max_width, height), Image.Resampling.LANCZOS)

    filename = f"{uuid.uuid4().hex}.webp"
    relative_path = os.path.join(folder, filename)

    # ذخیره نسخه فشرده
    temp_path = default_storage.path(relative_path)
    os.makedirs(os.path.dirname(temp_path), exist_ok=True)
    image.save(temp_path, format="WEBP", quality=82, optimize=True)

    return default_storage.url(relative_path)
```

---

## ۵. ماتریس کامل اندپوینت‌های API و ساختار داده‌ها (API Contracts)

### ۵.۱. اندپوینت‌های عمومی بیماران (Public APIs)

| متد | آدرس اندپوینت | دسترسی | توضیحات |
|---|---|:---:|---|
| `GET` | `/api/articles/` | عمومی (آزاد) | دریافت لیست مقالات منتشرشده با فیلتر و صفحه‌بندی |
| `GET` | `/api/articles/<slug>/` | عمومی (آزاد) | دریافت جزییات کامل یک مقاله منتشرشده و افزایش بازدید |
| `GET` | `/api/articles/categories/` | عمومی (آزاد) | دریافت لیست دسته‌بندی‌های مقالات |

#### نمونه خروجی لیست مقالات (`GET /api/articles/`):
```json
{
  "count": 14,
  "next": "http://api.kamelion.local/api/articles/?page=2",
  "previous": null,
  "results": [
    {
      "id": 1,
      "title": "راهنمای جامع خودآزمایی ماهانه پستان در منزل",
      "slug": "monthly-breast-self-exam-guide",
      "excerpt": "چگونگی لمس صحیح، زمان مناسب خودآزمایی در سیکل ماهانه و نشانه‌هایی که باید به آنها توجه کنید.",
      "cover_image": "http://api.kamelion.local/media/articles/covers/2026/05/exam.webp",
      "category": {
        "id": 2,
        "name": "پیشگیری و غربالگری",
        "slug": "screening"
      },
      "author_name": "دکتر نگار معشوری",
      "reading_time_minutes": 5,
      "created_at": "2026-05-10T12:00:00Z"
    }
  ]
}
```

#### نمونه خروجی جزییات تکی مقاله (`GET /api/articles/<slug>/`):
```json
{
  "id": 1,
  "title": "راهنمای جامع خودآزمایی ماهانه پستان در منزل",
  "slug": "monthly-breast-self-exam-guide",
  "excerpt": "چگونگی لمس صحیح، زمان مناسب...",
  "content": "<h2>مراحل گام به گام معاینه</h2><p>بهترین زمان برای انجام خودآزمایی...</p>",
  "cover_image": "http://api.kamelion.local/media/articles/covers/2026/05/exam.webp",
  "video_embed_url": "https://www.aparat.com/video/video/embed/videohash/abc1234/vt/frame",
  "category": {
    "id": 2,
    "name": "پیشگیری و غربالگری",
    "slug": "screening"
  },
  "author": {
    "id": 5,
    "full_name": "دکتر نگار معشوری",
    "medical_degree": "جراح متخصص پستان و انکوپلاستی"
  },
  "reading_time_minutes": 5,
  "views_count": 148,
  "created_at": "2026-05-10T12:00:00Z",
  "updated_at": "2026-05-12T09:30:00Z"
}
```

---

### ۵.۲. اندپوینت‌های پنل مدیریت و پزشک (Admin APIs)

همه این مسیرها نیازمند توکن JWT با دسترسی ادمین (`permission_classes = [IsAdminUser]`) هستند:

| متد | آدرس اندپوینت | توضیحات |
|---|---|---|
| `GET` | `/api/admin/articles/` | لیست کل مقالات (شامل پیش‌نویس‌ها و منتشرشده‌ها) با فیلتر وضعیت |
| `POST` | `/api/admin/articles/` | ثبت مقاله جدید (نویسنده خودکار کاربر جاری تنظیم می‌شود) |
| `GET` | `/api/admin/articles/<id>/` | دریافت اطلاعات خام مقاله جهت لود در فرم ویرایشگر ادمین |
| `PUT / PATCH` | `/api/admin/articles/<id>/` | به‌روزرسانی محتوا، عنوان، عکس یا دسته‌بندی مقاله |
| `DELETE` | `/api/admin/articles/<id>/` | حذف مقاله |
| `POST` | `/api/admin/articles/upload-image/` | آپلود و بهینه‌سازی فایل تصویر (بازگشت آدرس URL تصویر) |
| `PATCH` | `/api/admin/articles/<id>/toggle-status/` | تغییر وضعیت سریع بین `draft` و `published` |
| `GET, POST, DELETE` | `/api/admin/articles/categories/` | مدیریت دسته‌بندی‌ها (افزودن و حذف) |

#### نمونه ورودی ایجاد/ویرایش مقاله (`POST /api/admin/articles/`):
```json
{
  "title": "مراقبت‌های لازم بعد از جراحی بازسازی پستان",
  "slug": "post-op-breast-reconstruction-care",
  "excerpt": "نکات حیاتی پیرامون تعویض پانسمان و استراحت پس از جراحی...",
  "content": "<h2>مراقبت از درن‌ها</h2><p>تخلیه منظم مایع ترشح شده بسیار حائز اهمیت است...</p>",
  "category": 3,
  "status": "published",
  "video_embed_url": "https://www.aparat.com/video/video/embed/videohash/xyz987/vt/frame",
  "reading_time_minutes": 6
}
```

#### نمونه پاسخ آپلود عکس (`POST /api/admin/articles/upload-image/`):
```json
{
  "url": "http://api.kamelion.local/media/articles/inline/7a9b8c2d1e.webp",
  "message": "تصویر با موفقیت آپلود و بهینه‌سازی شد."
}
```

---

## ۶. عملکرد و کارایی دیتابیس (Performance Optimization)

1. **پیشگیری از سربار N+1 Query:**
   در تمام کوئری‌های لیست و جزییات مقالات حتماً از متدهای پیش‌بارگذاری استفاده شود:
   ```python
   # apps/articles/views.py
   def get_queryset(self):
       return Article.objects.filter(status=Article.PUBLISHED)\
                             .select_related('author', 'category')
   ```
2. **افزایش بهینه شمارنده بازدید (`views_count`):**
   برای جلوگیری از قفل شدن ردیف دیتابیس یا Race Condition، افزایش بازدید در متد `retrieve` به این صورت انجام شود:
   ```python
   from django.db.models import F

   Article.objects.filter(pk=instance.pk).update(views_count=F('views_count') + 1)
   ```
3. **کشینگ سریع (Response Caching):**
   با توجه به اینکه محتوای مقالات مکرراً تغییر نمی‌کند، لیست مقالات و جزییات می‌توانند با کش کوتاه (مثلاً ۵ تا ۱۰ دقیقه) در Redis یا مموری کش سرو شوند و هنگام ذخیره یا ویرایش در `Article.save()` یا `post_save` سیگنال، کش پاک‌سازی (Invalidate) شود.

---

## ۷. سازگاری به عقب و امنیت سیستم (Regression & Security Guard)
- این اپلیکیشن کاملاً مجزا بوده و هیچ وابستگی شکننده‌ای به ماژول‌های نوبت‌دهی (`appointments`) یا احراز هویت پیامکی ندارد.
- تنها نقطه اتصال به مدل کاربر، فیلد `author` به `settings.AUTH_USER_MODEL` است.
- فایل‌های آپلود شده در دایرکتوری `media/` خارج از روت‌های اجرایی سرور ذخیره می‌شوند تا امکان اجرای اسکریپت سمت سرور به هیچ وجه وجود نداشته باشد.
