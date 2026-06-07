import React, { useState } from 'react';
import { User, Lock } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
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
        setLocalError('You do not have admin access');
        return;
      }

      navigate(from, { replace: true });
    } catch (err) {
      setLocalError(
        err?.response?.data?.detail ||
        err?.response?.data?.message ||
        'Login failed'
      );
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#8FA9A3] px-4">
      <div className="bg-white/40 p-4 sm:p-6 rounded-lg shadow-lg">
        <div className="w-full max-w-md rounded-md overflow-hidden shadow-md">
          <div className="bg-[#2B2B2B] px-6 py-4">
            <h1 className="text-white text-lg font-semibold tracking-wide">
              login to administration
            </h1>
          </div>

          <form
            onSubmit={handleLogin}
            className="bg-[#F2F2F2] px-6 py-6 space-y-4"
          >
            <div className="flex border border-gray-300 rounded-sm overflow-hidden bg-white">
              <div className="flex items-center justify-center w-12 bg-[#E5E5E5] border-r border-gray-300">
                <User size={18} className="text-gray-600" />
              </div>
              <input
                type="text"
                placeholder="Phone number"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                className="flex-1 px-3 py-2 text-sm outline-none bg-white"
                required
              />
            </div>

            <div className="flex border border-gray-300 rounded-sm overflow-hidden bg-white">
              <div className="flex items-center justify-center w-12 bg-[#E5E5E5] border-r border-gray-300">
                <Lock size={18} className="text-gray-600" />
              </div>
              <input
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="flex-1 px-3 py-2 text-sm outline-none bg-white"
                required
              />
            </div>

            {(localError || authError) && (
              <p className="text-sm text-red-600">
                {localError || authError}
              </p>
            )}

            <div className="text-right">
              <button
                type="button"
                className="text-xs text-gray-600 hover:underline"
              >
                forgot details?
              </button>
            </div>

            <div className="flex items-center justify-between pt-2">
              <label className="flex items-center gap-2 text-sm text-gray-700">
                <input
                  type="checkbox"
                  className="w-4 h-4 accent-[#2B2B2B]"
                />
                remember me
              </label>

              <button
                type="submit"
                disabled={loading}
                className="bg-[#2B2B2B] text-white text-sm px-6 py-2 rounded-sm hover:bg-black transition disabled:opacity-60"
              >
                {loading ? 'Signing in...' : 'sign in'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AdminLogin;
