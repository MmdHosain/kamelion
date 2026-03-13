// src/components/admin/exceptions/ExceptionsList.jsx

import { useState, useCallback } from 'react';
import { Trash2, Plus } from 'lucide-react';
import CustomDateRangePicker from './CustomDateRangePicker';

const newException = () => ({
  id:        crypto.randomUUID(),
  startDate: '',
  endDate:   '',
  note:      '',
});

export default function ExceptionsList() {

  const [exceptions, setExceptions] = useState([]);

  // POST /api/exceptions
  const handleAdd = useCallback(() => {
    setExceptions((prev) => [...prev, newException()]);
  }, []);

  // PATCH /api/exceptions/:id — called only after Confirm in the picker
  const handleChange = useCallback((id, field, value) => {
    setExceptions((prev) =>
      prev.map((ex) => (ex.id === id ? { ...ex, [field]: value } : ex))
    );
  }, []);

  // Called by CustomDateRangePicker on Confirm
  const handleDateChange = useCallback((id, startDate, endDate) => {
    setExceptions((prev) =>
      prev.map((ex) => (ex.id === id ? { ...ex, startDate, endDate } : ex))
    );
  }, []);

  // DELETE /api/exceptions/:id
  const handleDelete = useCallback((id) => {
    setExceptions((prev) => prev.filter((ex) => ex.id !== id));
  }, []);

  const AddButton = () => (
    <button
      onClick={handleAdd}
      aria-label="Add exception"
      className="
        flex items-center justify-center
        w-14 h-14 rounded-full
        bg-[#2D5A4C] hover:bg-[#234840]
        text-white shadow-lg hover:shadow-xl
        transition-all duration-200 shrink-0
      "
    >
      <Plus size={26} strokeWidth={2.5} />
    </button>
  );

  if (exceptions.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
        <AddButton />
        <p className="text-sm text-gray-400">Add your first exception</p>
      </div>
    );
  }

  return (
    <div className="p-6">
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
            {/* Card header */}
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                Exception
              </span>
              <button
                onClick={() => handleDelete(ex.id)}
                aria-label="Delete exception"
                className="p-1.5 rounded-md text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors"
              >
                <Trash2 size={15} />
              </button>
            </div>

            {/* Date range picker — updates state only on Confirm */}
            <CustomDateRangePicker
              startDate={ex.startDate}
              endDate={ex.endDate}
              onChange={(start, end) => handleDateChange(ex.id, start, end)}
            />

            {/* Note */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-medium text-gray-500">
                Note <span className="text-gray-400 font-normal">(Optional)</span>
              </label>
              <textarea
                rows={3}
                placeholder="e.g. National holiday, staff training..."
                value={ex.note}
                onChange={(e) => handleChange(ex.id, 'note', e.target.value)}
                className="
                  w-full px-3 py-2 text-sm border border-gray-200 rounded-lg
                  focus:outline-none focus:ring-2 focus:ring-[#2D5A4C]
                  placeholder:text-gray-400 bg-white resize-none
                "
              />
            </div>
          </div>
        ))}

        {/* Trailing add button */}
        <div className="flex items-center justify-center w-full sm:w-auto self-center sm:mt-6">
          <AddButton />
        </div>

      </div>
    </div>
  );
}
