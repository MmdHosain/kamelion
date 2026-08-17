import React, { useState, useCallback, useRef, useEffect } from 'react';
import { Plus, Save, Calendar, Clock, AlertCircle, CheckCircle2 } from 'lucide-react';
import ScheduleCard from '../../components/admin/availability/ScheduleCard';
import ReservationsList from '../../components/admin/reservations/ReservationsList';
import ExceptionsList from '../../components/admin/exceptions/ExceptionsList';
import {
  getAdminSlots,
  bulkSaveAdminSlots,
} from '../../api/schedules';

const TABS = [
  { id: 'Availability', label: 'زمان‌بندی هفتگی پزشک' },
  { id: 'Reservations', label: 'نوبت‌های رزرو شده' },
  { id: 'Exceptions', label: 'تعطیلات و استثنائات' },
];

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
      return 'هر بازه کاری باید حداقل یک روز مشخص داشته باشد.';
    }

    for (const day of schedule.selectedDays) {
      if (usedDays.has(day)) {
        return `روز "${day}" در بیش از یک بازه انتخاب شده است.`;
      }
      usedDays.set(day, schedule.id);
    }

    if (schedule.endTime <= schedule.startTime) {
      return 'ساعت پایان باید بعد از ساعت شروع باشد.';
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
        setLoadError('امکان بارگذاری زمان‌بندی از سرور وجود ندارد');
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
      setTimeout(() => setSaveStatus('idle'), 3500);
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
        'ذخیره زمان‌بندی با خطا مواجه شد.';

      setLoadError(errorMessage);
      setSaveStatus('error');
      setTimeout(() => setSaveStatus('idle'), 3500);
    }
  }, [schedules]);

  const saveLabel = {
    idle: 'ذخیره تنظیمات',
    saving: 'در حال ذخیره...',
    saved: 'ذخیره شد ✓',
    error: 'خطا — تلاش مجدد',
  }[saveStatus];

  const saveBg = {
    idle: 'bg-primary hover:bg-primary-dark text-white',
    saving: 'bg-primary/70 text-white cursor-wait',
    saved: 'bg-emerald-600 text-white',
    error: 'bg-red-500 hover:bg-red-600 text-white',
  }[saveStatus];

  return (
    <div className="space-y-6">
      {/* Header & Tabs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-primary/15 pb-4">
        <div>
          <h1 className="text-xl md:text-2xl font-black text-primary flex items-center gap-2.5">
            <Calendar className="w-6 h-6" />
            مدیریت زمان‌بندی و نوبت‌های پزشک
          </h1>
          <p className="text-xs md:text-sm text-textDark/70 font-medium mt-0.5">
            تنظیم ساعات حضور، روزهای کاری و بازه‌های زمانی ویزیت
          </p>
        </div>

        <button
          type="button"
          onClick={saveSettings}
          disabled={saveStatus === 'saving'}
          className={`flex items-center justify-center gap-2 px-6 py-3 rounded-2xl font-bold text-sm shadow-md transition-all duration-200 cursor-pointer ${saveBg}`}
        >
          <Save size={16} />
          <span>{saveLabel}</span>
        </button>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 chat-scroll">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-5 py-2.5 rounded-2xl text-xs md:text-sm font-bold whitespace-nowrap transition-all duration-200 cursor-pointer ${
              activeTab === tab.id
                ? 'bg-primary text-white shadow-md shadow-primary/25'
                : 'bg-white/70 hover:bg-white text-textDark/80 border border-primary/15'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Content Area */}
      <div className="pt-2">
        {activeTab === 'Availability' && (
          <div className="flex flex-col gap-6">
            {loadError && (
              <div className="rounded-2xl bg-red-50 border border-red-200 text-red-700 px-4 py-3 text-xs md:text-sm font-bold flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{loadError}</span>
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

            <div className="flex flex-col items-center justify-center py-6 gap-2">
              <button
                type="button"
                onClick={handleAddSchedule}
                aria-label="افزودن بازه زمانی جدید"
                className="w-14 h-14 rounded-full bg-primary text-white flex items-center justify-center shadow-lg shadow-primary/30 hover:bg-primary-dark hover:scale-105 active:scale-95 transition-all duration-200 cursor-pointer"
              >
                <Plus size={28} strokeWidth={2.5} />
              </button>
              <span className="text-xs font-bold text-textDark/60">افزودن شیفت کاری جدید</span>
            </div>
          </div>
        )}

        {activeTab === 'Reservations' && <ReservationsList />}
        {activeTab === 'Exceptions' && <ExceptionsList />}
      </div>
    </div>
  );
};

export default AppointmentsAvailability;
