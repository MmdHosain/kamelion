import React, { useEffect, useState } from 'react';
import { adminApi } from '../../api/admin';

const ReservedTimes = () => {
  const [slots, setSlots] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    adminApi.getReservedTimes()
      .then(setSlots)
      .catch(() => setError('Failed to load reserved times'))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="text-sm">Loading appointments...</div>;
  if (error) return <div className="text-red-500 text-sm">{error}</div>;

  return (
    <div className="space-y-3">
      {slots.map((slot) => (
        <div
          key={slot.id}
          className="flex justify-between items-center bg-white border rounded-xl p-4"
        >
          <div className="text-[#2F5D50] font-medium">
            {slot.date} — {slot.time}
          </div>
          <div className="text-sm text-[#6B6E6C]">
            {slot.client}
          </div>
        </div>
      ))}
    </div>
  );
};

export default ReservedTimes;
