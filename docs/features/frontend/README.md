# اسناد طراحی محصول (PRD) — فرانت‌اند پلتفرم کملین (Kamelion)
## Master Index of Frontend Product Requirement Documents (PRDs)

> این دایرکتوری در برگیرنده کامل تمامی **اسناد طراحی محصول (PRD)** برای بخش فرانت‌اند کلینیک جراحی پستان دکتر نگار معشوری است که به عنوان مبنای رویکرد **Spec-Driven Development (SDD)** تدوین شده‌اند.

---

## ساختار ماژولار اسناد (Documentation Structure)

```text
docs/features/frontend/
├── 01-layout-navigation/          # لایوت سراسری، هدر شیشه‌ای و ناوبری
├── 02-authentication/             # سیستم احراز هویت بیماران (OTP) و ورود ادمین
├── 03-booking-and-calendar/       # فرآیند رزرو نوبت و تقویم شمسی جلالی
├── 04-public-content/             # صفحات عمومی (خانه، خدمات، بیوگرافی، مقالات، ویدیو)
├── 05-clinical-triage-ai/         # کپسول شناور چت و تریاژ هوشمند بالینی
├── 06-patient-engagement/         # نظرات و رضایت‌سنجی مراجعین
├── 07-admin-operations/           # پنل مدیریت کلینیک (شیفت‌ها، استثنائات، پرونده‌ها، تم)
└── README.md                      # فهرست راهنمای کلی (این سند)
```

---

## ماتریس جامع اسناد طراحی محصول (PRD Matrix)

| کد سند | عنوان سند طراحی محصول | ماژول / دسته | وضعیت فرانت | پیوند سند |
|---|---|---|---|---|
| `PRD-FE-001` | لایوت عمومی و ناوبری سراسری | Layout & Shell | ✅ پیاده‌سازی شده | [مشاهده سند](file:///e:/GitHub%20Repo/kamelion/docs/features/frontend/01-layout-navigation/prd-layout-and-navigation.md) |
| `PRD-FE-002` | احراز هویت بدون رمز عبور بیماران (OTP) | Authentication | ✅ پیاده‌سازی شده | [مشاهده سند](file:///e:/GitHub%20Repo/kamelion/docs/features/frontend/02-authentication/prd-patient-auth-otp.md) |
| `PRD-FE-003` | ورود ادمین و گارد مسیرهای مدیریتی | Admin & Security | ✅ پیاده‌سازی شده | [مشاهده سند](file:///e:/GitHub%20Repo/kamelion/docs/features/frontend/02-authentication/prd-admin-auth-guard.md) |
| `PRD-FE-004` | فرآیند رزرو نوبت آنلاین مراجعین | Booking & Slots | ✅ پیاده‌سازی شده | [مشاهده سند](file:///e:/GitHub%20Repo/kamelion/docs/features/frontend/03-booking-and-calendar/prd-patient-appointment-booking.md) |
| `PRD-FE-005` | تقویم شمسی و موتور اسلات‌های زمانی | Calendar Engine | ✅ پیاده‌سازی شده | [مشاهده سند](file:///e:/GitHub%20Repo/kamelion/docs/features/frontend/03-booking-and-calendar/prd-available-slots-calendar.md) |
| `PRD-FE-006` | لندینگ پیج و صفحه اصلی کلینیک | Public Pages | ✅ پیاده‌سازی شده | [مشاهده سند](file:///e:/GitHub%20Repo/kamelion/docs/features/frontend/04-public-content/prd-landing-home-page.md) |
| `PRD-FE-007` | خدمات درمانی، انکولوژی و زیبایی | Public Pages | ✅ پیاده‌سازی شده | [مشاهده سند](file:///e:/GitHub%20Repo/kamelion/docs/features/frontend/04-public-content/prd-medical-services.md) |
| `PRD-FE-008` | پروفایل و سوابق علمی پزشک | Public Pages | ✅ پیاده‌سازی شده | [مشاهده سند](file:///e:/GitHub%20Repo/kamelion/docs/features/frontend/04-public-content/prd-doctor-biography.md) |
| `PRD-FE-009` | مرکز سوالات متداول و مقالات آموزشی | Public Pages | ✅ پیاده‌سازی شده | [مشاهده سند](file:///e:/GitHub%20Repo/kamelion/docs/features/frontend/04-public-content/prd-faq-and-resources.md) |
| `PRD-FE-010` | گالری ویدیوهای بالینی و آموزشی | Media Center | 🟡 نیمه‌متصل (Mock) | [مشاهده سند](file:///e:/GitHub%20Repo/kamelion/docs/features/frontend/04-public-content/prd-clinical-video-gallery.md) |
| `PRD-FE-011` | ویجت شناور تریاژ هوشمند بالینی | Clinical AI | 🟡 نیمه‌متصل (Mock) | [مشاهده سند](file:///e:/GitHub%20Repo/kamelion/docs/features/frontend/05-clinical-triage-ai/prd-ai-smart-triage.md) |
| `PRD-FE-012` | نظرات، تجربیات و رضایت‌سنجی بیماران | Engagement | 🟡 نیمه‌متصل (Local) | [مشاهده سند](file:///e:/GitHub%20Repo/kamelion/docs/features/frontend/06-patient-engagement/prd-patient-reviews.md) |
| `PRD-FE-013` | مدیریت شیفت‌ها و ساعات حضور پزشک | Admin Operations | ✅ پیاده‌سازی شده | [مشاهده سند](file:///e:/GitHub%20Repo/kamelion/docs/features/frontend/07-admin-operations/prd-admin-weekly-availability.md) |
| `PRD-FE-014` | مدیریت تعطیلات و استثنائات تقویم | Admin Operations | ✅ پیاده‌سازی شده | [مشاهده سند](file:///e:/GitHub%20Repo/kamelion/docs/features/frontend/07-admin-operations/prd-admin-date-exceptions.md) |
| `PRD-FE-015` | کارتابل نوبت‌های رزرو شده کلینیک | Admin Operations | ✅ پیاده‌سازی شده | [مشاهده سند](file:///e:/GitHub%20Repo/kamelion/docs/features/frontend/07-admin-operations/prd-admin-appointments-management.md) |
| `PRD-FE-016` | پرونده بالینی و یادداشت‌های درمانی | Admin Operations | 🟡 نیمه‌متصل (Mock) | [مشاهده سند](file:///e:/GitHub%20Repo/kamelion/docs/features/frontend/07-admin-operations/prd-admin-patient-dossiers.md) |
| `PRD-FE-017` | کارتابل نظارت و تایید دیدگاه‌های مراجعین | Admin Operations | 🟡 نیمه‌متصل (Local) | [مشاهده سند](file:///e:/GitHub%20Repo/kamelion/docs/features/frontend/07-admin-operations/prd-admin-reviews-moderation.md) |
| `PRD-FE-018` | سامانه مدیریت ویدیوها (Video CMS) | Admin Operations | 🟡 نیمه‌متصل (Mock) | [مشاهده سند](file:///e:/GitHub%20Repo/kamelion/docs/features/frontend/07-admin-operations/prd-admin-video-cms.md) |
| `PRD-FE-019` | داشبورد آمار، عملکرد و گزارشات | Admin Operations | 🟡 نیمه‌متصل (Mock) | [مشاهده سند](file:///e:/GitHub%20Repo/kamelion/docs/features/frontend/07-admin-operations/prd-admin-dashboard-analytics.md) |
| `PRD-FE-020` | شخصی‌ساز پالت رنگ و تم سراسری | Admin Operations | 🟡 نیمه‌متصل (Local) | [مشاهده سند](file:///e:/GitHub%20Repo/kamelion/docs/features/frontend/07-admin-operations/prd-admin-theme-customizer.md) |
| `PRD-FE-021` | تقویم و کارتابل نوبت‌های پیش‌رو پزشک | Admin Operations | 🟡 در مرحله اعتبارسنجی و تدوین | [مشاهده سند](file:///e:/GitHub%20Repo/kamelion/docs/features/frontend/07-admin-operations/prd-admin-upcoming-appointments.md) |
| `PRD-FE-022` | پرتال عمومی مقالات و آموزش پزشکی | Public Pages | ✅ پیاده‌سازی کامل | [مشاهده سند](file:///e:/GitHub%20Repo/kamelion/docs/features/frontend/04-public-content/prd-medical-articles-public.md) |
| `PRD-FE-023` | سامانه مدیریت مقالات و نویسندگی پزشک (CMS) | Admin Operations | ✅ پیاده‌سازی کامل (آنلاین + آفلاین دیسک) | [مشاهده سند](file:///e:/GitHub%20Repo/kamelion/docs/features/frontend/07-admin-operations/prd-admin-articles-cms.md) |

---

## دستورالعمل توسعه مبتنی بر سند (SDD Protocol)

مطابق با اسکیل [spec-driven-dev](file:///e:/GitHub%20Repo/kamelion/.agents/skills/spec-driven-dev/SKILL.md) و قانون [spec-driven-dev.md](file:///e:/GitHub%20Repo/kamelion/.agents/rules/spec-driven-dev.md):
1. **پیش از نوشتن هر کد:** توسعه‌دهنده یا ایجنت موظف است سند PRD مربوط به آن ماژول را به طور کامل مطالعه کند.
2. **محافظت از فیچرهای وابسته:** قراردادهای داده و متدهای معرفی شده در بخش «وابستگی‌ها و عدم رگرسیون» نباید شکسته شوند.
3. **عدم تصمیم‌گیری خودسرانه:** هرگونه تغییر یا ابهام در فیلدها و رفتارهای تشریح‌شده در این اسناد، باید مستقیماً با پرسش از کاربر رفع ابهام گردد.
