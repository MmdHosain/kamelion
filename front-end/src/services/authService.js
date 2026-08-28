import apiClient from '../lib/apiClient';

const normalizeAuthResponse = (data) => {
  const accessToken = data?.accessToken || data?.access || null;
  const refreshToken = data?.refreshToken || data?.refresh || null;
  const user = data?.user || null;

  return {
    ...data,
    user,
    accessToken,
    refreshToken,
  };
};

const USE_REQUEST_OTP_ENDPOINT = true;

const authService = {
  sendOtp: async (phone, type = 'login', name = null) => {
      const endpoint = USE_REQUEST_OTP_ENDPOINT ? '/auth/request-otp' : '/auth/send-otp';

      const response = await apiClient.post(endpoint, {
        phone_number: phone,
        type,
        name,
      });

      return response.data;
    },

  verifyOtp: async (phone, code, type = 'login') => {
      const response = await apiClient.post('/auth/verify-otp', {
        phone_number: phone,
        code,
        type,
      });

      return normalizeAuthResponse(response.data);
    },

  refreshToken: async (refreshToken) => {
    const response = await apiClient.post('/auth/refresh', {
      refreshToken,
    });

    return normalizeAuthResponse(response.data);
  },

  getCurrentUser: async () => {
    const response = await apiClient.get('/auth/me');
    return response.data;
  },

  logout: async () => {
    try {
      const response = await apiClient.post('/auth/logout');
      return response.data;
    } catch (error) {
      console.error('Logout API error:', error);
      return null;
    }
  },

  adminLogin: async (phone_number, password) => {
    const response = await apiClient.post('/auth/admin/login', {
      phone_number,
      password,
    });

    return normalizeAuthResponse(response.data);
  },
};

export default authService;
