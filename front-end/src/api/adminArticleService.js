// src/api/adminArticleService.js
import apiClient from '../lib/apiClient';

const ADMIN_ARTICLES_LOCAL_KEY = 'kamelion_admin_articles_cache_v1';

// Initial default articles for local development & fallback
const DEFAULT_INITIAL_ARTICLES = [
  {
    id: 1,
    title: 'راهنمای جامع خودآزمایی ماهانه پستان در منزل',
    slug: 'monthly-breast-self-exam-guide',
    excerpt: 'چگونگی لمس صحیح، زمان مناسب خودآزمایی در سیکل ماهانه و نشانه‌هایی که باید به آنها توجه کنید.',
    content: `<h2>اهمیت خودآزمایی منظم ماهانه</h2><p>تشخیص زودهنگام بیماری‌ها و تغییرات بافتی پستان، کلید موفقیت درمان است...</p>`,
    cover_image: 'https://images.unsplash.com/photo-1579684385127-1ef15d508118?auto=format&fit=crop&w=1200&q=80',
    video_embed_url: '',
    category: 1,
    category_detail: { id: 1, name: 'پیشگیری و غربالگری', slug: 'screening' },
    status: 'published',
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
    content: `<h2>ضایعات شایع بافت پستان</h2><p>بسیاری از توده‌هایی که در سینه لمس می‌شوند، کاملاً خوش‌خیم و بی‌خطر هستند...</p>`,
    cover_image: 'https://images.unsplash.com/photo-1584515979956-d9f6e5d09982?auto=format&fit=crop&w=1200&q=80',
    video_embed_url: '',
    category: 2,
    category_detail: { id: 2, name: 'بیماری‌های پستان', slug: 'breast-diseases' },
    status: 'published',
    reading_time_minutes: 7,
    views_count: 485,
    created_at: '2026-04-18T10:30:00Z',
    updated_at: '2026-04-20T14:15:00Z',
  },
  {
    id: 3,
    title: 'مراقبت‌های بعد از بیوپسی سوزنی پستان (پیش‌نویس)',
    slug: 'post-core-needle-biopsy-care',
    excerpt: 'اقدامات ۲۴ ساعت اول پس از نمونه‌برداری، کنترل درد و نشانه‌های طبیعی.',
    content: `<h2>اقدامات پس از نمونه‌برداری</h2><p>استفاده از کمپرس سرد و پرهیز از برداشتن اجسام سنگین به مدت ۴۸ ساعت الزامی است.</p>`,
    cover_image: '',
    video_embed_url: '',
    category: 4,
    category_detail: { id: 4, name: 'مراقبت‌ها و دانستنی‌ها', slug: 'post-op-care' },
    status: 'draft',
    reading_time_minutes: 3,
    views_count: 14,
    created_at: '2026-05-15T16:00:00Z',
    updated_at: '2026-05-15T16:45:00Z',
  },
];

const getLocalArticles = () => {
  try {
    const raw = localStorage.getItem(ADMIN_ARTICLES_LOCAL_KEY);
    if (!raw) {
      localStorage.setItem(ADMIN_ARTICLES_LOCAL_KEY, JSON.stringify(DEFAULT_INITIAL_ARTICLES));
      return [...DEFAULT_INITIAL_ARTICLES];
    }
    return JSON.parse(raw);
  } catch (err) {
    console.error('Failed to read local articles from storage:', err);
    return [...DEFAULT_INITIAL_ARTICLES];
  }
};

const saveLocalArticles = (articles) => {
  try {
    localStorage.setItem(ADMIN_ARTICLES_LOCAL_KEY, JSON.stringify(articles));
  } catch (err) {
    console.error('Failed to save articles to local storage:', err);
  }
};

export const adminArticleService = {
  /**
   * دریافت کل مقالات ادمین (پیش‌نویس‌ها و منتشرشده‌ها)
   * GET /api/admin/articles/
   */
  getArticles: async ({ status = '', search = '' } = {}) => {
    try {
      const params = {};
      if (status && status !== 'all') params.status = status;
      if (search) params.search = search;

      const response = await apiClient.get('/admin/articles/', { params });
      if (Array.isArray(response.data)) return response.data;
      if (Array.isArray(response.data?.results)) return response.data.results;
      return [];
    } catch (err) {
      console.warn('Backend /admin/articles/ offline, reading from local fallback storage:', err?.message);
      let list = getLocalArticles();
      if (status && status !== 'all') {
        list = list.filter((a) => a.status === status);
      }
      if (search) {
        const q = search.trim().toLowerCase();
        list = list.filter(
          (a) => a.title.toLowerCase().includes(q) || a.excerpt?.toLowerCase().includes(q)
        );
      }
      return list;
    }
  },

  /**
   * دریافت جزییات یک مقاله برای ادیتور ادمین
   * GET /api/admin/articles/<id>/
   */
  getArticleById: async (id) => {
    try {
      const response = await apiClient.get(`/admin/articles/${id}/`);
      return response.data;
    } catch (err) {
      console.warn(`Backend /admin/articles/${id}/ offline, fetching from local storage:`, err?.message);
      const list = getLocalArticles();
      const found = list.find((a) => String(a.id) === String(id));
      if (found) return found;
      throw err;
    }
  },

  /**
   * ثبت مقاله جدید
   * POST /api/admin/articles/
   */
  createArticle: async (articleData) => {
    try {
      const response = await apiClient.post('/admin/articles/', articleData);
      return response.data;
    } catch (err) {
      console.warn('Backend /admin/articles/ offline, saving new article locally:', err?.message);
      const list = getLocalArticles();
      const newArticle = {
        ...articleData,
        id: Date.now(),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        views_count: 0,
      };
      list.unshift(newArticle);
      saveLocalArticles(list);
      return newArticle;
    }
  },

  /**
   * ویرایش مقاله
   * PUT/PATCH /api/admin/articles/<id>/
   */
  updateArticle: async (id, articleData) => {
    try {
      const response = await apiClient.patch(`/admin/articles/${id}/`, articleData);
      return response.data;
    } catch (err) {
      console.warn(`Backend /admin/articles/${id}/ offline, updating locally:`, err?.message);
      const list = getLocalArticles();
      const index = list.findIndex((a) => String(a.id) === String(id));
      if (index !== -1) {
        list[index] = {
          ...list[index],
          ...articleData,
          updated_at: new Date().toISOString(),
        };
        saveLocalArticles(list);
        return list[index];
      }
      throw err;
    }
  },

  /**
   * تغییر وضعیت سریع بین draft و published
   * PATCH /api/admin/articles/<id>/toggle-status/
   */
  toggleStatus: async (id) => {
    try {
      const response = await apiClient.patch(`/admin/articles/${id}/toggle-status/`);
      return response.data;
    } catch (err) {
      console.warn(`Backend /admin/articles/${id}/toggle-status/ offline, toggling locally:`, err?.message);
      const list = getLocalArticles();
      const item = list.find((a) => String(a.id) === String(id));
      if (item) {
        item.status = item.status === 'published' ? 'draft' : 'published';
        item.updated_at = new Date().toISOString();
        saveLocalArticles(list);
        return item;
      }
      throw err;
    }
  },

  /**
   * حذف مقاله
   * DELETE /api/admin/articles/<id>/
   */
  deleteArticle: async (id) => {
    try {
      const response = await apiClient.delete(`/admin/articles/${id}/`);
      return response.data;
    } catch (err) {
      console.warn(`Backend /admin/articles/${id}/ offline, deleting locally:`, err?.message);
      let list = getLocalArticles();
      list = list.filter((a) => String(a.id) !== String(id));
      saveLocalArticles(list);
      return { success: true };
    }
  },

  /**
   * آپلود تصویر در سرور
   * POST /api/admin/articles/upload-image/
   */
  uploadImage: async (file) => {
    const formData = new FormData();
    formData.append('image', file);

    try {
      const response = await apiClient.post('/admin/articles/upload-image/', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      return response.data; // { url: '...' }
    } catch (err) {
      console.warn('Backend image upload offline, creating local object URL:', err?.message);
      // Create local object URL for preview during development/offline
      return {
        url: URL.createObjectURL(file),
        offline: true,
        message: 'تصویر به صورت موقت در سیستم ذخیره شد.',
      };
    }
  },

  /**
   * دریافت لیست دسته‌بندی‌ها
   * GET /api/admin/articles/categories/
   */
  getCategories: async () => {
    const CATEGORIES_KEY = 'kamelion_article_categories_cache';
    const DEFAULT_CATS = [
      { id: 1, name: 'پیشگیری و غربالگری', slug: 'screening' },
      { id: 2, name: 'بیماری‌های پستان', slug: 'breast-diseases' },
      { id: 3, name: 'جراحی‌های زیبایی و درمانی', slug: 'surgeries' },
      { id: 4, name: 'مراقبت‌ها و دانستنی‌ها', slug: 'post-op-care' },
    ];

    try {
      const response = await apiClient.get('/admin/articles/categories/');
      const results = Array.isArray(response.data)
        ? response.data
        : response.data?.results || DEFAULT_CATS;
      localStorage.setItem(CATEGORIES_KEY, JSON.stringify(results));
      return results;
    } catch (err) {
      console.warn('Backend categories offline, reading from local cache:', err?.message);
      const raw = localStorage.getItem(CATEGORIES_KEY);
      if (raw) {
        try {
          return JSON.parse(raw);
        } catch {
          // fallback
        }
      }
      localStorage.setItem(CATEGORIES_KEY, JSON.stringify(DEFAULT_CATS));
      return DEFAULT_CATS;
    }
  },

  /**
   * ایجاد دسته‌بندی جدید
   * POST /api/admin/articles/categories/
   */
  createCategory: async (categoryData) => {
    const CATEGORIES_KEY = 'kamelion_article_categories_cache';
    try {
      const response = await apiClient.post('/admin/articles/categories/', categoryData);
      // update local cache as well
      const raw = localStorage.getItem(CATEGORIES_KEY);
      const list = raw ? JSON.parse(raw) : [];
      list.push(response.data);
      localStorage.setItem(CATEGORIES_KEY, JSON.stringify(list));
      return response.data;
    } catch (err) {
      console.warn('Backend /admin/articles/categories/ offline, creating category locally:', err?.message);
      const raw = localStorage.getItem(CATEGORIES_KEY);
      const list = raw ? JSON.parse(raw) : [];
      const newCat = {
        id: Date.now(),
        name: categoryData.name,
        slug: categoryData.slug || categoryData.name.trim().toLowerCase().replace(/[\s\u200c]+/g, '-'),
        description: categoryData.description || '',
      };
      list.push(newCat);
      localStorage.setItem(CATEGORIES_KEY, JSON.stringify(list));
      return newCat;
    }
  },

  /**
   * حذف دسته‌بندی
   * DELETE /api/admin/articles/categories/<id>/
   */
  deleteCategory: async (id) => {
    const CATEGORIES_KEY = 'kamelion_article_categories_cache';
    try {
      const response = await apiClient.delete(`/admin/articles/categories/${id}/`);
      const raw = localStorage.getItem(CATEGORIES_KEY);
      if (raw) {
        const list = JSON.parse(raw).filter((c) => String(c.id) !== String(id));
        localStorage.setItem(CATEGORIES_KEY, JSON.stringify(list));
      }
      return response.data;
    } catch (err) {
      console.warn(`Backend delete category ${id} offline, deleting locally:`, err?.message);
      const raw = localStorage.getItem(CATEGORIES_KEY);
      if (raw) {
        const list = JSON.parse(raw).filter((c) => String(c.id) !== String(id));
        localStorage.setItem(CATEGORIES_KEY, JSON.stringify(list));
      }
      return { success: true };
    }
  },
};

export default adminArticleService;
