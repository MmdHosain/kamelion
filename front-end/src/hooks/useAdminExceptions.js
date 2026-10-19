// src/hooks/useAdminExceptions.js
import { useState, useCallback, useEffect, useMemo } from 'react';
import {
  getAdminExceptions,
  bulkSaveAdminExceptions,
} from '../api/schedules';

export const newException = () => ({
  id: crypto.randomUUID(),
  startDate: '',
  endDate: '',
  note: '',
});

export const normalizeBackendExceptions = (rows = []) =>
  rows.map((row) => ({
    id: row.id,
    startDate: row.start_date || '',
    endDate: row.end_date || '',
    note: row.reason || '',
  }));

export const buildBackendExceptions = (exceptions = []) =>
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

export function useAdminExceptions() {
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

  const saveLabel = useMemo(() => {
    switch (saveStatus) {
      case 'saving':
        return 'در حال ذخیره‌سازی...';
      case 'saved':
        return 'ذخیره شد ✓';
      case 'error':
        return 'خطا — تلاش مجدد';
      default:
        return 'ذخیره تنظیمات استثنائات';
    }
  }, [saveStatus]);

  const saveBg = useMemo(() => {
    switch (saveStatus) {
      case 'saving':
        return 'bg-primary/70 text-white cursor-wait';
      case 'saved':
        return 'bg-emerald-600 text-white';
      case 'error':
        return 'bg-red-500 hover:bg-red-600 text-white';
      default:
        return 'bg-primary hover:bg-primary-dark text-white';
    }
  }, [saveStatus]);

  return {
    exceptions,
    setExceptions,
    loading,
    saving,
    error,
    setError,
    successMessage,
    setSuccessMessage,
    saveStatus,
    loadExceptions,
    handleAdd,
    handleChange,
    handleDateChange,
    handleDelete,
    handleSave,
    saveLabel,
    saveBg,
  };
}
