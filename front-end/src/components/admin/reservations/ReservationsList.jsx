// src/components/admin/reservations/ReservationsList.jsx
import React, { useState, useMemo, useEffect, useCallback } from 'react';
import {
  Trash2,
  Search,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  Plus,
  ChevronDown,
  X,
  Calendar as CalendarIcon,
  Clock,
  User,
  Phone,
  FileText,
  Loader2,
  AlertCircle,
  AlertTriangle,
  CheckCircle2,
  Sparkles,
} from 'lucide-react';
import { reservationService } from '../../../api/reservationService';
import { adminApi } from '../../../api/admin';
import { getApiErrorMessage } from '../../../utils/errorUtils';
import JalaliCalendar from '../../ui/JalaliCalendar';
import {
  formatDateForApi,
  formatJalaliDisplay,
  toPersianDigits,
} from '../../../utils/jalaliDateUtils';

const ROW_OPTIONS = [10, 25, 50, 100];
const TABLE_HEADERS = [
  'شماره تماس',
  'نام و نام خانوادگی',
  'تاریخ نوبت (شمسی)',
  'ساعت نوبت',
  'علت مراجعه',
  'عملیات',
];

const getFullName = (item) => {
  if (item.full_name) return item.full_name;
  if (item.fullName) return item.fullName;
  if (item.user_full_name) return item.user_full_name;
  if (item.patient_full_name) return item.patient_full_name;
  if (item.user?.full_name) return item.user.full_name;
  if (item.user?.name) return item.user.name;

  const firstName = item.user?.first_name || '';
  const lastName = item.user?.last_name || '';
  const combined = `${firstName} ${lastName}`.trim();

  return combined || '-';
};

const normalizeReservation = (item) => {
  const rawDate = item.appointment_date || item.date || '';
  let dateObj = null;
  if (rawDate) {
    const parts = rawDate.split('-').map(Number);
    if (parts.length === 3) {
      dateObj = new Date(parts[0], parts[1] - 1, parts[2]);
    }
  }

  return {
    id: item.id,
    phoneNumber:
      item.phone_number ||
      item.phoneNumber ||
      item.patient_phone_number ||
      item.user?.phone_number ||
      '-',
    fullName: getFullName(item),
    rawDate,
    dateObj,
    displayDate: dateObj ? formatJalaliDisplay(dateObj, true) : rawDate || '-',
    time: (item.appointment_time || item.time || '').slice(0, 5),
    reason: item.reason || item.description || '-',
    status: item.status || 'scheduled',
  };
};

const normalizeSlots = (data) => {
  let rawSlots = [];
  if (Array.isArray(data)) rawSlots = data;
  else if (Array.isArray(data?.available_slots)) rawSlots = data.available_slots;
  else if (Array.isArray(data?.slots)) rawSlots = data.slots;
  else if (Array.isArray(data?.results)) rawSlots = data.results;

  return rawSlots
    .map((s) => {
      if (typeof s === 'string') return s.slice(0, 5);
      if (s?.time) return String(s.time).slice(0, 5);
      return null;
    })
    .filter(Boolean);
};

export default function ReservationsList() {
  const [reservations, setReservations] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState('');

  // Add Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalDate, setModalDate] = useState(null);
  const [modalTime, setModalTime] = useState(null);
  const [availableSlots, setAvailableSlots] = useState([]);
  const [isLoadingSlots, setIsLoadingSlots] = useState(false);
  const [slotsError, setSlotsError] = useState('');

  const [formData, setFormData] = useState({
    phoneNumber: '',
    fullName: '',
    reason: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const [submitSuccess, setSubmitSuccess] = useState(false);

  // Fetch reservations on mount
  const loadReservations = useCallback(async () => {
    setIsLoading(true);
    setLoadError('');

    try {
      const data = await reservationService.getAdminReservations();
      setReservations(Array.isArray(data) ? data.map(normalizeReservation) : []);
    } catch (error) {
      setReservations([]);
      setLoadError(getApiErrorMessage(error, 'خطا در دریافت لیست نوبت‌ها از سرور.'));
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadReservations();
  }, [loadReservations]);

  // Fetch slots whenever modalDate changes
  const fetchSlotsForDate = useCallback(async (date) => {
    if (!date) return;
    setIsLoadingSlots(true);
    setSlotsError('');
    setModalTime(null);
    setAvailableSlots([]);

    try {
      const apiDate = formatDateForApi(date);
      const res = await reservationService.getAvailableSlots(apiDate);
      const slots = normalizeSlots(res);
      setAvailableSlots(slots);
    } catch (err) {
      console.error('Error fetching admin slots:', err);
      setSlotsError('خطا در دریافت ساعت‌های آزاد برای تاریخ انتخابی.');
      setAvailableSlots([]);
    } finally {
      setIsLoadingSlots(false);
    }
  }, []);

  const handleDateSelect = (date) => {
    if (!date) return;
    setModalDate(date);
    fetchSlotsForDate(date);
  };

  const openAddModal = () => {
    setModalDate(null);
    setModalTime(null);
    setAvailableSlots([]);
    setSlotsError('');
    setFormData({ phoneNumber: '', fullName: '', reason: '' });
    setSubmitError('');
    setSubmitSuccess(false);
    setIsModalOpen(true);
  };

  const closeAddModal = () => {
    if (isSubmitting) return;
    setIsModalOpen(false);
  };

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleAddSubmit = async (e) => {
    if (e) e.preventDefault();

    const phoneNumber = formData.phoneNumber.trim();
    const fullName = formData.fullName.trim();

    if (!phoneNumber || !fullName) {
      setSubmitError('شماره تماس و نام و نام خانوادگی بیمار الزامی است.');
      return;
    }

    if (!modalDate || !modalTime) {
      setSubmitError('لطفاً تاریخ و یکی از ساعت‌های آزاد را انتخاب نمایید.');
      return;
    }

    setIsSubmitting(true);
    setSubmitError('');

    try {
      const payload = {
        phone_number: phoneNumber,
        full_name: fullName,
        date: formatDateForApi(modalDate),
        time: modalTime,
        reason: formData.reason.trim(),
      };

      const created = await reservationService.createAdminReservation(payload);

      setReservations((prev) => [normalizeReservation(created), ...prev]);
      setSubmitSuccess(true);

      setTimeout(() => {
        setIsModalOpen(false);
      }, 1500);
    } catch (error) {
      console.error('Admin reservation failed:', error);
      const msg = getApiErrorMessage(error, 'خطا در ثبت نوبت توسط ادمین.');
      setSubmitError(
        msg === 'Selected time slot is not available.'
          ? 'زمان انتخابی دیگر در دسترس نیست یا پر شده است.'
          : msg
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('آیا از حذف این نوبت اطمینان دارید؟')) return;

    try {
      await adminApi.deleteReservation(id);
      setReservations((prev) => prev.filter((r) => r.id !== id));
    } catch (error) {
      alert(getApiErrorMessage(error, 'خطا در حذف نوبت.'));
    }
  };

  // Search & Filter
  const filteredReservations = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return reservations;

    return reservations.filter(
      (r) =>
        r.fullName.toLowerCase().includes(q) ||
        r.phoneNumber.toLowerCase().includes(q) ||
        r.displayDate.toLowerCase().includes(q)
    );
  }, [reservations, searchQuery]);

  const totalPages = Math.max(1, Math.ceil(filteredReservations.length / rowsPerPage));

  useEffect(() => {
    if (currentPage > totalPages) setCurrentPage(totalPages);
  }, [totalPages, currentPage]);

  const startIndex = (currentPage - 1) * rowsPerPage;
  const paginatedReservations = filteredReservations.slice(
    startIndex,
    startIndex + rowsPerPage
  );

  const getPageNumbers = () => {
    if (totalPages <= 7) return Array.from({ length: totalPages }, (_, i) => i + 1);

    const pages = new Set([1, 2, 3, totalPages]);
    [currentPage - 1, currentPage, currentPage + 1].forEach((p) => pages.add(p));

    const sorted = [...pages]
      .filter((p) => p >= 1 && p <= totalPages)
      .sort((a, b) => a - b);

    const result = [];
    sorted.forEach((p, i) => {
      if (i > 0 && p - sorted[i - 1] > 1) result.push('...');
      result.push(p);
    });

    return result;
  };

  const isUnavailableDay = (day) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return day < today || day.getDay() === 5; // Friday closed
  };

  const inputCls = `
    w-full px-3.5 py-2.5 text-sm border border-gray-200 rounded-xl
    focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent
    placeholder:text-gray-400 bg-white transition-all
  `;

  return (
    <>
      <div className="p-6 bg-white rounded-3xl shadow-sm min-h-[520px] flex flex-col gap-5 border border-primary/10">
        
        {/* Top Actions: Search & Add */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="relative w-full max-w-md">
            <Search
              size={18}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400"
            />
            <input
              type="text"
              placeholder="جستجو بر اساس نام بیمار، شماره تماس یا تاریخ..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pr-10 pl-4 py-2.5 text-sm border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-primary placeholder:text-gray-400 bg-gray-50/50 focus:bg-white transition-all"
            />
          </div>

          <button
            type="button"
            onClick={openAddModal}
            className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-2.5 bg-primary hover:bg-primary-dark text-white text-sm font-bold rounded-2xl shadow-md shadow-primary/25 hover:shadow-primary/40 hover:-translate-y-0.5 transition-all duration-200 cursor-pointer whitespace-nowrap"
          >
            <Plus size={18} />
            <span>ثبت نوبت دستی بیمار</span>
          </button>
        </div>

        {loadError && (
          <div className="rounded-2xl bg-red-50 border border-red-200 text-red-700 px-4 py-3 text-xs md:text-sm font-bold flex items-center gap-2">
            <AlertCircle size={18} className="shrink-0" />
            <span>{loadError}</span>
          </div>
        )}

        {/* Table */}
        <div className="overflow-x-auto rounded-2xl border border-gray-100 shadow-sm">
          <table className="w-full text-sm text-right">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50/80">
                {TABLE_HEADERS.map((h, i) => (
                  <th
                    key={h}
                    className={`px-5 py-3.5 text-xs font-bold text-gray-600 ${
                      i === TABLE_HEADERS.length - 1 ? 'text-center' : ''
                    }`}
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>

            <tbody>
              {isLoading ? (
                <tr>
                  <td colSpan={6} className="px-5 py-16 text-center text-gray-400">
                    <div className="flex flex-col items-center justify-center gap-2">
                      <Loader2 className="w-7 h-7 text-primary animate-spin" />
                      <span className="text-xs font-medium">در حال بارگذاری نوبت‌ها...</span>
                    </div>
                  </td>
                </tr>
              ) : paginatedReservations.length > 0 ? (
                paginatedReservations.map((r, idx) => (
                  <tr
                    key={r.id || idx}
                    className={`border-b border-gray-100 transition-colors hover:bg-primary/5 ${
                      idx % 2 === 0 ? 'bg-white' : 'bg-gray-50/40'
                    }`}
                  >
                    <td className="px-5 py-3.5 text-gray-700 font-mono text-xs font-bold dir-ltr text-right">
                      {r.phoneNumber}
                    </td>
                    <td className="px-5 py-3.5 font-bold text-gray-900">{r.fullName}</td>
                    <td className="px-5 py-3.5 text-primary font-medium">{r.displayDate}</td>
                    <td className="px-5 py-3.5 text-gray-700 font-bold">
                      <span className="bg-primary/10 text-primary-dark px-2 py-0.5 rounded-lg text-xs">
                        ساعت {toPersianDigits(r.time)}
                      </span>
                    </td>
                    <td className="px-5 py-3.5 text-gray-500 text-xs max-w-[200px] truncate">
                      {r.reason}
                    </td>
                    <td className="px-5 py-3.5 text-center">
                      <button
                        onClick={() => handleDelete(r.id)}
                        className="inline-flex items-center justify-center p-2 rounded-xl text-gray-400 hover:text-red-600 hover:bg-red-50 transition-colors cursor-pointer"
                        title="حذف نوبت"
                        aria-label="حذف نوبت"
                      >
                        <Trash2 size={16} />
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="px-5 py-16 text-center text-gray-400">
                    نوبتی یافت نشد.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination & Rows Per Page */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 text-xs md:text-sm mt-auto pt-2">
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setCurrentPage((p) => Math.max(p - 10, 1))}
              disabled={currentPage === 1}
              className="p-1.5 rounded-xl border border-gray-200 hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
              title="۱۰ صفحه قبل"
            >
              <ChevronsRight size={16} />
            </button>

            <button
              onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
              disabled={currentPage === 1}
              className="p-1.5 rounded-xl border border-gray-200 hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
              title="صفحه قبل"
            >
              <ChevronRight size={16} />
            </button>

            {getPageNumbers().map((item, i) =>
              item === '...' ? (
                <span key={`ellipsis-${i}`} className="px-1 text-gray-400 select-none">
                  ...
                </span>
              ) : (
                <button
                  key={item}
                  onClick={() => setCurrentPage(item)}
                  className={`w-8 h-8 rounded-xl text-xs font-bold border transition-all ${
                    item === currentPage
                      ? 'bg-primary text-white border-primary shadow-sm'
                      : 'border-gray-200 hover:bg-gray-100 text-gray-600'
                  }`}
                >
                  {toPersianDigits(item)}
                </button>
              )
            )}

            <button
              onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
              disabled={currentPage === totalPages}
              className="p-1.5 rounded-xl border border-gray-200 hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
              title="صفحه بعد"
            >
              <ChevronLeft size={16} />
            </button>

            <button
              onClick={() => setCurrentPage((p) => Math.min(p + 10, totalPages))}
              disabled={currentPage === totalPages}
              className="p-1.5 rounded-xl border border-gray-200 hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
              title="۱۰ صفحه بعد"
            >
              <ChevronsLeft size={16} />
            </button>
          </div>

          <div className="flex items-center gap-2 text-gray-600 text-xs">
            <span>تعداد سطر در صفحه:</span>
            <div className="relative">
              <select
                value={rowsPerPage}
                onChange={(e) => setRowsPerPage(Number(e.target.value))}
                className="appearance-none pl-3 pr-7 py-1.5 text-xs border border-gray-200 rounded-xl bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-primary cursor-pointer font-bold"
              >
                {ROW_OPTIONS.map((n) => (
                  <option key={n} value={n}>
                    {toPersianDigits(n)}
                  </option>
                ))}
              </select>
              <ChevronDown
                size={14}
                className="absolute left-2 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Modern 2-Column Admin Booking Modal */}
      {isModalOpen && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-3 sm:p-6 animate-fadeSlide"
          onClick={(e) => {
            if (e.target === e.currentTarget) closeAddModal();
          }}
        >
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-4xl max-h-[92vh] overflow-y-auto p-6 md:p-8 flex flex-col gap-6 relative border border-primary/20 chat-scroll">
            
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-gray-100 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-primary/10 text-primary flex items-center justify-center font-bold">
                  <CalendarIcon size={20} />
                </div>
                <div>
                  <h2 className="text-lg font-black text-gray-900">
                    ثبت نوبت حضوری یا تلفنی توسط ادمین
                  </h2>
                  <p className="text-xs text-gray-500 font-medium">
                    انتخاب روز و ساعت کاری فعال و ثبت مشخصات بیمار در سیستم
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={closeAddModal}
                disabled={isSubmitting}
                className="p-2 rounded-xl text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors cursor-pointer"
                aria-label="بستن"
              >
                <X size={20} />
              </button>
            </div>

            {submitSuccess ? (
              <div className="bg-emerald-50 border border-emerald-200 p-8 rounded-3xl text-center flex flex-col items-center gap-3 my-8">
                <CheckCircle2 className="w-14 h-14 text-emerald-600 animate-bounce" />
                <h3 className="text-lg font-black text-emerald-900">
                  نوبت با موفقیت در سیستم ثبت گردید!
                </h3>
                <p className="text-xs text-emerald-700 font-medium">
                  مشخصات نوبت به جدول نوبت‌ها افزوده شد.
                </p>
              </div>
            ) : (
              <form onSubmit={handleAddSubmit} className="flex flex-col gap-6">
                
                {/* 2-Columns Layout: Date & Slots (Right) + Patient Info (Left) */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  
                  {/* Column 1: Shamsi Calendar & Slots */}
                  <div className="bg-gray-50/70 border border-primary/15 rounded-3xl p-5 flex flex-col gap-4">
                    <div className="flex items-center justify-between border-b border-primary/10 pb-2.5">
                      <span className="text-xs font-bold text-primary flex items-center gap-1.5">
                        <span className="w-5 h-5 rounded-full bg-primary text-white text-[10px] font-black flex items-center justify-center">
                          ۱
                        </span>
                        انتخاب روز و ساعت ویزیت
                      </span>
                      <span className="text-[11px] text-gray-400 font-medium">جمعه‌ها تعطیل</span>
                    </div>

                    <div className="flex justify-center">
                      <JalaliCalendar
                        selectedDate={modalDate}
                        onSelect={handleDateSelect}
                        isDateDisabled={isUnavailableDay}
                      />
                    </div>

                    {/* Slots Area */}
                    <div className="pt-2 border-t border-primary/10">
                      <div className="flex items-center justify-between mb-2.5">
                        <span className="text-xs font-bold text-gray-700 flex items-center gap-1">
                          <Clock size={14} className="text-primary" />
                          ساعت‌های خالی این روز:
                        </span>
                        {modalDate && (
                          <span className="text-[11px] font-bold text-primary bg-primary/10 px-2 py-0.5 rounded-lg">
                            {formatJalaliDisplay(modalDate, false)}
                          </span>
                        )}
                      </div>

                      {isLoadingSlots && (
                        <div className="flex items-center justify-center py-6 gap-2 text-xs text-gray-500">
                          <Loader2 size={16} className="text-primary animate-spin" />
                          <span>در حال دریافت ساعت‌های خالی...</span>
                        </div>
                      )}

                      {!isLoadingSlots && slotsError && (
                        <div className="p-2.5 bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl flex items-center gap-1.5">
                          <AlertCircle size={14} className="shrink-0" />
                          <span>{slotsError}</span>
                        </div>
                      )}

                      {!isLoadingSlots && !slotsError && availableSlots.length > 0 && (
                        <div className="grid grid-cols-3 gap-2 max-h-36 overflow-y-auto chat-scroll p-1">
                          {availableSlots.map((slot) => {
                            const isSelected = modalTime === slot;
                            return (
                              <button
                                key={slot}
                                type="button"
                                onClick={() => setModalTime(slot)}
                                className={`py-2 px-2 rounded-xl border text-center font-bold text-xs transition-all cursor-pointer ${
                                  isSelected
                                    ? 'bg-primary text-white border-primary shadow-sm font-black ring-2 ring-primary/30'
                                    : 'bg-white border-gray-200 text-gray-700 hover:border-primary hover:bg-primary/5'
                                }`}
                              >
                                {toPersianDigits(slot)}
                              </button>
                            );
                          })}
                        </div>
                      )}

                      {!isLoadingSlots && !slotsError && modalDate && availableSlots.length === 0 && (
                        <div className="text-center py-4 bg-amber-500/10 border border-amber-500/20 rounded-xl text-amber-800 text-xs font-medium">
                          نوبت خالی برای این تاریخ وجود ندارد یا شیفت پزشک تعریف نشده است.
                        </div>
                      )}

                      {!isLoadingSlots && !modalDate && (
                        <div className="text-center py-6 text-gray-400 text-xs">
                          ابتدا یک روز را از تقویم بالا انتخاب نمایید.
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Column 2: Patient Form */}
                  <div className="bg-white border border-gray-100 rounded-3xl p-5 flex flex-col justify-between shadow-sm">
                    <div className="flex flex-col gap-4">
                      <div className="border-b border-gray-100 pb-2.5">
                        <span className="text-xs font-bold text-primary flex items-center gap-1.5">
                          <span className="w-5 h-5 rounded-full bg-primary text-white text-[10px] font-black flex items-center justify-center">
                            ۲
                          </span>
                          مشخصات بیمار و کاربر
                        </span>
                      </div>

                      {/* Phone Number */}
                      <div className="flex flex-col gap-1.5">
                        <label className="text-xs font-bold text-gray-700 flex items-center gap-1">
                          <Phone size={14} className="text-primary" />
                          شماره تماس بیمار <span className="text-red-500">*</span>
                        </label>
                        <input
                          name="phoneNumber"
                          type="tel"
                          placeholder="مثال: 09123456789"
                          value={formData.phoneNumber}
                          onChange={handleFormChange}
                          className={inputCls}
                          dir="ltr"
                          required
                        />
                        <span className="text-[11px] text-gray-400">
                          در صورت عدم وجود کاربر، حساب جدید با این شماره به صورت خودکار ایجاد می‌شود.
                        </span>
                      </div>

                      {/* Full Name */}
                      <div className="flex flex-col gap-1.5">
                        <label className="text-xs font-bold text-gray-700 flex items-center gap-1">
                          <User size={14} className="text-primary" />
                          نام و نام خانوادگی بیمار / کاربر <span className="text-red-500">*</span>
                        </label>
                        <input
                          name="fullName"
                          type="text"
                          placeholder="مثال: سارا محمدی"
                          value={formData.fullName}
                          onChange={handleFormChange}
                          className={inputCls}
                          required
                        />
                      </div>

                      {/* Reason */}
                      <div className="flex flex-col gap-1.5">
                        <label className="text-xs font-bold text-gray-700 flex items-center gap-1">
                          <FileText size={14} className="text-primary" />
                          علت مراجعه / توضیحات <span className="text-gray-400 font-normal">(اختیاری)</span>
                        </label>
                        <textarea
                          name="reason"
                          rows={3}
                          placeholder="مثال: ویزیت ماموگرافی دوره‌ای، بررسی نتیجه سونوگرافی..."
                          value={formData.reason}
                          onChange={handleFormChange}
                          className={`${inputCls} resize-none`}
                        />
                      </div>
                    </div>

                    {/* Summary Info Box */}
                    {modalDate && modalTime && (
                      <div className="mt-4 p-3 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-between text-xs font-bold text-primary-dark">
                        <span className="flex items-center gap-1">
                          <Sparkles size={14} className="text-primary" />
                          زمان ثبت:
                        </span>
                        <span>
                          {formatJalaliDisplay(modalDate, false)} — ساعت {toPersianDigits(modalTime)}
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                {submitError && (
                  <div className="rounded-2xl bg-red-50 border border-red-200 text-red-700 px-4 py-3 text-xs font-bold flex items-center gap-2">
                    <AlertCircle size={16} className="shrink-0" />
                    <span>{submitError}</span>
                  </div>
                )}

                {/* Footer Buttons */}
                <div className="flex items-center justify-end gap-3 pt-2 border-t border-gray-100">
                  <button
                    type="button"
                    onClick={closeAddModal}
                    disabled={isSubmitting}
                    className="px-5 py-2.5 text-xs font-bold text-gray-600 border border-gray-200 rounded-2xl hover:bg-gray-50 disabled:opacity-50 transition-colors cursor-pointer"
                  >
                    انصراف
                  </button>

                  <button
                    type="submit"
                    disabled={isSubmitting || !modalDate || !modalTime}
                    className="px-7 py-2.5 text-xs font-bold text-white bg-primary hover:bg-primary-dark rounded-2xl shadow-md shadow-primary/25 disabled:opacity-50 disabled:cursor-not-allowed transition-all cursor-pointer flex items-center gap-2"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 size={16} className="animate-spin" />
                        <span>در حال ثبت نوبت...</span>
                      </>
                    ) : (
                      <>
                        <CheckCircle2 size={16} />
                        <span>تایید و ثبت نوبت</span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </>
  );
}
