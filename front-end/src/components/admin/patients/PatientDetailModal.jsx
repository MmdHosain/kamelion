// src/components/admin/patients/PatientDetailModal.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
import {
  X,
  User,
  Phone,
  CreditCard,
  Calendar,
  Clock,
  FileText,
  Activity,
  Plus,
  Loader2,
  AlertCircle,
  CheckCircle2,
  ArrowRight,
  MapPin,
  CalendarDays,
  Shield,
  Stethoscope,
} from 'lucide-react';
import { adminApi } from '../../../api/admin';
import { getApiErrorMessage } from '../../../utils/errorUtils';
import { toPersianDigits, formatJalaliDisplay } from '../../../utils/jalaliDateUtils';
import { getStatusConfig } from '../reservations/AppointmentDetailModal';
import ExpandableReason from './ExpandableReason';
import useBodyScrollLock from '../../../hooks/useBodyScrollLock';

const formatJalaliDate = (dateStr) => {
  if (!dateStr) return '—';
  try {
    const parts = String(dateStr).split('T')[0].split('-').map(Number);
    if (parts.length === 3) {
      const d = new Date(parts[0], parts[1] - 1, parts[2]);
      return formatJalaliDisplay(d, true);
    }
    return dateStr;
  } catch {
    return dateStr;
  }
};

const formatNoteDate = (isoOrText) => {
  if (!isoOrText) return '';
  try {
    const d = new Date(isoOrText);
    if (!isNaN(d.getTime())) {
      return d.toLocaleDateString('fa-IR', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    }
  } catch {
    // Return original string if already formatted
  }
  return isoOrText;
};

// AI Profile fields config with Persian labels
const AI_FIELDS = [
  { label: 'سطح ریسک', key: 'riskLevel' },
  { label: 'بیماری زمینه‌ای', key: 'chronicCondition' },
  { label: 'توصیه پزشکی', key: 'recommendation' },
  { label: 'پایبندی به درمان و دارو', key: 'medAdherence' },
  { label: 'سبک زندگی', key: 'lifestyle' },
];

const PatientDetailModal = ({
  patient,
  patientId,
  phoneNumber,
  onClose,
  onBackToAppointment,
}) => {
  useBodyScrollLock(Boolean(patient || patientId || phoneNumber));

  const [details, setDetails] = useState(patient || null);
  const [isLoading, setIsLoading] = useState(false);
  const [loadError, setLoadError] = useState('');

  const [notes, setNotes] = useState(patient?.notes || []);
  const [noteInput, setNoteInput] = useState('');
  const [isSubmittingNote, setIsSubmittingNote] = useState(false);
  const [noteError, setNoteError] = useState('');
  const [noteSuccess, setNoteSuccess] = useState('');

  // Fetch full dossier from backend
  const loadPatientDossier = useCallback(async () => {
    const targetId = patientId || patient?.id;
    const targetPhone = phoneNumber || patient?.phoneNumber || patient?.phone_number;

    setIsLoading(true);
    setLoadError('');

    try {
      let resolvedId = targetId;

      // If ID not directly available, lookup by phone
      if (!resolvedId && targetPhone) {
        const found = await adminApi.getPatientByPhone(targetPhone);
        if (found?.id) {
          resolvedId = found.id;
        }
      }

      if (resolvedId) {
        const fullDossier = await adminApi.getPatientDetail(resolvedId);
        setDetails((prev) => ({
          ...prev,
          ...fullDossier,
          fullName: fullDossier.full_name || prev?.fullName || prev?.full_name || 'بیمار',
          phoneNumber: fullDossier.phone_number || prev?.phoneNumber || prev?.phone_number || '—',
          nationalId: fullDossier.national_id || prev?.nationalId || prev?.national_id || null,
        }));
        if (Array.isArray(fullDossier.notes)) {
          setNotes(fullDossier.notes);
        }
      }
    } catch (err) {
      console.warn('Could not fetch full dossier from API, using provided props:', err);
      // Don't break if already have patient object
      if (!details) {
        setLoadError('امکان دریافت اطلاعات کامل پرونده از سرور وجود ندارد.');
      }
    } finally {
      setIsLoading(false);
    }
  }, [patient, patientId, phoneNumber]);

  useEffect(() => {
    loadPatientDossier();
  }, [loadPatientDossier]);

  if (!details && !patient && isLoading) {
    return createPortal(
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm" dir="rtl">
        <div className="bg-white rounded-3xl p-8 flex flex-col items-center gap-3 shadow-2xl">
          <Loader2 className="w-8 h-8 text-primary animate-spin" />
          <span className="text-sm font-bold text-gray-700">در حال دریافت پرونده بیمار...</span>
        </div>
      </div>,
      document.body
    );
  }

  const effectivePatient = details || patient || {};
  const fullName = effectivePatient.fullName || effectivePatient.full_name || 'بیمار';
  const phone = effectivePatient.phoneNumber || effectivePatient.phone_number || '—';
  const nationalId = effectivePatient.nationalId || effectivePatient.national_id;
  const address = effectivePatient.address;
  const dateOfBirth = effectivePatient.date_of_birth || effectivePatient.dateOfBirth;
  const aiProfile = effectivePatient.aiProfile || effectivePatient.ai_profile || {};
  const appointments = effectivePatient.appointments || [];

  const handleAddNote = async () => {
    const trimmed = noteInput.trim();
    if (!trimmed) return;

    const targetId = effectivePatient.id || patientId;
    if (!targetId) {
      setNoteError('شناسه پرونده بیمار برای ثبت یادداشت مشخص نیست.');
      return;
    }

    setIsSubmittingNote(true);
    setNoteError('');
    setNoteSuccess('');

    try {
      const res = await adminApi.addPatientNote(targetId, trimmed);
      const newNote = {
        id: res?.id || Date.now(),
        text: res?.text || trimmed,
        created_at: res?.created_at || new Date().toISOString(),
        author_name: res?.author_name || 'پزشک معالج',
      };

      setNotes((prev) => [newNote, ...prev]);
      setNoteInput('');
      setNoteSuccess('یادداشت با موفقیت در پرونده ثبت شد.');
      setTimeout(() => setNoteSuccess(''), 2500);
    } catch (err) {
      setNoteError(getApiErrorMessage(err, 'خطا در ثبت یادداشت بالینی.'));
    } finally {
      setIsSubmittingNote(false);
    }
  };

  return createPortal(
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-3 sm:p-6 animate-fadeSlide"
      onClick={onClose}
      dir="rtl"
    >
      <div
        className="relative bg-white rounded-3xl shadow-2xl w-full max-w-5xl max-h-[90vh] overflow-y-auto flex flex-col p-6 md:p-8 gap-5 border border-primary/20 chat-scroll"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Bar: Back to appointment button (if present) & Close button */}
        <div className="flex items-center justify-between border-b border-gray-100 pb-4">
          <div className="flex items-center gap-3">
            {onBackToAppointment && (
              <button
                type="button"
                onClick={onBackToAppointment}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-primary bg-primary/10 hover:bg-primary hover:text-white rounded-xl transition-all cursor-pointer shadow-sm"
                title="بازگشت به جزئیات نوبت"
              >
                <ArrowRight size={15} />
                <span>بازگشت به نوبت</span>
              </button>
            )}

            <div className="w-10 h-10 rounded-2xl bg-primary/10 text-primary flex items-center justify-center font-bold">
              <Stethoscope size={20} />
            </div>

            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-black text-gray-900">{fullName}</h2>
                <span className="text-[11px] font-bold text-primary bg-primary/10 px-2 py-0.5 rounded-lg">
                  پرونده بالینی
                </span>
              </div>
              <p className="text-xs text-gray-400 font-medium mt-0.5">
                سوابق نوبت‌ها، یادداشت‌های درمانی و مشخصات هویتی بیمار
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {isLoading && (
              <div className="flex items-center gap-1.5 text-xs text-primary font-bold bg-primary/5 px-2.5 py-1 rounded-xl">
                <Loader2 size={14} className="animate-spin" />
                <span>به‌روزرسانی...</span>
              </div>
            )}
            <button
              onClick={onClose}
              className="p-2 rounded-xl text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors cursor-pointer"
              aria-label="بستن"
            >
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Identity & Contact Info Strip */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 p-4 bg-gray-50/80 rounded-2xl border border-gray-200/80 text-xs">
          <div className="flex items-center gap-2">
            <Phone size={16} className="text-primary shrink-0" />
            <div>
              <div className="text-gray-400 text-[10px] font-medium">شماره تماس</div>
              <div className="font-mono font-bold text-gray-800 dir-ltr text-right">{phone}</div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <CreditCard size={16} className="text-primary shrink-0" />
            <div>
              <div className="text-gray-400 text-[10px] font-medium">کد ملی</div>
              <div className="font-mono font-bold text-gray-800">
                {nationalId ? toPersianDigits(nationalId) : 'ثبت‌نشده'}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <CalendarDays size={16} className="text-primary shrink-0" />
            <div>
              <div className="text-gray-400 text-[10px] font-medium">تاریخ تولد</div>
              <div className="font-medium text-gray-800">{formatJalaliDate(dateOfBirth)}</div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <MapPin size={16} className="text-primary shrink-0" />
            <div className="truncate">
              <div className="text-gray-400 text-[10px] font-medium">آدرس</div>
              <div className="font-medium text-gray-800 truncate">{address || 'ثبت‌نشده'}</div>
            </div>
          </div>
        </div>

        {loadError && (
          <div className="rounded-2xl bg-amber-50 border border-amber-200 text-amber-800 p-3 text-xs font-bold flex items-center gap-2">
            <AlertCircle size={16} className="shrink-0 text-amber-600" />
            <span>{loadError}</span>
          </div>
        )}

        {/* 3-Column Dossier Grid: Notes | AI Indicators | Appointment History */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 w-full min-w-0">
          {/* Column 1: Clinical Notes (یادداشت‌های بالینی) */}
          <div className="bg-gray-50/50 border border-gray-200/80 rounded-2xl flex flex-col p-4 gap-3 shadow-inner w-full min-w-0 overflow-hidden">
            <div className="flex items-center justify-between border-b border-gray-200/60 pb-2">
              <h3 className="text-xs font-bold text-gray-700 flex items-center gap-1.5">
                <FileText size={15} className="text-primary" />
                یادداشت‌های بالینی پزشک
              </h3>
              <span className="text-[11px] font-mono font-bold text-primary bg-primary/10 px-2 py-0.5 rounded-lg">
                {toPersianDigits(notes.length)} یادداشت
              </span>
            </div>

            {/* Note Input */}
            <div className="flex flex-col gap-2">
              <textarea
                value={noteInput}
                onChange={(e) => setNoteInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && e.ctrlKey && handleAddNote()}
                placeholder="ثبت شرح حال، نتیجه آزمایش یا یادداشت بالینی جدید... (کلید ترکیبی Ctrl+Enter)"
                rows={3}
                disabled={isSubmittingNote}
                className="w-full resize-none rounded-xl border border-gray-200 p-2.5 text-xs text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all bg-white disabled:opacity-60 break-words"
              />

              {noteError && (
                <span className="text-[11px] text-red-500 font-bold flex items-center gap-1">
                  <AlertCircle size={12} />
                  {noteError}
                </span>
              )}

              {noteSuccess && (
                <span className="text-[11px] text-emerald-600 font-bold flex items-center gap-1">
                  <CheckCircle2 size={12} />
                  {noteSuccess}
                </span>
              )}

              <button
                type="button"
                onClick={handleAddNote}
                disabled={isSubmittingNote || !noteInput.trim()}
                className="w-full flex items-center justify-center gap-1.5 bg-primary hover:bg-primary-dark text-white text-xs font-bold py-2 rounded-xl transition-all shadow-sm disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
              >
                {isSubmittingNote ? (
                  <>
                    <Loader2 size={14} className="animate-spin" />
                    <span>در حال ذخیره...</span>
                  </>
                ) : (
                  <>
                    <Plus size={14} />
                    <span>ثبت یادداشت جدید</span>
                  </>
                )}
              </button>
            </div>

            {/* Notes List */}
            <div className="flex-1 overflow-y-auto chat-scroll flex flex-col gap-2 max-h-[300px] min-h-[140px] pr-1">
              {notes.length === 0 ? (
                <div className="text-center py-8 text-gray-400 text-xs">
                  هنوز یادداشتی برای این بیمار ثبت نشده است.
                </div>
              ) : (
                notes.map((note, idx) => (
                  <div
                    key={note.id || idx}
                    className="bg-white border border-gray-100 rounded-xl p-3 flex flex-col gap-1.5 shadow-sm w-full min-w-0 overflow-hidden"
                  >
                    <div className="flex items-center justify-between text-[10px] text-gray-400 border-b border-gray-50 pb-1">
                      <span className="font-bold text-primary/80">
                        {note.author_name || note.author || 'پزشک / ادمین'}
                      </span>
                      <span>{formatNoteDate(note.created_at || note.createdAt)}</span>
                    </div>
                    <p className="text-xs text-gray-800 leading-relaxed select-text break-words">
                      {note.text}
                    </p>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Column 2: AI Clinical Indicators (شاخص‌های تریاژ هوشمند) */}
          <div className="bg-gray-50/50 border border-gray-200/80 rounded-2xl flex flex-col p-4 gap-3 shadow-inner w-full min-w-0 overflow-hidden">
            <div className="flex items-center justify-between border-b border-gray-200/60 pb-2">
              <h3 className="text-xs font-bold text-gray-700 flex items-center gap-1.5">
                <Activity size={15} className="text-primary" />
                شاخص‌های تریاژ و ارزیابی هوش مصنوعی
              </h3>
            </div>

            <div className="flex-1 overflow-y-auto chat-scroll space-y-2.5 max-h-[300px] min-h-[140px] pr-1">
              {AI_FIELDS.map(({ label, key }, i) => {
                const val = aiProfile[key];
                return (
                  <div
                    key={key}
                    className="p-3 bg-white border border-gray-100 rounded-xl flex flex-col gap-1 shadow-sm"
                  >
                    <span className="text-[11px] text-gray-400 font-medium">{label}</span>
                    <span
                      className={`text-xs font-bold ${
                        key === 'riskLevel' && val === 'بالا'
                          ? 'text-red-600'
                          : key === 'riskLevel' && val === 'متوسط'
                          ? 'text-amber-600'
                          : 'text-gray-800'
                      }`}
                    >
                      {val || '—'}
                    </span>
                  </div>
                );
              })}

              <div className="p-3 bg-primary/5 border border-primary/15 rounded-xl text-[11px] text-primary-dark font-medium flex items-center gap-2">
                <Shield size={14} className="shrink-0 text-primary" />
                <span>تحلیل‌های هوش مصنوعی صرفاً نقش دستیار تریاژ و غربالگری را دارند.</span>
              </div>
            </div>
          </div>

          {/* Column 3: Appointment History (تاریخچه نوبت‌ها) */}
          <div className="bg-gray-50/50 border border-gray-200/80 rounded-2xl flex flex-col p-4 gap-3 shadow-inner w-full min-w-0 overflow-hidden">
            <div className="flex items-center justify-between border-b border-gray-200/60 pb-2">
              <h3 className="text-xs font-bold text-gray-700 flex items-center gap-1.5">
                <Calendar size={15} className="text-primary" />
                تاریخچه نوبت‌های بیمار
              </h3>
              <span className="text-[11px] font-mono font-bold text-primary bg-primary/10 px-2 py-0.5 rounded-lg">
                {toPersianDigits(appointments.length)} نوبت
              </span>
            </div>

            <div className="flex-1 overflow-y-auto chat-scroll space-y-2.5 max-h-[300px] min-h-[140px] pr-1">
              {appointments.length === 0 ? (
                <div className="text-center py-8 text-gray-400 text-xs">
                  سابقه‌ای برای نوبت‌های قبلی ثبت نشده است.
                </div>
              ) : (
                appointments.map((appt, i) => {
                  const conf = getStatusConfig(appt.status);
                  const displayDate = formatJalaliDate(appt.date || appt.appointment_date);
                  const time = (appt.time || appt.appointment_time || '').slice(0, 5);

                  return (
                    <div
                      key={appt.id || i}
                      className="bg-white border border-gray-100 rounded-xl p-3 flex flex-col gap-2 shadow-sm w-full min-w-0 overflow-hidden"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-gray-800">{displayDate}</span>
                        <div
                          className={`flex items-center gap-1 px-2 py-0.5 rounded-lg text-[10px] font-bold border ${conf.bg} ${conf.text} ${conf.border}`}
                        >
                          <span className={`w-1.5 h-1.5 rounded-full ${conf.dot}`} />
                          <span>{conf.label}</span>
                        </div>
                      </div>

                      <div className="flex items-center justify-between text-xs text-gray-500">
                        <span className="flex items-center gap-1">
                          <Clock size={12} className="text-gray-400" />
                          ساعت {toPersianDigits(time)}
                        </span>
                      </div>

                      <ExpandableReason reason={appt.reason} />
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between pt-3 border-t border-gray-100">
          <div>
            {onBackToAppointment && (
              <button
                type="button"
                onClick={onBackToAppointment}
                className="flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-primary border border-primary/25 rounded-2xl hover:bg-primary/5 transition-all cursor-pointer"
              >
                <ArrowRight size={14} />
                <span>بازگشت به مشاهده نوبت</span>
              </button>
            )}
          </div>

          <button
            type="button"
            onClick={onClose}
            className="px-6 py-2 text-xs font-bold text-gray-600 border border-gray-200 rounded-2xl hover:bg-gray-100 transition-colors cursor-pointer"
          >
            بستن پنجره
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
};

export default PatientDetailModal;
