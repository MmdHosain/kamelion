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
  Film,
  Stethoscope,
  BookOpen,
  HelpCircle,
  Phone,
  Home,
  UserCheck,
  Scissors,
  HeartPulse,
  Calendar,
} from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';

const Header = ({ onOpenAppointment, onOpenChat, onOpenMyAppointments }) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [mobileServicesOpen, setMobileServicesOpen] = useState(false);
  const [mobileResourcesOpen, setMobileResourcesOpen] = useState(false);

  const location = useLocation();
  const { isAuthenticated, user, logout, openAuthModal } = useAuth();

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
                  className="flex items-center gap-1.5 bg-primary/10 hover:bg-primary hover:text-white border border-primary/30 text-primary text-xs md:text-sm font-bold py-2 px-3.5 md:px-4 rounded-full transition-all shadow-sm"
                >
                  <Shield className="w-4 h-4" />
                  <span>پنل مدیریت</span>
                </Link>
              ) : (
                <>
                  <button
                    type="button"
                    onClick={onOpenMyAppointments}
                    title="مشاهده و لغو نوبت‌های من"
                    className="flex items-center gap-1.5 bg-primary/10 hover:bg-primary hover:text-white border border-primary/30 text-primary text-xs font-bold py-2 px-3 md:px-3.5 rounded-full transition-all cursor-pointer shadow-sm"
                  >
                    <Calendar className="w-3.5 h-3.5" />
                    <span className="hidden sm:inline">نوبت‌های من</span>
                  </button>

                  <div className="flex items-center gap-1.5 bg-white/70 border border-primary/20 text-textDark text-xs font-bold py-1.5 px-3 rounded-full shadow-sm">
                    <User className="w-3.5 h-3.5 text-primary" />
                    <span className="max-w-[120px] truncate">{user?.full_name || user?.phone_number || 'حساب کاربری'}</span>
                  </div>
                </>
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
            className="lg:hidden text-textDark/80 hover:text-primary p-1.5 rounded-xl hover:bg-white/50 transition-colors cursor-pointer"
            aria-label="Toggle Menu"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </header>

      {/* Mobile Navigation Backdrop */}
      {mobileMenuOpen && (
        <div
          className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40 lg:hidden animate-fadeSlide"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      {/* Mobile Navigation Drawer with Expandable Dropdowns */}
      {mobileMenuOpen && (
        <nav
          id="mobile-nav"
          className="fixed top-[68px] left-3 right-3 max-h-[85vh] overflow-y-auto chat-scroll z-50 bg-gradient-to-br from-bgLight/98 via-white/98 to-bgDark/98 backdrop-blur-2xl border border-primary/25 rounded-3xl p-5 flex flex-col gap-3 shadow-2xl animate-fadeSlide lg:hidden"
        >
          {/* خانه */}
          <Link
            to="/"
            onClick={handleNavClick}
            className={`flex items-center gap-2.5 font-bold text-sm py-2.5 px-3 rounded-2xl transition-all ${
              location.pathname === '/'
                ? 'bg-primary text-white shadow-sm'
                : 'text-textDark/90 hover:bg-primary/10 hover:text-primary'
            }`}
          >
            <Home size={17} />
            <span>خانه</span>
          </Link>

          {/* آشنایی با پزشک */}
          <Link
            to="/about"
            onClick={handleNavClick}
            className={`flex items-center gap-2.5 font-bold text-sm py-2.5 px-3 rounded-2xl transition-all ${
              location.pathname === '/about'
                ? 'bg-primary text-white shadow-sm'
                : 'text-textDark/90 hover:bg-primary/10 hover:text-primary'
            }`}
          >
            <UserCheck size={17} />
            <span>آشنایی با پزشک</span>
          </Link>

          {/* خدمات (Accordion Dropdown) */}
          <div className="rounded-2xl border border-primary/15 overflow-hidden bg-white/60">
            <button
              type="button"
              onClick={() => setMobileServicesOpen(!mobileServicesOpen)}
              className="w-full flex items-center justify-between font-bold text-sm py-2.5 px-3 text-textDark hover:bg-primary/5 transition-colors cursor-pointer"
            >
              <span className="flex items-center gap-2.5 text-primary-dark">
                <Stethoscope size={17} className="text-primary" />
                <span>خدمات درمانی و زیبایی</span>
              </span>
              <ChevronDown
                size={16}
                className={`text-primary transition-transform duration-300 ${
                  mobileServicesOpen ? 'rotate-180' : ''
                }`}
              />
            </button>

            {mobileServicesOpen && (
              <div className="flex flex-col gap-1 py-2 px-2.5 border-t border-primary/10 bg-primary/5 animate-fadeSlide">
                <Link
                  to="/services"
                  onClick={handleNavClick}
                  className="flex items-center justify-between text-xs font-bold py-2 px-3 rounded-xl text-textDark hover:bg-white hover:text-primary transition-all"
                >
                  <span>همه خدمات کلینیک</span>
                </Link>
                <Link
                  to="/services#beauty"
                  onClick={handleNavClick}
                  className="flex items-center gap-2 text-xs font-medium py-2 px-3 rounded-xl text-textDark/80 hover:bg-white hover:text-primary transition-all"
                >
                  <Scissors size={14} className="text-primary/70" />
                  <span>جراحی‌های زیبایی پستان (ماموپلاستی، پروتز، لیفت)</span>
                </Link>
                <Link
                  to="/services#treatment"
                  onClick={handleNavClick}
                  className="flex items-center gap-2 text-xs font-medium py-2 px-3 rounded-xl text-textDark/80 hover:bg-white hover:text-primary transition-all"
                >
                  <HeartPulse size={14} className="text-primary/70" />
                  <span>درمان بیماری‌ها و انکولوژی پستان</span>
                </Link>
              </div>
            )}
          </div>

          {/* راهنما و منابع (Accordion Dropdown) */}
          <div className="rounded-2xl border border-primary/15 overflow-hidden bg-white/60">
            <button
              type="button"
              onClick={() => setMobileResourcesOpen(!mobileResourcesOpen)}
              className="w-full flex items-center justify-between font-bold text-sm py-2.5 px-3 text-textDark hover:bg-primary/5 transition-colors cursor-pointer"
            >
              <span className="flex items-center gap-2.5 text-primary-dark">
                <BookOpen size={17} className="text-primary" />
                <span>راهنما و منابع</span>
              </span>
              <ChevronDown
                size={16}
                className={`text-primary transition-transform duration-300 ${
                  mobileResourcesOpen ? 'rotate-180' : ''
                }`}
              />
            </button>

            {mobileResourcesOpen && (
              <div className="flex flex-col gap-1 py-2 px-2.5 border-t border-primary/10 bg-primary/5 animate-fadeSlide">
                <button
                  type="button"
                  onClick={() => {
                    handleNavClick();
                    if (onOpenChat) onOpenChat();
                  }}
                  className="w-full flex items-center justify-between text-xs font-bold py-2 px-3 rounded-xl text-textDark hover:bg-white hover:text-primary transition-all cursor-pointer"
                >
                  <span className="flex items-center gap-2">
                    <Sparkles size={14} className="text-primary" />
                    <span>دستیار هوشمند تریاژ</span>
                  </span>
                  <span className="bg-primary text-white text-[10px] px-2 py-0.5 rounded-full font-bold">
                    جدید
                  </span>
                </button>
                <Link
                  to="/video"
                  onClick={handleNavClick}
                  className="flex items-center gap-2 text-xs font-medium py-2 px-3 rounded-xl text-textDark/80 hover:bg-white hover:text-primary transition-all"
                >
                  <Film size={14} className="text-primary/70" />
                  <span>ویدیوهای آموزشی و بالینی</span>
                </Link>
                <Link
                  to="/resources"
                  onClick={handleNavClick}
                  className="flex items-center gap-2 text-xs font-medium py-2 px-3 rounded-xl text-textDark/80 hover:bg-white hover:text-primary transition-all"
                >
                  <BookOpen size={14} className="text-primary/70" />
                  <span>مطالب آموزشی و مقالات</span>
                </Link>
                <Link
                  to="/faq"
                  onClick={handleNavClick}
                  className="flex items-center gap-2 text-xs font-medium py-2 px-3 rounded-xl text-textDark/80 hover:bg-white hover:text-primary transition-all"
                >
                  <HelpCircle size={14} className="text-primary/70" />
                  <span>سوالات متداول</span>
                </Link>
              </div>
            )}
          </div>

          {/* ارتباط با ما */}
          <a
            href="#contact"
            onClick={handleNavClick}
            className="flex items-center gap-2.5 font-bold text-sm py-2.5 px-3 rounded-2xl text-textDark/90 hover:bg-primary/10 hover:text-primary transition-all"
          >
            <Phone size={17} />
            <span>ارتباط با ما</span>
          </a>

          {/* Auth session in drawer */}
          {isAuthenticated ? (
            <div className="flex flex-col gap-2.5 border-t border-primary/15 pt-3 mt-1">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-textDark flex items-center gap-1.5">
                  <User size={15} className="text-primary" />
                  {user?.full_name || user?.phone_number}
                </span>
                <button
                  onClick={() => {
                    handleNavClick();
                    logout();
                  }}
                  className="text-xs font-bold text-red-600 bg-red-50 hover:bg-red-100 px-3 py-1.5 rounded-xl cursor-pointer transition-colors"
                >
                  خروج از حساب
                </button>
              </div>

              {isAdmin ? (
                <Link
                  to="/admin/appointments"
                  onClick={handleNavClick}
                  className="flex items-center justify-center gap-2 text-xs font-bold bg-primary/10 text-primary hover:bg-primary hover:text-white py-2.5 px-3 rounded-2xl transition-all"
                >
                  <Shield size={14} />
                  <span>رفتن به پنل مدیریت</span>
                </Link>
              ) : (
                onOpenMyAppointments && (
                  <button
                    type="button"
                    onClick={() => {
                      handleNavClick();
                      onOpenMyAppointments();
                    }}
                    className="flex items-center justify-center gap-2 bg-primary/10 hover:bg-primary hover:text-white text-primary text-xs font-bold py-2.5 px-3 rounded-2xl transition-all cursor-pointer"
                  >
                    <Calendar size={15} />
                    <span>نوبت‌های من (پیگیری و لغو)</span>
                  </button>
                )
              )}
            </div>
          ) : (
            <button
              type="button"
              onClick={() => {
                handleNavClick();
                openAuthModal();
              }}
              className="w-full bg-white/80 border border-primary/25 text-primary text-center font-bold py-2.5 rounded-2xl hover:bg-white transition-colors flex items-center justify-center gap-2 shadow-sm cursor-pointer mt-1"
            >
              <LogIn size={16} />
              <span>ورود به حساب کاربری</span>
            </button>
          )}

          {/* CTA Book Online */}
          <button
            onClick={() => {
              handleNavClick();
              if (onOpenAppointment) onOpenAppointment();
            }}
            className="bg-primary hover:bg-primary-dark text-white font-bold py-3 px-4 rounded-2xl transition-all shadow-md shadow-primary/25 mt-2 flex items-center justify-center gap-2 cursor-pointer"
          >
            <span>درخواست نوبت آنلاین</span>
          </button>
        </nav>
      )}
    </>
  );
};

export default Header;

