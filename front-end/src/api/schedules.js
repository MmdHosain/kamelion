// src/api/schedules.js

/**
 * saveSchedules
 *
 * Sends the full schedules array to your backend.
 *
 * @param {Array}  schedules  - current schedules state from React
 * @param {string} token      - JWT or session token from your auth context
 * @returns {Promise<{ schedules: Array }>} - backend-confirmed schedule list
 *
 * Usage inside your component:
 *   import { saveSchedules } from '../../api/schedules';
 *   const data = await saveSchedules(schedules, authToken);
 */
export const saveSchedules = async (schedules, token) => {
  const payload = {
    schedules: schedules.map((s) => ({
      id:           s.id,
      startTime:    s.startTime,    // "09:00"
      endTime:      s.endTime,      // "17:00"
      slotDuration: s.slotDuration, // 30  (minutes)
      gapDuration:  s.gapDuration,  // 15  (minutes)
      isActive:     s.isActive,     // true | false
      selectedDays: s.selectedDays, // ["Mon","Tue","Wed","Thu","Fri"]
    })),
  };

  const response = await fetch('/api/admin/schedules', {
    method: 'POST',
    headers: {
      'Content-Type':  'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const errorBody = await response.json().catch(() => ({}));
    throw new Error(errorBody.message ?? `Request failed: ${response.status}`);
  }

  return response.json();
  // Expected response shape:
  // { schedules: [{ id: "db-uuid-1", startTime, endTime, ... }] }
};
