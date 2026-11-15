import React, { useState } from 'react';
import {
  Phone,
  Copy,
  Check,
  Eye,
  AlertCircle,
  Clock,
  Calendar,
  FileText,
} from 'lucide-react';
import UrgentExpiryBadge from './UrgentExpiryBadge';
import { toPersianDigits } from '../../../../utils/jalaliDateUtils';

const formatJalaliDateTime = (isoString) => {
  if (!isoString) return '—';
  try {
    const d = new Date(isoString);
    if (isNaN(d.getTime())) return toPersianDigits(isoString);
    return toPersianDigits(
      d.toLocaleDateString('fa-IR', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      })
    );
  } catch {
    return toPersianDigits(isoString);
  }
};

export const UrgentPatientCard = ({ patient, onViewDossier, onExpired }) => {
  const [copied, setCopied] = useState(false);

  const fullName = patient.full_name?.trim() || 'بیمار بدون نام';
  const phone = patient.phone_number || '—';
  const code = patient.emergency_code;

  const handleCopyCode = () => {
    if (!code) return;
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="bg-white border-2 border-rose-200/80 hover:border-rose-400/80 rounded-2xl sm:rounded-3xl p-4 sm:p-5 shadow-xs hover:shadow-md transition-all duration-200 flex flex-col gap-3.5">
      {/* Top Row: Name, Status Badge, Expiry */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 pb-3 border-b border-rose-100">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-rose-500/10 text-rose-600 font-black flex items-center justify-center text-sm shrink-0">
            <AlertCircle size={18} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm sm:text-base font-black text-gray-900">
                {fullName}
              </h3>
              <span className="px-2 py-0.5 rounded-lg bg-rose-600 text-white text-[10px] font-black tracking-wide">
                تریاژ اورژانسی
              </span>
            </div>
            <div className="text-[11px] text-gray-500 font-medium flex items-center gap-1 mt-0.5">
              <Calendar size={12} className="text-gray-400" />
              <span>ارزیابی: {formatJalaliDateTime(patient.assessed_at)}</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <UrgentExpiryBadge
            expiresAt={patient.emergency_code_expires_at}
            onExpired={onExpired}
          />
        </div>
      </div>

      {/* Code Box & Phone */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 bg-rose-50/40 p-3 rounded-2xl border border-rose-100 text-xs">
        {/* Emergency Code */}
        <div className="flex items-center justify-between bg-white px-3 py-2 rounded-xl border border-rose-200 shadow-2xs">
          <div className="flex flex-col">
            <span className="text-[10px] text-rose-600 font-bold">کد ارجاع اورژانسی</span>
            <span className="font-mono font-black text-rose-700 text-sm tracking-wider">
              {toPersianDigits(code)}
            </span>
          </div>
          <button
            type="button"
            onClick={handleCopyCode}
            className="p-1.5 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-600 transition-colors cursor-pointer"
            title="کپی کد ارجاع"
          >
            {copied ? <Check size={15} /> : <Copy size={15} />}
          </button>
        </div>

        {/* Phone Contact */}
        <div className="flex items-center justify-between bg-white px-3 py-2 rounded-xl border border-gray-200 shadow-2xs">
          <div className="flex flex-col">
            <span className="text-[10px] text-gray-500 font-bold">شماره تماس بیمار</span>
            <span className="font-mono font-bold text-gray-800 text-xs dir-ltr text-right">
              {toPersianDigits(phone)}
            </span>
          </div>
          <a
            href={`tel:${phone}`}
            className="p-1.5 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-600 transition-colors"
            title="تماس مستقیم با بیمار"
          >
            <Phone size={15} />
          </a>
        </div>
      </div>

      {/* Staff Clinical Summary */}
      {patient.triage_summary ? (
        <div className="flex flex-col gap-1 text-xs">
          <span className="text-[11px] font-bold text-gray-500 flex items-center gap-1">
            <FileText size={12} className="text-rose-500" />
            خلاصه بالینی ویژه کادر درمان:
          </span>
          <p className="p-2.5 bg-gray-50 rounded-xl border border-gray-200/80 text-gray-800 leading-relaxed font-medium select-text">
            {patient.triage_summary}
          </p>
        </div>
      ) : null}

      {/* Card Actions */}
      <div className="flex items-center justify-end gap-2 pt-2 border-t border-gray-100">
        <button
          type="button"
          onClick={() => onViewDossier(patient)}
          className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-primary hover:bg-primary-dark text-white text-xs font-bold transition-all shadow-sm cursor-pointer"
        >
          <Eye size={14} />
          <span>مشاهده پرونده و گفتگوها</span>
        </button>
      </div>
    </div>
  );
};

export default UrgentPatientCard;

