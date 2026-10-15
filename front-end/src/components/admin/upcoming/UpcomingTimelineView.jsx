// src/components/admin/upcoming/UpcomingTimelineView.jsx
import React, { useState, useMemo } from 'react';
import {
  Clock,
  User,
  Phone,
  Eye,
  FileText,
  Calendar,
  CheckCircle2,
  CalendarCheck,
} from 'lucide-react';
import { toPersianDigits } from '../../../utils/jalaliDateUtils';

const SHIFT_HOURS = [
  '08', '09', '10', '11', '12', '13', '14', '15', '16', '17', '18', '19', '20',
];

const STATUS_CONFIG = {
  pending: {
    label: 'در انتظار تایید',
    badgeClass: 'bg-amber-50 text-amber-700 border-amber-200',
    dotClass: 'bg-amber-500 animate-pulse',
  },
  scheduled: {
    label: 'تایید شده',
    badgeClass: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    dotClass: 'bg-emerald-500',
  },
  cancelled_admin: {
    label: 'رد شده',
    badgeClass: 'bg-rose-50 text-rose-700 border-rose-200',
    dotClass: 'bg-rose-500',
  },
  cancelled_user: {
    label: 'لغو توسط بیمار',
    badgeClass: 'bg-gray-100 text-gray-600 border-gray-200',
    dotClass: 'bg-gray-400',
  },
  visited: {
    label: 'ویزیت شده',
    badgeClass: 'bg-purple-50 text-purple-700 border-purple-200',
    dotClass: 'bg-purple-500',
  },
};

export default function UpcomingTimelineView({
  groupedByDay = [],
  onViewAppointment,
  onViewPatient,
}) {
  const [selectedDayIndex, setSelectedDayIndex] = useState(0);

  // Active day data
  const currentDay = groupedByDay[selectedDayIndex] || groupedByDay[0] || null;

  // Map appointments for this day by hour
  const hourlySlots = useMemo(() => {
    if (!currentDay) return {};
    const slots = {};
    SHIFT_HOURS.forEach((h) => {
      slots[h] = [];
    });

    currentDay.items.forEach((item) => {
      const hour = (item.time || '').slice(0, 2);
      if (slots[hour]) {
        slots[hour].push(item);
      } else {
        // In case an appointment is outside standard 08-20 range
        if (!slots[hour]) slots[hour] = [];
        slots[hour].push(item);
      }
    });

    return slots;
  }, [currentDay]);

  if (groupedByDay.length === 0) {
    return null;
  }

  return (
    <div className="bg-white/80 backdrop-blur-md rounded-3xl border border-primary/20 p-5 md:p-6 shadow-sm flex flex-col gap-6">
      {/* Day Selector Chips */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-primary/15 pb-4">
        <div className="flex items-center gap-2">
          <CalendarCheck className="w-5 h-5 text-primary" />
          <span className="text-sm font-black text-textDark">
            انتخاب روز شیفت:
          </span>
        </div>

        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar p-1">
          {groupedByDay.map((day, idx) => {
            const isActive = idx === selectedDayIndex;
            return (
              <button
                key={day.dateKey}
                type="button"
                onClick={() => setSelectedDayIndex(idx)}
                className={`px-3.5 py-2 rounded-2xl text-xs font-bold transition-all duration-200 cursor-pointer flex items-center gap-2 whitespace-nowrap shrink-0 ${
                  isActive
                    ? 'bg-primary text-white shadow-md shadow-primary/25'
                    : 'bg-white hover:bg-gray-50 text-textDark/80 border border-primary/15 hover:border-primary/40'
                }`}
              >
                <span>{day.displayDate}</span>
                <span className={`px-1.5 py-0.5 rounded-lg text-[10px] font-black ${isActive ? 'bg-white/20 text-white' : 'bg-primary/10 text-primary'}`}>
                  {toPersianDigits(day.items.length)}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Hourly Timeline Grid */}
      <div className="flex flex-col gap-3 relative before:absolute before:right-8 before:top-2 before:bottom-2 before:w-0.5 before:bg-primary/15">
        {SHIFT_HOURS.map((hour) => {
          const itemsInHour = hourlySlots[hour] || [];
          const hourDisplay = `${toPersianDigits(hour)}:۰۰`;

          return (
            <div key={hour} className="flex items-start gap-4 md:gap-6 relative z-10 group">
              {/* Hour Node */}
              <div className="w-16 shrink-0 flex items-center justify-center">
                <span
                  className={`px-2.5 py-1.5 rounded-xl text-xs font-black border transition-all ${
                    itemsInHour.length > 0
                      ? 'bg-primary text-white border-primary shadow-xs'
                      : 'bg-white text-textDark/60 border-primary/15 group-hover:border-primary/40'
                  }`}
                  dir="ltr"
                >
                  {hourDisplay}
                </span>
              </div>

              {/* Slot Content */}
              <div className="flex-1 pb-2">
                {itemsInHour.length === 0 ? (
                  <div className="p-3 rounded-2xl border border-dashed border-gray-200 bg-gray-50/50 text-[11px] font-semibold text-textDark/40 flex items-center gap-2">
                    <Clock size={13} className="text-gray-300" />
                    <span>اسلات آزاد — بدون رزرو در این ساعت</span>
                  </div>
                ) : (
                  <div className="flex flex-col gap-2.5">
                    {itemsInHour.map((item) => {
                      const status = STATUS_CONFIG[item.status] || STATUS_CONFIG.scheduled;

                      return (
                        <div
                          key={item.id}
                          className="bg-white rounded-2xl border border-primary/20 p-4 shadow-xs hover:shadow-md transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                        >
                          <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-primary/10 text-primary font-black text-xs w-fit">
                              <Clock size={13} />
                              <span dir="ltr">{toPersianDigits(item.time)}</span>
                            </div>

                            <div className="flex flex-col gap-0.5">
                              <div className="flex items-center gap-2">
                                <User size={14} className="text-primary/70 shrink-0" />
                                <span className="font-black text-sm text-textDark">
                                  {item.fullName}
                                </span>
                              </div>

                              <div className="flex items-center gap-3 text-xs text-textDark/60 font-semibold pr-5">
                                <span className="flex items-center gap-1" dir="ltr">
                                  <Phone size={11} className="text-primary/70 shrink-0" />
                                  <span>{toPersianDigits(item.phoneNumber)}</span>
                                </span>
                                {item.reason && item.reason !== '-' && (
                                  <span className="text-[11px] text-textDark/70 max-w-md truncate" title={item.reason}>
                                    علت: {item.reason}
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>

                          <div className="flex items-center gap-2 self-end sm:self-auto shrink-0">
                            <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-xl text-xs font-bold border ${status.badgeClass}`}>
                              <span className={`w-1.5 h-1.5 rounded-full ${status.dotClass}`} />
                              <span>{status.label}</span>
                            </span>

                            <div className="flex items-center gap-1">
                              <button
                                type="button"
                                onClick={() => onViewAppointment(item)}
                                title="مشاهده نوبت"
                                className="p-1.5 rounded-xl bg-primary/10 hover:bg-primary text-primary hover:text-white transition-all cursor-pointer"
                              >
                                <Eye size={14} />
                              </button>
                              <button
                                type="button"
                                onClick={() => onViewPatient(item)}
                                title="پرونده بیمار"
                                className="p-1.5 rounded-xl bg-gray-100 hover:bg-gray-200 text-textDark/80 transition-all cursor-pointer"
                              >
                                <FileText size={14} />
                              </button>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
