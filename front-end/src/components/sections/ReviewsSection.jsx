import React, { useState } from 'react';
import { Star, Send, CheckCircle2, MessageSquareHeart } from 'lucide-react';
import { useCommentsStore } from '../../store/commentsStore';

const ReviewsSection = () => {
  const { comments, addComment } = useCommentsStore();
  const [formData, setFormData] = useState({ name: '', email: '', text: '', rating: 5 });
  const [submitted, setSubmitted] = useState(false);

  const approvedComments = comments.filter((c) => c.approved !== false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.text.trim()) return;

    addComment(formData);
    setSubmitted(true);
    setFormData({ name: '', email: '', text: '', rating: 5 });

    setTimeout(() => {
      setSubmitted(false);
    }, 4000);
  };

  return (
    <section id="reviews" className="glass-panel fade-section">
      <div className="text-xs md:text-sm text-primary font-bold tracking-wider mb-1.5 uppercase">
        نظرات مراجعین
      </div>
      <h2 className="text-2xl md:text-4xl font-bold mb-8 text-transparent bg-clip-text bg-gradient-to-l from-primary to-primary-dark">
        تجربه بیماران و همراهان
      </h2>

      {/* Reviews Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
        {approvedComments.slice(0, 4).map((comment) => (
          <div
            key={comment.id}
            className="bg-gradient-to-br from-white/60 to-white/25 hover:from-white/80 hover:to-white/45 border border-primary/20 shadow-sm p-6 rounded-3xl transition-all duration-300 flex flex-col justify-between"
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

      {/* Inline Submission Form */}
      <form
        onSubmit={handleSubmit}
        className="bg-gradient-to-br from-primary/10 to-primary-dark/10 border border-primary/25 p-6 md:p-8 rounded-3xl flex flex-col gap-4 relative overflow-hidden shadow-sm backdrop-blur-sm"
      >
        <div className="flex items-center gap-2 text-textDark font-bold text-lg md:text-xl">
          <MessageSquareHeart className="w-6 h-6 text-primary" />
          <h3>ثبت نظر و تجربه شما</h3>
        </div>

        {submitted ? (
          <div className="bg-emerald-500/15 border border-emerald-500/30 text-emerald-800 p-4 rounded-2xl flex items-center gap-3 font-bold text-sm">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
            <span>نظر شما با موفقیت ثبت گردید و نمایش داده شد. با تشکر از همراهی شما!</span>
          </div>
        ) : (
          <>
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
                className="bg-primary hover:bg-primary-dark text-white font-bold py-3 px-8 rounded-full transition-all shadow-[0_8px_20px_-6px_rgba(231,84,128,0.6)] hover:shadow-[0_12px_24px_-6px_rgba(186,45,99,0.8)] hover:-translate-y-0.5 flex items-center gap-2 text-sm"
              >
                <Send className="w-4 h-4 ml-1" />
                ارسال نظر
              </button>
            </div>
          </>
        )}
      </form>
    </section>
  );
};

export default ReviewsSection;
