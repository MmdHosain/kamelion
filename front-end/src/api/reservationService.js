import axios from "axios";

const API_BASE = "/api/appointments";

const setAuthHeader = (token) => ({
  headers: {
    Authorization: `Bearer ${token}`,
  },
});

export const createReservation = async (token, reservationData) => {
  const response = await axios.post(`${API_BASE}/book/`, reservationData, setAuthHeader(token));
  return response.data;
};

export const deleteReservation = async (token, reservationId) => {
  const response = await axios.post(`${API_BASE}/${reservationId}/cancel/`, {}, setAuthHeader(token));
  return response.data;
};

export const getMyReservations = async (token) => {
  const response = await axios.get(`${API_BASE}/my/`, setAuthHeader(token));
  return response.data;
};
