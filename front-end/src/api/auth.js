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

// NEW: Mock function for appointment booking flow (frontend testing)
export const requestOtp = async (phone, name) => {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 800));
  
  // Basic validation
  if (!phone || phone.length < 10) {
    throw new Error('شماره تلفن معتبر نیست');
  }
  
  if (!name || name.trim().length < 2) {
    throw new Error('نام معتبر نیست');
  }
  
  // Mock success response
  return {
    success: true,
    message: 'کد تایید ارسال شد',
  };
};

// NEW: Mock OTP verification for appointment flow
export const verifyOtpCode = async (phone, code) => {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  // Hardcoded OTP for frontend testing
  if (code !== '123456') {
    throw new Error('کد تایید اشتباه است');
  }
  
  // Mock successful auth response
  return {
    accessToken: 'mock_access_token_' + Date.now(),
    refreshToken: 'mock_refresh_token_' + Date.now(),
    user: {
      id: Date.now(),
      name: 'کاربر تست',
      phone: phone,
    },
  };
};
