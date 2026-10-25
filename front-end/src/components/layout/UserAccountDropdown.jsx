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

/**
 * Unified User Account Dropdown Component
 *
 * Consolidates user profile information, appointment management,
 * administrative shortcuts, and secure logout into a single sleek pill dropdown.
 *
 * @param {Object} props
 * @param {Object} props.user - Active user profile object
 * @param {boolean} props.isAdmin - Whether the user has admin role
 * @param {Function} props.onOpenMyAppointments - Callback to trigger MyAppointmentsModal
 * @param {Function} props.logout - Callback to log out the user
 */
export const UserAccountDropdown = ({
  user,
  isAdmin = false,
  onOpenMyAppointments,
  logout,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef(null);
  const location = useLocation();

  const displayName = user?.full_name || user?.phone_number || 'حساب کاربری';

  // 1. Close dropdown on outside click
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

  // 2. Close on ESC key
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen) {
        setIsOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen]);

  // 3. Close on route navigation
  useEffect(() => {
    setIsOpen(false);
  }, [location.pathname]);

  return (
    <div className="relative flex-shrink-0" ref={menuRef}>
      {/* Consolidated Account Trigger Pill */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        title={displayName}
        aria-label="منوی حساب کاربری"
        aria-haspopup="true"
        aria-expanded={isOpen}
        className={`flex items-center gap-1.5 sm:gap-2 bg-white/80 hover:bg-white border text-textDark text-xs md:text-sm font-bold py-2 px-2.5 sm:px-3.5 md:px-4 rounded-full shadow-xs hover:shadow-md transition-all cursor-pointer flex-shrink-0 min-w-0 ${
          isOpen
            ? 'border-primary ring-2 ring-primary/20 bg-white'
            : 'border-primary/25 hover:border-primary/50'
        }`}
      >
        <div className="w-6 h-6 sm:w-6 sm:h-6 rounded-full bg-primary/10 flex items-center justify-center shrink-0 text-primary">
          {isAdmin ? <Shield className="w-3.5 h-3.5" /> : <User className="w-3.5 h-3.5" />}
        </div>

        <span className="max-w-[75px] sm:max-w-[110px] md:max-w-[140px] truncate min-w-0 select-none">
          {displayName}
        </span>

        <ChevronDown
          className={`w-3.5 h-3.5 text-primary/70 shrink-0 transition-transform duration-200 ${
            isOpen ? 'rotate-180 text-primary' : ''
          }`}
        />
      </button>

      {/* Modern Glassmorphic Dropdown Popover */}
      {isOpen && (
        <div
          role="menu"
          aria-label="گزینه‌های حساب کاربری"
          className="absolute left-0 top-full mt-2 w-56 sm:w-64 bg-white/95 backdrop-blur-2xl border border-primary/20 rounded-2xl shadow-2xl py-2 z-50 animate-scaleUp text-right overflow-hidden"
          style={{ transformOrigin: 'top left' }}
        >
          {/* User Info Header Card */}
          <div className="px-4 py-3 bg-gradient-to-l from-primary/5 via-white/50 to-transparent border-b border-primary/10">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-9 h-9 rounded-2xl bg-gradient-to-br from-primary to-primary-dark text-white flex items-center justify-center font-black shadow-sm shrink-0">
                {isAdmin ? (
                  <Shield size={18} />
                ) : (
                  <span className="text-xs">
                    {(user?.full_name?.[0] || 'ک').toUpperCase()}
                  </span>
                )}
              </div>
              <div className="flex flex-col min-w-0 flex-1">
                <span className="text-xs font-black text-textDark truncate">
                  {user?.full_name || 'کاربر گرامی'}
                </span>
                {user?.phone_number && (
                  <span className="text-[11px] text-textDark/60 font-mono mt-0.5" dir="ltr">
                    {user.phone_number}
                  </span>
                )}
              </div>
            </div>

            {isAdmin && (
              <span className="inline-block mt-2 text-[10px] bg-primary/15 text-primary font-bold px-2 py-0.5 rounded-full">
                مدیر کلینیک
              </span>
            )}
          </div>

          {/* Action Items List */}
          <div className="py-1 flex flex-col">
            {/* 1. Admin Dashboard Link (if applicable) */}
            {isAdmin && (
              <Link
                to="/admin/appointments"
                onClick={() => setIsOpen(false)}
                role="menuitem"
                className="w-full text-right px-4 py-2.5 text-xs font-bold text-textDark/90 hover:text-primary hover:bg-primary/5 transition-colors flex items-center gap-2.5 cursor-pointer"
              >
                <div className="w-6 h-6 rounded-lg bg-primary/10 text-primary flex items-center justify-center shrink-0">
                  <Shield size={14} />
                </div>
                <span>ورود به پنل مدیریت</span>
              </Link>
            )}

            {/* 2. My Appointments Action */}
            {onOpenMyAppointments && (
              <button
                type="button"
                onClick={() => {
                  setIsOpen(false);
                  onOpenMyAppointments();
                }}
                role="menuitem"
                className="w-full text-right px-4 py-2.5 text-xs font-bold text-textDark/90 hover:text-primary hover:bg-primary/5 transition-colors flex items-center justify-between cursor-pointer group"
              >
                <div className="flex items-center gap-2.5">
                  <div className="w-6 h-6 rounded-lg bg-primary/10 text-primary flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                    <Calendar size={14} />
                  </div>
                  <span>نوبت‌های من</span>
                </div>
                <span className="text-[10px] text-primary/70 font-normal">پیگیری / لغو</span>
              </button>
            )}

            {/* Divider */}
            <div className="my-1 border-t border-primary/10" />

            {/* 3. Secure Logout Action */}
            <button
              type="button"
              onClick={() => {
                setIsOpen(false);
                logout();
              }}
              role="menuitem"
              className="w-full text-right px-4 py-2.5 text-xs font-bold text-rose-600 hover:bg-rose-50/80 transition-colors flex items-center gap-2.5 cursor-pointer group"
            >
              <div className="w-6 h-6 rounded-lg bg-rose-100/70 text-rose-600 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                <LogOut size={14} />
              </div>
              <span>خروج از حساب</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserAccountDropdown;
