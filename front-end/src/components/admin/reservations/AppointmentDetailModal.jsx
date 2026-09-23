// src/components/admin/reservations/AppointmentDetailModal.jsx
import React, { useState } from 'react';
import {
  X,
  Calendar,
  Clock,
  User,
  Phone,
  CreditCard,
  FileText,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Trash2,
  ExternalLink,
  Loader2,
  AlertCircle,
  Stethoscope,
  ShieldAlert,
} from 'lucide-react';
import { adminApi } from '../../../api/admin';
import { getApiErrorMessage } from '../../../utils/errorUtils';
import { toPersianDigits } from '../../../utils/jalaliDateUtils';

export const getStatusConfig = (status) => {
  switch (status) {
    case 'pending':
      return {
        label: 'در انتظار تایید ادمین',
        bg: 'bg-amber-50',
        text: 'text-amber-700',
        border: 'border-amber-200',
        dot: 'bg-amber-500',
        icon: Clock,
      };
    case 'scheduled':
      return {
        label: 'تایید شده و فعال',
        bg: 'bg-emerald-50',
        text: 'text-emerald-700',
        border: 'border-emerald-200',
        dot: 'bg-emerald-500',
        icon: CheckCircle2,
      };
    case 'cancelled_admin':
      return {
        label: 'رد شده توسط ادمین',
        bg: 'bg-rose-50',
        text: 'text-rose-700',
        border: 'border-rose-200',
        dot: 'bg-rose-500',
        icon: XCircle,
      };
    case 'cancelled_user':
      return {
        label: 'لغو توسط بیمار',
        bg: 'bg-gray-100',
        text: 'text-gray-600',
        border: 'border-gray-200',
        dot: 'bg-gray-400',
        icon: AlertTriangle,
      };
    case 'visited':
      return {
        label: 'ویزیت انجام شده',
        bg: 'bg-blue-50',
        text: 'text-blue-700',
        border: 'border-blue-200',
        dot: 'bg-blue-500',
        icon: Stethoscope,
      };
    default:
      return {
        label: status || 'نامشخص',
        bg: 'bg-gray-50',
        text: 'text-gray-600',
        border: 'border-gray-200',
        dot: 'bg-gray-400',
        icon: AlertCircle,
      };
  }
};

export default function AppointmentDetailModal({
  appointment,
  onClose,
  onViewPatient,
  onStatusChange,
  onDelete,
}) {
  const [isApproving, setIsApproving] = useState(false);
  const [isDisapproving, setIsDisapproving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [actionError, setActionError] = useState('');
  const [actionSuccess, setActionSuccess] = useState('');

  if (!appointment) return null;

  const statusConfig = getStatusConfig(appointment.status);
  const StatusIcon = statusConfig.icon;
  const isPending = appointment.status === 'pending';

  const handleApprove = async () => {
    setIsApproving(true);
    setActionError('');
    setActionSuccess('');

    try {
      const res = await adminApi.approveAppointment(appointment.id);
      setActionSuccess('نوبت با موفقیت تایید شد.');
      if (onStatusChange) {
        onStatusChange(appointment.id, 'scheduled', res);
      }
    } catch (err) {
      setActionError(getApiErrorMessage(err, 'خطا در تایید نوبت.'));
    } finally {
      setIsApproving(false);
    }
  };

  const handleDisapprove = async () => {
    if (!window.confirm('آیا از رد کردن این نوبت اطمینان دارید؟ اسلات این نوبت آزاد خواهد شد.')) {
      return;
    }

    setIsDisapproving(true);
    setActionError('');
    setActionSuccess('');

    try {
      const res = await adminApi.disapproveAppointment(appointment.id);
      setActionSuccess('نوبت رد شد و اسلات آزاد گردید.');
      if (onStatusChange) {
        onStatusChange(appointment.id, 'cancelled_admin', res);
      }
    } catch (err) {
      setActionError(getApiErrorMessage(err, 'خطا در رد نوبت.'));
    } finally {
      setIsDisapproving(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('آیا از حذف کامل این نوبت از سیستم اطمینان دارید؟')) {
      return;
    }

    setIsDeleting(true);
    setActionError('');

    try {
      await adminApi.deleteReservation(appointment.id);
      if (onDelete) {
        onDelete(appointment.id);
      }
      onClose();
    } catch (err) {
      setActionError(getApiErrorMessage(err, 'خطا در حذف نوبت.'));
      setIsDeleting(false);
    }
  };

  return (
    <div
      className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-3 sm:p-6 animate-fadeSlide"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      dir="rtl"
    >
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl max-h-[92vh] overflow-y-auto p-6 md:p-8 flex flex-col gap-6 relative border border-primary/20 chat-scroll">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-gray-100 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-primary/10 text-primary flex items-center justify-center font-bold">
              <Calendar size={22} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-black text-gray-900">جزئیات نوبت ویزیت</h2>
                <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-lg font-mono">
                  #{toPersianDigits(appointment.id)}
                </span>
              </div>
              <p className="text-xs text-gray-500 font-medium mt-0.5">
                مشاهده اطلاعات کامل ویزیت، علت مراجعه و وضعیت تایید
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors cursor-pointer"
            aria-label="بستن"
          >
            <X size={20} />
          </button>
        </div>

        {/* Feedback Banners */}
        {actionSuccess && (
          <div className="rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 px-4 py-3 text-xs md:text-sm font-bold flex items-center gap-2">
            <CheckCircle2 size={18} className="shrink-0 text-emerald-600" />
            <span>{actionSuccess}</span>
          </div>
        )}

        {actionError && (
          <div className="rounded-2xl bg-red-50 border border-red-200 text-red-700 px-4 py-3 text-xs md:text-sm font-bold flex items-center gap-2">
            <AlertCircle size={18} className="shrink-0" />
            <span>{actionError}</span>
          </div>
        )}

        {/* Grid: Patient Info Card + Schedule Card */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Patient Card */}
          <div className="bg-gray-50/80 border border-gray-200/80 rounded-2xl p-4 flex flex-col justify-between gap-3 shadow-inner">
            <div className="flex items-center justify-between border-b border-gray-200/60 pb-2">
              <span className="text-xs font-bold text-gray-600 flex items-center gap-1.5">
                <User size={15} className="text-primary" />
                مشخصات بیمار
              </span>
              <span className="text-[11px] text-gray-400 font-medium">مراجعه‌کننده</span>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs text-gray-500">نام و نام خانوادگی:</span>
                <span className="text-xs font-black text-gray-900">{appointment.fullName}</span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-xs text-gray-500">شماره تماس:</span>
                <span className="text-xs font-mono font-bold text-primary dir-ltr">
                  {appointment.phoneNumber}
                </span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-xs text-gray-500">کد ملی:</span>
                <span className="text-xs font-mono font-medium text-gray-700">
                  {appointment.nationalId ? toPersianDigits(appointment.nationalId) : 'ثبت‌نشده'}
                </span>
              </div>
            </div>

            {/* View Patient Dossier Button */}
            <button
              type="button"
              onClick={() => {
                if (onViewPatient) onViewPatient(appointment);
              }}
              className="mt-1 w-full flex items-center justify-center gap-1.5 py-2 px-3 bg-white hover:bg-primary hover:text-white text-primary text-xs font-bold rounded-xl border border-primary/25 shadow-sm transition-all duration-200 cursor-pointer group"
            >
              <span>مشاهده اطلاعات و پرونده بیمار</span>
              <ExternalLink size={14} className="group-hover:-translate-x-0.5 transition-transform" />
            </button>
          </div>

          {/* Schedule & Status Card */}
          <div className="bg-gray-50/80 border border-gray-200/80 rounded-2xl p-4 flex flex-col justify-between gap-3 shadow-inner">
            <div className="flex items-center justify-between border-b border-gray-200/60 pb-2">
              <span className="text-xs font-bold text-gray-600 flex items-center gap-1.5">
                <Calendar size={15} className="text-primary" />
                زمان و وضعیت ویزیت
              </span>
              <div
                className={`flex items-center gap-1.5 px-2 py-0.5 rounded-lg border text-[11px] font-bold ${statusConfig.bg} ${statusConfig.text} ${statusConfig.border}`}
              >
                <span className={`w-2 h-2 rounded-full ${statusConfig.dot}`} />
                <StatusIcon size={12} />
                <span>{statusConfig.label}</span>
              </div>
            </div>

            <div className="space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="text-xs text-gray-500 flex items-center gap-1">
                  <Calendar size={13} className="text-gray-400" />
                  تاریخ نوبت:
                </span>
                <span className="text-xs font-bold text-primary">
                  {appointment.displayDate}
                </span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-xs text-gray-500 flex items-center gap-1">
                  <Clock size={13} className="text-gray-400" />
                  ساعت ویزیت:
                </span>
                <span className="text-xs font-mono font-black text-gray-800 bg-white px-2 py-0.5 rounded-lg border border-gray-200">
                  {toPersianDigits(appointment.time)}
                </span>
              </div>

              {appointment.createdAt && (
                <div className="flex items-center justify-between text-[11px] text-gray-400">
                  <span>زمان ثبت نوبت:</span>
                  <span>{new Date(appointment.createdAt).toLocaleDateString('fa-IR')}</span>
                </div>
              )}
            </div>

            <div className="text-[11px] text-gray-400 font-medium pt-1">
              مدت زمان تقریبی هر ویزیت: ۱۵ الی ۳۰ دقیقه
            </div>
          </div>
        </div>

        {/* Reason for Visit (Full Text, No Cutoff) */}
        <div className="flex flex-col gap-2">
          <label className="text-xs font-bold text-gray-700 flex items-center gap-1.5">
            <FileText size={15} className="text-primary" />
            متن کامل دلیل مراجعه بیمار
          </label>
          <div className="p-4 bg-gray-50 rounded-2xl border border-gray-200/90 text-sm text-gray-800 leading-relaxed min-h-[90px] whitespace-pre-wrap select-text">
            {appointment.reason && appointment.reason !== '-' ? (
              appointment.reason
            ) : (
              <span className="text-gray-400 text-xs italic">
                توضیحی توسط بیمار برای علت مراجعه ثبت نشده است.
              </span>
            )}
          </div>
        </div>

        {/* Pending Notice */}
        {isPending && (
          <div className="p-3 bg-amber-500/10 border border-amber-500/25 rounded-2xl flex items-center gap-2.5 text-xs font-bold text-amber-900">
            <ShieldAlert size={18} className="shrink-0 text-amber-600" />
            <span>
              این نوبت هنوز تایید نهایی نشده است. با تایید شما، نوبت قطعی شده و وضعیت به تاییدشده تغییر می‌یابد.
            </span>
          </div>
        )}

        {/* Footer Actions */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-3 border-t border-gray-100">
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <button
              type="button"
              onClick={handleDelete}
              disabled={isDeleting || isApproving || isDisapproving}
              className="flex items-center justify-center gap-1.5 px-4 py-2.5 text-xs font-bold text-red-600 hover:bg-red-50 rounded-2xl border border-red-200 transition-colors cursor-pointer disabled:opacity-50"
            >
              {isDeleting ? (
                <Loader2 size={14} className="animate-spin" />
              ) : (
                <Trash2 size={14} />
              )}
              <span>حذف نوبت</span>
            </button>
          </div>

          <div className="flex items-center justify-end gap-2.5 w-full sm:w-auto">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 text-xs font-bold text-gray-600 border border-gray-200 rounded-2xl hover:bg-gray-100 transition-colors cursor-pointer"
            >
              بستن
            </button>

            {isPending && (
              <>
                <button
                  type="button"
                  onClick={handleDisapprove}
                  disabled={isDisapproving || isApproving}
                  className="flex items-center justify-center gap-1.5 px-5 py-2.5 bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold rounded-2xl shadow-md shadow-rose-600/20 disabled:opacity-50 transition-all cursor-pointer"
                >
                  {isDisapproving ? (
                    <Loader2 size={14} className="animate-spin" />
                  ) : (
                    <XCircle size={14} />
                  )}
                  <span>رد نوبت</span>
                </button>

                <button
                  type="button"
                  onClick={handleApprove}
                  disabled={isApproving || isDisapproving}
                  className="flex items-center justify-center gap-1.5 px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-2xl shadow-md shadow-emerald-600/25 disabled:opacity-50 transition-all cursor-pointer"
                >
                  {isApproving ? (
                    <Loader2 size={14} className="animate-spin" />
                  ) : (
                    <CheckCircle2 size={14} />
                  )}
                  <span>تایید نوبت</span>
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
