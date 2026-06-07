// src/components/admin/exceptions/CustomDateRangePicker.jsx

import { useState, useEffect, useRef, useCallback } from 'react';
import { ChevronLeft, ChevronRight, CalendarDays } from 'lucide-react';

// ── Helpers ───────────────────────────────────────────────────────────────────

const DAYS   = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];
const MONTHS = [
  'January','February','March','April','May','June',
  'July','August','September','October','November','December',
];

const toYMD = (d) => {
  if (!d) return '';
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
};

const fromYMD = (str) => {
  if (!str) return null;
  const [y, m, d] = str.split('-').map(Number);
  return new Date(y, m - 1, d);
};

const formatDisplay = (str) => {
  if (!str) return '';
  const d = fromYMD(str);
  return `${d.getDate()} ${MONTHS[d.getMonth()]}`;
};

// Build the grid: leading nulls + day numbers for the month
const buildGrid = (year, month) => {
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const cells = Array(firstDay).fill(null);
  for (let i = 1; i <= daysInMonth; i++) cells.push(i);
  return cells;
};

// ── Component ─────────────────────────────────────────────────────────────────

/**
 * Props:
 *   startDate  : string  'YYYY-MM-DD' | ''
 *   endDate    : string  'YYYY-MM-DD' | ''
 *   onChange   : (start: string, end: string) => void   — called on Confirm
 */
export default function CustomDateRangePicker({ startDate, endDate, onChange }) {

  const [open, setOpen]         = useState(false);
  const [viewYear, setViewYear] = useState(() => new Date().getFullYear());
  const [viewMonth, setViewMonth] = useState(() => new Date().getMonth());

  // Internal draft state — only committed on Confirm
  const [draftStart, setDraftStart] = useState('');
  const [draftEnd,   setDraftEnd]   = useState('');
  const [hovered,    setHovered]    = useState(null); // YMD string while hovering

  const popoverRef = useRef(null);

  // Sync draft from props when popover opens
  const openPicker = useCallback(() => {
    setDraftStart(startDate || '');
    setDraftEnd(endDate || '');
    setHovered(null);
    // Navigate to the month of existing startDate if present
    if (startDate) {
      const d = fromYMD(startDate);
      setViewYear(d.getFullYear());
      setViewMonth(d.getMonth());
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

  // ── Calendar navigation ───────────────────────────────────────────────────

  const prevMonth = () => {
    if (viewMonth === 0) { setViewMonth(11); setViewYear((y) => y - 1); }
    else setViewMonth((m) => m - 1);
  };

  const nextMonth = () => {
    if (viewMonth === 11) { setViewMonth(0); setViewYear((y) => y + 1); }
    else setViewMonth((m) => m + 1);
  };

  // ── Day click logic ───────────────────────────────────────────────────────

  const handleDayClick = (day) => {
    if (!day) return;
    const clicked = toYMD(new Date(viewYear, viewMonth, day));

    // If no start yet, or both already set → start fresh
    if (!draftStart || (draftStart && draftEnd)) {
      setDraftStart(clicked);
      setDraftEnd('');
      return;
    }

    // Start is set, end is not → set end (ensure order)
    if (clicked < draftStart) {
      setDraftEnd(draftStart);
      setDraftStart(clicked);
    } else {
      setDraftEnd(clicked);
    }
  };

  // ── Day cell classification ───────────────────────────────────────────────

  const classifyDay = (day) => {
    if (!day) return 'empty';
    const ymd = toYMD(new Date(viewYear, viewMonth, day));
    const end = draftEnd || hovered;

    const isStart = ymd === draftStart;
    const isEnd   = end && ymd === end;
    const inRange = draftStart && end && ymd > draftStart && ymd < (end > draftStart ? end : draftStart);

    if (isStart && isEnd) return 'single';
    if (isStart)  return 'start';
    if (isEnd)    return 'end';
    if (inRange)  return 'range';
    return 'normal';
  };

  // ── Confirm ───────────────────────────────────────────────────────────────

  const handleConfirm = () => {
    if (!draftStart) return;
    onChange(draftStart, draftEnd || draftStart);
    setOpen(false);
  };

  // ── Cell styles ───────────────────────────────────────────────────────────

  const cellStyle = (type) => {
    const base = 'w-8 h-8 flex items-center justify-center text-sm select-none cursor-pointer transition-colors duration-100 ';
    switch (type) {
      case 'start':  return base + 'bg-[#2D5A4C] text-white rounded-full';
      case 'end':    return base + 'bg-[#2D5A4C] text-white rounded-full';
      case 'single': return base + 'bg-[#2D5A4C] text-white rounded-full';
      case 'range':  return base + 'bg-[#D1EAE3] text-[#2D5A4C] rounded-none';
      case 'normal': return base + 'text-gray-700 hover:bg-gray-100 rounded-full';
      default:       return base;
    }
  };

  // Row wrapper: adds left/right rounded caps to range spans
  const rowWrapStyle = (type) => {
    if (type === 'start') return 'bg-[#D1EAE3] rounded-l-full';
    if (type === 'end')   return 'bg-[#D1EAE3] rounded-r-full';
    return '';
  };

  const grid = buildGrid(viewYear, viewMonth);

  // ── Render ────────────────────────────────────────────────────────────────

  return (
    <div className="relative w-full" ref={popoverRef}>

      {/* ── Trigger inputs ── */}
      <div className="flex gap-3">
        <TriggerInput
          label="Start Date"
          value={formatDisplay(startDate)}
          onClick={openPicker}
        />
        <TriggerInput
          label="End Date"
          value={formatDisplay(endDate)}
          onClick={openPicker}
          icon
        />
      </div>

      {/* ── Popover ── */}
      {open && (
        <div className="
          absolute z-50 top-full mt-2 left-0
          bg-white border border-gray-200 rounded-2xl shadow-xl
          w-[300px] overflow-hidden
        ">

          {/* Month nav */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
            <button
              onClick={prevMonth}
              className="p-1 rounded-lg hover:bg-gray-100 transition-colors"
              aria-label="Previous month"
            >
              <ChevronLeft size={16} className="text-gray-600" />
            </button>
            <span className="text-sm font-semibold text-gray-800">
              {MONTHS[viewMonth]} {viewYear}
            </span>
            <button
              onClick={nextMonth}
              className="p-1 rounded-lg hover:bg-gray-100 transition-colors"
              aria-label="Next month"
            >
              <ChevronRight size={16} className="text-gray-600" />
            </button>
          </div>

          {/* Day-of-week headers */}
          <div className="grid grid-cols-7 px-3 pt-3 pb-1">
            {DAYS.map((d) => (
              <div key={d} className="w-8 h-6 flex items-center justify-center text-xs font-medium text-gray-400">
                {d}
              </div>
            ))}
          </div>

          {/* Day grid */}
          <div className="grid grid-cols-7 px-3 pb-3">
            {grid.map((day, i) => {
              const type = classifyDay(day);
              return (
                <div
                  key={i}
                  className={rowWrapStyle(type)}
                  onClick={() => handleDayClick(day)}
                  onMouseEnter={() => {
                    if (day && draftStart && !draftEnd) {
                      setHovered(toYMD(new Date(viewYear, viewMonth, day)));
                    }
                  }}
                  onMouseLeave={() => setHovered(null)}
                >
                  <div className={cellStyle(type)}>
                    {day || ''}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between px-4 py-3 border-t border-gray-100 bg-gray-50">
            <span className="text-sm text-gray-600">
              {draftStart
                ? `${formatDisplay(draftStart)}${draftEnd && draftEnd !== draftStart ? ` → ${formatDisplay(draftEnd)}` : ''}`
                : <span className="text-gray-400 italic text-xs">Select start date</span>
              }
            </span>
            <button
              onClick={handleConfirm}
              disabled={!draftStart}
              className="
                px-4 py-1.5 rounded-lg text-sm font-medium
                bg-[#2D5A4C] text-white
                hover:bg-[#234840] disabled:opacity-40
                disabled:cursor-not-allowed transition-colors
              "
            >
              Confirm
            </button>
          </div>

        </div>
      )}
    </div>
  );
}

// ── Sub-component: read-only trigger input ────────────────────────────────────

function TriggerInput({ label, value, onClick, icon = false }) {
  return (
    <div className="flex flex-col gap-1.5 flex-1">
      <label className="text-xs font-medium text-gray-500">{label}</label>
      <button
        type="button"
        onClick={onClick}
        className="
          w-full px-3 py-2 text-sm text-left
          border border-gray-200 rounded-lg bg-white
          text-gray-700 placeholder:text-gray-400
          hover:border-[#2D5A4C] focus:outline-none
          focus:ring-2 focus:ring-[#2D5A4C]
          transition-colors flex items-center justify-between
        "
      >
        <span className={value ? 'text-gray-800' : 'text-gray-400'}>
          {value || 'Select date'}
        </span>
        {icon && <CalendarDays size={14} className="text-gray-400 shrink-0" />}
      </button>
    </div>
  );
}
