import { useState } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { sendOtp, verifyOtp } from '../../api/auth';

const AuthModal = ({ open, onClose }) => {
  const { handleAuthSuccess } = useAuth();
  
  const [step, setStep] = useState(1); // 1: Info, 2: OTP, 3: Success
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    otp: '',
  });
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Reset modal state when closed
  const handleClose = () => {
    setStep(1);
    setFormData({ name: '', phone: '', otp: '' });
    setErrors({});
    onClose();
  };

  // Step 1: Submit name and phone
  const handleSubmitInfo = async () => {
    const newErrors = {};
    
    if (!formData.name.trim() || formData.name.trim().length < 2) {
      newErrors.name = 'نام باید حداقل ۲ حرف باشد';
    }
    
    if (!formData.phone.trim() || formData.phone.length < 10) {
      newErrors.phone = 'شماره تلفن معتبر نیست';
    }
    
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }
    
    setIsSubmitting(true);
    setErrors({});
    
    try {
      await sendOtp(formData.phone);
      setStep(2);
    } catch (err) {
      setErrors({ submit: err.message || 'خطا در ارسال کد' });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Step 2: Verify OTP
  const handleVerifyOtp = async () => {
    if (formData.otp.length !== 6) {
      setErrors({ otp: 'کد تایید باید ۶ رقم باشد' });
      return;
    }
    
    setIsSubmitting(true);
    setErrors({});
    
    try {
      const authData = await verifyOtp(formData.phone, formData.otp);
      
      // Update auth context
      handleAuthSuccess(authData);
      
      // Show success step
      setStep(3);
      
      // Auto-close after 1.5 seconds
      setTimeout(() => {
        handleClose();
      }, 1500);
    } catch (err) {
      setErrors({ otp: err.message || 'کد تایید اشتباه است' });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div 
        className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl p-8 mx-4 transition-all duration-300"
        style={{
          minHeight: step === 1 ? '400px' : step === 2 ? '350px' : '250px',
          animation: 'fadeIn 0.3s ease-in-out',
        }}
      >
        {/* Close button (hidden on success step) */}
        {step !== 3 && (
          <button
            onClick={handleClose}
            className="absolute top-4 left-4 text-gray-400 hover:text-gray-600 transition"
          >
            ✕
          </button>
        )}

        {/* Step 1: Name & Phone */}
        {step === 1 && (
          <div className="space-y-6">
            <div className="text-center">
              <h2 className="text-2xl font-bold text-gray-800 mb-2">ورود / ثبت نام</h2>
              <p className="text-sm text-gray-500">برای رزرو نوبت، لطفا اطلاعات خود را وارد کنید</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">نام و نام خانوادگی</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className={`w-full px-4 py-3 border-2 rounded-xl focus:outline-none transition ${
                  errors.name ? 'border-red-400' : 'border-gray-200 focus:border-[#2F5D50]'
                }`}
                placeholder="نام خود را وارد کنید"
              />
              {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">شماره تلفن</label>
              <input
                type="tel"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className={`w-full px-4 py-3 border-2 rounded-xl focus:outline-none transition ${
                  errors.phone ? 'border-red-400' : 'border-gray-200 focus:border-[#2F5D50]'
                }`}
                placeholder="09123456789"
                maxLength={11}
              />
              {errors.phone && <p className="text-red-500 text-xs mt-1">{errors.phone}</p>}
            </div>

            {errors.submit && (
              <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg text-sm">
                {errors.submit}
              </div>
            )}

            <button
              onClick={handleSubmitInfo}
              disabled={isSubmitting}
              className="w-full bg-[#2F5D50] hover:bg-[#264a3f] text-white py-3 rounded-xl transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? 'در حال ارسال...' : 'ارسال کد تایید'}
            </button>
          </div>
        )}

        {/* Step 2: OTP */}
        {step === 2 && (
          <div className="space-y-6">
            <div className="text-center">
              <h2 className="text-2xl font-bold text-gray-800 mb-2">کد تایید</h2>
              <p className="text-sm text-gray-500">
                کد ۶ رقمی به شماره <span className="font-bold text-gray-700">{formData.phone}</span> ارسال شد
              </p>
              <p className="text-xs text-[#2F5D50] mt-2">
                (برای تست از کد <span className="font-mono font-bold">123456</span> استفاده کنید)
              </p>
            </div>

            <div>
              <input
                type="text"
                value={formData.otp}
                onChange={(e) => {
                  const value = e.target.value.replace(/\D/g, '');
                  setFormData({ ...formData, otp: value });
                }}
                className={`w-full px-4 py-3 border-2 rounded-xl text-center text-2xl tracking-widest focus:outline-none transition ${
                  errors.otp ? 'border-red-400' : 'border-gray-200 focus:border-[#2F5D50]'
                }`}
                placeholder="------"
                maxLength={6}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && formData.otp.length === 6) {
                    handleVerifyOtp();
                  }
                }}
              />
              {errors.otp && <p className="text-red-500 text-xs mt-1 text-center">{errors.otp}</p>}
            </div>

            <button
              onClick={handleVerifyOtp}
              disabled={isSubmitting || formData.otp.length !== 6}
              className="w-full bg-[#2F5D50] hover:bg-[#264a3f] text-white py-3 rounded-xl transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? 'در حال بررسی...' : 'تایید کد'}
            </button>

            <button
              onClick={() => setStep(1)}
              className="w-full text-gray-500 hover:text-gray-700 text-sm transition"
            >
              ویرایش شماره تلفن
            </button>
          </div>
        )}

        {/* Step 3: Success */}
        {step === 3 && (
          <div className="flex flex-col items-center justify-center space-y-4 py-8">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
              <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h3 className="text-xl font-bold text-gray-800">ورود موفق!</h3>
            <p className="text-sm text-gray-500">در حال انتقال...</p>
          </div>
        )}
      </div>

      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: scale(0.95); }
          to { opacity: 1; transform: scale(1); }
        }
      `}</style>
    </div>
  );
};

export default AuthModal;
