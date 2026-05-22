import axios from 'axios';
import apiClient from '../lib/apiClient';

const BASE_URL = import.meta.env.VITE_API_URL || 'https://your-backend.com/api';

const authService = {
  // OTP Flow
  sendOtp: async (phone, type = 'login', name = null) => {
    const response = await axios.post(
      `${BASE_URL}/auth/send-otp`,
      { phone, type, name },
      { withCredentials: true }
    );
    return response.data;
  },

  verifyOtp: async (phone, code, type = 'login') => {
    const response = await axios.post(
      `${BASE_URL}/auth/verify-otp`,
      { phone, code, type },
      { withCredentials: true }
    );
    return response.data; // { user, accessToken, refreshToken }
  },

  // Token Management
  refreshToken: async (refreshToken) => {
    const response = await axios.post(
      `${BASE_URL}/auth/refresh`,
      { refreshToken },
      { withCredentials: true }
    );
    return response.data;
  },

  // Logout
  logout: async () => {
    try {
      await apiClient.post('/auth/logout');
    } catch (error) {
      console.error('Logout API error:', error);
    }
  },

  // Admin Login (if separate)
  adminLogin: async (username, password) => {
    const response = await axios.post(
      `${BASE_URL}/auth/admin/login`,
      { username, password },
      { withCredentials: true }
    );
    return response.data;
  },

  // Get Current User
  getCurrentUser: async () => {
    const response = await apiClient.get('/auth/me');
    return response.data;
  },
};

export default authService;
