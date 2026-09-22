import React from 'react';
import { Calendar, MessageSquare, CheckCircle2, GraduationCap } from 'lucide-react';

import RibbonLogo from '../ui/RibbonLogo';

const HeroSection = ({ onOpenAppointment, onOpenChat }) => {
  const handleScrollToBooking = () => {
    const bookingEl = document.getElementById('booking');
    if (bookingEl) {
      bookingEl.scrollIntoView({ behavior: 'smooth' });
    } else if (onOpenAppointment) {
      onOpenAppointment();
    }
  };

  return (
    <section id="hero" className="glass-panel fade-section mt-4 md:mt-6">
      <div className="flex flex-col-reverse md:flex-row gap-8 md:gap-10 items-center justify-between">
        <div className="flex-1 min-w-[280px]">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/70 border border-primary/25 text-primary-dark text-xs md:text-sm font-bold mb-5 backdrop-blur-md shadow-sm">
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-primary"></span>
            </span>
            پذیرش بیماران جدید
          </div>

          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black text-transparent bg-clip-text bg-gradient-to-l from-primary to-primary-dark mb-3 tracking-tight">
            دکتر نگار معشوری
          </h1>
          <p className="text-lg md:text-2xl font-bold text-primary mb-6">
            متخصص جراحی پستان
          </p>

          <div className="flex flex-col gap-2.5 text-base md:text-lg text-textDark/85 leading-relaxed font-medium mb-8">
            <p className="flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-primary shrink-0" />
              <span>فلوشیپ فوق‌تخصصی جراحی پستان</span>
            </p>
            <p className="flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-primary shrink-0" />
              <span>بورد تخصصی جراحی عمومی</span>
            </p>
            <p className="flex items-center gap-2 text-xs md:text-sm text-textDark/65 mt-1">
              <GraduationCap className="w-4 h-4 text-primary/70 shrink-0" />
              <span>دانش‌آموخته دانشگاه علوم پزشکی تهران</span>
            </p>
          </div>

          {/* Action Area */}
          <div className="flex flex-col gap-3 max-w-lg">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <button
                onClick={handleScrollToBooking}
                className="bg-primary hover:bg-primary-dark text-white font-bold py-3.5 px-6 rounded-2xl transition-all duration-300 shadow-[0_8px_20px_-6px_rgba(231,84,128,0.5)] hover:shadow-[0_12px_24px_-6px_rgba(186,45,99,0.7)] hover:-translate-y-0.5 flex items-center justify-center gap-2 text-sm md:text-base cursor-pointer"
              >
                <Calendar className="w-5 h-5" />
                درخواست نوبت
              </button>

              <button
                onClick={() => onOpenChat && onOpenChat()}
                className="bg-white/70 hover:bg-white border border-primary/30 hover:border-primary/50 text-primary font-bold py-3.5 px-6 rounded-2xl transition-all duration-300 hover:-translate-y-0.5 backdrop-blur-md flex items-center justify-center gap-2 shadow-sm text-sm md:text-base cursor-pointer"
              >
                <MessageSquare className="w-5 h-5 text-primary" />
                مشاوره / تریاژ آنلاین
              </button>
            </div>
          </div>
        </div>

        {/* Doctor Avatar / Clinic Visual Box */}
        <div className="relative w-56 h-56 sm:w-64 sm:h-64 md:w-80 md:h-80 rounded-[2.5rem] border border-primary/25 flex justify-center items-center bg-gradient-to-br from-white/70 to-white/30 shrink-0 overflow-hidden shadow-2xl backdrop-blur-md group">
          <div className="absolute inset-0 bg-gradient-to-tr from-primary/15 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700"></div>
          
          <div className="absolute top-5 left-5 bg-white/90 border border-primary/20 shadow-md p-3 rounded-2xl backdrop-blur-md z-10">
            <RibbonLogo className="w-7 h-7 drop-shadow-[0_0_8px_rgba(231,84,128,0.4)]" />
          </div>

          <div className="flex flex-col items-center justify-center p-6 text-center transform group-hover:scale-105 transition-transform duration-700">
            <div className="w-24 h-24 md:w-28 md:h-28 rounded-full bg-gradient-to-br from-primary/20 to-primary-dark/20 flex items-center justify-center mb-3 border border-primary/30 shadow-inner">
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.2"
                className="w-14 h-14 md:w-16 md:h-16 text-primary"
              >
                <circle cx="12" cy="8" r="4" />
                <path d="M4 20c0-4.4 3.6-7 8-7s8 2.6 8 7" />
              </svg>
            </div>
            <span className="font-bold text-textDark text-sm md:text-base">دکتر نگار معشوری</span>
            <span className="text-xs text-primary font-bold mt-0.5">کلینیک تخصصی جراحی پستان</span>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
