import { useState, useEffect } from 'react';
import { sendOtp, verifyOtp } from '../api/auth';

export const useAuth = () => {
  const [user, setUser] = useState(null);
  const [accessToken, setAccessToken] = useState(null);
  const [authFlow, setAuthFlow] = useState(null); // 'login' | 'signup' | null
  const [phoneNumber, setPhoneNumber] = useState('');
  const [otpOpen, setOtpOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Load from memory (NOT localStorage for security)
  useEffect(() => {
    const saved = sessionStorage.getItem('auth');
    if (saved) {
      const { user, accessToken } = JSON.parse(saved);
      setUser(user);
      setAccessToken(accessToken);
    }
  }, []);

  // Save to memory only
  const saveAuth = (data) => {
    setUser(data.user);
    setAccessToken(data.accessToken);
    sessionStorage.setItem('auth', JSON.stringify({
      user: data.user,
      accessToken: data.accessToken
    }));
  };

  // Send OTP
  const handleAuthSubmit = async (phone, flow) => {
    setLoading(true);
    setError(null);
    try {
      await sendOtp(phone, flow);
      setPhoneNumber(phone);
      setAuthFlow(flow);
      setOtpOpen(true);
    } catch (err) {
      setError(err.response?.data?.message || 'خطا در ارسال کد');
    } finally {
      setLoading(false);
    }
  };

  // Verify OTP
  const handleVerifyOtp = async (code) => {
    setLoading(true);
    setError(null);
    try {
      const data = await verifyOtp(phoneNumber, code, authFlow);
      saveAuth(data);
      setOtpOpen(false);
      setAuthFlow(null);
    } catch (err) {
      setError(err.response?.data?.message || 'کد اشتباه است');
    } finally {
      setLoading(false);
    }
  };

  // Logout
  const logout = () => {
    setUser(null);
    setAccessToken(null);
    sessionStorage.removeItem('auth');
  };

  return {
    user,
    accessToken,
    authFlow,
    phoneNumber,
    otpOpen,
    loading,
    error,
    handleAuthSubmit,
    handleVerifyOtp,
    setOtpOpen,
    logout,
  };
};