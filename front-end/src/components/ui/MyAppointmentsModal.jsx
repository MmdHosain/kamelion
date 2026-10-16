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
  ChevronRight,
  Info
} from 'lucide-react';
import { reservationService } from '../../api/reservationService';
import { getApiErrorMessage } from '../../utils/errorUtils';
import { formatJalaliDisplay, toPersianDigits } from '../../utils/jalaliDateUtils';
import useBodyScrollLock from '../../hooks/useBodyScrollLock';

const STATUS_CONFIG = {
  pending: {
    label: 'در انتظار تایید',
    badgeClass: 'bg-amber-50 text-amber-600 border-amber-200',
    dotClass: 'bg-amber-500 animate-pulse',
    canCancel: true,
  },
  scheduled: {
    label: 'تایید شده',
    badgeClass: 'bg-emerald-50 text-emerald-600 border-emerald-200',
    dotClass: 'bg-emerald-500',
    canCancel: true,
  },
  cancelled_user: {
    label: 'لغو شده توسط شما',
    badgeClass: 'bg-gray-50 text-gray-500 border-gray-200',
    dotClass: 'bg-gray-400',
    canCancel: false,
  },
  cancelled_admin: {
    label: 'رد شده توسط کلینیک',
    badgeClass: 'bg-rose-50 text-rose-600 border-rose-200',
    dotClass: 'bg-rose-500',
    canCancel: false,
  },
  visited: {
    label: 'ویزیت انجام شده',
    badgeClass: 'bg-purple-50 text-purple-600 border-purple-200',
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
  useBodyScrollLock(open);

  const [appointments, setAppointments] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [cancellingId, setCancellingId] = useState(null);
  const [confirmCancelId, setConfirmCancelId] = useState(null);
  const [successToast, setSuccessToast] = useState('');
  
  // Expanded view tracking
  const [expandedId, setExpandedId] = useState(null);

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
      setExpandedId(null);
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
      setSuccessToast('نوبت شما با موفقیت لغو گردید.');
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
      className="fixed inset-0 z-[100] bg-slate-900/60 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 animate-fadeSlide"
    >
      <div
        className="w-full max-w-4xl max-h-[92dvh] rounded-[2.5rem] bg-white/95 backdrop-blur-2xl border border-primary/20 p-5 sm:p-8 flex flex-col shadow-[0_25px_60px_-15px_rgba(231,84,128,0.2)] overflow-y-auto chat-scroll relative"
        style={{ overscrollBehavior: 'contain' }}
      >
        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          className="absolute top-5 left-5 sm:top-6 sm:left-6 w-10 h-10 rounded-2xl bg-white/90 hover:bg-white border border-primary/25 hover:border-primary text-textDark hover:text-primary shadow-sm hover:shadow-md transition-all duration-200 flex items-center justify-center z-20 cursor-pointer focus:outline-none focus:ring-2 focus:ring-primary/40 active:scale-95"
          aria-label="بستن پنجره"
          title="بستن"
        >
          <X size={20} strokeWidth={2.5} className="w-5 h-5 text-textDark hover:text-primary transition-colors" />
        </button>

        {/* Modal Header */}
        <div className="text-center mb-4 sm:mb-6 shrink-0">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-primary to-primary-dark text-white flex items-center justify-center mx-auto mb-3 shadow-lg shadow-primary/25">
            <Calendar className="w-6 h-6" />
          </div>
          <h2 className="text-2xl md:text-3xl font-black text-transparent bg-clip-text bg-gradient-to-l from-primary to-primary-dark">
            نوبت‌های ویزیت من
          </h2>
          <p className="text-xs md:text-sm text-textDark/75 font-medium mt-1">
            مشاهده وضعیت بررسی و مدیریت نوبت‌های ثبت‌شده شما
          </p>
        </div>

        {/* Book New Appointment Button */}
        {onOpenNewBooking && (
          <div className="flex justify-center mb-6 shrink-0">
            <button
              onClick={() => { onClose(); onOpenNewBooking(); }}
              className="bg-primary hover:bg-primary-dark text-white font-bold py-3.5 px-6 rounded-2xl transition-all duration-300 shadow-[0_8px_20px_-6px_rgba(231,84,128,0.5)] hover:shadow-[0_12px_24px_-6px_rgba(186,45,99,0.7)] hover:-translate-y-0.5 flex items-center justify-center gap-2 text-sm md:text-base cursor-pointer"
            >
              <Calendar className="w-5 h-5" />
              درخواست نوبت جدید
            </button>
          </div>
        )}

        {/* Success Toast */}
        {successToast && (
          <div className="mb-4 p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-sm font-bold flex items-center gap-2 animate-fadeSlide shrink-0">
            <CheckCircle2 className="w-5 h-5 shrink-0" />
            <span>{successToast}</span>
          </div>
        )}

        {/* Error Alert */}
        {error && (
          <div className="mb-4 p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm font-bold flex items-center justify-between gap-2 shrink-0">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-5 h-5 shrink-0" />
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

        {/* Body (Scrollable) */}
        <div className="flex-1 overflow-y-auto pr-1 custom-scroll">
          {isLoading ? (
            <div className="py-20 flex flex-col items-center justify-center gap-4">
              <Loader2 className="w-10 h-10 text-primary animate-spin" />
              <span className="text-sm text-gray-500 font-medium">
                در حال دریافت اطلاعات...
              </span>
            </div>
          ) : appointments.length === 0 ? (
            <div className="py-12 flex flex-col items-center justify-center text-center gap-4 bg-white/60 rounded-3xl border border-primary/15 p-6 my-auto">
              <div className="w-16 h-16 rounded-3xl bg-primary/10 text-primary flex items-center justify-center mb-2">
                <Calendar className="w-8 h-8" />
              </div>
              <h3 className="text-lg md:text-xl font-bold text-textDark">
                شما در حال حاضر نوبتی ثبت نکرده‌اید
              </h3>
              <p className="text-sm text-textDark/60 max-w-sm">
                برای دریافت نوبت معاینه و ویزیت حضوری می‌توانید از تقویم آنلاین استفاده نمایید.
              </p>
            </div>
          ) : (
            <div className="flex flex-col gap-4">
              {appointments.map((item) => {
                const rawDate = item.appointment_date || item.date;
                const dateObj = parseAppointmentDate(rawDate);
                const displayDate = dateObj ? formatJalaliDisplay(dateObj, true) : rawDate;
                const timeStr = String(item.appointment_time || item.time || '').slice(0, 5);
                const statusCfg = STATUS_CONFIG[item.status] || {
                  label: item.status,
                  badgeClass: 'bg-gray-100 text-gray-600 border-gray-200',
                  dotClass: 'bg-gray-400',
                  canCancel: false,
                };

                const isConfirming = confirmCancelId === item.id;
                const isCancelling = cancellingId === item.id;
                const isExpanded = expandedId === item.id;

                return (
                  <div
                    key={item.id}
                    className={`bg-white rounded-3xl transition-all duration-200 overflow-hidden ${
                      isExpanded ? 'border-2 border-primary shadow-md' : 'border border-primary/20 hover:border-primary/40 shadow-sm'
                    }`}
                  >
                    {/* Minimal Header (Always visible) */}
                    <div 
                      className="p-4 sm:p-5 flex flex-col lg:flex-row lg:items-center justify-between gap-4 cursor-pointer select-none"
                      onClick={() => {
                        if (isExpanded) {
                          setExpandedId(null);
                          if (confirmCancelId === item.id) setConfirmCancelId(null);
                        } else {
                          setExpandedId(item.id);
                        }
                      }}
                    >
                      <div className="flex items-center gap-3 sm:gap-5">
                        <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 ${
                          item.status === 'scheduled' ? 'bg-emerald-50 text-emerald-600' :
                          item.status === 'pending' ? 'bg-amber-50 text-amber-600' :
                          'bg-gray-50 text-gray-400'
                        }`}>
                          <Calendar className="w-6 h-6" />
                        </div>
                        <div className="flex flex-col gap-1">
                          <div className="flex items-center gap-2">
                            <p className="text-sm sm:text-base font-black text-gray-800">
                              {displayDate}
                            </p>
                            <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full border text-[10px] font-bold w-fit ${statusCfg.badgeClass}`}>
                              <span className={`w-1.5 h-1.5 rounded-full ${statusCfg.dotClass}`} />
                              {statusCfg.label}
                            </span>
                          </div>
                          <p className="text-xs font-bold text-gray-500">
                            ساعت {toPersianDigits(timeStr)}
                          </p>
                        </div>
                      </div>
                      
                      <div className="flex items-center justify-between lg:justify-end gap-3 w-full lg:w-auto mt-2 lg:mt-0 border-t lg:border-t-0 border-gray-100 pt-3 lg:pt-0">
                        <span className="text-xs font-mono text-gray-400 font-bold bg-gray-50 border border-gray-100 px-2 py-1 rounded-lg">
                          کد پیگیری: #{toPersianDigits(item.id)}
                        </span>
                        <div className="flex items-center gap-2">
                          {statusCfg.canCancel && (
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                setExpandedId(item.id);
                                setConfirmCancelId(item.id);
                              }}
                              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-rose-600 hover:bg-rose-50 border border-rose-200 text-xs font-bold transition-colors"
                            >
                              <Trash2 className="w-4 h-4" />
                              <span className="hidden sm:inline">لغو نوبت</span>
                            </button>
                          )}
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors ${
                            isExpanded ? 'bg-primary/10 text-primary' : 'bg-gray-50 text-gray-400 hover:bg-gray-100'
                          }`}>
                            <ChevronRight className={`w-5 h-5 transition-transform duration-300 ${isExpanded ? '-rotate-90' : 'rotate-180'}`} />
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Expanded Details */}
                    {isExpanded && (
                      <div className="px-4 sm:px-5 pb-5 pt-2 border-t border-gray-100 bg-gray-50/50 animate-fadeIn">
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                          {/* Reason */}
                          {item.reason && (
                            <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm flex flex-col gap-2">
                              <span className="text-xs font-bold text-gray-500 flex items-center gap-1.5">
                                <FileText className="w-4 h-4 text-primary" />
                                علت مراجعه
                              </span>
                              <p className="text-sm text-gray-700 leading-relaxed font-medium">
                                {item.reason}
                              </p>
                            </div>
                          )}

                          {/* Instructions / Notice */}
                          <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm flex flex-col gap-2">
                             <span className="text-xs font-bold text-gray-500 flex items-center gap-1.5">
                                <Info className="w-4 h-4 text-blue-500" />
                                راهنما
                              </span>
                              <p className="text-xs text-gray-600 leading-relaxed font-medium">
                                لطفاً ۱۵ دقیقه پیش از زمان تعیین شده در مطب حضور داشته باشید. در صورت داشتن مدارک پزشکی (سونوگرافی، ماموگرافی و...) آنها را همراه بیاورید.
                              </p>
                          </div>
                        </div>

                        {/* Confirmation for Cancellation */}
                        {isConfirming && (
                          <div className="w-full bg-rose-50 border border-rose-200 rounded-2xl p-4 flex flex-col sm:flex-row items-center justify-between gap-4 animate-fadeSlide mt-2">
                            <div className="flex items-center gap-2 text-rose-800 text-sm font-bold">
                              <AlertTriangle className="w-5 h-5 shrink-0" />
                              <span>آیا از لغو این نوبت اطمینان دارید؟ اسلات آزاد خواهد شد.</span>
                            </div>
                            <div className="flex items-center gap-2 w-full sm:w-auto">
                              <button
                                type="button"
                                onClick={() => setConfirmCancelId(null)}
                                disabled={isCancelling}
                                className="flex-1 sm:flex-none px-4 py-2 text-sm font-bold text-gray-600 hover:text-gray-900 bg-white rounded-xl border border-gray-200 transition-colors"
                              >
                                انصراف
                              </button>
                              <button
                                type="button"
                                onClick={() => handleCancel(item.id)}
                                disabled={isCancelling}
                                className="flex-1 sm:flex-none px-4 py-2 text-sm font-bold text-white rounded-xl bg-rose-600 hover:bg-rose-700 flex items-center justify-center gap-2 transition-colors disabled:opacity-50 shadow-md"
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
    </div>
  );
}
