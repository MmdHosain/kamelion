import React, { useState, useRef, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  ChevronDown,
  LogIn,
  LogOut,
  Menu,
  X,
  Sparkles,
  Shield,
  User,
  Calendar,
} from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import RibbonLogo from '../ui/RibbonLogo';
import MobileNavDrawer from './MobileNavDrawer';

const Header = ({ onOpenAppointment, onOpenChat, onOpenMyAppointments }) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);
  const profileMenuRef = useRef(null);

  const location = useLocation();
  const { isAuthenticated, user, logout, openAuthModal } = useAuth();

  const isAdmin = user?.role === 'admin' || user?.is_staff === true || user?.is_superuser === true;

  // Close profile dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (profileMenuRef.current && !profileMenuRef.current.contains(e.target)) {
        setProfileMenuOpen(false);
      }
    };
    if (profileMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [profileMenuOpen]);

  // Close profile dropdown on route change
  useEffect(() => {
    setProfileMenuOpen(false);
  }, [location.pathname]);

  return (
    <>
      <header
        id="site-header"
        className="fixed top-0 left-0 right-0 z-50 flex justify-between items-center gap-1.5 sm:gap-2 px-3 sm:px-6 py-2.5 sm:py-3.5 bg-gradient-to-r from-bgLight/90 to-bgDark/90 backdrop-blur-xl border-b border-primary/20 transition-all duration-300 shadow-sm"
      >
        {/* Brand & Desktop Nav - Protected with flex-shrink-0 */}
        <div className="flex items-center flex-shrink-0 min-w-0">
          <Link
            to="/"
            className="text-textDark text-lg sm:text-xl md:text-2xl font-black tracking-tight no-underline flex items-center gap-2 sm:gap-2.5 flex-shrink-0"
          >
            <RibbonLogo className="w-6 h-6 sm:w-7 sm:h-7 md:w-8 md:h-8 flex-shrink-0" />
            <span className="whitespace-nowrap">دکتر معشوری</span>
          </Link>

          <nav className="hidden lg:flex gap-7 items-center mr-8">
            <Link
              to="/"
              className={`hover:text-primary transition-colors text-sm font-bold ${
                location.pathname === '/' ? 'text-primary' : 'text-textDark/80'
              }`}
            >
              خانه
            </Link>

            <Link
              to="/about"
              className={`hover:text-primary transition-colors text-sm font-bold ${
                location.pathname === '/about' ? 'text-primary' : 'text-textDark/80'
              }`}
            >
              آشنایی با پزشک
            </Link>

            {/* خدمات Dropdown */}
            <div className="group relative">
              <Link
                to="/services/therapeutic"
                className={`hover:text-primary transition-colors text-sm font-bold flex items-center gap-1 ${
                  location.pathname.startsWith('/services') ? 'text-primary' : 'text-textDark/80'
                }`}
              >
                خدمات
                <ChevronDown className="w-3.5 h-3.5 transition-transform group-hover:rotate-180" />
              </Link>
              <div className="hidden group-hover:block absolute top-full right-0 bg-white/95 backdrop-blur-xl border border-primary/20 min-w-[190px] rounded-2xl py-2 mt-2 shadow-2xl transition-all before:content-[''] before:absolute before:-top-3 before:left-0 before:right-0 before:h-3">
                <Link
                  to="/services/aesthetic"
                  className="block px-5 py-2.5 text-sm text-textDark/85 hover:text-primary hover:bg-bgLight/50 transition-colors font-medium"
                >
                  جراحی‌های زیبایی پستان
                </Link>
                <Link
                  to="/services/therapeutic"
                  className="block px-5 py-2.5 text-sm text-textDark/85 hover:text-primary hover:bg-bgLight/50 transition-colors font-medium"
                >
                  درمان بیماری‌ها و انکولوژی
                </Link>
              </div>
            </div>

            {/* راهنما و منابع Dropdown */}
            <div className="group relative">
              <Link
                to="/resources"
                className={`hover:text-primary transition-colors text-sm font-bold flex items-center gap-1 ${
                  ['/resources', '/faq', '/video', '/videos'].includes(location.pathname)
                    ? 'text-primary'
                    : 'text-textDark/80'
                }`}
              >
                راهنما و منابع
                <ChevronDown className="w-3.5 h-3.5 transition-transform group-hover:rotate-180" />
              </Link>
              <div className="hidden group-hover:block absolute top-full right-0 bg-white/95 backdrop-blur-xl border border-primary/20 min-w-[210px] rounded-2xl py-2 mt-2 shadow-2xl transition-all before:content-[''] before:absolute before:-top-3 before:left-0 before:right-0 before:h-3">
                <button
                  onClick={() => onOpenChat && onOpenChat()}
                  className="w-full text-right px-5 py-2.5 text-sm text-textDark/85 hover:text-primary hover:bg-bgLight/50 transition-colors flex justify-between items-center font-medium cursor-pointer"
                >
                  <span className="flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-primary" />
                    دستیار هوشمند تریاژ
                  </span>
                  <span className="bg-primary text-white text-[10px] px-2 py-0.5 rounded-full font-bold shadow-sm">
                    جدید
                  </span>
                </button>
                <Link
                  to="/video"
                  className="block px-5 py-2.5 text-sm text-textDark/85 hover:text-primary hover:bg-bgLight/50 transition-colors font-medium"
                >
                  ویدیوهای آموزشی
                </Link>
                <Link
                  to="/resources"
                  className="block px-5 py-2.5 text-sm text-textDark/85 hover:text-primary hover:bg-bgLight/50 transition-colors font-medium"
                >
                  مطالب آموزشی و مقالات
                </Link>
                <Link
                  to="/faq"
                  className="block px-5 py-2.5 text-sm text-textDark/85 hover:text-primary hover:bg-bgLight/50 transition-colors font-medium"
                >
                  سوالات متداول
                </Link>
              </div>
            </div>

            <a
              href="#contact"
              className="text-textDark/80 hover:text-primary transition-colors text-sm font-bold"
            >
              ارتباط با ما
            </a>
          </nav>
        </div>

        {/* Action Buttons Container - Handles overflow gracefully with min-w-0 */}
        <div className="flex items-center gap-1.5 sm:gap-2 md:gap-3 min-w-0 flex-shrink-0">
          {isAuthenticated ? (
            <div className="flex items-center gap-1 sm:gap-1.5 md:gap-2 min-w-0">
              {isAdmin ? (
                <Link
                  to="/admin/appointments"
                  title="پنل مدیریت"
                  className="flex items-center gap-1.5 sm:gap-2 bg-white/70 hover:bg-white border border-primary/20 text-primary text-xs md:text-sm font-bold p-2 sm:py-2 sm:px-4 md:px-5 rounded-full transition-all hover:-translate-y-0.5 shadow-sm cursor-pointer flex-shrink-0"
                >
                  <Shield className="w-4 h-4 shrink-0" />
                  <span className="hidden sm:inline">پنل مدیریت</span>
                </Link>
              ) : (
                <>
                  {/* Calendar / My Appointments: Round icon chip on mobile, full label on sm+ */}
                  <button
                    type="button"
                    onClick={onOpenMyAppointments}
                    title="مشاهده و لغو نوبت‌های من"
                    className="flex items-center gap-1.5 sm:gap-2 bg-white/70 hover:bg-white border border-primary/20 text-primary text-xs md:text-sm font-bold p-2 sm:py-2 sm:px-4 md:px-5 rounded-full transition-all hover:-translate-y-0.5 shadow-sm cursor-pointer flex-shrink-0"
                  >
                    <Calendar className="w-4 h-4 shrink-0" />
                    <span className="hidden sm:inline">نوبت‌های من</span>
                  </button>

                  {/* User Profile Chip: Round icon chip on mobile, name with strict truncation on sm+ */}
                  <div className="relative" ref={profileMenuRef}>
                    <button
                      type="button"
                      onClick={() => setProfileMenuOpen(!profileMenuOpen)}
                      title={user?.full_name || user?.phone_number || 'حساب کاربری'}
                      aria-label="حساب کاربری"
                      aria-expanded={profileMenuOpen}
                      className="flex items-center gap-1.5 bg-white/70 hover:bg-white border border-primary/20 text-textDark text-xs md:text-sm font-bold p-2 sm:py-2 sm:px-3 md:px-4 rounded-full shadow-sm transition-all cursor-pointer flex-shrink-0 min-w-0"
                    >
                      <User className="w-4 h-4 text-primary shrink-0" />
                      <span className="hidden sm:inline max-w-[70px] sm:max-w-[120px] truncate min-w-0">
                        {user?.full_name || user?.phone_number || 'حساب کاربری'}
                      </span>
                    </button>

                    {/* Profile Dropdown Menu for Mobile & Quick Actions */}
                    {profileMenuOpen && (
                      <div className="absolute left-0 top-full mt-2 w-48 bg-white/95 backdrop-blur-xl border border-primary/20 rounded-2xl shadow-xl py-2 z-50 animate-scaleUp text-right">
                        <div className="px-4 py-2 border-b border-primary/10">
                          <p className="text-xs font-bold text-textDark truncate">
                            {user?.full_name || 'کاربر گرامی'}
                          </p>
                          {user?.phone_number && (
                            <p className="text-[10px] text-textDark/60 font-mono mt-0.5" dir="ltr">
                              {user.phone_number}
                            </p>
                          )}
                        </div>

                        <button
                          type="button"
                          onClick={() => {
                            setProfileMenuOpen(false);
                            onOpenMyAppointments?.();
                          }}
                          className="w-full text-right px-4 py-2 text-xs font-bold text-textDark/85 hover:text-primary hover:bg-primary/5 transition-colors flex items-center gap-2 cursor-pointer"
                        >
                          <Calendar className="w-3.5 h-3.5 text-primary shrink-0" />
                          <span>نوبت‌های من</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => {
                            setProfileMenuOpen(false);
                            logout();
                          }}
                          className="w-full text-right px-4 py-2 text-xs font-bold text-red-600 hover:bg-red-50 transition-colors flex items-center gap-2 cursor-pointer border-t border-primary/10 mt-1"
                        >
                          <LogOut className="w-3.5 h-3.5 shrink-0" />
                          <span>خروج از حساب</span>
                        </button>
                      </div>
                    )}
                  </div>
                </>
              )}

              {/* Direct Logout Button: hidden on < md breakpoints to save space, visible on desktop */}
              <button
                onClick={logout}
                title="خروج از حساب"
                className="hidden md:flex items-center gap-2 bg-red-50 hover:bg-red-500 hover:text-white text-red-600 border border-red-200 text-xs md:text-sm font-bold py-2 px-3 md:px-4 rounded-full transition-all hover:-translate-y-0.5 cursor-pointer shadow-sm flex-shrink-0"
              >
                <LogOut className="w-4 h-4 shrink-0" />
                <span className="hidden sm:inline">خروج</span>
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={openAuthModal}
              className="flex items-center gap-1.5 sm:gap-2 bg-white/70 hover:bg-white border border-primary/20 text-primary text-xs md:text-sm font-bold py-2 px-3 sm:px-4 md:px-5 rounded-full transition-all hover:-translate-y-0.5 shadow-sm cursor-pointer flex-shrink-0"
            >
              <LogIn className="w-4 h-4 shrink-0" />
              <span className="whitespace-nowrap">ورود / ثبت‌نام</span>
            </button>
          )}

          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden text-textDark/80 hover:text-primary p-2 rounded-xl hover:bg-white/50 transition-colors cursor-pointer flex items-center justify-center focus:outline-none focus:ring-2 focus:ring-primary/30 flex-shrink-0"
            aria-label={mobileMenuOpen ? 'بستن منو' : 'باز کردن منو'}
            aria-expanded={mobileMenuOpen}
          >
            {mobileMenuOpen ? <X className="w-6 h-6 text-primary" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </header>

      {/* Modern Redesigned Mobile Navigation Sheet */}
      <MobileNavDrawer
        isOpen={mobileMenuOpen}
        onClose={() => setMobileMenuOpen(false)}
        onOpenAppointment={onOpenAppointment}
        onOpenChat={onOpenChat}
        onOpenMyAppointments={onOpenMyAppointments}
      />
    </>
  );
};

export default Header;
