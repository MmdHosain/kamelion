// src/components/admin/upcoming/DualCalendarRangePicker.jsx
import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import {
  ChevronLeft,
  ChevronRight,
  Calendar as CalendarIcon,
  Globe,
  Check,
  RotateCcw,
} from 'lucide-react';
import {
  PERSIAN_MONTH_NAMES,
  dateToJalali,
  jalaliToDate,
  getDaysInJalaliMonth,
  getJalaliDayOfWeekIndex,
  toPersianDigits,
  formatJalaliDisplay,
} from '../../../utils/jalaliDateUtils';
import { toYMD, fromYMD } from '../../../hooks/useUpcomingAppointments';
import { useViewportBoundary } from '../../../hooks/useViewportBoundary';
import RangeCalendarCell from '../calendar/RangeCalendarCell';

const GREGORIAN_MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];
const GREGORIAN_DAYS = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];
const JALALI_DAYS = ['ش', 'ی', 'د', 'س', 'چ', 'پ', 'ج'];

export default function DualCalendarRangePicker({ startDate, endDate, onChange }) {
  const [open, setOpen] = useState(false);
  const [calendarMode, setCalendarMode] = useState('jalali'); // 'jalali' | 'gregorian'

  // Internal draft dates (ISO 'YYYY-MM-DD')
  const [draftStart, setDraftStart] = useState('');
  const [draftEnd, setDraftEnd] = useState('');
  const [hovered, setHovered] = useState(null);

  // Jalali viewing month/year
  const todayJalali = useMemo(() => dateToJalali(new Date()), []);
  const todayYmd = useMemo(() => toYMD(new Date()), []);
  const [jYear, setJYear] = useState(todayJalali.jy);
  const [jMonth, setJMonth] = useState(todayJalali.jm);

  // Gregorian viewing month/year
  const [gYear, setGYear] = useState(() => new Date().getFullYear());
  const [gMonth, setGMonth] = useState(() => new Date().getMonth());

  const popoverRef = useRef(null);
  const popoverContentRef = useRef(null);

  useViewportBoundary(open, popoverContentRef, { padding: 12 });

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
        setGYear(d.getFullYear());
        setGMonth(d.getMonth());
      }
    }
    setOpen(true);
  }, [startDate, endDate]);

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

  // Navigate Jalali month
  const prevJalaliMonth = () => {
    if (jMonth === 1) {
      setJMonth(12);
      setJYear((y) => y - 1);
    } else {
      setJMonth((m) => m - 1);
    }
  };

  const nextJalaliMonth = () => {
    if (jMonth === 12) {
      setJMonth(1);
      setJYear((y) => y + 1);
    } else {
      setJMonth((m) => m + 1);
    }
  };

  // Navigate Gregorian month
  const prevGregorianMonth = () => {
    if (gMonth === 0) {
      setGMonth(11);
      setGYear((y) => y - 1);
    } else {
      setGMonth((m) => m - 1);
    }
  };

  const nextGregorianMonth = () => {
    if (gMonth === 11) {
      setGMonth(0);
      setGYear((y) => y + 1);
    } else {
      setGMonth((m) => m + 1);
    }
  };

  // Handle Day Click
  const handleDateClick = (clickedYmd) => {
    if (!clickedYmd) return;

    // If no start yet, or both already set -> start fresh
    if (!draftStart || (draftStart && draftEnd)) {
      setDraftStart(clickedYmd);
      setDraftEnd('');
      return;
    }

    // Start is set, end is not -> set end (ensure chronological order)
    if (clickedYmd < draftStart) {
      setDraftEnd(draftStart);
      setDraftStart(clickedYmd);
    } else {
      setDraftEnd(clickedYmd);
    }
  };

  const handleConfirm = () => {
    if (!draftStart) return;
    onChange(draftStart, draftEnd || draftStart);
    setOpen(false);
  };

  const handleReset = () => {
    const todayStr = toYMD(new Date());
    setDraftStart(todayStr);
    setDraftEnd(todayStr);
  };

  // Format trigger label
  const formatTrigger = (ymd) => {
    if (!ymd) return 'انتخاب تاریخ';
    const d = fromYMD(ymd);
    if (!d) return ymd;

    if (calendarMode === 'jalali') {
      const j = dateToJalali(d);
      return `${toPersianDigits(j.jd)} ${PERSIAN_MONTH_NAMES[j.jm - 1]} ${toPersianDigits(j.jy)}`;
    }
    return `${d.getDate()} ${GREGORIAN_MONTHS[d.getMonth()]} ${d.getFullYear()}`;
  };

  // ── Build Grids ─────────────────────────────────────────────────────────────

  // Jalali Grid
  const jalaliGrid = useMemo(() => {
    const totalDays = getDaysInJalaliMonth(jYear, jMonth);
    const firstDayDate = jalaliToDate(jYear, jMonth, 1);
    const startWeekdayOffset = getJalaliDayOfWeekIndex(firstDayDate); // 0=Sat

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

  // Gregorian Grid
  const gregorianGrid = useMemo(() => {
    const firstDay = new Date(gYear, gMonth, 1).getDay(); // 0=Sun
    const daysInMonth = new Date(gYear, gMonth + 1, 0).getDate();

    const cells = [];
    for (let i = 0; i < firstDay; i++) {
      cells.push(null);
    }
    for (let dayNum = 1; dayNum <= daysInMonth; dayNum++) {
      const dateObj = new Date(gYear, gMonth, dayNum);
      cells.push({
        dayNum,
        ymd: toYMD(dateObj),
        displayNum: String(dayNum),
      });
    }
    return cells;
  }, [gYear, gMonth]);



  return (
    <div className="relative inline-block" ref={popoverRef}>
      {/* Trigger Button */}
      <button
        type="button"
        onClick={openPicker}
        className="flex items-center gap-2.5 px-4 py-2.5 bg-white border border-primary/20 hover:border-primary rounded-2xl shadow-sm hover:shadow transition-all text-xs md:text-sm font-bold text-textDark cursor-pointer"
        aria-label="انتخاب بازه تاریخی"
      >
        <CalendarIcon className="w-4 h-4 text-primary shrink-0" />
        <bdi className="text-primary font-black" dir={calendarMode === 'jalali' ? 'rtl' : 'ltr'}>
          {formatTrigger(startDate)}
        </bdi>
        <span className="text-textDark/40">تا</span>
        <bdi className="text-primary font-black" dir={calendarMode === 'jalali' ? 'rtl' : 'ltr'}>
          {formatTrigger(endDate)}
        </bdi>
      </button>

      {/* Popover */}
      {open && (
        <div
          ref={popoverContentRef}
          className="
            absolute z-50 top-full mt-2 right-0 left-auto md:left-0 md:right-auto
            bg-white border border-primary/15 rounded-3xl shadow-2xl
            w-[320px] sm:w-[340px] max-w-[calc(100vw-1.5rem)] overflow-hidden p-4 flex flex-col gap-3 animate-in fade-in zoom-in-95 duration-200
          "
        >
          {/* Mode switch & Reset */}
          <div className="flex items-center justify-between border-b border-primary/10 pb-3">
            <div className="flex items-center gap-1 bg-gray-100 p-0.5 rounded-xl">
              <button
                type="button"
                onClick={() => setCalendarMode('jalali')}
                className={`px-3 py-1 text-xs font-black rounded-lg transition-all cursor-pointer ${
                  calendarMode === 'jalali'
                    ? 'bg-primary text-white shadow-sm'
                    : 'text-textDark/70 hover:text-textDark'
                }`}
              >
                تقویم شمسی
              </button>
              <button
                type="button"
                onClick={() => setCalendarMode('gregorian')}
                className={`px-3 py-1 text-xs font-black rounded-lg transition-all cursor-pointer ${
                  calendarMode === 'gregorian'
                    ? 'bg-primary text-white shadow-sm'
                    : 'text-textDark/70 hover:text-textDark'
                }`}
              >
                Gregorian
              </button>
            </div>

            <button
              type="button"
              onClick={handleReset}
              className="text-xs text-textDark/60 hover:text-primary flex items-center gap-1 font-bold cursor-pointer"
              title="امروز"
            >
              <RotateCcw size={12} />
              <span>امروز</span>
            </button>
          </div>

          {/* Month Navigation */}
          <div
            className="flex items-center justify-between px-1"
            dir={calendarMode === 'jalali' ? 'rtl' : 'ltr'}
          >
            <button
              type="button"
              onClick={calendarMode === 'jalali' ? prevJalaliMonth : prevGregorianMonth}
              className="p-1.5 rounded-xl hover:bg-primary/10 text-primary transition-colors cursor-pointer"
              aria-label={calendarMode === 'jalali' ? "ماه قبل" : "Previous month"}
            >
              {calendarMode === 'jalali' ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
            </button>

            <span className="text-sm font-black text-primary">
              {calendarMode === 'jalali'
                ? `${PERSIAN_MONTH_NAMES[jMonth - 1]} ${toPersianDigits(jYear)}`
                : `${GREGORIAN_MONTHS[gMonth]} ${gYear}`}
            </span>

            <button
              type="button"
              onClick={calendarMode === 'jalali' ? nextJalaliMonth : nextGregorianMonth}
              className="p-1.5 rounded-xl hover:bg-primary/10 text-primary transition-colors cursor-pointer"
              aria-label={calendarMode === 'jalali' ? "ماه بعد" : "Next month"}
            >
              {calendarMode === 'jalali' ? <ChevronLeft size={18} /> : <ChevronRight size={18} />}
            </button>
          </div>

          {/* Calendar Body with explicit direction */}
          <div dir={calendarMode === 'jalali' ? 'rtl' : 'ltr'} className="flex flex-col gap-1">
            {/* Weekday headers */}
            <div className="grid grid-cols-7 text-center">
              {(calendarMode === 'jalali' ? JALALI_DAYS : GREGORIAN_DAYS).map((dayName, idx) => (
                <div
                  key={idx}
                  className="w-8 h-6 flex items-center justify-center text-xs font-bold text-textDark/50 mx-auto"
                >
                  {dayName}
                </div>
              ))}
            </div>

            {/* Days Grid */}
            <div className="grid grid-cols-7 gap-y-1">
              {(calendarMode === 'jalali' ? jalaliGrid : gregorianGrid).map((cell, idx) => {
                const isJalali = calendarMode === 'jalali';
                const isToday = cell ? cell.ymd === todayYmd : false;

                return (
                  <RangeCalendarCell
                    key={cell ? cell.ymd : `empty-${idx}`}
                    cell={cell}
                    colIndex={idx % 7}
                    draftStart={draftStart}
                    draftEnd={draftEnd}
                    hovered={hovered}
                    isRTL={isJalali}
                    isToday={isToday}
                    onClick={handleDateClick}
                    onMouseEnter={(ymd) => {
                      if (draftStart && !draftEnd) {
                        setHovered(ymd);
                      }
                    }}
                    onMouseLeave={() => setHovered(null)}
                  />
                );
              })}
            </div>
          </div>

          {/* Footer & Actions */}
          <div className="flex items-center justify-between pt-3 border-t border-primary/10 mt-1">
            <div className="text-xs text-textDark/70 font-medium">
              {draftStart ? (
                <span className="inline-flex items-center gap-1.5 flex-wrap">
                  <bdi className="font-bold text-textDark" dir={calendarMode === 'jalali' ? 'rtl' : 'ltr'}>
                    {formatTrigger(draftStart)}
                  </bdi>
                  {draftEnd && draftEnd !== draftStart ? (
                    <>
                      <span className="text-textDark/40 text-[11px]">تا</span>
                      <bdi className="font-bold text-textDark" dir={calendarMode === 'jalali' ? 'rtl' : 'ltr'}>
                        {formatTrigger(draftEnd)}
                      </bdi>
                    </>
                  ) : (
                    <span className="text-primary text-[11px] font-bold block sm:inline">
                      {' '}— روز پایان را انتخاب کنید
                    </span>
                  )}
                </span>
              ) : (
                <span className="text-textDark/40">روز شروع را انتخاب کنید</span>
              )}
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="px-3 py-1.5 rounded-xl text-xs font-bold text-textDark/70 hover:bg-gray-100 transition-colors cursor-pointer"
              >
                انصراف
              </button>
              <button
                type="button"
                onClick={handleConfirm}
                disabled={!draftStart}
                className="px-4 py-1.5 rounded-xl text-xs font-bold bg-primary text-white hover:bg-primary-dark disabled:opacity-40 disabled:cursor-not-allowed shadow-md transition-all cursor-pointer flex items-center gap-1"
              >
                <Check size={14} />
                <span>اعمال بازه</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
