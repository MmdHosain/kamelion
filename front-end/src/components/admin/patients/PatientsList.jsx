// src/components/admin/patients/PatientsList.jsx

import { useState, useMemo } from 'react';
import { Search, AlignJustify } from 'lucide-react';
import PatientDetailModal from './PatientDetailModal';

// ── Mock Data ─────────────────────────────────────────────────────────────────

const mockPatients = [
  {
    id: '1',
    fullName: 'Mohammad Houseiny Poor',
    phoneNumber: '+98 937 433 4367',
    lastAppointment: '2026-08-23',
    notes: [
      { id: 1, text: 'Mohammad houseiny poor about a people n few ornuir in...', createdAt: '2024-05-20 10:30' },
      { id: 2, text: 'Chronic Condition: hypertension - follow-up in 2 weeks', createdAt: '2024-05-20 10:30' },
      { id: 3, text: 'Recommendation: Follow-up scheduled', createdAt: '2024-05-20 10:30' },
    ],
    aiProfile: {
      riskLevel:        'Moderate',
      chronicCondition: 'Hypertension',
      recommendation:   'Follow-up in 2 weeks',
      medAdherence:     'High',
      lifestyle:        'Active',
    },
    appointments: [
      { date: '2024-05-15', time: '09:00' },
      { date: '2024-04-10', time: '14:30' },
      { date: '2024-03-22', time: '11:15' },
      { date: '2024-04-15', time: '09:00' },
    ],
  },
  { id: '2',  fullName: 'Sara Ahmadi',       phoneNumber: '+98 912 345 6789', lastAppointment: '2026-07-15', notes: [], aiProfile: {}, appointments: [] },
  { id: '3',  fullName: 'Ali Rezaei',        phoneNumber: '+98 901 234 5678', lastAppointment: '2026-06-30', notes: [], aiProfile: {}, appointments: [] },
  { id: '4',  fullName: 'Fateme Karimi',     phoneNumber: '+98 935 678 9012', lastAppointment: '2026-05-18', notes: [], aiProfile: {}, appointments: [] },
  { id: '5',  fullName: 'Reza Mohammadi',    phoneNumber: '+98 911 222 3344', lastAppointment: '2026-04-10', notes: [], aiProfile: {}, appointments: [] },
  { id: '6',  fullName: 'Narges Hosseini',   phoneNumber: '+98 936 555 7788', lastAppointment: '2026-03-02', notes: [], aiProfile: {}, appointments: [] },
  { id: '7',  fullName: 'Dariush Sadeghi',   phoneNumber: '+98 919 876 5432', lastAppointment: '2026-02-20', notes: [], aiProfile: {}, appointments: [] },
  { id: '8',  fullName: 'Maryam Jafari',     phoneNumber: '+98 902 111 9900', lastAppointment: '2026-01-14', notes: [], aiProfile: {}, appointments: [] },
  { id: '9',  fullName: 'Kamran Tehrani',    phoneNumber: '+98 933 444 5566', lastAppointment: '2025-12-05', notes: [], aiProfile: {}, appointments: [] },
  { id: '10', fullName: 'Leila Mousavi',     phoneNumber: '+98 921 987 6543', lastAppointment: '2025-11-22', notes: [], aiProfile: {}, appointments: [] },
  { id: '11', fullName: 'Hossein Bagheri',   phoneNumber: '+98 938 321 0987', lastAppointment: '2025-10-18', notes: [], aiProfile: {}, appointments: [] },
  { id: '12', fullName: 'Zahra Nikpour',     phoneNumber: '+98 914 765 4321', lastAppointment: '2025-09-09', notes: [], aiProfile: {}, appointments: [] },
];

const ROWS_OPTIONS = [10, 20, 50];
const JUMP = 10;

const formatDate = (iso) => {
  if (!iso) return '—';
  return new Date(iso).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
};

function buildPageNumbers(current, total) {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);
  const pages = [];
  const addDots = () => { if (pages[pages.length - 1] !== '...') pages.push('...'); };
  pages.push(1);
  if (current > 3) addDots();
  for (let i = Math.max(2, current - 1); i <= Math.min(total - 1, current + 1); i++) pages.push(i);
  if (current < total - 2) addDots();
  pages.push(total);
  return pages;
}

// ── Component ─────────────────────────────────────────────────────────────────

export default function PatientsList() {
  const [patients]        = useState(mockPatients);
  const [searchQuery,     setSearchQuery]     = useState('');
  const [currentPage,     setCurrentPage]     = useState(1);
  const [itemsPerPage,    setItemsPerPage]    = useState(50);
  const [selectedPatient, setSelectedPatient] = useState(null);

  const filteredPatients = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return patients;
    return patients.filter(
      (p) => p.fullName.toLowerCase().includes(q) || p.phoneNumber.includes(q)
    );
  }, [patients, searchQuery]);

  const totalPages = Math.max(1, Math.ceil(filteredPatients.length / itemsPerPage));

  const displayedPatients = useMemo(() => {
    const offset = (currentPage - 1) * itemsPerPage;
    return filteredPatients.slice(offset, offset + itemsPerPage);
  }, [filteredPatients, currentPage, itemsPerPage]);

  const handleSearch = (val) => { setSearchQuery(val); setCurrentPage(1); };
  const handleItemsPerPage = (val) => { setItemsPerPage(Number(val)); setCurrentPage(1); };
  const goTo = (page) => setCurrentPage(Math.min(totalPages, Math.max(1, page)));

  return (
    <div className="p-6 min-h-screen bg-gray-50">

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <h1 className="text-2xl font-bold text-gray-700 tracking-tight">Patients</h1>
        <div className="relative w-full sm:w-72">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
          <input
            type="text"
            placeholder="Search by name or phone..."
            value={searchQuery}
            onChange={(e) => handleSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-sm border border-gray-200 rounded-lg bg-white text-gray-700 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-primary transition-colors"
          />
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50/60">
                {['Name', 'Phone number', 'Last appointment', 'Action'].map((h) => (
                  <th key={h} className="px-5 py-3.5 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide whitespace-nowrap">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {displayedPatients.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-5 py-12 text-center text-sm text-gray-400">No patients found.</td>
                </tr>
              ) : (
                displayedPatients.map((patient, idx) => (
                  <tr
                    key={patient.id}
                    className={`border-b border-gray-50 last:border-0 transition-colors hover:bg-primaryGhost ${idx % 2 === 0 ? 'bg-white' : 'bg-gray-50/50'}`}
                  >
                    <td className="px-5 py-3.5 font-medium text-gray-800 whitespace-nowrap">{patient.fullName}</td>
                    <td className="px-5 py-3.5 text-gray-600 whitespace-nowrap">{patient.phoneNumber}</td>
                    <td className="px-5 py-3.5 text-gray-600 whitespace-nowrap">{formatDate(patient.lastAppointment)}</td>
                    <td className="px-5 py-3.5">
                      <button
                        onClick={() => setSelectedPatient(patient)}
                        aria-label={`View details for ${patient.fullName}`}
                        className="w-8 h-8 flex items-center justify-center rounded-full bg-red-50 text-red-400 hover:bg-red-100 hover:text-red-500 transition-colors"
                      >
                        <AlignJustify size={14} strokeWidth={2} />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="flex items-center justify-between px-5 py-3.5 border-t border-gray-100 bg-gray-50/40">
          <div className="flex items-center gap-2">
            <span className="text-xs text-gray-500">Rows per page</span>
            <select
              value={itemsPerPage}
              onChange={(e) => handleItemsPerPage(e.target.value)}
              className="text-sm border border-gray-200 rounded-lg px-2 py-1 bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-primary cursor-pointer"
            >
              {ROWS_OPTIONS.map((n) => <option key={n} value={n}>{n}</option>)}
            </select>
          </div>

          <div className="flex items-center gap-1">
            <PageBtn onClick={() => goTo(currentPage - JUMP)} disabled={currentPage === 1} label="Jump back 10">«</PageBtn>
            <PageBtn onClick={() => goTo(currentPage - 1)}    disabled={currentPage === 1} label="Previous">‹</PageBtn>
            {buildPageNumbers(currentPage, totalPages).map((p, i) =>
              p === '...'
                ? <span key={`d${i}`} className="px-2 text-gray-400 text-sm select-none">…</span>
                : <PageBtn key={p} onClick={() => goTo(p)} active={p === currentPage} label={`Page ${p}`}>{p}</PageBtn>
            )}
            <PageBtn onClick={() => goTo(currentPage + 1)}    disabled={currentPage === totalPages} label="Next">›</PageBtn>
            <PageBtn onClick={() => goTo(currentPage + JUMP)} disabled={currentPage === totalPages} label="Jump forward 10">»</PageBtn>
          </div>
        </div>
      </div>

      {/* Modal */}
      {selectedPatient && (
        <PatientDetailModal
          patient={selectedPatient}
          onClose={() => setSelectedPatient(null)}
        />
      )}
    </div>
  );
}

function PageBtn({ children, onClick, disabled, active, label }) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      aria-label={label}
      aria-current={active ? 'page' : undefined}
      className={`min-w-[32px] h-8 px-2 rounded-lg text-sm font-medium transition-colors select-none ${
        active
          ? 'bg-primary text-white'
          : 'text-gray-600 hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed'
      }`}
    >
      {children}
    </button>
  );
}
