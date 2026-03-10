// AppointmentsAvailability.jsx

import React, { useState, useCallback } from 'react';
import { Plus, Save } from 'lucide-react';
import ScheduleCard from '../../components/admin/availability/ScheduleCard';

// ─────────────────────────────────────────────────────────────────────────────
// CONSTANTS
// ─────────────────────────────────────────────────────────────────────────────

const TABS = ['Reservations', 'Exceptions', 'Availability'];

/**
 * Factory — always returns a fresh schedule with safe defaults.
 * Pass `overrides` to pre-fill specific fields (e.g. seed data).
 *
 * Shape (matches backend API contract):
 * {
 *   id           : string   — local key (swap with DB id after POST)
 *   patientName  : string   — schedule title / patient label
 *   startTime    : string   — "HH:MM" (24-hour)
 *   endTime      : string   — "HH:MM" (24-hour)
 *   slotDuration : number   — minutes per booking slot
 *   gapDuration  : number   — buffer minutes between slots
 *   isActive     : boolean  — schedule is live / paused
 *   selectedDays : string[] — subset of ['Sun','Mon','Tue','Wed','Thu','Fri','Sat']
 * }
 */
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
// PLACEHOLDER (used for unbuilt tabs)
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

  // ── Tab state ──────────────────────────────────────────────────────────────
  const [activeTab, setActiveTab] = useState('Reservations');

  // ── Save feedback state ────────────────────────────────────────────────────
  const [saveStatus, setSaveStatus] = useState('idle'); // 'idle' | 'saving' | 'saved' | 'error'

  // ── Schedule state ─────────────────────────────────────────────────────────
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

  // ── CRUD handlers ──────────────────────────────────────────────────────────

  /**
   * handleUpdateSchedule
   * Called by ScheduleCard via its onChange prop.
   * Receives the FULL updated schedule object — replaces only the matching entry.
   *
   * @param {object} updatedSchedule - complete schedule object with same id
   */
  const handleUpdateSchedule = useCallback((updatedSchedule) => {
    setSchedules((prev) =>
      prev.map((s) => (s.id === updatedSchedule.id ? updatedSchedule : s))
    );
  }, []);

  /**
   * handleAddSchedule
   * Pushes a fresh schedule with safe defaults into state.
   * The new card renders immediately — no async work needed.
   */
  const handleAddSchedule = useCallback(() => {
    setSchedules((prev) => [...prev, createSchedule()]);
  }, []);

  /**
   * handleDeleteSchedule
   * Removes a schedule by id.
   * Guard: never allows deleting the last card (keeps at least 1).
   *
   * @param {string} id
   */
  const handleDeleteSchedule = useCallback((id) => {
    setSchedules((prev) => {
      if (prev.length <= 1) return prev; // guard — keep minimum 1
      return prev.filter((s) => s.id !== id);
    });
  }, []);

  // ── Backend API call ───────────────────────────────────────────────────────

  /**
   * saveSettings
   *
   * Serialises the current schedules state and POSTs it to your backend.
   * Wire the Authorization header to your auth token (JWT / session).
   *
   * Request body shape:
   * {
   *   schedules: [{
   *     id, patientName, startTime, endTime,
   *     slotDuration, gapDuration, isActive, selectedDays
   *   }]
   * }
   */
  const saveSettings = useCallback(async () => {
    setSaveStatus('saving');

    // Payload — exactly what the backend receives
    const payload = {
      schedules: schedules.map((s) => ({
        id:           s.id,
        patientName:  s.patientName,   // ← included in API payload
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
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          // Authorization: `Bearer ${yourAuthToken}`,
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) throw new Error(`HTTP ${response.status}`);

      // Optional: reconcile local ids with DB-generated ids
      // const data = await response.json();
      // setSchedules(data.schedules);

      setSaveStatus('saved');
      setTimeout(() => setSaveStatus('idle'), 2500);
    } catch (err) {
      console.error('[saveSettings] Failed:', err);
      setSaveStatus('error');
      setTimeout(() => setSaveStatus('idle'), 3000);
    }
  }, [schedules]);

  // ── Save button helpers ────────────────────────────────────────────────────

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

      {/* ── Dark Green Header ───────────────────────────────────────────── */}
      <div className="bg-[#2F5D50] px-4 sm:px-6 pt-6 pb-0 flex-shrink-0">

        {/* Title + Save row */}
        <div className="flex items-center justify-between mb-5">
          <h1 className="text-white text-xl sm:text-2xl font-semibold">
            Appointments
          </h1>

          <button
            type="button"
            onClick={saveSettings}
            disabled={saveStatus === 'saving'}
            className={`
              flex items-center gap-2 px-4 py-2 rounded-xl
              text-white text-sm font-medium
              shadow-md active:scale-95
              transition-all duration-200
              ${saveBg}
            `}
          >
            <Save size={15} />
            <span className="hidden sm:inline">{saveLabel}</span>
          </button>
        </div>

        {/* Tab row */}
        <div className="flex items-end gap-1 overflow-x-auto pb-0 no-scrollbar">
          {TABS.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`
                flex-shrink-0 px-4 sm:px-5 py-2.5 rounded-t-xl
                text-sm font-medium whitespace-nowrap
                transition-all duration-150 focus:outline-none
                ${activeTab === tab
                  ? 'bg-[#E9C9CD] text-[#2F5D50] shadow-sm'
                  : 'text-white/75 hover:text-white hover:bg-white/10'
                }
              `}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      {/* ── Body ────────────────────────────────────────────────────────── */}
      <div className="bg-[#F5F5F0] flex-1 p-4 sm:p-6">

        {/* ── RESERVATIONS TAB ── */}
        {activeTab === 'Reservations' && (
          <div className="flex flex-col gap-6">

            {/*
              RESPONSIVE CARD GRID
              ────────────────────────────────────────────
              Mobile  (< sm) : 1 column
              Tablet  (sm)   : 2 columns
              Desktop (lg)   : 3 columns
              Wide    (xl)   : 4 columns
            */}
            <div className="
              grid gap-4
              grid-cols-1
              sm:grid-cols-2
              lg:grid-cols-3
              xl:grid-cols-4
            ">

              {/* Schedule cards */}
              {schedules.map((schedule) => (
                <ScheduleCard
                  key={schedule.id}
                  schedule={schedule}
                  onChange={handleUpdateSchedule}
                  onDelete={
                    schedules.length > 1
                      ? () => handleDeleteSchedule(schedule.id)
                      : undefined  // hides trash icon when only 1 card remains
                  }
                />
              ))}

              {/* ── Add (+) button card ── */}
              <div className="flex items-center justify-center min-h-[180px]">
                <button
                  type="button"
                  onClick={handleAddSchedule}
                  aria-label="Add new schedule"
                  title="Add schedule"
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

            </div>

            {/* Schedule count indicator */}
            <p className="text-xs text-gray-400 text-right pr-1">
              {schedules.length} schedule{schedules.length !== 1 ? 's' : ''} configured
            </p>

          </div>
        )}

        {/* ── EXCEPTIONS TAB ── */}
        {activeTab === 'Exceptions' && <Placeholder label="Exceptions" />}

        {/* ── AVAILABILITY TAB ── */}
        {activeTab === 'Availability' && <Placeholder label="Availability" />}

      </div>
    </div>
  );
};

export default AppointmentsAvailability;
