import apiClient from '../lib/apiClient';

export const reservationService = {
  // Existing reservation-style endpoints.
  // Keep these only if other parts of your app still use /reservations.
  createReservation: async (data) => {
    const response = await apiClient.post('/reservations', data);
    return response.data;
  },

  getUserReservations: async () => {
    const response = await apiClient.get('/reservations/user');
    return response.data;
  },

  cancelReservation: async (id) => {
    const response = await apiClient.delete(`/reservations/${id}`);
    return response.data;
  },

  // Real appointment availability endpoint.
  getAvailableSlots: async (date) => {
    const response = await apiClient.get('/appointments/slots/', {
      params: { date },
    });
    return response.data;
  },

  // Real appointment booking endpoint.
  bookSlot: async (date, time, reason = '') => {
    const response = await apiClient.post('/appointments/book/', {
      date,
      time,
      reason,
    });
    return response.data;
  },
};

// Named exports for convenient imports.
export const getAvailableSlots = reservationService.getAvailableSlots;
export const bookSlot = reservationService.bookSlot;
