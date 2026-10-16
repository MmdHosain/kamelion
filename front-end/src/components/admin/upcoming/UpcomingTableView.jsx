// src/components/admin/upcoming/UpcomingTableView.jsx
import React, { useState, useMemo } from 'react';
import {
  Clock,
  Eye,
  FileText,
  Phone,
  ArrowUpDown,
  User,
  Calendar,
} from 'lucide-react';
import { toPersianDigits } from '../../../utils/jalaliDateUtils';

const STATUS_CONFIG = {
  pending: {
    label: 'در انتظار تایید',
    badgeClass: 'bg-amber-50 text-amber-700 border-amber-200',
    dotClass: 'bg-amber-500 animate-pulse',
  },
  scheduled: {
    label: 'تایید شده',
    badgeClass: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    dotClass: 'bg-emerald-500',
  },
  cancelled_admin: {
    label: 'رد شده',
    badgeClass: 'bg-rose-50 text-rose-700 border-rose-200',
    dotClass: 'bg-rose-500',
  },
  cancelled_user: {
    label: 'لغو توسط بیمار',
    badgeClass: 'bg-gray-100 text-gray-600 border-gray-200',
    dotClass: 'bg-gray-400',
  },
  visited: {
    label: 'ویزیت شده',
    badgeClass: 'bg-purple-50 text-purple-700 border-purple-200',
    dotClass: 'bg-purple-500',
  },
};

export default function UpcomingTableView({
  appointments = [],
  onViewAppointment,
  onViewPatient,
}) {
  const [sortField, setSortField] = useState('date');
  const [sortAsc, setSortAsc] = useState(true);

  const handleToggleSort = (field) => {
    if (sortField === field) {
      setSortAsc(!sortAsc);
    } else {
      setSortField(field);
      setSortAsc(true);
    }
  };

  const sortedAppointments = useMemo(() => {
    const list = [...appointments];
    list.sort((a, b) => {
      let comp = 0;
      if (sortField === 'date') {
        if (a.rawDate !== b.rawDate) {
          comp = a.rawDate.localeCompare(b.rawDate);
        } else {
          comp = (a.time || '').localeCompare(b.time || '');
        }
      } else if (sortField === 'name') {
        comp = (a.fullName || '').localeCompare(b.fullName || '', 'fa');
      } else if (sortField === 'status') {
        comp = (a.status || '').localeCompare(b.status || '');
      }
      return sortAsc ? comp : -comp;
    });
    return list;
  }, [appointments, sortField, sortAsc]);

  if (appointments.length === 0) {
    return null;
  }

  return (
    <div className="bg-white/80 backdrop-blur-md rounded-2xl sm:rounded-3xl border border-primary/20 shadow-sm overflow-hidden">
      <div className="overflow-x-auto no-scrollbar">
        <table className="w-full text-right border-collapse">
          <thead>
            <tr className="bg-primary/5 border-b border-primary/15 text-[11px] sm:text-xs font-black text-textDark/80 select-none">
              <th className="py-2.5 sm:py-3.5 px-2.5 sm:px-4 text-center w-10 sm:w-12">#</th>
              <th className="py-2.5 sm:py-3.5 px-2.5 sm:px-4 cursor-pointer hover:text-primary transition-colors" onClick={() => handleToggleSort('date')}>
                <div className="flex items-center gap-1.5">
                  <Calendar size={13} className="text-primary" />
                  <span>تاریخ و ساعت</span>
                  <ArrowUpDown size={11} className="opacity-60" />
                </div>
              </th>
              <th className="py-2.5 sm:py-3.5 px-2.5 sm:px-4 cursor-pointer hover:text-primary transition-colors" onClick={() => handleToggleSort('name')}>
                <div className="flex items-center gap-1.5">
                  <User size={13} className="text-primary" />
                  <span>نام بیمار</span>
                  <ArrowUpDown size={11} className="opacity-60" />
                </div>
              </th>
              <th className="py-2.5 sm:py-3.5 px-2.5 sm:px-4">شماره تماس</th>
              <th className="py-2.5 sm:py-3.5 px-2.5 sm:px-4">کد ملی</th>
              <th className="py-2.5 sm:py-3.5 px-2.5 sm:px-4">علت مراجعه</th>
              <th className="py-2.5 sm:py-3.5 px-2.5 sm:px-4 cursor-pointer hover:text-primary transition-colors" onClick={() => handleToggleSort('status')}>
                <div className="flex items-center gap-1.5">
                  <span>وضعیت</span>
                  <ArrowUpDown size={11} className="opacity-60" />
                </div>
              </th>
              <th className="py-2.5 sm:py-3.5 px-2.5 sm:px-4 text-center">عملیات</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-primary/10 text-xs">
            {sortedAppointments.map((item, idx) => {
              const status = STATUS_CONFIG[item.status] || STATUS_CONFIG.scheduled;

              return (
                <tr
                  key={item.id}
                  className="hover:bg-primary/[0.03] transition-colors group"
                >
                  {/* Row index */}
                  <td className="py-3.5 px-4 text-center font-bold text-textDark/50">
                    {toPersianDigits(idx + 1)}
                  </td>

                  {/* Date & Time */}
                  <td className="py-3.5 px-4 whitespace-nowrap">
                    <div className="flex flex-col gap-0.5">
                      <span className="font-bold text-textDark">{item.displayDate}</span>
                      <span className="flex items-center gap-1 text-[11px] text-primary font-black">
                        <Clock size={11} />
                        <span dir="ltr">{toPersianDigits(item.time)}</span>
                      </span>
                    </div>
                  </td>

                  {/* Patient Name */}
                  <td className="py-3.5 px-4 whitespace-nowrap">
                    <span className="font-bold text-textDark text-sm group-hover:text-primary transition-colors">
                      {item.fullName}
                    </span>
                  </td>

                  {/* Phone */}
                  <td className="py-3.5 px-4 whitespace-nowrap">
                    <span className="flex items-center gap-1 text-textDark/80 font-semibold" dir="ltr">
                      <Phone size={12} className="text-primary/70 shrink-0" />
                      <span>{toPersianDigits(item.phoneNumber)}</span>
                    </span>
                  </td>

                  {/* National ID */}
                  <td className="py-3.5 px-4 whitespace-nowrap">
                    <span className="text-textDark/70 font-semibold" dir="ltr">
                      {item.nationalId ? toPersianDigits(item.nationalId) : '-'}
                    </span>
                  </td>

                  {/* Reason */}
                  <td className="py-3.5 px-4 max-w-xs">
                    <p className="line-clamp-1 text-textDark/70 font-medium text-[11px]" title={item.reason}>
                      {item.reason}
                    </p>
                  </td>

                  {/* Status Badge */}
                  <td className="py-3.5 px-4 whitespace-nowrap">
                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl font-bold border ${status.badgeClass}`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${status.dotClass}`} />
                      <span>{status.label}</span>
                    </span>
                  </td>

                  {/* Action Buttons */}
                  <td className="py-3.5 px-4 whitespace-nowrap text-center">
                    <div className="flex items-center justify-center gap-1.5">
                      <button
                        type="button"
                        onClick={() => onViewAppointment(item)}
                        title="مشاهده جزئیات نوبت"
                        className="p-1.5 rounded-xl bg-primary/10 hover:bg-primary text-primary hover:text-white transition-all cursor-pointer shadow-xs"
                      >
                        <Eye size={14} />
                      </button>
                      <button
                        type="button"
                        onClick={() => onViewPatient(item)}
                        title="پرونده بالینی بیمار"
                        className="p-1.5 rounded-xl bg-gray-100 hover:bg-gray-200 text-textDark/70 hover:text-textDark transition-all cursor-pointer shadow-xs"
                      >
                        <FileText size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
