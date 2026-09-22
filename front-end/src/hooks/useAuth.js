import { useState } from 'react';
import useAuthStore from '../store/authStore';
import authService from '../services/authService';

const toEnglishDigits = (str) => {
  if (!str) return '';
  return String(str)
    .replace(/[۰-۹]/g, (d) => '۰۱۲۳۴۵۶۷۸۹'.indexOf(d))
    .replace(/[٠-٩]/g, (d) => '٠١٢٣۴٥٦٧٨٩'.indexOf(d));
};

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

  const handleAuthSubmit = async (phoneInput) => {
    setError('');
    setLoading(true);

    try {
      const rawPhone = typeof phoneInput === 'object' ? phoneInput?.phone : phoneInput;
      const cleanPhone = toEnglishDigits(rawPhone).replace(/\D/g, '').trim();

      const response = await authService.requestOtp(cleanPhone);

      const isAdmin = Boolean(response?.is_admin);

      setTempAuthData({
        phone: cleanPhone,
        isAdmin,
      });

      if (isAdmin) {
        setAuthStep('credentials');
      } else {
        setAuthStep('otp');
        setOtpModalOpen(true);
      }

      return response;
    } catch (err) {
      const msg =
        err?.response?.data?.error ||
        err?.response?.data?.message ||
        err?.response?.data?.detail ||
        'خطا در ارسال کد تایید';
      setError(msg);
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
      const cleanCode = String(code || '').trim();
      const response = await authService.verifyOtp(tempAuthData.phone, cleanCode);

      // New user needing full name and national id
      if (response?.registration_required) {
        setTempAuthData({
          ...tempAuthData,
          signupToken: response.signup_token,
        });
        setAuthStep('register');
        return {
          registrationRequired: true,
          signupToken: response.signup_token,
        };
      }

      // Existing user: logged straight in
      let resolvedUser = response.user;

      if (!resolvedUser && response.accessToken) {
        try {
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

      setAuthStep('success');

      return {
        registrationRequired: false,
        user: resolvedUser,
        ...response,
      };
    } catch (err) {
      const msg =
        err?.response?.data?.error ||
        err?.response?.data?.message ||
        err?.response?.data?.detail ||
        'کد تایید نامعتبر یا منقضی شده است';
      setError(msg);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const handleCompleteRegistration = async (fullName, nationalId) => {
    const signupToken = tempAuthData?.signupToken;
    if (!signupToken) {
      setError('نشست ثبت‌نام منقضی شده است. لطفاً مجدداً شماره خود را وارد کنید.');
      return;
    }

    setError('');
    setLoading(true);

    try {
      const response = await authService.completeRegistration(
        signupToken,
        fullName.trim(),
        nationalId.trim()
      );

      let resolvedUser = response.user;

      if (!resolvedUser && response.accessToken) {
        try {
          if (typeof useAuthStore.getState().setTokens === 'function') {
            useAuthStore.getState().setTokens(response.accessToken, response.refreshToken);
          }
          resolvedUser = await authService.getCurrentUser();
        } catch (meError) {
          console.warn('Could not fetch current user after complete registration:', meError);
        }
      }

      storeLogin(resolvedUser, {
        accessToken: response.accessToken,
        refreshToken: response.refreshToken,
      });

      setAuthStep('success');

      return {
        user: resolvedUser,
        ...response,
      };
    } catch (err) {
      const msg =
        err?.response?.data?.error ||
        err?.response?.data?.message ||
        err?.response?.data?.detail ||
        'خطا در تکمیل ثبت‌نام';
      setError(msg);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const adminLogin = async (phoneNumber, password) => {
    setError('');
    setLoading(true);

    try {
      const cleanPhone = toEnglishDigits(phoneNumber).replace(/\D/g, '').trim();
      const response = await authService.adminLogin(cleanPhone, password);

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

      setAuthStep('success');

      return {
        ...response,
        user: resolvedUser,
      };
    } catch (err) {
      const msg =
        err?.response?.data?.detail ||
        err?.response?.data?.error ||
        err?.response?.data?.message ||
        'ورود با نام کاربری یا کلمه عبور وارد شده امکان‌پذیر نیست';
      setError(msg);
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
      storeLogout();
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
    setError,
    tempAuthData,

    setAuthModalOpen: (open) => {
      if (open) openAuthModal();
      else closeAuthModal();
    },

    setOtpOpen: setOtpModalOpen,
    openAuthModal,
    closeAuthModal,
    setAuthStep,
    handleAuthSubmit,
    handleVerifyOtp,
    handleCompleteRegistration,
    logout,
    adminLogin,
  };
};
