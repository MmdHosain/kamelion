# سند طراحی محصول (PRD) — مدیریت تعطیلات و استثنائات تقویم کلینیک
## Product Requirement Document: Admin Clinic Closures & Date Exceptions

---

### ۱. مشخصات سند (Document Metadata)
- **شناسه سند:** `PRD-FE-014`
- **ماژول:** مدیریت تعطیلات و کنسلی‌های تقویم (Calendar Exceptions & Closures)
- **وضعیت پیاده‌سازی:** ✅ پیاده‌سازی کامل (Completed)
- **کامپوننت‌های فرانت‌اند:**
  - لیست استثنائات زمانی: [`src/components/admin/exceptions/ExceptionsList.jsx`](file:///e:/GitHub%20Repo/kamelion/front-end/src/components/admin/exceptions/ExceptionsList.jsx)
  - انتخابگر بازه تاریخ: [`src/components/admin/exceptions/CustomDateRangePicker.jsx`](file:///e:/GitHub%20Repo/kamelion/front-end/src/components/admin/exceptions/CustomDateRangePicker.jsx)
- **سرویس‌های وب:**
  - سرویس استثنائات ادمین: [`src/api/schedules.js`](file:///e:/GitHub%20Repo/kamelion/front-end/src/api/schedules.js)

---

### ۲. هدف و ارزش بیزینسی (Product Vision & Goals)
- **بیان مسئله:** در روزهای تعطیل رسمی، مسافرت‌ها، بازسازی مطب یا غیبت پیش‌بینی‌نشده پزشک، نباید هیچ نوبتی توسط بیماران رزرو شود.
- **ارزش بیزینسی:** قابلیت بستن تاریخ‌های مشخص یا بازه‌های چند روزه به همراه درج علت تعطیلی، از تداخل، کنسلی‌های ناخواسته و سردرگمی بیماران جلوگیری می‌کند.
- **اهداف کلیدی:**
  - ثبت بازه‌های تعطیلی تک‌روزه یا چندروزه با انتخابگر تقویم شمسی.
  - ثبت علت مرخصی یا تعطیلی مطب (مثلاً «تعطیلات نوروز»، «شرکت در کنگره جراحی»).
  - غیرفعال‌سازی آنی اسلات‌های روزهای تعطیل‌شده در تقویم مراجعین.

---

### ۳. الزامات عملکردی (Functional Requirements)
1. **ثبت بازه تعطیلی (Date Range):**
   - تعیین تاریخ شروع (`startDate`) و تاریخ پایان (`endDate`).
   - اعتبارسنجی خودکار مبنی بر این که تاریخ پایان نباید قبل از تاریخ شروع باشد.
2. **ثبت یادداشت و دلیل (`reason / note`):**
   - فیلد توضیحات متنی با محدودیت کاراکتر مناسب جهت اطلاع منشی و پزشک.
3. **ذخیره‌سازی دسته‌جمعی (Bulk Save):**
   - تفکیک رکوردهای دیتابیسی قدیمی (شناسه‌های عددی) از ردیف‌های جدید کلاینت (`crypto.randomUUID()`) و ارسال یکپارچه به بک‌اند.
4. **حذف و ویرایش سریع:**
   - آیکون سطل زباله `Trash2` برای حذف آسان استثنائات سپری‌شده.

---

### ۴. قرارداد وب سرویس (API Contract)
- **دریافت استثنائات فعال:**
  - `GET /api/exceptions/availability-exceptions/`
- **ذخیره دسته‌جمعی استثنائات:**
  - `POST /api/exceptions/availability-exceptions/bulk-save/`
  - Payload:
    ```json
    [
      {
        "id": 5,
        "start_date": "2026-03-20",
        "end_date": "2026-03-25",
        "reason": "تعطیلات رسمی آغاز سال نو"
      }
    ]
    ```

---

### ۵. وابستگی‌ها و عدم رگرسیون (Invariants)
- **مهار رزرو نوبت در روزهای تعطیل:** به محض ثبت استثناء در این ماژول، اندپوینت اسلات‌های آزاد مراجعین در آن بازه زمانی خروجی خالی برمی‌گرداند.
