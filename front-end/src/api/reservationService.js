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
  getAdminReservations: async (params = {}) => {
    let nextUrl = '/admin/appointments/';
    const items = [];
    let isFirst = true;

    while (nextUrl) {
      const response = await apiClient.get(nextUrl, isFirst && Object.keys(params).length ? { params } : undefined);
      const data = response.data;
      items.push(...extractResults(data));
      nextUrl = data?.next || null;
      isFirst = false;
    }
    return items;
  },

  approveReservation: async (id) => {
    const response = await apiClient.post(`/admin/appointments/${id}/approve/`);
    return response.data;
  },

  disapproveReservation: async (id) => {
    const response = await apiClient.post(`/admin/appointments/${id}/disapprove/`);
    return response.data;
  },

  createAdminReservation: async (payload) => {
    const response = await apiClient.post('/admin/appointments/', payload);
    return response.data;
  },
};

// Named exports
export const getAvailableSlots = (date) => reservationService.getAvailableSlots(date);
export const bookSlot = (date, time, reason) => reservationService.bookSlot(date, time, reason);
export const getUserReservations = () => reservationService.getUserReservations();
export const cancelReservation = (id) => reservationService.cancelReservation(id);
export const approveReservation = (id) => reservationService.approveReservation(id);
export const disapproveReservation = (id) => reservationService.disapproveReservation(id);
export const getAdminReservations = (params) => reservationService.getAdminReservations(params);
export const createAdminReservation = (payload) => reservationService.createAdminReservation(payload);
