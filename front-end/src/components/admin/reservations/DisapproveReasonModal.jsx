// src/components/admin/reservations/DisapproveReasonModal.jsx
import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { X, AlertTriangle, MessageSquare, Send, CheckCircle2 } from 'lucide-react';

const PRESET_REASONS = [
  'تداخل با برنامه جراحی اورژانسی پزشک در بیمارستان',
  'تعطیلی اضطراری و عدم حضور پزشک در این تاریخ',
  'نیاز به هماهنگی تلفنی مجدد جهت تعیین ساعت مناسب‌تر',
  'تکمیل ظرفیت پذیرش مراجعین در شیفت انتخابی',
];

const MAX_CHAR_COUNT = 500;

export const DisapproveReasonModal = ({
  isOpen,
  onClose,
  onConfirm,
  appointment,
  loading = false,
}) => {
  const [reason, setReason] = useState('');
  const [error, setError] = useState('');
  const textareaRef = useRef(null);

  useEffect(() => {
    if (isOpen) {
      setReason('');
      setError('');
      setTimeout(() => textareaRef.current?.focus(), 150);
    }
  }, [isOpen]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && !loading && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, loading, onClose]);

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    const trimmed = reason.trim();
    if (!trimmed) {
      setError('ثبت علت رد نوبت برای اطلاع به بیمار الزامی است.');
      return;
    }
    if (trimmed.length > MAX_CHAR_COUNT) {
      setError(`علت لغو نمی‌تواند بیش از ${MAX_CHAR_COUNT} کاراکتر باشد.`);
      return;
    }
    setError('');
    onConfirm(trimmed);
  };

  const handleSelectPreset = (presetText) => {
    setReason(presetText);
    setError('');
    if (textareaRef.current) {
      textareaRef.current.focus();
    }
  };

  return createPortal(
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="disapprove-modal-title"
      className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn"
      onClick={(e) => {
        if (e.target === e.currentTarget && !loading) {
          onClose();
        }
      }}
    >
      <div className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-red-100 overflow-hidden transform transition-all animate-scaleUp">
        {/* Header */}
        <div className="flex items-center justify-between p-5 bg-gradient-to-l from-red-50 to-rose-50 border-b border-red-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-red-500/10 border border-red-200 flex items-center justify-center text-red-600 shrink-0">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div>
              <h3 id="disapprove-modal-title" className="text-base font-black text-slate-800">
                رد نوبت و آزادسازی ساعت
              </h3>
              <p className="text-xs text-slate-500 font-medium mt-0.5">
                این پیامک به عنوان علت عدم تایید برای بیمار ارسال می‌شود
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            aria-label="بستن"
            className="w-8 h-8 rounded-full bg-white/80 hover:bg-white text-slate-400 hover:text-slate-700 flex items-center justify-center transition-colors cursor-pointer border border-slate-200 disabled:opacity-50"
          >
            <X size={16} />
          </button>
        </div>

        {/* Appointment Info Summary */}
        {appointment && (
          <div className="px-5 py-3 bg-slate-50/80 border-b border-slate-100 flex flex-wrap items-center justify-between gap-2 text-xs">
            <div className="flex items-center gap-2">
              <span className="text-slate-400 font-medium">بیمار:</span>
              <strong className="text-slate-700 font-bold">
                {appointment.full_name || appointment.patient_full_name || appointment.user?.full_name || 'مراجع'}
              </strong>
            </div>
            {(appointment.appointment_date || appointment.date) && (
              <div className="flex items-center gap-2 text-slate-600">
                <span>تاریخ: {appointment.appointment_date || appointment.date}</span>
                {appointment.start_time && <span>- ساعت: {appointment.start_time.slice(0, 5)}</span>}
              </div>
            )}
          </div>
        )}

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          <div>
            <div className="flex items-center justify-between mb-2">
              <label htmlFor="cancellation-reason" className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                <MessageSquare className="w-3.5 h-3.5 text-red-500" />
                <span>متن پیام اختصاصی لغو (الزامی)</span>
              </label>
              <span
                className={`text-[11px] font-bold ${
                  reason.length > MAX_CHAR_COUNT ? 'text-red-500' : 'text-slate-400'
                }`}
                dir="ltr"
              >
                {reason.length} / {MAX_CHAR_COUNT}
              </span>
            </div>

            <textarea
              id="cancellation-reason"
              ref={textareaRef}
              rows={4}
              maxLength={MAX_CHAR_COUNT}
              value={reason}
              onChange={(e) => {
                setReason(e.target.value);
                if (error) setError('');
              }}
              disabled={loading}
              placeholder="علت رد یا لغو نوبت را بنویسید (این متن به عنوان پیامک برای بیمار ارسال خواهد شد)..."
              className={`w-full p-3.5 text-xs sm:text-sm text-slate-800 bg-white border rounded-2xl outline-none transition-all placeholder:text-slate-400 focus:ring-2 disabled:bg-slate-50 disabled:opacity-70 ${
                error
                  ? 'border-red-400 focus:border-red-500 focus:ring-red-100'
                  : 'border-slate-200 focus:border-red-400 focus:ring-red-50'
              }`}
            />

            {error && (
              <p className="text-[11px] font-bold text-red-600 mt-1.5 flex items-center gap-1 animate-fadeIn">
                <AlertTriangle size={13} />
                <span>{error}</span>
              </p>
            )}
          </div>

          {/* Quick Preset Chips */}
          <div>
            <div className="text-[11px] font-bold text-slate-500 mb-2">
              نمونه پیام‌های پیش‌فرض آماده:
            </div>
            <div className="flex flex-wrap gap-1.5">
              {PRESET_REASONS.map((preset, idx) => (
                <button
                  key={idx}
                  type="button"
                  disabled={loading}
                  onClick={() => handleSelectPreset(preset)}
                  className="text-[11px] px-2.5 py-1 rounded-xl bg-slate-100 hover:bg-red-50 hover:text-red-600 hover:border-red-200 text-slate-600 border border-slate-200 transition-colors cursor-pointer text-right disabled:opacity-50"
                >
                  {preset}
                </button>
              ))}
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="px-4 py-2.5 rounded-xl border border-slate-200 text-slate-600 text-xs font-bold hover:bg-slate-50 transition-colors cursor-pointer disabled:opacity-50"
            >
              انصراف
            </button>
            <button
              type="submit"
              disabled={loading || !reason.trim()}
              className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-700 hover:to-rose-700 text-white text-xs font-black shadow-lg shadow-red-500/20 hover:shadow-xl hover:shadow-red-500/30 transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>در حال ثبت و ارسال...</span>
                </>
              ) : (
                <>
                  <Send className="w-3.5 h-3.5 rotate-180" />
                  <span>تایید و ارسال پیامک رد نوبت</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>,
    document.body
  );
};

export default DisapproveReasonModal;
