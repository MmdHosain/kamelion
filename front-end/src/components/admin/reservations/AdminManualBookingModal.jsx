// src/components/admin/reservations/AdminManualBookingModal.jsx
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { createPortal } from 'react-dom';
import {
  X,
  Calendar as CalendarIcon,
  Clock,
  CheckCircle2,
  AlertCircle,
  AlertTriangle,
  Loader2,
  Sparkles,
  Phone,
  User,
  FileText,
  ChevronRight,
  ChevronLeft,
} from 'lucide-react';
import JalaliCalendar from '../../ui/JalaliCalendar';
import { ReasonChip, QUICK_REASONS } from '../../ui/AppointmentModal';
import { reservationService } from '../../../api/reservationService';
import useBodyScrollLock from '../../../hooks/useBodyScrollLock';
import { useUnavailableDates } from '../../../hooks/useUnavailableDates';
import { getApiErrorMessage } from '../../../utils/errorUtils';
import {
  formatDateForApi,
  formatJalaliDisplay,
  toPersianDigits,
} from '../../../utils/jalaliDateUtils';

const MAX_REASON_LENGTH = 300;

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

export default function AdminManualBookingModal({ isOpen, onClose, onCreated }) {
  // Lock background scroll when modal is open
  useBodyScrollLock(isOpen);
  const { isDateAvailable, fetchMonthDates, clearCache } = useUnavailableDates();

  const [mobileStep, setMobileStep] = useState(1); // 1 = Calendar/Date, 2 = Time & Patient Details
  const [selectedDate, setSelectedDate] = useState(null);
  const [availableSlots, setAvailableSlots] = useState([]);
  const [selectedTime, setSelectedTime] = useState(null);
  const [isLoadingSlots, setIsLoadingSlots] = useState(false);

  // Patient info states
  const [phoneNumber, setPhoneNumber] = useState('');
  const [fullName, setFullName] = useState('');
  const [reason, setReason] = useState('');

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState({});
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [bookedData, setBookedData] = useState(null);
  const [isPatientHighlighted, setIsPatientHighlighted] = useState(false);

  const patientSectionRef = useRef(null);
  const phoneInputRef = useRef(null);
  const fullNameInputRef = useRef(null);
  const reasonInputRef = useRef(null);
  const highlightTimeoutRef = useRef(null);

  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen && !isSubmitting) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, isSubmitting, onClose]);

  // Reset modal state on opening
  useEffect(() => {
    if (isOpen) {
      setMobileStep(1);
      setSelectedDate(null);
      setAvailableSlots([]);
      setSelectedTime(null);
      setIsLoadingSlots(false);
      setPhoneNumber('');
      setFullName('');
      setReason('');
      setIsSubmitting(false);
      setErrors({});
      setSubmitSuccess(false);
      setBookedData(null);
      setIsPatientHighlighted(false);
    } else {
      clearCache();
    }
    return () => {
      if (highlightTimeoutRef.current) {
        clearTimeout(highlightTimeoutRef.current);
      }
    };
  }, [isOpen, clearCache]);

  // Fetch available slots from backend
  const fetchSlots = useCallback(async (date) => {
    if (!date) return;

    setIsLoadingSlots(true);
    setErrors((prev) => ({ ...prev, date: '', time: '', submit: '' }));
    setSelectedTime(null);
    setAvailableSlots([]);

    try {
      const apiDate = formatDateForApi(date);
      const response = await reservationService.getAvailableSlots(apiDate);
      const slots = normalizeSlotsResponse(response);
      setAvailableSlots(slots);
    } catch (err) {
      console.error('Error fetching slots for admin booking:', err);
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
    // On mobile, advance smoothly to Step 2
    setMobileStep(2);
  };

  const handleSlotSelect = (time) => {
    setSelectedTime(time);
    setErrors((prev) => ({ ...prev, time: '' }));

    // 1. Smooth scroll to patient info & reason section
    patientSectionRef.current?.scrollIntoView({
      behavior: 'smooth',
      block: 'center',
    });

    // 2. Trigger soft pink glow / halo animation
    setIsPatientHighlighted(true);
    if (highlightTimeoutRef.current) {
      clearTimeout(highlightTimeoutRef.current);
    }
    highlightTimeoutRef.current = setTimeout(() => {
      setIsPatientHighlighted(false);
    }, 1500);

    // 3. Auto-focus appropriate input
    setTimeout(() => {
      if (!phoneNumber.trim()) {
        phoneInputRef.current?.focus();
      } else if (!fullName.trim()) {
        fullNameInputRef.current?.focus();
      } else {
        reasonInputRef.current?.focus();
      }
    }, 300);
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
      newErrors.date = 'لطفاً ابتدا روز مورد نظر را از تقویم انتخاب فرمایید.';
    }

    if (!selectedTime) {
      newErrors.time = 'لطفاً یکی از ساعت‌های کاری خالی را برای ویزیت انتخاب نمایید.';
    }

    const trimmedPhone = phoneNumber.trim();
    if (!trimmedPhone) {
      newErrors.phoneNumber = 'شماره تماس بیمار الزامی است.';
    } else if (!/^09\d{9}$/.test(trimmedPhone) && !/^\+989\d{9}$/.test(trimmedPhone)) {
      newErrors.phoneNumber = 'شماره موبایل نامعتبر است (مثال: 09123456789).';
    }

    const trimmedName = fullName.trim();
    if (!trimmedName) {
      newErrors.fullName = 'نام و نام خانوادگی بیمار الزامی است.';
    } else if (trimmedName.length < 3) {
      newErrors.fullName = 'نام و نام خانوادگی باید حداقل ۳ حرف باشد.';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    if (e) e.preventDefault();
    if (isSubmitting) return;

    const isValid = validateForm();
    if (!isValid) {
      if (!selectedTime) {
        setMobileStep(2);
      }
      return;
    }

    setIsSubmitting(true);
    setErrors((prev) => ({ ...prev, submit: '' }));

    try {
      const apiDate = formatDateForApi(selectedDate);
      const payload = {
        phone_number: phoneNumber.trim(),
        full_name: fullName.trim(),
        date: apiDate,
        time: selectedTime,
        reason: reason.trim(),
        force_create_user: true,
      };

      const created = await reservationService.createAdminReservation(payload);

      setBookedData({
        ...created,
        patientName: fullName.trim(),
        phoneNumber: phoneNumber.trim(),
        displayDate: formatJalaliDisplay(selectedDate, true),
        time: selectedTime,
        reason: reason.trim(),
      });

      setSubmitSuccess(true);
      if (onCreated) {
        onCreated(created);
      }
    } catch (err) {
      console.error('Error submitting admin reservation:', err);
      const errorMsg = getApiErrorMessage(
        err,
        'خطا در ثبت نوبت توسط ادمین. لطفاً دوباره تلاش فرمایید.'
      );
      const friendlyMsg =
        errorMsg === 'Selected time slot is not available.'
          ? 'زمان انتخابی دیگر در دسترس نیست یا پر شده است.'
          : errorMsg;

      setErrors((prev) => ({ ...prev, submit: friendlyMsg }));
    } finally {
      setIsSubmitting(false);
    }
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

  if (!isOpen) return null;

  return createPortal(
    <div
      role="dialog"
      aria-modal="true"
      aria-label="ثبت نوبت حضوری یا تلفنی بیمار"
      className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 animate-fadeSlide"
      onClick={(e) => {
        if (e.target === e.currentTarget && !isSubmitting) onClose();
      }}
    >
      <div
        className="w-full max-w-4xl max-h-[92dvh] rounded-[2.5rem] bg-white/95 backdrop-blur-2xl border border-primary/20 p-5 sm:p-8 flex flex-col shadow-[0_25px_60px_-15px_rgba(231,84,128,0.2)] overflow-y-auto chat-scroll relative"
        style={{ overscrollBehavior: 'contain' }}
      >
        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          disabled={isSubmitting}
          className="absolute top-5 left-5 sm:top-6 sm:left-6 w-10 h-10 rounded-2xl bg-white/90 hover:bg-white border border-primary/25 hover:border-primary text-textDark hover:text-primary shadow-sm hover:shadow-md transition-all duration-200 flex items-center justify-center z-20 cursor-pointer focus:outline-none focus:ring-2 focus:ring-primary/40 active:scale-95 disabled:opacity-50"
          aria-label="بستن پنجره"
          title="بستن"
        >
          <X size={20} strokeWidth={2.5} className="w-5 h-5 text-textDark hover:text-primary transition-colors" />
        </button>

        {/* Modal Header */}
        <div className="text-center mb-4 sm:mb-6">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-primary to-primary-dark text-white flex items-center justify-center mx-auto mb-3 shadow-lg shadow-primary/25">
            <CalendarIcon className="w-6 h-6" />
          </div>
          <h2 className="text-2xl md:text-3xl font-black text-transparent bg-clip-text bg-gradient-to-l from-primary to-primary-dark">
            ثبت دستی نوبت بیمار توسط ادمین
          </h2>
          <p className="text-xs md:text-sm text-textDark/75 font-medium mt-1">
            رزرو نوبت تلفنی یا حضوری کلینیک دکتر نگار معشوری
          </p>
        </div>

        {submitSuccess ? (
          /* Success Screen */
          <div className="bg-gradient-to-br from-emerald-500/10 via-emerald-500/5 to-primary/10 border-2 border-emerald-500/30 p-6 sm:p-8 rounded-3xl text-center flex flex-col items-center gap-4 my-auto shadow-lg animate-fadeSlide">
            <div className="w-16 h-16 rounded-2xl bg-emerald-500/20 text-emerald-600 flex items-center justify-center shadow-inner">
              <CheckCircle2 className="w-9 h-9" />
            </div>

            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-100 border border-emerald-300 text-emerald-900 text-xs font-black shadow-sm">
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
              وضعیت: ثبت قطعی در سامانه کلینیک
            </div>

            <h3 className="text-xl md:text-2xl font-black text-textDark">
              نوبت بیمار با موفقیت در سیستم ثبت گردید
            </h3>

            <p className="text-xs md:text-sm text-textDark/80 font-medium max-w-md leading-relaxed">
              اطلاعات نوبت در کارتابل رزروهای ادمین به‌روزرسانی شد.
            </p>

            {bookedData && (
              <div className="w-full max-w-sm bg-white/95 rounded-2xl border border-primary/20 p-4 text-xs flex flex-col gap-2.5 font-bold text-textDark shadow-sm">
                <div className="flex justify-between items-center border-b border-gray-100 pb-2">
                  <span className="text-textDark/60">نام بیمار:</span>
                  <span className="text-primary-dark font-black">{bookedData.patientName}</span>
                </div>
                <div className="flex justify-between items-center border-b border-gray-100 pb-2">
                  <span className="text-textDark/60">شماره تماس:</span>
                  <span className="font-mono text-gray-800" dir="ltr">{toPersianDigits(bookedData.phoneNumber)}</span>
                </div>
                <div className="flex justify-between items-center border-b border-gray-100 pb-2">
                  <span className="text-textDark/60">تاریخ ویزیت:</span>
                  <span className="text-primary-dark">{bookedData.displayDate}</span>
                </div>
                <div className="flex justify-between items-center border-b border-gray-100 pb-2">
                  <span className="text-textDark/60">ساعت ویزیت:</span>
                  <span className="text-primary font-black">ساعت {toPersianDigits(bookedData.time)}</span>
                </div>
                {bookedData.reason && (
                  <div className="flex justify-between items-start border-b border-gray-100 pb-2 gap-2 text-right">
                    <span className="text-textDark/60 shrink-0">علت مراجعه:</span>
                    <span className="text-textDark font-medium leading-relaxed max-w-[220px]">
                      {bookedData.reason}
                    </span>
                  </div>
                )}
                {bookedData.id && (
                  <div className="flex justify-between items-center">
                    <span className="text-textDark/60">شناسه نوبت:</span>
                    <span className="font-mono text-gray-800">#{bookedData.id}</span>
                  </div>
                )}
              </div>
            )}

            <div className="flex items-center gap-3 mt-2">
              <button
                type="button"
                onClick={onClose}
                className="px-8 py-2.5 rounded-2xl bg-primary hover:bg-primary-dark text-white font-bold text-sm shadow-md shadow-primary/25 hover:shadow-primary/40 hover:-translate-y-0.5 transition-all cursor-pointer"
              >
                بستن و بازگشت به لیست نوبت‌ها
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="flex flex-col gap-5">
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
                <span
                  className={`w-4 h-4 rounded-full text-[10px] flex items-center justify-center font-black ${
                    mobileStep === 1 ? 'bg-white text-primary' : 'bg-primary text-white'
                  }`}
                >
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
                <span
                  className={`w-4 h-4 rounded-full text-[10px] flex items-center justify-center font-black ${
                    mobileStep === 2 ? 'bg-white text-primary' : 'bg-gray-300 text-white'
                  }`}
                >
                  ۲
                </span>
                <span>۲. ساعت و مشخصات بیمار</span>
              </button>
            </div>

            {/* Two-Column Responsive Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
              {/* Column 1: Step 1 (Date Selection Calendar) */}
              <div
                className={`${
                  mobileStep === 1 ? 'flex' : 'hidden lg:flex'
                } flex-col bg-white border border-primary/15 rounded-3xl p-4 sm:p-6 shadow-xs animate-fadeSlide`}
              >
                <div className="w-full flex items-center justify-between border-b border-primary/10 pb-3 mb-4">
                  <span className="text-xs font-bold text-primary flex items-center gap-1.5">
                    <span className="w-5 h-5 rounded-full bg-primary text-white text-[10px] font-black flex items-center justify-center">
                      ۱
                    </span>
                    انتخاب روز مراجعه (تقویم شمسی)
                  </span>
                  <span className="text-[11px] text-textDark/60 font-medium">جمعه‌ها تعطیل است</span>
                </div>

                <div className="flex justify-center w-full">
                  <JalaliCalendar
                    selectedDate={selectedDate}
                    onSelect={handleDayClick}
                    isDateDisabled={isUnavailable}
                    isDateAvailable={isDateAvailable}
                    onMonthChange={fetchMonthDates}
                  />
                </div>

                {errors.date && (
                  <div className="mt-3 p-3 rounded-2xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 shrink-0 text-red-500" />
                    <span>{errors.date}</span>
                  </div>
                )}

                {/* Mobile Continue Bar */}
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

              {/* Column 2: Step 2 & 3 (Time Slots + Patient Details & Reason at the End) */}
              <div
                className={`${
                  mobileStep === 2 ? 'flex' : 'hidden lg:flex'
                } flex-col justify-between bg-white border border-primary/15 rounded-3xl p-5 sm:p-6 shadow-xs animate-fadeSlide min-h-[460px]`}
              >
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
                      <span className="w-5 h-5 rounded-full bg-primary text-white text-[10px] font-black flex items-center justify-center">
                        ۲
                      </span>
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
                    <div className="flex flex-col justify-center items-center h-32 gap-2">
                      <Loader2 className="w-8 h-8 text-primary animate-spin" />
                      <span className="text-xs text-textDark/60 font-medium">در حال دریافت زمان‌های خالی...</span>
                    </div>
                  )}

                  {!isLoadingSlots && availableSlots.length > 0 && (
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
                              disabled={!isAvailable || isSubmitting}
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

                  {!isLoadingSlots && selectedDate && availableSlots.length === 0 && (
                    <div className="flex flex-col items-center justify-center py-6 px-4 text-center bg-amber-500/5 rounded-2xl border border-amber-500/20 my-2">
                      <div className="w-9 h-9 rounded-xl bg-amber-500/10 text-amber-600 flex items-center justify-center mb-2">
                        <AlertTriangle className="w-5 h-5" />
                      </div>
                      <p className="text-xs md:text-sm font-bold text-textDark mb-1">
                        نوبت خالی برای این روز یافت نشد
                      </p>
                      <p className="text-[11px] md:text-xs text-textDark/65 max-w-xs leading-relaxed">
                        برای تاریخ انتخاب‌شده برنامه ویزیت تعریف نشده یا تمامی نوبت‌ها تکمیل شده است.
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
                    <div className="text-center text-textDark/55 py-6 text-xs md:text-sm font-medium leading-relaxed">
                      لطفاً ابتدا از تقویم سمت راست، روز کاری مورد نظر را انتخاب فرمایید.
                    </div>
                  )}

                  {/* Step 3: Patient Information & Reason (Positioned at the end) */}
                  {selectedDate && (
                    <div
                      ref={patientSectionRef}
                      className={`pt-4 border-t border-primary/15 flex flex-col gap-4 transition-all duration-300 rounded-2xl ${
                        isPatientHighlighted ? 'pink-halo-glow ring-2 ring-primary/40 p-3' : ''
                      }`}
                    >
                      {/* Selection Summary Pill */}
                      {selectedTime && (
                        <div className="p-3 rounded-2xl bg-gradient-to-r from-primary/10 via-primary/5 to-primary-dark/10 border border-primary/20 flex items-center justify-between text-xs font-bold text-textDark animate-fadeSlide">
                          <span className="flex items-center gap-1.5 text-primary-dark">
                            <Sparkles className="w-4 h-4 text-primary" />
                            زمان انتخابی ویزیت:
                          </span>
                          <span className="font-black text-primary">
                            ساعت {toPersianDigits(selectedTime)} — {formatJalaliDisplay(selectedDate, true)}
                          </span>
                        </div>
                      )}

                      <div className="border-b border-primary/10 pb-2">
                        <span className="text-xs font-bold text-primary flex items-center gap-1.5">
                          <span className="w-5 h-5 rounded-full bg-primary text-white text-[10px] font-black flex items-center justify-center">
                            ۳
                          </span>
                          مشخصات بیمار و علت مراجعه
                        </span>
                      </div>

                      {/* Phone Number Field */}
                      <div className="flex flex-col gap-1.5">
                        <label
                          htmlFor="patient-phone"
                          className="text-xs font-bold text-textDark flex items-center gap-1.5"
                        >
                          <Phone className="w-3.5 h-3.5 text-primary" />
                          <span>شماره تماس بیمار</span>
                          <span className="text-rose-500 font-black" title="الزامی">*</span>
                        </label>
                        <input
                          id="patient-phone"
                          ref={phoneInputRef}
                          type="tel"
                          dir="ltr"
                          placeholder="مثال: 09123456789"
                          value={phoneNumber}
                          onChange={(e) => {
                            setPhoneNumber(e.target.value);
                            if (errors.phoneNumber) setErrors((prev) => ({ ...prev, phoneNumber: '' }));
                          }}
                          className={`w-full p-2.5 text-xs md:text-sm border rounded-2xl bg-white focus:outline-none focus:ring-2 font-mono transition-all shadow-xs ${
                            errors.phoneNumber
                              ? 'border-rose-400 bg-rose-50/20 focus:ring-rose-200 focus:border-rose-500 text-textDark'
                              : 'border-primary/25 focus:border-primary focus:ring-primary/20 text-textDark'
                          }`}
                        />
                        {errors.phoneNumber && (
                          <span className="text-rose-600 text-[11px] font-bold flex items-center gap-1">
                            <AlertCircle className="w-3.5 h-3.5" />
                            {errors.phoneNumber}
                          </span>
                        )}
                        <span className="text-[11px] text-textDark/60">
                          در صورت عدم وجود کاربر در سامانه، حساب با این شماره خودکار ساخته می‌شود.
                        </span>
                      </div>

                      {/* Full Name Field */}
                      <div className="flex flex-col gap-1.5">
                        <label
                          htmlFor="patient-name"
                          className="text-xs font-bold text-textDark flex items-center gap-1.5"
                        >
                          <User className="w-3.5 h-3.5 text-primary" />
                          <span>نام و نام خانوادگی بیمار</span>
                          <span className="text-rose-500 font-black" title="الزامی">*</span>
                        </label>
                        <input
                          id="patient-name"
                          ref={fullNameInputRef}
                          type="text"
                          placeholder="مثال: سارا محمدی"
                          value={fullName}
                          onChange={(e) => {
                            setFullName(e.target.value);
                            if (errors.fullName) setErrors((prev) => ({ ...prev, fullName: '' }));
                          }}
                          className={`w-full p-2.5 text-xs md:text-sm border rounded-2xl bg-white focus:outline-none focus:ring-2 font-medium transition-all shadow-xs ${
                            errors.fullName
                              ? 'border-rose-400 bg-rose-50/20 focus:ring-rose-200 focus:border-rose-500 text-textDark'
                              : 'border-primary/25 focus:border-primary focus:ring-primary/20 text-textDark'
                          }`}
                        />
                        {errors.fullName && (
                          <span className="text-rose-600 text-[11px] font-bold flex items-center gap-1">
                            <AlertCircle className="w-3.5 h-3.5" />
                            {errors.fullName}
                          </span>
                        )}
                      </div>

                      {/* Reason Field with Quick Tags */}
                      <div className="flex flex-col gap-1.5">
                        <div className="flex items-center justify-between">
                          <label
                            htmlFor="patient-reason"
                            className="text-xs font-bold text-textDark flex items-center gap-1.5"
                          >
                            <FileText className="w-3.5 h-3.5 text-primary" />
                            <span>علت مراجعه و شرح حال</span>
                            <span className="text-textDark/45 text-[11px] font-normal">(اختیاری)</span>
                          </label>
                          <span
                            className={`text-[11px] font-mono font-bold ${
                              reason.length >= MAX_REASON_LENGTH ? 'text-rose-500' : 'text-textDark/55'
                            }`}
                          >
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
                          id="patient-reason"
                          ref={reasonInputRef}
                          rows={2}
                          maxLength={MAX_REASON_LENGTH}
                          value={reason}
                          onChange={(e) => setReason(e.target.value)}
                          placeholder="علائم، شرح حال مختصر، نتایج ماموگرافی یا توضیحات لازم..."
                          className="w-full p-2.5 text-xs md:text-sm border border-primary/25 focus:border-primary focus:ring-2 focus:ring-primary/20 rounded-2xl bg-white font-medium resize-none shadow-xs text-textDark placeholder:text-textDark/45"
                        />
                      </div>
                    </div>
                  )}
                </div>

                {/* Confirm and Cancel Action Bar */}
                <div className="mt-4 pt-3 border-t border-primary/10 flex flex-col gap-2">
                  {errors.submit && (
                    <p className="text-red-600 text-xs text-center flex items-center justify-center gap-1 bg-red-50 p-2.5 rounded-xl border border-red-200">
                      <AlertCircle className="w-4 h-4 shrink-0" />
                      <span>{errors.submit}</span>
                    </p>
                  )}

                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      onClick={onClose}
                      disabled={isSubmitting}
                      className="px-5 py-3 rounded-2xl text-xs font-bold text-textDark/70 hover:text-textDark bg-gray-100 hover:bg-gray-200 border border-gray-200 transition-colors cursor-pointer"
                    >
                      انصراف
                    </button>

                    <button
                      type="submit"
                      disabled={!selectedTime || !selectedDate || isSubmitting}
                      className={`flex-1 py-3.5 rounded-2xl text-white font-black text-xs md:text-sm transition-all duration-300 flex items-center justify-center gap-2 shadow-lg ${
                        selectedTime && selectedDate && !isSubmitting
                          ? 'bg-primary hover:bg-primary-dark shadow-primary/30 hover:shadow-primary/50 hover:-translate-y-0.5 cursor-pointer'
                          : 'bg-gray-300 text-gray-500 cursor-not-allowed opacity-60'
                      }`}
                    >
                      {isSubmitting ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          <span>در حال ثبت نوبت در سیستم...</span>
                        </>
                      ) : (
                        <>
                          <CheckCircle2 className="w-4 h-4" />
                          <span>تایید و ثبت نهایی نوبت</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </form>
        )}
      </div>
    </div>,
    document.body
  );
}
