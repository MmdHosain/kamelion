import apiClient from '../lib/apiClient';

import { cleanNextUrl } from './reservationService';

const extractResults = (data) => {
  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.results)) return data.results;
  return [];
};

export const adminApi = {
  getDashboardStats: async () => {
    try {
      const response = await apiClient.get('/admin/stats');
      return response.data;
    } catch {
      return null;
    }
  },

  getReservations: async (filters = {}) => {
    const response = await apiClient.get('/admin/appointments/', { params: filters });
    return response.data;
  },

  getReservedTimes: async () => {
    let nextUrl = '/admin/appointments/';
    const items = [];
    while (nextUrl) {
      const response = await apiClient.get(nextUrl);
      const data = response.data;
      items.push(...extractResults(data));
      nextUrl = cleanNextUrl(data?.next);
    }
    return items;
  },

  updateReservation: async (id, data) => {
    const response = await apiClient.put(`/admin/appointments/${id}/`, data);
    return response.data;
  },

  approveReservation: async (id) => {
    const response = await apiClient.post(`/admin/appointments/${id}/approve/`);
    return response.data;
  },

  approveAppointment: async (id) => {
    const response = await apiClient.post(`/admin/appointments/${id}/approve/`);
    return response.data;
  },

  disapproveReservation: async (id) => {
    const response = await apiClient.post(`/admin/appointments/${id}/disapprove/`);
    return response.data;
  },

  disapproveAppointment: async (id) => {
    const response = await apiClient.post(`/admin/appointments/${id}/disapprove/`);
    return response.data;
  },

  deleteReservation: async (id) => {
    const response = await apiClient.delete(`/admin/appointments/${id}/`);
    return response.data;
  },

  getPatientByPhone: async (phoneNumber) => {
    if (!phoneNumber) return null;
    try {
      const cleanPhone = String(phoneNumber).replace(/\s+/g, '');
      const response = await apiClient.get('/admin/patients/', {
        params: { search: cleanPhone },
      });
      const results = extractResults(response.data);
      if (Array.isArray(results) && results.length > 0) {
        // Find exact match or first result
        const exact = results.find(
          (p) => String(p.phone_number).replace(/\s+/g, '') === cleanPhone
        );
        return exact || results[0];
      }
      return null;
    } catch {
      return null;
    }
  },

  getChatProfiles: async () => {
    try {
      const response = await apiClient.get('/admin/chat-profiles');
      return extractResults(response.data);
    } catch {
      return [];
    }
  },

  getPatients: async (params = {}) => {
    try {
      const response = await apiClient.get('/admin/patients/', { params });
      return extractResults(response.data);
    } catch {
      return [];
    }
  },

  getPatientDetail: async (patientId) => {
    const response = await apiClient.get(`/admin/patients/${patientId}/`);
    return response.data;
  },

  addPatientNote: async (patientId, text) => {
    const response = await apiClient.post(`/admin/patients/${patientId}/notes/`, {
      text,
      note: text,
    });
    return response.data;
  },
};

