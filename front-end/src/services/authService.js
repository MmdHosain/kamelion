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

const authService = {
  requestOtp: async (phone) => {
    const response = await apiClient.post('/auth/request-otp', {
      phone_number: phone,
    });

    return response.data;
  },

  sendOtp: async (phone) => {
    return authService.requestOtp(phone);
  },

  verifyOtp: async (phone, code) => {
    const response = await apiClient.post('/auth/verify-otp', {
      phone_number: phone,
      code,
    });

    return normalizeAuthResponse(response.data);
  },

  completeRegistration: async (signup_token, full_name, national_id, date_of_birth) => {
    let payload = {};
    if (typeof signup_token === 'object' && signup_token !== null) {
      payload = { ...signup_token };
    } else {
      payload = {
        signup_token,
        full_name,
        national_id,
        ...(date_of_birth ? { date_of_birth } : {}),
      };
    }

    const response = await apiClient.post('/auth/complete-registration', payload);

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
    } catch {
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
