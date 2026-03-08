import React from 'react';
import { ChevronUp, ChevronDown, Trash2 } from 'lucide-react';

// ─────────────────────────────────────────────
//  CONSTANTS
// ─────────────────────────────────────────────
const DAYS = [
  { key: 'Sun', label: 'S' },
  { key: 'Mon', label: 'M' },
  { key: 'Tue', label: 'T' },
  { key: 'Wed', label: 'W' },
  { key: 'Thu', label: 'T' },
  { key: 'Fri', label: 'F' },
  { key: 'Sat', label: 'S' },
];

const SLOT_STEPS = [10, 15, 20, 30, 45, 60];
const GAP_STEPS  = [0, 5, 10, 15, 20, 30];

// ─────────────────────────────────────────────
//  INTERNAL SUB-COMPONENTS (private to this file)
// ─────────────────────────────────────────────

/** HH:MM time input with label underneath */
const TimeField = ({ value, onChange }) => (
  <div className="flex flex-col gap-1.5">
    <input
      type="time"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="
        w-28 px-3 py-2 text-sm font-semibold text-gray-700
        border border-gray-200 rounded-lg bg-white
        focus:outline-none focus:ring-2 focus:ring-[#2F5D50]/25 focus:border-[#2F5D50]
        transition-all duration-150 cursor-pointer
        [&::-webkit-calendar-picker-indicator]:opacity-0
        [&::-webkit-calendar-picker-indicator]:absolute
      "
    />
    <span className="text-[10px] text-gray-400 tracking-widest font-medium pl-1">
      HH:MM
    </span>
  </div>
);

/** Step spinner — cycles through a fixed options array */
const StepSpinner = ({ value, options, onChange }) => {
  const index   = options.indexOf(value);
  const canUp   = index < options.length - 1;
  const canDown = index > 0;

  return (
    <div className="flex items-stretch border border-gray-200 rounded-lg overflow-hidden bg-white w-24">
      {/* Value display */}
      <span className="flex-1 flex items-center justify-center text-sm font-semibold text-gray-700 select-none">
        {value}
      </span>

      {/* Arrow column */}
      <div className="flex flex-col border-l border-gray-200">
        <button
          type="button"
          onClick={() => canUp && onChange(options[index + 1])}
          disabled={!canUp}
          className="
            flex items-center justify-center px-2 py-1.5
            text-gray-400 hover:text-[#2F5D50] hover:bg-gray-50
            disabled:opacity-30 disabled:cursor-not-allowed
            transition-colors duration-100
          "
          aria-label="Increase"
        >
          <ChevronUp size={13} strokeWidth={2.5} />
        </button>

        <div className="h-px bg-gray-200" />

        <button
          type="button"
          onClick={() => canDown && onChange(options[index - 1])}
          disabled={!canDown}
          className="
            flex items-center justify-center px-2 py-1.5
            text-gray-400 hover:text-[#2F5D50] hover:bg-gray-50
            disabled:opacity-30 disabled:cursor-not-allowed
            transition-colors duration-100
          "
          aria-label="Decrease"
        >
          <ChevronDown size={13} strokeWidth={2.5} />
        </button>
      </div>
    </div>
  );
};

/** Custom toggle switch */
const ToggleSwitch = ({ checked, onChange }) => (
  <button
    type="button"
    role="switch"
    aria-checked={checked}
    onClick={() => onChange(!checked)}
    className={`
      relative inline-flex items-center w-12 h-6 rounded-full
      transition-colors duration-200 focus:outline-none
      focus-visible:ring-2 focus-visible:ring-[#2F5D50]/40
      ${checked ? 'bg-[#2F5D50]' : 'bg-gray-300'}
    `}
  >
    <span
      className={`
        inline-block w-[18px] h-[18px] bg-white rounded-full shadow-md
        transform transition-transform duration-200
        ${checked ? 'translate-x-6' : 'translate-x-1'}
      `}
    />
  </button>
);

/** Day-of-week circular pill */
const DayPill = ({ label, active, onClick }) => (
  <button
    type="button"
    onClick={onClick}
    className={`
      w-9 h-9 rounded-full text-xs font-semibold
      transition-all duration-150 focus:outline-none
      focus-visible:ring-2 focus-visible:ring-[#2F5D50]/40
      ${active
        ? 'bg-[#2F5D50] text-white shadow-sm'
        : 'bg-white border border-gray-300 text-gray-400 hover:border-[#2F5D50] hover:text-[#2F5D50]'
      }
    `}
  >
    {label}
  </button>
);

// ─────────────────────────────────────────────
//  MAIN EXPORTED COMPONENT
// ─────────────────────────────────────────────

/**
 * ScheduleCard
 *
 * @param {object}   schedule  - The full schedule object from parent state
 * @param {function} onChange  - (updatedSchedule) => void  — parent updates its array
 * @param {function} [onDelete] - () => void — optional delete handler
 */
const ScheduleCard = ({ schedule, onChange, onDelete }) => {

  /** Generic field updater — keeps all other fields intact */
  const set = (field, value) => onChange({ ...schedule, [field]: value });

  /** Toggle a day key in/out of the selectedDays array */
  const toggleDay = (key) => {
    const next = schedule.selectedDays.includes(key)
      ? schedule.selectedDays.filter((d) => d !== key)
      : [...schedule.selectedDays, key];
    set('selectedDays', next);
  };

  return (
    <div
      className="
        relative bg-white rounded-xl shadow-sm border border-gray-100
        p-5 flex flex-col gap-5 w-full max-w-xs
        hover:shadow-md transition-shadow duration-200
      "
    >
      {/* ── Optional Delete Button ─────────────── */}
      {onDelete && (
        <button
          type="button"
          onClick={onDelete}
          aria-label="Delete schedule"
          className="
            absolute top-3 right-3 p-1.5 rounded-lg
            text-gray-300 hover:text-red-400 hover:bg-red-50
            transition-colors duration-150
          "
        >
          <Trash2 size={15} />
        </button>
      )}

      {/* ── ROW 1 : Time Range ─────────────────── */}
      <div className="flex items-start gap-2">
        <TimeField
          value={schedule.startTime}
          onChange={(v) => set('startTime', v)}
        />

        <span className="text-sm text-gray-400 mt-2.5 select-none">to</span>

        <TimeField
          value={schedule.endTime}
          onChange={(v) => set('endTime', v)}
        />
      </div>

      {/* ── ROW 2 : Slot Duration & Gap ────────── */}
      <div className="flex items-start gap-4">
        {/* Slot duration */}
        <div className="flex flex-col gap-1.5">
          <StepSpinner
            value={schedule.slotDuration}
            options={SLOT_STEPS}
            onChange={(v) => set('slotDuration', v)}
          />
          <span className="text-[10px] text-gray-400 pl-1">
            {schedule.slotDuration} min each
          </span>
        </div>

        {/* Gap duration */}
        <div className="flex flex-col gap-1.5">
          <StepSpinner
            value={schedule.gapDuration}
            options={GAP_STEPS}
            onChange={(v) => set('gapDuration', v)}
          />
          <span className="text-[10px] text-gray-400 pl-1">
            {schedule.gapDuration} min gap
          </span>
        </div>
      </div>

      {/* ── ROW 3 : Toggle + Day Selector ─────── */}
      <div className="flex items-center gap-3 flex-wrap">
        <ToggleSwitch
          checked={schedule.isActive}
          onChange={(v) => set('isActive', v)}
        />

        <div className="flex items-center gap-1.5">
          {DAYS.map(({ key, label }) => (
            <DayPill
              key={key}
              label={label}
              active={schedule.selectedDays.includes(key)}
              onClick={() => toggleDay(key)}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default ScheduleCard;
