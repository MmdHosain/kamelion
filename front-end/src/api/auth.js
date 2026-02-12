import axios from 'axios';

const api = axios.create({
  baseURL: 'https://your-backend.com/api',
  withCredentials: true, // For httpOnly cookies
});

// Send OTP
export const sendOtp = async (phone, type) => {
  const res = await api.post('/auth/send-otp', { phone, type });
  return res.data;
};

// Verify OTP
export const verifyOtp = async (phone, code, type) => {
  const res = await api.post('/auth/verify-otp', { phone, code, type });
  return res.data; // { accessToken, refreshToken, user }
};

// Refresh token
export const refreshToken = async () => {
  const res = await api.post('/auth/refresh');
  return res.data;
};