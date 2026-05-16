import axios from "axios";

const API_BASE = "/api/auth";

const setAuthHeader = (token) => ({
  headers: {
    Authorization: `Bearer ${token}`,
  },
});

export const loginUser = async (credentials) => {
  const response = await axios.post(`${API_BASE}/login/`, credentials);
  return response.data;
};

export const registerUser = async (userData) => {
  const response = await axios.post(`${API_BASE}/register/`, userData);
  return response.data;
};

export const fetchUserProfile = async (token) => {
  const response = await axios.get(`${API_BASE}/profile/`, setAuthHeader(token));
  return response.data;
};

export const updateUserProfile = async (token, updatedData) => {
  const response = await axios.put(`${API_BASE}/profile/update/`, updatedData, setAuthHeader(token));
  return response.data;
};

export const refreshToken = async (token) => {
  const response = await axios.post(`${API_BASE}/refresh/`, {}, setAuthHeader(token));
  return response.data;
};

export const sendOtp = async (phoneNumber) => {
  const response = await axios.post(`${API_BASE}/send-otp/`, { phone_number: phoneNumber });
  return response.data;
};

export const verifyOtp = async (phoneNumber, otp) => {
  const response = await axios.post(`${API_BASE}/verify-otp/`, { 
    phone_number: phoneNumber, 
    otp: otp 
  });
  return response.data;
};
