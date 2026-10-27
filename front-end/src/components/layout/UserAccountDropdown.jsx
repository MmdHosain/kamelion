// src/components/layout/UserAccountDropdown.jsx
import React, { useState, useRef, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  User,
  Calendar,
  LogOut,
  Shield,
  ChevronDown,
} from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { toPersianDigits } from '../../utils/jalaliDateUtils';

/**
 * UserAccountDropdown Component
 *
 * Consolidates all user profile actions (My Appointments, Admin Panel, Logout)
 * into a single unified glassmorphic capsule button with an interactive popover menu.
 *
 * @param {Object} props
 * @param {Function} [props.onOpenMyAppointments] - Callback to trigger the appointments modal
 */
export const UserAccountDropdown = ({ onOpenMyAppointments }) => {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef(null);
  const location = useLocation();
  const { user, logout } = useAuth();

  const isAdmin = user?.role === 'admin' || user?.is_staff === true || user?.is_superuser === true;

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  // Close dropdown on route change
  useEffect(() => {
    setIsOpen(false);
  }, [location.pathname]);

  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen) {
        setIsOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen]);

  const displayName = user?.full_name || (user?.phone_number ? toPersianDigits(user.phone_number) : 'حساب کاربری');

  return (
    <div className="relative flex-shrink-0" ref={menuRef}>
      {/* Trigger Capsule Button */}
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        title={displayName}
        aria-label="حساب کاربری و منوی دسترسی‌ها"
        aria-expanded={isOpen}
        aria-haspopup="true"
        className="flex items-center gap-1.5 sm:gap-2 bg-white/80 hover:bg-white border border-primary/25 hover:border-primary/50 text-textDark text-xs md:text-sm font-bold p-2 sm:py-2 sm:px-3.5 md:px-4 rounded-full shadow-xs hover:shadow-md transition-all duration-200 cursor-pointer flex-shrink-0 group"
      >
        <div className="w-5 h-5 rounded-full bg-primary/10 flex items-center justify-center text-primary shrink-0 group-hover:scale-105 transition-transform">
          <User className="w-3.5 h-3.5" />
        </div>

        <span className="hidden sm:inline max-w-[85px] sm:max-w-[120px] md:max-w-[140px] truncate min-w-0">
          {displayName}
        </span>

        <ChevronDown
          className={`w-3.5 h-3.5 text-primary/80 transition-transform duration-200 shrink-0 ${
            isOpen ? 'rotate-180' : ''
          }`}
        />
      </button>

      {/* Popover Dropdown Menu */}
      {isOpen && (
        <div
          role="menu"
          aria-label="منوی حساب کاربری"
          className="absolute left-0 top-full mt-2 w-56 sm:w-64 bg-white/95 backdrop-blur-2xl border border-primary/20 rounded-2xl shadow-2xl py-2 z-50 animate-scaleUp text-right overflow-hidden"
        >
          {/* User Profile Header Card */}
          <div className="px-4 py-2.5 border-b border-primary/10 bg-primary/[0.03]">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-2xl bg-gradient-to-br from-primary/20 to-primary/5 border border-primary/20 flex items-center justify-center text-primary shrink-0 font-bold">
                <User className="w-4 h-4" />
              </div>
              <div className="flex flex-col min-w-0">
                <span className="text-xs font-black text-textDark truncate">
                  {user?.full_name || 'کاربر گرامی'}
                </span>
                {user?.phone_number ? (
                  <span className="text-[10px] text-textDark/60 font-mono mt-0.5" dir="ltr">
                    {toPersianDigits(user.phone_number)}
                  </span>
                ) : (
                  <span className="text-[10px] text-primary/75 font-medium mt-0.5">
                    کلینیک دکتر نگار معشوری
                  </span>
                )}
              </div>
            </div>

            {isAdmin && (
              <div className="mt-2 inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-primary/10 border border-primary/20 text-primary text-[10px] font-bold">
                <Shield className="w-3 h-3" />
                <span>دسترسی مدیریت کلینیک</span>
              </div>
            )}
          </div>

          {/* Action Items List */}
          <div className="py-1 flex flex-col">
            {/* 1. My Appointments (نوبت‌های من) */}
            <button
              type="button"
              role="menuitem"
              onClick={() => {
                setIsOpen(false);
                onOpenMyAppointments?.();
              }}
              className="w-full text-right px-4 py-2.5 text-xs font-bold text-textDark/85 hover:text-primary hover:bg-primary/5 transition-colors flex items-center justify-between cursor-pointer group"
            >
              <span className="flex items-center gap-2.5">
                <div className="w-7 h-7 rounded-xl bg-primary/10 flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-white transition-colors shrink-0">
                  <Calendar className="w-3.5 h-3.5" />
                </div>
                <span>نوبت‌های من</span>
              </span>
              <span className="text-[10px] text-primary/70 font-normal">پیگیری و لغو</span>
            </button>

            {/* 2. Admin Panel Link (For Admins) */}
            {isAdmin && (
              <Link
                to="/admin/appointments"
                role="menuitem"
                onClick={() => setIsOpen(false)}
                className="w-full text-right px-4 py-2.5 text-xs font-bold text-textDark/85 hover:text-primary hover:bg-primary/5 transition-colors flex items-center justify-between cursor-pointer group"
              >
                <span className="flex items-center gap-2.5">
                  <div className="w-7 h-7 rounded-xl bg-purple-100 flex items-center justify-center text-purple-700 group-hover:bg-purple-600 group-hover:text-white transition-colors shrink-0">
                    <Shield className="w-3.5 h-3.5" />
                  </div>
                  <span>ورود به پنل مدیریت</span>
                </span>
                <span className="text-[10px] text-purple-600 font-normal">داشبورد</span>
              </Link>
            )}

            {/* Separator */}
            <div className="border-t border-primary/10 my-1" />

            {/* 3. Logout Action (خروج از حساب) */}
            <button
              type="button"
              role="menuitem"
              onClick={() => {
                setIsOpen(false);
                logout();
              }}
              className="w-full text-right px-4 py-2.5 text-xs font-bold text-rose-600 hover:bg-rose-50 hover:text-rose-700 transition-colors flex items-center gap-2.5 cursor-pointer group"
            >
              <div className="w-7 h-7 rounded-xl bg-rose-50 border border-rose-200/60 flex items-center justify-center text-rose-600 group-hover:bg-rose-600 group-hover:text-white transition-colors shrink-0">
                <LogOut className="w-3.5 h-3.5" />
              </div>
              <span>خروج از حساب کاربری</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserAccountDropdown;
