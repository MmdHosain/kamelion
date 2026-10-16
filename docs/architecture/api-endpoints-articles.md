# مستند قراردادهای اندپوینت‌های ماژول مقالات و آموزش پزشکی
## API Endpoints Specification: Medical Articles Module (`apps.articles`)

> **وضعیت:** سند قرارداد طراحی‌شده (Proposed / Ready for Implementation)  
> **دامنه:** این سند کلیه اندپوینت‌های برنامه‌ریزی‌شده برای ماژول مقالات کلینیک کملین را با جزئیات کامل ورودی، خروجی و دسترسی‌ها تشریح می‌کند تا از مستند اندپوینت‌های فعلی پروژه (`api-endpoints.md`) تفکیک شده باشد.

---

## ۱. اندپوینت‌های عمومی پرتال کاربران (Public Endpoints)

این اندپوینت‌ها برای عموم کاربران و بیماران به صورت فقط خواندنی (Read-Only) در دسترس هستند و نیازی به توکن احراز هویت ندارند. تمام نتایج منحصراً مقالات دارای وضعیت `published` را بازمی‌گردانند.

### ۱.۱. دریافت لیست مقالات منتشرشده (List Articles)
* **آدرس:** `GET /api/articles/`
* **دسترسی (Auth):** عمومی (`AllowAny`)
* **پارامترهای جستجو و فیلتر (Query Parameters):**
  * `page` (عدد صحیح، پیش‌فرض: `1`): شماره صفحه.
  * `page_size` (عدد صحیح، پیش‌فرض: `10`، حداکثر: `50`): تعداد آیتم در هر صفحه.
  * `category` (رشته / Slug): فیلتر بر اساس نامک دسته‌بندی موضوعی (مانند `screening`).
  * `search` (رشته): جستجوی کلمات کلیدی در عنوان و خلاصه مقاله.
* **کد وضعیت موفق:** `200 OK`
* **ساختار خروجی JSON:**
```json
{
  "count": 24,
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
      "views_count": 340,
      "created_at": "2026-05-10T12:00:00Z"
    }
  ]
}
```

---

### ۱.۲. دریافت جزییات کامل یک مقاله (Retrieve Article Detail)
* **آدرس:** `GET /api/articles/<slug>/`
* **دسترسی (Auth):** عمومی (`AllowAny`)
* **توضیحات عملکرد:** بازیابی اطلاعات کامل مقاله با اسلاگ داده شده؛ در هر بار فراخوانی موفق، فیلد `views_count` به صورت بهینه یک واحد افزایش می‌یابد.
* **کدهای وضعیت:**
  * `200 OK`: موفق.
  * `404 Not Found`: مقاله وجود ندارد یا در وضعیت `draft` قرار دارد.
* **ساختار خروجی JSON:**
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
  "views_count": 341,
  "created_at": "2026-05-10T12:00:00Z",
  "updated_at": "2026-05-12T09:30:00Z"
}
```

---

### ۱.۳. دریافت لیست دسته‌بندی‌های فعال (List Categories)
* **آدرس:** `GET /api/articles/categories/`
* **دسترسی (Auth):** عمومی (`AllowAny`)
* **کد وضعیت:** `200 OK`
* **ساختار خروجی JSON:**
```json
[
  {
    "id": 1,
    "name": "پیشگیری و غربالگری",
    "slug": "screening",
    "description": "مقالات مرتبط با تست‌های دوره‌ای و سونوگرافی",
    "articles_count": 8
  },
  {
    "id": 2,
    "name": "جراحی‌های زیبایی و ترمیمی",
    "slug": "cosmetic-reconstructive",
    "description": "ماموپلاستی، پروتز و بازسازی",
    "articles_count": 6
  }
]
```

---

## ۲. اندپوینت‌های مدیریت و نویسندگی پنل ادمین (Admin Endpoints)

تمامی این مسیرها مستلزم ارسال هدر `Authorization: Bearer <token>` مربوط به کاربری با نقش ادمین/استاف (`is_staff=True`) می‌باشند (`IsAdminUser`).

### ۲.۱. لیست جامع مقالات ادمین (Admin Articles List)
* **آدرس:** `GET /api/admin/articles/`
* **پارامترهای جستجو و فیلتر:**
  * `status`: فیلتر بر اساس `draft` یا `published` (پیش‌فرض: نمایش همه).
  * `category`: فیلتر شناسه دسته‌بندی.
  * `search`: جستجو در عنوان مقالات.
  * `page`, `page_size`: صفحه‌بندی استاندارد.
* **کد وضعیت:** `200 OK`
* **ساختار خروجی:** مشابه خروجی عمومی، به علاوه فیلد `status` و اطلاعات تکمیلی.

---

### ۲.۲. ثبت مقاله جدید (Create Article)
* **آدرس:** `POST /api/admin/articles/`
* **بدنه درخواست (Request Body - JSON یا Multipart):**
```json
{
  "title": "مراقبت‌های لازم بعد از جراحی بازسازی پستان",
  "slug": "post-op-breast-reconstruction-care",
  "excerpt": "نکات حیاتی پیرامون تعویض پانسمان و استراحت پس از جراحی...",
  "content": "<h2>مراقبت از درن‌ها</h2><p>تخلیه منظم مایع ترشح شده بسیار حائز اهمیت است...</p>",
  "category": 2,
  "status": "published",
  "video_embed_url": "https://www.aparat.com/video/video/embed/videohash/xyz987/vt/frame",
  "reading_time_minutes": 6
}
```
* **توضیحات عملکرد:**
  * نویسنده (`author`) به صورت خودکار کاربر جاری احراز هویت شده (`request.user`) تنظیم می‌شود.
  * فیلد `content` قبل از ذخیره توسط `bleach` از هرگونه تگ اسکریپت یا اتریبیوت‌های مخرب پاکسازی می‌شود.
* **کدهای وضعیت:**
  * `201 Created`: مقاله با موفقیت ثبت شد.
  * `400 Bad Request`: خطای اعتبارسنجی فیلدها یا تکراری بودن `slug`.

---

### ۲.۳. دریافت جزییات مقاله جهت ویرایش (Retrieve Admin Article)
* **آدرس:** `GET /api/admin/articles/<id>/`
* **کدهای وضعیت:**
  * `200 OK`: بازگشت مشخصات مقاله جهت لود در فرم ویرایشگر.
  * `404 Not Found`: شناسه نامعتبر.

---

### ۲.۴. به‌روزرسانی مقاله (Update Article)
* **آدرس:** `PUT /api/admin/articles/<id>/` یا `PATCH /api/admin/articles/<id>/`
* **بدنه درخواست:** فیلدهایی که نیاز به به‌روزرسانی دارند.
* **کد وضعیت:** `200 OK`

---

### ۲.۵. تغییر سریع وضعیت انتشار (Toggle Publish Status)
* **آدرس:** `PATCH /api/admin/articles/<id>/toggle-status/`
* **توضیحات عملکرد:** یک میان‌بر سریع برای سوییچ آنی وضعیت بین `draft` و `published` بدون نیاز به ارسال تمام داده‌های فرم.
* **کد وضعیت:** `200 OK`
* **خروجی:**
```json
{
  "id": 1,
  "status": "published",
  "message": "وضعیت مقاله به منتشرشده تغییر یافت."
}
```

---

### ۲.۶. حذف مقاله (Delete Article)
* **آدرس:** `DELETE /api/admin/articles/<id>/`
* **کد وضعیت:** `204 No Content`

---

### ۲.۷. آپلود تصویر درون‌متنی یا کاور (Upload Image)
* **آدرس:** `POST /api/admin/articles/upload-image/`
* **نوع بدنه:** `multipart/form-data`
* **فیلد ورودی:** `image` (فایل تصویر حداکثر ۵ مگابایت، مجاز: `.jpg`, `.png`, `.webp`)
* **توضیحات عملکرد:** فایل اعتبارسنجی شده، با کتابخانه `Pillow` نام آن تصادفی (`UUID`) شده و به فرمت کم‌حجم `WebP` تبدیل می‌گردد.
* **کد وضعیت:** `201 Created`
* **پاسخ خروجی:**
```json
{
  "url": "http://api.kamelion.local/media/articles/inline/8d3a1f4b2c.webp",
  "message": "تصویر با موفقیت بارگذاری و بهینه‌سازی شد."
}
```

---

### ۲.۸. مدیریت دسته‌بندی‌ها در ادمین (Category Management)
* `GET /api/admin/articles/categories/`: لیست تمام دسته‌بندی‌ها.
* `POST /api/admin/articles/categories/`: ایجاد دسته‌بندی جدید (`{"name": "...", "slug": "..."}`).
* `DELETE /api/admin/articles/categories/<id>/`: حذف دسته‌بندی (مقالات متصل `SET_NULL` می‌شوند و حذف نخواهند شد).
