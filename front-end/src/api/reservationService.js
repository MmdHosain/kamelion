import apiClient from '../lib/apiClient';

export const reservationService = {
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
};
