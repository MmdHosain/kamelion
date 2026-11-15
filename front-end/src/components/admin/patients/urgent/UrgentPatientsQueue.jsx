import React, { useState } from 'react';
import {
  AlertTriangle,
  RotateCw,
  Loader2,
  ChevronLeft,
  ChevronRight,
  ShieldAlert,
} from 'lucide-react';
import { useUrgentPatients } from '../../../../hooks/useUrgentPatients';
import UrgentPatientCard from './UrgentPatientCard';
import UrgentEmptyState from './UrgentEmptyState';
import PatientDetailModal from '../PatientDetailModal';
import { toPersianDigits } from '../../../../utils/jalaliDateUtils';

const PAGE_SIZE_OPTIONS = [10, 20, 50];

export const UrgentPatientsQueue = () => {
  const {
    patients,
    count,
    page,
    setPage,
    pageSize,
    setPageSize,
    totalPages,
    isLoading,
    isRefreshing,
    error,
    refetch,
  } = useUrgentPatients(10);

  const [selectedPatient, setSelectedPatient] = useState(null);

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Top Header & Refresh Control */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-primary/15">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-base sm:text-lg md:text-xl font-black text-rose-700 flex items-center gap-2">
              <ShieldAlert className="w-5 h-5 sm:w-6 sm:h-6 text-rose-600" />
              صف بیماران با ارزیابی اورژانسی
            </h2>
            <span className="px-2.5 py-0.5 rounded-full bg-rose-600 text-white text-xs font-black">
              {toPersianDigits(count)} بیمار
            </span>
          </div>
          <p className="text-[11px] sm:text-xs text-textDark/70 font-medium mt-1">
            بیمارانی که آخرین سطح تریاژ آن‌ها «اورژانسی» بوده و کد ارجاع ۷ روزه آن‌ها دارای اعتبار است.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={refetch}
            disabled={isLoading || isRefreshing}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 sm:px-3.5 sm:py-2 rounded-xl bg-white border border-primary/20 text-primary hover:bg-primary/5 text-xs font-bold transition-all shadow-2xs cursor-pointer disabled:opacity-50"
            title="بروزرسانی لحظه‌ای لیست"
          >
            <RotateCw
              size={14}
              className={isLoading || isRefreshing ? 'animate-spin' : ''}
            />
            <span>{isRefreshing ? 'در حال بروزرسانی...' : 'بروزرسانی'}</span>
          </button>
        </div>
      </div>

      {/* Content Area */}
      {isLoading ? (
        <div className="bg-white/80 border border-primary/15 rounded-3xl p-12 flex flex-col items-center justify-center gap-3">
          <Loader2 className="w-8 h-8 text-rose-600 animate-spin" />
          <span className="text-xs sm:text-sm font-bold text-gray-700">
            در حال بارگذاری صف بیماران اورژانسی...
          </span>
        </div>
      ) : error ? (
        <div className="bg-rose-50 border border-rose-200 rounded-2xl p-4 sm:p-5 text-xs sm:text-sm text-rose-800 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2 font-bold">
            <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0" />
            <span>{error}</span>
          </div>
          <button
            type="button"
            onClick={refetch}
            className="px-3 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs transition-colors shrink-0 cursor-pointer"
          >
            تلاش مجدد
          </button>
        </div>
      ) : count === 0 ? (
        <UrgentEmptyState />
      ) : (
        <div className="space-y-4">
          {/* Patients Cards List */}
          <div className="grid grid-cols-1 gap-3.5 sm:gap-4">
            {patients.map((patient) => (
              <UrgentPatientCard
                key={patient.id}
                patient={patient}
                onViewDossier={(p) => setSelectedPatient(p)}
                onExpired={refetch}
              />
            ))}
          </div>

          {/* Pagination */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 px-4 py-3 bg-white/70 border border-primary/15 rounded-2xl">
            <div className="flex items-center gap-2 text-xs text-textDark/70 font-medium">
              <span>تعداد در صفحه:</span>
              <select
                value={pageSize}
                onChange={(e) => {
                  setPageSize(Number(e.target.value));
                  setPage(1);
                }}
                className="text-xs border border-primary/20 rounded-xl px-2 py-1 bg-white text-textDark font-bold focus:outline-none focus:border-primary cursor-pointer"
              >
                {PAGE_SIZE_OPTIONS.map((opt) => (
                  <option key={opt} value={opt}>
                    {toPersianDigits(opt)}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page <= 1}
                className="px-3 py-1.5 rounded-xl border border-primary/20 bg-white text-textDark text-xs font-bold hover:bg-primary hover:text-white disabled:opacity-40 disabled:hover:bg-white disabled:hover:text-textDark transition-all cursor-pointer flex items-center gap-1"
              >
                <ChevronRight size={14} />
                <span>قبلی</span>
              </button>
              <span className="text-xs font-bold text-primary px-2">
                صفحه {toPersianDigits(page)} از {toPersianDigits(totalPages)}
              </span>
              <button
                type="button"
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page >= totalPages}
                className="px-3 py-1.5 rounded-xl border border-primary/20 bg-white text-textDark text-xs font-bold hover:bg-primary hover:text-white disabled:opacity-40 disabled:hover:bg-white disabled:hover:text-textDark transition-all cursor-pointer flex items-center gap-1"
              >
                <span>بعدی</span>
                <ChevronLeft size={14} />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Patient Dossier Modal */}
      {selectedPatient && (
        <PatientDetailModal
          patient={selectedPatient}
          patientId={selectedPatient.id}
          phoneNumber={selectedPatient.phone_number}
          onClose={() => setSelectedPatient(null)}
        />
      )}
    </div>
  );
};

export default UrgentPatientsQueue;
