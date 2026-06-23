import { useState, useMemo, useEffect } from 'react';
import {
  Trash2, Search, ChevronLeft, ChevronRight,
  ChevronsLeft, ChevronsRight, Plus, ChevronDown, X
} from 'lucide-react';
import { reservationService } from '../../../api/reservationService';

const ROW_OPTIONS = [10, 25, 50, 100];
const TABLE_HEADERS = ['Phone number', 'Full name', 'Date', 'Time', 'Action'];
const EMPTY_FORM = { phoneNumber: '', fullName: '', date: '', time: '' };

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

const normalizeReservation = (item) => ({
  id: item.id,
  phoneNumber:
    item.phone_number ||
    item.phoneNumber ||
    item.patient_phone_number ||
    item.user?.phone_number ||
    '-',
  fullName: getFullName(item),
  date: item.appointment_date || item.date || '',
  time: (item.appointment_time || item.time || '').slice(0, 5),
});

const getErrorMessage = (error, fallback) => {
  const data = error?.response?.data;
  if (!data) return fallback;

  // Handle common DRF error structures
  const extract = (val) => (Array.isArray(val) ? val[0] : val);

  return (
    extract(data.detail) ||
    extract(data.non_field_errors) ||
    extract(data.phone_number) ||
    extract(data.appointment_date) ||
    extract(data.appointment_time) ||
    fallback
  );
};


export default function ReservationsList() {
  const [reservations, setReservations] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState(EMPTY_FORM);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');

  useEffect(() => {
    let isMounted = true;

    const loadReservations = async () => {
      setIsLoading(true);
      setLoadError('');

      try {
        const data = await reservationService.getAdminReservations();

        if (!isMounted) return;
        setReservations(Array.isArray(data) ? data.map(normalizeReservation) : []);
      } catch (error) {
        if (!isMounted) return;
        setReservations([]);
        setLoadError(getErrorMessage(error, 'Failed to load reservations.'));
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    loadReservations();

    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, rowsPerPage]);

  const filteredReservations = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return reservations;

    return reservations.filter((r) =>
      r.fullName.toLowerCase().includes(q) ||
      r.phoneNumber.toLowerCase().includes(q)
    );
  }, [reservations, searchQuery]);

  const totalPages = Math.max(1, Math.ceil(filteredReservations.length / rowsPerPage));

  useEffect(() => {
    if (currentPage > totalPages) setCurrentPage(totalPages);
  }, [totalPages, currentPage]);

  const startIndex = (currentPage - 1) * rowsPerPage;
  const paginatedReservations = filteredReservations.slice(startIndex, startIndex + rowsPerPage);

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

  const goPrev = () => setCurrentPage((p) => Math.max(p - 1, 1));
  const goNext = () => setCurrentPage((p) => Math.min(p + 1, totalPages));
  const goBack10 = () => setCurrentPage((p) => Math.max(p - 10, 1));
  const goForward10 = () => setCurrentPage((p) => Math.min(p + 10, totalPages));

  const handleDelete = (id) => {
    if (!window.confirm('Delete this reservation?')) return;
    setReservations((prev) => prev.filter((r) => r.id !== id));
  };

  const openModal = () => {
    setFormData(EMPTY_FORM);
    setSubmitError('');
    setIsModalOpen(true);
  };

  const closeModal = () => {
    if (isSubmitting) return;
    setIsModalOpen(false);
    setSubmitError('');
  };

  const handleFormChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleAddSubmit = async (e, forceCreate = false) => {
    if (e) e.preventDefault();

    const phoneNumber = formData.phoneNumber.trim();
    const fullName = formData.fullName.trim();

    if (!phoneNumber || !fullName || !formData.date || !formData.time) {
      setSubmitError('All fields are required.');
      return;
    }

    setIsSubmitting(true);
    setSubmitError('');

    try {
      const payload = {
        phone_number: phoneNumber,
        full_name: fullName,
        appointment_date: formData.date,
        appointment_time: formData.time,
        force_create_user: forceCreate,
      };

      const created = await reservationService.createAdminReservation(payload);

      setReservations((prev) => [normalizeReservation(created), ...prev]);
      setFormData(EMPTY_FORM);
      setIsModalOpen(false);
    } catch (error) {
      const errorData = error?.response?.data;
      console.log('Error from server:', errorData);
      // Check if user_exists is false (could be a direct boolean or wrapped in an array)
      const userExistsVal = Array.isArray(errorData?.user_exists) 
        ? errorData.user_exists[0] 
        : errorData?.user_exists;

      const isUserMissing =
        userExistsVal === false ||
        errorData?.detail?.includes('No user exists') ||
        errorData?.detail?.[0]?.includes('No user exists');

      if (isUserMissing) {
        const confirmCreate = window.confirm(
          `User with phone ${phoneNumber} does not exist. Do you want to create a new user and proceed?`
        );

        if (confirmCreate) {
          return handleAddSubmit(null, true);
        }
      }

      setSubmitError(getErrorMessage(error, 'Failed to add reservation.'));
    } finally {
      setIsSubmitting(false);
    }
  };

  const inputCls = `
    w-full px-3 py-2 text-sm border border-gray-200 rounded-lg
    focus:outline-none focus:ring-2 focus:ring-[#2D5A4C]
    placeholder:text-gray-400
  `;

  return (
    <>
      <div className="p-6 bg-white rounded-2xl shadow-sm min-h-[500px] flex flex-col gap-5">
        <div className="flex items-center justify-between gap-4">
          <div className="relative w-full max-w-md">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-sm border border-gray-200 rounded-full focus:outline-none focus:ring-2 focus:ring-[#2D5A4C] placeholder:text-gray-400"
            />
          </div>

          <button
            onClick={openModal}
            className="flex items-center gap-2 px-5 py-2 bg-[#2D5A4C] hover:bg-[#234840] text-white text-sm font-medium rounded-lg transition-colors whitespace-nowrap"
          >
            Add <Plus size={16} />
          </button>
        </div>

        {loadError && (
          <div className="rounded-xl bg-red-50 border border-red-200 text-red-700 px-4 py-3 text-sm">
            {loadError}
          </div>
        )}

        <div className="overflow-x-auto rounded-xl border border-gray-100">
          <table className="w-full text-sm text-left">
            <thead>
              <tr className="border-b border-gray-100">
                {TABLE_HEADERS.map((h) => (
                  <th
                    key={h}
                    className={`px-5 py-3 text-sm font-semibold text-gray-700 ${h === 'Action' ? 'text-center' : ''}`}
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>

            <tbody>
              {isLoading ? (
                <tr>
                  <td colSpan={5} className="px-5 py-12 text-center text-gray-400">
                    Loading reservations...
                  </td>
                </tr>
              ) : paginatedReservations.length > 0 ? (
                paginatedReservations.map((r, idx) => (
                  <tr
                    key={r.id}
                    className={`border-b border-gray-100 transition-colors hover:bg-green-50/40 ${idx % 2 === 0 ? 'bg-white' : 'bg-gray-50/40'}`}
                  >
                    <td className="px-5 py-3 text-gray-700">{r.phoneNumber}</td>
                    <td className="px-5 py-3 font-medium text-gray-800">{r.fullName}</td>
                    <td className="px-5 py-3 text-gray-600">{r.date}</td>
                    <td className="px-5 py-3 text-gray-600">{r.time}</td>
                    <td className="px-5 py-3 text-center">
                      <button
                        onClick={() => handleDelete(r.id)}
                        className="inline-flex items-center justify-center p-1.5 rounded-md text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors"
                        title="Delete reservation"
                      >
                        <Trash2 size={16} />
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="px-5 py-12 text-center text-gray-400">
                    No reservations found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="flex items-center justify-between text-sm mt-auto">
          <div className="flex items-center gap-1">
            <button
              onClick={goBack10}
              disabled={currentPage === 1}
              className="p-1.5 rounded-md border border-gray-200 hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              aria-label="Back 10 pages"
            >
              <ChevronsLeft size={15} />
            </button>

            <button
              onClick={goPrev}
              disabled={currentPage === 1}
              className="p-1.5 rounded-md border border-gray-200 hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              aria-label="Previous page"
            >
              <ChevronLeft size={15} />
            </button>

            {getPageNumbers().map((item, i) =>
              item === '...' ? (
                <span key={`ellipsis-${i}`} className="px-1 text-gray-400 select-none">...</span>
              ) : (
                <button
                  key={item}
                  onClick={() => setCurrentPage(item)}
                  className={`w-8 h-8 rounded-md text-sm font-medium border transition-colors ${
                    item === currentPage
                      ? 'bg-[#2D5A4C] text-white border-[#2D5A4C]'
                      : 'border-gray-200 hover:bg-gray-100 text-gray-600'
                  }`}
                  aria-current={item === currentPage ? 'page' : undefined}
                >
                  {item}
                </button>
              )
            )}

            <button
              onClick={goNext}
              disabled={currentPage === totalPages}
              className="p-1.5 rounded-md border border-gray-200 hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              aria-label="Next page"
            >
              <ChevronRight size={15} />
            </button>

            <button
              onClick={goForward10}
              disabled={currentPage === totalPages}
              className="p-1.5 rounded-md border border-gray-200 hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              aria-label="Forward 10 pages"
            >
              <ChevronsRight size={15} />
            </button>
          </div>

          <div className="relative">
            <select
              value={rowsPerPage}
              onChange={(e) => setRowsPerPage(Number(e.target.value))}
              className="appearance-none pl-3 pr-8 py-2 text-sm border border-gray-200 rounded-lg bg-white text-gray-600 focus:outline-none focus:ring-2 focus:ring-[#2D5A4C] cursor-pointer"
            >
              {ROW_OPTIONS.map((n) => (
                <option key={n} value={n}>show {n} rows</option>
              ))}
            </select>
            <ChevronDown size={14} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
          </div>
        </div>
      </div>

      {isModalOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
          onClick={(e) => {
            if (e.target === e.currentTarget) closeModal();
          }}
        >
          <form
            onSubmit={handleAddSubmit}
            className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6 flex flex-col gap-5"
          >
            <div className="flex items-center justify-between">
              <h2 className="text-base font-semibold text-gray-800">Add Reservation</h2>
              <button
                type="button"
                onClick={closeModal}
                className="p-1.5 rounded-md text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
                aria-label="Close modal"
              >
                <X size={18} />
              </button>
            </div>

            <div className="flex flex-col gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-medium text-gray-600" htmlFor="phoneNumber">Phone Number</label>
                <input
                  id="phoneNumber"
                  name="phoneNumber"
                  type="text"
                  placeholder="+98 937 123 4567"
                  value={formData.phoneNumber}
                  onChange={handleFormChange}
                  className={inputCls}
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-medium text-gray-600" htmlFor="fullName">Full Name</label>
                <input
                  id="fullName"
                  name="fullName"
                  type="text"
                  placeholder="e.g. John Doe"
                  value={formData.fullName}
                  onChange={handleFormChange}
                  className={inputCls}
                />
              </div>

              <div className="flex gap-4">
                <div className="flex flex-col gap-1.5 flex-1">
                  <label className="text-xs font-medium text-gray-600" htmlFor="date">Date</label>
                  <input
                    id="date"
                    name="date"
                    type="date"
                    value={formData.date}
                    onChange={handleFormChange}
                    className={inputCls}
                  />
                </div>
                <div className="flex flex-col gap-1.5 flex-1">
                  <label className="text-xs font-medium text-gray-600" htmlFor="time">Time</label>
                  <input
                    id="time"
                    name="time"
                    type="time"
                    value={formData.time}
                    onChange={handleFormChange}
                    className={inputCls}
                  />
                </div>
              </div>
            </div>

            {submitError && (
              <div className="rounded-xl bg-red-50 border border-red-200 text-red-700 px-4 py-3 text-sm">
                {submitError}
              </div>
            )}

            <div className="flex items-center justify-end gap-3 pt-1">
              <button
                type="button"
                onClick={closeModal}
                disabled={isSubmitting}
                className="px-4 py-2 text-sm font-medium text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-50 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-5 py-2 text-sm font-medium text-white bg-[#2D5A4C] hover:bg-[#234840] rounded-lg disabled:opacity-70 disabled:cursor-not-allowed transition-colors"
              >
                {isSubmitting ? 'Adding...' : 'Add'}
              </button>
            </div>
          </form>
        </div>
      )}
    </>
  );
}
