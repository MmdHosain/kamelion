import React from 'react';
import { Calendar, Clock, Trash2, AlertTriangle, Loader2, FileText } from 'lucide-react';
import { formatJalaliDisplay, toPersianDigits } from '../../../utils/jalaliDateUtils';

export const STATUS_CONFIG = {
  pending: {
    label: 'در انتظار بررسی و تایید کلینیک',
    badgeClass: 'bg-amber-100/90 text-amber-900 border-amber-300',
    dotClass: 'bg-amber-500 animate-pulse',
    canCancel: true,
  },
  scheduled: {
    label: 'نوبت تایید شده',
    badgeClass: 'bg-emerald-100/90 text-emerald-900 border-emerald-300',
    dotClass: 'bg-emerald-500',
    canCancel: true,
  },
  cancelled_user: {
    label: 'لغو شده توسط شما',
    badgeClass: 'bg-gray-100 text-gray-600 border-gray-200',
    dotClass: 'bg-gray-400',
    canCancel: false,
  },
  cancelled_admin: {
    label: 'رد شده توسط کلینیک',
    badgeClass: 'bg-rose-100 text-rose-800 border-rose-200',
    dotClass: 'bg-rose-500',
    canCancel: false,
  },
  visited: {
    label: 'ویزیت انجام شده',
    badgeClass: 'bg-purple-100 text-purple-800 border-purple-200',
    dotClass: 'bg-purple-500',
    canCancel: false,
  },
};

const parseAppointmentDate = (rawDate) => {
  if (!rawDate) return null;
  const parts = String(rawDate).split('-').map(Number);
  if (parts.length === 3) {
    return new Date(parts[0], parts[1] - 1, parts[2]);
  }
  return null;
};

export default function AppointmentCard({
  item,
  isConfirming,
  isCancelling,
  onCancel,
  onSetConfirmCancel,
}) {
  const dateObj = parseAppointmentDate(item.appointment_date || item.date);
  const displayDate = dateObj ? formatJalaliDisplay(dateObj, true) : (item.appointment_date || item.date);
  const timeStr = String(item.appointment_time || item.time || '').slice(0, 5);
  const statusCfg = STATUS_CONFIG[item.status] || {
    label: item.status,
    badgeClass: 'bg-gray-100 text-gray-700 border-gray-200',
    dotClass: 'bg-gray-400',
    canCancel: false,
  };

  return (
    <div className="bg-white/90 border border-primary/20 hover:border-primary/40 rounded-3xl p-4 sm:p-5 flex flex-col gap-3 shadow-sm transition-all group">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full border text-xs font-bold ${statusCfg.badgeClass}`}>
          <span className={`w-2 h-2 rounded-full ${statusCfg.dotClass}`} />
          {statusCfg.label}
        </span>
        <span className="text-[11px] font-mono text-textDark/60 font-bold bg-gray-50 border border-gray-100 px-2 py-1 rounded-lg">
          کد پیگیری: #{toPersianDigits(item.id)}
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs text-textDark mt-1">
        <div className="flex items-center gap-2.5 p-2 rounded-xl bg-primary/5 border border-primary/10">
          <Calendar className="w-5 h-5 text-primary shrink-0" />
          <div className="flex flex-col gap-0.5">
            <span className="text-[10px] text-textDark/60 font-bold">تاریخ مراجعه</span>
            <span className="font-black text-primary-dark">{displayDate}</span>
          </div>
        </div>
        <div className="flex items-center gap-2.5 p-2 rounded-xl bg-primary/5 border border-primary/10">
          <Clock className="w-5 h-5 text-primary shrink-0" />
          <div className="flex flex-col gap-0.5">
            <span className="text-[10px] text-textDark/60 font-bold">ساعت ویزیت</span>
            <span className="font-black text-primary">ساعت {toPersianDigits(timeStr)}</span>
          </div>
        </div>
      </div>

      {item.reason && (
        <div className="text-xs text-textDark/80 bg-bgLight/40 rounded-xl p-3 border border-primary/10 flex items-start gap-2 mt-1">
          <FileText className="w-4 h-4 text-primary/70 shrink-0 mt-0.5" />
          <span className="leading-relaxed font-medium">{item.reason}</span>
        </div>
      )}

      {statusCfg.canCancel && (
        <div className="pt-3 mt-1 border-t border-gray-100 flex items-center justify-between">
          {isConfirming ? (
            <div className="w-full bg-rose-50 border border-rose-200 rounded-2xl p-3 flex flex-col sm:flex-row items-center justify-between gap-3 animate-fadeSlide">
              <div className="flex items-center gap-2 text-rose-800 text-xs font-bold">
                <AlertTriangle className="w-5 h-5 shrink-0 text-rose-600" />
                <span>آیا از لغو این نوبت اطمینان دارید؟ زمان آزاد خواهد شد.</span>
              </div>
              <div className="flex items-center gap-2 self-end sm:self-center">
                <button
                  type="button"
                  onClick={() => onSetConfirmCancel(null)}
                  disabled={isCancelling}
                  className="px-4 py-2 text-xs font-bold text-gray-600 hover:text-gray-900 hover:bg-white rounded-xl border border-gray-200 cursor-pointer transition-colors"
                >
                  انصراف
                </button>
                <button
                  type="button"
                  onClick={() => onCancel(item.id)}
                  disabled={isCancelling}
                  className="px-4 py-2 text-xs font-bold text-white rounded-xl bg-rose-600 hover:bg-rose-700 flex items-center gap-1.5 cursor-pointer disabled:opacity-50 transition-colors shadow-sm shadow-rose-600/20"
                >
                  {isCancelling ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Trash2 className="w-4 h-4" />
                  )}
                  <span>بله، لغو شود</span>
                </button>
              </div>
            </div>
          ) : (
            <div className="w-full flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <span className="text-[11px] text-textDark/60 font-medium bg-gray-50 border border-gray-100 px-2 py-1 rounded-lg">
                {item.status === 'pending'
                  ? 'تا پیش از تایید کلینیک می‌توانید نوبت را لغو نمایید.'
                  : 'امکان لغو نوبت تا ۲۴ ساعت پیش از ویزیت فراهم است.'}
              </span>
              <button
                type="button"
                onClick={() => onSetConfirmCancel(item.id)}
                className="inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl text-rose-600 hover:bg-rose-50 border border-rose-200 hover:border-rose-300 text-xs font-bold transition-all cursor-pointer bg-white shadow-sm"
              >
                <Trash2 className="w-4 h-4" />
                <span>لغو این نوبت</span>
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
