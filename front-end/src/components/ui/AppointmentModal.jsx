// src/components/ui/AppointmentModal.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { X, Calendar, Clock, CheckCircle2, AlertCircle, Loader2, Sparkles, AlertTriangle } from 'lucide-react';
import JalaliCalendar from './JalaliCalendar';
import { getAvailableSlots, bookSlot } from '../../api/reservationService';
import { useAuth } from '../../hooks/useAuth';
import { getApiErrorMessage } from '../../utils/errorUtils';
import { formatDateForApi, formatJalaliDisplay } from '../../utils/jalaliDateUtils';

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

export default function AppointmentModal({ open, onClose }) {
  const { isAuthenticated, openAuthModal } = useAuth();

  const [selectedDate, setSelectedDate] = useState(null);
  const [availableSlots, setAvailableSlots] = useState([]);
  const [selectedTime, setSelectedTime] = useState(null);
  const [isLoadingSlots, setIsLoadingSlots] = useState(false);
  const [isBooking, setIsBooking] = useState(false);
  const [errors, setErrors] = useState({});
  const [pendingBookingAfterAuth, setPendingBookingAfterAuth] = useState(false);
  const [bookingSuccess, setBookingSuccess] = useState(false);

  useEffect(() => {
    if (open) {
      setSelectedDate(null);
      setAvailableSlots([]);
      setSelectedTime(null);
      setIsLoadingSlots(false);
      setIsBooking(false);
      setErrors({});
      setPendingBookingAfterAuth(false);
      setBookingSuccess(false);
    }
  }, [open]);

  const fetchSlots = useCallback(async (date) => {
    if (!date) return;

    setIsLoadingSlots(true);
    setErrors((prev) => ({ ...prev, date: '', booking: '' }));
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
  };

  const doBookAppointment = useCallback(async () => {
    if (!selectedDate || !selectedTime) return;

    setIsBooking(true);
    setErrors((prev) => ({ ...prev, booking: '' }));

    try {
      const apiDate = formatDateForApi(selectedDate);
      await bookSlot(apiDate, selectedTime, '');
      setBookingSuccess(true);
      setTimeout(() => {
        onClose();
      }, 2500);
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
  }, [selectedDate, selectedTime, onClose]);

  useEffect(() => {
    if (
      open &&
      isAuthenticated &&
      pendingBookingAfterAuth &&
      selectedDate &&
      selectedTime &&
      !isBooking
    ) {
      setPendingBookingAfterAuth(false);
      doBookAppointment();
    }
  }, [open, isAuthenticated, pendingBookingAfterAuth, selectedDate, selectedTime, isBooking, doBookAppointment]);

  const handleBookAppointment = () => {
    if (!selectedDate || !selectedTime || isBooking) return;

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
    <div className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 animate-fadeSlide">
      <div className="w-full max-w-4xl max-h-[92vh] rounded-[2.5rem] bg-gradient-to-br from-bgLight/95 via-white/95 to-bgDark/95 backdrop-blur-2xl border border-primary/30 p-5 sm:p-8 flex flex-col shadow-2xl overflow-y-auto chat-scroll relative">
        
        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          disabled={isBooking}
          className="absolute top-5 left-5 text-textDark/60 hover:text-primary transition p-2 rounded-full hover:bg-white/80 z-10 cursor-pointer"
          aria-label="Close"
        >
          <X className="w-6 h-6" />
        </button>

        {/* Modal Header */}
        <div className="text-center mb-6">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-primary to-primary-dark text-white flex items-center justify-center mx-auto mb-3 shadow-lg shadow-primary/30">
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
          <div className="bg-emerald-500/15 border border-emerald-500/30 p-8 rounded-3xl text-center flex flex-col items-center gap-3 my-auto">
            <CheckCircle2 className="w-16 h-16 text-emerald-600 animate-bounce" />
            <h3 className="text-xl md:text-2xl font-black text-emerald-900">
              نوبت شما با موفقیت ثبت گردید!
            </h3>
            <p className="text-sm md:text-base text-emerald-800 font-medium max-w-md">
              جزئیات زمان ویزیت به همراه آدرس مطب از طریق پیامک برای شما ارسال خواهد شد.
            </p>
          </div>
        ) : (
          <div className="flex flex-col gap-6">
            
            {/* 2-Columns Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              
              {/* Column 1: Shamsi Date Picker */}
              <div className="bg-white/80 border border-primary/25 rounded-3xl p-4 sm:p-5 flex flex-col items-center shadow-sm">
                <div className="w-full flex items-center justify-between border-b border-primary/15 pb-3 mb-4">
                  <span className="text-xs font-bold text-primary flex items-center gap-1.5">
                    <span className="w-5 h-5 rounded-full bg-primary text-white text-[10px] font-black flex items-center justify-center">۱</span>
                    انتخاب روز مراجعه (تقویم شمسی)
                  </span>
                  <span className="text-[11px] text-textDark/50 font-medium">جمعه‌ها تعطیل است</span>
                </div>

                <JalaliCalendar
                  selectedDate={selectedDate}
                  onSelect={handleDayClick}
                  isDateDisabled={isUnavailable}
                />
              </div>

              {/* Column 2: Available Slots & Summary */}
              <div className="bg-white/80 border border-primary/25 rounded-3xl p-5 sm:p-6 flex flex-col justify-between shadow-sm">
                <div>
                  <div className="flex items-center justify-between border-b border-primary/15 pb-3 mb-4">
                    <span className="text-xs font-bold text-primary flex items-center gap-1.5">
                      <span className="w-5 h-5 rounded-full bg-primary text-white text-[10px] font-black flex items-center justify-center">۲</span>
                      ساعت‌های ویزیت
                    </span>
                    {selectedDate && (
                      <span className="text-xs font-bold text-primary-dark bg-primary/10 px-2.5 py-1 rounded-lg">
                        {formatJalaliDisplay(selectedDate, true)}
                      </span>
                    )}
                  </div>

                  {isLoadingSlots && (
                    <div className="flex flex-col justify-center items-center h-44 gap-2">
                      <Loader2 className="w-8 h-8 text-primary animate-spin" />
                      <span className="text-xs text-textDark/60 font-medium">در حال دریافت زمان‌های خالی...</span>
                    </div>
                  )}

                  {!isLoadingSlots && errors.date && (
                    <div className="p-4 rounded-2xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2 my-4">
                      <AlertCircle className="w-4 h-4 shrink-0 text-red-500" />
                      <span>{errors.date}</span>
                    </div>
                  )}

                  {!isLoadingSlots && !errors.date && availableSlots.length > 0 && (
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 max-h-52 overflow-y-auto chat-scroll p-1">
                      {availableSlots.map((slot, index) => {
                        const isAvailable = slot.status === 'available';
                        const isSelected = selectedTime === slot.time;

                        return (
                          <button
                            key={`${slot.time}-${index}`}
                            type="button"
                            onClick={() => setSelectedTime(slot.time)}
                            disabled={!isAvailable || isBooking}
                            className={`py-3 px-3 rounded-2xl border-2 text-center font-black text-sm transition-all duration-200 cursor-pointer ${
                              isSelected
                                ? 'bg-gradient-to-r from-primary to-primary-dark border-transparent text-white shadow-lg shadow-primary/35 scale-102 ring-2 ring-primary/30'
                                : isAvailable
                                ? 'bg-white border-primary/30 text-textDark hover:bg-primary/10 hover:border-primary'
                                : 'bg-gray-100/70 border-gray-200 text-gray-400 cursor-not-allowed opacity-50'
                            }`}
                          >
                            <div className="flex items-center justify-center gap-1">
                              <Clock className={`w-3.5 h-3.5 ${isSelected ? 'text-white' : 'text-primary'}`} />
                              <span>{slot.time}</span>
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  )}

                  {!isLoadingSlots && !errors.date && selectedDate && availableSlots.length === 0 && (
                    <div className="flex flex-col items-center justify-center py-8 px-4 text-center bg-amber-500/5 rounded-2xl border border-amber-500/20 my-2">
                      <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-600 flex items-center justify-center mb-2">
                        <AlertTriangle className="w-5 h-5" />
                      </div>
                      <p className="text-xs md:text-sm font-bold text-textDark mb-1">
                        نوبت خالی برای این روز یافت نشد
                      </p>
                      <p className="text-[11px] md:text-xs text-textDark/65 max-w-xs leading-relaxed">
                        برای تاریخ انتخاب‌شده برنامه ویزیت تعریف نشده یا تمامی نوبت‌ها تکمیل شده است. لطفاً روز کاری دیگری را انتخاب نمایید.
                      </p>
                    </div>
                  )}

                  {!isLoadingSlots && !selectedDate && (
                    <div className="text-center text-textDark/55 py-12 text-xs md:text-sm font-medium leading-relaxed">
                      لطفاً از تقویم سمت راست، یک روز کاری را انتخاب نمایید تا زمان‌های آزاد نمایش داده شوند.
                    </div>
                  )}
                </div>

                {/* Selection Info Footer */}
                {selectedDate && selectedTime && (
                  <div className="mt-4 p-3.5 rounded-2xl bg-gradient-to-r from-primary/15 to-primary-dark/15 border border-primary/25 flex items-center justify-between text-xs font-bold text-textDark">
                    <span className="flex items-center gap-1.5 text-primary-dark">
                      <Sparkles className="w-4 h-4 text-primary" />
                      زمان انتخابی شما:
                    </span>
                    <span className="font-black text-primary">
                      ساعت {selectedTime} — {formatJalaliDisplay(selectedDate, true)}
                    </span>
                  </div>
                )}

                {errors.booking && (
                  <p className="text-red-600 text-xs text-center flex items-center justify-center gap-1 mt-2 bg-red-50 p-2.5 rounded-xl border border-red-200">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    <span>{errors.booking}</span>
                  </p>
                )}
              </div>
            </div>

            {/* Confirm / Submit Button */}
            <button
              type="button"
              onClick={handleBookAppointment}
              disabled={!selectedTime || !selectedDate || isBooking}
              className={`w-full py-4 rounded-2xl text-white font-black text-base md:text-lg transition-all duration-300 flex items-center justify-center gap-2 shadow-xl ${
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
        )}
      </div>
    </div>
  );
}

