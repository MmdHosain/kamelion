// src/components/admin/upcoming/UpcomingEmptyState.jsx
import React from 'react';
import { CalendarX, RefreshCw, CalendarDays } from 'lucide-react';

export default function UpcomingEmptyState({ onResetRange, activePreset }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4 bg-white/50 backdrop-blur-sm rounded-3xl border border-primary/15 text-center min-h-[380px] shadow-sm">
      <div className="w-16 h-16 rounded-3xl bg-primary/10 text-primary flex items-center justify-center mb-4 shadow-inner">
        <CalendarX className="w-8 h-8" />
      </div>

      <h3 className="text-base md:text-lg font-black text-textDark mb-1">
        هیچ نوبتی در این بازه زمانی یافت نشد
      </h3>

      <p className="text-xs md:text-sm text-textDark/60 max-w-md leading-relaxed mb-6 font-medium">
        در بازه تاریخی انتخاب‌شده، هیچ نوبت رزرو شده‌ای برای ویزیت ثبت نگردیده است. می‌توانید بازه زمانی را تغییر داده یا روزهای آینده را بررسی فرمایید.
      </p>

      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={() => onResetRange('next7')}
          className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-primary text-white text-xs md:text-sm font-bold shadow-md hover:bg-primary-dark transition-all cursor-pointer"
        >
          <CalendarDays size={16} />
          <span>مشاهده نوبت‌های ۷ روز آینده</span>
        </button>

        <button
          type="button"
          onClick={() => onResetRange('today')}
          className="flex items-center gap-1.5 px-4 py-2.5 rounded-2xl bg-white border border-primary/20 text-textDark hover:border-primary text-xs md:text-sm font-bold transition-all cursor-pointer"
        >
          <RefreshCw size={14} />
          <span>نوبت‌های امروز</span>
        </button>
      </div>
    </div>
  );
}
