// src/components/articles/ArticleSidebar.jsx
import React from 'react';
import { ListCollapse, Calendar, ArrowLeft, ShieldCheck, PhoneCall } from 'lucide-react';

const ArticleSidebar = ({ headings = [], onOpenAppointment }) => {
  const scrollToHeading = (id) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    <aside className="space-y-6 sticky top-28">
      {/* Table of Contents (TOC) */}
      {headings.length > 0 && (
        <div className="bg-white/80 backdrop-blur-md p-6 rounded-3xl border border-primary/20 shadow-xs">
          <div className="flex items-center gap-2 text-sm font-black text-textDark mb-4 border-b border-primary/10 pb-3">
            <ListCollapse className="w-4 h-4 text-primary" />
            <span>فهرست عناوین مقاله</span>
          </div>

          <nav className="space-y-2 text-xs font-medium">
            {headings.map((item, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => scrollToHeading(item.id)}
                className="w-full text-right p-2 rounded-xl text-textDark/75 hover:text-primary hover:bg-primary/10 transition-colors flex items-start gap-2 cursor-pointer leading-relaxed"
              >
                <span className="w-1.5 h-1.5 rounded-full bg-primary/40 shrink-0 mt-1.5" />
                <span className="line-clamp-2">{item.text}</span>
              </button>
            ))}
          </nav>
        </div>
      )}

      {/* Booking CTA Card */}
      <div className="bg-gradient-to-br from-primary/15 via-white/80 to-primary-dark/15 backdrop-blur-md p-6 rounded-3xl border border-primary/30 shadow-md flex flex-col justify-between gap-4">
        <div>
          <span className="bg-primary/10 text-primary border border-primary/20 text-[11px] px-2.5 py-0.5 rounded-full font-bold inline-block mb-3">
            ویزیت و مشاوره تخصصی
          </span>

          <h4 className="text-base font-black text-textDark mb-2 leading-snug">
            نیاز به ارزیابی دقیق یا ویزیت حضوری دارید؟
          </h4>

          <p className="text-xs text-textDark/80 leading-relaxed font-medium mb-4">
            تشخیص قطعی ضایعات و انتخاب شیوه درمان نیازمند معاینه بالینی دقیق توسط جراح متخصص است.
          </p>

          <div className="flex items-center gap-2 text-xs text-textDark/70 font-bold mb-2">
            <ShieldCheck className="w-4 h-4 text-primary" />
            <span>دکتر نگار معشوری — جراح متخصص پستان</span>
          </div>
        </div>

        <button
          type="button"
          onClick={onOpenAppointment}
          className="w-full inline-flex items-center justify-center gap-2 bg-primary hover:bg-primary-dark text-white py-3 px-4 rounded-2xl font-bold text-xs md:text-sm shadow-md shadow-primary/20 transition-all hover:scale-102 cursor-pointer"
        >
          <Calendar className="w-4 h-4" />
          رزرو نوبت آنلاین
        </button>
      </div>
    </aside>
  );
};

export default ArticleSidebar;
