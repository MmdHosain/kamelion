// src/components/ui/AppointmentModal.jsx
import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  X,
  Calendar,
  Clock,
  CheckCircle2,
  Check,
  AlertCircle,
  Loader2,
  Sparkles,
  AlertTriangle,
  FileText,
  ChevronRight,
  ChevronLeft,
} from 'lucide-react';
import JalaliCalendar from './JalaliCalendar';
import { getAvailableSlots, bookSlot } from '../../api/reservationService';
import { useAuth } from '../../hooks/useAuth';
import { getApiErrorMessage } from '../../utils/errorUtils';
import {
  formatDateForApi,
  formatJalaliDisplay,
  toPersianDigits,
} from '../../utils/jalaliDateUtils';

export const QUICK_REASONS = [
  'معاینه و چکاپ دوره‌ای',
  'بررسی سونوگرافی یا ماموگرافی',
  'لمس توده یا احساس درد',
  'مشاوره جراحی زیبایی (ماموپلاستی / پروتز)',
  'مراقبت و معاینه پس از جراحی',
];

const MAX_REASON_LENGTH = 300;
const MIN_REASON_LENGTH = 5;

export function ReasonChip({ label, active, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={`text-[11px] font-bold px-2.5 py-1 rounded-xl border transition-all duration-200 cursor-pointer flex items-center gap-1.5 select-none ${
        active
          ? 'bg-primary text-white border-primary shadow-xs ring-2 ring-primary/20 hover:bg-primary-dark'
          : 'bg-primary/5 hover:bg-primary/15 text-primary-dark border-primary/15 hover:border-primary/30'
      }`}
    >
      {active ? (
        <Check size={12} strokeWidth={2.5} className="shrink-0" />
      ) : (
        <span className="text-primary font-bold text-xs leading-none">+</span>
      )}
      <span>{label}</span>
    </button>
  );
}

const normalizeSlotStatus = (status) => {
  if (!status) return 'available';
  const normalized = String(status).toLowerCase();
  if (['available', 'free', 'open'].includes(normalized)) return 'available';
  if (['pending', 'waiting'].includes(normalized)) return 'pending';
  if (['reserved', 'booked', 'unavailable'].includes(normalized)) return 'reserved';
  return normalized;
};

const normalizeSingleSlot = (slot) => {
  if (typeof slot === 'string') {
    const time = slot.includes(':')
      ? slot.split(':').map((part) => part.padStart(2, '0')).join(':').slice(0, 5)
      : slot;
    return { time, status: 'available' };
  }

  if (slot && typeof slot === 'object') {
    const rawTime =
      slot.time || slot.start_time || slot.startTime || slot.value || '';
    return {
      ...slot,
      time: String(rawTime).slice(0, 5),
      status: normalizeSlotStatus(slot.status || 'available'),
    };
  }

  return null;
};

const normalizeSlotsResponse = (data) => {
  let rawSlots = [];
  if (Array.isArray(data)) {
    rawSlots = data;
  } else if (Array.isArray(data?.available_slots)) {
    rawSlots = data.available_slots;
  } else if (Array.isArray(data?.slots)) {
    rawSlots = data.slots;
  } else if (Array.isArray(data?.results)) {
    rawSlots = data.results;
  } else if (Array.isArray(data?.data)) {
    rawSlots = data.data;
  }

  return rawSlots.map(normalizeSingleSlot).filter((slot) => slot && slot.time);
};

export default function AppointmentModal({ open, onClose, onOpenMyAppointments }) {
  const { isAuthenticated, openAuthModal } = useAuth();

  const [mobileStep, setMobileStep] = useState(1); // 1 = Calendar/Date, 2 = Time & Reason
  const [selectedDate, setSelectedDate] = useState(null);
  const [availableSlots, setAvailableSlots] = useState([]);
  const [selectedTime, setSelectedTime] = useState(null);
  const [reason, setReason] = useState('');
  const [isLoadingSlots, setIsLoadingSlots] = useState(false);
  const [isBooking, setIsBooking] = useState(false);
  const [errors, setErrors] = useState({});
  const [pendingBookingAfterAuth, setPendingBookingAfterAuth] = useState(false);
  const [bookingSuccess, setBookingSuccess] = useState(false);
  const [bookedAppointment, setBookedAppointment] = useState(null);

  const reasonInputRef = useRef(null);

  useEffect(() => {
    if (open) {
      setMobileStep(1);
      setSelectedDate(null);
      setAvailableSlots([]);
      setSelectedTime(null);
      setReason('');
      setIsLoadingSlots(false);
      setIsBooking(false);
      setErrors({});
      setPendingBookingAfterAuth(false);
      setBookingSuccess(false);
      setBookedAppointment(null);
    }
  }, [open]);

  const fetchSlots = useCallback(async (date) => {
    if (!date) return;

    setIsLoadingSlots(true);
    setErrors((prev) => ({ ...prev, date: '', booking: '', time: '' }));
    setSelectedTime(null);
    setAvailableSlots([]);

    try {
      const apiDate = formatDateForApi(date);
      const response = await getAvailableSlots(apiDate);
      const slots = normalizeSlotsResponse(response);
      setAvailableSlots(slots);
    } catch (err) {
      console.error('Error fetching slots:', err);
      setAvailableSlots([]);
      setErrors((prev) => ({
        ...prev,
        date: getApiErrorMessage(err, 'خطا در دریافت زمان‌های خالی. لطفاً دوباره تلاش کنید.'),
      }));
    } finally {
      setIsLoadingSlots(false);
    }
  }, []);

  const handleDayClick = (day) => {
    if (!day) return;
    setSelectedDate(day);
    fetchSlots(day);
    // On mobile, advance smoothly to Step 2 (Time & Reason)
    setMobileStep(2);
  };

  const handleSlotSelect = (time) => {
    setSelectedTime(time);
    setErrors((prev) => ({ ...prev, time: '' }));
    setTimeout(() => {
      reasonInputRef.current?.focus();
    }, 150);
  };

  const handleReasonChange = (e) => {
    const val = e.target.value;
    setReason(val);
    if (errors.reason && val.trim().length >= MIN_REASON_LENGTH) {
      setErrors((prev) => ({ ...prev, reason: '' }));
    }
  };

  const isChipActive = useCallback(
    (chipText) => {
      if (!reason || !chipText) return false;
      const trimmedChip = chipText.trim();
      const segments = reason
        .split(/\s*—\s*/)
        .map((s) => s.trim())
        .filter(Boolean);
      return segments.includes(trimmedChip) || reason.includes(trimmedChip);
    },
    [reason]
  );

  const handleQuickReasonClick = (chipText) => {
    const trimmedChip = chipText.trim();
    setReason((prev) => {
      const trimmedPrev = prev.trim();
      const segments = trimmedPrev
        ? trimmedPrev
            .split(/\s*—\s*/)
            .map((s) => s.trim())
            .filter(Boolean)
        : [];

      const isAlreadyPresent =
        segments.includes(trimmedChip) || trimmedPrev.includes(trimmedChip);

      let next;
      if (isAlreadyPresent) {
        // Toggle OFF: Remove chip from reason string
        const remaining = segments.filter((s) => s !== trimmedChip);
        if (remaining.length === segments.length) {
          // Fallback if not an exact segment match
          const escaped = trimmedChip.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
          next = trimmedPrev
            .replace(
              new RegExp(`(^|\\s*—\\s*)${escaped}(\\s*—\\s*|$)`, 'g'),
              (m, p1, p2) => (p1 && p2 && p1.includes('—') && p2.includes('—') ? ' — ' : '')
            )
            .trim();
        } else {
          next = remaining.join(' — ');
        }
      } else {
        // Toggle ON: Append chip without duplicate
        next = trimmedPrev ? `${trimmedPrev} — ${trimmedChip}` : trimmedChip;
      }

      return next.slice(0, MAX_REASON_LENGTH);
    });

    setErrors((prev) => ({ ...prev, reason: '' }));
    reasonInputRef.current?.focus();
  };

  const validateForm = () => {
    const newErrors = {};

    if (!selectedDate) {
      newErrors.date = 'لطفاً ابتدا روز مورد نظر خود را از تقویم انتخاب فرمایید.';
    }

    if (!selectedTime) {
      newErrors.time = 'لطفاً یکی از ساعت‌های کاری خالی را برای ویزیت انتخاب نمایید.';
    }

    const trimmedReason = reason.trim();
    if (!trimmedReason) {
      newErrors.reason = 'ثبت علت مراجعه الزامی است. لطفاً دلیل ویزیت خود را بنویسید.';
    } else if (trimmedReason.length < MIN_REASON_LENGTH) {
      newErrors.reason = `علت مراجعه باید حداقل ${toPersianDigits(MIN_REASON_LENGTH)} کاراکتر باشد تا پزشک بتواند شرح حال اولیه را بررسی کند.`;
    }

    setErrors((prev) => ({ ...prev, ...newErrors }));
    return Object.keys(newErrors).length === 0;
  };

  const doBookAppointment = useCallback(async () => {
    if (!selectedDate || !selectedTime) return;

    const trimmedReason = reason.trim();
    if (!trimmedReason || trimmedReason.length < MIN_REASON_LENGTH) {
      setErrors((prev) => ({
        ...prev,
        reason: 'ثبت علت مراجعه الزامی است (حداقل ۵ کاراکتر).',
      }));
      reasonInputRef.current?.focus();
      return;
    }

    setIsBooking(true);
    setErrors((prev) => ({ ...prev, booking: '' }));

    try {
      const apiDate = formatDateForApi(selectedDate);
      const result = await bookSlot(apiDate, selectedTime, trimmedReason);
      setBookedAppointment({
        ...result,
        displayDate: formatJalaliDisplay(selectedDate, true),
        time: selectedTime,
        reason: trimmedReason,
      });
      setBookingSuccess(true);
    } catch (err) {
      const errorMsg = getApiErrorMessage(
        err,
        'خطا در ثبت نوبت. لطفاً دوباره تلاش کنید یا ساعت دیگری را انتخاب نمایید.'
      );
      const friendlyMsg =
        errorMsg === 'Selected time slot is not available.'
          ? 'زمان انتخابی دیگر در دسترس نیست یا پر شده است.'
          : errorMsg;

      setErrors((prev) => ({ ...prev, booking: friendlyMsg }));
    } finally {
      setIsBooking(false);
    }
  }, [selectedDate, selectedTime, reason]);

  useEffect(() => {
    if (
      open &&
      isAuthenticated &&
      pendingBookingAfterAuth &&
      selectedDate &&
      selectedTime &&
      reason.trim().length >= MIN_REASON_LENGTH &&
      !isBooking
    ) {
      setPendingBookingAfterAuth(false);
      doBookAppointment();
    }
  }, [open, isAuthenticated, pendingBookingAfterAuth, selectedDate, selectedTime, reason, isBooking, doBookAppointment]);

  const handleBookAppointment = () => {
    if (isBooking) return;

    const isValid = validateForm();
    if (!isValid) {
      if (!selectedTime) {
        setMobileStep(2);
      }
      if (!reason.trim() || reason.trim().length < MIN_REASON_LENGTH) {
        setMobileStep(2);
        setTimeout(() => reasonInputRef.current?.focus(), 150);
      }
      return;
    }

    if (!isAuthenticated) {
      setPendingBookingAfterAuth(true);
      if (openAuthModal) openAuthModal();
      return;
    }

    doBookAppointment();
  };

  const isPastDate = (day) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return day < today;
  };

  const isTooFarFuture = (day) => {
    const limit = new Date();
    limit.setMonth(limit.getMonth() + 6);
    limit.setHours(0, 0, 0, 0);
    return day > limit;
  };

  const isUnavailable = (day) => {
    return isPastDate(day) || isTooFarFuture(day) || day.getDay() === 5; // Friday closed
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[100] bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6 animate-fadeSlide">
      <div className="w-full max-w-4xl max-h-[92vh] rounded-[2.5rem] bg-white/95 backdrop-blur-2xl border border-primary/20 p-5 sm:p-8 flex flex-col shadow-[0_25px_60px_-15px_rgba(231,84,128,0.2)] overflow-y-auto chat-scroll relative">
        
        {/* Close Button ("X") */}
        <button
          type="button"
          onClick={onClose}
          disabled={isBooking}
          className="absolute top-5 left-5 sm:top-6 sm:left-6 w-10 h-10 rounded-2xl bg-white/90 hover:bg-white border border-primary/25 hover:border-primary text-textDark hover:text-primary shadow-sm hover:shadow-md transition-all duration-200 flex items-center justify-center z-20 cursor-pointer focus:outline-none focus:ring-2 focus:ring-primary/40 active:scale-95 disabled:opacity-50"
          aria-label="بستن پنجره"
          title="بستن"
        >
          <X size={20} strokeWidth={2.5} className="w-5 h-5 text-textDark hover:text-primary transition-colors" />
        </button>

        {/* Modal Header */}
        <div className="text-center mb-4 sm:mb-6">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-primary to-primary-dark text-white flex items-center justify-center mx-auto mb-3 shadow-lg shadow-primary/25">
            <Calendar className="w-6 h-6" />
          </div>
          <h2 className="text-2xl md:text-3xl font-black text-transparent bg-clip-text bg-gradient-to-l from-primary to-primary-dark">
            رزرو وقت ویزیت آنلاین
          </h2>
          <p className="text-xs md:text-sm text-textDark/75 font-medium mt-1">
            کلینیک تخصصی بیماری‌ها و جراحی پستان دکتر نگار معشوری
          </p>
        </div>

        {bookingSuccess ? (
          <div className="bg-gradient-to-br from-amber-500/10 via-amber-500/5 to-primary/10 border-2 border-amber-500/30 p-6 sm:p-8 rounded-3xl text-center flex flex-col items-center gap-4 my-auto shadow-lg animate-fadeSlide">
            <div className="w-16 h-16 rounded-2xl bg-amber-500/20 text-amber-600 flex items-center justify-center shadow-inner">
              <Clock className="w-9 h-9 animate-pulse" />
            </div>

            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-amber-100 border border-amber-300 text-amber-900 text-xs font-black shadow-sm">
              <span className="w-2 h-2 rounded-full bg-amber-500 animate-ping" />
              وضعیت: در انتظار بررسی و تایید کلینیک
            </div>

            <h3 className="text-xl md:text-2xl font-black text-textDark">
              درخواست نوبت شما با موفقیت ثبت شد
            </h3>

            <p className="text-xs md:text-sm text-textDark/80 font-medium max-w-md leading-relaxed">
              این ساعت ویزیت تا زمان بررسی منشی مطب برای شما رزرو موقت گردید. پس از تایید نهایی، پیامک تایید برای شما ارسال خواهد شد.
            </p>

            {bookedAppointment && (
              <div className="w-full max-w-sm bg-white/90 rounded-2xl border border-primary/20 p-4 text-xs flex flex-col gap-2.5 font-bold text-textDark shadow-sm">
                <div className="flex justify-between items-center border-b border-gray-100 pb-2">
                  <span className="text-textDark/60">تاریخ ویزیت:</span>
                  <span className="text-primary-dark">{bookedAppointment.displayDate}</span>
                </div>
                <div className="flex justify-between items-center border-b border-gray-100 pb-2">
                  <span className="text-textDark/60">ساعت ویزیت:</span>
                  <span className="text-primary font-black">ساعت {toPersianDigits(bookedAppointment.time)}</span>
                </div>
                {bookedAppointment.reason && (
                  <div className="flex justify-between items-start border-b border-gray-100 pb-2 gap-2 text-right">
                    <span className="text-textDark/60 shrink-0">علت مراجعه:</span>
                    <span className="text-textDark font-medium leading-relaxed max-w-[220px]">
                      {bookedAppointment.reason}
                    </span>
                  </div>
                )}
                {bookedAppointment.id && (
                  <div className="flex justify-between items-center">
                    <span className="text-textDark/60">کد رهگیری نوبت:</span>
                    <span className="font-mono text-gray-800">#{bookedAppointment.id}</span>
                  </div>
                )}
              </div>
            )}

            <div className="flex flex-col sm:flex-row items-center gap-2.5 mt-2 w-full max-w-sm justify-center">
              <button
                type="button"
                onClick={onClose}
                className="w-full sm:w-auto px-8 py-2.5 rounded-2xl bg-primary hover:bg-primary-dark text-white font-bold text-sm shadow-md shadow-primary/25 hover:shadow-primary/40 hover:-translate-y-0.5 transition-all cursor-pointer"
              >
                متوجه شدم / بستن
              </button>

              {onOpenMyAppointments && (
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    onOpenMyAppointments();
                  }}
                  className="w-full sm:w-auto px-5 py-2.5 rounded-2xl bg-white hover:bg-gray-50 border border-primary/25 text-primary text-xs font-bold transition-all cursor-pointer shadow-sm whitespace-nowrap"
                >
                  مشاهده نوبت‌های من
                </button>
              )}
            </div>
          </div>
        ) : (
          <div className="flex flex-col gap-5">
            
            {/* Mobile Step Progress Indicator (Hidden on Desktop) */}
            <div className="flex lg:hidden items-center justify-center gap-2.5 mb-2">
              <button
                type="button"
                onClick={() => setMobileStep(1)}
                className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer ${
                  mobileStep === 1
                    ? 'bg-primary text-white shadow-sm ring-2 ring-primary/30'
                    : 'bg-primary/10 text-primary hover:bg-primary/20'
                }`}
              >
                <span className={`w-4 h-4 rounded-full text-[10px] flex items-center justify-center font-black ${
                  mobileStep === 1 ? 'bg-white text-primary' : 'bg-primary text-white'
                }`}>
                  {selectedDate && mobileStep === 2 ? '✓' : '۱'}
                </span>
                <span>۱. انتخاب روز</span>
              </button>

              <span className="w-5 h-[1.5px] bg-primary/25" />

              <button
                type="button"
                onClick={() => {
                  if (selectedDate) setMobileStep(2);
                }}
                disabled={!selectedDate}
                className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-bold transition-all ${
                  mobileStep === 2
                    ? 'bg-primary text-white shadow-sm ring-2 ring-primary/30 cursor-pointer'
                    : selectedDate
                    ? 'bg-primary/10 text-primary hover:bg-primary/20 cursor-pointer'
                    : 'bg-gray-100 text-gray-400 cursor-not-allowed opacity-60'
                }`}
              >
                <span className={`w-4 h-4 rounded-full text-[10px] flex items-center justify-center font-black ${
                  mobileStep === 2 ? 'bg-white text-primary' : 'bg-gray-300 text-white'
                }`}>
                  ۲
                </span>
                <span>۲. ساعت و مشخصات</span>
              </button>
            </div>

            {/* Two-Column Responsive Grid (Step 1 or Step 2 on Mobile, Combined Side-by-Side on Desktop) */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
              
              {/* Column 1: Step 1 (Date Selection Calendar) */}
              <div className={`${
                mobileStep === 1 ? 'flex' : 'hidden lg:flex'
              } flex-col bg-white border border-primary/15 rounded-3xl p-4 sm:p-6 shadow-xs animate-fadeSlide`}>
                <div className="w-full flex items-center justify-between border-b border-primary/10 pb-3 mb-4">
                  <span className="text-xs font-bold text-primary flex items-center gap-1.5">
                    <span className="w-5 h-5 rounded-full bg-primary text-white text-[10px] font-black flex items-center justify-center">۱</span>
                    انتخاب روز مراجعه (تقویم شمسی)
                  </span>
                  <span className="text-[11px] text-textDark/60 font-medium">جمعه‌ها تعطیل است</span>
                </div>

                <div className="flex justify-center w-full">
                  <JalaliCalendar
                    selectedDate={selectedDate}
                    onSelect={handleDayClick}
                    isDateDisabled={isUnavailable}
                  />
                </div>

                {/* Mobile Continue Bar (Appears when date is chosen to allow moving to step 2 without re-clicking day) */}
                {selectedDate && (
                  <button
                    type="button"
                    onClick={() => setMobileStep(2)}
                    className="w-full mt-4 lg:hidden py-3 px-4 rounded-2xl bg-primary hover:bg-primary-dark text-white font-bold text-xs shadow-md shadow-primary/25 flex items-center justify-center gap-2 cursor-pointer animate-fadeSlide"
                  >
                    <span>مشاهده ساعت‌های خالی ({formatJalaliDisplay(selectedDate, false)})</span>
                    <ChevronLeft size={16} />
                  </button>
                )}
              </div>

              {/* Column 2: Step 2 (Time Slots, Reason & Confirm Button) */}
              <div className={`${
                mobileStep === 2 ? 'flex' : 'hidden lg:flex'
              } flex-col justify-between bg-white border border-primary/15 rounded-3xl p-5 sm:p-6 shadow-xs animate-fadeSlide min-h-[460px]`}>
                <div className="flex flex-col gap-4">
                  
                  {/* Mobile Back to Calendar Bar */}
                  <div className="flex lg:hidden items-center justify-between border-b border-primary/10 pb-3">
                    <button
                      type="button"
                      onClick={() => setMobileStep(1)}
                      className="inline-flex items-center gap-1.5 text-xs font-bold text-primary hover:text-primary-dark py-1.5 px-3 rounded-xl bg-primary/10 hover:bg-primary/20 transition-all cursor-pointer"
                      aria-label="بازگشت به تقویم و انتخاب تاریخ"
                    >
                      <ChevronRight size={16} />
                      <span>بازگشت به تقویم</span>
                    </button>

                    {selectedDate && (
                      <span className="text-xs font-bold text-textDark/80">
                        {formatJalaliDisplay(selectedDate, false)}
                      </span>
                    )}
                  </div>

                  {/* Selected Date Summary Header */}
                  <div className="flex items-center justify-between border-b border-primary/10 pb-3">
                    <span className="text-xs font-bold text-primary flex items-center gap-1.5">
                      <span className="w-5 h-5 rounded-full bg-primary text-white text-[10px] font-black flex items-center justify-center">۲</span>
                      انتخاب ساعت ویزیت
                    </span>
                    {selectedDate && (
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs font-bold text-primary-dark bg-primary/10 px-2.5 py-1 rounded-lg">
                          {formatJalaliDisplay(selectedDate, true)}
                        </span>
                        <button
                          type="button"
                          onClick={() => setMobileStep(1)}
                          className="hidden lg:inline-block text-[11px] font-bold text-primary hover:underline cursor-pointer"
                        >
                          تغییر
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Time Slots Area */}
                  {isLoadingSlots && (
                    <div className="flex flex-col justify-center items-center h-40 gap-2">
                      <Loader2 className="w-8 h-8 text-primary animate-spin" />
                      <span className="text-xs text-textDark/60 font-medium">در حال دریافت زمان‌های خالی...</span>
                    </div>
                  )}

                  {!isLoadingSlots && errors.date && (
                    <div className="p-4 rounded-2xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2 my-2">
                      <AlertCircle className="w-4 h-4 shrink-0 text-red-500" />
                      <span>{errors.date}</span>
                    </div>
                  )}

                  {!isLoadingSlots && !errors.date && availableSlots.length > 0 && (
                    <div className="flex flex-col gap-2">
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 max-h-40 overflow-y-auto chat-scroll p-1">
                        {availableSlots.map((slot, index) => {
                          const isAvailable = slot.status === 'available';
                          const isSelected = selectedTime === slot.time;

                          return (
                            <button
                              key={`${slot.time}-${index}`}
                              type="button"
                              onClick={() => handleSlotSelect(slot.time)}
                              disabled={!isAvailable || isBooking}
                              className={`py-2.5 px-3 rounded-2xl border-2 text-center font-black text-sm transition-all duration-200 cursor-pointer ${
                                isSelected
                                  ? 'bg-gradient-to-r from-primary to-primary-dark border-transparent text-white shadow-lg shadow-primary/35 scale-102 ring-2 ring-primary/30'
                                  : isAvailable
                                  ? 'bg-white border-primary/20 text-textDark hover:bg-primary/10 hover:border-primary'
                                  : 'bg-gray-100/70 border-gray-200 text-gray-400 cursor-not-allowed opacity-50'
                              }`}
                            >
                              <div className="flex items-center justify-center gap-1">
                                <Clock className={`w-3.5 h-3.5 ${isSelected ? 'text-white' : 'text-primary'}`} />
                                <span>{toPersianDigits(slot.time)}</span>
                              </div>
                            </button>
                          );
                        })}
                      </div>
                      {errors.time && (
                        <p className="text-rose-600 text-xs font-bold flex items-center gap-1">
                          <AlertCircle className="w-3.5 h-3.5" />
                          <span>{errors.time}</span>
                        </p>
                      )}
                    </div>
                  )}

                  {!isLoadingSlots && !errors.date && selectedDate && availableSlots.length === 0 && (
                    <div className="flex flex-col items-center justify-center py-6 px-4 text-center bg-amber-500/5 rounded-2xl border border-amber-500/20 my-2">
                      <div className="w-9 h-9 rounded-xl bg-amber-500/10 text-amber-600 flex items-center justify-center mb-2">
                        <AlertTriangle className="w-5 h-5" />
                      </div>
                      <p className="text-xs md:text-sm font-bold text-textDark mb-1">
                        نوبت خالی برای این روز یافت نشد
                      </p>
                      <p className="text-[11px] md:text-xs text-textDark/65 max-w-xs leading-relaxed">
                        برای تاریخ انتخاب‌شده برنامه ویزیت تعریف نشده یا تمامی نوبت‌ها تکمیل شده است. لطفاً روز کاری دیگری را انتخاب نمایید.
                      </p>
                      <button
                        type="button"
                        onClick={() => setMobileStep(1)}
                        className="mt-3 text-xs font-bold text-primary hover:underline cursor-pointer"
                      >
                        بازگشت به تقویم و انتخاب روز دیگر
                      </button>
                    </div>
                  )}

                  {!isLoadingSlots && !selectedDate && (
                    <div className="text-center text-textDark/55 py-8 text-xs md:text-sm font-medium leading-relaxed">
                      لطفاً ابتدا از تقویم، یک روز کاری را انتخاب نمایید تا زمان‌های آزاد نمایش داده شوند.
                    </div>
                  )}

                  {/* Step 3: Mandatory Reason for Visit & Selected Time Pill */}
                  {selectedDate && (
                    <div className="pt-3 border-t border-primary/15 flex flex-col gap-3 animate-fadeSlide">
                      
                      {/* Selection Summary Pill */}
                      {selectedTime && (
                        <div className="p-3 rounded-2xl bg-gradient-to-r from-primary/10 via-primary/5 to-primary-dark/10 border border-primary/20 flex items-center justify-between text-xs font-bold text-textDark">
                          <span className="flex items-center gap-1.5 text-primary-dark">
                            <Sparkles className="w-4 h-4 text-primary" />
                            زمان انتخابی شما:
                          </span>
                          <span className="font-black text-primary">
                            ساعت {toPersianDigits(selectedTime)} — {formatJalaliDisplay(selectedDate, true)}
                          </span>
                        </div>
                      )}

                      {/* Mandatory Reason Form Field */}
                      <div className="flex flex-col gap-1.5">
                        <div className="flex items-center justify-between">
                          <label
                            htmlFor="appointment-reason"
                            className="text-xs font-bold text-textDark flex items-center gap-1.5"
                          >
                            <span className="w-5 h-5 rounded-full bg-primary text-white text-[10px] font-black flex items-center justify-center">۳</span>
                            <FileText className="w-3.5 h-3.5 text-primary" />
                            <span>علت مراجعه به پزشک</span>
                            <span className="text-rose-500 font-black" title="الزامی">*</span>
                          </label>
                          <span className={`text-[11px] font-mono font-bold ${
                            reason.length >= MAX_REASON_LENGTH ? 'text-rose-500' : 'text-textDark/55'
                          }`}>
                            {toPersianDigits(reason.length)} / {toPersianDigits(MAX_REASON_LENGTH)} کاراکتر
                          </span>
                        </div>

                        {/* Quick Selection Tags */}
                        <div className="flex flex-wrap gap-1.5 my-0.5">
                          {QUICK_REASONS.map((chipText) => (
                            <ReasonChip
                              key={chipText}
                              label={chipText}
                              active={isChipActive(chipText)}
                              onClick={() => handleQuickReasonClick(chipText)}
                            />
                          ))}
                        </div>

                        {/* Textarea Input */}
                        <textarea
                          id="appointment-reason"
                          ref={reasonInputRef}
                          rows={3}
                          maxLength={MAX_REASON_LENGTH}
                          value={reason}
                          onChange={handleReasonChange}
                          placeholder="علائم، شرح حال مختصر، نتایج ماموگرافی یا هدف از مراجعه را یادداشت فرمایید (حداقل ۵ کاراکتر)..."
                          aria-required="true"
                          aria-invalid={Boolean(errors.reason)}
                          aria-describedby={errors.reason ? 'reason-error' : undefined}
                          className={`w-full p-3 text-xs md:text-sm border rounded-2xl bg-white focus:outline-none focus:ring-2 transition-all font-medium resize-none shadow-xs ${
                            errors.reason
                              ? 'border-rose-400 bg-rose-50/20 focus:ring-rose-200 focus:border-rose-500 text-textDark'
                              : 'border-primary/25 focus:border-primary focus:ring-primary/20 text-textDark placeholder:text-textDark/45'
                          }`}
                        />

                        {/* Error Message */}
                        {errors.reason && (
                          <div
                            id="reason-error"
                            role="alert"
                            className="flex items-center gap-1.5 text-rose-600 text-xs font-bold mt-1 bg-rose-50/80 px-2.5 py-1.5 rounded-xl border border-rose-200 animate-fadeSlide"
                          >
                            <AlertCircle className="w-4 h-4 shrink-0 text-rose-500" />
                            <span>{errors.reason}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>

                {/* Primary Confirm Booking Button (Always accessible in Step 2 on Mobile and in Action Column on Desktop) */}
                <div className="mt-4 pt-3 border-t border-primary/10 flex flex-col gap-2">
                  {errors.booking && (
                    <p className="text-red-600 text-xs text-center flex items-center justify-center gap-1 bg-red-50 p-2.5 rounded-xl border border-red-200">
                      <AlertCircle className="w-4 h-4 shrink-0" />
                      <span>{errors.booking}</span>
                    </p>
                  )}

                  <button
                    type="button"
                    onClick={handleBookAppointment}
                    disabled={!selectedTime || !selectedDate || isBooking}
                    className={`w-full py-3.5 sm:py-4 rounded-2xl text-white font-black text-sm md:text-base transition-all duration-300 flex items-center justify-center gap-2 shadow-lg ${
                      selectedTime && selectedDate && !isBooking
                        ? 'bg-primary hover:bg-primary-dark shadow-primary/30 hover:shadow-primary/50 hover:-translate-y-0.5 cursor-pointer'
                        : 'bg-gray-300 text-gray-500 cursor-not-allowed opacity-60'
                    }`}
                  >
                    {isBooking ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin" />
                        در حال ثبت نهایی در سیستم...
                      </>
                    ) : (
                      <>
                        <CheckCircle2 className="w-5 h-5" />
                        تایید و دریافت نوبت ویزیت
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
