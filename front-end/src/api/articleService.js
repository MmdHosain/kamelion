// src/api/articleService.js
import apiClient from '../lib/apiClient';

// Rich fallback articles for offline / disconnected development
const FALLBACK_CATEGORIES = [
  { id: 1, name: 'پیشگیری و غربالگری', slug: 'screening' },
  { id: 2, name: 'بیماری‌های پستان', slug: 'breast-diseases' },
  { id: 3, name: 'جراحی‌های زیبایی و درمانی', slug: 'surgeries' },
  { id: 4, name: 'مراقبت‌ها و دانستنی‌ها', slug: 'post-op-care' },
];

const FALLBACK_ARTICLES = [
  {
    id: 1,
    title: 'راهنمای جامع خودآزمایی ماهانه پستان در منزل',
    slug: 'monthly-breast-self-exam-guide',
    excerpt: 'چگونگی لمس صحیح، زمان مناسب خودآزمایی در سیکل ماهانه و نشانه‌هایی که باید به آنها توجه کنید.',
    content: `
      <h2>اهمیت خودآزمایی منظم ماهانه</h2>
      <p>تشخیص زودهنگام بیماری‌ها و تغییرات بافتی پستان، کلید موفقیت درمان و تضمین سلامت بانوان است. خودآزمایی ماهانه یکی از ساده‌ترین و مؤثرترین روش‌ها برای آشنایی با وضعیت طبیعی بدن و کشف سریع هرگونه تغییر مشکوک است.</p>
      
      <h2>بهترین زمان انجام معاینه</h2>
      <p>بهترین زمان برای خودآزمایی ماهانه، ۲ الی ۳ روز پس از پایان دوره خونریزی قاعدگی است؛ زیرا در این بازه زمانی، بافت سینه کمترین میزان احتقان و حساسیت به هورمون‌ها را دارد. بانوانی که یائسه شده‌اند یا باردار هستند، می‌توانند یک روز مشخص در هر ماه (مثلاً روز اول هر ماه) را برای این کار تعیین نمایند.</p>
      
      <h2>مراحل گام به گام معاینه در منزل</h2>
      <p>معاینه شامل دو بخش اصلی مشاهده و لمس دقیق است:</p>
      <ul>
        <li><strong>مشاهده در برابر آینه:</strong> دست‌ها را در پهلو قرار داده و به تقارن، پوست، وضعیت نوک سینه‌ها و عدم وجود فرورفتگی دقت کنید. سپس دست‌ها را به بالای سر برده و مجدداً ارزیابی کنید.</li>
        <li><strong>لمس در حالت خوابیده یا زیر دوش:</strong> با استفاده از بند انگشتان میانی و حرکات دایره‌ای کوچک از محیط سینه به سمت مرکز و زیربغل، بافت را لمس کنید.</li>
      </ul>

      <blockquote>
        در صورت لمس هرگونه توده، فرورفتگی پوستی یا ترشح غیرعادی نوک سینه، بدون نگرانی و اضطراب بی‌مورد در اولین فرصت برای معاینه بالینی مراجعه فرمایید.
      </blockquote>
    `,
    cover_image: 'https://images.unsplash.com/photo-1579684385127-1ef15d508118?auto=format&fit=crop&w=1200&q=80',
    video_embed_url: '',
    category: { id: 1, name: 'پیشگیری و غربالگری', slug: 'screening' },
    author: {
      id: 1,
      full_name: 'دکتر نگار معشوری',
      medical_degree: 'جراح متخصص پستان و انکوپلاستی',
    },
    author_name: 'دکتر نگار معشوری',
    reading_time_minutes: 5,
    views_count: 312,
    created_at: '2026-05-10T12:00:00Z',
    updated_at: '2026-05-12T09:30:00Z',
  },
  {
    id: 2,
    title: 'تفاوت‌های کیست، فیبروآدنوم و توده‌های بدخیم',
    slug: 'breast-cysts-vs-fibroadenoma-vs-tumors',
    excerpt: 'آشنایی با انواع ضایعات خوش‌خیم و بدخیم پستان، روش‌های تشخیص قطعی با سونوگرافی و پروتکل درمان.',
    content: `
      <h2>ضایعات شایع بافت پستان</h2>
      <p>بسیاری از توده‌هایی که در سینه لمس می‌شوند، کاملاً خوش‌خیم و بی‌خطر هستند. شایع‌ترین این توده‌ها کیست‌های ساده و فیبروآدنوم‌ها هستند که خصوصاً در سنین جوانی و باروری بسیار شایع می‌باشند.</p>

      <h2>کیست‌های ساده (Cysts) چیستند؟</h2>
      <p>کیست‌ها کیسه‌های پر از مایع هستند که تحت تأثیر تغییرات هورمونی ماهانه ممکن است بزرگ یا حساس شوند. این کیست‌ها با یک سونوگرافی ساده به آسانی تشخیص داده شده و خطری برای تبدیل به بدخیمی ندارند.</p>

      <h2>فیبروآدنوم (Fibroadenoma)</h2>
      <p>توده‌های توپر، متحرک و بدون دردی هستند که از رشد بافت غددی و همبند ناشی می‌شوند. در اغلب موارد تنها پایش سونوگرافیک دوره‌ای برای آن‌ها کفایت می‌کند.</p>

      <h2>چه زمانی بررسی تکمیلی لازم است؟</h2>
      <p>توده‌های سفت، غیرمتحرک، با لبه‌های نامنظم یا همراه با تغییرات پوستی نیازمند نمونه‌برداری سوزنی (بیوپسی) و بررسی توسط جراح متخصص هستند.</p>
    `,
    cover_image: 'https://images.unsplash.com/photo-1584515979956-d9f6e5d09982?auto=format&fit=crop&w=1200&q=80',
    video_embed_url: '',
    category: { id: 2, name: 'بیماری‌های پستان', slug: 'breast-diseases' },
    author: {
      id: 1,
      full_name: 'دکتر نگار معشوری',
      medical_degree: 'جراح متخصص پستان و انکوپلاستی',
    },
    author_name: 'دکتر نگار معشوری',
    reading_time_minutes: 7,
    views_count: 485,
    created_at: '2026-04-18T10:30:00Z',
    updated_at: '2026-04-20T14:15:00Z',
  },
  {
    id: 3,
    title: 'مراقبت‌های ضروری قبل و بعد از جراحی ماموپلاستی و انکوپلاستی',
    slug: 'post-op-mammoplasty-oncoplasty-care',
    excerpt: 'نکات کلیدی برای دوره نقاهت آسان، تغذیه مناسب، استفاده از سوتین طبی و کاهش ورم پس از عمل.',
    content: `
      <h2>دوره نقاهت پس از جراحی‌های پستان</h2>
      <p>جراحی‌های ماموپلاستی درمانی و زیبایی و تکنیک‌های انکوپلاستی نیازمند رعایت دقیق دستورالعمل‌های پس از عمل هستند تا شکل ظاهری ایده‌آل و ترمیم بدون عارضه حاصل گردد.</p>

      <h2>استفاده مداوم از سوتین طبی</h2>
      <p>سوتین مخصوص فشاری (Compression Bra) باید به مدت ۶ تا ۸ هفته به طور ۲۴ ساعته (به جز هنگام حمام رفتن کوتاه) پوشیده شود تا از ایجاد هماتوم و تورم جلوگیری کرده و فرم پستان تثبیت شود.</p>

      <h2>مراقبت از درن‌ها و پانسمان</h2>
      <p>تخلیه منظم مایع ترشحی درن‌ها و یادداشت حجم روزانه آن تا زمان کشیدن درن‌ها توسط پزشک ضروری است. از تماس آب با محل زخم تا زمان تایید پزشک خودداری کنید.</p>
    `,
    cover_image: 'https://images.unsplash.com/photo-1516549655169-df83a0774514?auto=format&fit=crop&w=1200&q=80',
    video_embed_url: '',
    category: { id: 3, name: 'جراحی‌های زیبایی و درمانی', slug: 'surgeries' },
    author: {
      id: 1,
      full_name: 'دکتر نگار معشوری',
      medical_degree: 'جراح متخصص پستان و انکوپلاستی',
    },
    author_name: 'دکتر نگار معشوری',
    reading_time_minutes: 6,
    views_count: 590,
    created_at: '2026-03-25T08:00:00Z',
    updated_at: '2026-03-28T11:00:00Z',
  },
  {
    id: 4,
    title: 'تغذیه و سبک زندگی در پیشگیری از بیماری‌های پستان',
    slug: 'diet-and-lifestyle-breast-health',
    excerpt: 'نقش ورزش، وزن متناسب، رژیم غذایی سرشار از آنتی‌اکسیدان‌ها و مدیریت استرس در سلامت پستان.',
    content: `
      <h2>تأثیر شیوه زندگی بر سلامت سلولی</h2>
      <p>مطالعات علمی اثبات کرده‌اند که انتخاب‌های روزمره در تغذیه و تحرک بدنی می‌توانند ریسک ابتلا به بیماری‌های بدخیم را به طور چشمگیری کاهش دهند.</p>

      <h2>توصیه‌های کلیدی تغذیه‌ای</h2>
      <ul>
        <li>مصرف روزانه سبزیجات خانواده کلم، بروکلی و سبزیجات با برگ سبز تیره</li>
        <li>کاهش مصرف چربی‌های اشباع، قندهای ساده و گوشت‌های فرآوری‌شده</li>
        <li>افزایش مصرف فیبرهای محلول و آنتی‌اکسیدان‌های طبیعی نظیر توت‌ها و چای سبز</li>
        <li>حفظ فعالیت بدنی منظم حداقل ۱۵۰ دقیقه در هفته با شدت متوسط</li>
      </ul>
    `,
    cover_image: 'https://images.unsplash.com/photo-1498837167922-ddd27525d352?auto=format&fit=crop&w=1200&q=80',
    video_embed_url: '',
    category: { id: 4, name: 'مراقبت‌ها و دانستنی‌ها', slug: 'post-op-care' },
    author: {
      id: 1,
      full_name: 'دکتر نگار معشوری',
      medical_degree: 'جراح متخصص پستان و انکوپلاستی',
    },
    author_name: 'دکتر نگار معشوری',
    reading_time_minutes: 4,
    views_count: 240,
    created_at: '2026-02-14T15:20:00Z',
    updated_at: '2026-02-15T10:00:00Z',
  },
];

export const articleService = {
  /**
   * دریافت لیست مقالات منتشرشده همراه با فیلتر دسته‌بندی و جستجو
   * GET /api/articles/
   */
  getArticles: async ({ category = '', search = '', page = 1 } = {}) => {
    try {
      const params = {};
      if (category && category !== 'all') params.category = category;
      if (search) params.search = search;
      if (page) params.page = page;

      const response = await apiClient.get('/articles/', { params });
      return response.data;
    } catch (err) {
      console.warn('Backend /articles/ unavailable, serving local fallback data:', err?.message);
      
      // Local fallback filtering
      let filtered = [...FALLBACK_ARTICLES];
      if (category && category !== 'all') {
        filtered = filtered.filter(
          (a) => a.category?.slug === category || a.category?.name === category
        );
      }
      if (search) {
        const query = search.trim().toLowerCase();
        filtered = filtered.filter(
          (a) =>
            a.title.toLowerCase().includes(query) ||
            a.excerpt.toLowerCase().includes(query)
        );
      }

      return {
        count: filtered.length,
        next: null,
        previous: null,
        results: filtered,
      };
    }
  },

  /**
   * دریافت جزییات یک مقاله منتشرشده بر اساس slug
   * GET /api/articles/<slug>/
   */
  getArticleBySlug: async (slug) => {
    try {
      const response = await apiClient.get(`/articles/${encodeURIComponent(slug)}/`);
      return response.data;
    } catch (err) {
      console.warn(`Backend /articles/${slug}/ unavailable, checking fallback:`, err?.message);
      const found = FALLBACK_ARTICLES.find(
        (a) => a.slug === slug || String(a.id) === String(slug)
      );
      if (found) {
        return {
          ...found,
          views_count: (found.views_count || 100) + 1,
        };
      }
      throw err;
    }
  },

  /**
   * دریافت لیست دسته‌بندی‌های مقالات
   * GET /api/articles/categories/
   */
  getCategories: async () => {
    const CATEGORIES_KEY = 'kamelion_article_categories_cache';
    try {
      const response = await apiClient.get('/articles/categories/');
      if (Array.isArray(response.data)) return response.data;
      if (Array.isArray(response.data?.results)) return response.data.results;
      return FALLBACK_CATEGORIES;
    } catch (err) {
      console.warn('Backend /articles/categories/ unavailable, using fallback categories:', err?.message);
      const raw = localStorage.getItem(CATEGORIES_KEY);
      if (raw) {
        try {
          return JSON.parse(raw);
        } catch {
          // fallback
        }
      }
      return FALLBACK_CATEGORIES;
    }
  },
};

export default articleService;
