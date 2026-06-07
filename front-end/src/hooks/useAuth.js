import { useState } from 'react';
import useAuthStore from '../store/authStore';
import authService from '../services/authService';

export const useAuth = () => {
  const {
    user,
    accessToken,
    refreshToken,
    isAuthenticated,
    authModalOpen,
    otpModalOpen,
    authStep,
    tempAuthData,
    openAuthModal,
    closeAuthModal,
    setAuthStep,
    setOtpModalOpen,
    setTempAuthData,
    login: storeLogin,
    logout: storeLogout,
  } = useAuthStore();

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleAuthSubmit = async (...args) => {
    setError('');
    setLoading(true);

    try {
      let phone = '';
      let name = '';
      let type = 'login';

      // پشتیبانی از امضای قدیمی:
      // (phone, 'login')
      // (phone, name, 'signup')
      if (args.length === 2) {
        [phone, type] = args;
      } else if (args.length === 3) {
        [phone, name, type] = args;
      } else if (args.length === 1 && typeof args[0] === 'object') {
        phone = args[0]?.phone || '';
        name = args[0]?.name || '';
        type = args[0]?.type || 'login';
      }

      const response = await authService.sendOtp(phone, type, name || null);

      setTempAuthData({
        phone,
        name,
        type,
        otpSession: response?.otpSession || response?.otp_session || null,
      });

      // برای AuthModal جدید
      if (typeof setAuthStep === 'function') {
        setAuthStep('otp');
      }

      // برای سازگاری با state قدیمی
      if (typeof setOtpModalOpen === 'function') {
        setOtpModalOpen(true);
      }

      return response;
    } catch (err) {
      setError(err?.response?.data?.message || 'خطا در ارسال کد تایید');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (code) => {
    if (!tempAuthData?.phone) {
      setError('شماره موبایل یافت نشد');
      return;
    }

    setError('');
    setLoading(true);

    try {
      const response = await authService.verifyOtp(
        tempAuthData.phone,
        code,
        tempAuthData.type || 'login'
      );

      // اگر بک‌اند user را نداد، تلاش کن از /auth/me بگیری
      let resolvedUser = response.user;

      if (!resolvedUser && response.accessToken) {
        try {
          // موقتاً token را ذخیره کن تا /me کار کند
          if (typeof useAuthStore.getState().setTokens === 'function') {
            useAuthStore.getState().setTokens(response.accessToken, response.refreshToken);
          }

          resolvedUser = await authService.getCurrentUser();
        } catch (meError) {
          console.warn('Could not fetch current user after OTP verify:', meError);
        }
      }

      storeLogin(resolvedUser, {
        accessToken: response.accessToken,
        refreshToken: response.refreshToken,
      });

      if (typeof setOtpModalOpen === 'function') {
        setOtpModalOpen(false);
      }

      closeAuthModal();

      return {
        ...response,
        user: resolvedUser,
      };
    } catch (err) {
      setError(err?.response?.data?.message || 'کد تایید نامعتبر است');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    setLoading(true);
    try {
      await authService.logout();
    } finally {
      await storeLogout();
      setLoading(false);
    }
  };

  const adminLogin = async (phone_number, password) => {
    setError('');
    setLoading(true);

    try {
      const response = await authService.adminLogin(phone_number, password);

      let resolvedUser = response.user;

      if (!resolvedUser && response.accessToken) {
        try {
          if (typeof useAuthStore.getState().setTokens === 'function') {
            useAuthStore.getState().setTokens(response.accessToken, response.refreshToken);
          }

          resolvedUser = await authService.getCurrentUser();
        } catch (meError) {
          console.warn('Could not fetch current user after admin login:', meError);
        }
      }

      storeLogin(resolvedUser, {
        accessToken: response.accessToken,
        refreshToken: response.refreshToken,
      });

      return {
        ...response,
        user: resolvedUser,
      };
    } catch (err) {
const msg =
  err?.response?.data?.detail ||
  err?.response?.data?.message ||
  'Admin login failed';
      setError(msg);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return {
    user,
    accessToken,
    refreshToken,
    isAuthenticated,
    authModalOpen,
    authStep,
    phoneNumber: tempAuthData?.phone || '',
    otpOpen: otpModalOpen,
    loading,
    error,
    tempAuthData,

    setAuthModalOpen: (open) => {
      if (open) openAuthModal();
      else closeAuthModal();
    },

    setOtpOpen: setOtpModalOpen,
    openAuthModal,
    closeAuthModal,
    handleAuthSubmit,
    handleVerifyOtp,
    logout,
    adminLogin,
  };
};
