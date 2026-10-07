// src/pages/admin/AdminArticles.jsx
import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Plus,
  Search,
  Edit,
  Trash2,
  Eye,
  Calendar,
  ToggleLeft,
  ToggleRight,
  WifiOff,
  Wifi,
  Loader2,
  FileText,
  AlertTriangle,
  Layers,
} from 'lucide-react';
import adminArticleService from '../../api/adminArticleService';
import ArticleStatusBadge from '../../components/admin/articles/ArticleStatusBadge';
import CategoryManagerModal from '../../components/admin/articles/CategoryManagerModal';
import { useOfflineArticleSync } from '../../hooks/useOfflineArticleSync';

const AdminArticles = () => {
  const navigate = useNavigate();
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all'); // all | published | draft
  const [deleteConfirmId, setDeleteConfirmId] = useState(null);
  const [actionLoadingId, setActionLoadingId] = useState(null);
  const [bannerNotice, setBannerNotice] = useState(null);
  const [categoryModalOpen, setCategoryModalOpen] = useState(false);

  const { isOnline, isSyncing } = useOfflineArticleSync({
    onSyncSuccess: (msg) => {
      setBannerNotice({ type: 'success', text: msg });
      loadArticles();
    },
    onSyncError: (msg) => {
      setBannerNotice({ type: 'error', text: msg });
    },
  });

  const loadArticles = async () => {
    setLoading(true);
    try {
      const data = await adminArticleService.getArticles({
        status: statusFilter,
        search: searchQuery,
      });
      setArticles(data || []);
    } catch (err) {
      console.error('Failed to load articles:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadArticles();
  }, [statusFilter]);

  // Debounced search
  useEffect(() => {
    const timer = setTimeout(() => {
      loadArticles();
    }, 300);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  const handleToggleStatus = async (id) => {
    setActionLoadingId(id);
    try {
      await adminArticleService.toggleStatus(id);
      await loadArticles();
      setBannerNotice({
        type: 'success',
        text: 'وضعیت انتشار مقاله با موفقیت تغییر یافت.',
      });
      setTimeout(() => setBannerNotice(null), 3000);
    } catch (err) {
      console.error('Failed to toggle status:', err);
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleDelete = async (id) => {
    setActionLoadingId(id);
    try {
      await adminArticleService.deleteArticle(id);
      setDeleteConfirmId(null);
      await loadArticles();
      setBannerNotice({
        type: 'success',
        text: 'مقاله مورد نظر با موفقیت حذف شد.',
      });
      setTimeout(() => setBannerNotice(null), 3000);
    } catch (err) {
      console.error('Failed to delete article:', err);
    } finally {
      setActionLoadingId(null);
    }
  };

  const filteredArticles = useMemo(() => {
    return articles;
  }, [articles]);

  return (
    <div className="space-y-6">
      {/* Top Banner Notice for Network or Actions */}
      {!isOnline && (
        <div className="bg-amber-50 border border-amber-200 text-amber-800 px-4 py-3 rounded-2xl flex items-center gap-3 text-sm font-medium animate-fadeIn">
          <WifiOff className="w-5 h-5 text-amber-600 shrink-0" />
          <span>
            ارتباط اینترنت شما قطع است. سیستم در وضعیت آفلاین قرار دارد؛ هرگونه تغییر یا مقاله جدید در دیسک سیستم شما ذخیره شده و پس از اتصال به صورت خودکار به سرور منتقل خواهد شد.
          </span>
        </div>
      )}

      {bannerNotice && (
        <div
          className={`px-4 py-3 rounded-2xl text-sm font-medium flex items-center justify-between border animate-fadeIn ${
            bannerNotice.type === 'success'
              ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
              : 'bg-rose-50 text-rose-800 border-rose-200'
          }`}
        >
          <span>{bannerNotice.text}</span>
          <button
            onClick={() => setBannerNotice(null)}
            className="text-xs font-bold underline cursor-pointer"
          >
            بستن
          </button>
        </div>
      )}

      {/* Header and Action */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white/70 backdrop-blur-md p-6 rounded-3xl border border-primary/10 shadow-xs">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h1 className="text-xl md:text-2xl font-black text-slate-800">
              مدیریت مقالات و آموزش پزشکی
            </h1>
            {isSyncing ? (
              <span className="flex items-center gap-1 text-xs text-primary font-bold bg-primary/10 px-2.5 py-1 rounded-full animate-pulse">
                <Loader2 className="w-3 h-3 animate-spin" />
                در حال همگام‌سازی...
              </span>
            ) : isOnline ? (
              <span className="flex items-center gap-1 text-xs text-emerald-600 font-bold bg-emerald-50 px-2 py-0.5 rounded-full">
                <Wifi className="w-3 h-3" /> آنلاین
              </span>
            ) : null}
          </div>
          <p className="text-xs md:text-sm text-slate-500 font-medium">
            تألیف، ویرایش و انتشار مقالات تخصصی سلامت و پیشگیری برای مراجعین کلینیک
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => setCategoryModalOpen(true)}
            className="inline-flex items-center justify-center gap-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 px-4 py-2.5 rounded-2xl font-bold text-xs md:text-sm transition-all shrink-0 cursor-pointer"
          >
            <Layers className="w-4 h-4 text-primary" />
            مدیریت دسته‌بندی‌ها
          </button>

          <button
            onClick={() => navigate('/admin/articles/new')}
            className="inline-flex items-center justify-center gap-2 bg-primary hover:bg-primary-dark text-white px-5 py-2.5 rounded-2xl font-bold text-sm shadow-md shadow-primary/20 transition-all hover:scale-102 shrink-0 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            نوشتن مقاله جدید
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-white/60 p-4 rounded-2xl border border-primary/10">
        {/* Status Tabs */}
        <div className="flex items-center gap-1 bg-slate-100/80 p-1 rounded-xl w-full sm:w-auto">
          <button
            onClick={() => setStatusFilter('all')}
            className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all ${
              statusFilter === 'all'
                ? 'bg-white text-primary shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            همه مقالات
          </button>
          <button
            onClick={() => setStatusFilter('published')}
            className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all ${
              statusFilter === 'published'
                ? 'bg-white text-emerald-700 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            منتشرشده‌ها
          </button>
          <button
            onClick={() => setStatusFilter('draft')}
            className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all ${
              statusFilter === 'draft'
                ? 'bg-white text-amber-700 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            پیش‌نویس‌ها
          </button>
        </div>

        {/* Live Search */}
        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            placeholder="جستجو در عنوان یا متن مقاله..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-3 pr-9 py-2 text-xs bg-white border border-slate-200 rounded-xl focus:outline-none focus:border-primary text-slate-700 placeholder:text-slate-400 font-medium"
          />
        </div>
      </div>

      {/* Articles Table */}
      <div className="bg-white rounded-3xl border border-primary/10 shadow-xs overflow-hidden">
        {loading ? (
          <div className="p-12 text-center flex flex-col items-center justify-center gap-3">
            <Loader2 className="w-8 h-8 text-primary animate-spin" />
            <p className="text-xs text-slate-500 font-medium">در حال دریافت مقالات...</p>
          </div>
        ) : filteredArticles.length === 0 ? (
          <div className="p-12 text-center flex flex-col items-center justify-center gap-3">
            <div className="w-16 h-16 rounded-3xl bg-slate-100 flex items-center justify-center text-slate-400 mb-2">
              <FileText className="w-8 h-8" />
            </div>
            <h3 className="text-base font-bold text-slate-700">هیچ مقاله‌ای یافت نشد</h3>
            <p className="text-xs text-slate-400 max-w-sm font-medium">
              هنوز مقاله‌ای با این مشخصات ثبت نشده است. می‌توانید با کلیک روی دکمه «نوشتن مقاله جدید»، اولین مطلب را منتشر کنید.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-right border-collapse">
              <thead>
                <tr className="bg-slate-50/80 border-b border-slate-100 text-xs text-slate-500 font-bold">
                  <th className="py-4 px-5">تصویر</th>
                  <th className="py-4 px-5">عنوان مقاله</th>
                  <th className="py-4 px-5">دسته‌بندی</th>
                  <th className="py-4 px-5">وضعیت</th>
                  <th className="py-4 px-5">بازدید</th>
                  <th className="py-4 px-5">تاریخ ثبت</th>
                  <th className="py-4 px-5 text-center">عملیات</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-sm">
                {filteredArticles.map((article) => (
                  <tr
                    key={article.id}
                    className="hover:bg-slate-50/60 transition-colors group"
                  >
                    {/* Thumbnail */}
                    <td className="py-3 px-5">
                      <div className="w-14 h-10 rounded-xl overflow-hidden bg-slate-100 border border-slate-200 shrink-0">
                        {article.cover_image ? (
                          <img
                            src={article.cover_image}
                            alt=""
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-slate-300">
                            <FileText className="w-4 h-4" />
                          </div>
                        )}
                      </div>
                    </td>

                    {/* Title */}
                    <td className="py-3 px-5 max-w-xs">
                      <div className="font-bold text-slate-800 group-hover:text-primary transition-colors line-clamp-1">
                        {article.title}
                      </div>
                      <div className="text-xs text-slate-400 line-clamp-1 mt-0.5">
                        {article.excerpt || 'بدون خلاصه'}
                      </div>
                    </td>

                    {/* Category */}
                    <td className="py-3 px-5">
                      <span className="text-xs text-slate-600 bg-slate-100 px-2.5 py-1 rounded-lg font-medium">
                        {article.category_detail?.name || article.category?.name || 'عمومی'}
                      </span>
                    </td>

                    {/* Status */}
                    <td className="py-3 px-5">
                      <ArticleStatusBadge status={article.status} />
                    </td>

                    {/* Views */}
                    <td className="py-3 px-5 text-xs text-slate-600 font-medium">
                      <div className="flex items-center gap-1">
                        <Eye className="w-3.5 h-3.5 text-slate-400" />
                        {article.views_count || 0}
                      </div>
                    </td>

                    {/* Date */}
                    <td className="py-3 px-5 text-xs text-slate-500 font-medium">
                      <div className="flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5 text-slate-400" />
                        {new Date(article.created_at).toLocaleDateString('fa-IR')}
                      </div>
                    </td>

                    {/* Actions */}
                    <td className="py-3 px-5 text-center">
                      <div className="flex items-center justify-center gap-1">
                        {/* Toggle Status */}
                        <button
                          type="button"
                          onClick={() => handleToggleStatus(article.id)}
                          disabled={actionLoadingId === article.id}
                          title={
                            article.status === 'published'
                              ? 'تبدیل به پیش‌نویس'
                              : 'انتشار در سایت'
                          }
                          className="p-1.5 rounded-lg text-slate-500 hover:text-primary hover:bg-primary/10 transition-colors"
                        >
                          {article.status === 'published' ? (
                            <ToggleRight className="w-5 h-5 text-emerald-600" />
                          ) : (
                            <ToggleLeft className="w-5 h-5 text-slate-400" />
                          )}
                        </button>

                        {/* Edit */}
                        <button
                          type="button"
                          onClick={() => navigate(`/admin/articles/${article.id}/edit`)}
                          title="ویرایش مقاله"
                          className="p-1.5 rounded-lg text-slate-500 hover:text-blue-600 hover:bg-blue-50 transition-colors"
                        >
                          <Edit className="w-4 h-4" />
                        </button>

                        {/* Delete */}
                        <button
                          type="button"
                          onClick={() => setDeleteConfirmId(article.id)}
                          title="حذف مقاله"
                          className="p-1.5 rounded-lg text-slate-500 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      {deleteConfirmId && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 max-w-sm w-full border border-rose-100 shadow-2xl animate-scaleIn text-center">
            <div className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center mx-auto mb-4">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-slate-800 mb-2">حذف مقاله</h3>
            <p className="text-xs text-slate-500 font-medium mb-6 leading-relaxed">
              آیا از حذف این مقاله اطمینان دارید؟ این عمل غیرقابل بازگشت خواهد بود.
            </p>
            <div className="flex items-center justify-center gap-3">
              <button
                type="button"
                onClick={() => setDeleteConfirmId(null)}
                className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
              >
                انصراف
              </button>
              <button
                type="button"
                onClick={() => handleDelete(deleteConfirmId)}
                disabled={actionLoadingId === deleteConfirmId}
                className="px-5 py-2 text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 rounded-xl shadow-md transition-colors"
              >
                {actionLoadingId === deleteConfirmId ? 'در حال حذف...' : 'بله، حذف شود'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Category Manager Modal */}
      <CategoryManagerModal
        open={categoryModalOpen}
        onClose={() => setCategoryModalOpen(false)}
        onCategoryAdded={() => {
          loadArticles();
        }}
      />
    </div>
  );
};

export default AdminArticles;
