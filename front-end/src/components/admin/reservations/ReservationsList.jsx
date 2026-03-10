// src/components/admin/reservations/ReservationsList.jsx

import { useState } from 'react';
import { Trash2, CheckCircle2, Search, ChevronLeft, ChevronRight } from 'lucide-react';

const mockReservations = [
  { id: 1, phoneNumber: '+98 937 123 4567', fullName: 'Bob Sadeghi',   date: '2023-11-15', time: '14:30' },
  { id: 2, phoneNumber: '+98 937 123 4567', fullName: 'Jason Mustaer', date: '2023-11-15', time: '14:30' },
  { id: 3, phoneNumber: '+98 937 123 4567', fullName: 'Sara Ahmadi',   date: '2023-11-16', time: '10:00' },
  { id: 4, phoneNumber: '+98 937 123 4567', fullName: 'Ali Rezaei',    date: '2023-11-16', time: '11:30' },
  { id: 5, phoneNumber: '+98 937 123 4567', fullName: 'Mina Hosseini', date: '2023-11-17', time: '09:00' },
  { id: 6, phoneNumber: '+98 937 123 4567', fullName: 'Reza Karimi',   date: '2023-11-17', time: '13:00' },
  { id: 7, phoneNumber: '+98 937 123 4567', fullName: 'Neda Moradi',   date: '2023-11-18', time: '15:00' },
];

const ITEMS_PER_PAGE = 5;

// ── New column order: ACTION → TIME → DATE → FULL NAME → PHONE NUMBER
const TABLE_HEADERS = ['ACTION', 'TIME', 'DATE', 'FULL NAME', 'PHONE NUMBER'];

export default function ReservationsList() {
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);

  // ── Filtering ──────────────────────────────────────────────────────────────
  const filtered = mockReservations.filter((r) =>
    r.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    r.phoneNumber.includes(searchQuery)
  );

  // ── Pagination ─────────────────────────────────────────────────────────────
  const totalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const paginated  = filtered.slice(startIndex, startIndex + ITEMS_PER_PAGE);

  const handleSearch = (e) => {
    setSearchQuery(e.target.value);
    setCurrentPage(1);
  };

  const handleDelete = (id) => console.log('Delete reservation id:', id);
  const handleCheck  = (id) => console.log('Confirm reservation id:', id);

  return (
    <div className="p-6 bg-white rounded-2xl shadow-sm min-h-[500px] flex flex-col gap-5">

      {/* ── Top Bar ─────────────────────────────────────────────────────────── */}
      {/* Change 1: Add button LEFT, Search bar RIGHT */}
      <div className="flex items-center justify-between gap-4">

        {/* Add Button — left side */}
        <button
          className="
            flex items-center gap-1 px-4 py-2
            bg-blue-600 hover:bg-blue-700
            text-white text-sm font-medium
            rounded-lg transition-colors whitespace-nowrap
          "
        >
          + Add
        </button>

        {/* Search Bar — right side */}
        <div className="relative w-full max-w-sm">
          <Search
            size={16}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
          />
          <input
            type="text"
            placeholder="...Search by name or phone"
            value={searchQuery}
            onChange={handleSearch}
            className="
              w-full pl-9 pr-4 py-2 text-sm
              border border-gray-200 rounded-lg
              focus:outline-none focus:ring-2 focus:ring-blue-500
              placeholder:text-gray-400
            "
          />
        </div>
      </div>

      {/* ── Table ───────────────────────────────────────────────────────────── */}
      <div className="overflow-x-auto rounded-xl border border-gray-100">
        <table className="w-full text-sm text-left">

          {/* Change 2: New column order + muted uppercase headers */}
          <thead className="bg-gray-50">
            <tr>
              {TABLE_HEADERS.map((header) => (
                <th
                  key={header}
                  className="px-5 py-3 text-xs font-semibold uppercase tracking-wide text-gray-500"
                >
                  {header}
                </th>
              ))}
            </tr>
          </thead>

          {/* Body */}
          <tbody className="divide-y divide-gray-100">
            {paginated.length > 0 ? (
              paginated.map((reservation, index) => (
                <tr
                  key={reservation.id}
                  className={`
                    transition-colors hover:bg-blue-50
                    ${index % 2 === 0 ? 'bg-white' : 'bg-gray-50/50'}
                  `}
                >
                  {/* Change 2 & 3: ACTION column first — Trash (red) + CheckCircle2 (green) */}
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-3">

                      {/* Trash icon — red */}
                      <button
                        onClick={() => handleDelete(reservation.id)}
                        className="p-1.5 rounded-md text-red-500 hover:bg-red-100 transition-colors"
                        title="Delete"
                      >
                        <Trash2 size={15} />
                      </button>

                      {/* Check icon — green (replaces pencil/edit) */}
                      <button
                        onClick={() => handleCheck(reservation.id)}
                        className="p-1.5 rounded-md text-green-600 hover:bg-green-100 transition-colors"
                        title="Confirm"
                      >
                        <CheckCircle2 size={15} />
                      </button>

                    </div>
                  </td>

                  {/* TIME */}
                  <td className="px-5 py-3 text-gray-600">{reservation.time}</td>

                  {/* DATE */}
                  <td className="px-5 py-3 text-gray-600">{reservation.date}</td>

                  {/* FULL NAME */}
                  <td className="px-5 py-3 font-medium text-gray-800">{reservation.fullName}</td>

                  {/* Change 4: PHONE NUMBER — teal/green color */}
                  <td className="px-5 py-3 font-medium text-teal-700">{reservation.phoneNumber}</td>

                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={5} className="px-5 py-10 text-center text-gray-400">
                  No reservations found.
                </td>
              </tr>
            )}
          </tbody>

        </table>
      </div>

      {/* ── Pagination ───────────────────────────────────────────────────────── */}
      {/* Change 5: Page controls LEFT, result summary text RIGHT */}
      <div className="flex items-center justify-between text-sm text-gray-500 mt-auto">

        {/* Page Controls — left side */}
        <div className="flex items-center gap-1">

          {/* Previous arrow */}
          <button
            onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
            disabled={currentPage === 1}
            className="
              p-1.5 rounded-md border border-gray-200
              hover:bg-gray-100 disabled:opacity-40
              disabled:cursor-not-allowed transition-colors
            "
          >
            <ChevronLeft size={16} />
          </button>

          {/* Page number buttons */}
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
            <button
              key={page}
              onClick={() => setCurrentPage(page)}
              className={`
                w-8 h-8 rounded-md text-sm font-medium border transition-colors
                ${
                  page === currentPage
                    ? 'bg-blue-600 text-white border-blue-600'
                    : 'border-gray-200 hover:bg-gray-100 text-gray-600'
                }
              `}
            >
              {page}
            </button>
          ))}

          {/* Next arrow */}
          <button
            onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
            disabled={currentPage === totalPages || totalPages === 0}
            className="
              p-1.5 rounded-md border border-gray-200
              hover:bg-gray-100 disabled:opacity-40
              disabled:cursor-not-allowed transition-colors
            "
          >
            <ChevronRight size={16} />
          </button>

        </div>

        {/* Result summary text — right side */}
        <span className="text-gray-500 text-sm">
          Showing{' '}
          <span className="font-semibold text-gray-700">
            {filtered.length === 0
              ? '0'
              : `${startIndex + 1}–${Math.min(startIndex + ITEMS_PER_PAGE, filtered.length)}`}
          </span>{' '}
          of{' '}
          <span className="font-semibold text-gray-700">{filtered.length}</span>{' '}
          reservations
        </span>

      </div>

    </div>
  );
}
