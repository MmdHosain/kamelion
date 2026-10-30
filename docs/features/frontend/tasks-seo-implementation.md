# مستند جامع تسک‌های اجرایی سئو فرانت‌اند — کلینیک کملین
## Frontend SEO Implementation Tasks & Actionable Roadmap (`front-end`)

> **ماژول:** سئو، متادیتا و داده‌های ساختاریافته فرانت‌اند (Search Engine Optimization & Structured Data)  
> **مخاطب:** تیم توسعه فرانت‌اند (`front-end`)  
> **فناوری‌های مرتبط:** React 19.2, React Router v7, Vite, JSON-LD Schema.org, Semantic HTML5  
> **وضعیت:** 📋 آماده پیاده‌سازی و ارزیابی (Spec-Driven Development)

---

## ۱. نقشه راه و ماتریس صفحات فرانت‌اند (SEO Route Matrix)

| مسیر صفحه (Route) | کامپوننت مبدا | عنوان پیشنهادی (`<title>`) | نوع اسکیما (`@type`) | کلیدهای اصلی متادیتا و هدف |
| :--- | :--- | :--- | :--- | :--- |
| `/` | [`HomePage.jsx`](file:///e:/GitHub%20Repo/kamelion/front-end/src/pages/HomePage.jsx) | دکتر نگار معشوری — کلینیک تخصصی بیماری‌ها و جراحی پستان | `MedicalClinic`<br>`LocalBusiness` | نام برند، ساعات کاری، شماره تماس، آدرس مطب، پزشک ارشد |
| `/about` | [`AboutPage.jsx`](file:///e:/GitHub%20Repo/kamelion/front-end/src/pages/AboutPage.jsx) | بیوگرافی و سوابق علمی دکتر نگار معشوری \| جراح پستان | `Physician`<br>`Person` | شماره نظام پزشکی، فلوشیپ پستان و انکوپلاستی، مدارک علمی |
| `/services/therapeutic` | [`TherapeuticServicesPage.jsx`](file:///e:/GitHub%20Repo/kamelion/front-end/src/pages/TherapeuticServicesPage.jsx) | خدمات درمانی و انکوپلاستی پستان \| دکتر معشوری | `MedicalProcedure`<br>`MedicalCondition` | جراحی حفظ پستان، تخلیه توده‌های بدخیم و خوش‌خیم، انکوپلاستی |
| `/services/aesthetic` | [`AestheticServicesPage.jsx`](file:///e:/GitHub%20Repo/kamelion/front-end/src/pages/AestheticServicesPage.jsx) | جراحی‌های زیبایی و بازسازی پستان \| ماموپلاستی و پروتز | `MedicalProcedure` | ماموپلاستی، ماستوپکسی (لیفت)، پروتز پستان، تزریق چربی |
| `/faq` | [`FaqPage.jsx`](file:///e:/GitHub%20Repo/kamelion/front-end/src/pages/FaqPage.jsx) | پرسش‌های متداول بیماران درباره بیماری‌ها و جراحی پستان | `FAQPage` | ۵ سوال محوری پزشکی، پاسخ‌های تخصصی جهت ریچ‌اسنیپت گوگل |
| `/resources` | [`ResourcesPage.jsx`](file:///e:/GitHub%20Repo/kamelion/front-end/src/pages/ResourcesPage.jsx) | مقالات آموزشی و راهنمای خودآزمایی ماهانه پستان | `CollectionPage` | آرشیو مقالات، دسته‌بندی‌های پزشکی، نکات پیشگیری |
| `/resources/:slug` | [`ArticleDetailPage.jsx`](file:///e:/GitHub%20Repo/kamelion/front-end/src/pages/ArticleDetailPage.jsx) | `{article.title} \| دکتر نگار معشوری` | `MedicalWebPage`<br>`Article` | کاور، خلاصه، نویسنده پزشک، کلینیک ناشر، تاریخ انتشار |
| `/videos` | [`VideoPage.jsx`](file:///e:/GitHub%20Repo/kamelion/front-end/src/pages/VideoPage.jsx) | گالری ویدیوهای جراحی و توضیحات تخصصی بالینی | `VideoGallery`<br>`VideoObject` | ویدیوهای آموزشی، توضیحات دکتر معشوری درباره اقدامات درمانی |

---

## ۲. ملاحظات معماری React 19 (Native Metadata Hoisting)

> [!NOTE]  
> طبق پکیج [`front-end/package.json`](file:///e:/GitHub%20Repo/kamelion/front-end/package.json)، نسخه ری‌اکت پروژه **`"react": "^19.2.0"`** است.  
> در **React 19**، تگ‌های `<title>`، `<meta>` و `<link>` به صورت نیتیو و استاندارد درون کامپوننت‌ها پشتیبانی شده و خود ری‌اکت به صورت خودکار آن‌ها را به بخش `<head>` سند اصلی منتقل (Hoist) می‌کند.  
> این مزیت بزرگ باعث می‌شود بدون وابستگی به پکیج‌های شخص ثالث (مانند `react-helmet-async` که ممکن است در npm خطای peer-dependency با React 19 بدهد)، یک کامپوننت مستقل و سبک در `src/components/seo/SEO.jsx` بسازیم.

---

## ۳. چک‌لیست تسک‌های اجرایی فرانت‌اند (Actionable Tasks)

### 📌 تسک FE-SEO-01: اصلاح فایل ریشه سند HTML (`index.html`)
- [x] **فایل هدف:** [`front-end/index.html`](file:///e:/GitHub%20Repo/kamelion/front-end/index.html)
- [x] **اقدامات اجرایی:**
  1. تغییر مقدار `lang="en"` به `lang="fa" dir="rtl"` در تگ `<html>`.
  2. درج متاتگ توضیحات پیش‌فرض کلینیک به عنوان Fallback:
     ```html
     <meta name="description" content="کلینیک تخصصی پستان دکتر نگار معشوری — ارائه خدمات تشخیصی، جراحی‌های انکوپلاستی و درمانی، ماموپلاستی و غربالگری بیماری‌های پستان." />
     ```
  3. افزودن تگ‌های پایه ربات‌ها:
     ```html
     <meta name="robots" content="index, follow" />
     ```
  4. افزودن `link rel="canonical"` عمومی به دامنه اصلی `https://drnegarmashoori.ir`.

---

### 📌 تسک FE-SEO-02: ساخت کامپوننت ماژولار سئو (`src/components/seo/SEO.jsx`)
- [x] **فایل جدید:** `front-end/src/components/seo/SEO.jsx` (مطابق اصل تفکیک فایل‌ها و Anti-Bloat)
- [x] **پراپ‌های ورودی (Props):**
  - `title` (رشته: عنوان صفحه)
  - `description` (رشته: خلاصه متن برای متای توضیحات)
  - `url` (رشته اختیاری: آدرس صفحه)
  - `image` (رشته اختیاری: آدرس تصویر شاخص برای شبکه‌های اجتماعی)
  - `type` (رشته: نوع محتوا، پیش‌فرض `'website'` یا `'article'`)
  - `schema` (آبجکت JSON اختیاری: جهت تزریق به عنوان `application/ld+json`)
  - `noindex` (بولی: پیش‌فرض `false`، برای صفحات خطا یا خصوصی)
- [x] **کد استاندارد کامپوننت:**
  ```jsx
  // src/components/seo/SEO.jsx
  import React from 'react';

  const DEFAULT_TITLE = 'کلینیک تخصصی پستان دکتر نگار معشوری';
  const DEFAULT_DESCRIPTION = 'ارائه خدمات تخصصی جراحی پستان، انکوپلاستی، غربالگری و درمان بیماری‌های خوش‌خیم و بدخیم پستان توسط دکتر نگار معشوری.';
  export const SITE_URL = (import.meta.env.VITE_SITE_URL || 'https://drnegarmashoori.ir').replace(/\/+$/, '');
  const DEFAULT_IMAGE = `${SITE_URL}/pink-ribbon.svg`;

  const SEO = ({
    title,
    description = DEFAULT_DESCRIPTION,
    url,
    image = DEFAULT_IMAGE,
    type = 'website',
    schema = null,
    noindex = false,
  }) => {
    const fullTitle = title ? `${title} | ${DEFAULT_TITLE}` : DEFAULT_TITLE;
    const currentUrl = url ? `${SITE_URL}${url}` : (typeof window !== 'undefined' ? window.location.href : SITE_URL);

    return (
      <>
        {/* Document Head Tags (Hoisted by React 19) */}
        <title>{fullTitle}</title>
        <meta name="description" content={description} />
        <link rel="canonical" href={currentUrl} />

        {noindex ? (
          <meta name="robots" content="noindex, nofollow" />
        ) : (
          <meta name="robots" content="index, follow" />
        )}

        {/* Open Graph Tags */}
        <meta property="og:site_name" content={DEFAULT_TITLE} />
        <meta property="og:type" content={type} />
        <meta property="og:url" content={currentUrl} />
        <meta property="og:title" content={fullTitle} />
        <meta property="og:description" content={description} />
        <meta property="og:image" content={image} />

        {/* Twitter Card Tags */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={fullTitle} />
        <meta name="twitter:description" content={description} />
        <meta name="twitter:image" content={image} />

        {/* Structured Data (JSON-LD) */}
        {schema && (
          <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
          />
        )}
      </>
    );
  };

  export default SEO;
  ```

---

### 📌 تسک FE-SEO-03: تجهیز صفحه اصلی کلینیک (`HomePage.jsx`)
- [x] **فایل هدف:** [`front-end/src/pages/HomePage.jsx`](file:///e:/GitHub%20Repo/kamelion/front-end/src/pages/HomePage.jsx)
- [x] **تزریق کامپوننت `SEO` با اسکیمای درمانگاه پزشکی:**
  ```jsx
  const homeSchema = {
    "@context": "https://schema.org",
    "@type": "MedicalClinic",
    "name": "کلینیک تخصصی پستان دکتر نگار معشوری",
    "url": "https://drnegarmashoori.ir",
    "logo": "https://drnegarmashoori.ir/pink-ribbon.svg",
    "image": "https://drnegarmashoori.ir/pink-ribbon.svg",
    "telephone": "+98-21-00000000",
    "medicalSpecialty": ["SurgicalOncology", "PlasticSurgery"],
    "availableService": [
      { "@type": "MedicalProcedure", "name": "جراحی انکوپلاستی پستان" },
      { "@type": "MedicalProcedure", "name": "ماموپلاستی و بازسازی پستان" },
      { "@type": "MedicalProcedure", "name": "غربالگری و سونوگرافی پستان" }
    ],
    "physician": {
      "@type": "Physician",
      "name": "دکتر نگار معشوری",
      "medicalSpecialty": "فلوشیپ فوق‌تخصصی بیماری‌ها و جراحی پستان"
    }
  };
  ```

---

### 📌 تسک FE-SEO-04: تجهیز صفحه درباره پزشک (`AboutPage.jsx`)
- [x] **فایل هدف:** [`front-end/src/pages/AboutPage.jsx`](file:///e:/GitHub%20Repo/kamelion/front-end/src/pages/AboutPage.jsx)
- [x] **تزریق کامپوننت `SEO` با تایتل دقیق و اسکیمای `Physician`:**
  - تایتل: `بیوگرافی و سوابق علمی دکتر نگار معشوری | جراح پستان و انکوپلاستی`
  - اسکیما حاوی مدارک تحصیلی، فلوشیپ تخصصی و اطلاعات رزومه بالینی پزشک.

---

### 📌 تسک FE-SEO-05: تجهیز صفحات خدمات درمانی و زیبایی
- [x] **فایل‌های هدف:**
  - [`front-end/src/pages/TherapeuticServicesPage.jsx`](file:///e:/GitHub%20Repo/kamelion/front-end/src/pages/TherapeuticServicesPage.jsx)
  - [`front-end/src/pages/AestheticServicesPage.jsx`](file:///e:/GitHub%20Repo/kamelion/front-end/src/pages/AestheticServicesPage.jsx)
- [x] **اقدامات اجرایی:**
  - ایجاد متاتگ‌های هدفمند شامل کلمات کلیدی بیماران (مانند جراحی حفظ پستان، درمان سرطان پستان، ماموپلاستی، لیفت پستان).
  - قرار دادن تگ کانونیکال مجزا برای هر کدام:
    - `/services/therapeutic`
    - `/services/aesthetic`

---

### 📌 تسک FE-SEO-06: تجهیز صفحه سوالات متداول با Rich Snippet (`FaqPage.jsx`)
- [x] **فایل هدف:** [`front-end/src/pages/FaqPage.jsx`](file:///e:/GitHub%20Repo/kamelion/front-end/src/pages/FaqPage.jsx)
- [x] **تزریق اسکیمای `FAQPage`:**
  گوگل این اسکیما را به عنوان ریچ‌اسنیپت کرکره‌ای مستقیماً در نتایج سرچ نمایش می‌دهد:
  ```json
  {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": [
      {
        "@type": "Question",
        "name": "ماموگرافی بهتر است یا سونوگرافی؟",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "ماموگرافی و سونوگرافی روش‌های مکمل یکدیگر در تشخیص توده‌ها و ناهنجاری‌های بافت پستان هستند..."
        }
      }
    ]
  }
  ```

---

### 📌 تسک FE-SEO-07: ارتقای صفحه جزئیات مقاله (`ArticleDetailPage.jsx`)
- [x] **فایل هدف:** [`front-end/src/pages/ArticleDetailPage.jsx`](file:///e:/GitHub%20Repo/kamelion/front-end/src/pages/ArticleDetailPage.jsx)
- [x] **اقدامات اجرایی:**
  1. در هنگام بارگذاری موفق مقاله:
     - تایتل: `{article.title}`
     - توضیحات: `article.excerpt`
     - عکس کاور: `formatMediaUrl(article.cover_image)`
     - کانونیکال: `/resources/${article.slug}`
     - نوع: `article`
  2. تزریق اسکیمای کامل `MedicalWebPage`:
     - فیلد `author`: آبجکت پزشک با نام دکتر نگار معشوری.
     - فیلد `publisher`: کلینیک تخصصی دکتر معشوری.
     - فیلد `datePublished`: `article.published_at`
     - فیلد `dateModified`: `article.updated_at`
  3. در صورت خطای ۴۰۴ یا نبود مقاله:
     - فعال‌سازی `noindex={true}` تا صفحات خطای SPA در گوگل ایندکس نشوند.

---

### 📌 تسک FE-SEO-08: یکپارچه‌سازی روت‌ها و مهار Duplicate Content در `App.jsx`
- [x] **فایل هدف:** [`front-end/src/App.jsx`](file:///e:/GitHub%20Repo/kamelion/front-end/src/App.jsx)
- [x] **اقدام اصلاحی:**
  در حال حاضر روت‌های `/resources/:slug` و `/articles/:slug` هر دو کامپوننت یکسانی را رندر می‌کنند:
  ```jsx
  // قبل:
  <Route path="/resources/:slug" element={<ArticleDetailPage ... />} />
  <Route path="/articles/:slug" element={<ArticleDetailPage ... />} />

  // بعد (اصلاح شده با ریدایرکت برای سئو):
  <Route path="/resources/:slug" element={<ArticleDetailPage ... />} />
  <Route path="/articles/:slug" element={<Navigate to="/resources/:slug" replace />} />
  <Route path="/video" element={<Navigate to="/videos" replace />} />
  <Route path="/videos" element={<VideoPage />} />
  ```

---

### 📌 تسک FE-SEO-09: بهبود تگ‌های معنایی و دسترسی‌پذیری (Semantic HTML & Accessibility)
- [x] **فایل‌ها:** [`ArticleCard.jsx`](file:///e:/GitHub%20Repo/kamelion/front-end/src/components/articles/ArticleCard.jsx) و کامپوننت‌های عمومی
- [x] **اقدامات:**
  - اطمینان از اینکه هر صفحه تنها یک تگ `<h1>` معتبر دارد.
  - درج متن `alt` معنادار و سئو-محور برای تصاویر (مثال: `alt="دکتر نگار معشوری - جراحی حفظ پستان"` به جای مقادیر خالی یا نام فایل).
  - استفاده از صفت `loading="lazy"` روی عکس‌های درون لیست‌ها و کارت‌ها.

---

---

### 📌 تسک FE-SEO-11: تزریق اسکیمای `SoftwareApplication` برای چت‌بات در گراف دانش
- [x] **فایل هدف:** [`front-end/src/pages/HomePage.jsx`](file:///e:/GitHub%20Repo/kamelion/front-end/src/pages/HomePage.jsx)
- [x] **اقدامات اجرایی:**
  - ساختاردهی اسکیما در قالب `@graph` جهت اتصال ۳ نود کلیدی: درمانگاه (`MedicalClinic`)، پزشک ارشد (`Physician`) و نرم‌افزار هوش مصنوعی (`SoftwareApplication`).
  - تعریف دستیار هوشمند با دسته‌بندی `HealthApplication` و انتساب به پزشک کلینیک (`author: Physician`) جهت جلوگیری از مشکل «Closed Box AI» در گوگل.

---

### 📌 تسک FE-SEO-12: سلب مسئولیت پزشکی و شفاف‌سازی چت‌بات (YMYL & E-E-A-T)
- [x] **فایل‌های هدف:**
  - [`front-end/src/components/chat/FloatingChatWidget.jsx`](file:///e:/GitHub%20Repo/kamelion/front-end/src/components/chat/FloatingChatWidget.jsx)
  - [`front-end/src/components/chat/ChatContainer.jsx`](file:///e:/GitHub%20Repo/kamelion/front-end/src/components/chat/ChatContainer.jsx)
- [x] **اقدام اجرایی:**
  - درج متن سلب مسئولیت شفاف، رسمی و ایندکس‌پذیر زیر اینپوت چت‌بات تریاژ جهت اعلام ماهیت راهنمایی اولیه و جلوگیری از ریسک‌های اعتباری در الگوریتم‌های سلامت گوگل.

---

### 📌 تسک FE-SEO-13: تقویت صفحه درباره ما با تاییدیه نظام پزشکی و نظارت بالینی هوش مصنوعی
- [x] **فایل هدف:** [`front-end/src/pages/AboutPage.jsx`](file:///e:/GitHub%20Repo/kamelion/front-end/src/pages/AboutPage.jsx)
- [x] **اقدامات اجرایی:**
  - درج بج معتبر نظام پزشکی در بالای صفحه بیوگرافی.
  - افزودن فیلدهای `alumniOf` و آرایه `sameAs` به اسکیمای `Physician`.
  - ایجاد بخش مجزا برای «سامانه هوشمند تریاژ و نظارت بالینی» جهت تشریح تدوین و بازبینی دوره‌ای سناریوها توسط دکتر نگار معشوری.

---

### 📌 تسک FE-SEO-14: نشان تایید بالینی و CTA هوشمند در مقالات (Chatbot-to-Content Flywheel)
- [x] **فایل‌های هدف:**
  - [`front-end/src/pages/ArticleDetailPage.jsx`](file:///e:/GitHub%20Repo/kamelion/front-end/src/pages/ArticleDetailPage.jsx)
  - [`front-end/src/App.jsx`](file:///e:/GitHub%20Repo/kamelion/front-end/src/App.jsx)
- [x] **اقدامات اجرایی:**
  - افزودن نشان دیداری رسمی «بررسی و تایید بالینی توسط دکتر نگار معشوری» در سربرگ مقاله.
  - اضافه کردن کارت CTA تعاملی «گفت‌وگو با دستیار هوشمند تریاژ پیرامون این موضوع» به همراه اتصال پراپ `onOpenChat`.

---

### 📌 تسک FE-SEO-10: آزمون‌های نهایی، ابزارهای گوگل و Lighthouse
- [x] **تست سلامت بیلد Vite:** اجرای `npm run build` و تولید موفقیت‌آمیز چانک‌های پروداکشن بدون هیچ‌گونه خطا (`built in 20.07s`).
- [ ] **تست ریچ‌اسنیپت گوگل:** بررسی لینک مقالات و سوالات متداول در [Google Rich Results Test](https://search.google.com/test/rich-results) پس از دیپلوی سرور.
- [ ] **بررسی تگ‌های Open Graph:** بررسی لینک در ابزار [Telegram Web Page Bot](https://t.me/webpagebot) یا [Facebook Sharing Debugger](https://developers.facebook.com/tools/debug/) پس از اعمال پروکسی Nginx توسط بک‌اند.
- [ ] **تست Lighthouse:** اجرای بازرسی Lighthouse در تب DevTools کروم و تایید امتیاز سئو بالای ۹۵.
- [x] **همگام‌سازی مستندات:** به‌روزرسانی مستند [`docs/features/feature-status-front-end.md`](file:///e:/GitHub%20Repo/kamelion/docs/features/feature-status-front-end.md).
