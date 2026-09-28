import React, { useEffect, useState, useMemo } from 'react';
import {
  MessageSquare,
  Star,
  Trash2,
  CheckCircle2,
  XCircle,
  Loader2,
  Search,
  Clock,
  Filter,
  X,
} from 'lucide-react';
import { useCommentsStore } from '../../store/commentsStore';
import ToastNotification from '../../components/ui/ToastNotification';

const AdminComments = () => {
  const {
    adminComments,
    comments,
    deleteComment,
    toggleApprove,
    fetchAdminComments,
    isAdminLoading,
    isLoading,
  } = useCommentsStore();

  const [activeFilter, setActiveFilter] = useState('all'); // 'all' | 'pending' | 'approved'
  const [searchQuery, setSearchQuery] = useState('');
  const [actionLoadingId, setActionLoadingId] = useState(null);
  const [toast, setToast] = useState(null);

  const rawComments = adminComments?.length > 0 ? adminComments : comments;
  const loading = isAdminLoading || isLoading;

  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(() => setToast(null), 4000);
    return () => clearTimeout(timer);
  }, [toast]);

  useEffect(() => {
    fetchAdminComments();
  }, [fetchAdminComments]);

  // Counts for tabs
  const pendingCount = useMemo(
    () => rawComments.filter((c) => c.approved === false).length,
    [rawComments]
  );
  const approvedCount = useMemo(
    () => rawComments.filter((c) => c.approved === true).length,
    [rawComments]
  );

  // Filtered comments based on active tab and search query
  const filteredComments = useMemo(() => {
    return rawComments.filter((comment) => {
      // 1. Status Filter
      if (activeFilter === 'pending' && comment.approved !== false) return false;
      if (activeFilter === 'approved' && comment.approved !== true) return false;

      // 2. Search Query Filter
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const matchesName = comment.name?.toLowerCase().includes(query);
        const matchesEmail = comment.email?.toLowerCase().includes(query);
        const matchesText = comment.text?.toLowerCase().includes(query);
        if (!matchesName && !matchesEmail && !matchesText) return false;
      }

      return true;
    });
  }, [rawComments, activeFilter, searchQuery]);

  const handleToggle = async (id) => {
    setActionLoadingId(id);
    const target = rawComments.find((c) => c.id === id);
    const willApprove = target ? !target.approved : false;
    try {
      await toggleApprove(id);
      setToast({
        type: 'success',
        message: willApprove
          ? 'دیدگاه با موفقیت تایید و در سایت منتشر شد.'
          : 'انتشار دیدگاه در سایت لغو گردید.',
      });
    } catch {
      setToast({
        type: 'error',
        message: 'خطا در برقراری ارتباط با سرور. وضعیت دیدگاه تغییر نیافت.',
      });
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('آیا از حذف این دیدگاه اطمینان دارید؟ این عمل غیرقابل بازگشت است.')) {
      setActionLoadingId(id);
      try {
        await deleteComment(id);
        setToast({
          type: 'success',
          message: 'دیدگاه با موفقیت حذف گردید.',
        });
      } catch {
        setToast({
          type: 'error',
          message: 'خطا در حذف دیدگاه از سرور. دیدگاه بازگردانده شد.',
        });
      } finally {
        setActionLoadingId(null);
      }
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="border-b border-primary/20 pb-4 flex flex-col sm:flex-row justify-between sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-black text-primary flex items-center gap-2.5">
            <MessageSquare className="w-7 h-7" />
            مدیریت نظرات و دیدگاه‌های مراجعین
          </h1>
          <p className="text-sm text-textDark/70 mt-1 font-medium">
            بررسی و تایید دیدگاه‌های جدید کاربران جهت انتشار در سایت و نظارت بر تجربیات مراجعین.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="bg-primary/10 border border-primary/25 px-4 py-2 rounded-2xl text-primary font-bold text-sm flex items-center gap-2 self-start sm:self-auto">
            {loading && <Loader2 className="w-4 h-4 animate-spin text-primary" />}
            <span>کل دیدگاه‌ها: {rawComments.length}</span>
          </div>
        </div>
      </div>

      {/* Filter Tabs & Search Bar */}
      <div className="bg-white/80 backdrop-blur-md p-4 rounded-3xl border border-primary/20 shadow-sm flex flex-col md:flex-row gap-4 items-stretch md:items-center justify-between">
        {/* Tabs */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 md:pb-0 scrollbar-none">
          <button
            onClick={() => setActiveFilter('all')}
            className={`px-4 py-2 rounded-2xl text-xs md:text-sm font-bold transition-all flex items-center gap-2 cursor-pointer shrink-0 ${
              activeFilter === 'all'
                ? 'bg-primary text-white shadow-md shadow-primary/30'
                : 'bg-white/90 text-textDark/70 hover:bg-white hover:text-textDark border border-primary/15'
            }`}
          >
            <span>همه</span>
            <span
              className={`px-2 py-0.5 rounded-full text-xs ${
                activeFilter === 'all' ? 'bg-white/25 text-white' : 'bg-primary/10 text-primary'
              }`}
            >
              {rawComments.length}
            </span>
          </button>

          <button
            onClick={() => setActiveFilter('pending')}
            className={`px-4 py-2 rounded-2xl text-xs md:text-sm font-bold transition-all flex items-center gap-2 cursor-pointer shrink-0 ${
              activeFilter === 'pending'
                ? 'bg-amber-500 text-white shadow-md shadow-amber-500/30'
                : 'bg-white/90 text-textDark/70 hover:bg-white hover:text-textDark border border-primary/15'
            }`}
          >
            <Clock className="w-3.5 h-3.5" />
            <span>در انتظار تایید</span>
            {pendingCount > 0 && (
              <span
                className={`px-2 py-0.5 rounded-full text-xs font-black ${
                  activeFilter === 'pending'
                    ? 'bg-white/25 text-white'
                    : 'bg-amber-500/15 text-amber-700'
                }`}
              >
                {pendingCount}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveFilter('approved')}
            className={`px-4 py-2 rounded-2xl text-xs md:text-sm font-bold transition-all flex items-center gap-2 cursor-pointer shrink-0 ${
              activeFilter === 'approved'
                ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/30'
                : 'bg-white/90 text-textDark/70 hover:bg-white hover:text-textDark border border-primary/15'
            }`}
          >
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>منتشر شده</span>
            <span
              className={`px-2 py-0.5 rounded-full text-xs ${
                activeFilter === 'approved'
                  ? 'bg-white/25 text-white'
                  : 'bg-emerald-500/15 text-emerald-700'
              }`}
            >
              {approvedCount}
            </span>
          </button>
        </div>

        {/* Live Search */}
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 absolute right-3.5 top-1/2 -translate-y-1/2 text-textDark/40" />
          <input
            type="text"
            placeholder="جستجو بر اساس نام، ایمیل یا متن دیدگاه..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pr-10 pl-9 py-2 text-xs md:text-sm bg-white border border-primary/20 rounded-2xl text-textDark placeholder-textDark/40 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-textDark/40 hover:text-textDark p-1 cursor-pointer"
              title="پاک کردن جستجو"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Content List */}
      {rawComments.length === 0 ? (
        <div className="text-center py-20 bg-white/60 rounded-3xl border border-dashed border-primary/25">
          <MessageSquare className="w-12 h-12 text-primary/30 mx-auto mb-3" />
          <p className="text-textDark/70 font-bold text-base">هنوز هیچ دیدگاهی ثبت نشده است.</p>
          <p className="text-textDark/50 text-xs mt-1">دیدگاه‌های ثبت شده توسط کاربران در این بخش نمایش داده خواهند شد.</p>
        </div>
      ) : filteredComments.length === 0 ? (
        <div className="text-center py-16 bg-white/60 rounded-3xl border border-dashed border-primary/25">
          <Filter className="w-10 h-10 text-primary/30 mx-auto mb-2" />
          <p className="text-textDark/70 font-bold text-sm">هیچ دیدگاهی با فیلترهای انتخابی یافت نشد.</p>
          <button
            onClick={() => {
              setActiveFilter('all');
              setSearchQuery('');
            }}
            className="mt-3 text-xs text-primary font-bold underline cursor-pointer hover:opacity-80"
          >
            حذف فیلترها و مشاهده همه
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {filteredComments.map((comment) => {
            const isApproved = comment.approved === true;
            const isBusy = actionLoadingId === comment.id;

            return (
              <div
                key={comment.id}
                className={`p-5 md:p-6 rounded-3xl border transition-all duration-300 flex flex-col md:flex-row justify-between items-start md:items-center gap-5 ${
                  isApproved
                    ? 'bg-white/90 border-emerald-500/20 shadow-sm hover:shadow-md'
                    : 'bg-amber-50/40 border-amber-300/60 shadow-sm hover:shadow-md'
                }`}
              >
                {/* Left side: Review Information */}
                <div className="flex-1 space-y-3 w-full">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-primary to-primary-dark text-white font-bold flex items-center justify-center text-sm shadow-md shadow-primary/20 shrink-0">
                        {comment.avatar || (comment.name ? comment.name.charAt(0) : 'ک')}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="font-bold text-textDark text-sm md:text-base">
                            {comment.name}
                          </h3>
                          {/* Badge */}
                          {isApproved ? (
                            <span className="inline-flex items-center gap-1 text-[11px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200/70 px-2 py-0.5 rounded-full">
                              <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                              منتشر شده در سایت
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 text-[11px] font-bold bg-amber-100 text-amber-800 border border-amber-200/70 px-2 py-0.5 rounded-full">
                              <Clock className="w-3 h-3 text-amber-600" />
                              در انتظار تایید مدیریت
                            </span>
                          )}
                        </div>

                        <div className="flex items-center gap-2 text-xs text-textDark/50 mt-0.5">
                          <span>{comment.date}</span>
                          {comment.email && <span>• {comment.email}</span>}
                        </div>
                      </div>
                    </div>

                    {/* Star Rating */}
                    <div className="flex items-center text-amber-500 bg-amber-50/80 px-2.5 py-1 rounded-xl border border-amber-200/40">
                      {[...Array(comment.rating || 5)].map((_, i) => (
                        <Star key={i} className="w-3.5 h-3.5 fill-current" />
                      ))}
                      <span className="text-xs font-bold text-amber-700 mr-1.5">
                        {comment.rating || 5} از ۵
                      </span>
                    </div>
                  </div>

                  {/* Comment Text */}
                  <p className="text-sm text-textDark/90 leading-relaxed font-medium bg-white/60 p-3.5 rounded-2xl border border-primary/10">
                    «{comment.text}»
                  </p>
                </div>

                {/* Right side: Actions */}
                <div className="flex items-center gap-2 shrink-0 self-end md:self-center pt-2 md:pt-0 border-t md:border-t-0 border-primary/10 w-full md:w-auto justify-end">
                  {/* Approve / Unpublish Button */}
                  <button
                    onClick={() => handleToggle(comment.id)}
                    disabled={isBusy}
                    className={`px-4 py-2.5 rounded-2xl text-xs md:text-sm font-bold flex items-center gap-2 transition-all cursor-pointer shadow-sm disabled:opacity-60 disabled:cursor-not-allowed ${
                      isApproved
                        ? 'bg-amber-100 text-amber-800 hover:bg-amber-200 hover:shadow-md'
                        : 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-emerald-600/30 hover:shadow-md'
                    }`}
                  >
                    {isBusy ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : isApproved ? (
                      <>
                        <XCircle className="w-4 h-4 text-amber-700" />
                        <span>لغو انتشار</span>
                      </>
                    ) : (
                      <>
                        <CheckCircle2 className="w-4 h-4 text-white" />
                        <span>تایید و انتشار</span>
                      </>
                    )}
                  </button>

                  {/* Delete Button */}
                  <button
                    onClick={() => handleDelete(comment.id)}
                    disabled={isBusy}
                    className="p-2.5 rounded-2xl text-rose-500 hover:bg-rose-50 hover:text-rose-700 transition-all border border-rose-200/50 cursor-pointer disabled:opacity-60"
                    title="حذف دیدگاه"
                    aria-label="حذف دیدگاه"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
      {/* ================= FLOATING TOAST NOTIFICATION ================= */}
      <ToastNotification toast={toast} onClose={() => setToast(null)} />
    </div>
  );
};

export default AdminComments;
