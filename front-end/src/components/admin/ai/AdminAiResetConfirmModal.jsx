// src/components/admin/ai/AdminAiResetConfirmModal.jsx
import React, { useState } from 'react';
import {
  RotateCcw,
  Trash2,
  Stethoscope,
  Database,
  X,
  AlertTriangle,
  Sparkles,
} from 'lucide-react';

const RESET_MODES = [
  {
    id: 'hard',
    title: 'پاک‌سازی فیزیکی نشست جاری (Hard Wipe)',
    desc: 'نشست جاری و کلیه پیام‌های آن به طور کامل از دیتابیس حذف شده و شناسه نشست نو می‌گردد.',
    icon: Trash2,
    badge: 'پیشنهادی',
    color: 'border-red-500/40 bg-red-500/5 hover:border-red-500 text-red-600',
  },
  {
    id: 'soft',
    title: 'ریست نرم / نشست جدید (Soft Reset)',
    desc: 'یک شناسه نشست نو تولید می‌شود تا مکالمه از صفر آغاز شود؛ اما سوابق قبلی در دیتابیس حفظ می‌مانند.',
    icon: RotateCcw,
    badge: 'حفظ سوابق',
    color: 'border-blue-500/40 bg-blue-500/5 hover:border-blue-500 text-blue-600',
  },
  {
    id: 'triage',
    title: 'ریست تریاژ و کد ارجاع (Reset Triage Only)',
    desc: 'پیام‌های مکالمه حفظ می‌شوند، اما سطح تریاژ و کد اضطراری صفر می‌گردد تا تغییر رفتار مدل تست شود.',
    icon: Stethoscope,
    badge: 'حفظ پیام‌ها',
    color: 'border-amber-500/40 bg-amber-500/5 hover:border-amber-500 text-amber-600',
  },
  {
    id: 'global_test',
    title: 'پاک‌سازی سراسری کلیه داده‌های تستی (Global Wipe)',
    desc: 'تمامی نشست‌های تستی و پیام‌های ثبت‌شده توسط ادمین به صورت کامل از دیتابیس سرور حذف می‌گردند.',
    icon: Database,
    badge: 'تخلیه کامل',
    color: 'border-purple-500/40 bg-purple-500/5 hover:border-purple-500 text-purple-600',
  },
];

export const AdminAiResetConfirmModal = ({
  open,
  onClose,
  onConfirm,
  sessionId,
}) => {
  const [selectedMode, setSelectedMode] = useState('hard');

  if (!open) return null;

  const currentModeInfo = RESET_MODES.find((m) => m.id === selectedMode) || RESET_MODES[0];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
      <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-border/80 relative text-right">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 left-5 p-1.5 rounded-xl hover:bg-surface text-mutedText hover:text-textDark transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Title */}
        <div className="flex items-center gap-3 mb-4">
          <div className="w-11 h-11 rounded-2xl bg-red-500/10 text-red-600 flex items-center justify-center shrink-0">
            <AlertTriangle className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-base sm:text-lg font-black text-textDark">
              انتخاب نوع بازنشانی (ریست حافظه هوش مصنوعی)
            </h3>
            <p className="text-xs text-mutedText">
              حالت مورد نظر خود را جهت کنترل حافظه و داده‌های تستی انتخاب کنید:
            </p>
          </div>
        </div>

        {/* Current Session Display */}
        <div className="p-2.5 bg-surface rounded-xl border border-border/60 text-xs font-mono text-mutedText mb-4 break-all flex items-center justify-between">
          <span className="font-sans text-textDark font-medium">نشست فعال:</span>
          <span className="font-semibold text-primary">{sessionId}</span>
        </div>

        {/* Mode Selection Grid */}
        <div className="space-y-2.5 mb-6">
          {RESET_MODES.map((mode) => {
            const Icon = mode.icon;
            const isSelected = selectedMode === mode.id;

            return (
              <div
                key={mode.id}
                onClick={() => setSelectedMode(mode.id)}
                className={`p-3.5 rounded-2xl border cursor-pointer select-none transition-all flex items-start gap-3 ${
                  isSelected
                    ? `${mode.color} ring-2 ring-primary/20 shadow-xs`
                    : 'border-border/70 hover:border-border bg-white text-textDark/80'
                }`}
              >
                <div
                  className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                    isSelected ? 'bg-white shadow-xs' : 'bg-surface text-mutedText'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                </div>

                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-black text-textDark">
                      {mode.title}
                    </span>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-surface text-mutedText border border-border/60">
                      {mode.badge}
                    </span>
                  </div>
                  <p className="text-[11px] text-mutedText mt-1 leading-relaxed">
                    {mode.desc}
                  </p>
                </div>
              </div>
            );
          })}
        </div>

        {/* Actions */}
        <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-border/40">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2.5 rounded-xl border border-border text-xs font-bold text-mutedText hover:text-textDark hover:bg-surface transition-colors"
          >
            انصراف
          </button>
          <button
            type="button"
            onClick={() => {
              onConfirm(selectedMode);
              onClose();
            }}
            className="flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold transition-all shadow-md shadow-red-500/20 active:scale-95"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>اجرای عملیات ریست ({currentModeInfo.badge})</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default AdminAiResetConfirmModal;
