// src/components/ui/AuthModal.jsx

import { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import useAuthStore from '../../store/authStore';
import { useAuth } from '../../hooks/useAuth';

const AuthModal = () => {
  const {
    authModalOpen,
    authStep,
    tempAuthData,
    closeAuthModal,
  } = useAuthStore();

  const {
    handleAuthSubmit,
    handleVerifyOtp,
    loading,
    error,
  } = useAuth();

  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    otp: '',
  });

  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (!authModalOpen) {
      setFormData({ name: '', phone: '', otp: '' });
      setErrors({});
    }
  }, [authModalOpen]);

  const validateInfo = () => {
    const newErrors = {};

    if (!formData.name || formData.name.trim().length < 2) {
      newErrors.name = 'نام باید حداقل ۲ کاراکتر باشد';
    }

    if (!formData.phone || formData.phone.trim().length < 10) {
      newErrors.phone = 'شماره تلفن معتبر نیست';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateOtp = () => {
    const newErrors = {};

    if (!formData.otp || formData.otp.length !== 6) {
      newErrors.otp = 'کد تایید باید ۶ رقم باشد';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInfoSubmit = async (e) => {
    e.preventDefault();

    if (!validateInfo()) return;

    setErrors({});

    try {
      await handleAuthSubmit(formData.phone, formData.name, 'login');
    } catch (err) {
      setErrors({
        submit:
          err?.response?.data?.message ||
          err?.response?.data?.detail ||
          'خطا در ارسال کد',
      });
    }
  };

  const handleOtpSubmit = async (e) => {
    e.preventDefault();

    if (!validateOtp()) return;

    setErrors({});

    try {
      await handleVerifyOtp(formData.otp);
    } catch (err) {
      setErrors({
        otp:
          err?.response?.data?.message ||
          err?.response?.data?.detail ||
          'کد تایید نامعتبر است',
      });
    }
  };

  const handleResendOtp = async () => {
    if (!tempAuthData?.phone) return;

    setErrors({});

    try {
      await handleAuthSubmit(
        tempAuthData.phone,
        tempAuthData.name || formData.name || '',
        tempAuthData.type || 'login'
      );
    } catch (err) {
      setErrors({
        otp:
          err?.response?.data?.message ||
          err?.response?.data?.detail ||
          'خطا در ارسال مجدد کد',
      });
    }
  };

  if (!authModalOpen) return null;

  return (
    <div className="fixed inset-0 z-[10000] flex items-center justify-center bg-black/70 backdrop-blur-sm">
      <div className="relative w-full max-w-md bg-gray-900 rounded-2xl p-8 shadow-2xl mx-4">
        <button
          type="button"
          onClick={closeAuthModal}
          className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors"
        >
          <X size={24} />
        </button>

        {authStep === 'info' && (
          <form onSubmit={handleInfoSubmit} className="space-y-6">
            <h2 className="text-2xl font-bold text-white text-center">
              ورود / ثبت‌نام
            </h2>

            <div>
              <input
                type="text"
                placeholder="نام و نام خانوادگی"
                value={formData.name}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, name: e.target.value }))
                }
                className="w-full px-4 py-3 bg-gray-800 text-white rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
              />
              {errors.name && (
                <p className="text-red-500 text-sm mt-1">{errors.name}</p>
              )}
            </div>

            <div>
              <input
                type="tel"
                placeholder="شماره موبایل"
                value={formData.phone}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, phone: e.target.value }))
                }
                className="w-full px-4 py-3 bg-gray-800 text-white rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
              />
              {errors.phone && (
                <p className="text-red-500 text-sm mt-1">{errors.phone}</p>
              )}
            </div>

            {(errors.submit || error) && (
              <p className="text-red-500 text-sm">{errors.submit || error}</p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold transition-colors disabled:opacity-50"
            >
              {loading ? 'در حال ارسال...' : 'ارسال کد تایید'}
            </button>
          </form>
        )}

        {authStep === 'otp' && (
          <form onSubmit={handleOtpSubmit} className="space-y-6">
            <h2 className="text-2xl font-bold text-white text-center">
              کد تایید
            </h2>

            <p className="text-gray-400 text-center">
              کد ارسال شده به {tempAuthData?.phone} را وارد کنید
            </p>

            <div>
              <input
                type="text"
                placeholder="کد ۶ رقمی"
                maxLength={6}
                value={formData.otp}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    otp: e.target.value.replace(/\D/g, ''),
                  }))
                }
                className="w-full px-4 py-3 bg-gray-800 text-white rounded-lg text-center text-2xl tracking-widest focus:ring-2 focus:ring-blue-500 outline-none"
              />
              {errors.otp && (
                <p className="text-red-500 text-sm mt-1 text-center">
                  {errors.otp}
                </p>
              )}
            </div>

            {error && (
              <p className="text-red-500 text-sm text-center">{error}</p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold transition-colors disabled:opacity-50"
            >
              {loading ? 'در حال تایید...' : 'تایید'}
            </button>

            <button
              type="button"
              onClick={handleResendOtp}
              disabled={loading}
              className="text-sm text-blue-400 hover:underline w-full text-center disabled:opacity-50"
            >
              ارسال مجدد کد
            </button>
          </form>
        )}

        {authStep === 'success' && (
          <div className="text-center space-y-4">
            <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mx-auto">
              <svg
                className="w-8 h-8 text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 13l4 4L19 7"
                />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-white">ورود موفق!</h2>
          </div>
        )}
      </div>
    </div>
  );
};

export default AuthModal;
