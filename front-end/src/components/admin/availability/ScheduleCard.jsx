// ScheduleCard.jsx

import React, { useCallback } from 'react';
import { Trash2, ChevronUp, ChevronDown, Clock, User } from 'lucide-react';

// ─────────────────────────────────────────────────────────────────────────────
// HELPERS
// ─────────────────────────────────────────────────────────────────────────────

const to12Hour = (time24) => {
  if (!time24) return '';
  const [hStr, mStr] = time24.split(':');
  let h = parseInt(hStr, 10);
  const m = mStr ?? '00';
  const period = h >= 12 ? 'PM' : 'AM';
  h = h % 12 || 12;
  return `${String(h).padStart(2, '0')}:${m} ${period}`;
};

// ─────────────────────────────────────────────────────────────────────────────
// PATIENT NAME INPUT
// ─────────────────────────────────────────────────────────────────────────────

const PatientNameInput = ({ value, onChange }) => (
  <div className="flex items-center gap-2 pb-3 border-b border-gray-100">
    <User
      size={13}
      strokeWidth={1.8}
      className="text-gray-300 flex-shrink-0"
    />
    <input
      type="text"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder="Schedule title or patient name…"
      maxLength={60}
      className="
        flex-1
        bg-transparent
        text-[13px] font-medium text-gray-700
        placeholder:text-gray-300
        outline-none border-none
        leading-none
      "
    />
  </div>
);

// ─────────────────────────────────────────────────────────────────────────────
// TIME INPUT
// ─────────────────────────────────────────────────────────────────────────────

const TimeInput = ({ value, onChange }) => (
  <label className="relative flex items-center cursor-pointer group">
    <div className="
      flex items-center justify-between gap-2
      w-[130px] px-3 py-[9px]
      bg-white border border-gray-200 rounded-xl
      shadow-sm
      group-focus-within:ring-2 group-focus-within:ring-[#2F5D50]/30
      group-focus-within:border-[#2F5D50]/50
      transition-all
    ">
      <span className="text-[13px] font-medium text-gray-700 leading-none">
        {to12Hour(value)}
      </span>
      <Clock size={13} strokeWidth={1.8} className="text-gray-400 flex-shrink-0" />
    </div>
    <input
      type="time"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
    />
  </label>
);

// ─────────────────────────────────────────────────────────────────────────────
// SPINNER
// ─────────────────────────────────────────────────────────────────────────────

const Spinner = ({ value, label, min = 5, max = 120, step = 5, onChange }) => {
  const increment = () => onChange(Math.min(value + step, max));
  const decrement = () => onChange(Math.max(value - step, min));

  return (
    <div className="flex flex-col items-center gap-[6px]">
      <div className="
        flex flex-col items-center
        w-[58px]
        border border-gray-200 rounded-xl
        overflow-hidden bg-white shadow-sm
        divide-y divide-gray-100
      ">
        <button
          type="button"
          onClick={increment}
          aria-label="Increase"
          className="w-full h-7 flex items-center justify-center hover:bg-gray-50 active:bg-gray-100 transition-colors"
        >
          <ChevronUp size={13} strokeWidth={2.5} className="text-gray-400" />
        </button>
        <div className="w-full h-10 flex items-center justify-center text-[15px] font-semibold text-gray-800 select-none bg-white">
          {value}
        </div>
        <button
          type="button"
          onClick={decrement}
          aria-label="Decrease"
          className="w-full h-7 flex items-center justify-center hover:bg-gray-50 active:bg-gray-100 transition-colors"
        >
          <ChevronDown size={13} strokeWidth={2.5} className="text-gray-400" />
        </button>
      </div>
      {label && (
        <span className="text-[10px] text-gray-400 text-center leading-tight whitespace-nowrap">
          {label}
        </span>
      )}
    </div>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// TOGGLE
// ─────────────────────────────────────────────────────────────────────────────

const Toggle = ({ checked, onChange }) => (
  <div className="flex flex-col items-center gap-[6px]">
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      className={`
        relative w-11 h-6 rounded-full
        transition-colors duration-200 ease-in-out
        focus:outline-none focus-visible:ring-2
        focus-visible:ring-offset-1 focus-visible:ring-[#2F5D50]
        flex-shrink-0
        ${checked ? 'bg-[#2F5D50]' : 'bg-gray-300'}
      `}
    >
      <span
        className={`
          absolute top-1 left-1
          w-4 h-4 rounded-full bg-white shadow-sm
          transition-transform duration-200 ease-in-out
          ${checked ? 'translate-x-[18px]' : 'translate-x-0'}
        `}
      />
    </button>
    <span className="text-[10px] text-gray-400 leading-none">
      {checked ? 'active' : 'paused'}
    </span>
  </div>
);

// ─────────────────────────────────────────────────────────────────────────────
// DAY SELECTOR
// ─────────────────────────────────────────────────────────────────────────────

const DAYS      = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const DAY_SHORT = ['S',   'M',   'T',   'W',   'T',   'F',   'S'  ];

const DaySelector = ({ selectedDays, onChange }) => {
  const toggle = (day) => {
    const next = selectedDays.includes(day)
      ? selectedDays.filter((d) => d !== day)
      : [...selectedDays, day];
    onChange(next);
  };

  return (
    <div className="flex items-center justify-between gap-1 w-full">
      {DAYS.map((day, i) => {
        const active = selectedDays.includes(day);
        return (
          <button
            key={`${day}-${i}`}
            type="button"
            onClick={() => toggle(day)}
            className={`
              w-8 h-8 rounded-full text-[11px] font-semibold
              flex items-center justify-center
              transition-all duration-150 focus:outline-none
              ${active
                ? 'bg-[#2F5D50] text-white shadow-sm'
                : 'bg-gray-100 text-gray-400 hover:bg-gray-200'
              }
            `}
          >
            {DAY_SHORT[i]}
          </button>
        );
      })}
    </div>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// SCHEDULE CARD
// ─────────────────────────────────────────────────────────────────────────────

const ScheduleCard = ({ schedule, onChange, onDelete }) => {
  const update = useCallback(
    (field, value) => onChange({ ...schedule, [field]: value }),
    [schedule, onChange]
  );

  return (
    <div className="
      relative
      bg-white rounded-2xl
      p-4 pt-8
      shadow-[0_2px_16px_rgba(0,0,0,0.07)]
      border border-gray-100
      flex flex-col gap-4
      w-full
    ">

      {/* ── Trash icon — absolute top-left ───────────────────────────────── */}
      {onDelete && (
        <button
          type="button"
          onClick={onDelete}
          aria-label="Delete schedule"
          className="
            absolute top-3 left-3
            p-1.5 rounded-lg
            text-gray-300
            hover:text-red-400 hover:bg-red-50
            transition-colors duration-150
          "
        >
          <Trash2 size={14} strokeWidth={1.8} />
        </button>
      )}

      {/* ── Row 0: Patient Name ──────────────────────────────────────────── */}
      <PatientNameInput
        value={schedule.patientName}
        onChange={(v) => update('patientName', v)}
      />

      {/* ── Row 1: Time range ────────────────────────────────────────────── */}
      <div className="flex items-center gap-2">
        <TimeInput
          value={schedule.startTime}
          onChange={(v) => update('startTime', v)}
        />
        <span className="text-xs text-gray-400 font-medium flex-shrink-0">to</span>
        <TimeInput
          value={schedule.endTime}
          onChange={(v) => update('endTime', v)}
        />
      </div>

      {/* HH:MM hint labels */}
      <div className="flex gap-2 -mt-3">
        <span className="text-[10px] text-gray-400 w-[130px] text-center">HH:MM</span>
        <span className="text-[10px] text-gray-400 w-[130px] text-center">HH:MM</span>
      </div>

      {/* ── Row 2: Spinners + Toggle ─────────────────────────────────────── */}
      <div className="flex items-end gap-4">
        <Spinner
          value={schedule.gapDuration}
          label={`min gap ${schedule.gapDuration}`}
          onChange={(v) => update('gapDuration', v)}
        />
        <Spinner
          value={schedule.slotDuration}
          label={`min each ${schedule.slotDuration}`}
          onChange={(v) => update('slotDuration', v)}
        />
        <div className="flex-1" />
        <Toggle
          checked={schedule.isActive}
          onChange={(v) => update('isActive', v)}
        />
      </div>

      {/* ── Row 3: Day selector ──────────────────────────────────────────── */}
      <DaySelector
        selectedDays={schedule.selectedDays}
        onChange={(v) => update('selectedDays', v)}
      />

    </div>
  );
};

export default ScheduleCard;
