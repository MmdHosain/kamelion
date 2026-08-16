import { create } from 'zustand';

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
];

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

  addComment: (commentData) => {
    const newComment = {
      id: Date.now(),
      name: commentData.name || 'کاربر گرامی',
      email: commentData.email || '',
      date: 'به‌تازگی',
      avatar: (commentData.name || 'ک').charAt(0),
      rating: commentData.rating || 5,
      text: commentData.text,
      approved: true, // For demo purposes, automatically visible or toggleable
    };
    const updated = [newComment, ...get().comments];
    localStorage.setItem('site_comments', JSON.stringify(updated));
    set({ comments: updated });
    return true;
  },

  deleteComment: (id) => {
    const updated = get().comments.filter((c) => c.id !== id);
    localStorage.setItem('site_comments', JSON.stringify(updated));
    set({ comments: updated });
  },

  toggleApprove: (id) => {
    const updated = get().comments.map((c) =>
      c.id === id ? { ...c, approved: !c.approved } : c
    );
    localStorage.setItem('site_comments', JSON.stringify(updated));
    set({ comments: updated });
  },
}));
