import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { sendOtp, verifyOtp } from '../api/auth';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [accessToken, setAccessToken] = useState(null);
  const [authFlow, setAuthFlow] = useState(null);
  const [phoneNumber, setPhoneNumber] = useState('');
  const [otpOpen, setOtpOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const saved = sessionStorage.getItem('auth');
    if (saved) {
      const { user, accessToken } = JSON.parse(saved);
      setUser(user);
      setAccessToken(accessToken);
    }
  }, []);

  const saveAuth = (data) => {
    setUser(data.user);
    setAccessToken(data.accessToken || null);
    sessionStorage.setItem(
      'auth',
      JSON.stringify({
        user: data.user,
        accessToken: data.accessToken || null,
      })
    );
  };

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

  const login = async (userData) => {
    setLoading(true);
    setError(null);
    try {
      saveAuth({
        user: userData,
        accessToken: null,
      });
    } catch (err) {
      setError('Login failed');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    setAccessToken(null);
    setAuthFlow(null);
    setPhoneNumber('');
    setOtpOpen(false);
    sessionStorage.removeItem('auth');
  };

  const value = useMemo(
    () => ({
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
      login,
      logout,
    }),
    [
      user,
      accessToken,
      authFlow,
      phoneNumber,
      otpOpen,
      loading,
      error,
    ]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider');
  return ctx;
};
