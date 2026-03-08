import React, { useState } from 'react';
import { ChevronUp, ChevronDown, Plus } from 'lucide-react';

// ─────────────────────────────────────────────
//  CONSTANTS
// ─────────────────────────────────────────────
const TABS = ['Reservations', 'Exceptions', 'Availability'];

const ALL_DAYS = [
  { key: 'Sun', label: 'S' },
  { key: 'Mon', label: 'M' },
  { key: 'Tue', label: 'T' },
  { key: 'Wed', label: 'W' },
  { key: 'Thu', label: 'T' },
  { key: 'Fri', label: 'F' },
  { key: 'Sat', label: 'S' },
];

const SLOT_OPTIONS   = [10, 15, 20, 30, 45, 60];
const GAP_OPTIONS    = [0, 5, 10, 15, 20, 30];

const DEFAULT_SCHEDULE = () => ({
  id: Date.now(),
  startTime: '09:00',
  endTime: '17:00',
  slotDuration: 30,
  gapDuration: 15,
  isActive: true,
  selectedDays: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'],
});

// ─────────────────────────────────────────────
//  SUB-COMPONENTS
// ─────────────────────────────────────────────

/** Stepper spinner for slot/gap values */
const Stepper = ({ value, options, onChange }) => {
  const currentIndex = options.indexOf(value);

  const increment = () => {
    if (currentIndex < options.length - 1) onChange(options[currentIndex + 1]);
  };
  const decrement = () => {
    if (currentIndex > 0) onChange(options[currentIndex - 1]);
  };

  return (
    <div className="flex items-center border border-gray-200 rounded-lg overflow-hidden bg-white">
      <span className="flex-1 text-center text-sm font-medium text-gray-700 px-4 py-2 select-none">
        {value}
      </span>
      <div className="flex flex-col border-l border-gray-200">
        <button
          onClick={increment}
          className="px-2 py-1 hover:bg-gray-50 transition-colors text-gray-500 hover:text-gray-700"
          aria-label="Increase"
        >
          <ChevronUp size={14} />
        </button>
        <button
          onClick={decrement}
          className="px-2 py-1 hover:bg-gray-50 transition-colors text-gray-500 hover:text-gray-700 border-t border-gray-200"
          aria-label="Decrease"
        >
          <ChevronDown size={14} />
        </button>
      </div>
    </div>
  );
};

/** Time input HH:MM */
const TimeInput = ({ value, onChange }) => (
  <div className="flex flex-col gap-1">
    <input
      type="time"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="border border-gray-200 rounded-lg px-3 py-2 text-sm font-medium
                 text-gray-700 bg-white focus:outline-none focus:ring-2
                 focus:ring-[#2F5D50]/30 focus:border-[#2F5D50] transition-all
                 w-32 cursor-pointer"
    />
    <span className="text-[10px] text-gray-400 tracking-wide">HH:MM</span>
  </div>
);

/** Toggle switch */
const Toggle = ({ checked, onChange }) => (
  <button
    role="switch"
    aria-checked={checked}
    onClick={() => onChange(!checked)}
    className={`relative inline-flex items-center w-12 h-6 rounded-full transition-colors duration-200 focus:outline-none
      ${checked ? 'bg-[#2F5D50]' : 'bg-gray-300'}`}
  >
    <span
      className={`inline-block w-5 h-5 bg-white rounded-full shadow-md transform transition-transform duration-200
        ${checked ? 'translate-x-6' : 'translate-x-1'}`}
    />
  </button>
);

/** Day selector pills */
const DaySelector = ({ selectedDays, onChange }) => {
  const toggle = (key) => {
    const updated = selectedDays.includes(key)
      ? selectedDays.filter((d) => d !== key)
      : [...selectedDays, key];
    onChange(updated);
  };

  return (
    <div className="flex items-center gap-1.5">
      {ALL_DAYS.map(({ key, label }) => {
        const active = selectedDays.includes(key);
        return (
          <button
            key={key}
            onClick={() => toggle(key)}
            title={key}
            className={`w-9 h-9 rounded-full text-xs font-semibold transition-all duration-150 focus:outline-none
              ${active
                ? 'bg-[#2F5D50] text-white shadow-sm'
                : 'border border-gray-300 text-gray-500 hover:border-[#2F5D50] hover:text-[#2F5D50]'
              }`}
          >
            {label}
          </button>
        );
      })}
    </div>
  );
};

/** Single schedule card */
const ScheduleCard = ({ schedule, onUpdate, onRemove }) => {
  const update = (field, value) =>
    onUpdate(schedule.id, { ...schedule, [field]: value });

  return (
    <div className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm
                    hover:shadow-md transition-shadow duration-200 min-w-[280px] flex-1">

      {/* Time Range Row */}
      <div className="flex items-end gap-3 mb-4">
        <TimeInput
          value={schedule.startTime}
          onChange={(v) => update('startTime', v)}
        />
        <span className="text-sm text-gray-400 mb-3">to</span>
        <TimeInput
          value={schedule.endTime}
          onChange={(v) => update('endTime', v)}
        />
      </div>

      {/* Slot & Gap Row */}
      <div className="flex items-start gap-4 mb-5">
        <div className="flex flex-col gap-1">
          <Stepper
            value={schedule.slotDuration}
            options={SLOT_OPTIONS}
            onChange={(v) => update('slotDuration', v)}
          />
          <span className="text-[10px] text-gray-400">{schedule.slotDuration} min each</span>
        </div>
        <div className="flex flex-col gap-1">
          <Stepper
            value={schedule.gapDuration}
            options={GAP_OPTIONS}
            onChange={(v) => update('gapDuration', v)}
          />
          <span className="text-[10px] text-gray-400">{schedule.gapDuration} min gap</span>
        </div>
      </div>

      {/* Footer: Toggle + Days */}
      <div className="flex items-center gap-3 flex-wrap">
        <Toggle
          checked={schedule.isActive}
          onChange={(v) => update('isActive', v)}
        />
        <DaySelector
          selectedDays={schedule.selectedDays}
          onChange={(v) => update('selectedDays', v)}
        />
      </div>
    </div>
  );
};

// ─────────────────────────────────────────────
//  MAIN PAGE
// ─────────────────────────────────────────────
const AppointmentsAvailability = () => {
  const [activeTab, setActiveTab] = useState('Reservations');

  /** 
   * BACKEND-READY STATE
   * POST /api/admin/schedules → send `schedules` array directly
   * Each object maps cleanly to a DB row
   */
  const [schedules, setSchedules] = useState([
    {
      id: 1,
      startTime: '09:00',
      endTime: '17:00',
      slotDuration: 30,
      gapDuration: 15,
      isActive: true,
      selectedDays: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'],
    },
    {
      id: 2,
      startTime: '09:00',
      endTime: '17:00',
      slotDuration: 30,
      gapDuration: 15,
      isActive: true,
      selectedDays: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'],
    },
  ]);

  // ── CRUD Handlers ──────────────────────────

  const handleUpdate = (id, updatedSchedule) => {
    setSchedules((prev) =>
      prev.map((s) => (s.id === id ? updatedSchedule : s))
    );
  };

  const handleAdd = () => {
    setSchedules((prev) => [...prev, DEFAULT_SCHEDULE()]);
  };

  const handleRemove = (id) => {
    setSchedules((prev) => prev.filter((s) => s.id !== id));
  };

  // ── API Helper (wire up later) ─────────────
  // const handleSave = async () => {
  //   await fetch('/api/admin/schedules', {
  //     method: 'POST',
  //     headers: { 'Content-Type': 'application/json' },
  //     body: JSON.stringify({ schedules }),
  //   });
  // };

  // ─────────────────────────────────────────────
  return (
    <div className="-m-6 rounded-2xl overflow-hidden">

      {/* ── Dark Green Header ── */}
      <div className="bg-[#2F5D50] px-6 pt-6 pb-0">

        {/* Page Title */}
        <h1 className="text-white text-2xl font-semibold mb-5">
          Appointments
        </h1>

        {/* Tabs */}
        <div className="flex items-end gap-1">
          {TABS.map((tab) => {
            const isActive = activeTab === tab;
            return (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-5 py-2.5 rounded-t-xl text-sm font-medium transition-all duration-150 focus:outline-none
                  ${isActive
                    ? 'bg-[#E9C9CD] text-[#2F5D50] shadow-sm'
                    : 'text-white/80 hover:text-white hover:bg-white/10'
                  }`}
              >
                {tab}
              </button>
            );
          })}
        </div>
      </div>

      {/* ── Light Body ── */}
      <div className="bg-[#F5F5F0] min-h-[calc(100vh-220px)] p-6">
        {activeTab === 'Reservations' && (
          <ReservationsTab
            schedules={schedules}
            onUpdate={handleUpdate}
            onAdd={handleAdd}
            onRemove={handleRemove}
          />
        )}
        {activeTab === 'Exceptions' && (
          <PlaceholderTab label="Exceptions" />
        )}
        {activeTab === 'Availability' && (
          <PlaceholderTab label="Availability" />
        )}
      </div>
    </div>
  );
};

// ─────────────────────────────────────────────
//  TAB CONTENT COMPONENTS
// ─────────────────────────────────────────────

const ReservationsTab = ({ schedules, onUpdate, onAdd, onRemove }) => (
  <div className="flex flex-wrap gap-4 items-start">
    {schedules.map((schedule) => (
      <ScheduleCard
        key={schedule.id}
        schedule={schedule}
        onUpdate={onUpdate}
        onRemove={onRemove}
      />
    ))}

    {/* Add New Schedule Button */}
    <div className="flex items-start pt-1">
      <button
        onClick={onAdd}
        aria-label="Add new schedule"
        className="w-14 h-14 rounded-full bg-[#2F5D50] text-white shadow-lg
                   hover:bg-[#26503f] active:scale-95 transition-all duration-150
                   flex items-center justify-center mt-16"
      >
        <Plus size={24} />
      </button>
    </div>
  </div>
);

const PlaceholderTab = ({ label }) => (
  <div className="flex items-center justify-center h-48 text-gray-400 text-sm">
    {label} content coming soon...
  </div>
);

export default AppointmentsAvailability;
