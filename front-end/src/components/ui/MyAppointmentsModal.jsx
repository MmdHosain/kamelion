// src/components/ui/MyAppointmentsModal.jsx
import React, { useState, useEffect, useCallback } from 'react';
import {
  X,
  Calendar,
  Clock,
  AlertCircle,
  Loader2,
  Trash2,
  CheckCircle2,
  AlertTriangle,
  FileText,
  Sparkles,
} from 'lucide-react';
import { reservationService } from '../../api/reservationService';
import { getApiErrorMessage } from '../../utils/errorUtils';
import { formatJalaliDisplay, toPersianDigits } from '../../utils/jalaliDateUtils';
import useBodyScrollLock from '../../hooks/useBodyScrollLock';

const STATUS_CONFIG = {
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

export default function MyAppointmentsModal({ open, onClose, onOpenNewBooking }) {
  // Lock body scroll when my appointments modal is open
  useBodyScrollLock(open);

  const [appointments, setAppointments] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [cancellingId, setCancellingId] = useState(null);
  const [confirmCancelId, setConfirmCancelId] = useState(null);
  const [successToast, setSuccessToast] = useState('');

  const loadAppointments = useCallback(async () => {
    setIsLoading(true);
    setError('');
    try {
      const data = await reservationService.getUserReservations();
      const list = Array.isArray(data)
        ? data
        : Array.isArray(data?.results)
        ? data.results
        : [];
      // Sort newest first
      const sorted = [...list].sort((a, b) => (b.id || 0) - (a.id || 0));
      setAppointments(sorted);
    } catch (err) {
      console.error('Error fetching user appointments:', err);
      setError(getApiErrorMessage(err, 'خطا در دریافت لیست نوبت‌ها.'));
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && open) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [open, onClose]);

  useEffect(() => {
    if (open) {
      setConfirmCancelId(null);
      setSuccessToast('');
      loadAppointments();
    }
  }, [open, loadAppointments]);

  const handleCancel = async (id) => {
    setCancellingId(id);
    setError('');
    try {
      await reservationService.cancelReservation(id);
      setAppointments((prev) =>
        prev.map((app) => (app.id === id ? { ...app, status: 'cancelled_user' } : app))
      );
      setConfirmCancelId(null);
      setSuccessToast('نوبت شما با موفقیت لغو گردید و ساعت مربوطه آزاد شد.');
      setTimeout(() => setSuccessToast(''), 4000);
    } catch (err) {
      console.error('Error cancelling appointment:', err);
      alert(getApiErrorMessage(err, 'خطا در لغو نوبت. لطفاً مجدداً تلاش نمایید.'));
    } finally {
      setCancellingId(null);
    }
  };

  if (!open) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="نوبت‌های ویزیت من"
      className="fixed inset-0 z-[110] bg-black/60 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 animate-fadeSlide"
    >
      <div
        className="w-full max-w-2xl max-h-[90dvh] rounded-[2.5rem] bg-gradient-to-br from-bgLight/95 via-white/95 to-bgDark/95 backdrop-blur-2xl border border-primary/30 p-5 sm:p-7 flex flex-col shadow-2xl overflow-y-auto chat-scroll relative"
        style={{ overscrollBehavior: 'contain' }}
      >
        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          className="absolute top-5 left-5 text-textDark/60 hover:text-primary transition p-2 rounded-full hover:bg-white/80 z-10 cursor-pointer"
          aria-label="بستن"
        >
          <X className="w-6 h-6" />
        </button>

        {/* Modal Header */}
        <div className="text-center mb-6">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-primary to-primary-dark text-white flex items-center justify-center mx-auto mb-3 shadow-lg shadow-primary/30">
            <Calendar className="w-6 h-6" />
          </div>
          <h2 className="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-l from-primary to-primary-dark">
            نوبت‌های ویزیت من
          </h2>
          <p className="text-xs text-textDark/70 font-medium mt-1">
            مشاهده وضعیت بررسی و مدیریت نوبت‌های ثبت‌شده شما
          </p>
        </div>

        {/* Success Toast */}
        {successToast && (
          <div className="mb-4 p-3 rounded-2xl bg-emerald-50 border border-emerald-300 text-emerald-800 text-xs font-bold flex items-center gap-2 animate-fadeSlide">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{successToast}</span>
          </div>
        )}

        {/* Error Alert */}
        {error && (
          <div className="mb-4 p-3.5 rounded-2xl bg-red-50 border border-red-200 text-red-700 text-xs font-bold flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-red-500" />
              <span>{error}</span>
            </div>
            <button
              type="button"
              onClick={loadAppointments}
              className="text-xs underline hover:text-red-900 cursor-pointer"
            >
              تلاش مجدد
            </button>
          </div>
        )}

        {/* Body */}
        {isLoading ? (
          <div className="py-16 flex flex-col items-center justify-center gap-3">
            <Loader2 className="w-8 h-8 text-primary animate-spin" />
            <span className="text-xs text-textDark/60 font-medium">
              در حال دریافت نوبت‌های شما...
            </span>
          </div>
        ) : appointments.length === 0 ? (
          <div className="py-12 flex flex-col items-center justify-center text-center gap-3 bg-white/60 rounded-3xl border border-primary/15 p-6 my-auto">
            <div className="w-14 h-14 rounded-2xl bg-primary/10 text-primary flex items-center justify-center">
              <Calendar className="w-7 h-7" />
            </div>
            <h3 className="text-base font-bold text-textDark">
              شما در حال حاضر نوبتی ثبت نکرده‌اید
            </h3>
            <p className="text-xs text-textDark/60 max-w-sm">
              برای دریافت نوبت معاینه و ویزیت توسط خانم دکتر نگار معشوری می‌توانید از تقویم آنلاین استفاده نمایید.
            </p>
            {onOpenNewBooking && (
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onOpenNewBooking();
                }}
                className="mt-2 px-6 py-2.5 rounded-2xl bg-primary hover:bg-primary-dark text-white text-xs font-bold shadow-md shadow-primary/25 hover:shadow-primary/40 transition-all cursor-pointer"
              >
                رزرو نوبت جدید
              </button>
            )}
          </div>
        ) : (
          <div className="flex flex-col gap-3.5">
            {appointments.map((item) => {
              const rawDate = item.appointment_date || item.date;
              const dateObj = parseAppointmentDate(rawDate);
              const displayDate = dateObj ? formatJalaliDisplay(dateObj, true) : rawDate;
              const timeStr = String(item.appointment_time || item.time || '').slice(0, 5);
              const statusCfg = STATUS_CONFIG[item.status] || {
                label: item.status,
                badgeClass: 'bg-gray-100 text-gray-700 border-gray-200',
                dotClass: 'bg-gray-400',
                canCancel: false,
              };

              const isConfirming = confirmCancelId === item.id;
              const isCancelling = cancellingId === item.id;

              return (
                <div
                  key={item.id}
                  className="bg-white/90 border border-primary/20 hover:border-primary/40 rounded-3xl p-4 sm:p-5 flex flex-col gap-3 shadow-sm transition-all"
                >
                  {/* Card Top: Status & ID */}
                  <div className="flex items-center justify-between flex-wrap gap-2">
                    <span
                      className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full border text-xs font-bold ${statusCfg.badgeClass}`}
                    >
                      <span className={`w-2 h-2 rounded-full ${statusCfg.dotClass}`} />
                      {statusCfg.label}
                    </span>

                    <span className="text-[11px] font-mono text-textDark/50 font-bold">
                      کد پیگیری: #{item.id}
                    </span>
                  </div>

                  {/* Card Details */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-textDark">
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-primary shrink-0" />
                      <span className="font-bold text-textDark/75">تاریخ مراجعه:</span>
                      <span className="font-black text-primary-dark">{displayDate}</span>
                    </div>

                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4 text-primary shrink-0" />
                      <span className="font-bold text-textDark/75">ساعت ویزیت:</span>
                      <span className="font-black text-primary">ساعت {toPersianDigits(timeStr)}</span>
                    </div>
                  </div>

                  {/* Reason if provided */}
                  {item.reason && (
                    <div className="text-xs text-textDark/70 bg-bgLight/50 rounded-xl px-3 py-2 border border-primary/10 flex items-start gap-1.5">
                      <FileText className="w-3.5 h-3.5 text-primary/70 shrink-0 mt-0.5" />
                      <span>{item.reason}</span>
                    </div>
                  )}

                  {/* Cancellation Action or Confirmation */}
                  {statusCfg.canCancel && (
                    <div className="pt-2 border-t border-gray-100 flex items-center justify-between">
                      {isConfirming ? (
                        <div className="w-full bg-rose-50 border border-rose-200 rounded-2xl p-3 flex flex-col sm:flex-row items-center justify-between gap-2.5 animate-fadeSlide">
                          <div className="flex items-center gap-1.5 text-rose-800 text-xs font-bold text-right">
                            <AlertTriangle className="w-4 h-4 shrink-0 text-rose-600" />
                            <span>آیا از لغو این نوبت اطمینان دارید؟ اسلات آزاد خواهد شد.</span>
                          </div>
                          <div className="flex items-center gap-2 self-end sm:self-center">
                            <button
                              type="button"
                              onClick={() => setConfirmCancelId(null)}
                              disabled={isCancelling}
                              className="px-3 py-1 text-xs font-bold text-gray-600 hover:text-gray-900 rounded-xl bg-white border border-gray-200 cursor-pointer"
                            >
                              انصراف
                            </button>
                            <button
                              type="button"
                              onClick={() => handleCancel(item.id)}
                              disabled={isCancelling}
                              className="px-3 py-1 text-xs font-bold text-white rounded-xl bg-rose-600 hover:bg-rose-700 flex items-center gap-1 cursor-pointer disabled:opacity-50"
                            >
                              {isCancelling ? (
                                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                              ) : (
                                <Trash2 className="w-3.5 h-3.5" />
                              )}
                              <span>بله، لغو شود</span>
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div className="w-full flex items-center justify-between">
                          <span className="text-[11px] text-textDark/50">
                            {item.status === 'pending'
                              ? 'تا پیش از تایید کلینیک می‌توانید نوبت را لغو نمایید.'
                              : 'امکان لغو نوبت تا ۲۴ ساعت پیش از ویزیت فراهم است.'}
                          </span>
                          <button
                            type="button"
                            onClick={() => setConfirmCancelId(item.id)}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-rose-600 hover:bg-rose-50 border border-rose-200 text-xs font-bold transition-all cursor-pointer"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                            <span>لغو این نوبت</span>
                          </button>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
