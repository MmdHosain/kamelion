// src/components/admin/patients/PatientsList.jsx
import React, { useState, useMemo } from 'react';
import { Search, Users, Eye, Phone, Calendar, ArrowUpDown, ChevronLeft, ChevronRight } from 'lucide-react';
import PatientDetailModal from './PatientDetailModal';

const mockPatients = [
  {
    id: '1',
    fullName: 'سارا معتمدی',
    phoneNumber: '0912 345 6789',
    lastAppointment: '2026-08-23',
    notes: [
      { id: 1, text: 'بررسی سونوگرافی توده فیبروآدنوم سینه چپ', createdAt: '۱۴۰۳/۰۲/۲۰' },
      { id: 2, text: 'نیاز به پیگیری و چکاپ ۶ ماهه', createdAt: '۱۴۰۳/۰۲/۲۰' },
    ],
    aiProfile: {
      riskLevel: 'پایین',
      chronicCondition: 'فیبروکیستیک',
      recommendation: 'سونوگرافی دوره‌ای ۶ ماهه',
      medAdherence: 'عالی',
      lifestyle: 'فعال',
    },
    appointments: [
      { date: '۱۴۰۳/۰۲/۱۵', time: '۰۹:۰۰' },
      { date: '۱۴۰۲/۱۱/۱۰', time: '۱۴:۳۰' },
    ],
  },
  { id: '2', fullName: 'ترانه کمالی', phoneNumber: '0912 111 2233', lastAppointment: '2026-07-15', notes: [], aiProfile: {}, appointments: [] },
  { id: '3', fullName: 'مهناز رضایی', phoneNumber: '0901 234 5678', lastAppointment: '2026-06-30', notes: [], aiProfile: {}, appointments: [] },
  { id: '4', fullName: 'فاطمه کریمی', phoneNumber: '0935 678 9012', lastAppointment: '2026-05-18', notes: [], aiProfile: {}, appointments: [] },
  { id: '5', fullName: 'زهرا نیک‌پور', phoneNumber: '0914 765 4321', lastAppointment: '2026-04-10', notes: [], aiProfile: {}, appointments: [] },
  { id: '6', fullName: 'نرگس حسینی', phoneNumber: '0936 555 7788', lastAppointment: '2026-03-02', notes: [], aiProfile: {}, appointments: [] },
];

const ROWS_OPTIONS = [10, 20, 50];

const formatDate = (iso) => {
  if (!iso) return '—';
  try {
    return new Date(iso).toLocaleDateString('fa-IR', { day: 'numeric', month: 'short', year: 'numeric' });
  } catch {
    return iso;
  }
};

export default function PatientsList() {
  const [patients] = useState(mockPatients);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
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

  const handleSearch = (val) => {
    setSearchQuery(val);
    setCurrentPage(1);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-primary/15 pb-4">
        <div>
          <h1 className="text-xl md:text-2xl font-black text-primary flex items-center gap-2.5">
            <Users className="w-6 h-6" />
            لیست پرونده‌های بیماران
          </h1>
          <p className="text-xs md:text-sm text-textDark/70 font-medium mt-0.5">
            مشاهده سوابق ویزیت، پرونده تریاژ و شرح حال بالینی بیماران
          </p>
        </div>

        <div className="relative w-full sm:w-72">
          <input
            type="text"
            placeholder="جستجو با نام یا شماره تماس..."
            value={searchQuery}
            onChange={(e) => handleSearch(e.target.value)}
            className="w-full pl-4 pr-10 py-2.5 text-xs md:text-sm border border-primary/25 rounded-2xl bg-white/90 text-textDark placeholder:text-textDark/45 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all shadow-inner font-medium"
          />
          <Search size={16} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-primary pointer-events-none" />
        </div>
      </div>

      {/* Table */}
      <div className="bg-white/85 backdrop-blur-xl rounded-3xl border border-primary/20 shadow-sm overflow-hidden">
        <div className="overflow-x-auto chat-scroll">
          <table className="w-full text-right text-xs md:text-sm">
            <thead>
              <tr className="border-b border-primary/15 bg-primary/5 text-primary">
                <th className="px-5 py-4 font-black">نام و نام خانوادگی</th>
                <th className="px-5 py-4 font-black">شماره تماس</th>
                <th className="px-5 py-4 font-black">آخرین نوبت ویزیت</th>
                <th className="px-5 py-4 font-black text-center">مشاهده پرونده</th>
              </tr>
            </thead>
            <tbody>
              {displayedPatients.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-5 py-12 text-center text-textDark/50 font-medium">
                    بیماری با این مشخصات یافت نشد.
                  </td>
                </tr>
              ) : (
                displayedPatients.map((patient, idx) => (
                  <tr
                    key={patient.id}
                    className={`border-b border-primary/10 last:border-0 hover:bg-primary/5 transition-colors ${
                      idx % 2 === 0 ? 'bg-transparent' : 'bg-white/40'
                    }`}
                  >
                    <td className="px-5 py-4 font-bold text-textDark whitespace-nowrap">
                      {patient.fullName}
                    </td>
                    <td className="px-5 py-4 font-mono font-bold text-primary-dark whitespace-nowrap" dir="ltr">
                      {patient.phoneNumber}
                    </td>
                    <td className="px-5 py-4 text-textDark/75 font-medium whitespace-nowrap">
                      {formatDate(patient.lastAppointment)}
                    </td>
                    <td className="px-5 py-4 text-center">
                      <button
                        onClick={() => setSelectedPatient(patient)}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-primary/10 hover:bg-primary hover:text-white text-primary text-xs font-bold transition-all shadow-sm cursor-pointer"
                      >
                        <Eye size={14} />
                        <span>مشاهده</span>
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 px-5 py-3.5 border-t border-primary/15 bg-white/40">
          <div className="flex items-center gap-2 text-xs text-textDark/70 font-medium">
            <span>نمایش در هر صفحه:</span>
            <select
              value={itemsPerPage}
              onChange={(e) => setItemsPerPage(Number(e.target.value))}
              className="text-xs border border-primary/20 rounded-xl px-2 py-1 bg-white text-textDark focus:outline-none focus:border-primary cursor-pointer font-bold"
            >
              {ROWS_OPTIONS.map((n) => (
                <option key={n} value={n}>
                  {n}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="px-3 py-1.5 rounded-xl border border-primary/20 bg-white text-textDark text-xs font-bold hover:bg-primary hover:text-white disabled:opacity-40 disabled:hover:bg-white disabled:hover:text-textDark transition-all cursor-pointer flex items-center gap-1"
            >
              <ChevronRight size={14} />
              قبلی
            </button>
            <span className="text-xs font-bold text-primary px-2">
              صفحه {currentPage} از {totalPages}
            </span>
            <button
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="px-3 py-1.5 rounded-xl border border-primary/20 bg-white text-textDark text-xs font-bold hover:bg-primary hover:text-white disabled:opacity-40 disabled:hover:bg-white disabled:hover:text-textDark transition-all cursor-pointer flex items-center gap-1"
            >
              بعدی
              <ChevronLeft size={14} />
            </button>
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
