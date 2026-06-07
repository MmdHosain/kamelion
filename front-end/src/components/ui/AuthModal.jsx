import { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import useAuthStore from '../../store/authStore';
import authService from '../../services/authService';

const AuthModal = () => {
  const {
    authModalOpen,
    authStep,
    tempAuthData,
    closeAuthModal,
    setAuthStep,
    setTempAuthData,
    login
  } = useAuthStore();

  const [formData, setFormData] = useState({ name: '', phone: '', otp: '' });
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!authModalOpen) {
      setFormData({ name: '', phone: '', otp: '' });
      setErrors({});
      setAuthStep('info');
    }
  }, [authModalOpen, setAuthStep]);

  const validateInfo = () => {
    const newErrors = {};
    if (!formData.name || formData.name.length < 2) {
      newErrors.name = 'نام باید حداقل ۲ کاراکتر باشد';
    }
    if (!formData.phone || formData.phone.length < 10) {
      newErrors.phone = 'شماره تلفن معتبر نیست';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateOtp = () => {
    if (!formData.otp || formData.otp.length !== 6) {
      setErrors({ otp: 'کد تایید باید ۶ رقم باشد' });
      return false;
    }
    setErrors({});
    return true;
  };

  const handleInfoSubmit = async (e) => {
    e.preventDefault();
    if (!validateInfo()) return;

    setIsSubmitting(true);
    try {
      await authService.sendOtp(formData.phone, 'login', formData.name);
      setTempAuthData({ phone: formData.phone, name: formData.name });
      setAuthStep('otp');
    } catch (error) {
      setErrors({ submit: error.response?.data?.message || 'خطا در ارسال کد' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleOtpSubmit = async (e) => {
    e.preventDefault();
    if (!validateOtp()) return;

    setIsSubmitting(true);
    try {
      // ۱. تایید کد و دریافت توکن‌ها
      const tokens = await authService.verifyOtp(tempAuthData.phone, formData.otp);
      
      // ۲. ذخیره موقت توکن برای گرفتن پروفایل
      // فرض: در store متدی مثل setTokens داری
      useAuthStore.getState().setTokens(tokens.accessToken, tokens.refreshToken);

      // ۳. گرفتن دیتای کاربر
      const user = await authService.getCurrentUser();

      // ۴. لاگین نهایی در استور
      login(user, tokens);

      setAuthStep('success');
      setTimeout(() => closeAuthModal(), 1500);
    } catch (error) {
      setErrors({ otp: 'کد تایید نامعتبر است' });
    } finally {
      setIsSubmitting(false);
    }
  };

  // داخل AuthModal.jsx، این متد را اضافه کن
  const handleResendOtp = async () => {
    setIsSubmitting(true);
    try {
      await authService.sendOtp(tempAuthData.phone, 'login', tempAuthData.name);
      // اینجا می‌تونی یک Toast یا Notification هم بگذاری
    } catch (error) {
      setErrors({ otp: 'خطا در ارسال مجدد کد' });
    } finally {
      setIsSubmitting(false);
    }
  };

  // و در بخش JSX مربوط به authStep === 'otp'، دکمه را اضافه کن:
  {
    authStep === 'otp' && (
      <form onSubmit={handleOtpSubmit} className="space-y-6">
        {/* ... کدهای قبلی ... */}
        <button
          type="button"
          onClick={handleResendOtp}
          className="text-sm text-blue-400 hover:underline w-full text-center"
        >
          ارسال مجدد کد
        </button>
      </form>
    )
  }

  if (!authModalOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm">
      <div className="relative w-full max-w-md bg-gray-900 rounded-2xl p-8 shadow-2xl">
        <button
          onClick={closeAuthModal}
          className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors"
        >
          <X size={24} />
        </button>

        {authStep === 'info' && (
          <form onSubmit={handleInfoSubmit} className="space-y-6">
            <h2 className="text-2xl font-bold text-white text-center">ورود / ثبت‌نام</h2>

            <div>
              <input
                type="text"
                placeholder="نام و نام خانوادگی"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-4 py-3 bg-gray-800 text-white rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
              />
              {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name}</p>}
            </div>

            <div>
              <input
                type="tel"
                placeholder="شماره موبایل"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="w-full px-4 py-3 bg-gray-800 text-white rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
              />
              {errors.phone && <p className="text-red-500 text-sm mt-1">{errors.phone}</p>}
            </div>

            {errors.submit && <p className="text-red-500 text-sm">{errors.submit}</p>}

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold transition-colors disabled:opacity-50"
            >
              {isSubmitting ? 'در حال ارسال...' : 'ارسال کد تایید'}
            </button>
          </form>
        )}

        {authStep === 'otp' && (
          <form onSubmit={handleOtpSubmit} className="space-y-6">
            <h2 className="text-2xl font-bold text-white text-center">کد تایید</h2>
            <p className="text-gray-400 text-center">کد ارسال شده به {tempAuthData?.phone} را وارد کنید</p>

            <div>
              <input
                type="text"
                placeholder="کد ۶ رقمی"
                maxLength={6}
                value={formData.otp}
                onChange={(e) => setFormData({ ...formData, otp: e.target.value.replace(/\D/g, '') })}
                className="w-full px-4 py-3 bg-gray-800 text-white rounded-lg text-center text-2xl tracking-widest focus:ring-2 focus:ring-blue-500 outline-none"
              />
              {errors.otp && <p className="text-red-500 text-sm mt-1 text-center">{errors.otp}</p>}
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold transition-colors disabled:opacity-50"
            >
              {isSubmitting ? 'در حال تایید...' : 'تایید'}
            </button>
          </form>
        )}

        {authStep === 'success' && (
          <div className="text-center space-y-4">
            <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mx-auto">
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
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
