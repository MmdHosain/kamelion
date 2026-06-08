// src/components/ui/AppointmentModal.jsx

import { useState, useEffect, useCallback } from 'react';
import { DayPicker } from 'react-day-picker';
import 'react-day-picker/dist/style.css';
import { getAvailableSlots, bookSlot } from '../../api/reservationService';
import { useAuth } from '../../hooks/useAuth';

const formatDateForApi = (date) => {
  if (!date) return '';

  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');

  return `${year}-${month}-${day}`;
};

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
    return {
      time: slot.slice(0, 5),
      status: 'available',
    };
  }

  if (slot && typeof slot === 'object') {
    const rawTime =
      slot.time ||
      slot.start_time ||
      slot.startTime ||
      slot.value ||
      '';

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

  return rawSlots
    .map(normalizeSingleSlot)
    .filter((slot) => slot && slot.time);
};

const getApiErrorMessage = (err, fallback) => {
  const data = err?.response?.data;

  if (!data) return fallback;
  if (typeof data === 'string') return data;

  return (
    data.detail ||
    data.error ||
    data.message ||
    data.non_field_errors?.[0] ||
    data.date?.[0] ||
    data.time?.[0] ||
    fallback
  );
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

  useEffect(() => {
    if (open) {
      setSelectedDate(null);
      setAvailableSlots([]);
      setSelectedTime(null);
      setIsLoadingSlots(false);
      setIsBooking(false);
      setErrors({});
      setPendingBookingAfterAuth(false);
    }
  }, [open]);

  const fetchSlots = useCallback(async (date) => {
    if (!date) return;

    setIsLoadingSlots(true);
    setErrors({});
    setSelectedTime(null);

    try {
      const apiDate = formatDateForApi(date);
      const response = await getAvailableSlots(apiDate);
      const slots = normalizeSlotsResponse(response);

      setAvailableSlots(slots);

      if (slots.length === 0) {
        setErrors({
          date: 'هیچ زمانی در این روز موجود نیست',
        });
      }
    } catch (err) {
      console.error('[AppointmentModal] Error fetching slots:', err);

      setAvailableSlots([]);
      setErrors({
        date: getApiErrorMessage(
          err,
          'امکان دریافت زمان‌های موجود وجود ندارد'
        ),
      });
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
    setErrors({});

    try {
      const apiDate = formatDateForApi(selectedDate);

      await bookSlot(apiDate, selectedTime, '');

      alert(
        `نوبت شما برای ${selectedDate.toLocaleDateString('fa-IR', {
          weekday: 'short',
          day: 'numeric',
          month: 'short',
        })} ساعت ${selectedTime} ثبت شد`
      );

      await fetchSlots(selectedDate);

      setSelectedTime(null);
      onClose();
    } catch (err) {
      console.error('[AppointmentModal] Booking failed:', err);

      setErrors({
        booking: getApiErrorMessage(
          err,
          'ثبت نوبت با خطا مواجه شد'
        ),
      });
    } finally {
      setIsBooking(false);
    }
  }, [selectedDate, selectedTime, fetchSlots, onClose]);

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
  }, [
    open,
    isAuthenticated,
    pendingBookingAfterAuth,
    selectedDate,
    selectedTime,
    isBooking,
    doBookAppointment,
  ]);

  const handleBookAppointment = () => {
    if (!selectedDate || !selectedTime || isBooking) return;

    if (!isAuthenticated) {
      setPendingBookingAfterAuth(true);
      openAuthModal();
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
    return isPastDate(day) || isTooFarFuture(day);
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[9999] bg-black/40 backdrop-blur-sm flex items-center justify-center">
      <div className="bg-[#FAFAF8] w-full max-w-4xl rounded-3xl p-8 mx-4 max-h-[90vh] overflow-y-auto relative">
        <button
          type="button"
          onClick={onClose}
          disabled={isBooking}
          className="absolute top-4 left-4 text-gray-400 hover:text-black transition disabled:opacity-50 disabled:cursor-not-allowed"
          aria-label="Close appointment modal"
        >
          ✕
        </button>

        <h2 className="text-2xl font-bold text-[#2F5D50] mb-6 text-center">
          انتخاب تاریخ و زمان نوبت
        </h2>

        <div className="calendar-container flex flex-col lg:flex-row gap-6">
          <div className="flex-1">
            <div className="flex justify-center">
              <DayPicker
                mode="single"
                selected={selectedDate}
                onSelect={handleDayClick}
                disabled={isUnavailable}
                modifiers={{
                  unavailable: isUnavailable,
                }}
                modifiersClassNames={{
                  unavailable: 'text-gray-300 cursor-not-allowed line-through',
                }}
                className="rdp-custom"
                numberOfMonths={1}
              />
            </div>

            {errors.date && (
              <p className="text-red-500 text-sm text-center mt-4">
                {errors.date}
              </p>
            )}
          </div>

          <div
            className={`flex-1 p-6 rounded-2xl border-2 transition-all duration-300 ${
              isLoadingSlots
                ? 'border-gray-200 bg-gray-50'
                : availableSlots.length > 0
                  ? 'border-[#2F5D50]/20 bg-white'
                  : 'border-gray-100 bg-gray-50'
            }`}
          >
            <h3 className="text-lg font-semibold text-gray-700 mb-4">
              {selectedDate ? 'زمان‌های موجود' : 'یک تاریخ را انتخاب کنید'}
            </h3>

            {isLoadingSlots && (
              <div className="flex justify-center items-center h-40">
                <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-[#2F5D50]" />
              </div>
            )}

            {!isLoadingSlots && availableSlots.length > 0 && (
              <div className="grid grid-cols-2 gap-3">
                {availableSlots.map((slot, index) => {
                  const isAvailable = slot.status === 'available';
                  const isSelected = selectedTime === slot.time;

                  return (
                    <button
                      key={`${slot.time}-${index}`}
                      type="button"
                      onClick={() => {
                        if (isAvailable) {
                          setSelectedTime(slot.time);
                          setErrors((prev) => ({
                            ...prev,
                            booking: '',
                          }));
                        }
                      }}
                      disabled={!isAvailable || isBooking}
                      className={`py-3 px-4 rounded-xl border-2 transition-all duration-200 text-center font-medium ${
                        isAvailable
                          ? isSelected
                            ? 'bg-[#2F5D50] border-[#2F5D50] text-white shadow-lg scale-105'
                            : 'border-gray-200 text-gray-700 hover:border-[#2F5D50] hover:text-[#2F5D50] hover:scale-105'
                          : slot.status === 'pending'
                            ? 'bg-yellow-50 border-yellow-200 text-yellow-700 cursor-not-allowed opacity-60'
                            : 'bg-gray-50 border-gray-200 text-gray-400 cursor-not-allowed opacity-50'
                      }`}
                    >
                      <div className="text-base">{slot.time}</div>

                      {slot.status === 'pending' && (
                        <div className="text-xs mt-1">در انتظار</div>
                      )}

                      {slot.status === 'reserved' && (
                        <div className="text-xs mt-1">رزرو شده</div>
                      )}
                    </button>
                  );
                })}
              </div>
            )}

            {!isLoadingSlots && availableSlots.length === 0 && selectedDate && (
              <div className="text-center text-gray-500 py-10">
                <p className="text-lg">متاسفانه در تاریخ انتخاب شده</p>
                <p className="text-lg">زمان خالی موجود نیست</p>
              </div>
            )}

            {!selectedDate && (
              <div className="text-center text-gray-400 py-10">
                <p>لطفاً ابتدا یک تاریخ انتخاب کنید</p>
              </div>
            )}
          </div>
        </div>

        {errors.booking && (
          <p className="mt-4 text-red-500 text-sm text-center">
            {errors.booking}
          </p>
        )}

        <button
          type="button"
          onClick={handleBookAppointment}
          disabled={!selectedTime || !selectedDate || isBooking}
          className={`mt-8 w-full py-4 rounded-xl text-white font-bold text-lg transition-all duration-200 ${
            selectedTime && selectedDate && !isBooking
              ? 'bg-[#2F5D50] hover:bg-[#264a3f] hover:shadow-lg'
              : 'bg-gray-300 cursor-not-allowed'
          }`}
        >
          {isBooking ? 'در حال ثبت...' : 'ثبت نوبت'}
        </button>
      </div>

      <style>{`
        .rdp-custom {
          --rdp-cell-size: 50px;
          --rdp-accent-color: #2F5D50;
          --rdp-background-color: #2F5D50;
          font-family: inherit;
        }

        .rdp-custom .rdp-day_selected {
          background-color: #2F5D50 !important;
          color: white !important;
          font-weight: bold;
        }

        .rdp-custom .rdp-day_selected:hover {
          background-color: #264a3f !important;
        }

        .rdp-custom .rdp-day:hover:not(.rdp-day_disabled):not(.rdp-day_selected) {
          background-color: #2F5D50 !important;
          color: white !important;
        }

        .rdp-custom .rdp-day_today {
          font-weight: bold;
          color: #2F5D50;
        }

        .rdp-custom .rdp-button:hover:not([disabled]):not(.rdp-day_selected) {
          background-color: rgba(47, 93, 80, 0.1);
        }
      `}</style>
    </div>
  );
}
