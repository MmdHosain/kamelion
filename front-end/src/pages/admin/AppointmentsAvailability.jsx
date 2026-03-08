import React, { useState } from 'react';
import { Plus } from 'lucide-react';
import ScheduleCard from '../../components/admin/availability/ScheduleCard';

// ─────────────────────────────────────────────
const TABS = ['Reservations', 'Exceptions', 'Availability'];

const createSchedule = () => ({
  id: Date.now() + Math.random(), // replace with uuid() if you install uuid
  startTime: '09:00',
  endTime: '17:00',
  slotDuration: 30,
  gapDuration: 15,
  isActive: true,
  selectedDays: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'],
});

// ─────────────────────────────────────────────
const AppointmentsAvailability = () => {
  const [activeTab, setActiveTab] = useState('Reservations');

  /**
   * BACKEND-READY STATE
   * Send to API: POST /api/admin/schedules → body: JSON.stringify({ schedules })
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

  // ── CRUD ──────────────────────────────────

  /**
   * Called by ScheduleCard's onChange prop.
   * Receives the ENTIRE updated schedule object.
   * Replaces only the matching item by id.
   */
  const handleChange = (updatedSchedule) => {
    setSchedules((prev) =>
      prev.map((s) => (s.id === updatedSchedule.id ? updatedSchedule : s))
    );
  };

  const handleAdd = () => {
    setSchedules((prev) => [...prev, createSchedule()]);
  };

  const handleDelete = (id) => {
    setSchedules((prev) => prev.filter((s) => s.id !== id));
  };

  // ── API (wire up when backend is ready) ───
  // const handleSave = async () => {
  //   const res = await fetch('/api/admin/schedules', {
  //     method: 'POST',
  //     headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
  //     body: JSON.stringify({ schedules }),
  //   });
  //   const data = await res.json();
  // };

  // ─────────────────────────────────────────
  return (
    <div className="-m-6 rounded-2xl overflow-hidden">

      {/* ── Dark Green Header ── */}
      <div className="bg-[#2F5D50] px-6 pt-6 pb-0">
        <h1 className="text-white text-2xl font-semibold mb-5">
          Appointments
        </h1>

        {/* Tabs */}
        <div className="flex items-end gap-1">
          {TABS.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`
                px-5 py-2.5 rounded-t-xl text-sm font-medium
                transition-all duration-150 focus:outline-none
                ${activeTab === tab
                  ? 'bg-[#E9C9CD] text-[#2F5D50] shadow-sm'
                  : 'text-white/80 hover:text-white hover:bg-white/10'
                }
              `}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      {/* ── Light Body ── */}
      <div className="bg-[#F5F5F0] min-h-[calc(100vh-220px)] p-6">

        {activeTab === 'Reservations' && (
          <div className="flex flex-wrap gap-4 items-start">

            {/* Render each card — pass onChange and onDelete */}
            {schedules.map((schedule) => (
              <ScheduleCard
                key={schedule.id}
                schedule={schedule}
                onChange={handleChange}
                onDelete={schedules.length > 1 ? () => handleDelete(schedule.id) : undefined}
              />
            ))}

            {/* Add new schedule */}
            <div className="flex items-center pt-16">
              <button
                type="button"
                onClick={handleAdd}
                aria-label="Add schedule"
                className="
                  w-14 h-14 rounded-full bg-[#2F5D50] text-white
                  shadow-lg hover:bg-[#26503f] active:scale-95
                  transition-all duration-150 flex items-center justify-center
                "
              >
                <Plus size={24} />
              </button>
            </div>

          </div>
        )}

        {activeTab === 'Exceptions' && (
          <Placeholder label="Exceptions" />
        )}

        {activeTab === 'Availability' && (
          <Placeholder label="Availability" />
        )}

      </div>
    </div>
  );
};

const Placeholder = ({ label }) => (
  <div className="flex items-center justify-center h-48 text-gray-400 text-sm">
    {label} — coming soon
  </div>
);

export default AppointmentsAvailability;
