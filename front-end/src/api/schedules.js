import apiClient from '../lib/apiClient';

export const getAvailableSlots = async (date) => {
  const response = await apiClient.get('/schedules/available', {
    params: { date },
  });
  return response.data;
};

export const bookSlot = async (slotId, userData) => {
  const response = await apiClient.post('/schedules/book', {
    slotId,
    ...userData,
  });
  return response.data;
};
