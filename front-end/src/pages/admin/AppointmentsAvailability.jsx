// AppointmentsAvailability.jsx

import React, { useState, useCallback, useRef } from 'react';
import { Plus, Save } from 'lucide-react';
import ScheduleCard from '../../components/admin/availability/ScheduleCard';
import ReservationsList from '../../components/admin/reservations/ReservationsList';

// ─────────────────────────────────────────────────────────────────────────────
// CONSTANTS
// ─────────────────────────────────────────────────────────────────────────────

const TABS = ['Availability', 'Reservations', 'Exceptions'];

const createSchedule = (overrides = {}) => ({
  id:           `schedule_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
  patientName:  '',
  startTime:    '09:00',
  endTime:      '17:00',
  slotDuration: 30,
  gapDuration:  15,
  isActive:     true,
  selectedDays: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'],
  ...overrides,
});

// ─────────────────────────────────────────────────────────────────────────────
// PLACEHOLDER
// ─────────────────────────────────────────────────────────────────────────────

const Placeholder = ({ label }) => (
  <div className="flex flex-col items-center justify-center h-48 gap-2">
    <span className="text-4xl opacity-20">🗓</span>
    <p className="text-sm text-gray-400 font-medium">{label} — coming soon</p>
  </div>
);

// ─────────────────────────────────────────────────────────────────────────────
// MAIN COMPONENT
// ─────────────────────────────────────────────────────────────────────────────

const AppointmentsAvailability = () => {

  // 1. Default tab is now 'Availability'
  const [activeTab,  setActiveTab]  = useState('Availability');
  const [saveStatus, setSaveStatus] = useState('idle');

  const [schedules, setSchedules] = useState([
    createSchedule({
      id:          'schedule_default_1',
      patientName: 'Morning Clinic',
      startTime:   '09:00',
      endTime:     '13:00',
    }),
    createSchedule({
      id:          'schedule_default_2',
      patientName: 'Afternoon Walk-ins',
      startTime:   '14:00',
      endTime:     '18:00',
      selectedDays: ['Mon', 'Wed', 'Fri'],
    }),
  ]);

  // ─────────────────────────────────────────────────────────────────────────
  // DND: Native HTML5 Drag & Drop refs
  //
  // dragItem     — stores the INDEX of the schedule currently being dragged
  // dragOverItem — stores the INDEX of the schedule being hovered over
  // ─────────────────────────────────────────────────────────────────────────
  const dragItem     = useRef(null);
  const dragOverItem = useRef(null);

  // ─────────────────────────────────────────────────────────────────────────
  // DND: handleSort
  //
  // Called when drag ends (onDragEnd). Reorders the schedules array by:
  // 1. Making a copy of the current schedules
  // 2. Removing the dragged item from its original position
  // 3. Inserting it at the new position (dragOverItem)
  // 4. Updating state with the new order
  // 5. Resetting the refs
  // ─────────────────────────────────────────────────────────────────────────
  const handleSort = useCallback(() => {
    if (dragItem.current === null || dragOverItem.current === null) return;
    if (dragItem.current === dragOverItem.current) return;

    const dragItemIndex = dragItem.current;
    const dragOverIndex = dragOverItem.current;

    setSchedules((prevSchedules) => {
      const newSchedules = [...prevSchedules];
      const draggedSchedule = newSchedules.splice(dragItemIndex, 1)[0];
      newSchedules.splice(dragOverIndex, 0, draggedSchedule);
      return newSchedules;
    });

    dragItem.current     = null;
    dragOverItem.current = null;
  }, []);

  // ── CRUD handlers ──────────────────────────────────────────────────────────

  const handleUpdateSchedule = useCallback((updatedSchedule) => {
    setSchedules((prev) =>
      prev.map((s) => (s.id === updatedSchedule.id ? updatedSchedule : s))
    );
  }, []);

  const handleAddSchedule = useCallback(() => {
    setSchedules((prev) => [...prev, createSchedule()]);
  }, []);

  const handleDeleteSchedule = useCallback((id) => {
    setSchedules((prev) => {
      if (prev.length <= 1) return prev;
      return prev.filter((s) => s.id !== id);
    });
  }, []);

  // ── Save ───────────────────────────────────────────────────────────────────

  const saveSettings = useCallback(async () => {
    setSaveStatus('saving');
    const payload = {
      schedules: schedules.map((s) => ({
        id:           s.id,
        patientName:  s.patientName,
        startTime:    s.startTime,
        endTime:      s.endTime,
        slotDuration: s.slotDuration,
        gapDuration:  s.gapDuration,
        isActive:     s.isActive,
        selectedDays: s.selectedDays,
      })),
    };
    try {
      const response = await fetch('/api/admin/schedules', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify(payload),
      });
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      setSaveStatus('saved');
      setTimeout(() => setSaveStatus('idle'), 2500);
    } catch (err) {
      console.error('[saveSettings] Failed:', err);
      setSaveStatus('error');
      setTimeout(() => setSaveStatus('idle'), 3000);
    }
  }, [schedules]);

  const saveLabel = {
    idle:   'Save Settings',
    saving: 'Saving…',
    saved:  'Saved ✓',
    error:  'Error — Retry',
  }[saveStatus];

  const saveBg = {
    idle:   'bg-[#2F5D50] hover:bg-[#26503f]',
    saving: 'bg-[#2F5D50]/70 cursor-wait',
    saved:  'bg-emerald-600',
    error:  'bg-red-500 hover:bg-red-600',
  }[saveStatus];

  // ─────────────────────────────────────────────────────────────────────────
  // RENDER
  // ─────────────────────────────────────────────────────────────────────────

  return (
    <div className="-m-6 rounded-2xl overflow-hidden flex flex-col min-h-[calc(100vh-80px)]">

      {/* ── Header ── */}
      <div className="bg-[#2F5D50] px-4 sm:px-6 pt-6 pb-0 flex-shrink-0">
        <div className="flex items-center justify-between mb-5">
          <h1 className="text-white text-xl sm:text-2xl font-semibold">Appointments</h1>
          <button
            type="button"
            onClick={saveSettings}
            disabled={saveStatus === 'saving'}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-white text-sm font-medium shadow-md active:scale-95 transition-all duration-200 ${saveBg}`}
          >
            <Save size={15} />
            <span className="hidden sm:inline">{saveLabel}</span>
          </button>
        </div>

        {/* 3. Tab buttons — active gets soft pink, inactive transparent */}
        <div className="flex items-end gap-1 overflow-x-auto pb-0 no-scrollbar">
          {TABS.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`flex-shrink-0 px-4 sm:px-5 py-2.5 rounded-t-xl text-sm font-medium whitespace-nowrap transition-all duration-150 focus:outline-none ${
                activeTab === tab
                  ? 'bg-[#E9C9CD] text-[#2F5D50] shadow-sm'
                  : 'text-white/75 hover:text-white hover:bg-white/10'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      {/* ── Body ── */}
      <div className="bg-[#F5F5F0] flex-1 p-4 sm:p-6">

        {/* 2. ScheduleCard grid now lives under 'Availability' */}
        {activeTab === 'Availability' && (
          <div className="flex flex-col gap-6">

            <div className="
              grid gap-4
              grid-cols-1
              sm:grid-cols-2
              lg:grid-cols-3
              xl:grid-cols-4
            ">
              {schedules.map((schedule, index) => (
                /*
                  DND: Each card receives:
                  - index        : its position in the schedules array
                  - dragItem     : ref to track which card is being dragged
                  - dragOverItem : ref to track which card is being hovered over
                  - handleSort   : callback to reorder when drag ends
                */
                <ScheduleCard
                  key={schedule.id}
                  index={index}
                  schedule={schedule}
                  onChange={handleUpdateSchedule}
                  onDelete={
                    schedules.length > 1
                      ? () => handleDeleteSchedule(schedule.id)
                      : undefined
                  }
                  dragItem={dragItem}
                  dragOverItem={dragOverItem}
                  handleSort={handleSort}
                />
              ))}
            </div>

            {/* Add button */}
            <div className="flex items-center justify-center min-h-[80px]">
              <button
                type="button"
                onClick={handleAddSchedule}
                aria-label="Add new schedule"
                className="
                  w-16 h-16 rounded-full
                  bg-[#2a4e3f] text-white
                  flex items-center justify-center
                  shadow-[0_8px_24px_rgba(42,78,63,0.45)]
                  hover:bg-[#22423a]
                  hover:shadow-[0_12px_32px_rgba(42,78,63,0.55)]
                  hover:scale-105 active:scale-95
                  transition-all duration-200
                  focus:outline-none
                  focus-visible:ring-4 focus-visible:ring-[#2a4e3f]/40
                "
              >
                <Plus size={28} strokeWidth={2} />
              </button>
            </div>

            <p className="text-xs text-gray-400 text-right pr-1">
              {schedules.length} schedule{schedules.length !== 1 ? 's' : ''} configured
            </p>

          </div>
        )}


        {/* ← NEW: Reservations tab — full list UI */}
        {activeTab === 'Reservations' && <ReservationsList />}
        {/* 4. Placeholder content for other tabs */}
        {activeTab === 'Exceptions'   && <Placeholder label="Exceptions" />}

      </div>
    </div>
  );
};

export default AppointmentsAvailability;
