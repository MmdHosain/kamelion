// src/components/admin/exceptions/ExceptionsList.jsx
import React from 'react';
import {
  Trash2,
  Plus,
  CalendarOff,
  AlertCircle,
  CheckCircle2,
  Loader2,
} from 'lucide-react';
import CustomDateRangePicker, { fromYMD } from './CustomDateRangePicker';
import { toPersianDigits } from '../../../utils/jalaliDateUtils';
import { useAdminExceptions } from '../../../hooks/useAdminExceptions';

export default function ExceptionsList(props) {
  const internalHook = useAdminExceptions();
  const {
    exceptions,
    loading,
    error,
    successMessage,
    handleAdd,
    handleChange,
    handleDateChange,
    handleDelete,
  } = props?.exceptions !== undefined ? props : internalHook;

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[350px] gap-3">
        <Loader2 className="w-8 h-8 text-primary animate-spin" />
        <p className="text-xs md:text-sm font-bold text-textDark/60">
          در حال بارگذاری لیست تعطیلات و استثنائات مطب...
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3.5 sm:gap-6 pt-1">
      {/* Top Banner & Info */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 sm:gap-4 bg-white/70 backdrop-blur-md p-2.5 sm:p-4 rounded-2xl sm:rounded-3xl border border-primary/15 shadow-sm">
        <div className="flex items-center gap-2.5 sm:gap-3">
          <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl sm:rounded-2xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
            <CalendarOff size={18} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xs sm:text-sm md:text-base font-black text-textDark">
                تعطیلات رسمی و روزهای استثناء
              </h2>
              <span className="px-2 py-0.5 rounded-lg text-[10px] sm:text-xs font-bold bg-primary/10 text-primary">
                {toPersianDigits(exceptions.length)} بازه
              </span>
            </div>
            <p className="text-[11px] sm:text-xs text-textDark/60 font-medium mt-0.5">
              در روزهای مشخص‌شده، تمامی اسلات‌های ویزیت برای بیماران مسدود خواهد شد.
            </p>
          </div>
        </div>
      </div>

      {/* Error or Success notification */}
      {error && (
        <div className="rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 px-4 py-3 text-xs md:text-sm font-bold flex items-center gap-2 animate-in fade-in">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {successMessage && (
        <div className="rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 px-4 py-3 text-xs md:text-sm font-bold flex items-center gap-2 animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
          <span>{successMessage}</span>
        </div>
      )}

      {/* Exceptions Grid / Empty State */}
      {exceptions.length === 0 ? (
        <div className="flex flex-col items-center justify-center min-h-[340px] bg-white/60 backdrop-blur-sm rounded-3xl border border-dashed border-primary/25 p-8 text-center gap-4">
          <div className="w-16 h-16 rounded-full bg-primary/10 text-primary flex items-center justify-center shadow-inner">
            <CalendarOff size={28} />
          </div>

          <div className="max-w-md">
            <h3 className="text-base font-black text-textDark mb-1">
              هیچ بازه تعطیلی ثبت نشده است
            </h3>
            <p className="text-xs text-textDark/60 leading-relaxed font-medium">
              تمامی روزهای تقویم طبق شیفت هفتگی پزشک فعال هستند. برای بستن مطب در ایام تعطیلات، کنگره‌ها یا مرخصی پزشک، بازه جدید ایجاد کنید.
            </p>
          </div>

          <button
            type="button"
            onClick={handleAdd}
            className="flex items-center gap-2 px-6 py-2.5 rounded-2xl bg-primary hover:bg-primary-dark text-white text-xs md:text-sm font-bold shadow-md shadow-primary/25 transition-all cursor-pointer"
          >
            <Plus size={16} />
            <span>افزودن اولین بازه تعطیلی</span>
          </button>
        </div>
      ) : (
        <div className="flex flex-col gap-3.5 sm:gap-6">
          <div className="grid gap-3 sm:gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {exceptions.map((ex, idx) => {
              // Calculate duration in days
              let daysDuration = 0;
              if (ex.startDate && ex.endDate) {
                const s = fromYMD(ex.startDate);
                const e = fromYMD(ex.endDate);
                if (s && e && e >= s) {
                  daysDuration = Math.round((e - s) / (1000 * 60 * 60 * 24)) + 1;
                }
              }

              return (
                <div
                  key={ex.id}
                  className="bg-white/90 backdrop-blur-md rounded-2xl sm:rounded-3xl border border-primary/20 p-3.5 sm:p-5 shadow-sm hover:shadow-md hover:border-primary/40 transition-all flex flex-col justify-between gap-3 sm:gap-4 group"
                >
                  {/* Card Header */}
                  <div className="flex items-center justify-between border-b border-primary/10 pb-2 sm:pb-3">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg sm:rounded-xl bg-primary/10 text-primary flex items-center justify-center font-bold text-xs shrink-0">
                        {toPersianDigits(idx + 1)}
                      </div>
                      <span className="text-xs sm:text-sm font-black text-textDark">
                        تعطیلی مطب
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      {daysDuration > 0 && (
                        <span className="px-2 py-0.5 rounded-lg text-[10px] sm:text-[11px] font-black bg-rose-50 text-rose-700 border border-rose-200">
                          {toPersianDigits(daysDuration)} روز
                        </span>
                      )}

                      <button
                        type="button"
                        onClick={() => handleDelete(ex.id)}
                        aria-label="حذف بازه تعطیلی"
                        title="حذف این بازه"
                        className="p-1.5 rounded-xl text-textDark/40 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </div>

                  {/* Date Range Picker */}
                  <CustomDateRangePicker
                    startDate={ex.startDate}
                    endDate={ex.endDate}
                    onChange={(start, end) => handleDateChange(ex.id, start, end)}
                  />

                  {/* Reason & Notes Field */}
                  <div className="flex flex-col gap-1.5">
                    <div className="flex items-center justify-between text-[11px] font-bold text-textDark/70">
                      <span>علت تعطیلی یا یادداشت:</span>
                      <span className="text-textDark/40 font-normal">
                        {toPersianDigits((ex.note || '').length)}/۲۵۵
                      </span>
                    </div>

                    <textarea
                      rows={2}
                      maxLength={255}
                      placeholder="مثلاً: تعطیلات نوروز، شرکت در کنگره جراحی، بازسازی مطب..."
                      value={ex.note}
                      onChange={(e) => handleChange(ex.id, 'note', e.target.value)}
                      className="
                        w-full px-3 py-2 text-xs border border-primary/15 rounded-2xl
                        focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary
                        placeholder:text-textDark/40 bg-white/80 resize-none transition-all font-medium text-textDark leading-relaxed
                      "
                    />
                  </div>
                </div>
              );
            })}
          </div>

          {/* Bottom circular add button */}
          <div className="flex flex-col items-center justify-center py-4 sm:py-6 gap-1.5 sm:gap-2">
            <button
              type="button"
              onClick={handleAdd}
              aria-label="افزودن بازه تعطیلی جدید"
              className="w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-primary text-white flex items-center justify-center shadow-lg shadow-primary/30 hover:bg-primary-dark hover:scale-105 active:scale-95 transition-all duration-200 cursor-pointer"
            >
              <Plus size={24} strokeWidth={2.5} />
            </button>
            <span className="text-[11px] sm:text-xs font-bold text-textDark/60">افزودن بازه تعطیلی جدید</span>
          </div>
        </div>
      )}
    </div>
  );
}
