// src/components/admin/upcoming/UpcomingAppointmentsContainer.jsx
import React, { useState } from 'react';
import {
  CalendarClock,
  Search,
  Filter,
  RefreshCw,
  AlertCircle,
  Users,
  CheckCircle2,
  Clock,
  Loader2,
} from 'lucide-react';
import { useUpcomingAppointments } from '../../../hooks/useUpcomingAppointments';
import DualCalendarRangePicker from './DualCalendarRangePicker';
import UpcomingQuickPresets from './UpcomingQuickPresets';
import UpcomingDayGroup from './UpcomingDayGroup';
import UpcomingEmptyState from './UpcomingEmptyState';
import AppointmentDetailModal from '../reservations/AppointmentDetailModal';
import PatientDetailModal from '../patients/PatientDetailModal';
import { toPersianDigits } from '../../../utils/jalaliDateUtils';

export default function UpcomingAppointmentsContainer() {
  const {
    startDate,
    endDate,
    activePreset,
    selectPreset,
    setCustomRange,
    statusFilter,
    setStatusFilter,
    searchQuery,
    setSearchQuery,
    groupedByDay,
    totalCount,
    summary,
    loading,
    error,
    refresh,
  } = useUpcomingAppointments();

  // Modals state
  const [activeAppointment, setActiveAppointment] = useState(null);
  const [activePatient, setActivePatient] = useState(null);

  const handleOpenAppointment = (appointment) => {
    setActiveAppointment(appointment);
  };

  const handleOpenPatient = (appointment) => {
    setActiveAppointment(null);
    setActivePatient({
      id: appointment.userId,
      fullName: appointment.fullName,
      phoneNumber: appointment.phoneNumber,
      nationalId: appointment.nationalId,
      originAppointment: appointment,
    });
  };

  const handleBackToAppointment = () => {
    if (activePatient?.originAppointment) {
      setActiveAppointment(activePatient.originAppointment);
      setActivePatient(null);
    }
  };

  const handleAppointmentStatusChanged = () => {
    refresh();
  };

  return (
    <div className="space-y-6">
      {/* Header & Stats Banner */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-primary/15 pb-5">
        <div>
          <h1 className="text-xl md:text-2xl font-black text-primary flex items-center gap-2.5">
            <CalendarClock className="w-6 h-6 md:w-7 md:h-7" />
            تقویم کاری و نوبت‌های آتی پزشک
          </h1>
          <p className="text-xs md:text-sm text-textDark/70 font-medium mt-1">
            پایش هوشمند مراجعین روزهای پیش‌رو و برنامه‌ریزی تقویمی شیفت‌های بالینی
          </p>
        </div>

        {/* Quick summary chips */}
        <div className="flex items-center flex-wrap gap-2.5">
          <div className="flex items-center gap-2 px-3.5 py-2 rounded-2xl bg-white border border-primary/15 shadow-sm text-xs font-bold text-textDark">
            <Users size={15} className="text-primary" />
            <span>مجموع نوبت‌ها:</span>
            <span className="text-primary font-black text-sm">{toPersianDigits(summary.total)}</span>
          </div>

          <div className="flex items-center gap-2 px-3.5 py-2 rounded-2xl bg-emerald-50 border border-emerald-200/80 text-emerald-800 text-xs font-bold shadow-sm">
            <CheckCircle2 size={15} className="text-emerald-600" />
            <span>تایید شده:</span>
            <span className="font-black text-sm">{toPersianDigits(summary.scheduled)}</span>
          </div>

          <div className="flex items-center gap-2 px-3.5 py-2 rounded-2xl bg-amber-50 border border-amber-200/80 text-amber-800 text-xs font-bold shadow-sm">
            <Clock size={15} className="text-amber-600" />
            <span>در انتظار:</span>
            <span className="font-black text-sm">{toPersianDigits(summary.pending)}</span>
          </div>
        </div>
      </div>

      {/* Date Controls & Quick Presets Bar */}
      <div className="relative z-30 flex flex-col md:flex-row md:items-center justify-between gap-3 bg-white/70 backdrop-blur-md p-4 rounded-3xl border border-primary/15 shadow-sm">
        <UpcomingQuickPresets
          activePreset={activePreset}
          onSelectPreset={selectPreset}
        />

        <div className="flex items-center gap-2 self-start md:self-auto shrink-0">
          <DualCalendarRangePicker
            startDate={startDate}
            endDate={endDate}
            onChange={setCustomRange}
          />

          <button
            type="button"
            onClick={refresh}
            disabled={loading}
            className="p-2.5 rounded-2xl bg-white border border-primary/20 hover:border-primary text-primary transition-all shadow-sm hover:shadow cursor-pointer disabled:opacity-50"
            title="به‌روزرسانی اطلاعات"
            aria-label="به‌روزرسانی"
          >
            <RefreshCw size={17} className={loading ? 'animate-spin' : ''} />
          </button>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="relative z-20 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        {/* Status Tabs */}
        <div className="flex items-center gap-1.5 bg-white/80 border border-primary/15 p-1 rounded-2xl self-start">
          <button
            type="button"
            onClick={() => setStatusFilter('all')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              statusFilter === 'all'
                ? 'bg-primary text-white shadow-sm'
                : 'text-textDark/70 hover:text-textDark'
            }`}
          >
            همه وضعیت‌ها
          </button>
          <button
            type="button"
            onClick={() => setStatusFilter('scheduled')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              statusFilter === 'scheduled'
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'text-textDark/70 hover:text-textDark'
            }`}
          >
            تایید شده
          </button>
          <button
            type="button"
            onClick={() => setStatusFilter('pending')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              statusFilter === 'pending'
                ? 'bg-amber-500 text-white shadow-sm'
                : 'text-textDark/70 hover:text-textDark'
            }`}
          >
            در انتظار تایید
          </button>
        </div>

        {/* Live Search Input */}
        <div className="relative w-full sm:w-72">
          <Search size={16} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-textDark/40 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="جستجوی نام، تلفن یا کد ملی..."
            className="w-full pl-3 pr-9 py-2 bg-white rounded-2xl border border-primary/15 focus:border-primary focus:ring-2 focus:ring-primary/20 text-xs md:text-sm font-semibold text-textDark placeholder:text-textDark/40 transition-all outline-none"
          />
        </div>
      </div>

      {/* Main Content Area */}
      {error && (
        <div className="rounded-2xl bg-red-50 border border-red-200 text-red-700 px-4 py-3 text-xs md:text-sm font-bold flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
          <button
            type="button"
            onClick={refresh}
            className="px-3 py-1 bg-red-100 hover:bg-red-200 rounded-xl text-xs font-bold text-red-800 transition-colors"
          >
            تلاش مجدد
          </button>
        </div>
      )}

      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 gap-3">
          <Loader2 className="w-8 h-8 text-primary animate-spin" />
          <span className="text-xs md:text-sm font-bold text-textDark/60">
            در حال دریافت نوبت‌های روزهای انتخابی...
          </span>
        </div>
      ) : groupedByDay.length === 0 ? (
        <UpcomingEmptyState
          onResetRange={selectPreset}
          activePreset={activePreset}
        />
      ) : (
        <div className="relative z-10 space-y-6">
          {groupedByDay.map((dayData) => (
            <UpcomingDayGroup
              key={dayData.dateKey}
              dayData={dayData}
              onViewAppointment={handleOpenAppointment}
              onViewPatient={handleOpenPatient}
            />
          ))}
        </div>
      )}

      {/* Appointment Detail Modal */}
      {activeAppointment && (
        <AppointmentDetailModal
          appointment={activeAppointment}
          onClose={() => setActiveAppointment(null)}
          onViewPatient={handleOpenPatient}
          onStatusChange={handleAppointmentStatusChanged}
        />
      )}

      {/* Patient Dossier Modal */}
      {activePatient && (
        <PatientDetailModal
          patientId={activePatient.id}
          initialData={activePatient}
          onClose={() => setActivePatient(null)}
          onBack={handleBackToAppointment}
        />
      )}
    </div>
  );
}
