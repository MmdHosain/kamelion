import React, { useState } from 'react';
import { User, Lock, Shield, ArrowRight, Loader2 } from 'lucide-react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';

const AdminLogin = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { adminLogin, error: authError, loading } = useAuth();

  const [phoneNumber, setPhoneNumber] = useState('');
  const [password, setPassword] = useState('');
  const [localError, setLocalError] = useState('');

  const from = location.state?.from?.pathname || '/admin';

  const handleLogin = async (e) => {
    e.preventDefault();
    setLocalError('');

    try {
      const response = await adminLogin(phoneNumber, password);
      const isAdmin =
        response?.user?.role === 'admin' ||
        response?.user?.is_staff === true ||
        response?.user?.is_superuser === true;

      if (!isAdmin) {
        setLocalError('شما دسترسی مدیریت به این بخش را ندارید');
        return;
      }

      navigate(from, { replace: true });
    } catch (err) {
      setLocalError(
        err?.response?.data?.detail ||
        err?.response?.data?.message ||
        'ورود با نام کاربری یا کلمه عبور وارد شده امکان‌پذیر نیست'
      );
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-bgLight via-bgDark to-bgLight px-4 py-12">
      <div className="w-full max-w-md bg-white/80 backdrop-blur-2xl border border-primary/25 rounded-[2.5rem] shadow-2xl p-8 md:p-10 relative overflow-hidden animate-fadeSlide">
        <div className="text-center mb-8">
          <div className="w-16 h-16 rounded-3xl bg-gradient-to-br from-primary to-primary-dark text-white flex items-center justify-center mx-auto mb-4 shadow-lg shadow-primary/30">
            <Shield className="w-8 h-8" />
          </div>
          <h1 className="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-l from-primary to-primary-dark">
            ورود به پنل مدیریت
          </h1>
          <p className="text-xs text-textDark/70 font-medium mt-1">
            کلینیک تخصصی جراحی پستان دکتر نگار معشوری
          </p>
        </div>

        <form onSubmit={handleLogin} className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-textDark/80 pr-1">شماره تماس ادمین</label>
            <div className="flex items-center bg-white/90 border border-primary/25 rounded-2xl overflow-hidden focus-within:border-primary focus-within:ring-1 focus-within:ring-primary transition-all">
              <div className="p-3.5 text-primary">
                <User size={18} />
              </div>
              <input
                type="text"
                placeholder="0912..."
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                className="flex-1 px-3 py-3 text-sm outline-none bg-transparent text-textDark font-mono"
                required
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-textDark/80 pr-1">کلمه عبور</label>
            <div className="flex items-center bg-white/90 border border-primary/25 rounded-2xl overflow-hidden focus-within:border-primary focus-within:ring-1 focus-within:ring-primary transition-all">
              <div className="p-3.5 text-primary">
                <Lock size={18} />
              </div>
              <input
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="flex-1 px-3 py-3 text-sm outline-none bg-transparent text-textDark"
                required
              />
            </div>
          </div>

          {(localError || authError) && (
            <p className="text-xs text-red-600 bg-red-50/80 border border-red-200 p-3 rounded-xl font-medium text-center">
              {localError || authError}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full mt-2 bg-primary hover:bg-primary-dark text-white font-bold py-3.5 rounded-2xl transition-all duration-300 shadow-lg shadow-primary/30 hover:shadow-primary/50 hover:-translate-y-0.5 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-70"
          >
            {loading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                در حال احراز هویت...
              </>
            ) : (
              'ورود به داشبورد'
            )}
          </button>

          <div className="pt-4 text-center border-t border-primary/10">
            <Link
              to="/"
              className="text-xs text-primary hover:text-primary-dark font-bold inline-flex items-center gap-1 transition-colors"
            >
              <ArrowRight className="w-3.5 h-3.5" />
              بازگشت به وب‌سایت اصلی
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AdminLogin;
