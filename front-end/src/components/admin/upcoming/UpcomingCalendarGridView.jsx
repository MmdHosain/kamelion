// src/components/admin/upcoming/UpcomingCalendarGridView.jsx
import React, { useState, useMemo, useRef } from 'react';
import {
  ChevronLeft,
  ChevronRight,
  Calendar,
  Users,
  CheckCircle2,
  Clock,
  X,
  Eye,
  FileText,
  Phone,
  User,
} from 'lucide-react';
import {
  PERSIAN_MONTH_NAMES,
  PERSIAN_WEEKDAY_NAMES,
  dateToJalali,
  jalaliToDate,
  getDaysInJalaliMonth,
  getJalaliDayOfWeekIndex,
  toPersianDigits,
  formatJalaliDisplay,
} from '../../../utils/jalaliDateUtils';
import { toYMD, fromYMD } from '../../../hooks/useUpcomingAppointments';

const STATUS_CONFIG = {
  pending: {
    label: 'در انتظار',
    dotClass: 'bg-amber-500',
    badgeClass: 'bg-amber-50 text-amber-700 border-amber-200',
  },
  scheduled: {
    label: 'تایید شده',
    dotClass: 'bg-emerald-500',
    badgeClass: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  },
  cancelled_admin: {
    label: 'رد شده',
    dotClass: 'bg-rose-500',
    badgeClass: 'bg-rose-50 text-rose-700 border-rose-200',
  },
  cancelled_user: {
    label: 'لغو شده',
    dotClass: 'bg-gray-400',
    badgeClass: 'bg-gray-100 text-gray-600 border-gray-200',
  },
  visited: {
    label: 'ویزیت شده',
    dotClass: 'bg-purple-500',
    badgeClass: 'bg-purple-50 text-purple-700 border-purple-200',
  },
};

export default function UpcomingCalendarGridView({
  startDate,
  groupedByDay = [],
  onViewAppointment,
  onViewPatient,
}) {
  // Map day data by dateKey
  const daysMap = useMemo(() => {
    const map = new Map();
    groupedByDay.forEach((day) => {
      map.set(day.dateKey, day);
    });
    return map;
  }, [groupedByDay]);

  // Initial year/month based on startDate or today
  const initialJalali = useMemo(() => {
    const d = startDate ? fromYMD(startDate) : new Date();
    return dateToJalali(d || new Date());
  }, [startDate]);

  const [currentYear, setCurrentYear] = useState(initialJalali.jy);
  const [currentMonth, setCurrentMonth] = useState(initialJalali.jm);
  const [selectedDayKey, setSelectedDayKey] = useState(null);

  const todayJalali = useMemo(() => dateToJalali(new Date()), []);
  const todayKey = useMemo(() => {
    const d = new Date();
    return toYMD(d);
  }, []);

  const drawerRef = useRef(null);

  const handleDayClick = (ymd) => {
    setSelectedDayKey(ymd);
    // On mobile screens (< 1024px), smoothly scroll and focus the appointments drawer below the calendar
    if (typeof window !== 'undefined' && window.innerWidth < 1024) {
      setTimeout(() => {
        if (drawerRef.current) {
          drawerRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
          drawerRef.current.focus?.({ preventScroll: true });
        }
      }, 60);
    }
  };

  // Navigation handlers
  const handlePrevMonth = () => {
    if (currentMonth === 1) {
      setCurrentMonth(12);
      setCurrentYear((y) => y - 1);
    } else {
      setCurrentMonth((m) => m - 1);
    }
  };

  const handleNextMonth = () => {
    if (currentMonth === 12) {
      setCurrentMonth(1);
      setCurrentYear((y) => y + 1);
    } else {
      setCurrentMonth((m) => m + 1);
    }
  };

  // Build grid of days
  const calendarGrid = useMemo(() => {
    const daysInMonth = getDaysInJalaliMonth(currentYear, currentMonth);
    const firstDayDate = jalaliToDate(currentYear, currentMonth, 1);
    const startWeekDayIndex = getJalaliDayOfWeekIndex(firstDayDate); // 0 = Sat, 6 = Fri

    const cells = [];
    for (let i = 0; i < startWeekDayIndex; i++) {
      cells.push(null);
    }

    for (let d = 1; d <= daysInMonth; d++) {
      const gDate = jalaliToDate(currentYear, currentMonth, d);
      const ymd = toYMD(gDate);
      cells.push({
        dayNum: d,
        ymd,
        gDate,
        dayData: daysMap.get(ymd) || null,
        isToday:
          currentYear === todayJalali.jy &&
          currentMonth === todayJalali.jm &&
          d === todayJalali.jd,
      });
    }

    return cells;
  }, [currentYear, currentMonth, daysMap, todayJalali]);

  const selectedDayData = selectedDayKey ? daysMap.get(selectedDayKey) : null;

  return (
    <div className="relative flex flex-col lg:flex-row gap-3.5 sm:gap-6 items-start">
      {/* Calendar Grid Box */}
      <div className="flex-1 w-full bg-white/80 backdrop-blur-md rounded-2xl sm:rounded-3xl border border-primary/20 p-3 sm:p-5 md:p-6 shadow-sm flex flex-col gap-3.5 sm:gap-5">
        {/* Month Navigation Header */}
        <div className="flex items-center justify-between border-b border-primary/15 pb-2.5 sm:pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-primary/10 text-primary flex items-center justify-center font-black">
              <Calendar size={18} />
            </div>
            <div>
              <h2 className="text-base md:text-lg font-black text-textDark">
                {PERSIAN_MONTH_NAMES[currentMonth - 1]} {toPersianDigits(currentYear)}
              </h2>
              <span className="text-xs text-textDark/60 font-medium">
                نمای ۳۰ روزه تقویم کلینیک
              </span>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={handlePrevMonth}
              title="ماه قبل"
              className="p-2 rounded-xl bg-white border border-primary/15 hover:border-primary text-textDark/70 hover:text-primary transition-all cursor-pointer shadow-xs"
            >
              <ChevronRight size={18} />
            </button>
            <button
              type="button"
              onClick={handleNextMonth}
              title="ماه بعد"
              className="p-2 rounded-xl bg-white border border-primary/15 hover:border-primary text-textDark/70 hover:text-primary transition-all cursor-pointer shadow-xs"
            >
              <ChevronLeft size={18} />
            </button>
          </div>
        </div>

        {/* Weekday Names Header */}
        <div className="grid grid-cols-7 gap-2 text-center text-xs font-black text-textDark/60 border-b border-primary/10 pb-2">
          {PERSIAN_WEEKDAY_NAMES.map((wd) => (
            <div key={wd.key} className="py-1">
              <span>{wd.full}</span>
            </div>
          ))}
        </div>

        {/* Days Grid Cells */}
        <div className="grid grid-cols-7 gap-2 md:gap-3">
          {calendarGrid.map((cell, idx) => {
            if (!cell) {
              return (
                <div
                  key={`empty-${idx}`}
                  className="min-h-[85px] md:min-h-[105px] rounded-2xl bg-gray-50/40 border border-transparent"
                />
              );
            }

            const { dayNum, ymd, dayData, isToday } = cell;
            const hasAppointments = dayData && dayData.items.length > 0;
            const isSelected = selectedDayKey === ymd;

            return (
              <div
                key={ymd}
                onClick={() => handleDayClick(ymd)}
                className={`min-h-[85px] md:min-h-[105px] p-2 md:p-2.5 rounded-2xl border transition-all duration-200 cursor-pointer flex flex-col justify-between ${
                  isSelected
                    ? 'bg-primary/10 border-primary shadow-md ring-2 ring-primary/20'
                    : hasAppointments
                    ? 'bg-white hover:bg-primary/[0.03] border-primary/25 hover:border-primary/50 shadow-xs'
                    : 'bg-white/60 hover:bg-white border-gray-100 hover:border-primary/20 text-textDark/60'
                }`}
              >
                {/* Cell Header: Day Number & Today indicator */}
                <div className="flex items-center justify-between">
                  <span
                    className={`text-xs md:text-sm font-black w-6 h-6 rounded-full flex items-center justify-center ${
                      isToday
                        ? 'bg-primary text-white shadow-xs'
                        : isSelected
                        ? 'text-primary'
                        : 'text-textDark'
                    }`}
                  >
                    {toPersianDigits(dayNum)}
                  </span>

                  {isToday && (
                    <span className="hidden md:inline-block text-[10px] font-bold px-1.5 py-0.5 rounded-md bg-primary/10 text-primary">
                      امروز
                    </span>
                  )}
                </div>

                {/* Cell Appointments indicator */}
                {hasAppointments ? (
                  <div className="flex flex-col gap-1 mt-1">
                    <div className="flex items-center gap-1 text-[11px] font-black text-primary bg-primary/10 px-1.5 py-0.5 rounded-lg w-fit">
                      <Users size={11} />
                      <span>{toPersianDigits(dayData.items.length)}</span>
                    </div>

                    <div className="flex items-center gap-1">
                      {dayData.scheduledCount > 0 && (
                        <span
                          className="w-2 h-2 rounded-full bg-emerald-500"
                          title={`${dayData.scheduledCount} تایید شده`}
                        />
                      )}
                      {dayData.pendingCount > 0 && (
                        <span
                          className="w-2 h-2 rounded-full bg-amber-500 animate-pulse"
                          title={`${dayData.pendingCount} در انتظار`}
                        />
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="text-[10px] text-textDark/30 font-medium">بدون نوبت</div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Slide-over Side Panel (Drawer) for Selected Day */}
      {selectedDayKey && (
        <div
          ref={drawerRef}
          tabIndex={-1}
          className="w-full lg:w-96 bg-white/95 backdrop-blur-md rounded-3xl border border-primary/25 p-5 shadow-xl flex flex-col gap-4 animate-in fade-in slide-in-from-left duration-200 shrink-0 focus:outline-none focus:ring-2 focus:ring-primary/40 focus:ring-offset-2 transition-all scroll-mt-6"
        >
          {/* Side Panel Header */}
          <div className="flex items-center justify-between border-b border-primary/15 pb-3">
            <div className="flex items-center gap-2">
              <Calendar size={17} className="text-primary" />
              <div>
                <h3 className="text-sm font-black text-textDark">
                  {selectedDayData?.displayDate || formatJalaliDisplay(fromYMD(selectedDayKey), true)}
                </h3>
                <span className="text-[11px] text-textDark/60 font-semibold" dir="ltr">
                  {selectedDayKey}
                </span>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setSelectedDayKey(null)}
              className="p-1.5 rounded-xl hover:bg-gray-100 text-textDark/60 hover:text-textDark transition-colors cursor-pointer"
            >
              <X size={16} />
            </button>
          </div>

          {/* Counts overview */}
          {selectedDayData && (
            <div className="flex items-center gap-2 text-xs font-bold">
              <span className="px-2.5 py-1 rounded-xl bg-primary/10 text-primary">
                {toPersianDigits(selectedDayData.items.length)} مراجع
              </span>
              {selectedDayData.scheduledCount > 0 && (
                <span className="px-2 py-1 rounded-xl bg-emerald-50 text-emerald-700 border border-emerald-200">
                  {toPersianDigits(selectedDayData.scheduledCount)} تایید
                </span>
              )}
              {selectedDayData.pendingCount > 0 && (
                <span className="px-2 py-1 rounded-xl bg-amber-50 text-amber-700 border border-amber-200">
                  {toPersianDigits(selectedDayData.pendingCount)} انتظار
                </span>
              )}
            </div>
          )}

          {/* Patients list for selected day */}
          <div className="flex flex-col gap-3 max-h-[500px] overflow-y-auto no-scrollbar pr-0.5">
            {!selectedDayData || selectedDayData.items.length === 0 ? (
              <div className="py-12 text-center text-textDark/50 text-xs font-semibold">
                هیچ نوبتی برای این روز ثبت نشده است.
              </div>
            ) : (
              selectedDayData.items.map((item) => {
                const status = STATUS_CONFIG[item.status] || STATUS_CONFIG.scheduled;

                return (
                  <div
                    key={item.id}
                    className="p-3.5 rounded-2xl bg-white border border-primary/15 shadow-xs hover:shadow-md transition-all flex flex-col gap-2"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-primary/10 text-primary font-black text-xs">
                        <Clock size={12} />
                        <span dir="ltr">{toPersianDigits(item.time)}</span>
                      </div>

                      <span className={`px-2 py-0.5 rounded-lg text-[10px] font-bold border ${status.badgeClass}`}>
                        {status.label}
                      </span>
                    </div>

                    <div className="flex items-center gap-1.5 font-black text-sm text-textDark">
                      <User size={14} className="text-primary/70 shrink-0" />
                      <span>{item.fullName}</span>
                    </div>

                    <div className="flex items-center gap-1 text-xs text-textDark/70 font-semibold" dir="ltr">
                      <Phone size={11} className="text-primary/70 shrink-0" />
                      <span>{toPersianDigits(item.phoneNumber)}</span>
                    </div>

                    {item.reason && (
                      <p className="text-[11px] text-textDark/70 bg-primary/[0.03] p-2 rounded-xl border border-primary/10 line-clamp-2">
                        {item.reason}
                      </p>
                    )}

                    <div className="flex items-center justify-end gap-1.5 pt-1 border-t border-primary/10">
                      <button
                        type="button"
                        onClick={() => onViewAppointment(item)}
                        className="px-2.5 py-1 rounded-xl bg-primary/10 hover:bg-primary text-primary hover:text-white transition-all text-xs font-bold flex items-center gap-1 cursor-pointer"
                      >
                        <Eye size={12} />
                        <span>نوبت</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => onViewPatient(item)}
                        className="px-2.5 py-1 rounded-xl bg-gray-100 hover:bg-gray-200 text-textDark/80 transition-all text-xs font-bold flex items-center gap-1 cursor-pointer"
                      >
                        <FileText size={12} />
                        <span>پرونده</span>
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
}
