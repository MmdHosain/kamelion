import React, { useState } from 'react';
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

  const location = useLocation();
  const { isAuthenticated, user, logout, openAuthModal } = useAuth();

  const isAdmin = user?.role === 'admin' || user?.is_staff === true || user?.is_superuser === true;

  return (
    <>
      <header
        id="site-header"
        className="fixed top-0 left-0 right-0 z-50 flex justify-between items-center px-6 py-3.5 bg-gradient-to-r from-bgLight/90 to-bgDark/90 backdrop-blur-xl border-b border-primary/20 transition-all duration-300 shadow-sm"
      >
        <div className="flex items-center">
          <Link
            to="/"
            className="text-textDark text-xl md:text-2xl font-black tracking-tight no-underline flex items-center gap-2.5"
          >
            <RibbonLogo className="w-7 h-7 md:w-8 md:h-8" />
            <span>دکتر معشوری</span>
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
                to="/services"
                className={`hover:text-primary transition-colors text-sm font-bold flex items-center gap-1 ${
                  location.pathname === '/services' ? 'text-primary' : 'text-textDark/80'
                }`}
              >
                خدمات
                <ChevronDown className="w-3.5 h-3.5 transition-transform group-hover:rotate-180" />
              </Link>
              <div className="hidden group-hover:block absolute top-full right-0 bg-white/95 backdrop-blur-xl border border-primary/20 min-w-[190px] rounded-2xl py-2 mt-2 shadow-2xl transition-all before:content-[''] before:absolute before:-top-3 before:left-0 before:right-0 before:h-3">
                <Link
                  to="/services#beauty"
                  className="block px-5 py-2.5 text-sm text-textDark/85 hover:text-primary hover:bg-bgLight/50 transition-colors font-medium"
                >
                  جراحی‌های زیبایی پستان
                </Link>
                <Link
                  to="/services#treatment"
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

        <div className="flex items-center gap-3">
          {isAuthenticated ? (
            <div className="flex items-center gap-2">
              {isAdmin ? (
                <Link
                  to="/admin/appointments"
                  className="flex items-center gap-2 bg-white/70 hover:bg-white border border-primary/20 text-primary text-xs md:text-sm font-bold py-2 px-4 md:px-5 rounded-full transition-all hover:-translate-y-0.5 shadow-sm cursor-pointer"
                >
                  <Shield className="w-4 h-4" />
                  <span className="hidden sm:inline">پنل مدیریت</span>
                </Link>
              ) : (
                <>
                  <button
                    type="button"
                    onClick={onOpenMyAppointments}
                    title="مشاهده و لغو نوبت‌های من"
                    className="flex items-center gap-2 bg-white/70 hover:bg-white border border-primary/20 text-primary text-xs md:text-sm font-bold py-2 px-4 md:px-5 rounded-full transition-all hover:-translate-y-0.5 shadow-sm cursor-pointer"
                  >
                    <Calendar className="w-4 h-4" />
                    <span className="hidden sm:inline">نوبت‌های من</span>
                  </button>

                  <div className="flex items-center gap-1.5 bg-white/70 border border-primary/20 text-textDark text-xs md:text-sm font-bold py-2 px-3 md:px-4 rounded-full shadow-sm">
                    <User className="w-4 h-4 text-primary" />
                    <span className="max-w-[120px] truncate">{user?.full_name || user?.phone_number || 'حساب کاربری'}</span>
                  </div>
                </>
              )}

              <button
                onClick={logout}
                title="خروج از حساب"
                className="flex items-center gap-2 bg-red-50 hover:bg-red-500 hover:text-white text-red-600 border border-red-200 text-xs md:text-sm font-bold py-2 px-3 md:px-4 rounded-full transition-all hover:-translate-y-0.5 cursor-pointer shadow-sm"
              >
                <LogOut className="w-4 h-4" />
                <span className="hidden sm:inline">خروج</span>
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={openAuthModal}
              className="flex items-center gap-2 bg-white/70 hover:bg-white border border-primary/20 text-primary text-xs md:text-sm font-bold py-2 px-4 md:px-5 rounded-full transition-all hover:-translate-y-0.5 shadow-sm cursor-pointer"
            >
              <LogIn className="w-4 h-4" />
              <span>ورود / ثبت‌نام</span>
            </button>
          )}

          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden text-textDark/80 hover:text-primary p-2 rounded-xl hover:bg-white/50 transition-colors cursor-pointer flex items-center justify-center focus:outline-none focus:ring-2 focus:ring-primary/30"
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
      />
    </>
  );
};


export default Header;
