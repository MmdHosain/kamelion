import apiClient from '../lib/apiClient';

const extractResults = (data) => {
  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.results)) return data.results;
  return [];
};

export const reservationService = {
  // USER ENDPOINTS
  getAvailableSlots: async (date) => {
    // Matches Backend: path("api/appointments/", include("apps.appointments.urls")) 
    // + path("slots/", AvailableSlotsView.as_view())
    const response = await apiClient.get(`/appointments/slots/?date=${date}`);
    return response.data; // AppointmentModal.jsx handles normalization
  },

  bookSlot: async (date, time, reason = '') => {
    // Matches Backend: path("book/", BookAppointmentView.as_view())
    const response = await apiClient.post('/appointments/book/', {
      date,
      time,
      reason
    });
    return response.data;
  },

  getUserReservations: async () => {
    const response = await apiClient.get('/appointments/my/');
    return response.data;
  },

  cancelReservation: async (id) => {
    const response = await apiClient.post(`/appointments/${id}/cancel/`);
    return response.data;
  },

  // ADMIN ENDPOINTS
  getAdminReservations: async () => {
    let nextUrl = '/admin/appointments/';
    const items = [];
    while (nextUrl) {
      const response = await apiClient.get(nextUrl);
      const data = response.data;
      items.push(...extractResults(data));
      nextUrl = data?.next || null;
    }
    return items;
  },

  createAdminReservation: async (payload) => {
    const response = await apiClient.post('/admin/appointments/', payload);
    return response.data;
  },
};

// Named exports
export const getAvailableSlots = (date) => reservationService.getAvailableSlots(date);
export const bookSlot = (date, time, reason) => reservationService.bookSlot(date, time, reason);
