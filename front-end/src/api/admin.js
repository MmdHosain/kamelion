import apiClient from '../lib/apiClient';

export const adminApi = {
  getDashboardStats: async () => {
    const response = await apiClient.get('/admin/stats');
    return response.data;
  },

  getReservations: async (filters = {}) => {
    const response = await apiClient.get('/admin/reservations', { params: filters });
    return response.data;
  },

  updateReservation: async (id, data) => {
    const response = await apiClient.put(`/admin/reservations/${id}`, data);
    return response.data;
  },

  deleteReservation: async (id) => {
    const response = await apiClient.delete(`/admin/reservations/${id}`);
    return response.data;
  },

  getChatProfiles: async () => {
    const response = await apiClient.get('/admin/chat-profiles');
    return response.data;
  },
};
