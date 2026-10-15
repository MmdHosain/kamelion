// src/components/admin/exceptions/ExceptionsList.jsx
import React, { useState, useCallback, useEffect, useMemo } from 'react';
import {
  Trash2,
  Plus,
  Save,
  CalendarOff,
  AlertCircle,
  CheckCircle2,
  Loader2,
  Info,
} from 'lucide-react';
import CustomDateRangePicker, { fromYMD } from './CustomDateRangePicker';
import {
  getAdminExceptions,
  bulkSaveAdminExceptions,
} from '../../../api/schedules';
import { toPersianDigits } from '../../../utils/jalaliDateUtils';

const newException = () => ({
  id: crypto.randomUUID(),
  startDate: '',
  endDate: '',
  note: '',
});

const normalizeBackendExceptions = (rows = []) =>
  rows.map((row) => ({
    id: row.id,
    startDate: row.start_date || '',
    endDate: row.end_date || '',
    note: row.reason || '',
  }));

const buildBackendExceptions = (exceptions = []) =>
  exceptions
    .filter((ex) => ex.startDate && ex.endDate)
    .map((ex) => {
      const payload = {
        start_date: ex.startDate,
        end_date: ex.endDate,
        reason: ex.note || '',
      };

      if (Number.isInteger(ex.id)) {
        payload.id = ex.id;
      }

      return payload;
    });

export default function ExceptionsList() {
  const [exceptions, setExceptions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [saveStatus, setSaveStatus] = useState('idle'); // 'idle' | 'saving' | 'saved' | 'error'

  const loadExceptions = useCallback(async () => {
    setLoading(true);
    setError('');

    try {
      const data = await getAdminExceptions();
      setExceptions(normalizeBackendExceptions(Array.isArray(data) ? data : []));
    } catch (err) {
      console.error('[loadExceptions] Failed:', err);
      setError('بارگذاری تعطیلات و استثنائات با خطا مواجه شد. لطفاً دوباره تلاش نمایید.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadExceptions();
  }, [loadExceptions]);

  const handleAdd = useCallback(() => {
    setExceptions((prev) => [...prev, newException()]);
    setError('');
  }, []);

  const handleChange = useCallback((id, field, value) => {
    setExceptions((prev) =>
      prev.map((ex) => (ex.id === id ? { ...ex, [field]: value } : ex))
    );
  }, []);

  const handleDateChange = useCallback((id, startDate, endDate) => {
    setExceptions((prev) =>
      prev.map((ex) => (ex.id === id ? { ...ex, startDate, endDate } : ex))
    );
  }, []);

  const handleDelete = useCallback((id) => {
    setExceptions((prev) => prev.filter((ex) => ex.id !== id));
  }, []);

  const validateExceptions = useCallback(() => {
    for (const ex of exceptions) {
      if (!ex.startDate || !ex.endDate) {
        return 'برای هر بازه تعطیلی، انتخاب هر دو تاریخ شروع و پایان الزامی است.';
      }

      if (ex.endDate < ex.startDate) {
        return 'تاریخ پایان تعطیلی باید بعد یا مساوی با تاریخ شروع باشد.';
      }

      if ((ex.note || '').length > 255) {
        return 'توضیحات یا علت تعطیلی نباید بیشتر از ۲۵۵ کاراکتر باشد.';
      }
    }

    return null;
  }, [exceptions]);

  const handleSave = useCallback(async () => {
    const validationError = validateExceptions();

    if (validationError) {
      setError(validationError);
      setSaveStatus('error');
      setTimeout(() => setSaveStatus('idle'), 3500);
      return;
    }

    setSaving(true);
    setSaveStatus('saving');
    setError('');
    setSuccessMessage('');

    try {
      const payload = buildBackendExceptions(exceptions);
      const saved = await bulkSaveAdminExceptions(payload);

      setExceptions(normalizeBackendExceptions(Array.isArray(saved) ? saved : []));

      setSaveStatus('saved');
      setSuccessMessage('تغییرات تعطیلات و استثنائات با موفقیت ذخیره شد.');
      setTimeout(() => {
        setSaveStatus('idle');
        setSuccessMessage('');
      }, 3000);
    } catch (err) {
      console.error('[saveExceptions] Failed:', err);

      const errorMessage =
        err?.response?.data?.detail ||
        err?.response?.data?.exceptions?.[0] ||
        err?.response?.data?.non_field_errors?.[0] ||
        'ذخیره تغییرات با خطا مواجه شد. لطفاً اتصال اینترنت را بررسی کنید.';

      setError(errorMessage);
      setSaveStatus('error');
      setTimeout(() => setSaveStatus('idle'), 3500);
    } finally {
      setSaving(false);
    }
  }, [exceptions, validateExceptions]);

  const saveConfig = useMemo(() => {
    switch (saveStatus) {
      case 'saving':
        return { label: 'در حال ذخیره‌سازی...', bg: 'bg-primary/80 text-white' };
      case 'saved':
        return { label: 'با موفقیت ذخیره شد ✓', bg: 'bg-emerald-600 text-white' };
      case 'error':
        return { label: 'خطا در ذخیره — تلاش مجدد', bg: 'bg-rose-600 text-white' };
      default:
        return { label: 'ذخیره تغییرات استثنائات', bg: 'bg-primary hover:bg-primary-dark text-white' };
    }
  }, [saveStatus]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[350px] gap-3">
        <Loader2 className="w-8 h-8 text-primary animate-spin" />
        <p className="text-xs md:text-sm font-bold text-textDark/60">
          در حال بارگذاری لیست تعطیلات و استثنائات مطب...
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6 pt-1">
      {/* Top Banner & Action Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white/70 backdrop-blur-md p-4 rounded-3xl border border-primary/15 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
            <CalendarOff size={20} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-sm md:text-base font-black text-textDark">
                تعطیلات رسمی و روزهای استثناء
              </h2>
              <span className="px-2 py-0.5 rounded-lg text-xs font-bold bg-primary/10 text-primary">
                {toPersianDigits(exceptions.length)} بازه
              </span>
            </div>
            <p className="text-xs text-textDark/60 font-medium mt-0.5">
              در روزهای مشخص‌شده، تمامی اسلات‌های ویزیت برای بیماران مسدود خواهد شد.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5 self-start sm:self-auto shrink-0">
          <button
            type="button"
            onClick={handleAdd}
            className="flex items-center gap-1.5 px-4 py-2.5 rounded-2xl bg-white border border-primary/20 hover:border-primary text-primary text-xs md:text-sm font-bold shadow-sm hover:shadow transition-all cursor-pointer"
          >
            <Plus size={16} />
            <span>افزودن بازه جدید</span>
          </button>

          <button
            type="button"
            onClick={handleSave}
            disabled={saving}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-2xl text-xs md:text-sm font-bold shadow-md transition-all duration-200 cursor-pointer disabled:opacity-50 ${saveConfig.bg}`}
          >
            <Save size={16} className={saving ? 'animate-spin' : ''} />
            <span>{saveConfig.label}</span>
          </button>
        </div>
      </div>

      {/* Error or Success notification */}
      {error && (
        <div className="rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 px-4 py-3 text-xs md:text-sm font-bold flex items-center gap-2 animate-in fade-in">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {successMessage && (
        <div className="rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 px-4 py-3 text-xs md:text-sm font-bold flex items-center gap-2 animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
          <span>{successMessage}</span>
        </div>
      )}

      {/* Exceptions Grid / Empty State */}
      {exceptions.length === 0 ? (
        <div className="flex flex-col items-center justify-center min-h-[340px] bg-white/60 backdrop-blur-sm rounded-3xl border border-dashed border-primary/25 p-8 text-center gap-4">
          <div className="w-16 h-16 rounded-full bg-primary/10 text-primary flex items-center justify-center shadow-inner">
            <CalendarOff size={28} />
          </div>

          <div className="max-w-md">
            <h3 className="text-base font-black text-textDark mb-1">
              هیچ بازه تعطیلی ثبت نشده است
            </h3>
            <p className="text-xs text-textDark/60 leading-relaxed font-medium">
              تمامی روزهای تقویم طبق شیفت هفتگی پزشک فعال هستند. برای بستن مطب در ایام تعطیلات، کنگره‌ها یا مرخصی پزشک، بازه جدید ایجاد کنید.
            </p>
          </div>

          <button
            type="button"
            onClick={handleAdd}
            className="flex items-center gap-2 px-6 py-2.5 rounded-2xl bg-primary hover:bg-primary-dark text-white text-xs md:text-sm font-bold shadow-md shadow-primary/25 transition-all cursor-pointer"
          >
            <Plus size={16} />
            <span>افزودن اولین بازه تعطیلی</span>
          </button>
        </div>
      ) : (
        <div className="flex flex-col gap-6">
          <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {exceptions.map((ex, idx) => {
              // Calculate duration in days
              let daysDuration = 0;
              if (ex.startDate && ex.endDate) {
                const s = fromYMD(ex.startDate);
                const e = fromYMD(ex.endDate);
                if (s && e && e >= s) {
                  daysDuration = Math.round((e - s) / (1000 * 60 * 60 * 24)) + 1;
                }
              }

              return (
                <div
                  key={ex.id}
                  className="bg-white/90 backdrop-blur-md rounded-3xl border border-primary/20 p-5 shadow-sm hover:shadow-md hover:border-primary/40 transition-all flex flex-col justify-between gap-4 group"
                >
                  {/* Card Header */}
                  <div className="flex items-center justify-between border-b border-primary/10 pb-3">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-xl bg-primary/10 text-primary flex items-center justify-center font-bold text-xs shrink-0">
                        {toPersianDigits(idx + 1)}
                      </div>
                      <span className="text-xs md:text-sm font-black text-textDark">
                        تعطیلی مطب
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      {daysDuration > 0 && (
                        <span className="px-2 py-0.5 rounded-lg text-[11px] font-black bg-rose-50 text-rose-700 border border-rose-200">
                          {toPersianDigits(daysDuration)} روز
                        </span>
                      )}

                      <button
                        type="button"
                        onClick={() => handleDelete(ex.id)}
                        aria-label="حذف بازه تعطیلی"
                        title="حذف این بازه"
                        className="p-1.5 rounded-xl text-textDark/40 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </div>

                  {/* Date Range Picker */}
                  <CustomDateRangePicker
                    startDate={ex.startDate}
                    endDate={ex.endDate}
                    onChange={(start, end) => handleDateChange(ex.id, start, end)}
                  />

                  {/* Reason & Notes Field */}
                  <div className="flex flex-col gap-1.5">
                    <div className="flex items-center justify-between text-[11px] font-bold text-textDark/70">
                      <span>علت تعطیلی یا یادداشت:</span>
                      <span className="text-textDark/40 font-normal">
                        {toPersianDigits((ex.note || '').length)}/۲۵۵
                      </span>
                    </div>

                    <textarea
                      rows={2}
                      maxLength={255}
                      placeholder="مثلاً: تعطیلات نوروز، شرکت در کنگره جراحی، بازسازی مطب..."
                      value={ex.note}
                      onChange={(e) => handleChange(ex.id, 'note', e.target.value)}
                      className="
                        w-full px-3 py-2 text-xs border border-primary/15 rounded-2xl
                        focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary
                        placeholder:text-textDark/40 bg-white/80 resize-none transition-all font-medium text-textDark leading-relaxed
                      "
                    />
                  </div>
                </div>
              );
            })}
          </div>

          {/* Bottom circular add button */}
          <div className="flex flex-col items-center justify-center py-6 gap-2">
            <button
              type="button"
              onClick={handleAdd}
              aria-label="افزودن بازه تعطیلی جدید"
              className="w-14 h-14 rounded-full bg-primary text-white flex items-center justify-center shadow-lg shadow-primary/30 hover:bg-primary-dark hover:scale-105 active:scale-95 transition-all duration-200 cursor-pointer"
            >
              <Plus size={28} strokeWidth={2.5} />
            </button>
            <span className="text-xs font-bold text-textDark/60">افزودن بازه تعطیلی جدید</span>
          </div>
        </div>
      )}
    </div>
  );
}
