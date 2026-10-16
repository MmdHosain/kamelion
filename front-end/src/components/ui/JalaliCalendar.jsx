// src/components/ui/JalaliCalendar.jsx
import React, { useState, useMemo, useEffect } from 'react';
import { ChevronRight, ChevronLeft, Calendar as CalendarIcon } from 'lucide-react';
import {
  PERSIAN_MONTH_NAMES,
  PERSIAN_WEEKDAY_NAMES,
  dateToJalali,
  jalaliToDate,
  getDaysInJalaliMonth,
  getJalaliDayOfWeekIndex,
  toPersianDigits,
} from '../../utils/jalaliDateUtils';

export default function JalaliCalendar({
  selectedDate,
  onSelect,
  isDateDisabled,
  isDateAvailable,
  onMonthChange,
  className = '',
}) {
  // Current viewing Jalali year & month
  const today = useMemo(() => new Date(), []);
  const todayJalali = useMemo(() => dateToJalali(today), [today]);

  const [viewYear, setViewYear] = useState(() => {
    if (selectedDate) return dateToJalali(selectedDate).jy;
    return todayJalali.jy;
  });

  const [viewMonth, setViewMonth] = useState(() => {
    if (selectedDate) return dateToJalali(selectedDate).jm;
    return todayJalali.jm;
  });

  // Keep view in sync if selectedDate changes externally
  useEffect(() => {
    if (selectedDate) {
      const j = dateToJalali(selectedDate);
      setViewYear(j.jy);
      setViewMonth(j.jm);
    }
  }, [selectedDate]);

  // Trigger month change listener whenever the view year or month changes
  useEffect(() => {
    if (onMonthChange) {
      onMonthChange(viewYear, viewMonth);
    }
  }, [viewYear, viewMonth, onMonthChange]);

  // Navigate to previous Jalali month
  const handlePrevMonth = () => {
    if (viewMonth === 1) {
      setViewMonth(12);
      setViewYear((y) => y - 1);
    } else {
      setViewMonth((m) => m - 1);
    }
  };

  // Navigate to next Jalali month
  const handleNextMonth = () => {
    if (viewMonth === 12) {
      setViewMonth(1);
      setViewYear((y) => y + 1);
    } else {
      setViewMonth((m) => m + 1);
    }
  };

  // Build grid of days for viewYear & viewMonth
  const daysGrid = useMemo(() => {
    const totalDays = getDaysInJalaliMonth(viewYear, viewMonth);
    // Find weekday of first day of this Jalali month (1st of viewMonth)
    const firstDayDate = jalaliToDate(viewYear, viewMonth, 1);
    const startWeekdayOffset = getJalaliDayOfWeekIndex(firstDayDate); // 0 to 6 (0=Sat)

    const grid = [];

    // Leading empty slots for previous month alignment
    for (let i = 0; i < startWeekdayOffset; i++) {
      grid.push({ empty: true, key: `empty-${i}` });
    }

    // Days of the month
    for (let dayNum = 1; dayNum <= totalDays; dayNum++) {
      const dateObj = jalaliToDate(viewYear, viewMonth, dayNum);
      const isToday =
        viewYear === todayJalali.jy &&
        viewMonth === todayJalali.jm &&
        dayNum === todayJalali.jd;

      let isSelected = false;
      if (selectedDate) {
        const selJ = dateToJalali(selectedDate);
        isSelected =
          selJ.jy === viewYear &&
          selJ.jm === viewMonth &&
          selJ.jd === dayNum;
      }

      const disabled = isDateDisabled ? isDateDisabled(dateObj) : false;
      const isAvailable = isDateAvailable
        ? isDateAvailable(dateObj) && !disabled
        : !disabled;

      grid.push({
        empty: false,
        dayNum,
        dateObj,
        isToday,
        isSelected,
        disabled,
        isAvailable,
        key: `day-${dayNum}`,
      });
    }

    return grid;
  }, [viewYear, viewMonth, todayJalali, selectedDate, isDateDisabled, isDateAvailable]);

  const monthTitle = `${PERSIAN_MONTH_NAMES[viewMonth - 1]} ${toPersianDigits(viewYear)}`;

  return (
    <div className={`w-full max-w-[340px] select-none ${className}`}>
      {/* Month & Navigation Header */}
      <div className="flex items-center justify-between mb-4 px-1">
        <button
          type="button"
          onClick={handlePrevMonth}
          className="p-2 rounded-2xl text-textDark/70 hover:text-primary hover:bg-primary/10 border border-transparent hover:border-primary/20 transition-all duration-200 cursor-pointer shadow-none hover:shadow-xs active:scale-95"
          title="ماه قبل"
          aria-label="ماه قبل"
        >
          <ChevronRight size={18} />
        </button>

        <div className="flex items-center gap-2 text-sm md:text-base font-black text-primary">
          <CalendarIcon size={17} className="text-primary" />
          <span>{monthTitle}</span>
        </div>

        <button
          type="button"
          onClick={handleNextMonth}
          className="p-2 rounded-2xl text-textDark/70 hover:text-primary hover:bg-primary/10 border border-transparent hover:border-primary/20 transition-all duration-200 cursor-pointer shadow-none hover:shadow-xs active:scale-95"
          title="ماه بعد"
          aria-label="ماه بعد"
        >
          <ChevronLeft size={18} />
        </button>
      </div>

      {/* Weekday Headers (Saturday to Friday) */}
      <div className="grid grid-cols-7 gap-1.5 text-center mb-2">
        {PERSIAN_WEEKDAY_NAMES.map((wd) => (
          <div
            key={wd.key}
            className={`text-xs font-bold py-1.5 ${
              wd.key === 'FRI' ? 'text-rose-500/80 font-black' : 'text-textDark/70'
            }`}
            title={wd.full}
          >
            {wd.short}
          </div>
        ))}
      </div>

      {/* Days Grid */}
      <div className="grid grid-cols-7 gap-1.5">
        {daysGrid.map((item) => {
          if (item.empty) {
            return <div key={item.key} className="w-10 h-10" />;
          }

          const { dayNum, dateObj, isToday, isSelected, disabled, isAvailable, key } = item;

          return (
            <button
              key={key}
              type="button"
              disabled={disabled}
              onClick={() => onSelect && onSelect(dateObj)}
              className={`
                relative w-10 h-10 mx-auto rounded-2xl flex flex-col items-center justify-center text-xs transition-all duration-200 group
                ${
                  isSelected
                    ? 'bg-gradient-to-br from-primary to-primary-dark text-white font-black shadow-md shadow-primary/35 scale-105 ring-2 ring-primary/40 cursor-pointer'
                    : disabled
                    ? 'text-gray-300 bg-gray-50/40 border border-transparent cursor-not-allowed opacity-40 select-none'
                    : isToday
                    ? 'text-primary bg-primary/10 border-2 border-primary/40 font-black hover:bg-primary hover:text-white hover:border-transparent hover:scale-105 cursor-pointer shadow-xs'
                    : isAvailable
                    ? 'text-textDark font-bold bg-white/95 border border-primary/15 hover:border-primary hover:bg-primary/15 hover:text-primary hover:scale-105 active:scale-95 cursor-pointer shadow-xs'
                    : 'text-textDark/80 font-medium hover:bg-primary/10 hover:text-primary cursor-pointer'
                }
              `}
            >
              <span className="leading-none">{toPersianDigits(dayNum)}</span>
              {/* Doctor Availability Indicator Dot */}
              {!disabled && isAvailable && (
                <span
                  className={`w-1.5 h-1.5 rounded-full mt-1 transition-colors ${
                    isSelected
                      ? 'bg-white'
                      : isToday
                      ? 'bg-primary'
                      : 'bg-emerald-500 shadow-[0_0_4px_rgba(16,185,129,0.5)]'
                  }`}
                  title="پزشک در این روز نوبت آزاد دارد"
                />
              )}
            </button>
          );
        })}
      </div>

      {/* Doctor Availability & Status Legend */}
      <div className="flex items-center justify-center gap-4 mt-4 pt-3 border-t border-primary/10 text-[11px] font-bold text-textDark/70">
        <div className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_6px_rgba(16,185,129,0.4)]" />
          <span>حضور پزشک / نوبت آزاد</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-gray-300" />
          <span>تعطیل / تکمیل</span>
        </div>
      </div>
    </div>
  );
}
