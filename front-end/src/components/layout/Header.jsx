import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ChevronDown, LogIn, LogOut, Menu, X, Sparkles, Shield, User } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';

const Header = ({ onOpenAppointment, onOpenChat }) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();
  const { isAuthenticated, user, logout } = useAuth();

  const isAdmin = user?.role === 'admin' || user?.is_staff === true || user?.is_superuser === true;

  const handleNavClick = () => {
    setMobileMenuOpen(false);
  };

  return (
    <>
      <header
        id="site-header"
        className="fixed top-0 left-0 right-0 z-50 flex justify-between items-center px-6 py-3.5 bg-gradient-to-r from-bgLight/90 to-bgDark/90 backdrop-blur-xl border-b border-primary/20 transition-all duration-300 shadow-sm"
      >
        <div className="flex items-center">
          <Link
            to="/"
            className="text-textDark text-xl md:text-2xl font-black tracking-tight no-underline flex items-center gap-2"
          >
            <svg
              className="w-7 h-7 md:w-8 md:h-8 text-primary"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M8 9.5a4 4 0 1 0 8 0c0-2-1.5-4-2.5-4.5-1-.5-2.5-1-3-1s-2 .5-3 1-2.5 2.5-2.5 4.5z" />
              <path d="M8 9.5c0 2 1.5 4.5 3 6.5l-3 6.5" />
              <path d="M16 9.5c0 2-1.5 4.5-3 6.5l3 6.5" />
            </svg>
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
                  location.pathname === '/resources' || location.pathname === '/faq' ? 'text-primary' : 'text-textDark/80'
                }`}
              >
                راهنما و منابع
                <ChevronDown className="w-3.5 h-3.5 transition-transform group-hover:rotate-180" />
              </Link>
              <div className="hidden group-hover:block absolute top-full right-0 bg-white/95 backdrop-blur-xl border border-primary/20 min-w-[200px] rounded-2xl py-2 mt-2 shadow-2xl transition-all before:content-[''] before:absolute before:-top-3 before:left-0 before:right-0 before:h-3">
                <button
                  onClick={() => onOpenChat && onOpenChat()}
                  className="w-full text-right px-5 py-2.5 text-sm text-textDark/85 hover:text-primary hover:bg-bgLight/50 transition-colors flex justify-between items-center font-medium"
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
                  to="/faq"
                  className="block px-5 py-2.5 text-sm text-textDark/85 hover:text-primary hover:bg-bgLight/50 transition-colors font-medium"
                >
                  سوالات متداول
                </Link>
                <Link
                  to="/resources"
                  className="block px-5 py-2.5 text-sm text-textDark/85 hover:text-primary hover:bg-bgLight/50 transition-colors font-medium"
                >
                  مطالب آموزشی و مقالات
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
                  className="flex items-center gap-1.5 bg-primary/10 hover:bg-primary hover:text-white border border-primary/30 text-primary text-xs md:text-sm font-bold py-2 px-3.5 md:px-4 rounded-full transition-all shadow-sm"
                >
                  <Shield className="w-4 h-4" />
                  <span>پنل مدیریت</span>
                </Link>
              ) : (
                <div className="flex items-center gap-1.5 bg-white/70 border border-primary/20 text-textDark text-xs font-bold py-1.5 px-3 rounded-full shadow-sm">
                  <User className="w-3.5 h-3.5 text-primary" />
                  <span>{user?.full_name || user?.phone_number || 'حساب کاربری'}</span>
                </div>
              )}

              <button
                onClick={logout}
                title="خروج از حساب"
                className="flex items-center gap-1 bg-red-50 hover:bg-red-500 hover:text-white text-red-600 border border-red-200 text-xs font-bold py-2 px-3 rounded-full transition-all cursor-pointer shadow-sm"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">خروج</span>
              </button>
            </div>
          ) : (
            <Link
              to="/admin/login"
              className="flex items-center gap-2 bg-white/70 hover:bg-white border border-primary/20 text-primary text-xs md:text-sm font-bold py-2 px-4 md:px-5 rounded-full transition-all hover:-translate-y-0.5 shadow-sm"
            >
              <LogIn className="w-4 h-4" />
              <span>ورود ادمین</span>
            </Link>
          )}

          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden text-textDark/80 hover:text-primary p-1.5 rounded-xl hover:bg-white/50 transition-colors"
            aria-label="Toggle Menu"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </header>

      {/* Mobile Navigation Drawer */}
      {mobileMenuOpen && (
        <nav
          id="mobile-nav"
          className="fixed top-[70px] left-4 right-4 z-50 bg-gradient-to-br from-bgLight/95 to-bgDark/95 backdrop-blur-2xl border border-primary/25 rounded-3xl p-6 flex flex-col gap-4 shadow-2xl animate-fadeSlide lg:hidden"
        >
          <Link
            to="/"
            onClick={handleNavClick}
            className="text-textDark/90 hover:text-primary font-bold text-base border-b border-primary/10 pb-2.5 transition-colors"
          >
            خانه
          </Link>
          <Link
            to="/about"
            onClick={handleNavClick}
            className="text-textDark/90 hover:text-primary font-bold text-base border-b border-primary/10 pb-2.5 transition-colors"
          >
            آشنایی با پزشک
          </Link>
          <Link
            to="/services"
            onClick={handleNavClick}
            className="text-textDark/90 hover:text-primary font-bold text-base border-b border-primary/10 pb-2.5 transition-colors"
          >
            خدمات درمانی و زیبایی
          </Link>
          <Link
            to="/faq"
            onClick={handleNavClick}
            className="text-textDark/90 hover:text-primary font-bold text-base border-b border-primary/10 pb-2.5 transition-colors"
          >
            سوالات متداول
          </Link>
          <Link
            to="/resources"
            onClick={handleNavClick}
            className="text-textDark/90 hover:text-primary font-bold text-base border-b border-primary/10 pb-2.5 transition-colors"
          >
            مطالب آموزشی
          </Link>
          <a
            href="#contact"
            onClick={handleNavClick}
            className="text-textDark/90 hover:text-primary font-bold text-base border-b border-primary/10 pb-2.5 transition-colors"
          >
            ارتباط با ما
          </a>

          {isAuthenticated && (
            <div className="flex items-center justify-between border-t border-primary/15 pt-3">
              <span className="text-xs font-bold text-textDark">
                {user?.full_name || user?.phone_number}
              </span>
              <button
                onClick={() => {
                  handleNavClick();
                  logout();
                }}
                className="text-xs font-bold text-red-600 bg-red-50 px-3 py-1.5 rounded-xl"
              >
                خروج از حساب
              </button>
            </div>
          )}

          <button
            onClick={() => {
              handleNavClick();
              if (onOpenAppointment) onOpenAppointment();
            }}
            className="bg-primary hover:bg-primary-dark text-white font-bold py-3 rounded-2xl transition-all shadow-md mt-1"
          >
            درخواست نوبت آنلاین
          </button>
        </nav>
      )}
    </>
  );
};

export default Header;
