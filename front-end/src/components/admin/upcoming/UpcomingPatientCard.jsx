// src/components/admin/upcoming/UpcomingPatientCard.jsx
import React from 'react';
import {
  Clock,
  User,
  Phone,
  Eye,
  FileText,
  AlertCircle,
  CheckCircle2,
  Calendar,
} from 'lucide-react';
import { toPersianDigits } from '../../../utils/jalaliDateUtils';

const STATUS_CONFIG = {
  pending: {
    label: 'در انتظار تایید',
    badgeClass: 'bg-amber-50 text-amber-700 border-amber-200/90',
    dotClass: 'bg-amber-500 animate-pulse',
  },
  scheduled: {
    label: 'تایید شده',
    badgeClass: 'bg-emerald-50 text-emerald-700 border-emerald-200/90',
    dotClass: 'bg-emerald-500',
  },
  cancelled_admin: {
    label: 'رد شده',
    badgeClass: 'bg-rose-50 text-rose-700 border-rose-200/90',
    dotClass: 'bg-rose-500',
  },
  cancelled_user: {
    label: 'لغو توسط بیمار',
    badgeClass: 'bg-gray-100 text-gray-600 border-gray-200/90',
    dotClass: 'bg-gray-400',
  },
  visited: {
    label: 'ویزیت شده',
    badgeClass: 'bg-purple-50 text-purple-700 border-purple-200/90',
    dotClass: 'bg-purple-500',
  },
};

export default function UpcomingPatientCard({
  appointment,
  onViewAppointment,
  onViewPatient,
}) {
  const statusInfo = STATUS_CONFIG[appointment.status] || STATUS_CONFIG.scheduled;

  return (
    <div className="bg-white rounded-2xl border border-primary/15 p-4 sm:p-5 shadow-sm hover:shadow-md transition-all duration-200 flex flex-col justify-between gap-3 group">
      {/* Top Header: Time, Status, and Action Buttons */}
      <div className="flex items-center justify-between gap-2 border-b border-primary/10 pb-3">
        {/* Time badge */}
        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-primary/10 text-primary font-black text-sm">
          <Clock size={15} className="text-primary shrink-0" />
          <span dir="ltr">{toPersianDigits(appointment.time)}</span>
        </div>

        {/* Status badge */}
        <div
          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-xs font-bold border ${statusInfo.badgeClass}`}
        >
          <span className={`w-2 h-2 rounded-full ${statusInfo.dotClass}`} />
          <span>{statusInfo.label}</span>
        </div>
      </div>

      {/* Patient Info */}
      <div className="flex flex-col gap-1.5">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center shrink-0">
            <User size={16} />
          </div>
          <span className="text-sm md:text-base font-black text-textDark group-hover:text-primary transition-colors">
            {appointment.fullName}
          </span>
        </div>

        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-textDark/70 font-semibold pr-10">
          <div className="flex items-center gap-1">
            <Phone size={13} className="text-primary/70 shrink-0" />
            <span dir="ltr" className="tracking-wide">
              {toPersianDigits(appointment.phoneNumber)}
            </span>
          </div>

          {appointment.nationalId && (
            <div className="flex items-center gap-1 bg-gray-100 px-2 py-0.5 rounded-lg text-textDark/80">
              <span className="text-[11px] text-textDark/50">کد ملی:</span>
              <span dir="ltr">{toPersianDigits(appointment.nationalId)}</span>
            </div>
          )}
        </div>
      </div>

      {/* Reason for visit */}
      <div className="bg-primary/5 rounded-xl p-2.5 text-xs text-textDark/80 border border-primary/10">
        <span className="font-bold text-primary block mb-0.5 text-[11px]">علت مراجعه:</span>
        <p className="line-clamp-2 leading-relaxed">
          {appointment.reason || 'توضیحی ثبت نشده است.'}
        </p>
      </div>

      {/* Card Footer Actions */}
      <div className="flex items-center justify-end gap-2 pt-2 border-t border-primary/10">
        {appointment.userId && (
          <button
            type="button"
            onClick={() => onViewPatient(appointment)}
            className="flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-bold text-textDark/70 hover:text-primary hover:bg-primary/10 transition-all cursor-pointer"
            title="مشاهده پرونده بیمار"
          >
            <FileText size={14} />
            <span>پرونده بیمار</span>
          </button>
        )}

        <button
          type="button"
          onClick={() => onViewAppointment(appointment)}
          className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold bg-primary text-white hover:bg-primary-dark shadow-sm hover:shadow transition-all cursor-pointer"
        >
          <Eye size={14} />
          <span>مشاهده جزئیات</span>
        </button>
      </div>
    </div>
  );
}
