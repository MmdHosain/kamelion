import React, { createContext, useState, useEffect, useContext } from 'react';
import { sendOtp, verifyOtp } from '../api/auth';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [accessToken, setAccessToken] = useState(null);
  const [authFlow, setAuthFlow] = useState(null); // 'login' or 'signup'
  const [phoneNumber, setPhoneNumber] = useState('');
  const [otpOpen, setOtpOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // NEW: Auth modal state for appointment flow
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authModalCallback, setAuthModalCallback] = useState(null);

  // Restore auth from sessionStorage
  useEffect(() => {
    const savedAuth = sessionStorage.getItem('auth');
    if (savedAuth) {
      try {
        const { user, accessToken } = JSON.parse(savedAuth);
        setUser(user);
        setAccessToken(accessToken);
      } catch (err) {
        console.error('Failed to restore auth:', err);
      }
    }
  }, []);

  // Save auth to sessionStorage
  const saveAuth = (data) => {
    setUser(data.user);
    setAccessToken(data.accessToken);
    sessionStorage.setItem('auth', JSON.stringify({
      user: data.user,
      accessToken: data.accessToken,
    }));
  };

  // Handle OTP request (existing flow for LoginModal/SignupModal)
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

  // Handle OTP verification (existing flow)
  const handleVerifyOtp = async (code) => {
    setLoading(true);
    setError(null);
    try {
      const data = await verifyOtp(phoneNumber, code, authFlow);
      saveAuth(data);
      setOtpOpen(false);
      setAuthFlow(null);
    } catch (err) {
      setError(err.response?.data?.message || 'کد تایید اشتباه است');
    } finally {
      setLoading(false);
    }
  };

  // Simple login (placeholder)
  const login = (userData) => {
    saveAuth({ user: userData, accessToken: null });
  };

  // Logout
  const logout = () => {
    setUser(null);
    setAccessToken(null);
    setAuthFlow(null);
    setPhoneNumber('');
    sessionStorage.removeItem('auth');
  };

  // NEW: Require authentication before action
  const requireAuth = (callback) => {
    if (user) {
      // Already authenticated, execute callback immediately
      callback();
    } else {
      // Not authenticated, open auth modal and store callback
      setAuthModalCallback(() => callback);
      setAuthModalOpen(true);
    }
  };

  // NEW: Handle successful authentication from AuthModal
  const handleAuthSuccess = (authData) => {
    saveAuth(authData);
    setAuthModalOpen(false);
    
    // Execute stored callback if exists
    if (authModalCallback) {
      authModalCallback();
      setAuthModalCallback(null);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        accessToken,
        authFlow,
        phoneNumber,
        otpOpen,
        loading,
        error,
        authModalOpen,
        setAuthModalOpen,
        handleAuthSubmit,
        handleVerifyOtp,
        setOtpOpen,
        login,
        logout,
        requireAuth,
        handleAuthSuccess,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};
