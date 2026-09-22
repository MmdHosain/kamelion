// src/components/ui/AuthModal.jsx

import React, { useState, useEffect, useRef } from 'react';
import {
  X,
  Phone,
  ShieldCheck,
  User,
  Lock,
  CheckCircle2,
  Loader2,
  ArrowRight,
  RotateCcw,
} from 'lucide-react';
import useAuthStore from '../../store/authStore';
import { useAuth } from '../../hooks/useAuth';

export const toEnglishDigits = (str) => {
  if (!str) return '';
  return String(str)
    .replace(/[۰-۹]/g, (d) => '۰۱۲۳۴۵۶۷۸۹'.indexOf(d))
    .replace(/[٠-٩]/g, (d) => '٠١٢٣٤٥٦٧٨٩'.indexOf(d));
};

export const normalizePhone = (phone) => {
  if (!phone) return '';
  let cleaned = toEnglishDigits(phone).replace(/\D/g, '');
  if (cleaned.startsWith('98') && cleaned.length === 12) {
    cleaned = '0' + cleaned.substring(2);
  } else if (cleaned.startsWith('9') && cleaned.length === 10) {
    cleaned = '0' + cleaned;
  }
  return cleaned;
};

const AuthModal = () => {
  const {
    authModalOpen,
    authStep,
    tempAuthData,
    closeAuthModal,
    setAuthStep,
    user,
  } = useAuthStore();

  const {
    handleAuthSubmit,
    handleVerifyOtp,
    handleCompleteRegistration,
    adminLogin,
    loading,
    error: hookError,
    setError: setHookError,
  } = useAuth();

  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [fullName, setFullName] = useState('');
  const [nationalId, setNationalId] = useState('');
  const [password, setPassword] = useState('');
  const [localError, setLocalError] = useState('');

  const phoneInputRef = useRef(null);
  const otpInputRef = useRef(null);
  const nameInputRef = useRef(null);
  const passwordInputRef = useRef(null);

  // Reset state when modal opens or closes
  useEffect(() => {
    if (authModalOpen) {
      setLocalError('');
      setHookError?.('');
      if (authStep === 'phone' || authStep === 'info') {
        setTimeout(() => phoneInputRef.current?.focus(), 100);
      }
    } else {
      setPhone('');
      setOtp('');
      setFullName('');
      setNationalId('');
      setPassword('');
      setLocalError('');
    }
  }, [authModalOpen, authStep, setHookError]);

  // Focus the appropriate input when changing steps
  useEffect(() => {
    if (!authModalOpen) return;
    setLocalError('');
    setHookError?.('');

    if (authStep === 'phone' || authStep === 'info') {
      setTimeout(() => phoneInputRef.current?.focus(), 100);
    } else if (authStep === 'otp') {
      setTimeout(() => otpInputRef.current?.focus(), 100);
    } else if (authStep === 'register') {
      setTimeout(() => nameInputRef.current?.focus(), 100);
    } else if (authStep === 'credentials') {
      setTimeout(() => passwordInputRef.current?.focus(), 100);
    } else if (authStep === 'success') {
      const timer = setTimeout(() => {
        closeAuthModal();
      }, 1800);
      return () => clearTimeout(timer);
    }
  }, [authStep, authModalOpen, closeAuthModal, setHookError]);

  if (!authModalOpen) return null;

  const currentDisplayError = localError || hookError;

  // Step 1: Submit Phone Number
  const onPhoneSubmit = async (e) => {
    e.preventDefault();
    setLocalError('');

    const cleaned = normalizePhone(phone);
    if (!cleaned || cleaned.length < 10) {
      setLocalError('لطفاً یک شماره تلفن همراه معتبر (مثلاً 09121234567) وارد کنید.');
      return;
    }

    try {
      await handleAuthSubmit(cleaned);
    } catch (err) {
      // Error handled inside useAuth hook
    }
  };

  // Step 2: Submit OTP
  const onOtpSubmit = async (e) => {
    e.preventDefault();
    setLocalError('');

    const cleanCode = toEnglishDigits(otp).trim();
    if (!cleanCode || cleanCode.length !== 6) {
      setLocalError('کد تأیید باید ۶ رقم باشد.');
      return;
    }

    try {
      await handleVerifyOtp(cleanCode);
    } catch (err) {
      // Error handled inside useAuth hook
    }
  };

  // Resend OTP
  const onResendOtp = async () => {
    if (!tempAuthData?.phone || loading) return;
    setLocalError('');
    try {
      await handleAuthSubmit(tempAuthData.phone);
    } catch (err) {
      // Handled
    }
  };

  // Step 3: Complete Registration (New User)
  const onRegisterSubmit = async (e) => {
    e.preventDefault();
    setLocalError('');

    const cleanName = fullName.trim();
    const cleanNid = toEnglishDigits(nationalId).trim();

    if (!cleanName || cleanName.length < 2) {
      setLocalError('لطفاً نام و نام خانوادگی خود را کامل وارد کنید.');
      return;
    }

    if (!cleanNid || cleanNid.length < 8) {
      setLocalError('لطفاً یک کد ملی معتبر وارد کنید.');
      return;
    }

    try {
      await handleCompleteRegistration(cleanName, cleanNid);
    } catch (err) {
      // Handled
    }
  };

  // Step 4: Admin Password Login
  const onAdminLoginSubmit = async (e) => {
    e.preventDefault();
    setLocalError('');

    if (!password) {
      setLocalError('لطفاً کلمه عبور را وارد کنید.');
      return;
    }

    try {
      await adminLogin(tempAuthData?.phone || phone, password);
    } catch (err) {
      // Handled
    }
  };

  return (
    <div className="fixed inset-0 z-[110] bg-black/60 backdrop-blur-sm flex items-center justify-center px-4 transition-all duration-300 animate-fadeIn">
      <div
        className="bg-gradient-to-br from-bgLight via-white to-bgDark border border-primary/30 rounded-3xl p-6 md:p-8 max-w-md w-full shadow-2xl relative transform transition-all duration-300"
        id="auth-modal-content"
      >
        {/* Close Button */}
        <button
          type="button"
          onClick={closeAuthModal}
          className="absolute top-5 left-5 text-textDark/60 hover:text-primary transition-colors w-8 h-8 flex items-center justify-center rounded-full bg-white/70 hover:bg-white shadow-sm cursor-pointer"
          aria-label="Close"
        >
          <X className="w-5 h-5" />
        </button>

        {/* STEP 1: Phone Input */}
        {(authStep === 'phone' || authStep === 'info') && (
          <div className="space-y-6">
            <div className="text-center">
              <div className="w-16 h-16 bg-white/80 border border-primary/20 rounded-2xl flex items-center justify-center text-primary mx-auto mb-4 shadow-sm">
                <Phone className="w-8 h-8" />
              </div>
              <h3 className="text-2xl font-black text-textDark mb-2">ورود به سیستم</h3>
              <p className="text-textDark/70 text-sm font-medium">
                لطفاً شماره تلفن همراه خود را وارد کنید
              </p>
            </div>

            <form onSubmit={onPhoneSubmit} className="space-y-4">
              <div>
                <input
                  ref={phoneInputRef}
                  type="tel"
                  placeholder="09121234567"
                  dir="ltr"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full bg-white/85 border border-primary/30 p-4 rounded-xl text-textDark text-center font-mono text-lg focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all placeholder-textDark/40 shadow-inner"
                  required
                />
              </div>

              {currentDisplayError && (
                <div className="text-red-500 text-xs font-bold text-center bg-red-50/80 border border-red-200 p-2.5 rounded-xl animate-shake">
                  {currentDisplayError}
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-primary hover:bg-primary-dark text-white font-bold py-3.5 px-6 rounded-xl transition-all shadow-lg shadow-primary/30 hover:-translate-y-0.5 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    <span>در حال بررسی...</span>
                  </>
                ) : (
                  <span>ادامه</span>
                )}
              </button>
            </form>
          </div>
        )}

        {/* STEP 2: OTP Verification */}
        {authStep === 'otp' && (
          <div className="space-y-6">
            <div className="text-center">
              <div className="w-16 h-16 bg-white/80 border border-primary/20 rounded-2xl flex items-center justify-center text-primary mx-auto mb-4 shadow-sm">
                <ShieldCheck className="w-8 h-8" />
              </div>
              <h3 className="text-2xl font-black text-textDark mb-2">تأیید شماره همراه</h3>
              <p className="text-textDark/70 text-sm font-medium">
                کد تأیید ۶ رقمی به شماره{' '}
                <span className="font-mono font-bold text-primary" dir="ltr">
                  {tempAuthData?.phone || phone}
                </span>{' '}
                ارسال شد
              </p>
            </div>

            <form onSubmit={onOtpSubmit} className="space-y-4">
              <div>
                <input
                  ref={otpInputRef}
                  type="text"
                  maxLength={6}
                  inputMode="numeric"
                  placeholder="------"
                  dir="ltr"
                  value={otp}
                  onChange={(e) => setOtp(toEnglishDigits(e.target.value).replace(/\D/g, ''))}
                  className="w-full bg-white/85 border border-primary/30 p-4 rounded-xl text-textDark text-center font-mono text-2xl tracking-[0.4em] focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all placeholder-textDark/30 shadow-inner"
                  required
                />
              </div>

              {currentDisplayError && (
                <div className="text-red-500 text-xs font-bold text-center bg-red-50/80 border border-red-200 p-2.5 rounded-xl animate-shake">
                  {currentDisplayError}
                </div>
              )}

              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setAuthStep('phone')}
                  className="w-1/3 bg-white/70 hover:bg-white border border-primary/20 text-textDark font-bold py-3.5 px-4 rounded-xl transition-all cursor-pointer text-center"
                >
                  بازگشت
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="w-2/3 bg-primary hover:bg-primary-dark text-white font-bold py-3.5 px-6 rounded-xl transition-all shadow-lg shadow-primary/30 hover:-translate-y-0.5 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      <span>در حال تأیید...</span>
                    </>
                  ) : (
                    <span>تأیید و ادامه</span>
                  )}
                </button>
              </div>

              <div className="text-center pt-2">
                <button
                  type="button"
                  onClick={onResendOtp}
                  disabled={loading}
                  className="text-xs text-primary hover:text-primary-dark font-bold inline-flex items-center gap-1.5 transition-colors cursor-pointer disabled:opacity-50"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>ارسال مجدد کد تأیید</span>
                </button>
              </div>
            </form>
          </div>
        )}

        {/* STEP 3: Complete Registration for New Users */}
        {authStep === 'register' && (
          <div className="space-y-6">
            <div className="text-center">
              <div className="w-16 h-16 bg-white/80 border border-primary/20 rounded-2xl flex items-center justify-center text-primary mx-auto mb-4 shadow-sm">
                <User className="w-8 h-8" />
              </div>
              <h3 className="text-2xl font-black text-textDark mb-2">تکمیل اطلاعات ثبت‌نام</h3>
              <p className="text-textDark/70 text-sm font-medium">
                شماره شما جدید است. لطفاً نام و کد ملی خود را وارد کنید.
              </p>
            </div>

            <form onSubmit={onRegisterSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-textDark/80 mb-1.5 pr-1">
                  نام و نام خانوادگی
                </label>
                <input
                  ref={nameInputRef}
                  type="text"
                  placeholder="مثال: سارا محمدی"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full bg-white/85 border border-primary/30 p-3.5 rounded-xl text-textDark font-medium focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all placeholder-textDark/40 shadow-inner"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-textDark/80 mb-1.5 pr-1">
                  کد ملی
                </label>
                <input
                  type="text"
                  placeholder="0012345678"
                  maxLength={10}
                  dir="ltr"
                  inputMode="numeric"
                  value={nationalId}
                  onChange={(e) => setNationalId(toEnglishDigits(e.target.value).replace(/\D/g, ''))}
                  className="w-full bg-white/85 border border-primary/30 p-3.5 rounded-xl text-textDark font-mono focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all placeholder-textDark/40 shadow-inner"
                  required
                />
              </div>

              {currentDisplayError && (
                <div className="text-red-500 text-xs font-bold text-center bg-red-50/80 border border-red-200 p-2.5 rounded-xl animate-shake">
                  {currentDisplayError}
                </div>
              )}

              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setAuthStep('otp')}
                  className="w-1/3 bg-white/70 hover:bg-white border border-primary/20 text-textDark font-bold py-3.5 px-4 rounded-xl transition-all cursor-pointer text-center"
                >
                  بازگشت
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="w-2/3 bg-primary hover:bg-primary-dark text-white font-bold py-3.5 px-6 rounded-xl transition-all shadow-lg shadow-primary/30 hover:-translate-y-0.5 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      <span>در حال ثبت...</span>
                    </>
                  ) : (
                    <span>ثبت و ورود</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* STEP 4: Admin Credentials Login */}
        {authStep === 'credentials' && (
          <div className="space-y-6">
            <div className="text-center">
              <div className="w-16 h-16 bg-white/80 border border-primary/20 rounded-2xl flex items-center justify-center text-primary mx-auto mb-4 shadow-sm">
                <Lock className="w-8 h-8" />
              </div>
              <h3 className="text-2xl font-black text-textDark mb-2">احراز هویت ادمین</h3>
              <p className="text-textDark/70 text-sm font-medium">
                شماره همراه شما به عنوان ادمین شناسایی شد. لطفاً کلمه عبور خود را وارد کنید.
              </p>
              <div className="mt-2 inline-flex items-center gap-1.5 bg-primary/10 border border-primary/20 px-3 py-1 rounded-full text-xs font-mono font-bold text-primary">
                <Phone className="w-3 h-3" />
                <span dir="ltr">{tempAuthData?.phone || phone}</span>
              </div>
            </div>

            <form onSubmit={onAdminLoginSubmit} className="space-y-4">
              <div>
                <input
                  ref={passwordInputRef}
                  type="password"
                  placeholder="رمز عبور ادمین"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-white/85 border border-primary/30 p-4 rounded-xl text-textDark font-medium focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all placeholder-textDark/40 shadow-inner"
                  required
                />
              </div>

              {currentDisplayError && (
                <div className="text-red-500 text-xs font-bold text-center bg-red-50/80 border border-red-200 p-2.5 rounded-xl animate-shake">
                  {currentDisplayError}
                </div>
              )}

              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setAuthStep('phone')}
                  className="w-1/3 bg-white/70 hover:bg-white border border-primary/20 text-textDark font-bold py-3.5 px-4 rounded-xl transition-all cursor-pointer text-center"
                >
                  بازگشت
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="w-2/3 bg-primary hover:bg-primary-dark text-white font-bold py-3.5 px-6 rounded-xl transition-all shadow-lg shadow-primary/30 hover:-translate-y-0.5 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      <span>در حال ورود...</span>
                    </>
                  ) : (
                    <span>ورود به پنل</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* STEP 5: Success Screen */}
        {authStep === 'success' && (
          <div className="space-y-6 text-center py-2 animate-fadeIn">
            <div className="w-16 h-16 bg-emerald-100 border border-emerald-300 text-emerald-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-sm">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <h3 className="text-2xl font-black text-textDark mb-1">ورود با موفقیت انجام شد</h3>
            <p className="text-textDark/80 font-medium text-sm">
              خوش آمدید،{' '}
              <span className="font-bold text-primary">
                {user?.full_name || user?.name || 'کاربر گرامی'}
              </span>
            </p>
            <div className="bg-white/70 border border-primary/20 rounded-2xl p-4 text-xs text-textDark/80 space-y-2 text-right">
              <div className="flex justify-between items-center">
                <span className="text-textDark/60 font-medium">شماره تماس:</span>
                <span className="font-mono font-bold" dir="ltr">
                  {user?.phone_number || tempAuthData?.phone || phone}
                </span>
              </div>
              {user?.national_id && (
                <div className="flex justify-between items-center">
                  <span className="text-textDark/60 font-medium">کد ملی:</span>
                  <span className="font-mono font-bold" dir="ltr">
                    {user.national_id}
                  </span>
                </div>
              )}
              <div className="flex justify-between items-center">
                <span className="text-textDark/60 font-medium">نقش کاربری:</span>
                <span className="font-bold text-primary">
                  {user?.role === 'admin' ? 'مدیر سیستم' : 'بیمار'}
                </span>
              </div>
            </div>
            <button
              type="button"
              onClick={closeAuthModal}
              className="w-full bg-primary hover:bg-primary-dark text-white font-bold py-3 px-6 rounded-xl transition-all shadow-lg shadow-primary/30 hover:-translate-y-0.5 cursor-pointer"
            >
              متوجه شدم
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default AuthModal;
