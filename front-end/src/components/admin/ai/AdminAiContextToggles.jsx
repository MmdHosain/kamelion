// src/components/admin/ai/AdminAiContextToggles.jsx
import React, { useState } from 'react';
import { Sliders, History, UserCheck, Stethoscope, UserCog, Check, X } from 'lucide-react';
import { toPersianDigits } from '../../../utils/jalaliDateUtils';

export const AdminAiContextToggles = ({
  includeHistory,
  setIncludeHistory,
  includePatient,
  setIncludePatient,
  includeTriage,
  setIncludeTriage,
  simulatedPatient,
  setSimulatedPatient,
  disabled,
}) => {
  const [showSimModal, setShowSimModal] = useState(false);
  const [simName, setSimName] = useState(simulatedPatient?.name || 'مریم');
  const [simAge, setSimAge] = useState(simulatedPatient?.age || 45);
  const [simSex, setSimSex] = useState(simulatedPatient?.sex || 'female');

  const handleApplySim = () => {
    setSimulatedPatient({
      name: simName.trim() || 'بیمار تستی',
      age: Number(simAge) || 40,
      sex: simSex,
    });
    setIncludePatient(true);
    setShowSimModal(false);
  };

  const handleClearSim = () => {
    setSimulatedPatient(null);
    setShowSimModal(false);
  };

  return (
    <div className="bg-white rounded-2xl border border-border/70 p-3.5 shadow-xs mb-4">
      <div className="flex flex-wrap items-center justify-between gap-3 text-xs">
        {/* Title */}
        <div className="flex items-center gap-1.5 text-mutedText font-bold">
          <Sliders className="w-3.5 h-3.5 text-primary" />
          <span>تنظیمات کانتکست ارسالی به هوش مصنوعی:</span>
        </div>

        {/* Toggle Pills */}
        <div className="flex flex-wrap items-center gap-2">
          {/* History Toggle */}
          <button
            type="button"
            disabled={disabled}
            onClick={() => setIncludeHistory(!includeHistory)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border font-medium transition-all ${
              includeHistory
                ? 'bg-primary/10 border-primary text-primary font-bold shadow-xs'
                : 'bg-surface border-border text-mutedText line-through opacity-70'
            }`}
            title="قطع یا وصل ارسال سابقه مکالمه به عنوان حافظه"
          >
            <History className="w-3.5 h-3.5" />
            <span>حافظه گفتگو: {includeHistory ? 'فعال' : 'قطع'}</span>
          </button>

          {/* Patient Info Toggle */}
          <button
            type="button"
            disabled={disabled}
            onClick={() => setIncludePatient(!includePatient)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border font-medium transition-all ${
              includePatient
                ? 'bg-emerald-500/10 border-emerald-500 text-emerald-700 font-bold shadow-xs'
                : 'bg-surface border-border text-mutedText line-through opacity-70'
            }`}
            title="قطع یا وصل ارسال سن، جنسیت و نام بیمار"
          >
            <UserCheck className="w-3.5 h-3.5" />
            <span>سوابق بیمار: {includePatient ? 'فعال' : 'قطع'}</span>
          </button>

          {/* Prior Triage Toggle */}
          <button
            type="button"
            disabled={disabled}
            onClick={() => setIncludeTriage(!includeTriage)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border font-medium transition-all ${
              includeTriage
                ? 'bg-amber-500/10 border-amber-500 text-amber-700 font-bold shadow-xs'
                : 'bg-surface border-border text-mutedText line-through opacity-70'
            }`}
            title="قطع یا وصل ارسال سطح تریاژ نوبت قبلی"
          >
            <Stethoscope className="w-3.5 h-3.5" />
            <span>تریاژ قبلی: {includeTriage ? 'فعال' : 'قطع'}</span>
          </button>

          {/* Patient Simulator Modal Trigger */}
          <button
            type="button"
            disabled={disabled}
            onClick={() => setShowSimModal(true)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border font-medium transition-all ${
              simulatedPatient
                ? 'bg-purple-500/10 border-purple-500 text-purple-700 font-bold'
                : 'bg-surface border-border text-mutedText hover:text-textDark hover:bg-white'
            }`}
            title="شبیه‌سازی مشخصات دلخواه برای بیمار تستی"
          >
            <UserCog className="w-3.5 h-3.5" />
            <span>
              {simulatedPatient
                ? `بیمار: ${simulatedPatient.name} (${toPersianDigits(simulatedPatient.age)} س)`
                : 'شبیه‌سازی بیمار'}
            </span>
          </button>
        </div>
      </div>

      {/* Patient Simulation Drawer / Modal */}
      {showSimModal && (
        <div className="mt-3.5 pt-3.5 border-t border-border/50 animate-fade-in text-xs space-y-3">
          <div className="flex items-center justify-between font-bold text-textDark">
            <span>شبیه‌سازی مشخصات بیمار فرضی جهت تست تریاژ:</span>
            <button
              onClick={() => setShowSimModal(false)}
              className="text-mutedText hover:text-textDark p-1"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
            <div>
              <label className="text-[11px] text-mutedText block mb-1">نام فرضی:</label>
              <input
                type="text"
                value={simName}
                onChange={(e) => setSimName(e.target.value)}
                placeholder="مثال: مریم"
                className="w-full px-2.5 py-1.5 rounded-xl border border-border text-xs focus:outline-none focus:border-primary"
              />
            </div>
            <div>
              <label className="text-[11px] text-mutedText block mb-1">سن (سال):</label>
              <input
                type="number"
                min={1}
                max={120}
                value={simAge}
                onChange={(e) => setSimAge(e.target.value)}
                className="w-full px-2.5 py-1.5 rounded-xl border border-border text-xs focus:outline-none focus:border-primary"
              />
            </div>
            <div>
              <label className="text-[11px] text-mutedText block mb-1">جنسیت:</label>
              <select
                value={simSex}
                onChange={(e) => setSimSex(e.target.value)}
                className="w-full px-2.5 py-1.5 rounded-xl border border-border text-xs focus:outline-none focus:border-primary bg-white"
              >
                <option value="female">زن (Female)</option>
                <option value="male">مرد (Male)</option>
              </select>
            </div>
          </div>

          <div className="flex items-center justify-end gap-2 pt-1">
            {simulatedPatient && (
              <button
                type="button"
                onClick={handleClearSim}
                className="px-3 py-1.5 rounded-xl text-red-500 hover:bg-red-50 text-[11px] font-bold"
              >
                حذف شبیه‌ساز (استفاده از هویت ادمین)
              </button>
            )}
            <button
              type="button"
              onClick={handleApplySim}
              className="flex items-center gap-1 px-4 py-1.5 rounded-xl bg-primary text-white text-[11px] font-bold shadow-xs"
            >
              <Check className="w-3.5 h-3.5" />
              <span>اعمال بیمار فرضی</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminAiContextToggles;
