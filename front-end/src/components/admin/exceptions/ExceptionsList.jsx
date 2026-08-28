// src/components/admin/exceptions/ExceptionsList.jsx

import { useState, useCallback, useEffect } from 'react';
import { Trash2, Plus, Save } from 'lucide-react';
import CustomDateRangePicker from './CustomDateRangePicker';
import {
  getAdminExceptions,
  bulkSaveAdminExceptions,
} from '../../../api/schedules';

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

      // Existing DB rows have integer IDs.
      // New frontend-only rows have crypto.randomUUID(), so do not send those IDs.
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
  const [saveStatus, setSaveStatus] = useState('idle');

  const loadExceptions = useCallback(async () => {
    setLoading(true);
    setError('');

    try {
      const data = await getAdminExceptions();
      setExceptions(normalizeBackendExceptions(Array.isArray(data) ? data : []));
    } catch (err) {
      console.error('[loadExceptions] Failed:', err);
      setError('Failed to load exceptions.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadExceptions();
  }, [loadExceptions]);

  const handleAdd = useCallback(() => {
    setExceptions((prev) => [...prev, newException()]);
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
        return 'Each exception must have a start date and end date.';
      }

      if (ex.endDate < ex.startDate) {
        return 'Exception end date must be after or equal to start date.';
      }

      if ((ex.note || '').length > 255) {
        return 'Exception note cannot be longer than 255 characters.';
      }
    }

    return null;
  }, [exceptions]);

  const handleSave = useCallback(async () => {
    const validationError = validateExceptions();

    if (validationError) {
      setError(validationError);
      setSaveStatus('error');
      setTimeout(() => setSaveStatus('idle'), 3000);
      return;
    }

    setSaving(true);
    setSaveStatus('saving');
    setError('');

    try {
      const payload = buildBackendExceptions(exceptions);
      const saved = await bulkSaveAdminExceptions(payload);

      setExceptions(normalizeBackendExceptions(Array.isArray(saved) ? saved : []));

      setSaveStatus('saved');
      setTimeout(() => setSaveStatus('idle'), 2500);
    } catch (err) {
      console.error('[saveExceptions] Failed:', err);

      const errorMessage =
        err?.response?.data?.detail ||
        err?.response?.data?.exceptions?.[0] ||
        err?.response?.data?.non_field_errors?.[0] ||
        'Failed to save exceptions.';

      setError(errorMessage);
      setSaveStatus('error');
      setTimeout(() => setSaveStatus('idle'), 3000);
    } finally {
      setSaving(false);
    }
  }, [exceptions, validateExceptions]);

  const saveLabel = {
    idle: 'Save Exceptions',
    saving: 'Saving…',
    saved: 'Saved ✓',
    error: 'Error — Retry',
  }[saveStatus];

  const AddButton = () => (
    <button
      type="button"
      onClick={handleAdd}
      aria-label="Add exception"
      className="
        flex items-center justify-center
        w-14 h-14 rounded-full
        bg-primary hover:bg-primaryHover
        text-white shadow-lg hover:shadow-xl
        transition-all duration-200 shrink-0
      "
    >
      <Plus size={26} strokeWidth={2.5} />
    </button>
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <p className="text-sm text-gray-400">Loading exceptions...</p>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex items-center justify-between gap-4 mb-5">
        <div>
          {error && (
            <div className="rounded-xl bg-red-50 border border-red-200 text-red-700 px-4 py-3 text-sm">
              {error}
            </div>
          )}
        </div>

        <button
          type="button"
          onClick={handleSave}
          disabled={saving}
          className="
            flex items-center gap-2 px-4 py-2 rounded-xl
            bg-primary hover:bg-primaryHover
            text-white text-sm font-medium shadow-md
            disabled:opacity-60 disabled:cursor-wait
            transition-all duration-200
          "
        >
          <Save size={15} />
          {saveLabel}
        </button>
      </div>

      {exceptions.length === 0 ? (
        <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
          <AddButton />
          <p className="text-sm text-gray-400">Add your first exception</p>
        </div>
      ) : (
        <div className="flex flex-wrap gap-5 items-start">
          {exceptions.map((ex) => (
            <div
              key={ex.id}
              className="
                bg-white border border-gray-100 rounded-xl shadow-sm
                p-5 flex flex-col gap-4
                w-full sm:w-[calc(50%-10px)] lg:w-[calc(33.333%-14px)]
              "
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                  Exception
                </span>

                <button
                  type="button"
                  onClick={() => handleDelete(ex.id)}
                  aria-label="Delete exception"
                  className="p-1.5 rounded-md text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors"
                >
                  <Trash2 size={15} />
                </button>
              </div>

              <CustomDateRangePicker
                startDate={ex.startDate}
                endDate={ex.endDate}
                onChange={(start, end) => handleDateChange(ex.id, start, end)}
              />

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-medium text-gray-500">
                  Note <span className="text-gray-400 font-normal">(Optional)</span>
                </label>

                <textarea
                  rows={3}
                  maxLength={255}
                  placeholder="e.g. National holiday, staff training..."
                  value={ex.note}
                  onChange={(e) => handleChange(ex.id, 'note', e.target.value)}
                  className="
                    w-full px-3 py-2 text-sm border border-gray-200 rounded-lg
                    focus:outline-none focus:ring-2 focus:ring-primary
                    placeholder:text-gray-400 bg-white resize-none
                  "
                />
              </div>
            </div>
          ))}

          <div className="flex items-center justify-center w-full sm:w-auto self-center sm:mt-6">
            <AddButton />
          </div>
        </div>
      )}
    </div>
  );
}
