import axios from "axios";

const API_BASE = "/api";
const setAuthHeader = (token) => ({
  headers: {
    Authorization: `Bearer ${token}`,
  },
});

// Fetch available slots for a specific date
export const getAvailableSlotsForDate = async (token, date) => {
  const response = await axios.get(`${API_BASE}/appointments/slots/`, {
    ...setAuthHeader(token),
    params: { date },
  });

  // Normalize backend data => frontend expected format
  const backendData = response.data;
  if (!backendData || !backendData.available_slots) return [];
  return backendData.available_slots.map((time) => ({
    time,
    status: "available",
  }));
};

// Fetch schedules (if admin or public)
export const fetchSchedules = async () => {
  const response = await axios.get(`${API_BASE}/schedules/`);
  return response.data;
};

// Save schedules (admin only)
export const saveSchedules = async (token, scheduleData) => {
  const response = await axios.post(`${API_BASE}/admin/schedules/`, scheduleData, setAuthHeader(token));
  return response.data;
};
