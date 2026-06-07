import apiClient from '../lib/apiClient';

export const getAdminSlots = async () => {
  const response = await apiClient.get('/admin/slots/');
  return response.data;
};

export const createAdminSlot = async (payload) => {
  const response = await apiClient.post('/admin/slots/', payload);
  return response.data;
};

export const updateAdminSlot = async (id, payload) => {
  const response = await apiClient.put(`/admin/slots/${id}/`, payload);
  return response.data;
};

export const deleteAdminSlot = async (id) => {
  const response = await apiClient.delete(`/admin/slots/${id}/`);
  return response.data;
};

export const getAvailableSlots = async (date) => {
  const response = await apiClient.get('/appointments/slots/', {
    params: { date },
  });
  return response.data;
};

export const bookSlot = async (date, time, reason = '') => {
  const response = await apiClient.post('/appointments/book/', {
    date,
    time,
    reason,
  });
  return response.data;
};

export const bulkSaveAdminSlots = async (schedules) => {
  const payload = { schedules }; 
  const response = await apiClient.put('/admin/slots/bulk/', payload);
  return response.data;
};

export const getAdminExceptions = async () => {
  const response = await apiClient.get('/admin/exceptions/');
  return response.data;
};

export const bulkSaveAdminExceptions = async (exceptions) => {
  const payload = { exceptions };
  const response = await apiClient.put('/admin/exceptions/bulk/', payload);
  return response.data;
};

