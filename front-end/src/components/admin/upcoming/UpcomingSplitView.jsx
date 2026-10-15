// src/components/admin/upcoming/UpcomingSplitView.jsx
import React, { useState } from 'react';
import {
  Calendar,
  Users,
  CheckCircle2,
  Clock,
  ChevronLeft,
} from 'lucide-react';
import UpcomingPatientCard from './UpcomingPatientCard';
import { toPersianDigits } from '../../../utils/jalaliDateUtils';

export default function UpcomingSplitView({
  groupedByDay = [],
  onViewAppointment,
  onViewPatient,
}) {
  const [selectedDayKey, setSelectedDayKey] = useState(
    () => groupedByDay[0]?.dateKey || null
  );

  const activeDay =
    groupedByDay.find((d) => d.dateKey === selectedDayKey) ||
    groupedByDay[0] ||
    null;

  if (groupedByDay.length === 0) {
    return null;
  }

  return (
    <div className="flex flex-col lg:flex-row items-start gap-6">
      {/* Master Column: Days List */}
      <div className="w-full lg:w-80 shrink-0 bg-white/80 backdrop-blur-md rounded-3xl border border-primary/20 p-4 shadow-sm flex flex-col gap-3">
        <div className="flex items-center gap-2 border-b border-primary/15 pb-3 px-2">
          <Calendar size={17} className="text-primary" />
          <h3 className="text-sm font-black text-textDark">
            فهرست روزهای کاری ({toPersianDigits(groupedByDay.length)} روز)
          </h3>
        </div>

        <div className="flex flex-col gap-2 max-h-[600px] overflow-y-auto no-scrollbar pr-0.5">
          {groupedByDay.map((day) => {
            const isSelected = (activeDay?.dateKey === day.dateKey);

            return (
              <div
                key={day.dateKey}
                onClick={() => setSelectedDayKey(day.dateKey)}
                className={`p-3.5 rounded-2xl border transition-all duration-200 cursor-pointer flex items-center justify-between gap-2 ${
                  isSelected
                    ? 'bg-primary text-white border-primary shadow-md shadow-primary/25 scale-[1.01]'
                    : 'bg-white hover:bg-primary/[0.04] border-primary/15 hover:border-primary/40 text-textDark'
                }`}
              >
                <div className="flex flex-col gap-0.5">
                  <span className={`text-xs font-black ${isSelected ? 'text-white' : 'text-textDark'}`}>
                    {day.displayDate}
                  </span>
                  <span
                    className={`text-[11px] font-semibold ${isSelected ? 'text-white/80' : 'text-textDark/60'}`}
                    dir="ltr"
                  >
                    {day.dateKey}
                  </span>
                </div>

                <div className="flex items-center gap-1.5">
                  <span
                    className={`px-2 py-0.5 rounded-xl text-xs font-black flex items-center gap-1 ${
                      isSelected
                        ? 'bg-white/20 text-white'
                        : 'bg-primary/10 text-primary'
                    }`}
                  >
                    <Users size={11} />
                    <span>{toPersianDigits(day.items.length)}</span>
                  </span>
                  <ChevronLeft size={15} className={isSelected ? 'text-white' : 'text-textDark/40'} />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Detail Column: Patients Cards of Selected Day */}
      <div className="flex-1 w-full bg-white/80 backdrop-blur-md rounded-3xl border border-primary/20 p-5 md:p-6 shadow-sm flex flex-col gap-5">
        {activeDay ? (
          <>
            {/* Detail Day Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-primary/15 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-primary to-primary-dark text-white flex items-center justify-center shadow-md shadow-primary/25 shrink-0">
                  <Calendar className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-black text-textDark">
                    {activeDay.displayDate}
                  </h3>
                  <span className="text-xs text-textDark/60 font-semibold" dir="ltr">
                    {activeDay.dateKey}
                  </span>
                </div>
              </div>

              {/* Counts Badges */}
              <div className="flex items-center flex-wrap gap-2 text-xs font-bold">
                <span className="px-3 py-1.5 rounded-xl bg-primary/10 text-primary flex items-center gap-1">
                  <Users size={13} />
                  <span>{toPersianDigits(activeDay.items.length)} مراجع</span>
                </span>
                {activeDay.scheduledCount > 0 && (
                  <span className="px-2.5 py-1 rounded-xl bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center gap-1">
                    <CheckCircle2 size={13} />
                    <span>{toPersianDigits(activeDay.scheduledCount)} تایید شده</span>
                  </span>
                )}
                {activeDay.pendingCount > 0 && (
                  <span className="px-2.5 py-1 rounded-xl bg-amber-50 text-amber-700 border border-amber-200 flex items-center gap-1 animate-pulse">
                    <Clock size={13} />
                    <span>{toPersianDigits(activeDay.pendingCount)} در انتظار</span>
                  </span>
                )}
              </div>
            </div>

            {/* Patients Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {activeDay.items.map((appointment) => (
                <UpcomingPatientCard
                  key={appointment.id}
                  appointment={appointment}
                  onViewAppointment={onViewAppointment}
                  onViewPatient={onViewPatient}
                />
              ))}
            </div>
          </>
        ) : (
          <div className="py-20 text-center text-textDark/50 text-sm font-bold">
            لطفاً یک روز را از ستون کناری انتخاب نمایید.
          </div>
        )}
      </div>
    </div>
  );
}
