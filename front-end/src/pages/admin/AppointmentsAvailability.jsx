import React, { useState, useCallback, useRef, useEffect } from 'react';
import { Plus, Save } from 'lucide-react';
import ScheduleCard from '../../components/admin/availability/ScheduleCard';
import ReservationsList from '../../components/admin/reservations/ReservationsList';
import ExceptionsList from '../../components/admin/exceptions/ExceptionsList';
import {
  getAdminSlots,
  bulkSaveAdminSlots,
} from '../../api/schedules';

const TABS = ['Availability', 'Reservations', 'Exceptions'];

const DAY_LABEL_TO_CODE = {
  Sun: 'SUN',
  Mon: 'MON',
  Tue: 'TUE',
  Wed: 'WED',
  Thu: 'THU',
  Fri: 'FRI',
  Sat: 'SAT',
};

const DAY_CODE_TO_LABEL = {
  SUN: 'Sun',
  MON: 'Mon',
  TUE: 'Tue',
  WED: 'Wed',
  THU: 'Thu',
  FRI: 'Fri',
  SAT: 'Sat',
};

const createSchedule = (overrides = {}) => ({
  id: `schedule_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
  backendId: null,
  patientName: '',
  startTime: '09:00',
  endTime: '17:00',
  slotDuration: 30,
  gapDuration: 15,
  isActive: true,
  selectedDays: [],
  ...overrides,
});

const normalizeBackendRowsToCards = (rows) => {
  return rows.map((row) =>
    createSchedule({
      id: `backend_${row.id}`,
      backendId: row.id,
      patientName: row.name || '',
      startTime: row.start_time?.slice(0, 5) || '09:00',
      endTime: row.end_time?.slice(0, 5) || '17:00',
      slotDuration: row.visit_duration,
      gapDuration: row.time_gap,
      isActive: row.is_active,
      selectedDays: Array.isArray(row.days_of_week)
        ? row.days_of_week.map((code) => DAY_CODE_TO_LABEL[code]).filter(Boolean)
        : [],
    })
  );
};


const validateSchedules = (schedules) => {
  const usedDays = new Map();

  for (const schedule of schedules) {
    if (!schedule.selectedDays.length) {
      return 'Each schedule must have at least one selected day.';
    }

    for (const day of schedule.selectedDays) {
      if (usedDays.has(day)) {
        return `Day "${day}" is selected in more than one schedule. Each day can only belong to one schedule.`;
      }
      usedDays.set(day, schedule.id);
    }

    if (schedule.endTime <= schedule.startTime) {
      return 'End time must be after start time.';
    }
  }

  return null;
};

const buildBackendRows = (schedules) => {
  return schedules.map((schedule) => ({
    id: schedule.backendId,
    name: schedule.patientName || '',
    days_of_week: schedule.selectedDays
      .map((day) => DAY_LABEL_TO_CODE[day])
      .filter(Boolean),
    start_time: schedule.startTime,
    end_time: schedule.endTime,
    visit_duration: schedule.slotDuration,
    time_gap: schedule.gapDuration,
    is_active: schedule.isActive,
  }));
};


const AppointmentsAvailability = () => {
  const [activeTab, setActiveTab] = useState('Availability');
  const [saveStatus, setSaveStatus] = useState('idle');
  const [loadError, setLoadError] = useState('');
  const [schedules, setSchedules] = useState([]);

  const dragItem = useRef(null);
  const dragOverItem = useRef(null);

  useEffect(() => {
  const load = async () => {
      try {
        const data = await getAdminSlots();
        setSchedules(normalizeBackendRowsToCards(Array.isArray(data) ? data : []));
      } catch (err) {
        console.error('[loadSchedules] Failed:', err);
        setLoadError('Failed to load schedules');
      }
    };

    load();
  }, []);

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

    dragItem.current = null;
    dragOverItem.current = null;
  }, []);

  const handleUpdateSchedule = useCallback((updatedSchedule) => {
    setSchedules((prev) =>
      prev.map((s) => (s.id === updatedSchedule.id ? updatedSchedule : s))
    );
  }, []);

  const handleAddSchedule = useCallback(() => {
    setSchedules((prev) => [...prev, createSchedule()]);
  }, []);

  const handleDeleteSchedule = useCallback((id) => {
    setSchedules((prev) => prev.filter((s) => s.id !== id));
  }, []);

  const saveSettings = useCallback(async () => {
    const validationError = validateSchedules(schedules);

    if (validationError) {
      setSaveStatus('error');
      setLoadError(validationError);
      setTimeout(() => setSaveStatus('idle'), 3000);
      return;
    }

    setSaveStatus('saving');
    setLoadError('');

    try {
      const payload = buildBackendRows(schedules);

      await bulkSaveAdminSlots(payload);

      const refreshed = await getAdminSlots();
      setSchedules(normalizeBackendRowsToCards(Array.isArray(refreshed) ? refreshed : []));

      setSaveStatus('saved');
      setTimeout(() => setSaveStatus('idle'), 2500);
    } catch (err) {
      console.error('[saveSettings] Failed:', err);

      const errorMessage =
        err?.response?.data?.detail ||
        err?.response?.data?.non_field_errors?.[0] ||
        err?.response?.data?.days_of_week?.[0] ||
        'Failed to save availability.';

      setLoadError(errorMessage);
      setSaveStatus('error');
      setTimeout(() => setSaveStatus('idle'), 3000);
    }
  }, [schedules]);


  const saveLabel = {
    idle: 'Save Settings',
    saving: 'Saving…',
    saved: 'Saved ✓',
    error: 'Error — Retry',
  }[saveStatus];

  const saveBg = {
    idle: 'bg-[#2F5D50] hover:bg-[#26503f]',
    saving: 'bg-[#2F5D50]/70 cursor-wait',
    saved: 'bg-emerald-600',
    error: 'bg-red-500 hover:bg-red-600',
  }[saveStatus];

  return (
    <div className="-m-6 rounded-2xl overflow-hidden flex flex-col min-h-[calc(100vh-80px)]">
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

        <div className="flex items-end gap-1 overflow-x-auto pb-0 no-scrollbar">
          {TABS.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`flex-shrink-0 px-4 sm:px-5 py-2.5 rounded-t-xl text-sm font-medium whitespace-nowrap transition-all duration-150 focus:outline-none ${activeTab === tab
                ? 'bg-[#E9C9CD] text-[#2F5D50] shadow-sm'
                : 'text-white/75 hover:text-white hover:bg-white/10'
                }`}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      <div className="bg-[#F5F5F0] flex-1 p-4 sm:p-6">
        {activeTab === 'Availability' && (
          <div className="flex flex-col gap-6">
            {loadError && (
              <div className="rounded-xl bg-red-50 border border-red-200 text-red-700 px-4 py-3 text-sm">
                {loadError}
              </div>
            )}

            <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {schedules.map((schedule, index) => (
                <ScheduleCard
                  key={schedule.id}
                  index={index}
                  schedule={schedule}
                  onChange={handleUpdateSchedule}
                  onDelete={() => handleDeleteSchedule(schedule.id)}
                  dragItem={dragItem}
                  dragOverItem={dragOverItem}
                  handleSort={handleSort}
                />
              ))}
            </div>

            <div className="flex items-center justify-center min-h-[80px]">
              <button
                type="button"
                onClick={handleAddSchedule}
                aria-label="Add new schedule"
                className="w-16 h-16 rounded-full bg-[#2a4e3f] text-white flex items-center justify-center shadow-[0_8px_24px_rgba(42,78,63,0.45)] hover:bg-[#22423a] hover:shadow-[0_12px_32px_rgba(42,78,63,0.55)] hover:scale-105 active:scale-95 transition-all duration-200 focus:outline-none focus-visible:ring-4 focus-visible:ring-[#2a4e3f]/40"
              >
                <Plus size={28} strokeWidth={2} />
              </button>
            </div>

            <p className="text-xs text-gray-400 text-right pr-1">
              {schedules.length} schedule{schedules.length !== 1 ? 's' : ''} configured
            </p>
          </div>
        )}

        {activeTab === 'Reservations' && <ReservationsList />}
        {activeTab === 'Exceptions' && <ExceptionsList />}
      </div>
    </div>
  );
};

export default AppointmentsAvailability;
