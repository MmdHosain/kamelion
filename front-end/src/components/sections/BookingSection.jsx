import React from 'react';
import { Calendar, Clock, CheckCircle, Sparkles } from 'lucide-react';

const BookingSection = ({ onOpenAppointment }) => {
  return (
    <section id="booking" className="glass-panel text-center fade-section relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-transparent pointer-events-none"></div>
      
      <div className="relative z-10 flex flex-col items-center">
        <div className="w-20 h-20 bg-white/80 border border-primary/20 rounded-3xl flex items-center justify-center text-primary mb-6 shadow-md backdrop-blur-sm animate-pulse">
          <Calendar className="w-10 h-10" />
        </div>

        <h2 className="text-2xl md:text-4xl font-bold mb-3 text-transparent bg-clip-text bg-gradient-to-r from-primary to-primary-dark">
          نوبت‌گیری آنلاین و رزرو ویزیت
        </h2>
        <p className="text-textDark/75 font-medium mb-6 max-w-lg mx-auto text-sm md:text-base leading-relaxed">
          برای تعیین وقت ویزیت حضوری، دریافت مشاوره تخصصی و بررسی پرونده پزشکی، تاریخ و زمان مورد نظر خود را انتخاب فرمایید.
        </p>

        {/* Feature Points */}
        <div className="flex flex-wrap justify-center gap-4 mb-8 text-xs md:text-sm font-semibold text-textDark/80">
          <span className="flex items-center gap-1.5 bg-white/60 px-3.5 py-1.5 rounded-full border border-primary/15 shadow-sm">
            <Clock className="w-4 h-4 text-primary" />
            انتخاب ساعت دلخواه
          </span>
          <span className="flex items-center gap-1.5 bg-white/60 px-3.5 py-1.5 rounded-full border border-primary/15 shadow-sm">
            <CheckCircle className="w-4 h-4 text-primary" />
            تایید پیامکی فوری
          </span>
          <span className="flex items-center gap-1.5 bg-white/60 px-3.5 py-1.5 rounded-full border border-primary/15 shadow-sm">
            <Sparkles className="w-4 h-4 text-primary" />
            بدون معطلی در مطب
          </span>
        </div>

        <button
          onClick={onOpenAppointment}
          className="bg-primary hover:bg-primary-dark text-white font-bold py-3.5 px-10 rounded-full transition-all duration-300 shadow-[0_10px_25px_-5px_rgba(231,84,128,0.5)] hover:shadow-[0_15px_30px_-5px_rgba(186,45,99,0.7)] hover:-translate-y-1 flex items-center gap-3 text-base md:text-lg cursor-pointer"
        >
          <Calendar className="w-5 h-5" />
          <span>مشاهده تقویم و دریافت نوبت</span>
        </button>
      </div>
    </section>
  );
};

export default BookingSection;
