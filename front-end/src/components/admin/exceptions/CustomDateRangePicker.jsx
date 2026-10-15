// src/components/admin/exceptions/CustomDateRangePicker.jsx
import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import {
  ChevronLeft,
  ChevronRight,
  CalendarDays,
  Check,
  X,
} from 'lucide-react';
import {
  PERSIAN_MONTH_NAMES,
  dateToJalali,
  jalaliToDate,
  getDaysInJalaliMonth,
  getJalaliDayOfWeekIndex,
  toPersianDigits,
} from '../../../utils/jalaliDateUtils';

// ── Helpers ───────────────────────────────────────────────────────────────────

const JALALI_DAYS = ['ش', 'ی', 'د', 'س', 'چ', 'پ', 'ج'];

export const toYMD = (d) => {
  if (!d) return '';
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
};

export const fromYMD = (str) => {
  if (!str) return null;
  const [y, m, d] = str.split('-').map(Number);
  return new Date(y, m - 1, d);
};

export const formatJalaliShort = (ymd) => {
  if (!ymd) return '';
  const d = fromYMD(ymd);
  if (!d) return ymd;
  const j = dateToJalali(d);
  return `${toPersianDigits(j.jd)} ${PERSIAN_MONTH_NAMES[j.jm - 1]} ${toPersianDigits(j.jy)}`;
};

/**
 * Props:
 *   startDate : string 'YYYY-MM-DD' | ''
 *   endDate   : string 'YYYY-MM-DD' | ''
 *   onChange  : (start: string, end: string) => void
 */
export default function CustomDateRangePicker({ startDate, endDate, onChange }) {
  const [open, setOpen] = useState(false);

  // Jalali viewing month/year
  const todayJalali = useMemo(() => dateToJalali(new Date()), []);
  const [jYear, setJYear] = useState(todayJalali.jy);
  const [jMonth, setJMonth] = useState(todayJalali.jm);

  // Internal draft state
  const [draftStart, setDraftStart] = useState('');
  const [draftEnd, setDraftEnd] = useState('');
  const [hovered, setHovered] = useState(null);

  const popoverRef = useRef(null);

  // Sync draft from props when opening
  const openPicker = useCallback(() => {
    setDraftStart(startDate || '');
    setDraftEnd(endDate || '');
    setHovered(null);

    if (startDate) {
      const d = fromYMD(startDate);
      if (d) {
        const j = dateToJalali(d);
        setJYear(j.jy);
        setJMonth(j.jm);
      }
    } else {
      setJYear(todayJalali.jy);
      setJMonth(todayJalali.jm);
    }
    setOpen(true);
  }, [startDate, endDate, todayJalali]);

  // Close on outside click
  useEffect(() => {
    if (!open) return;
    const handler = (e) => {
      if (popoverRef.current && !popoverRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [open]);

  // Calendar navigation
  const prevMonth = () => {
    if (jMonth === 1) {
      setJMonth(12);
      setJYear((y) => y - 1);
    } else {
      setJMonth((m) => m - 1);
    }
  };

  const nextMonth = () => {
    if (jMonth === 12) {
      setJMonth(1);
      setJYear((y) => y + 1);
    } else {
      setJMonth((m) => m + 1);
    }
  };

  // Day click logic
  const handleDateClick = (clickedYmd) => {
    if (!clickedYmd) return;

    if (!draftStart || (draftStart && draftEnd)) {
      setDraftStart(clickedYmd);
      setDraftEnd('');
      return;
    }

    if (clickedYmd < draftStart) {
      setDraftEnd(draftStart);
      setDraftStart(clickedYmd);
    } else {
      setDraftEnd(clickedYmd);
    }
  };

  // Day cell classification
  const classifyDay = (ymd) => {
    if (!ymd) return 'empty';
    const end = draftEnd || hovered;

    const isStart = ymd === draftStart;
    const isEnd = end && ymd === end;
    const inRange =
      draftStart &&
      end &&
      ymd > (draftStart < end ? draftStart : end) &&
      ymd < (end > draftStart ? end : draftStart);

    if (isStart && isEnd) return 'single';
    if (isStart) return 'start';
    if (isEnd) return 'end';
    if (inRange) return 'range';
    return 'normal';
  };

  const handleConfirm = () => {
    if (!draftStart) return;
    onChange(draftStart, draftEnd || draftStart);
    setOpen(false);
  };

  const cellStyle = (type) => {
    const base = 'w-8 h-8 flex items-center justify-center text-xs font-bold select-none cursor-pointer transition-colors duration-100 ';
    switch (type) {
      case 'start':
      case 'end':
      case 'single':
        return base + 'bg-primary text-white rounded-full shadow-sm';
      case 'range':
        return base + 'bg-primary/15 text-primary rounded-none';
      case 'normal':
        return base + 'text-textDark hover:bg-primary/10 rounded-full';
      default:
        return base;
    }
  };

  const rowWrapStyle = (type) => {
    if (type === 'start') return 'bg-primary/15 rounded-r-full';
    if (type === 'end') return 'bg-primary/15 rounded-l-full';
    return '';
  };

  // Build Jalali month grid
  const jalaliGrid = useMemo(() => {
    const totalDays = getDaysInJalaliMonth(jYear, jMonth);
    const firstDayDate = jalaliToDate(jYear, jMonth, 1);
    const startWeekdayOffset = getJalaliDayOfWeekIndex(firstDayDate); // 0 = Sat, 6 = Fri

    const cells = [];
    for (let i = 0; i < startWeekdayOffset; i++) {
      cells.push(null);
    }
    for (let dayNum = 1; dayNum <= totalDays; dayNum++) {
      const dateObj = jalaliToDate(jYear, jMonth, dayNum);
      cells.push({
        dayNum,
        ymd: toYMD(dateObj),
        displayNum: toPersianDigits(dayNum),
      });
    }
    return cells;
  }, [jYear, jMonth]);

  return (
    <div className="relative w-full" ref={popoverRef}>
      {/* ── Trigger inputs ── */}
      <div className="grid grid-cols-2 gap-2.5">
        <TriggerInput
          label="تاریخ شروع تعطیلی"
          value={formatJalaliShort(startDate)}
          onClick={openPicker}
        />
        <TriggerInput
          label="تاریخ پایان تعطیلی"
          value={formatJalaliShort(endDate)}
          onClick={openPicker}
          icon
        />
      </div>

      {/* ── Popover ── */}
      {open && (
        <div
          className="
            absolute z-50 top-full mt-2 right-0
            bg-white/95 backdrop-blur-md border border-primary/20 rounded-3xl shadow-2xl
            w-[310px] overflow-hidden p-3.5 flex flex-col gap-3 animate-in fade-in zoom-in-95 duration-150
          "
        >
          {/* Month nav */}
          <div className="flex items-center justify-between border-b border-primary/10 pb-2.5 px-1">
            <button
              type="button"
              onClick={prevMonth}
              className="p-1.5 rounded-xl hover:bg-gray-100 text-textDark/70 hover:text-primary transition-colors cursor-pointer"
              title="ماه قبل"
              aria-label="ماه قبل"
            >
              <ChevronRight size={17} />
            </button>

            <span className="text-xs md:text-sm font-black text-textDark">
              {PERSIAN_MONTH_NAMES[jMonth - 1]} {toPersianDigits(jYear)}
            </span>

            <button
              type="button"
              onClick={nextMonth}
              className="p-1.5 rounded-xl hover:bg-gray-100 text-textDark/70 hover:text-primary transition-colors cursor-pointer"
              title="ماه بعد"
              aria-label="ماه بعد"
            >
              <ChevronLeft size={17} />
            </button>
          </div>

          {/* Weekday headers */}
          <div className="grid grid-cols-7 text-center">
            {JALALI_DAYS.map((d) => (
              <div key={d} className="h-6 flex items-center justify-center text-xs font-black text-textDark/50">
                {d}
              </div>
            ))}
          </div>

          {/* Day grid */}
          <div className="grid grid-cols-7 gap-y-1">
            {jalaliGrid.map((cell, i) => {
              if (!cell) {
                return <div key={`empty-${i}`} className="w-8 h-8 mx-auto" />;
              }

              const type = classifyDay(cell.ymd);

              return (
                <div
                  key={cell.ymd}
                  className={`${rowWrapStyle(type)} flex justify-center`}
                  onClick={() => handleDateClick(cell.ymd)}
                  onMouseEnter={() => {
                    if (draftStart && !draftEnd) {
                      setHovered(cell.ymd);
                    }
                  }}
                  onMouseLeave={() => setHovered(null)}
                >
                  <div className={cellStyle(type)}>
                    {cell.displayNum}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Footer & Actions */}
          <div className="flex items-center justify-between pt-2.5 border-t border-primary/10 mt-1">
            <div className="text-[11px] text-textDark/70 font-bold truncate max-w-[170px]">
              {draftStart ? (
                <span>
                  {formatJalaliShort(draftStart)}
                  {draftEnd && draftEnd !== draftStart ? ` تا ${formatJalaliShort(draftEnd)}` : ''}
                </span>
              ) : (
                <span className="text-textDark/40 font-normal">روز شروع را انتخاب کنید</span>
              )}
            </div>

            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="px-2.5 py-1.5 rounded-xl text-xs font-bold text-textDark/70 hover:bg-gray-100 transition-colors cursor-pointer"
              >
                انصراف
              </button>
              <button
                type="button"
                onClick={handleConfirm}
                disabled={!draftStart}
                className="px-3 py-1.5 rounded-xl text-xs font-bold bg-primary text-white hover:bg-primary-dark disabled:opacity-40 disabled:cursor-not-allowed shadow-md transition-all cursor-pointer flex items-center gap-1"
              >
                <Check size={13} />
                <span>تایید بازه</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ── Sub-component: trigger input ──────────────────────────────────────────────

function TriggerInput({ label, value, onClick, icon = false }) {
  return (
    <div className="flex flex-col gap-1.5 flex-1">
      <label className="text-[11px] font-bold text-textDark/70">{label}</label>
      <button
        type="button"
        onClick={onClick}
        className="
          w-full px-3 py-2 text-xs text-right
          border border-primary/20 rounded-xl bg-white/90
          text-textDark placeholder:text-textDark/40
          hover:border-primary focus:outline-none
          focus:ring-2 focus:ring-primary/20 shadow-xs
          transition-all flex items-center justify-between cursor-pointer
        "
      >
        <span className={value ? 'text-textDark font-bold truncate' : 'text-textDark/40'}>
          {value || 'انتخاب تاریخ'}
        </span>
        {icon && <CalendarDays size={13} className="text-primary/70 shrink-0 mr-1" />}
      </button>
    </div>
  );
}
