import React, { useEffect, useState } from 'react';
import { adminApi } from '../../api/admin';
import { toPersianDigits } from '../../utils/jalaliDateUtils';

const ReservedTimes = () => {
  const [slots, setSlots] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    adminApi.getReservedTimes()
      .then(setSlots)
      .catch(() => setError('خطا در بارگذاری نوبت‌های رزرو شده'))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="text-sm text-textDark/70">در حال بارگذاری نوبت‌ها...</div>;
  if (error) return <div className="text-red-500 text-sm">{error}</div>;

  return (
    <div className="space-y-3">
      {slots.map((slot) => (
        <div
          key={slot.id}
          className="flex justify-between items-center bg-white border rounded-xl p-4"
        >
          <div className="text-primary font-medium">
            {toPersianDigits(slot.date)} — {toPersianDigits(slot.time)}
          </div>
          <div className="text-sm text-mutedText">
            {slot.client}
          </div>
        </div>
      ))}
    </div>
  );
};

export default ReservedTimes;
