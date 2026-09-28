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
  Loader2,
  AlertCircle,
  CheckCircle2,
  Check,
  X,
  Eye,
} from 'lucide-react';
import { reservationService } from '../../../api/reservationService';
import { adminApi } from '../../../api/admin';
import { getApiErrorMessage } from '../../../utils/errorUtils';
import {
  formatJalaliDisplay,
  toPersianDigits,
} from '../../../utils/jalaliDateUtils';
import AppointmentDetailModal, { getStatusConfig } from './AppointmentDetailModal';
import PatientDetailModal from '../patients/PatientDetailModal';
import AdminManualBookingModal from './AdminManualBookingModal';

const ROW_OPTIONS = [10, 25, 50, 100];
const TABLE_HEADERS = [
  'شماره تماس',
  'نام و نام خانوادگی',
  'تاریخ نوبت (شمسی)',
  'ساعت نوبت',
  'علت مراجعه',
  'وضعیت',
  'عملیات',
];

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
    label: 'رد شده (کلینیک)',
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
    userId: item.user_id || item.userId || item.user?.id || null,
    nationalId: item.national_id || item.nationalId || item.user?.national_id || null,
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
    createdAt: item.created_at || null,
  };
};


export default function ReservationsList() {
  const [reservations, setReservations] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStatusTab, setSelectedStatusTab] = useState('all');
  const [actionLoadingId, setActionLoadingId] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState('');

  // Active appointment detail modal state
  const [activeAppointment, setActiveAppointment] = useState(null);
  // Active patient dossier modal state
  const [activePatient, setActivePatient] = useState(null);

  // Add Modal State
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  const handleOpenAppointmentDetail = (appointment) => {
    setActiveAppointment(appointment);
  };

  const handleViewPatientFromAppointment = (appointment) => {
    setActiveAppointment(null);
    setActivePatient({
      id: appointment.userId,
      fullName: appointment.fullName,
      phoneNumber: appointment.phoneNumber,
      nationalId: appointment.nationalId,
      originAppointment: appointment,
    });
  };

  const handleBackToAppointment = () => {
    if (activePatient?.originAppointment) {
      const origin = activePatient.originAppointment;
      setActivePatient(null);
      setActiveAppointment(origin);
    }
  };

  const handleAppointmentStatusChange = (appointmentId, newStatus) => {
    setReservations((prev) =>
      prev.map((r) => (r.id === appointmentId ? { ...r, status: newStatus } : r))
    );
    setActiveAppointment((prev) =>
      prev && prev.id === appointmentId ? { ...prev, status: newStatus } : prev
    );
  };

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

  const handleAppointmentCreated = (created) => {
    setReservations((prev) => [normalizeReservation(created), ...prev]);
  };

  const handleApprove = async (id) => {
    setActionLoadingId(id);
    try {
      await reservationService.approveReservation(id);
      setReservations((prev) =>
        prev.map((r) => (r.id === id ? { ...r, status: 'scheduled' } : r))
      );
    } catch (error) {
      alert(getApiErrorMessage(error, 'خطا در تایید نوبت.'));
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleDisapprove = async (id) => {
    if (!window.confirm('آیا از رد این نوبت و آزادسازی ساعت اطمینان دارید؟')) return;
    setActionLoadingId(id);
    try {
      await reservationService.disapproveReservation(id);
      setReservations((prev) =>
        prev.map((r) => (r.id === id ? { ...r, status: 'cancelled_admin' } : r))
      );
    } catch (error) {
      alert(getApiErrorMessage(error, 'خطا در رد نوبت.'));
    } finally {
      setActionLoadingId(null);
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

  // Status counts for tabs
  const statusCounts = useMemo(() => {
    return {
      all: reservations.length,
      pending: reservations.filter((r) => r.status === 'pending').length,
      scheduled: reservations.filter((r) => r.status === 'scheduled').length,
      cancelled: reservations.filter(
        (r) => r.status === 'cancelled_admin' || r.status === 'cancelled_user'
      ).length,
    };
  }, [reservations]);

  // Search & Filter
  const filteredReservations = useMemo(() => {
    let list = reservations;
    if (selectedStatusTab === 'pending') {
      list = list.filter((r) => r.status === 'pending');
    } else if (selectedStatusTab === 'scheduled') {
      list = list.filter((r) => r.status === 'scheduled');
    } else if (selectedStatusTab === 'cancelled') {
      list = list.filter(
        (r) => r.status === 'cancelled_admin' || r.status === 'cancelled_user'
      );
    }

    const q = searchQuery.trim().toLowerCase();
    if (!q) return list;

    return list.filter(
      (r) =>
        (r.fullName || '').toLowerCase().includes(q) ||
        (r.phoneNumber || '').toLowerCase().includes(q) ||
        (r.displayDate || '').toLowerCase().includes(q)
    );
  }, [reservations, searchQuery, selectedStatusTab]);

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
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full pr-10 pl-4 py-2.5 text-sm border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-primary placeholder:text-gray-400 bg-gray-50/50 focus:bg-white transition-all"
            />
          </div>

          <button
            type="button"
            onClick={() => setIsAddModalOpen(true)}
            className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-2.5 bg-primary hover:bg-primary-dark text-white text-sm font-bold rounded-2xl shadow-md shadow-primary/25 hover:shadow-primary/40 hover:-translate-y-0.5 transition-all duration-200 cursor-pointer whitespace-nowrap"
          >
            <Plus size={18} />
            <span>ثبت نوبت دستی بیمار</span>
          </button>
        </div>

        {/* Status Filter Tabs */}
        <div className="flex flex-wrap items-center gap-2 border-b border-gray-100 pb-2">
          {[
            { key: 'all', label: 'همه نوبت‌ها', count: statusCounts.all },
            {
              key: 'pending',
              label: 'در انتظار تایید',
              count: statusCounts.pending,
              highlight: statusCounts.pending > 0,
            },
            { key: 'scheduled', label: 'تایید شده', count: statusCounts.scheduled },
            { key: 'cancelled', label: 'لغو / رد شده', count: statusCounts.cancelled },
          ].map((tab) => (
            <button
              key={tab.key}
              type="button"
              onClick={() => {
                setSelectedStatusTab(tab.key);
                setCurrentPage(1);
              }}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                selectedStatusTab === tab.key
                  ? 'bg-primary text-white shadow-sm'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              <span>{tab.label}</span>
              <span
                className={`px-1.5 py-0.5 rounded-lg text-[10px] font-black ${
                  selectedStatusTab === tab.key
                    ? 'bg-white/20 text-white'
                    : tab.highlight
                    ? 'bg-amber-100 text-amber-800'
                    : 'bg-white text-gray-500'
                }`}
              >
                {toPersianDigits(tab.count)}
              </span>
            </button>
          ))}
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
                  <td colSpan={7} className="px-5 py-16 text-center text-gray-400">
                    <div className="flex flex-col items-center justify-center gap-2">
                      <Loader2 className="w-7 h-7 text-primary animate-spin" />
                      <span className="text-xs font-medium">در حال بارگذاری نوبت‌ها...</span>
                    </div>
                  </td>
                </tr>
              ) : paginatedReservations.length > 0 ? (
                paginatedReservations.map((r, idx) => {
                  const statusConf = getStatusConfig(r.status);
                  const StatusIcon = statusConf.icon;

                  return (
                    <tr
                      key={r.id || idx}
                      onClick={() => handleOpenAppointmentDetail(r)}
                      className={`border-b border-gray-100 transition-colors hover:bg-primary/5 cursor-pointer ${
                        idx % 2 === 0 ? 'bg-white' : 'bg-gray-50/40'
                      }`}
                      title="جهت مشاهده جزئیات کامل نوبت کلیک نمایید"
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
                      <td className="px-5 py-3.5 text-gray-500 text-xs max-w-[180px] truncate" title="جهت مشاهده متن کامل کلیک نمایید">
                        {r.reason}
                      </td>
                      <td className="px-5 py-3.5">
                        <span
                          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-[11px] font-bold ${statusConf.bg} ${statusConf.text} ${statusConf.border} whitespace-nowrap`}
                        >
                          <span className={`w-1.5 h-1.5 rounded-full ${statusConf.dot}`} />
                          <StatusIcon size={12} />
                          <span>{statusConf.label}</span>
                        </span>
                      </td>
                      <td className="px-5 py-3.5 text-center">
                        <div className="flex items-center justify-center gap-1">
                          {actionLoadingId === r.id ? (
                            <div className="p-2">
                              <Loader2 size={16} className="text-primary animate-spin" />
                            </div>
                          ) : (
                            <>
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleOpenAppointmentDetail(r);
                                }}
                                className="inline-flex items-center justify-center p-2 rounded-xl text-primary hover:text-primary-dark hover:bg-primary/10 transition-colors cursor-pointer"
                                title="مشاهده جزئیات کامل نوبت و پرونده بیمار"
                                aria-label="مشاهده جزئیات کامل نوبت"
                              >
                                <Eye size={16} />
                              </button>

                              {r.status === 'pending' && (
                                <>
                                  <button
                                    type="button"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleApprove(r.id);
                                    }}
                                    className="inline-flex items-center justify-center p-2 rounded-xl text-emerald-600 hover:bg-emerald-50 transition-colors cursor-pointer"
                                    title="تایید نوبت"
                                    aria-label="تایید نوبت"
                                  >
                                    <Check size={16} strokeWidth={2.5} />
                                  </button>

                                  <button
                                    type="button"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleDisapprove(r.id);
                                    }}
                                    className="inline-flex items-center justify-center p-2 rounded-xl text-rose-500 hover:bg-rose-50 transition-colors cursor-pointer"
                                    title="رد نوبت و آزادسازی ساعت"
                                    aria-label="رد نوبت"
                                  >
                                    <X size={16} strokeWidth={2.5} />
                                  </button>
                                </>
                              )}

                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleDelete(r.id);
                                }}
                                className="inline-flex items-center justify-center p-2 rounded-xl text-gray-400 hover:text-red-600 hover:bg-red-50 transition-colors cursor-pointer"
                                title="حذف نوبت"
                                aria-label="حذف نوبت"
                              >
                                <Trash2 size={16} />
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={7} className="px-5 py-16 text-center text-gray-400">
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

      {/* Modern Admin Manual Booking Modal */}
      <AdminManualBookingModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onCreated={handleAppointmentCreated}
      />

      {/* Appointment Detail Modal */}
      {activeAppointment && (
        <AppointmentDetailModal
          appointment={activeAppointment}
          onClose={() => setActiveAppointment(null)}
          onViewPatient={handleViewPatientFromAppointment}
          onStatusChange={handleAppointmentStatusChange}
          onDelete={(id) => {
            setReservations((prev) => prev.filter((r) => r.id !== id));
            setActiveAppointment(null);
          }}
        />
      )}

      {/* Patient Dossier Modal */}
      {activePatient && (
        <PatientDetailModal
          patient={activePatient}
          patientId={activePatient.id}
          phoneNumber={activePatient.phoneNumber}
          onClose={() => setActivePatient(null)}
          onBackToAppointment={
            activePatient.originAppointment ? handleBackToAppointment : undefined
          }
        />
      )}
    </>
  );
}
