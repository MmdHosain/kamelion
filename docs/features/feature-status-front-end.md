# Frontend Feature Implementation & Backend Synchronization Status

> **مستند وضعیت جامع فیچرهای فرانت‌اند، سیر تکاملی تاریخی (Chronological History & Fixes) و ماتریس تطابق با بک‌اند**  
> این مستند بازتاب‌دهنده وضعیت واقعی کدهای فرانت‌اند (`front-end`)، تاریخچه دقیق کامیت‌های گیت از زمان ایجاد تا آخرین تغییرات و باگ‌فیکس‌ها، و قراردادهای کامل تبادل داده (API Contracts) با بک‌اند (`backend_core`) است.  
> **هدف کلیدی:** ارجاع سریع و دوطرفه بین فرانت‌اند و بک‌اند بدون نیاز به بررسی دستی کل فایل‌های سورس‌کد در تغییرات آتی.

---

## ۱. راهنمای وضعیت‌ها (Status Legend)

| نشانگر | وضعیت پیاده‌سازی در فرانت‌اند | وضعیت هماهنگی با بک‌اند |
|:---:|---|---|
| ✅ **تکمیل و متصل (Connected & Working)** | رابط کاربری، اعتبارسنجی‌ها، استیت و سرویس‌ها کامل است و به اندپوینت واقعی بک‌اند متصل و هماهنگ عمل می‌کند. | اندپوینت متناظر در بک‌اند آماده و پاسخ‌ها کاملاً تطبیق دارند. |
| 🟡 **نیازمند به‌روزرسانی با تغییرات جدید بک‌اند (Backend Changed / Update Pending)** | فیچر در فرانت‌اند پیاده شده است اما به دلیل تغییرات و ارتقاهای اخیر بک‌اند (مانند فلو دو مرحله‌ای OTP، وضعیت Pending، یا فیلدهای جدید)، نیازمند تنظیم مجدد رابط کاربری یا متد فراخوانی است. | قابلیت در بک‌اند توسعه یافته اما فرانت‌اند هنوز نسخه جدید را منعکس نکرده است. |
| ⚠️ **آماده در فرانت‌اند با داده محلی/فال‌بک (Frontend Ready with Fallback)** | رابط کاربری، استورها و توابع سرویس API در فرانت آماده و به فرمت استاندارد کدنویسی شده‌اند؛ در حال حاضر دارای مکانیسم Fallback (مانند `localStorage` یا داده‌های شبیه‌سازی‌شده) هستند تا در صورت در دسترس نبودن بک‌اند نیز برنامه دچار قطعی نشود. | بک‌اند هنوز مدل یا اندپوینت اختصاصی این بخش را پیاده‌سازی نکرده است. |
| 🔵 **در حال توسعه / اسکلت اولیه (In Progress / Scaffolding)** | اسکلت اولیه صفحه یا روت ایجاد شده اما عمق تعاملی یا سرویس شبکه ندارد. | اندپوینت مربوطه در بک‌اند در دست توسعه است. |
| ❌ **پیاده‌سازی نشده در فرانت (Not Implemented)** | قابلیت در سطح کد رابط کاربری وجود ندارد (حتی اگر اندپوینت بک‌اند برای آن آماده باشد). | اندپوینت ممکن است در بک‌اند موجود باشد اما در UI ارائه نشده است. |

---

## ۲. ماتریس تطابق سریع فرانت‌اند و بک‌اند (Cross-Reference Matrix)

این جدول به عنوان نقطه ارجاع سریع بین مستند فرانت‌اند و مستند بک‌اند ([feature-status-back-end.md](file:///e:/GitHub%20Repo/kamelion/docs/features/feature-status-back-end.md)) طراحی شده است:

| شناسه | عنوان فیچر در فرانت‌اند | تاریخ پیدایش | فیچر معادل در بک‌اند | اندپوینت‌های اصلی مصرف‌شده | وضعیت هماهنگی |
|:---:|---|:---:|:---:|---|:---:|
| **FE-01** | ساختار عمومی و نوار ناوبری شیشه‌ای (Layout & Nav) | 2026-02-12 | — | عمومی / کلاینت‌ساید (بررسی استیت لاگین و نقش ادمین) | ✅ تکمیل و فعال |
| **FE-02** | صفحات عمومی معرفی پزشک و خدمات کلینیک | 2026-02-12 | — | کلاینت‌ساید / محتوای پزشکی ثابت | ✅ تکمیل و فعال |
| **FE-03** | سیستم احراز هویت پیامکی بیمار (Patient OTP Auth) | 2026-02-13 | **Feature 1, 2b, 3b** | `POST /api/auth/request-otp`<br>`POST /api/auth/verify-otp`<br>`POST /api/auth/complete-registration`<br>`POST /api/auth/refresh`<br>`GET /api/auth/me` | 🟡 آماده در شاخه refactor-17 / نیازمند ادغام در develop |
| **FE-04** | ویجت و کپسول شناور تریاژ هوشمند (AI Smart Triage) | 2026-02-13 | **Feature 12** | `POST /api/chat/message` | ⚠️ آماده فرانت / سناریو محلی فعال |
| **FE-05** | احراز هویت و گارد دسترسی پنل ادمین (Admin Auth) | 2026-02-22 | **Feature 2, 2b, 15** | `POST /api/auth/admin/login` | ✅ تکمیل و متصل |
| **FE-06** | مدیریت شیفت‌های هفتگی پزشک توسط ادمین (Shifts) | 2026-03-08 | **Feature 4** | `GET /api/admin/slots/`<br>`PUT /api/admin/slots/bulk/`<br>`POST/PUT/DELETE /api/admin/slots/<id>/` | ✅ تکمیل و متصل |
| **FE-07** | مدیریت تعطیلات و استثنائات کلینیک (Exceptions) | 2026-03-13 | **Feature 5** | `GET /api/admin/exceptions/`<br>`PUT /api/admin/exceptions/bulk/`<br>`POST/DELETE /api/admin/exceptions/<id>/` | ✅ تکمیل و متصل |
| **FE-08** | مدال و تقویم رزرو آنلاین نوبت بیمار (Booking Modal) | 2026-05-12 | **Feature 6, 7, 7b** | `GET /api/appointments/slots/?date=`<br>`POST /api/appointments/book/` | ✅ تکمیل و کاملاً متصل (پشتیبانی از Pending و فیلد reason) |
| **FE-09** | مدیریت و لیست نوبت‌های رزرو شده ادمین (Reservations) | 2026-03-11 | **Feature 7b, 10** | `GET /api/admin/appointments/`<br>`POST /api/admin/appointments/<id>/approve/`<br>`POST /api/admin/appointments/<id>/disapprove/`<br>`DELETE /api/admin/appointments/<id>/` | ✅ تکمیل و کاملاً متصل (ستون وضعیت، دکمه‌های تایید/رد، تب‌های فیلتر) |
| **FE-10** | پرونده الکترونیک و یادداشت‌های بیماران (Dossiers) | 2026-03-13 | **Feature 3b, 16** | `GET /api/admin/patients/`<br>`GET /api/admin/patients/<id>/`<br>`PUT/PATCH /api/admin/patients/<id>/`<br>`POST /api/admin/patients/<id>/notes/` | 🟡 متصل / فرم ویرایش کدملی در مدال نیاز است |
| **FE-11** | ثبت نظرات مراجعین و پنل تایید ادمین (Reviews) | 2026-02-12 | **Feature 17** | `GET /api/reviews/`<br>`POST /api/reviews/`<br>`GET /api/admin/reviews/`<br>`PATCH /api/admin/reviews/<id>/`<br>`DELETE /api/admin/reviews/<id>/` | ✅ تکمیل و کاملاً متصل |
| **FE-12** | گالری ویدیوهای آموزشی و مدیریت ویدیو ادمین (Videos) | 2026-08-28 | — | `GET /api/videos/`<br>`POST /api/admin/videos/`<br>`DELETE /api/admin/videos/<id>/` | ⚠️ آماده فرانت / نیازمند ایجاد مدل در بک‌اند |
| **FE-13** | شخصی‌سازی تم و پالت رنگی سراسری (Themes) | 2026-08-28 | — | `GET /api/settings/theme`<br>`PUT /api/admin/settings/theme` | ⚠️ آماده فرانت / نیازمند مدل Settings در بک‌اند |
| **FE-14** | داشبورد گزارشات تحلیلی و آمار کلینیک (Analytics) | 2026-02-22 | — | `GET /api/admin/stats` | ⚠️ آماده فرانت با Recharts / نیازمند سرویس آمار در بک‌اند |
| **FE-15** | پنل کاربری بیمار برای مشاهده و لغو نوبت‌های خود | 2026-06-08 | **Feature 8, 9** | `GET /api/appointments/my/`<br>`POST /api/appointments/<id>/cancel/` | ✅ تکمیل و کاملاً متصل (مدال MyAppointmentsModal و قابلیت لغو) |

---

## ۳. شناسنامه تفصیلی فیچرهای فرانت‌اند بر حسب ترتیب زمانی پیدایش

در این بخش، تمامی فیچرهای فرانت‌اند به ترتیب تاریخ پیدایش در گیت مرتب شده‌اند و هر فیچر شامل **سیر تکاملی اصلاحات (Fix History)**، **فایل‌های سورس‌کد**، **قرارداد API** و **وضعیت تطابق دقیق با بک‌اند** می‌باشد.

---

### FE-01: ساختار عمومی، نوار ناوبری شیشه‌ای و منوی ریسپانسیو
- **دسته‌بندی:** Public UI / Layout & Navigation
- **وضعیت فعلی:** ✅ تکمیل و فعال (Completed)

#### سیر تکاملی و تاریخچه کامیت‌ها (Commit Evolution & Fixes)
1. **کامیت اولیه (Inception):** `9e08b45` (2026-02-12) — *(fix):refactor structure to support backend as well* و `31777ff` (2026-02-12) — پیاده‌سازی اولیه هدر و فوتر سراسری.
2. **اصلاح و تفکیک روت‌ها (Fix):** `3e5cb85` (2026-02-22) — *(fix):the headerand footer are gone.* — رفع تداخل هدر و فوتر عمومی با محیط داخلی پنل ادمین.
3. **بازمهندسی استایل‌ها (Style Refactor):** `2b7a77c`, `ade03e1`, `5fd94a6`, `0cb051e` (2026-08-09 تا 2026-08-11) — ارتقای معماری CSS، افزودن Glassmorphism و هماهنگی متغیرهای پالت رنگی.
4. **طراحی مجدد UI/UX (Redesign):** `d223b67` (2026-08-16) — *(feat(front end): redesign new UI/UX)* — جلوه‌های بصری مدرن و دکمه‌های سریع نوبت‌دهی و تریاژ.
5. **ارتقای منوی کشویی موبایل (Fix & Enhancement):** `b5776bd` (2026-08-28) — *(feat(front): uploading video in admin panel and improve on sliding menu in phone)* — روان‌سازی منوی دراور موبایل، نوار پیشرفت اسکرول و نمایش نام کاربر لاگین شده.

#### فایل‌های درگیر در فرانت‌اند
- کامپوننت‌ها: `src/components/layout/Header.jsx`, `src/components/layout/Footer.jsx`, `src/components/navigation/DesktopNav.jsx`, `src/components/navigation/MobileMenu.jsx`
- استور و روت اصلی: `src/App.jsx`, `src/store/authStore.js`, `src/store/themeStore.js`

#### مشخصات ارتباط با بک‌اند (Backend Contract)
- **وابستگی شبکه:** به صورت مستقل عمل می‌کند، اما به استیت احراز هویت کلاینت متصل است. در صورتی که کاربر وارد شده باشد، نام او را در هدر نمایش می‌دهد و در صورت داشتن دسترسی کاربری `is_staff` یا نقش `admin`، دکمه میان‌بر ورود به پنل مدیریت کلینیک (`/admin`) را آشکار می‌سازد.

---

### FE-02: صفحات عمومی معرفی پزشک، خدمات درمانی و محتوای آموزشی
- **دسته‌بندی:** Public Informational Pages
- **وضعیت فعلی:** ✅ تکمیل و فعال (Completed)

#### سیر تکاملی و تاریخچه کامیت‌ها (Commit Evolution & Fixes)
1. **کامیت اولیه (Inception):** `bcc3f54` (2026-02-12) — *(feat):comment slider and stats sections* — راه‌اندازی صفحات اصلی سایت، معرفی دکتر نگار مشهوری، بخش‌های جراحی و آمارها.
2. **اصلاحات محتوایی (Fix):** `31777ff` (2026-02-12) — رفع ایرادات فاصله‌گذاری کارت‌های درمانی و اصلاح متن‌ها.
3. **طراحی مجدد مدرن (Redesign):** `d223b67` (2026-08-16) — بازنویسی سکشن‌های صفحه اصلی شامل Hero Section، دسترسی سریع، سوالات متداول آکاردئونی و اطلاعات مطب.

#### فایل‌های درگیر در فرانت‌اند
- صفحات: `src/pages/HomePage.jsx`, `src/pages/AboutPage.jsx`, `src/pages/ServicesPage.jsx`, `src/pages/FaqPage.jsx`, `src/pages/ResourcesPage.jsx`
- کامپوننت‌های سکشن: `src/components/sections/HeroSection.jsx`, `AboutSection.jsx`, `ServicesSection.jsx`, `StatsSection.jsx`, `ContactHoursSection.jsx`
- داده‌های پایه‌ای: `src/data/services.js`, `src/data/contact.js`

#### مشخصات ارتباط با بک‌اند (Backend Contract)
- در حال حاضر این بخش‌ها به صورت محتوای بهینه‌شده کلاینت‌ساید لود می‌شوند و نیازی به اندپوینت داینامیک ندارند.

---

### FE-03: سیستم احراز هویت پیامکی بیمار (Patient OTP Authentication)
- **دسته‌بندی:** Authentication / Patient Access
- **وضعیت فعلی:** 🟡 نیازمند به‌روزرسانی نهایی در `develop` (آماده در شاخه `refactor/frontend/17-front-end-auth-flow`)
- **تطابق با بک‌اند:** معادل **Feature 1**, **Feature 2b**, **Feature 3b** در `feature-status-back-end.md`

#### سیر تکاملی و تاریخچه کامیت‌ها (Commit Evolution & Fixes)
1. **کامیت اولیه (Inception):** `0ae9ce6` (2026-02-13) — *(feat): login and otp* — ایجاد اولین مدال ورود با کد یکبار مصرف.
2. **اصلاح دکمه ورود و مدال‌ها (Fix):** `bcb39ff` (2026-02-12) و `ea12d49` (2026-02-13) — رفع مشکل باز شدن مکرر مدال و تداخل دکمه ثبت‌نام.
3. **بازطراحی فرم ورود (Refactor):** `9a20eb7` (2026-05-12) — *(feat):login and sign in IS ADDED* — مدال جدید ورود با اعتبارسنجی شماره همراه.
4. **تطبیق توکن‌های شبکه (Fix):** `c52fa59` (2026-06-10) و `8ee448a` (2026-06-14) — *(fix:auth is fixed)* — اتصال پایه‌ای به بک‌اند و ذخیره اکسس‌توکن JWT.
5. **معماری مدرن اینترسپتور و رفرش‌توکن (Architecture Upgrade):** `3bb1669` / `2884c37` (2026-08-28) — *(fix: merge frontend login bug fix and docs)*:
   - پیاده‌سازی متمرکز `apiClient.js` با قابلیت صف‌بندی درخواست‌ها هنگام خطای 401 و Refresh خودکار توکن.
   - جداسازی `authService.js` و مدیریت سراسری حالت لاگین در Zustand `authStore.js` همراه با کش امن در `localStorage['auth-storage']`.
6. **پیاده‌سازی فلوی دو مرحله‌ای و کدملی (Fix & Major Alignment):** `63b9700` (2026-09-14 در شاخه `refactor/frontend/17-front-end-auth-flow`):
   - پیاده‌سازی متد `completeRegistration` با دریافت `signup_token`, `full_name`, `national_id`.
   - هدایت هوشمند به فرم لاگین ادمین در صورت بازگشت `{ is_admin: true }` از درخواست OTP.

#### فایل‌های درگیر در فرانت‌اند
- کامپوننت‌ها: `src/components/ui/AuthModal.jsx`
- سرویس‌ها و اینترسپتور: `src/services/authService.js`, `src/lib/apiClient.js`
- مدیریت استیت و هوک‌ها: `src/store/authStore.js`, `src/hooks/useAuth.js`

#### مشخصات کامل قرارداد با بک‌اند (API Contract & Schemas)

##### ۱. درخواست کد یکبار مصرف
- **متد و آدرس:** `POST /api/auth/request-otp`
- **دسترسی:** عمومی (Public)
- **بدنه درخواست (Request Body):**
```json
{
  "phone_number": "09123456789"
}
```
- **پاسخ مورد انتظار (Response):**
```json
// بیمار عادی:
{ "is_admin": false, "message": "OTP sent" }

// شماره متعلق به ادمین:
{ "is_admin": true, "message": "Enter your password" }
```

##### ۲. اعتبارسنجی کد یکبار مصرف
- **متد و آدرس:** `POST /api/auth/verify-otp`
- **دسترسی:** عمومی (Public)
- **بدنه درخواست (Request Body):**
```json
{
  "phone_number": "09123456789",
  "code": "123456"
}
```
- **پاسخ مورد انتظار (Response):**
```json
// کاربر قبلاً ثبت‌نام شده:
{
  "access": "<JWT access token>",
  "refresh": "<JWT refresh token>",
  "user": {
    "id": 1,
    "phone_number": "09123456789",
    "full_name": "سارا محمدی",
    "national_id": "0012345678",
    "role": "patient"
  }
}

// کاربر جدید (نیاز به تکمیل ثبت‌نام):
{
  "registration_required": true,
  "signup_token": "<token string>"
}
```

##### ۳. تکمیل ثبت‌نام کاربر جدید
- **متد و آدرس:** `POST /api/auth/complete-registration`
- **دسترسی:** عمومی (Public)
- **بدنه درخواست (Request Body):**
```json
{
  "signup_token": "<string from verify-otp>",
  "full_name": "نام و نام خانوادگی",
  "national_id": "0012345678"
}
```
- **پاسخ مورد انتظار (Response):** مشابه پاسخ لاگین موفق (توکن‌های JWT و آبجکت `user`).

##### ۴. تمدید توکن احراز هویت
- **متد و آدرس:** `POST /api/auth/refresh`
- **بدنه درخواست:** `{ "refreshToken": "<token>" }`
- **پاسخ:** `{ "accessToken": "...", "refreshToken": "..." }`

##### ۵. دریافت پروفایل جاری و خروج
- **متدها:** `GET /api/auth/me` و `POST /api/auth/logout` با هدر `Authorization: Bearer <token>`.

#### تحلیل گپ و اقدامات مورد نیاز (Gaps & Action Items)
- در برنچ فعلی `develop`، فایل `authService.js` پارامترهای قدیمی `type` و `name` را مستقیماً به `verify-otp` می‌فرستد. تغییرات آماده شده در شاخه `refactor/frontend/17-front-end-auth-flow` (کامیت `63b9700`) باید به شاخه `develop` ادغام شوند تا فرانت‌اند کاملاً با ساختار دو مرحله‌ای جدید بک‌اند همگام گردد.

---

### FE-04: ویجت و کپسول شناور تریاژ هوشمند پزشکی (AI Smart Triage)
- **دسته‌بندی:** Clinical AI & Patient Assistance
- **وضعیت فعلی:** ⚠️ آماده در فرانت با موتور سناریوی محلی (Fallback Active)
- **تطابق با بک‌اند:** معادل **Feature 12** (`apps.chat_gateway` / FastAPI) در `feature-status-back-end.md`

#### سیر تکاملی و تاریخچه کامیت‌ها (Commit Evolution & Fixes)
1. **کامیت اولیه (Inception):** `73be04f` (2026-02-13) — *(feat): demo chats for presentation* — کپسول اولیه چت در پایین صفحه با سناریوهای دمو.
2. **بهبود رابط کاربری در موبایل (UI Fix):** `e58f5ce` (2026-08-17) — *(fix(chat/phone):change ui for chat box)* — بهینه‌سازی ارتفاع و پدینگ کادر چت در نمایشگرهای لمسی.
3. **اصلاح موقعیت قرارگیری (Positioning Fix):** `c31aa24` (2026-08-17) — *(fix(chat):center chat position)* — قرارگیری دقیق در مرکز پایین صفحه به صورت Floating.
4. **انتزاع سرویس شبکه و موتور دوگانه (Architecture Upgrade):** `3bb1669` / `2884c37` (2026-08-28):
   - معرفی سرویس شبکه `src/api/chatService.js`.
   - معماری Dual-Engine: ارسال به اندپوینت تریاژ هوشمند، و در صورت عدم اتصال یا تاخیر سرور، سوئیچ آنی به موتور ارزیابی علائم محلی (`chatScenarios.js`) با قابلیت تشخیص کدهای اورژانسی (`EMG-XXXX`) و پیشنهاد رزرو نوبت.

#### فایل‌های درگیر در فرانت‌اند
- کامپوننت‌ها: `src/components/chat/FloatingChatWidget.jsx`, `ChatContainer.jsx`, `ChatHeader.jsx`, `ChatMessages.jsx`, `ChatInput.jsx`, `ChatSuggestions.jsx`, `ResumeButton.jsx`
- سرویس و داده‌ها: `src/api/chatService.js`, `src/data/chatScenarios.js`, `src/data/chatSuggestions.js`
- هوک‌ها: `src/hooks/useChat.js`, `src/hooks/useAutoScroll.js`

#### مشخصات کامل قرارداد با بک‌اند (API Contract & Schemas)
- **متد و آدرس:** `POST /api/chat/message`
- **دسترسی:** عمومی یا هدر احراز هویت اختیاری
- **بدنه درخواست (Request Body):**
```json
{
  "message": "علائم درد در پستان چپ و ترشح غیرطبیعی",
  "session_id": "session_1724839200000",
  "context": {}
}
```
- **پاسخ مورد انتظار (Response):**
```json
{
  "reply": "علائم ذکر شده نیازمند معاینه و سونوگرافی فوری است.",
  "is_emergency": true,
  "emergency_code": "EMG-4812",
  "show_booking": true
}
```

#### تحلیل گپ و اقدامات مورد نیاز (Gaps & Action Items)
- فرانت‌اند به طور کامل آماده ارتباط با سرویس هوش مصنوعی است. در بک‌اند، اپلیکیشن `chat_gateway` و تنظیمات اتصال به سرور FastAPI هنوز در وضعیت `In Progress` است و مدل‌ها یا مسیرهای آن پیاده‌سازی نشده‌اند. در شرایط فعلی، فرانت‌اند با تکیه بر موتور Fallback بدون خطا به سوالات مراجعین پاسخ می‌دهد.

---

### FE-05: احراز هویت ادمین، مسیرهای محافظت‌شده و پوسته پنل مدیریت
- **دسته‌بندی:** Admin / Authentication & Shell
- **وضعیت فعلی:** ✅ تکمیل و متصل (Completed)
- **تطابق با بک‌اند:** معادل **Feature 2**, **Feature 2b**, **Feature 15** در `feature-status-back-end.md`

#### سیر تکاملی و تاریخچه کامیت‌ها (Commit Evolution & Fixes)
1. **کامیت اولیه (Inception):** `be94399` (2026-02-22) — *(feat):admin panle added whith the router only dashboard is full...* و `6016f39` (2026-02-27) — راه‌اندازی روت‌های `/admin` با صفحه لاگین پسورد اولیه.
2. **اصلاح سربرگ و عنوان‌ها (Fix):** `3e5cb85` (2026-02-22) و `c105c2f` (2026-03-14) — اصلاح تداخل فوتر عمومی، رفع لود دوگانه اولیه و تغییر مسیرها.
3. **اتصال لاگین پسورد به بک‌اند (Fix):** `45a2960` (2026-06-03) — *(fix): fix admin login* — اتصال فرم لاگین به اندپوینت جنگو.
4. **تقویت گارد دسترسی و جداسازی سایدبار (Security & Structure Upgrade):** `3bb1669` / `2884c37` (2026-08-28):
   - کامپوننت گارد `AdminProtectedRoute.jsx` و `RoleGuard.jsx` برای ممانعت از ورود کاربران غیر ادمین.
   - طراحی سایدبار ماژولار `AdminSidebar.jsx` بر پایه کانفیگ متمرکز `AdminNavConfig.js`.

#### فایل‌های درگیر در فرانت‌اند
- صفحات: `src/pages/admin/AdminLogin.jsx`, `src/pages/admin/AdminPage.jsx`
- چیدمان و گارد: `src/components/admin/AdminLayout.jsx`, `AdminSidebar.jsx`, `AdminNavConfig.js`, `AdminProtectedRoute.jsx`, `src/guards/RoleGuard.jsx`
- سرویس احراز هویت: `src/services/authService.js`

#### مشخصات کامل قرارداد با بک‌اند (API Contract & Schemas)
- **متد و آدرس:** `POST /api/auth/admin/login`
- **دسترسی:** عمومی (Public)
- **بدنه درخواست (Request Body):**
```json
{
  "phone_number": "09120000000",
  "password": "StrongAdminPassword123"
}
```
- **پاسخ موفق (200 OK):**
```json
{
  "accessToken": "<JWT access token>",
  "refreshToken": "<JWT refresh token>",
  "user": {
    "id": 1,
    "phone_number": "09120000000",
    "full_name": "دکتر نگار مشهوری",
    "role": "admin"
  }
}
```
- **خطاها:** `401 Unauthorized` (نام کاربری یا رمز عبور اشتباه)، `403 Forbidden` (کاربر فعال است اما پرچم `is_staff` ندارد).

---

### FE-06: مدیریت شیفت‌های هفتگی حضور پزشک (Doctor Availability)
- **دسته‌بندی:** Admin Panel / Scheduling
- **وضعیت فعلی:** ✅ تکمیل و متصل (Completed)
- **تطابق با بک‌اند:** معادل **Feature 4** در `feature-status-back-end.md`

#### سیر تکاملی و تاریخچه کامیت‌ها (Commit Evolution & Fixes)
1. **کامیت اولیه (Inception):** `507e6aa` (2026-03-08) — *(feat):Foundation, Data Structure, and Layout was add for appointment Resvetion* و `63b6be8` (2026-03-08) — ایجاد کامپوننت کارت شیفت هفتگی.
2. **بهبودهای تعاملی (Fixes & UX):**
   - `602e257` (2026-03-09): تلاش برای تثبیت موقعیت المان‌ها.
   - `8547368` (2026-03-09): چیدمان آیکون‌ها و استایل انتخاب روزها.
   - `c5049c7` (2026-03-10): قابلیت Drag and Drop برای جابجایی کارت‌های شیفت.
   - `50aaf84` (2026-03-10): رفع باگ سوئیچ تب‌ها بین شیفت و استثنائات.
3. **اتصال شبکه و رفع باگ ذخیره (Backend Integration & Fixes):**
   - `3fd1e68` / `0e1f95d` (2026-03-13): اتصال به اندپوینت‌های آزمایشی بک‌اند.
   - `b1f6ba9` (2026-06-03): رفع باگ افزودن کارت جدید بدون رفرش.
   - `3cbd2c7` (2026-06-05): اصلاح بازیابی داده‌ها و نمایش کارت‌ها پس از رفرش صفحه.
   - `4f0ca28` (2026-06-06): اصلاح عملکرد دکمه Bulk Save و ذخیره‌سازی قطعی در دیتابیس بدون نیاز به تکرار عملیات.

#### فایل‌های درگیر در فرانت‌اند
- صفحات و کامپوننت‌ها: `src/pages/admin/AppointmentsAvailability.jsx`, `src/components/admin/availability/ScheduleCard.jsx`
- سرویس شبکه: `src/api/schedules.js`

#### مشخصات کامل قرارداد با بک‌اند (API Contract & Schemas)

##### ۱. دریافت لیست شیفت‌های فعال
- **متد و آدرس:** `GET /api/admin/slots/`
- **دسترسی:** `Bearer <token>` (`IsAdminUser`)
- **پاسخ:** آرایه‌ای از آبجکت‌های شیفت هفتگی.

##### ۲. ذخیره دسته‌جمعی و بازنویسی شیفت‌ها (Bulk Save)
- **متد و آدرس:** `PUT /api/admin/slots/bulk/`
- **دسترسی:** `Bearer <token>` (`IsAdminUser`)
- **بدنه درخواست (Request Body):**
```json
{
  "schedules": [
    {
      "id": 1,
      "name": "شیفت صبح مطب",
      "days_of_week": ["SAT", "MON", "WED"],
      "start_time": "09:00:00",
      "end_time": "13:00:00",
      "visit_duration": 30,
      "time_gap": 5,
      "is_active": true
    },
    {
      "name": "شیفت عصر جراحی",
      "days_of_week": ["TUE"],
      "start_time": "16:00:00",
      "end_time": "20:00:00",
      "visit_duration": 45,
      "time_gap": 10,
      "is_active": true
    }
  ]
}
```
- **نکته کلیدی بک‌اند:** هر ردیفی که فاقد `id` باشد ایجاد می‌شود؛ ردیف‌های دارای `id` بروزرسانی می‌شوند و ردیف‌های موجود در دیتابیس که در این لیست فرستاده نشوند **حذف** می‌گردند.

---

### FE-07: مدیریت تعطیلات رسمی و استثنائات کاری کلینیک (Clinic Exceptions)
- **دسته‌بندی:** Admin Panel / Scheduling
- **وضعیت فعلی:** ✅ تکمیل و متصل (Completed)
- **تطابق با بک‌اند:** معادل **Feature 5** در `feature-status-back-end.md`

#### سیر تکاملی و تاریخچه کامیت‌ها (Commit Evolution & Fixes)
1. **کامیت اولیه (Inception):** `a071f4e` (2026-03-13) — *(feat):ExceptionsList was added good prgress* — ایجاد کامپوننت بازه تاریخ تعطیلی و دلیل.
2. **اتصال شبکه و رفع باگ رفرش (Fixes):**
   - `ec744d4` (2026-06-05): *(feat):exceptions is connected to back but there is a refrsh bug* — برقراری اولین ارتباط با اندپوینت بک‌اند.
   - `4f0ca28` (2026-06-06): *(fix):now saves works even after reload...* — اصلاح هماهنگی استیت فرانت با دیتابیس، جلوگیری از پرش فرم پس از ذخیره‌سازی.

#### فایل‌های درگیر در فرانت‌اند
- کامپوننت‌ها: `src/components/admin/exceptions/ExceptionsList.jsx`, `CustomDateRangePicker.jsx`
- سرویس شبکه: `src/api/schedules.js` (`getAdminExceptions`, `bulkSaveAdminExceptions`)

#### مشخصات کامل قرارداد با بک‌اند (API Contract & Schemas)
- **متد و آدرس:** `GET /api/admin/exceptions/` و `PUT /api/admin/exceptions/bulk/`
- **دسترسی:** `Bearer <token>` (`IsAdminUser`)
- **بدنه درخواست ذخیره دسته‌جمعی:**
```json
{
  "exceptions": [
    {
      "id": 1,
      "start_date": "2026-10-01",
      "end_date": "2026-10-05",
      "reason": "شرکت در کنگره بین‌المللی جراحی پستان"
    }
  ]
}
```
- **اعتبارسنجی بک‌اند:** بررسی شرط تقویمی `end_date >= start_date` در سطح دیتابیس (`CheckConstraint`).

---

### FE-08: مدال رزرو آنلاین نوبت و انتخاب اسلات‌های آزاد توسط بیمار
- **دسته‌بندی:** Patient Portal / Booking
- **وضعیت فعلی:** ✅ تکمیل و کاملاً متصل (Completed & Synchronized)
- **تطابق با بک‌اند:** معادل **Feature 6**, **Feature 7**, **Feature 7b** در `feature-status-back-end.md`

#### سیر تکاملی و تاریخچه کامیت‌ها (Commit Evolution & Fixes)
1. **کامیت اولیه (Inception):** `094fb7a` (2026-05-12) — *(feat):date picker is now added.* — پیاده‌سازی اولیه انتخابگر روز و ساعت رزرو.
2. **برقراری ارتباط رزرو کاربر با بک‌اند (Integration):** `f171a38` (2026-06-08) — اتصال استعلام اسلات‌های باز بر اساس تاریخ شمسی به سرور.
3. **بهبود پیام‌های خطای تقویم (Fix):** `cedefb7` (2026-08-17) — *(fix(calendar): meaningful response for days with no reservation left)* — نمایش پیام روشن و فارسی در روزهایی که ظرفیت تکمیل شده یا کلینیک تعطیل است.
4. **یکپارچه‌سازی تقویم شمسی جلالی (Major Upgrade):** `b5776bd` (2026-08-28):
   - افزودن ماژول تقویم کاملاً شمسی `JalaliCalendar.jsx` و توابع تبدیل تقویم `jalaliDateUtils.js`.
   - نرمال‌سازی وضعیت ساعت‌ها (آزاد، پر شده، در انتظار).
   - افزودن فیلد دلیل مراجعه اختیاری (`reason`).
5. **هماهنگ‌سازی با جریان Pending و تایید منشی (Workflow Upgrade):** (2026-09-22):
   - دریافت وضعیت اولیه `pending` نوبت از بک‌اند و نمایش نشان اختصاصی وضعیت در کارت تایید.
   - اضافه شدن اینپوت علت مراجعه و دکمه دسترسی مستقیم به «نوبت‌های من».

#### فایل‌های درگیر در فرانت‌اند
- کامپوننت‌ها: `src/components/ui/AppointmentModal.jsx`, `src/components/ui/JalaliCalendar.jsx`, `src/components/DayPicker.jsx`, `src/components/SlotButton.jsx`
- سرویس‌ها و توابع کمکی: `src/api/reservationService.js`, `src/utils/jalaliDateUtils.js`

#### مشخصات کامل قرارداد با بک‌اند (API Contract & Schemas)

##### ۱. استعلام اسلات‌های آزاد روزانه
- **متد و آدرس:** `GET /api/appointments/slots/?date=YYYY-MM-DD`
- **دسترسی:** عمومی (Public)
- **پاسخ مورد انتظار (Response):**
```json
{
  "date": "2026-09-25",
  "available_slots": ["09:30:00", "10:00:00", "11:30:00"]
}
```
- **منطق بک‌اند:** اسلات‌هایی که دارای نوبت با وضعیت `scheduled` **یا `pending`** باشند، خودکار از لیست آزاد کسر می‌شوند.

##### ۲. ثبت نوبت توسط بیمار
- **متد و آدرس:** `POST /api/appointments/book/`
- **دسترسی:** `Bearer <token>` (`IsAuthenticated`)
- **بدنه درخواست (Request Body):**
```json
{
  "date": "2026-09-25",
  "time": "09:30:00",
  "reason": "معاینه دوره‌ای پس از جراحی انکوپلاستی"
}
```
- **پاسخ موفق (201 Created):**
```json
{
  "id": 24,
  "full_name": "مریم سعیدی",
  "phone_number": "09121112233",
  "appointment_date": "2026-09-25",
  "appointment_time": "09:30:00",
  "status": "pending",
  "reason": "معاینه دوره‌ای پس از جراحی انکوپلاستی",
  "created_at": "2026-09-22T10:00:00Z"
}
```

#### تحلیل گپ و اقدامات انجام‌شده (Completed Actions)
- **وضعیت Pending:** پیام موفقیت در `AppointmentModal.jsx` با نمایش نشان برجسته «در انتظار بررسی و تایید کلینیک» و راهنمای دقیق پیامک به‌روزرسانی شد.
- **فیلد علت مراجعه:** اینپوت اختیاری `reason` در مدال اضافه شد و به بک‌اند ارسال می‌شود.
- **دسترسی سریع به نوبت‌های من:** دکمه میان‌بر برای مشاهده مستقیم سوابق و پیگیری نوبت‌ها در کارت موفقیت تعبیه شد.

---

### FE-09: پنل مدیریت، جستجو و لیست نوبت‌های کلینیک (Admin Reservations)
- **دسته‌بندی:** Admin Panel / Appointments
- **وضعیت فعلی:** ✅ تکمیل و کاملاً متصل (Completed & Synchronized)
- **تطابق با بک‌اند:** معادل **Feature 7b**, **Feature 10** در `feature-status-back-end.md`

#### سیر تکاملی و تاریخچه کامیت‌ها (Commit Evolution & Fixes)
1. **کامیت اولیه (Inception):** `b2e4b7f` (2026-03-11) — *(feat):ReservationsList was added* — ساخت جدول پایه نوبت‌های ثبت‌شده.
2. **افزودن نام بیمار و پاپ‌آپ (Feature additions):**
   - `c6b30c3` (2026-03-10): اضافه شدن فیلد نام بیمار در جدول.
   - `4085944` (2026-03-13): افزودن استایل‌های مدال جزئیات نوبت.
3. **اصلاح تداخلات مرج و هماهنگی (Fix):** `842e271` (2026-06-23) — *(fix(appointment): fixed reservation in admin panel and problems of merge)*.
4. **بازنویسی عظیم با پشتیبانی تقویم شمسی و ثبت دستی (Major Refactor):** `b5776bd` (2026-08-28):
   - ارتقای فایل `ReservationsList.jsx` با صفحه‌بندی متغیر (۱۰، ۲۵، ۵۰، ۱۰۰ ردیف).
   - جستجوی بلادرنگ در نام و شماره تماس بیمار.
   - فرم مدال ثبت دستی نوبت توسط ادمین برای بیماران حضوری (`createAdminReservation`).
   - تبدیل و نمایش کلیه تاریخ‌های میلادی سرور به تاریخ شمسی با اعداد فارسی.
5. **ارتقای کامل مدیریت وضعیت و اکشن‌های تایید/رد (Approval Flow):** (2026-09-22):
   - اضافه شدن ستون اختصاصی «وضعیت» و نشان‌های ۵ گانه.
   - اکشن‌های تایید نوبت (`approve`) و رد نوبت (`disapprove`) با بروزرسانی زنده بدون رفرش.
   - اضافه شدن تب‌های فیلتر نوبت‌ها (همه، در انتظار تایید با شمارنده زنده، تایید شده، لغو شده).

#### فایل‌های درگیر در فرانت‌اند
- کامپوننت‌ها و صفحات: `src/components/admin/reservations/ReservationsList.jsx`, `src/pages/admin/ReservedTimes.jsx`
- سرویس‌ها: `src/api/reservationService.js`, `src/api/admin.js`

#### مشخصات کامل قرارداد با بک‌اند (API Contract & Schemas)

##### ۱. دریافت لیست نوبت‌ها همراه با سرچ و وضعیت
- **متد و آدرس:** `GET /api/admin/appointments/?search=&status=&page=&page_size=`
- **دسترسی:** `Bearer <token>` (`IsAdminUser`)
- **پارامترهای Query:**
  - `search`: فیلتر متنی روی نام یا شماره تماس بیمار.
  - `status`: فیلتر دقیق وضعیت شامل `pending`, `scheduled`, `cancelled_user`, `cancelled_admin`, `visited`.
  - `page` و `page_size`: صفحه‌بندی DRF.

##### ۲. تأیید نوبت در انتظار (Approve) — *جدید در بک‌اند*
- **متد و آدرس:** `POST /api/admin/appointments/<id>/approve/`
- **دسترسی:** `Bearer <token>` (`IsAdminUser`)
- **پاسخ:** وضعیت نوبت به `scheduled` تغییر می‌یابد.

##### ۳. رد نوبت در انتظار (Disapprove) — *جدید در بک‌اند*
- **متد و آدرس:** `POST /api/admin/appointments/<id>/disapprove/`
- **دسترسی:** `Bearer <token>` (`IsAdminUser`)
- **پاسخ:** وضعیت به `cancelled_admin` تغییر کرده و اسلات آزاد می‌شود.

##### ۴. ثبت دستی نوبت توسط ادمین (Walk-in Booking)
- **متد و آدرس:** `POST /api/admin/appointments/create/` (یا `/api/admin/appointments/`)
- **بدنه درخواست:** `{ "full_name": "...", "phone_number": "...", "date": "YYYY-MM-DD", "time": "HH:MM:SS", "reason": "..." }`
- **نکته:** نوبت‌های ثبت شده توسط ادمین مستقیماً با وضعیت `scheduled` ثبت می‌شوند و نیازی به تأیید مجدد ندارند.

#### تحلیل گپ و اقدامات انجام‌شده (Completed Actions)
- **ستون وضعیت و اکشن‌ها:** ستون وضعیت به همراه دکمه‌های تایید (`approve`) و رد نوبت (`disapprove`) برای نوبت‌های با وضعیت `pending` تعبیه و متصل شدند.
- **تب‌های فیلتر:** امکان مشاهده اختصاصی نوبت‌های نیازمند تایید با شمارنده نوتیفیکیشن پیاده‌سازی شد.

---

### FE-10: پرونده الکترونیک و یادداشت‌های بیماران در پنل ادمین (Patient Dossiers)
- **دسته‌بندی:** Admin Panel / Clinical Records
- **وضعیت فعلی:** 🟡 متصل با فال‌بک / آماده افزودن فیلد کدملی
- **تطابق با بک‌اند:** معادل **Feature 3b**, **Feature 16** در `feature-status-back-end.md`

#### سیر تکاملی و تاریخچه کامیت‌ها (Commit Evolution & Fixes)
1. **کامیت اولیه (Inception):** `d9f18b5` (2026-03-13) — *(feat):micro profile was added* و `a9b0319` (2026-03-14) — مدال اولیه پرونده بیمار.
2. **ارتقای معماری داده و ثبت یادداشت (API Integration & Fallback):** `3bb1669` / `2884c37` (2026-08-28):
   - اتصال به `adminApi.getPatients` و `adminApi.getPatientDetail`.
   - ایجاد مدال سه‌ستونه جامع `PatientDetailModal.jsx` شامل تاریخچه مراجعات، یادداشت‌های ویزیت و پروفایل درمانی با مکانیسم Fallback پایدار.
   - ثبت یادداشت پزشک با متد `adminApi.addPatientNote`.

#### فایل‌های درگیر در فرانت‌اند
- کامپوننت‌ها: `src/components/admin/patients/PatientsList.jsx`, `src/components/admin/patients/PatientDetailModal.jsx`
- سرویس API: `src/api/admin.js` (`getPatients`, `getPatientDetail`, `addPatientNote`)

#### مشخصات کامل قرارداد با بک‌اند (API Contract & Schemas)
- **دریافت لیست بیماران:** `GET /api/admin/patients/?search=`
- **دریافت پرونده کامل بیمار:** `GET /api/admin/patients/<id>/`
- **ویرایش مشخصات بیمار توسط ادمین (نام و کدملی):**
  - **متد و آدرس:** `PUT` یا `PATCH /api/admin/patients/<id>/`
  - **بدنه درخواست:**
```json
{
  "full_name": "مریم سعیدی",
  "national_id": "0012345678"
}
```
- **ثبت یادداشت پزشک:** `POST /api/admin/patients/<id>/notes/` با بدنه `{ "text": "متن گزارش ویزیت" }`.
- **دسترسی:** `Bearer <token>` (`IsAdminUser`).

---

### FE-11: ثبت نظرات مراجعین و پنل نظارت و تایید ادمین (Reviews & Moderation)
- **دسته‌بندی:** Patient Engagement / Social Proof
- **وضعیت فعلی:** ✅ تکمیل و کاملاً هماهنگ (Completed)
- **تطابق با بک‌اند:** معادل **Feature 17** در `feature-status-back-end.md`

#### سیر تکاملی و تاریخچه کامیت‌ها (Commit Evolution & Fixes)
1. **کامیت اولیه (Inception):** `bcc3f54` (2026-02-12) — اسلایدر اولیه نظرات مراجعین در صفحه اصلی.
2. **پاپ‌آپ مشاهده کلیه نظرات (Feature addition):** `6c33138` (2026-08-18) — *(feat(comment): add popup to show all the comments)* — ایجاد `CommentModal.jsx`.
3. **معماری استور و سرویس نظرات (Store & API Integration):** `3bb1669` / `2884c37` (2026-08-28) — ایجاد `reviewsService.js` و Zustand `commentsStore.js`.
4. **پیاده‌سازی فرم عمومی و پنل ادمین (Major Feature Release):** `a1b6caf`, `5d093db`, `b09097a`, `d48d4ca` (2026-09-03):
   - فرم ارسال نظر با امتیازدهی ستاره‌ای ۱ تا ۵ در `ReviewsSection.jsx`.
   - داشبورد نظارت ادمین `AdminComments.jsx` با قابلیت حذف، مشاهده وضعیت و تایید انتشار.
5. **اصلاح نهایی رفتار ارسال و اختیاری شدن نام (Bugfix & Polish):** `1d07970` (2026-09-05) — *(Merge branch 'bugfix/frontend/12-fix-review-submission-behavior')*:
   - اختیاری شدن فیلد نام در ثبت نظر و جایگزینی با نام پیش‌فرض در صورت خالی بودن.
   - رفع خطاهای Toast فارسی و به‌روزرسانی آنی استیت بدون رفرش (Optimistic UI).
   - فیلتر بر اساس وضعیت در پنل ادمین (همه، تایید شده، در انتظار).

#### فایل‌های درگیر در فرانت‌اند
- کامپوننت‌ها و صفحات: `src/components/sections/ReviewsSection.jsx`, `src/components/sections/CommentsSlider.jsx`, `src/components/CommentModal.jsx`, `src/pages/admin/AdminComments.jsx`
- سرویس و استور: `src/api/reviewsService.js`, `src/store/commentsStore.js`

#### مشخصات کامل قرارداد با بک‌اند (API Contract & Schemas)

##### ۱. دریافت نظرات تایید شده عمومی
- **متد و آدرس:** `GET /api/reviews/`
- **دسترسی:** عمومی (Public)
- **پاسخ:** آرایه‌ای از نظرات تایید شده:
```json
[
  {
    "id": 3,
    "name": "الهام راد",
    "email": "",
    "text": "دقت و مهارت خانم دکتر در جراحی بازسازی واقعاً ستودنی است.",
    "rating": 5,
    "created_at": "2026-09-01T12:00:00Z",
    "approved": true
  }
]
```

##### ۲. ارسال نظر توسط مراجعین
- **متد و آدرس:** `POST /api/reviews/`
- **دسترسی:** عمومی (Public)
- **بدنه درخواست (Request Body):**
```json
{
  "name": "نام دلخواه یا خالی",
  "email": "optional@example.com",
  "text": "توضیحات و تجربه درمان",
  "rating": 5
}
```
- **نکته:** نظر بلافاصله با وضعیت `approved: false` (در انتظار تأیید) ثبت شده و تا زمان تایید ادمین در سایت عمومی نمایش داده نمی‌شود.

##### ۳. پنل نظارت ادمین (دریافت، تغییر تایید، حذف)
- **دریافت همه نظرات:** `GET /api/admin/reviews/`
- **تغییر تایید انتشار:** `PATCH /api/admin/reviews/<id>/` با بدنه `{ "approved": true/false }`
- **حذف نظر:** `DELETE /api/admin/reviews/<id>/`
- **دسترسی:** `Bearer <token>` (`IsAdminUser`).

---

### FE-12: گالری ویدیوهای آموزشی و مدیریت بارگذاری ویدیو در ادمین (Video CMS)
- **دسته‌بندی:** Public Media & Admin Video CMS
- **وضعیت فعلی:** ⚠️ آماده در فرانت با داده‌های لوکال (Frontend Ready with Fallback)

#### سیر تکاملی و تاریخچه کامیت‌ها (Commit Evolution & Fixes)
1. **کامیت اولیه (Inception):** `VideoPage.jsx` اولیه به عنوان گالری آموزشی.
2. **افزودن مدیریت ویدیوی ادمین و سرویس API (Feature Release):** `b5776bd` (2026-08-28) — *(feat(front): uploading video in admin panel...)*:
   - ایجاد صفحه جامع `AdminVideos.jsx` در پنل مدیریت جهت آپلود فایل یا درج لینک ویدیو.
   - ایجاد سرویس متمرکز `src/api/videoService.js`.
   - افزودن پلیر مدال در `VideoPage.jsx` و بهینه‌سازی بارگذاری تنبل ویدیوها با `preload="metadata"`.

#### فایل‌های درگیر در فرانت‌اند
- صفحات: `src/pages/VideoPage.jsx`, `src/pages/admin/AdminVideos.jsx`
- سرویس شبکه: `src/api/videoService.js`
- ناوبری ادمین: `src/components/admin/AdminNavConfig.js`

#### مشخصات کامل قرارداد با بک‌اند (API Contract & Schemas)
- **دریافت ویدیوهای عمومی:** `GET /api/videos/` (عمومی) -> بازگشت لیست ویدیوها.
- **ثبت ویدیوی جدید توسط ادمین:** `POST /api/admin/videos/` (ادمین) -> بدنه شامل `{ "title": "...", "description": "...", "video_url": "...", "category": "..." }`.
- **حذف ویدیو:** `DELETE /api/admin/videos/<id>/` (ادمین).

#### تحلیل گپ و اقدامات مورد نیاز (Gaps & Action Items)
- در بک‌اند مدل یا اندپوینتی برای مدیریت ویدیوها ثبت نشده است. ساخت یک اپلیکیشن سبک جنگو برای ویدیوها، این ماژول فرانت‌اند را بدون هیچ دستکاری در کدهای فرانت متصل خواهد کرد.

---

### FE-13: شخصی‌سازی تم و پالت رنگی سراسری (Multi-Palette Theme Customizer)
- **دسته‌بندی:** Admin Settings / Design System
- **وضعیت فعلی:** ⚠️ آماده در فرانت با Fallback لوکال‌استوریج (Frontend Ready with Fallback)

#### سیر تکاملی و تاریخچه کامیت‌ها (Commit Evolution & Fixes)
1. **کامیت اولیه (Inception):** ایجاد پالت‌های صورتی (`pink`)، یاسی (`lilac`) و سلطنتی (`purple`) در متغیرهای CSS سراسری.
2. **معماری همگام‌سازی سرور و سرویس تنظیمات (Architecture Upgrade):** `3bb1669` / `2884c37` (2026-08-28):
   - افزودن سرویس `src/api/settingsService.js` با متدهای `getTheme()` و `saveTheme()`.
   - اتصال `App.jsx` به فراخوانی `fetchTheme()` در ابتدای لود سایت جهت اعمال تم سراسری انتخاب‌شده توسط پزشک برای کلیه مراجعین.
   - صفحه `AdminSettings.jsx` با بازخورد لودینگ، تست زنده و ذخیره در کلاینت و سرور.

#### فایل‌های درگیر در فرانت‌اند
- صفحات و چیدمان: `src/pages/admin/AdminSettings.jsx`, `src/App.jsx`, `src/index.css`
- استور و سرویس: `src/store/themeStore.js`, `src/api/settingsService.js`

#### مشخصات کامل قرارداد با بک‌اند (API Contract & Schemas)
- **دریافت تم فعال کلینیک:** `GET /api/settings/theme` (عمومی) -> بازگشت `{ "theme": "pink" }`.
- **ذخیره تم توسط ادمین:** `PUT /api/admin/settings/theme` (ادمین) -> بدنه `{ "theme": "purple" }`.

---

### FE-14: داشبورد گزارشات تحلیلی و آمار مراجعین کلینیک (Analytics Dashboard)
- **دسته‌بندی:** Admin Panel / Analytics
- **وضعیت فعلی:** ⚠️ آماده در فرانت با Recharts و داده‌های نمونه (Frontend Ready with Fallback)

#### سیر تکاملی و تاریخچه کامیت‌ها (Commit Evolution & Fixes)
1. **کامیت اولیه (Inception):** `be94399` (2026-02-22) و `c105c2f` (2026-03-14) — ساخت صفحه آمار و ارقام.
2. **پیاده‌سازی چارت‌های مدرن Recharts (Architecture Upgrade):** `3bb1669` / `2884c37` (2026-08-28):
   - نمودار روند ۶ ماهه مراجعین (LineChart).
   - نمودار توزیع وضعیت نوبت‌ها (PieChart).
   - کارت‌های آماری شاخص کلیدی عملکرد (KPIs) شامل تعداد مراجعین ماهانه، نوبت‌های اینترنتی، جلسات تریاژ هوشمند و رضایت بیماران.
   - اتصال به تابع شبکه `adminApi.getDashboardStats()` همراه با نگه‌دارنده فال‌بک پایدار.

#### فایل‌های درگیر در فرانت‌اند
- صفحات: `src/pages/admin/AdminDashboard.jsx`
- سرویس API: `src/api/admin.js` (`getDashboardStats`)

#### مشخصات کامل قرارداد با بک‌اند (API Contract & Schemas)
- **متد و آدرس:** `GET /api/admin/stats`
- **دسترسی:** `Bearer <token>` (`IsAdminUser`)
- **خروجی مورد انتظار:** داده‌های آماری کلینیک، شمارش رزروها و تفکیک وضعیت‌ها.

---

### FE-15: پنل مراجعین برای مشاهده نوبت‌های شخصی و لغو نوبت (Patient Portal)
- **دسته‌بندی:** Patient Portal / Self-Service
- **وضعیت فعلی:** ✅ تکمیل و کاملاً متصل (Completed & Synchronized)
- **تطابق با بک‌اند:** معادل **Feature 8**, **Feature 9** در `feature-status-back-end.md`

#### سیر تکاملی و تاریخچه کامیت‌ها (Commit Evolution & Fixes)
1. **پیاده‌سازی در سرویس API:** `f171a38` (2026-06-08) و `3bb1669` / `2884c37` (2026-08-28):
   - توابع `getUserReservations()` و `cancelReservation(id)` در `reservationService.js` پیاده‌سازی شدند.
2. **پیاده‌سازی کامل رابط کاربری پورتال مراجعین (UI Implementation):** (2026-09-22):
   - ایجاد مدال اختصاصی `MyAppointmentsModal.jsx` با نمایش لیست تفکیک‌شده نوبت‌ها، تاریخ شمسی، ساعت، علت مراجعه و بج‌های ۵ گانه وضعیت.
   - تعبیه دکمه لغو نوبت برای نوبت‌های با وضعیت `pending` و `scheduled` همراه با دیالوگ تاییدیه و بازخورد آنی.
   - اضافه شدن دکمه «نوبت‌های من» در هدر دسکتاپ و منوی دراور موبایل برای دسترسی سریع بیمار.

#### فایل‌های درگیر در فرانت‌اند
- کامپوننت‌ها و چیدمان: `src/components/ui/MyAppointmentsModal.jsx`, `src/components/layout/Header.jsx`, `src/components/ui/AppointmentModal.jsx`, `src/App.jsx`
- سرویس شبکه: `src/api/reservationService.js`

#### مشخصات کامل قرارداد با بک‌اند (API Contract & Schemas)
- **دریافت لیست نوبت‌های خود کاربر:**
  - **متد و آدرس:** `GET /api/appointments/my/`
  - **دسترسی:** `Bearer <token>` (`IsAuthenticated`)
  - **پاسخ:** آرایه‌ای از نوبت‌های کاربر شامل وضعیت‌های `pending`, `scheduled`, `cancelled_user`, `cancelled_admin`, `visited`.
- **لغو نوبت توسط خود بیمار:**
  - **متد و آدرس:** `POST /api/appointments/<id>/cancel/`
  - **دسترسی:** `Bearer <token>` (`IsAuthenticated`)
  - **منطق بک‌اند:** بیمار می‌تواند نوبت خود را در هر دو وضعیت `scheduled` **یا `pending`** لغو کند. پس از لغو، اسلات زمانی نوبت بلافاصله برای دیگران آزاد می‌شود.

---

## ۴. جمع‌بندی وضعیت هماهنگی با تغییرات اخیر بک‌اند و اقدامات اولویت‌دار

پس از پیاده‌سازی کامل جریان تایید نوبت‌ها (Pending Approval Workflow) و پورتال مشاهده و لغو نوبت مراجعین، وضعیت هماهنگی با بک‌اند در بالاترین سطح قرار گرفته است:

1. **سیستم رزرواسیون بیمار (FE-08) و مدیریت ادمین (FE-09):** ✅ کاملاً هماهنگ و متصل شد (نمایش استاتوس pending، اینپوت علت مراجعه، اکشن‌های approve و disapprove و فیلترهای وضعیت).
2. **قابلیت مشاهده و لغو نوبت بیمار (FE-15):** ✅ با ایجاد کامپوننت `MyAppointmentsModal` و دکمه اختصاصی لغو در رابط کاربری پیاده و فعال شد.
3. **ادغام شاخه `refactor/frontend/17-front-end-auth-flow` در شاخه اصلی `develop`:** ثبت‌نام دو مرحله‌ای با `national_id` و تفکیک ورود ادمین را در شاخه اصلی نهایی خواهد کرد.
4. **پیاده‌سازی اندپوینت‌های تکمیلی در بک‌اند برای ماژول‌های آماده فرانت‌اند:**
   - ایجاد اندپوینت ذخیره تم کلینیک (`/api/settings/theme` و `/api/admin/settings/theme`).
   - ایجاد مدل و اندپوینت مدیریت ویدیوهای آموزشی (`/api/videos/` و `/api/admin/videos/`).
   - فعال‌سازی گیت‌وی سرویس FastAPI برای گفتگوی زنده تریاژ هوشمند (`/api/chat/message`).
