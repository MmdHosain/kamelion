import { create } from 'zustand';
import { reviewsService } from '../api/reviewsService';

const INITIAL_COMMENTS = [
  {
    id: 1,
    name: 'سارا معتمدی',
    date: 'اردیبهشت ۱۴۰۳',
    avatar: 'س',
    rating: 5,
    text: 'دکتر معشوری بسیار باحوصله، دلسوز و دقیق هستند. از زمان نمونه‌برداری و تشخیص تا پایان دوره نقاهت جراحی، همواره با آرامش پاسخگوی تمام نگرانی‌های من بودند.',
    approved: true,
  },
  {
    id: 2,
    name: 'ترانه کمالی',
    date: 'فروردین ۱۴۰۳',
    avatar: 'ت',
    rating: 5,
    text: 'نحوه برخورد و هماهنگی‌های مطب با تیم آنکولوژی و بیمارستان بی‌نظیر بود. عمل جراحی بازسازی با نهایت ظرافت انجام شد. ممنونم از ایشان و تیم حرفه‌ای‌شون.',
    approved: true,
  },
  {
    id: 3,
    name: 'مهناز رضایی',
    date: 'اسفند ۱۴۰۲',
    avatar: 'م',
    rating: 5,
    text: 'محیط مطب بسیار آرامش‌بخش و پرسنل فوق‌العاده محترم هستند. دکتر معشوری با تخصص بالاشون بهترین تصمیم درمانی را برای من گرفتند.',
    approved: true,
  },
  {
    id: 4,
    name: 'فاطمه ابراهیمی',
    date: 'بهمن ۱۴۰۲',
    avatar: 'ف',
    rating: 5,
    text: 'دقت و معاینه همه‌جانبه خانم دکتر واقعاً ستودنی است. استرس بالایی داشتم اما توضیحات شفاف و رویکرد علمی ایشان باعث دلگرمی بسیار زیادی شد.',
    approved: true,
  },
  {
    id: 5,
    name: 'شیما اسدی',
    date: 'دی ۱۴۰۲',
    avatar: 'ش',
    rating: 5,
    text: 'از خدمات غربالگری و سونوگرافی بسیار راضی بودم. نظم نوبت‌دهی و بهداشت مطب در بالاترین سطح ممکن بود.',
    approved: true,
  },
  {
    id: 6,
    name: 'ناهید یوسفی',
    date: 'آذر ۱۴۰۲',
    avatar: 'ن',
    rating: 5,
    text: 'تشخیص زودهنگام و راهنمایی‌های دلسوزانه دکتر معشوری زندگی دوباره‌ای به من بخشید. همواره دعاگوی سلامت ایشان هستم.',
    approved: true,
  },
];

const formatComment = (item) => {
  const name = item.name || item.full_name || item.author || 'کاربر گرامی';
  return {
    id: item.id || Date.now(),
    name,
    email: item.email || '',
    date: item.created_at ? new Date(item.created_at).toLocaleDateString('fa-IR', { month: 'long', year: 'numeric' }) : item.date || 'به‌تازگی',
    avatar: name.charAt(0),
    rating: Number(item.rating) || 5,
    text: item.text || item.content || item.comment || '',
    approved: item.approved !== undefined ? item.approved : item.is_approved !== undefined ? item.is_approved : true,
  };
};

const getStoredComments = () => {
  try {
    const saved = localStorage.getItem('site_comments');
    if (saved) return JSON.parse(saved);
  } catch {
    // fallback
  }
  return INITIAL_COMMENTS;
};

export const useCommentsStore = create((set, get) => ({
  comments: getStoredComments(),
  isLoading: false,
  error: null,

  fetchPublicComments: async () => {
    set({ isLoading: true, error: null });
    try {
      const data = await reviewsService.getApprovedReviews();
      if (Array.isArray(data) && data.length > 0) {
        const formatted = data.map(formatComment);
        set({ comments: formatted, isLoading: false });
        localStorage.setItem('site_comments', JSON.stringify(formatted));
        return formatted;
      }
    } catch (err) {
      set({ error: err?.message || 'Failed to load comments', isLoading: false });
    }
    set({ isLoading: false });
    return get().comments;
  },

  fetchAdminComments: async () => {
    set({ isLoading: true, error: null });
    try {
      const data = await reviewsService.getAdminReviews();
      if (Array.isArray(data) && data.length > 0) {
        const formatted = data.map(formatComment);
        set({ comments: formatted, isLoading: false });
        return formatted;
      }
    } catch (err) {
      set({ error: err?.message || 'Failed to load admin comments', isLoading: false });
    }
    set({ isLoading: false });
    return get().comments;
  },

  addComment: async (commentData) => {
    const newComment = {
      id: Date.now(),
      name: commentData.name || 'کاربر گرامی',
      email: commentData.email || '',
      date: 'به‌تازگی',
      avatar: (commentData.name || 'ک').charAt(0),
      rating: Number(commentData.rating) || 5,
      text: commentData.text,
      approved: true,
    };

    // Optimistic store update
    const updated = [newComment, ...get().comments];
    localStorage.setItem('site_comments', JSON.stringify(updated));
    set({ comments: updated });

    try {
      const res = await reviewsService.submitReview(commentData);
      if (res?.id) {
        const serverComment = formatComment(res);
        const synced = get().comments.map((c) => (c.id === newComment.id ? serverComment : c));
        localStorage.setItem('site_comments', JSON.stringify(synced));
        set({ comments: synced });
      }
    } catch {
      // Keep optimistic local copy
    }

    return true;
  },

  deleteComment: async (id) => {
    const previous = get().comments;
    const updated = previous.filter((c) => c.id !== id);
    localStorage.setItem('site_comments', JSON.stringify(updated));
    set({ comments: updated });

    try {
      await reviewsService.deleteReview(id);
    } catch {
      // Backend error - local remains deleted
    }
  },

  toggleApprove: async (id) => {
    const current = get().comments.find((c) => c.id === id);
    const newStatus = current ? !current.approved : false;

    const updated = get().comments.map((c) =>
      c.id === id ? { ...c, approved: newStatus } : c
    );
    localStorage.setItem('site_comments', JSON.stringify(updated));
    set({ comments: updated });

    try {
      await reviewsService.updateReviewApproval(id, newStatus);
    } catch {
      // Local state preserved
    }
  },
}));
