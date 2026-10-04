// src/pages/admin/AdminArticleEditor.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  ArrowRight,
  Save,
  Send,
  Loader2,
  HardDrive,
  WifiOff,
  CheckCircle2,
  AlertCircle,
  Video,
  Layers,
  Plus,
} from 'lucide-react';
import adminArticleService from '../../api/adminArticleService';
import articleService from '../../api/articleService';
import SimpleRichEditor from '../../components/admin/articles/SimpleRichEditor';
import CoverImageUploader from '../../components/admin/articles/CoverImageUploader';
import FileTextImporter from '../../components/admin/articles/FileTextImporter';
import CategoryManagerModal from '../../components/admin/articles/CategoryManagerModal';
import { useOfflineArticleSync } from '../../hooks/useOfflineArticleSync';

const generateSlug = (text) => {
  return text
    .trim()
    .toLowerCase()
    .replace(/[\s\u200c]+/g, '-')
    .replace(/[^\w\u0600-\u06FF\-]/g, '')
    .slice(0, 100);
};

const AdminArticleEditor = () => {
  const { id } = useParams();
  const isEditMode = Boolean(id);
  const navigate = useNavigate();

  const [loading, setLoading] = useState(isEditMode);
  const [submitting, setSubmitting] = useState(false);
  const [categories, setCategories] = useState([]);
  const [feedback, setFeedback] = useState(null);

  // Form State
  const [title, setTitle] = useState('');
  const [slug, setSlug] = useState('');
  const [category, setCategory] = useState('');
  const [excerpt, setExcerpt] = useState('');
  const [content, setContent] = useState('');
  const [coverImage, setCoverImage] = useState('');
  const [videoEmbedUrl, setVideoEmbedUrl] = useState('');
  const [isSlugManual, setIsSlugManual] = useState(false);
  const [categoryModalOpen, setCategoryModalOpen] = useState(false);

  // Offline Hook
  const {
    isOnline,
    saveOfflineDraft,
    getOfflineDraft,
    clearOfflineDraft,
  } = useOfflineArticleSync({
    onSyncSuccess: (msg) => {
      setFeedback({ type: 'success', text: msg });
    },
  });

  // Load Categories & Initial Data
  useEffect(() => {
    const fetchData = async () => {
      try {
        const cats = await articleService.getCategories();
        setCategories(cats || []);
        if (cats?.length > 0 && !category) {
          setCategory(cats[0].id);
        }

        if (isEditMode) {
          // Check local offline draft first if any
          const offlineDraft = getOfflineDraft(id);
          if (offlineDraft) {
            populateForm(offlineDraft);
            setFeedback({
              type: 'info',
              text: 'یک نسخه ذخیره‌شده آفلاین از این مقاله در سیستم شما بازخوانی شد.',
            });
          } else {
            const data = await adminArticleService.getArticleById(id);
            populateForm(data);
          }
        }
      } catch (err) {
        console.error('Error fetching article editor data:', err);
        setFeedback({
          type: 'error',
          text: 'خطا در بارگذاری اطلاعات مقاله از سرور.',
        });
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id, isEditMode]);

  const populateForm = (data) => {
    if (!data) return;
    setTitle(data.title || '');
    setSlug(data.slug || '');
    setCategory(data.category || data.category_detail?.id || 1);
    setExcerpt(data.excerpt || '');
    setContent(data.content || '');
    setCoverImage(data.cover_image || '');
    setVideoEmbedUrl(data.video_embed_url || '');
    setIsSlugManual(Boolean(data.slug));
  };

  const handleTitleChange = (e) => {
    const val = e.target.value;
    setTitle(val);
    if (!isSlugManual) {
      setSlug(generateSlug(val));
    }
  };

  const handleSubmit = async (targetStatus) => {
    if (!title.trim()) {
      setFeedback({ type: 'error', text: 'لطفاً عنوان مقاله را وارد کنید.' });
      return;
    }

    if (!content.trim()) {
      setFeedback({ type: 'error', text: 'محتوای مقاله نمی‌تواند خالی باشد.' });
      return;
    }

    setSubmitting(true);
    setFeedback(null);

    const cleanText = content.replace(/<[^>]*>/g, ' ').trim();
    const wordCount = cleanText ? cleanText.split(/\s+/).filter(Boolean).length : 0;
    const readingTime = Math.max(1, Math.ceil(wordCount / 180));

    const articlePayload = {
      title: title.trim(),
      slug: slug.trim() || generateSlug(title),
      category: Number(category) || 1,
      excerpt: excerpt.trim(),
      content,
      cover_image: coverImage,
      video_embed_url: videoEmbedUrl.trim(),
      status: targetStatus,
      reading_time_minutes: readingTime,
    };

    // If Offline: Save to disk and queue
    if (!isOnline) {
      const articleKey = isEditMode ? Number(id) : `new_${Date.now()}`;
      const offlineResult = saveOfflineDraft(
        articleKey,
        articlePayload,
        isEditMode ? 'update' : 'create'
      );

      setSubmitting(false);
      setFeedback({
        type: 'offline',
        text: offlineResult.message,
      });
      return;
    }

    // If Online: Submit to server
    try {
      if (isEditMode) {
        await adminArticleService.updateArticle(id, articlePayload);
        clearOfflineDraft(id);
        setFeedback({
          type: 'success',
          text: targetStatus === 'published' ? 'مقاله با موفقیت در سایت منتشر شد.' : 'پیش‌نویس با موفقیت ذخیره شد.',
        });
      } else {
        await adminArticleService.createArticle(articlePayload);
        setFeedback({
          type: 'success',
          text: targetStatus === 'published' ? 'مقاله جدید با موفقیت منتشر گردید.' : 'پیش‌نویس مقاله جدید با موفقیت ذخیره شد.',
        });
      }

      setTimeout(() => {
        navigate('/admin/articles');
      }, 1500);
    } catch (err) {
      console.error('Failed to save article to backend, saving offline:', err);
      // Fallback to offline saving
      const articleKey = isEditMode ? Number(id) : `new_${Date.now()}`;
      saveOfflineDraft(articleKey, articlePayload, isEditMode ? 'update' : 'create');
      setFeedback({
        type: 'offline',
        text: 'ارتباط با سرور برقرار نشد؛ مقاله با موفقیت در سیستم شما ذخیره گردید و پس از اتصال ارسال خواهد شد.',
      });
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="p-16 text-center flex flex-col items-center justify-center gap-3">
        <Loader2 className="w-8 h-8 text-primary animate-spin" />
        <p className="text-xs text-slate-500 font-medium">در حال بارگذاری فرم ویرایشگر...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-16">
      {/* Top Bar Navigation */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white/70 backdrop-blur-md p-5 rounded-3xl border border-primary/10 shadow-xs">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => navigate('/admin/articles')}
            className="p-2 rounded-xl text-slate-500 hover:text-primary hover:bg-primary/10 transition-colors cursor-pointer"
            title="بازگشت به لیست مقالات"
          >
            <ArrowRight className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-xl font-black text-slate-800">
              {isEditMode ? 'ویرایش مقاله پزشکی' : 'نگارش مقاله جدید'}
            </h1>
            <p className="text-xs text-slate-500 font-medium">
              تکمیل فرم با رعایت استانداردهای علمی، سئو و بهینه‌سازی خوانایی
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => handleSubmit('draft')}
            disabled={submitting}
            className="inline-flex items-center gap-2 px-4 py-2 text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition-all cursor-pointer"
          >
            <Save className="w-4 h-4" />
            ذخیره پیش‌نویس
          </button>

          <button
            type="button"
            onClick={() => handleSubmit('published')}
            disabled={submitting}
            className="inline-flex items-center gap-2 px-5 py-2 text-xs font-bold text-white bg-primary hover:bg-primary-dark rounded-xl shadow-md shadow-primary/20 transition-all cursor-pointer"
          >
            {submitting ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Send className="w-4 h-4" />
            )}
            انتشار در سایت
          </button>
        </div>
      </div>

      {/* Network / Offline Banner */}
      {!isOnline && (
        <div className="bg-amber-50 border border-amber-200 text-amber-800 px-4 py-3 rounded-2xl flex items-center gap-3 text-xs md:text-sm font-medium">
          <WifiOff className="w-5 h-5 text-amber-600 shrink-0" />
          <span>
            اینترنت شما قطع است. در صورت ثبت، مقاله بلافاصله در حافظه سیستم شما ذخیره شده و هیچ اطلاعاتی از دست نخواهد رفت.
          </span>
        </div>
      )}

      {/* Feedback Messages */}
      {feedback && (
        <div
          className={`px-4 py-3 rounded-2xl text-xs md:text-sm font-medium flex items-center gap-2 border animate-fadeIn ${
            feedback.type === 'success'
              ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
              : feedback.type === 'offline'
              ? 'bg-blue-50 text-blue-800 border-blue-200'
              : feedback.type === 'info'
              ? 'bg-purple-50 text-purple-800 border-purple-200'
              : 'bg-rose-50 text-rose-800 border-rose-200'
          }`}
        >
          {feedback.type === 'success' && <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />}
          {feedback.type === 'offline' && <HardDrive className="w-5 h-5 text-blue-600 shrink-0" />}
          {feedback.type === 'error' && <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />}
          <span>{feedback.text}</span>
        </div>
      )}

      {/* Form Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content Area (2 Cols) */}
        <div className="lg:col-span-2 space-y-6">
          {/* Title */}
          <div className="bg-white p-5 rounded-3xl border border-primary/10 shadow-xs space-y-2">
            <label className="block text-xs font-bold text-slate-700">
              عنوان مقاله <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              dir="auto"
              placeholder="مثال: راهنمای جامع مراقبت‌های بعد از ماموپلاستی"
              value={title}
              onChange={handleTitleChange}
              className="w-full text-sm md:text-base px-4 py-3 rounded-2xl border border-slate-200 focus:outline-none focus:border-primary text-slate-800 font-bold"
            />
          </div>

          {/* Excerpt */}
          <div className="bg-white p-5 rounded-3xl border border-primary/10 shadow-xs space-y-2">
            <label className="block text-xs font-bold text-slate-700">
              خلاصه مقاله (جهت سئو و نمایش در کارت‌های صفحه اصلی)
            </label>
            <textarea
              dir="auto"
              rows={3}
              placeholder="توضیح کوتاه و جذاب در ۲ الی ۳ خط که مخاطب را به مطالعه ادامه مطلب ترغیب نماید..."
              value={excerpt}
              onChange={(e) => setExcerpt(e.target.value)}
              className="w-full text-xs md:text-sm p-4 rounded-2xl border border-slate-200 focus:outline-none focus:border-primary text-slate-700 leading-relaxed font-medium"
            />
          </div>

          {/* Rich Editor & File Importer */}
          <div className="bg-white p-5 rounded-3xl border border-primary/10 shadow-xs space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <label className="block text-xs font-bold text-slate-700">
                متن کامل مقاله <span className="text-rose-500">*</span>
              </label>

              {/* File Importer Button */}
              <FileTextImporter
                onImport={(importedHtml) => {
                  setContent((prev) => (prev ? `${prev}<br/>${importedHtml}` : importedHtml));
                }}
              />
            </div>

            <SimpleRichEditor
              value={content}
              onChange={setContent}
              onUploadImage={adminArticleService.uploadImage}
            />
          </div>
        </div>

        {/* Sidebar Settings (1 Col) */}
        <div className="space-y-6">
          {/* Category & Slug */}
          <div className="bg-white p-5 rounded-3xl border border-primary/10 shadow-xs space-y-4">
            <h3 className="text-xs font-bold text-slate-700 flex items-center gap-1.5 border-b border-slate-100 pb-2">
              <Layers className="w-4 h-4 text-primary" />
              دسته‌بندی و آدرس URL
            </h3>

            {/* Category Select */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-bold text-slate-600">
                  دسته‌بندی موضوعی
                </label>
                <button
                  type="button"
                  onClick={() => setCategoryModalOpen(true)}
                  className="text-[11px] text-primary hover:underline font-bold inline-flex items-center gap-0.5 cursor-pointer"
                >
                  <Plus className="w-3 h-3" />
                  مدیریت و افزودن دسته
                </button>
              </div>

              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full text-xs px-3 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:border-primary bg-white text-slate-700 font-medium"
              >
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Slug */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-bold text-slate-600">نامک یکتا (Slug)</label>
                <button
                  type="button"
                  onClick={() => setIsSlugManual(!isSlugManual)}
                  className="text-[11px] text-primary hover:underline font-medium"
                >
                  {isSlugManual ? 'تولید خودکار' : 'تنظیم دستی'}
                </button>
              </div>
              <input
                type="text"
                dir="ltr"
                value={slug}
                onChange={(e) => {
                  setSlug(e.target.value);
                  setIsSlugManual(true);
                }}
                className="w-full text-xs px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:border-primary text-slate-700 font-mono bg-slate-50/50"
              />
            </div>
          </div>

          {/* Cover Image */}
          <div className="bg-white p-5 rounded-3xl border border-primary/10 shadow-xs space-y-3">
            <h3 className="text-xs font-bold text-slate-700 border-b border-slate-100 pb-2">
              تصویر شاخص مقاله
            </h3>
            <CoverImageUploader value={coverImage} onChange={setCoverImage} />
          </div>

          {/* Video Embed */}
          <div className="bg-white p-5 rounded-3xl border border-primary/10 shadow-xs space-y-3">
            <h3 className="text-xs font-bold text-slate-700 flex items-center gap-1.5 border-b border-slate-100 pb-2">
              <Video className="w-4 h-4 text-primary" />
              لینک یا کد امبد ویدیو (اختیاری)
            </h3>
            <p className="text-[11px] text-slate-400 font-medium">
              در صورت تمایل به نمایش ویدیوی آموزشی در ابتدای مقاله، لینک یا آی‌فریم آپارات/یوتیوب را درج فرمایید.
            </p>
            <input
              type="text"
              dir="ltr"
              placeholder="https://www.aparat.com/v/..."
              value={videoEmbedUrl}
              onChange={(e) => setVideoEmbedUrl(e.target.value)}
              className="w-full text-xs px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:border-primary text-slate-700 font-mono"
            />
          </div>
        </div>
      </div>

      {/* Category Manager Modal */}
      <CategoryManagerModal
        open={categoryModalOpen}
        onClose={async () => {
          setCategoryModalOpen(false);
          const updated = await adminArticleService.getCategories();
          setCategories(updated || []);
        }}
        onCategoryAdded={async (newCat) => {
          const updated = await adminArticleService.getCategories();
          setCategories(updated || []);
          if (newCat?.id) {
            setCategory(newCat.id);
          }
        }}
      />
    </div>
  );
};

export default AdminArticleEditor;
