// src/components/admin/reservations/ReservationsList.jsx

import { useState, useMemo, useEffect } from 'react';
import {
  Trash2, Search, ChevronLeft, ChevronRight,
  ChevronsLeft, ChevronsRight, Plus, ChevronDown, X
} from 'lucide-react';

// ── Mock Data ──────────────────────────────────────────────────────────────────
const mockReservations = [
  { id: 1,  phoneNumber: '+98 937 123 4567', fullName: 'Bob Sadeghi',    date: '2023-11-15', time: '14:30' },
  { id: 2,  phoneNumber: '+98 937 123 4567', fullName: 'Jason Mustaer',  date: '2023-11-15', time: '14:30' },
  { id: 3,  phoneNumber: '+98 937 123 4567', fullName: 'Justin Rissai',  date: '2023-11-16', time: '14:30' },
  { id: 4,  phoneNumber: '+98 937 123 4567', fullName: 'Nika Hiriem',    date: '2023-11-17', time: '14:30' },
  { id: 5,  phoneNumber: '+98 937 123 4567', fullName: 'Asran Surnighi', date: '2023-11-12', time: '14:30' },
  { id: 6,  phoneNumber: '+98 937 123 4567', fullName: 'Juliria Wamson', date: '2023-11-15', time: '14:00' },
  { id: 7,  phoneNumber: '+98 937 123 4567', fullName: 'John Sadeghi',   date: '2023-11-10', time: '14:30' },
  { id: 8,  phoneNumber: '+98 937 123 4567', fullName: 'John Uniann',    date: '2023-11-10', time: '14:30' },
  { id: 9,  phoneNumber: '+98 937 123 4567', fullName: 'Sara Ahmadi',    date: '2023-11-18', time: '09:00' },
  { id: 10, phoneNumber: '+98 937 123 4567', fullName: 'Ali Rezaei',     date: '2023-11-19', time: '11:30' },
  { id: 11, phoneNumber: '+98 937 123 4567', fullName: 'Mina Hosseini',  date: '2023-11-20', time: '10:00' },
  { id: 12, phoneNumber: '+98 937 123 4567', fullName: 'Reza Karimi',    date: '2023-11-21', time: '13:00' },
];

const ROW_OPTIONS    = [10, 25, 50, 100];
const TABLE_HEADERS  = ['Phone number', 'Full name', 'Date', 'Time', 'Action'];
const EMPTY_FORM     = { phoneNumber: '', fullName: '', date: '', time: '' };

// ── Component ──────────────────────────────────────────────────────────────────
export default function ReservationsList() {

  // ── State ──────────────────────────────────────────────────────────────────
  const [reservations, setReservations] = useState(mockReservations);
  const [searchQuery,  setSearchQuery]  = useState('');
  const [currentPage,  setCurrentPage]  = useState(1);
  const [rowsPerPage,  setRowsPerPage]  = useState(10);          // default: 10
  const [isModalOpen,  setIsModalOpen]  = useState(false);
  const [formData,     setFormData]     = useState(EMPTY_FORM);

  // ── Reset page on search or rows-per-page change ───────────────────────────
  useEffect(() => { setCurrentPage(1); }, [searchQuery, rowsPerPage]);

  // ── Filtered list (simulates API search param) ─────────────────────────────
  const filteredReservations = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return reservations;
    return reservations.filter(
      (r) =>
        r.fullName.toLowerCase().includes(q) ||
        r.phoneNumber.includes(q)
    );
  }, [reservations, searchQuery]);

  // ── Pagination ─────────────────────────────────────────────────────────────
  const totalPages = Math.max(1, Math.ceil(filteredReservations.length / rowsPerPage));

  // Snap back if current page exceeds new totalPages (e.g. after delete)
  useEffect(() => {
    if (currentPage > totalPages) setCurrentPage(totalPages);
  }, [totalPages, currentPage]);

  const startIndex            = (currentPage - 1) * rowsPerPage;
  const paginatedReservations = filteredReservations.slice(startIndex, startIndex + rowsPerPage);

  const showingFrom = filteredReservations.length === 0 ? 0 : startIndex + 1;
  const showingTo   = Math.min(startIndex + rowsPerPage, filteredReservations.length);

  // ── Page number list with ellipsis ────────────────────────────────────────
  const getPageNumbers = () => {
    if (totalPages <= 7) return Array.from({ length: totalPages }, (_, i) => i + 1);
    const pages = new Set([1, 2, 3, totalPages]);
    [currentPage - 1, currentPage, currentPage + 1].forEach((p) => pages.add(p));
    const sorted = [...pages].filter((p) => p >= 1 && p <= totalPages).sort((a, b) => a - b);
    const result = [];
    sorted.forEach((p, i) => {
      if (i > 0 && p - sorted[i - 1] > 1) result.push('...');
      result.push(p);
    });
    return result;
  };

  // ── Pagination handlers ────────────────────────────────────────────────────
  const goFirst    = () => setCurrentPage(1);
  const goLast     = () => setCurrentPage(totalPages);
  const goPrev     = () => setCurrentPage((p) => Math.max(p - 1, 1));
  const goNext     = () => setCurrentPage((p) => Math.min(p + 1, totalPages));
  const goBack10   = () => setCurrentPage((p) => Math.max(p - 10, 1));          // << jumps -10
  const goForward10 = () => setCurrentPage((p) => Math.min(p + 10, totalPages)); // >> jumps +10

  // ── Delete — simulates DELETE /reservations/:id ────────────────────────────
  const handleDelete = (id) => {
    if (!window.confirm('Delete this reservation?')) return;
    // TODO: await api.delete(`/reservations/${id}`)
    setReservations((prev) => prev.filter((r) => r.id !== id));
  };

  // ── Modal ──────────────────────────────────────────────────────────────────
  const openModal  = () => { setFormData(EMPTY_FORM); setIsModalOpen(true); };
  const closeModal = () => setIsModalOpen(false);

  const handleFormChange = (e) =>
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));

  // Simulates POST /reservations
  const handleAddSubmit = () => {
    const newReservation = {
      id: Math.floor(Math.random() * 900000) + 100000, // random 6-digit id
      phoneNumber: formData.phoneNumber,
      fullName:    formData.fullName,
      date:        formData.date,
      time:        formData.time,
    };
    // TODO: const created = await api.post('/reservations', newReservation)
    //       setReservations(prev => [created, ...prev])
    setReservations((prev) => [newReservation, ...prev]);
    setFormData(EMPTY_FORM);
    setIsModalOpen(false);
  };

  // ── Shared input style ─────────────────────────────────────────────────────
  const inputCls = `
    w-full px-3 py-2 text-sm border border-gray-200 rounded-lg
    focus:outline-none focus:ring-2 focus:ring-[#2D5A4C]
    placeholder:text-gray-400
  `;

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <>
      <div className="p-6 bg-white rounded-2xl shadow-sm min-h-[500px] flex flex-col gap-5">

        {/* ── Top Bar ───────────────────────────────────────────────────────── */}
        <div className="flex items-center justify-between gap-4">

          {/* Search — left */}
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

          {/* Add — right, dark green */}
          <button
            onClick={openModal}
            className="flex items-center gap-2 px-5 py-2 bg-[#2D5A4C] hover:bg-[#234840] text-white text-sm font-medium rounded-lg transition-colors whitespace-nowrap"
          >
            Add <Plus size={16} />
          </button>

        </div>

        {/* ── Table ─────────────────────────────────────────────────────────── */}
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
              {paginatedReservations.length > 0 ? (
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

        {/* ── Pagination Footer ──────────────────────────────────────────────── */}
        <div className="flex items-center justify-between text-sm mt-auto">

          {/* Controls — left */}
          <div className="flex items-center gap-1">

            {/* << jump back 10 */}
            <button onClick={goBack10} disabled={currentPage === 1}
              className="p-1.5 rounded-md border border-gray-200 hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              aria-label="Back 10 pages">
              <ChevronsLeft size={15} />
            </button>

            {/* < prev 1 */}
            <button onClick={goPrev} disabled={currentPage === 1}
              className="p-1.5 rounded-md border border-gray-200 hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              aria-label="Previous page">
              <ChevronLeft size={15} />
            </button>

            {/* Numbered pages */}
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

            {/* > next 1 */}
            <button onClick={goNext} disabled={currentPage === totalPages}
              className="p-1.5 rounded-md border border-gray-200 hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              aria-label="Next page">
              <ChevronRight size={15} />
            </button>

            {/* >> jump forward 10 */}
            <button onClick={goForward10} disabled={currentPage === totalPages}
              className="p-1.5 rounded-md border border-gray-200 hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              aria-label="Forward 10 pages">
              <ChevronsRight size={15} />
            </button>

          </div>

          {/* Rows-per-page dropdown — right */}
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

      {/* ── Add Reservation Modal ──────────────────────────────────────────────── */}
      {isModalOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
          onClick={(e) => { if (e.target === e.currentTarget) closeModal(); }}
        >
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6 flex flex-col gap-5">

            {/* Header */}
            <div className="flex items-center justify-between">
              <h2 className="text-base font-semibold text-gray-800">Add Reservation</h2>
              <button onClick={closeModal}
                className="p-1.5 rounded-md text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
                aria-label="Close modal">
                <X size={18} />
              </button>
            </div>

            {/* Fields */}
            <div className="flex flex-col gap-4">

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-medium text-gray-600" htmlFor="phoneNumber">Phone Number</label>
                <input id="phoneNumber" name="phoneNumber" type="text"
                  placeholder="+98 937 123 4567"
                  value={formData.phoneNumber}
                  onChange={handleFormChange}
                  className={inputCls} />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-medium text-gray-600" htmlFor="fullName">Full Name</label>
                <input id="fullName" name="fullName" type="text"
                  placeholder="e.g. John Doe"
                  value={formData.fullName}
                  onChange={handleFormChange}
                  className={inputCls} />
              </div>

              <div className="flex gap-4">
                <div className="flex flex-col gap-1.5 flex-1">
                  <label className="text-xs font-medium text-gray-600" htmlFor="date">Date</label>
                  <input id="date" name="date" type="date"
                    value={formData.date}
                    onChange={handleFormChange}
                    className={inputCls} />
                </div>
                <div className="flex flex-col gap-1.5 flex-1">
                  <label className="text-xs font-medium text-gray-600" htmlFor="time">Time</label>
                  <input id="time" name="time" type="time"
                    value={formData.time}
                    onChange={handleFormChange}
                    className={inputCls} />
                </div>
              </div>

            </div>

            {/* Actions */}
            <div className="flex items-center justify-end gap-3 pt-1">
              <button onClick={closeModal}
                className="px-4 py-2 text-sm font-medium text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                Cancel
              </button>
              <button onClick={handleAddSubmit}
                className="px-5 py-2 text-sm font-medium text-white bg-[#2D5A4C] hover:bg-[#234840] rounded-lg transition-colors">
                Add
              </button>
            </div>

          </div>
        </div>
      )}
    </>
  );
}
