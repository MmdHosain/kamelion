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

      grid.push({
        empty: false,
        dayNum,
        dateObj,
        isToday,
        isSelected,
        disabled,
        key: `day-${dayNum}`,
      });
    }

    return grid;
  }, [viewYear, viewMonth, todayJalali, selectedDate, isDateDisabled]);

  const monthTitle = `${PERSIAN_MONTH_NAMES[viewMonth - 1]} ${toPersianDigits(viewYear)}`;

  return (
    <div className={`w-full max-w-[340px] select-none ${className}`}>
      {/* Month & Navigation Header */}
      <div className="flex items-center justify-between mb-3 px-1">
        <button
          type="button"
          onClick={handlePrevMonth}
          className="p-1.5 rounded-xl text-textDark/70 hover:text-primary hover:bg-primary/10 transition-colors cursor-pointer"
          title="ماه قبل"
          aria-label="ماه قبل"
        >
          <ChevronRight size={18} />
        </button>

        <div className="flex items-center gap-1.5 text-sm font-black text-primary">
          <CalendarIcon size={16} className="text-primary" />
          <span>{monthTitle}</span>
        </div>

        <button
          type="button"
          onClick={handleNextMonth}
          className="p-1.5 rounded-xl text-textDark/70 hover:text-primary hover:bg-primary/10 transition-colors cursor-pointer"
          title="ماه بعد"
          aria-label="ماه بعد"
        >
          <ChevronLeft size={18} />
        </button>
      </div>

      {/* Weekday Headers (Saturday to Friday) */}
      <div className="grid grid-cols-7 gap-1 text-center mb-2">
        {PERSIAN_WEEKDAY_NAMES.map((wd) => (
          <div
            key={wd.key}
            className={`text-[11px] font-bold py-1 ${
              wd.key === 'FRI' ? 'text-red-400' : 'text-textDark/60'
            }`}
            title={wd.full}
          >
            {wd.short}
          </div>
        ))}
      </div>

      {/* Days Grid */}
      <div className="grid grid-cols-7 gap-1">
        {daysGrid.map((item) => {
          if (item.empty) {
            return <div key={item.key} className="w-9 h-9" />;
          }

          const { dayNum, dateObj, isToday, isSelected, disabled, key } = item;

          return (
            <button
              key={key}
              type="button"
              disabled={disabled}
              onClick={() => onSelect && onSelect(dateObj)}
              className={`
                w-9 h-9 mx-auto rounded-xl flex items-center justify-center text-xs font-bold transition-all duration-200
                ${
                  isSelected
                    ? 'bg-primary text-white shadow-md shadow-primary/30 scale-105 ring-2 ring-primary/40 font-black'
                    : disabled
                    ? 'text-gray-300 bg-gray-50/50 cursor-not-allowed opacity-40'
                    : isToday
                    ? 'text-primary bg-primary/10 border border-primary/40 hover:bg-primary hover:text-white cursor-pointer'
                    : 'text-textDark/90 hover:bg-primary/15 hover:text-primary cursor-pointer'
                }
              `}
            >
              {toPersianDigits(dayNum)}
            </button>
          );
        })}
      </div>
    </div>
  );
}
