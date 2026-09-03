import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import {
  Star,
  Send,
  CheckCircle2,
  AlertCircle,
  MessageSquareHeart,
  MessagesSquare,
  X,
  Search,
  MessageCircle,
  Loader2,
} from 'lucide-react';
import { useCommentsStore } from '../../store/commentsStore';

const ReviewsSection = () => {
  const { comments, addComment, fetchPublicComments } = useCommentsStore();
  const [formData, setFormData] = useState({ name: '', email: '', text: '', rating: 5 });
  const [toast, setToast] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRating, setSelectedRating] = useState('all');

  const approvedComments = comments.filter((c) => c.approved !== false);

  // Fetch live reviews from backend on mount
  useEffect(() => {
    fetchPublicComments();
  }, [fetchPublicComments]);

  // Auto-dismiss toast after 6 seconds
  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(() => {
      setToast(null);
    }, 6000);
    return () => clearTimeout(timer);
  }, [toast]);

  // Close modal on ESC key and prevent body scroll
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        setIsModalOpen(false);
      }
    };

    if (isModalOpen) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleKeyDown);
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.body.style.overflow = 'unset';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isModalOpen]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.text.trim() || isSubmitting) return;

    setIsSubmitting(true);
    try {
      await addComment(formData);
      setFormData({ name: '', email: '', text: '', rating: 5 });
      setToast({
        type: 'success',
        message:
          'نظر شما با موفقیت ثبت شد و پس از بررسی و تایید مدیریت در سایت نمایش داده خواهد شد. با تشکر از همراهی شما!',
      });
    } catch (err) {
      setToast({
        type: 'error',
        message:
          err?.response?.data?.detail ||
          'متأسفانه در ثبت نظر مشکلی پیش آمد. لطفاً مجدداً تلاش نمایید.',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Filtered comments for modal
  const filteredComments = approvedComments.filter((c) => {
    const matchesSearch =
      c.text.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesRating =
      selectedRating === 'all' || Number(c.rating || 5) === Number(selectedRating);
    return matchesSearch && matchesRating;
  });

  // Calculate average rating
  const avgRating = approvedComments.length
    ? (
        approvedComments.reduce((acc, c) => acc + (c.rating || 5), 0) /
        approvedComments.length
      ).toFixed(1)
    : '5.0';

  return (
    <section id="reviews" className="glass-panel fade-section">
      <div className="text-xs md:text-sm text-primary font-bold tracking-wider mb-1.5 uppercase">
        نظرات مراجعین
      </div>
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
        <div>
          <h2 className="text-2xl md:text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-l from-primary to-primary-dark">
            تجربه بیماران و همراهان
          </h2>
          <p className="text-textDark/70 text-sm mt-1">
            صداقت در درمان و همراهی در تک‌تک مراحل بهبودی
          </p>
        </div>

        {/* Modal trigger button in header */}
        {approvedComments.length > 0 && (
          <button
            onClick={() => setIsModalOpen(true)}
            className="inline-flex items-center gap-2 self-start md:self-auto bg-white/70 hover:bg-white text-primary border border-primary/30 hover:border-primary px-4 py-2.5 rounded-2xl text-xs md:text-sm font-bold shadow-sm hover:shadow-md transition-all duration-300 hover:-translate-y-0.5 cursor-pointer group"
          >
            <MessagesSquare className="w-4 h-4 text-primary group-hover:scale-110 transition-transform" />
            <span>مشاهده همه دیدگاه‌ها ({approvedComments.length})</span>
          </button>
        )}
      </div>

      {/* Reviews Grid (Initial 4) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        {approvedComments.slice(0, 4).map((comment) => (
          <div
            key={comment.id}
            className="bg-gradient-to-br from-white/60 to-white/25 hover:from-white/80 hover:to-white/45 border border-primary/20 hover:border-primary/40 shadow-sm p-6 rounded-3xl transition-all duration-300 flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center gap-1 mb-4 text-amber-500">
                {[...Array(comment.rating || 5)].map((_, i) => (
                  <Star key={i} className="w-4 h-4 fill-current" />
                ))}
              </div>
              <p className="text-textDark/90 font-medium leading-relaxed text-sm md:text-base mb-5">
                «{comment.text}»
              </p>
            </div>

            <div className="flex items-center gap-3 pt-3 border-t border-primary/10">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-primary-dark flex items-center justify-center text-sm font-bold text-white shadow-md">
                {comment.avatar}
              </div>
              <div className="flex flex-col">
                <span className="text-sm font-bold text-textDark/85">{comment.name}</span>
                <span className="text-textDark/50 text-xs">{comment.date}</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* View All Action Bar */}
      {approvedComments.length > 4 && (
        <div className="flex items-center justify-center mb-10">
          <button
            onClick={() => setIsModalOpen(true)}
            className="bg-gradient-to-l from-primary to-primary-dark hover:from-primary-dark hover:to-primary text-white font-bold py-3 px-8 rounded-full shadow-[0_6px_20px_-4px_rgba(231,84,128,0.5)] hover:shadow-[0_8px_25px_-4px_rgba(186,45,99,0.7)] transition-all duration-300 flex items-center gap-2.5 text-sm cursor-pointer hover:-translate-y-0.5"
          >
            <MessagesSquare className="w-4 h-4" />
            <span>مشاهده همه پیام‌ها ({approvedComments.length} دیدگاه)</span>
          </button>
        </div>
      )}

      {/* Inline Submission Form */}
      <form
        onSubmit={handleSubmit}
        className="bg-gradient-to-br from-primary/10 to-primary-dark/10 border border-primary/25 p-6 md:p-8 rounded-3xl flex flex-col gap-4 relative overflow-hidden shadow-sm backdrop-blur-sm"
      >
        <div className="flex items-center gap-2 text-textDark font-bold text-lg md:text-xl">
          <MessageSquareHeart className="w-6 h-6 text-primary" />
          <h3>ثبت نظر و تجربه شما</h3>
        </div>

        {toast && (
          <div
            className={`p-4 rounded-2xl flex items-center justify-between gap-3 text-xs md:text-sm font-medium transition-all ${
              toast.type === 'success'
                ? 'bg-emerald-500/15 border border-emerald-500/30 text-emerald-800'
                : 'bg-rose-500/15 border border-rose-500/30 text-rose-800'
            }`}
          >
            <div className="flex items-center gap-2.5">
              {toast.type === 'success' ? (
                <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
              ) : (
                <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
              )}
              <span className="leading-relaxed">{toast.message}</span>
            </div>
            <button
              type="button"
              onClick={() => setToast(null)}
              className="opacity-70 hover:opacity-100 p-1 cursor-pointer shrink-0"
              aria-label="بستن پیام"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <input
            type="text"
            placeholder="نام و نام خانوادگی"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            required
            className="bg-white/80 border border-primary/25 p-3.5 rounded-2xl text-textDark text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all placeholder-textDark/50 w-full"
          />
          <input
            type="email"
            placeholder="ایمیل یا شماره تماس (اختیاری)"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            className="bg-white/80 border border-primary/25 p-3.5 rounded-2xl text-textDark text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all placeholder-textDark/50 w-full"
          />
        </div>

        <textarea
          placeholder="تجربه خود از برخورد، درمان و خدمات مطب را بنویسید..."
          rows="3"
          value={formData.text}
          onChange={(e) => setFormData({ ...formData, text: e.target.value })}
          required
          className="bg-white/80 border border-primary/25 p-3.5 rounded-2xl text-textDark text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all resize-y placeholder-textDark/50"
        ></textarea>

        <div className="flex flex-wrap items-center justify-between gap-4 mt-2">
          <div className="flex items-center gap-2 text-xs font-bold text-textDark/70">
            <span>امتیاز شما:</span>
            <div className="flex gap-1 text-amber-500 cursor-pointer">
              {[1, 2, 3, 4, 5].map((star) => (
                <Star
                  key={star}
                  className={`w-5 h-5 ${
                    formData.rating >= star ? 'fill-current' : 'text-gray-300'
                  }`}
                  onClick={() => setFormData({ ...formData, rating: star })}
                />
              ))}
            </div>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="bg-primary hover:bg-primary-dark text-white font-bold py-3 px-8 rounded-full transition-all shadow-[0_8px_20px_-6px_rgba(231,84,128,0.6)] hover:shadow-[0_12px_24px_-6px_rgba(186,45,99,0.8)] hover:-translate-y-0.5 flex items-center gap-2 text-sm cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 ml-1 animate-spin" />
                <span>در حال ثبت...</span>
              </>
            ) : (
              <>
                <Send className="w-4 h-4 ml-1" />
                <span>ارسال نظر</span>
              </>
            )}
          </button>
        </div>
      </form>

      {/* ================= ALL COMMENTS POPUP MODAL (Portal to document.body) ================= */}
      {isModalOpen &&
        createPortal(
          <div className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 animate-fadeIn">
            {/* Backdrop click listener */}
            <div
              className="fixed inset-0"
              onClick={() => setIsModalOpen(false)}
            />

            {/* Modal Container */}
            <div className="relative w-full max-w-4xl max-h-[92vh] bg-gradient-to-br from-bgLight/95 via-white/95 to-bgDark/95 backdrop-blur-2xl border border-primary/30 rounded-[2.5rem] shadow-2xl flex flex-col overflow-hidden z-10 animate-scaleUp">
              {/* Modal Header */}
              <div className="p-5 md:p-6 border-b border-primary/15 flex items-center justify-between bg-white/60">
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-primary to-primary-dark text-white flex items-center justify-center shadow-lg shadow-primary/30">
                    <MessagesSquare className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-lg md:text-xl font-bold text-textDark flex items-center gap-2">
                      <span>دیدگاه‌ها و تجربیات مراجعین</span>
                      <span className="text-xs bg-primary/15 text-primary px-2.5 py-0.5 rounded-full font-bold">
                        {approvedComments.length} پیام
                      </span>
                    </h3>
                    <p className="text-textDark/60 text-xs mt-0.5">
                      میانگین رضایت: {avgRating} از ۵ ★
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="w-10 h-10 rounded-full bg-white/80 hover:bg-white text-textDark/70 hover:text-primary border border-primary/20 flex items-center justify-center transition-all cursor-pointer shadow-sm"
                  aria-label="بستن"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Modal Filters & Search Bar */}
              <div className="px-5 py-3.5 bg-white/40 border-b border-primary/10 flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
                {/* Search */}
                <div className="relative flex-1">
                  <Search className="w-4 h-4 absolute right-3.5 top-1/2 -translate-y-1/2 text-textDark/40" />
                  <input
                    type="text"
                    placeholder="جستجو در نظرات و نام مراجعین..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pr-10 pl-4 py-2 text-xs md:text-sm bg-white/80 border border-primary/20 rounded-xl text-textDark placeholder-textDark/40 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all"
                  />
                  {searchQuery && (
                    <button
                      onClick={() => setSearchQuery('')}
                      className="absolute left-3 top-1/2 -translate-y-1/2 text-xs text-textDark/40 hover:text-textDark"
                    >
                      ✕
                    </button>
                  )}
                </div>

                {/* Rating Filter Pills */}
                <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
                  <button
                    onClick={() => setSelectedRating('all')}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer ${
                      selectedRating === 'all'
                        ? 'bg-primary text-white shadow-sm'
                        : 'bg-white/60 text-textDark/70 hover:bg-white/90 border border-primary/15'
                    }`}
                  >
                    همه ({approvedComments.length})
                  </button>
                  {[5, 4, 3].map((star) => {
                    const count = approvedComments.filter((c) => (c.rating || 5) === star).length;
                    if (count === 0 && selectedRating !== String(star)) return null;
                    return (
                      <button
                        key={star}
                        onClick={() => setSelectedRating(String(star))}
                        className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer flex items-center gap-1 ${
                          selectedRating === String(star)
                            ? 'bg-amber-500 text-white shadow-sm'
                            : 'bg-white/60 text-textDark/70 hover:bg-white/90 border border-primary/15'
                        }`}
                      >
                        <span>{star}</span>
                        <Star className="w-3 h-3 fill-current" />
                        <span className="opacity-75">({count})</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Modal Comments List (Scrollable) */}
              <div className="flex-1 overflow-y-auto p-5 md:p-6 space-y-4 max-h-[55vh] custom-scroll">
                {filteredComments.length === 0 ? (
                  <div className="text-center py-12 bg-white/40 rounded-2xl border border-dashed border-primary/25">
                    <MessageCircle className="w-10 h-10 text-primary/40 mx-auto mb-2" />
                    <p className="text-textDark/70 font-bold text-sm">هیچ دیدگاهی با این مشخصات یافت نشد.</p>
                    {(searchQuery || selectedRating !== 'all') && (
                      <button
                        onClick={() => {
                          setSearchQuery('');
                          setSelectedRating('all');
                        }}
                        className="mt-3 text-xs text-primary font-bold underline cursor-pointer"
                      >
                        پاک کردن فیلترها
                      </button>
                    )}
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {filteredComments.map((comment) => (
                      <div
                        key={comment.id}
                        className="bg-white/80 hover:bg-white border border-primary/20 hover:border-primary/40 rounded-2xl p-5 shadow-sm transition-all duration-200 flex flex-col justify-between"
                      >
                        <div>
                          <div className="flex items-center justify-between gap-2 mb-3">
                            <div className="flex items-center gap-1 text-amber-500">
                              {[...Array(comment.rating || 5)].map((_, i) => (
                                <Star key={i} className="w-3.5 h-3.5 fill-current" />
                              ))}
                            </div>
                            <span className="text-textDark/45 text-[11px] font-medium">{comment.date}</span>
                          </div>
                          <p className="text-textDark/90 font-medium leading-relaxed text-xs md:text-sm mb-4">
                            «{comment.text}»
                          </p>
                        </div>

                        <div className="flex items-center gap-2.5 pt-3 border-t border-primary/10">
                          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary to-primary-dark flex items-center justify-center text-xs font-bold text-white shadow-md shrink-0">
                            {comment.avatar}
                          </div>
                          <div className="flex flex-col">
                            <span className="text-xs font-bold text-textDark/85">{comment.name}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Modal Footer */}
              <div className="p-4 bg-white/70 border-t border-primary/15 flex flex-wrap items-center justify-between gap-3 text-xs">
                <div className="text-textDark/60">
                  نمایش {filteredComments.length} از {approvedComments.length} دیدگاه
                </div>
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => {
                      setIsModalOpen(false);
                      const formElement = document.querySelector('#reviews form');
                      if (formElement) {
                        formElement.scrollIntoView({ behavior: 'smooth' });
                      }
                    }}
                    className="bg-primary hover:bg-primary-dark text-white font-bold px-4 py-2 rounded-xl transition-all shadow-md cursor-pointer"
                  >
                    ثبت نظر شما
                  </button>
                  <button
                    onClick={() => setIsModalOpen(false)}
                    className="text-textDark/70 hover:text-textDark font-medium px-3 py-2 cursor-pointer"
                  >
                    بستن
                  </button>
                </div>
              </div>
            </div>
          </div>,
          document.body
        )}

      {/* ================= FLOATING TOAST NOTIFICATION (Portal to document.body) ================= */}
      {toast &&
        createPortal(
          <div className="fixed top-6 left-1/2 -translate-x-1/2 z-[1000] max-w-lg w-[92%] sm:w-auto animate-scaleUp pointer-events-auto">
            <div
              className={`p-4 sm:px-5 sm:py-3.5 rounded-2xl shadow-2xl backdrop-blur-xl border flex items-center gap-3.5 text-xs sm:text-sm font-medium ${
                toast.type === 'success'
                  ? 'bg-slate-900/95 border-emerald-500/50 text-emerald-300 shadow-[0_10px_35px_-5px_rgba(16,185,129,0.35)]'
                  : 'bg-slate-900/95 border-rose-500/50 text-rose-300 shadow-[0_10px_35px_-5px_rgba(244,63,94,0.35)]'
              }`}
            >
              {toast.type === 'success' ? (
                <div className="w-7 h-7 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
                  <CheckCircle2 className="w-4 h-4" />
                </div>
              ) : (
                <div className="w-7 h-7 rounded-full bg-rose-500/20 text-rose-400 flex items-center justify-center shrink-0">
                  <AlertCircle className="w-4 h-4" />
                </div>
              )}
              <div className="flex-1 leading-relaxed text-white font-medium">
                {toast.message}
              </div>
              <button
                type="button"
                onClick={() => setToast(null)}
                className="text-white/50 hover:text-white p-1 transition-colors cursor-pointer mr-1 shrink-0"
                aria-label="بستن"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>,
          document.body
        )}
    </section>
  );
};

export default ReviewsSection;

