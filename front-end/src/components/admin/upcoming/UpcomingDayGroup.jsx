// src/components/admin/upcoming/UpcomingDayGroup.jsx
import React from 'react';
import { Calendar, Users, CheckCircle2, Clock } from 'lucide-react';
import UpcomingPatientCard from './UpcomingPatientCard';
import { toPersianDigits, formatJalaliDisplay } from '../../../utils/jalaliDateUtils';

export default function UpcomingDayGroup({
  dayData,
  onViewAppointment,
  onViewPatient,
}) {
  const { dateKey, dateObj, items, scheduledCount, pendingCount } = dayData;

  // Gregorian formatted string e.g. "13 May 2026"
  const gregorianDisplay = dateObj
    ? dateObj.toLocaleDateString('en-US', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
      })
    : dateKey;

  const jalaliDisplay = dateObj ? formatJalaliDisplay(dateObj, true) : dateKey;

  return (
    <div className="bg-white/60 backdrop-blur-sm rounded-3xl border border-primary/20 p-5 md:p-6 shadow-sm flex flex-col gap-4">
      {/* Day Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-primary/15 pb-4">
        {/* Date Titles */}
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-primary to-primary-dark text-white flex items-center justify-center shadow-md shadow-primary/25 shrink-0">
            <Calendar className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-base md:text-lg font-black text-textDark flex items-center gap-2">
              <span>{jalaliDisplay}</span>
            </h3>
            <span className="text-xs text-textDark/60 font-semibold tracking-wide" dir="ltr">
              {gregorianDisplay}
            </span>
          </div>
        </div>

        {/* Day Counts Badges */}
        <div className="flex items-center flex-wrap gap-2 text-xs font-bold">
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-primary/10 text-primary">
            <Users size={14} />
            <span>{toPersianDigits(items.length)} بیمار</span>
          </div>

          {scheduledCount > 0 && (
            <div className="flex items-center gap-1 px-2.5 py-1 rounded-xl bg-emerald-50 text-emerald-700 border border-emerald-200">
              <CheckCircle2 size={13} />
              <span>{toPersianDigits(scheduledCount)} تایید شده</span>
            </div>
          )}

          {pendingCount > 0 && (
            <div className="flex items-center gap-1 px-2.5 py-1 rounded-xl bg-amber-50 text-amber-700 border border-amber-200 animate-pulse">
              <Clock size={13} />
              <span>{toPersianDigits(pendingCount)} در انتظار</span>
            </div>
          )}
        </div>
      </div>

      {/* Patients Grid for this Day */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 pt-1">
        {items.map((appointment) => (
          <UpcomingPatientCard
            key={appointment.id}
            appointment={appointment}
            onViewAppointment={onViewAppointment}
            onViewPatient={onViewPatient}
          />
        ))}
      </div>
    </div>
  );
}
