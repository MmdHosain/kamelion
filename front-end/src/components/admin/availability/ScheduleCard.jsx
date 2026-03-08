// ScheduleCard.jsx — Full corrected component

import React, { useCallback } from 'react';
import { Trash2, ChevronUp, ChevronDown } from 'lucide-react';

// ─────────────────────────────────────────────────────────────────────────────
// SUB-COMPONENTS
// ─────────────────────────────────────────────────────────────────────────────

/** Compact number spinner with proportionally sized chevrons */
const Spinner = ({ value, min = 5, max = 120, step = 5, onChange }) => {
  const increment = () => onChange(Math.min(value + step, max));
  const decrement = () => onChange(Math.max(value - step, min));

  return (
    <div className="flex flex-col items-center w-[72px]">
      <div className="flex flex-col items-center border border-gray-200 rounded-xl overflow-hidden bg-white shadow-sm w-full">
        {/* Up arrow */}
        <button
          type="button"
          onClick={increment}
          className="
            w-full flex items-center justify-center
            h-6                          
            hover:bg-gray-50 active:bg-gray-100
            transition-colors
            border-b border-gray-100
          "
        >
          <ChevronUp size={12} strokeWidth={2.5} className="text-gray-500" />
        </button>

        {/* Value display */}
        <div className="
          w-full h-9
          flex items-center justify-center
          text-sm font-semibold text-gray-800
          select-none
        ">
          {value}
        </div>

        {/* Down arrow */}
        <button
          type="button"
          onClick={decrement}
          className="
            w-full flex items-center justify-center
            h-6                          
            hover:bg-gray-50 active:bg-gray-100
            transition-colors
            border-t border-gray-100
          "
        >
          <ChevronDown size={12} strokeWidth={2.5} className="text-gray-500" />
        </button>
      </div>
    </div>
  );
};

/** Correctly proportioned toggle switch */
const Toggle = ({ checked, onChange }) => (
  <button
    type="button"
    role="switch"
    aria-checked={checked}
    onClick={() => onChange(!checked)}
    className={`
      relative inline-flex items-center
      w-10 h-[22px]           
      rounded-full
      transition-colors duration-200 ease-in-out
      focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-1
      focus-visible:ring-[#2F5D50]
      ${checked ? 'bg-[#2F5D50]' : 'bg-gray-300'}
    `}
  >
    {/* Thumb */}
    <span
      className={`
        absolute top-[3px]
        w-4 h-4                 
        rounded-full bg-white
        shadow-[0_1px_3px_rgba(0,0,0,0.25)]
        transition-transform duration-200 ease-in-out
        ${checked ? 'translate-x-[22px]' : 'translate-x-[3px]'}
      `}
    />
  </button>
);

// ─────────────────────────────────────────────────────────────────────────────
// TIME INPUT
// ─────────────────────────────────────────────────────────────────────────────

const TimeInput = ({ value, onChange }) => (
  <input
    type="time"
    value={value}
    onChange={(e) => onChange(e.target.value)}
    className="
      w-[112px] px-2.5 py-2
      border border-gray-200 rounded-xl
      text-sm font-medium text-gray-800
      bg-white shadow-sm
      focus:outline-none focus:ring-2 focus:ring-[#2F5D50]/40
      appearance-none
    "
  />
);

// ─────────────────────────────────────────────────────────────────────────────
// DAY SELECTOR
// ─────────────────────────────────────────────────────────────────────────────

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const DAY_LABELS = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];

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
            key={day}
            type="button"
            onClick={() => toggle(day)}
            className={`
              w-8 h-8 rounded-full           
              text-[11px] font-semibold
              flex items-center justify-center
              transition-all duration-150
              focus:outline-none
              ${active
                ? 'bg-[#2F5D50] text-white shadow-sm'
                : 'bg-gray-100 text-gray-400 hover:bg-gray-200'
              }
            `}
          >
            {DAY_LABELS[i]}
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
      bg-white rounded-2xl
      p-4
      shadow-[0_2px_12px_rgba(0,0,0,0.07)]
      border border-gray-100
      flex flex-col gap-4
      w-full
    ">

      {/* ── Row 1: Time range + delete ── */}
      <div className="flex items-center gap-2">
        <TimeInput value={schedule.startTime} onChange={(v) => update('startTime', v)} />
        <span className="text-xs text-gray-400 font-medium flex-shrink-0">to</span>
        <TimeInput value={schedule.endTime} onChange={(v) => update('endTime', v)} />

        {onDelete && (
          <button
            type="button"
            onClick={onDelete}
            aria-label="Delete schedule"
            className="
              ml-auto p-1.5 rounded-lg
              text-gray-300 hover:text-red-400 hover:bg-red-50
              transition-colors
            "
          >
            <Trash2 size={15} strokeWidth={1.8} />
          </button>
        )}
      </div>

      {/* HH:MM labels */}
      <div className="flex gap-2 -mt-3 px-0.5">
        <span className="text-[10px] text-gray-400 w-[112px] text-center">HH:MM</span>
        <span className="text-[10px] text-gray-400 w-[112px] text-center">HH:MM</span>
      </div>

      {/* ── Row 2: Gap + Slot spinners + Toggle ── */}
      <div className="flex items-center gap-3">

        {/* Gap spinner */}
        <div className="flex flex-col items-center gap-1">
          <Spinner
            value={schedule.gapDuration}
            onChange={(v) => update('gapDuration', v)}
          />
          <span className="text-[10px] text-gray-400 whitespace-nowrap">
            min gap {schedule.gapDuration}
          </span>
        </div>

        {/* Slot spinner */}
        <div className="flex flex-col items-center gap-1">
          <Spinner
            value={schedule.slotDuration}
            onChange={(v) => update('slotDuration', v)}
          />
          <span className="text-[10px] text-gray-400 whitespace-nowrap">
            min each {schedule.slotDuration}
          </span>
        </div>

        {/* Toggle — pushed to the right */}
        <div className="ml-auto flex flex-col items-center gap-1">
          <Toggle
            checked={schedule.isActive}
            onChange={(v) => update('isActive', v)}
          />
          <span className="text-[10px] text-gray-400">
            {schedule.isActive ? 'active' : 'paused'}
          </span>
        </div>
      </div>

      {/* ── Row 3: Day selector ── */}
      <DaySelector
        selectedDays={schedule.selectedDays}
        onChange={(v) => update('selectedDays', v)}
      />

    </div>
  );
};

export default ScheduleCard;
