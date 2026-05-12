// src/api/schedules.js

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000';

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

  const response = await fetch(`${API_BASE_URL}/api/admin/schedules`, {
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

/**
 * fetchSchedules
 *
 * Fetches all schedule configurations (public endpoint, no auth required)
 *
 * @returns {Promise<{ schedules: Array }>}
 */
export const fetchSchedules = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/schedules`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      throw new Error('Failed to fetch schedules');
    }

    return await response.json();
  } catch (error) {
    console.error('Error fetching schedules:', error);
    throw error;
  }
};

/**
 * getAvailableSlotsForDate
 *
 * Fetches available time slots for a specific date
 *
 * @param {Date} date - The date to fetch slots for
 * @returns {Promise<Array<{ time: string, status: string }>>}
 */
export const getAvailableSlotsForDate = async (date) => {
  try {
    const dateStr = date.toISOString().split('T')[0];
    
    const response = await fetch(`${API_BASE_URL}/api/schedules/available-slots?date=${dateStr}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      throw new Error('Failed to fetch available slots');
    }

    const data = await response.json();
    return data.slots || [];
    
  } catch (error) {
    console.error('Error fetching available slots:', error);
    return getMockSlotsForDate(date);
  }
};

/**
 * getMockSlotsForDate (internal fallback)
 *
 * Returns mock slot data when backend is unavailable
 *
 * @param {Date} date
 * @returns {Array<{ time: string, status: string }>}
 */
const getMockSlotsForDate = (date) => {
  const dayOfWeek = date.getDay();
  
  const mockSlotsData = {
    0: [], // Sunday
    1: [ // Monday
      { time: '09:00', status: 'available' },
      { time: '09:30', status: 'available' },
      { time: '10:00', status: 'pending' },
      { time: '10:30', status: 'available' },
      { time: '11:00', status: 'reserved' },
      { time: '14:00', status: 'available' },
      { time: '14:30', status: 'available' },
      { time: '15:00', status: 'available' },
    ],
    2: [ // Tuesday
      { time: '10:00', status: 'available' },
      { time: '10:30', status: 'available' },
      { time: '11:00', status: 'available' },
      { time: '14:00', status: 'available' },
      { time: '14:30', status: 'pending' },
      { time: '15:00', status: 'available' },
    ],
    3: [ // Wednesday
      { time: '09:00', status: 'available' },
      { time: '09:30', status: 'available' },
      { time: '14:00', status: 'available' },
      { time: '14:30', status: 'available' },
      { time: '15:00', status: 'pending' },
      { time: '15:30', status: 'available' },
    ],
    4: [ // Thursday
      { time: '09:00', status: 'available' },
      { time: '09:30', status: 'pending' },
      { time: '10:00', status: 'available' },
      { time: '10:30', status: 'available' },
      { time: '14:00', status: 'available' },
    ],
    5: [ // Friday
      { time: '11:00', status: 'available' },
      { time: '11:30', status: 'available' },
      { time: '14:00', status: 'reserved' },
      { time: '14:30', status: 'available' },
      { time: '15:00', status: 'available' },
    ],
    6: [], // Saturday
  };

  return mockSlotsData[dayOfWeek] || [];
};
