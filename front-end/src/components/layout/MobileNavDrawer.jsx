// src/components/layout/MobileNavDrawer.jsx
import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  X,
  Home,
  UserCheck,
  Stethoscope,
  Scissors,
  HeartPulse,
  BookOpen,
  Sparkles,
  Film,
  HelpCircle,
  Phone,
  Calendar,
  LogIn,
  LogOut,
  Shield,
  User,
  ChevronDown,
  Clock,
  PhoneCall,
} from 'lucide-react';
import RibbonLogo from '../ui/RibbonLogo';
import { useAuth } from '../../hooks/useAuth';
import useBodyScrollLock from '../../hooks/useBodyScrollLock';

const MobileNavDrawer = ({
  isOpen,
  onClose,
  onOpenAppointment,
  onOpenChat,
  onOpenMyAppointments,
}) => {
  const [servicesOpen, setServicesOpen] = useState(false);
  const [resourcesOpen, setResourcesOpen] = useState(false);

  const location = useLocation();
  const { isAuthenticated, user, logout, openAuthModal } = useAuth();
  const isAdmin = user?.role === 'admin' || user?.is_staff === true || user?.is_superuser === true;

  // 1. Lock background body scroll when mobile menu is open
  useBodyScrollLock(isOpen);

  // 2. Close on ESC key
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  // 3. Reset accordions on close
  useEffect(() => {
    if (!isOpen) {
      setServicesOpen(false);
      setResourcesOpen(false);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleLinkClick = () => {
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[95] lg:hidden">
      {/* Dimmed & Blurred Backdrop */}
      <div
        className="fixed inset-0 bg-slate-900/60 backdrop-blur-md transition-opacity duration-300 animate-fadeIn"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Floating Modern Sheet from Top */}
      <div
        id="mobile-nav-sheet"
        role="dialog"
        aria-modal="true"
        aria-label="منوی ناوبری موبایل"
        className="fixed top-3 left-3 right-3 sm:left-6 sm:right-6 sm:max-w-lg sm:mx-auto max-h-[90dvh] bg-gradient-to-b from-white/98 via-bgLight/98 to-white/98 backdrop-blur-2xl border border-primary/25 rounded-[2rem] shadow-[0_25px_60px_-15px_rgba(231,84,128,0.3)] flex flex-col overflow-hidden animate-slideDown z-[96]"
        style={{ overscrollBehavior: 'contain' }}
      >
        {/* Sheet Header: Clinic Logo, Title & Close Button */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-primary/15 bg-white/70 backdrop-blur-xl shrink-0">
          <Link
            to="/"
            onClick={handleLinkClick}
            className="flex items-center gap-2.5 text-textDark no-underline group"
          >
            <div className="p-1 rounded-xl bg-primary/10 border border-primary/20 group-hover:scale-105 transition-transform">
              <RibbonLogo className="w-7 h-7" />
            </div>
            <div className="flex flex-col">
              <span className="text-base font-black text-textDark leading-tight">
                دکتر نگار معشوری
              </span>
              <span className="text-[11px] text-primary font-bold">
                جراح و متخصص بیماری‌های پستان
              </span>
            </div>
          </Link>

          <button
            type="button"
            onClick={onClose}
            aria-label="بستن منو"
            className="w-9 h-9 rounded-xl bg-primary/10 hover:bg-primary text-textDark hover:text-white border border-primary/20 flex items-center justify-center transition-all cursor-pointer shadow-xs active:scale-95"
          >
            <X size={18} strokeWidth={2.5} />
          </button>
        </div>

        {/* Scrollable Navigation Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5 flex flex-col gap-3.5 chat-scroll">
          {/* Quick CTAs: Book Appointment & Smart Triage */}
          <div className="grid grid-cols-2 gap-2 shrink-0">
            <button
              type="button"
              onClick={() => {
                handleLinkClick();
                if (onOpenAppointment) onOpenAppointment();
              }}
              className="bg-gradient-to-r from-primary to-primary-dark hover:brightness-105 text-white py-2.5 px-3 rounded-2xl text-xs font-black shadow-md shadow-primary/25 flex items-center justify-center gap-1.5 transition-all cursor-pointer active:scale-98"
            >
              <Calendar size={15} />
              <span>رزرو آنلاین نوبت</span>
            </button>

            <button
              type="button"
              onClick={() => {
                handleLinkClick();
                if (onOpenChat) onOpenChat();
              }}
              className="bg-white hover:bg-primary/5 text-primary border border-primary/30 py-2.5 px-3 rounded-2xl text-xs font-black shadow-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer active:scale-98"
            >
              <Sparkles size={15} className="text-primary animate-pulse" />
              <span>تریاژ هوشمند</span>
              <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
            </button>
          </div>

          {/* Main Navigation Items */}
          <div className="flex flex-col gap-1.5">
            {/* خانه */}
            <Link
              to="/"
              onClick={handleLinkClick}
              className={`flex items-center gap-3 font-bold text-sm py-2.5 px-3.5 rounded-2xl transition-all ${
                location.pathname === '/'
                  ? 'bg-primary text-white shadow-sm'
                  : 'text-textDark hover:bg-primary/10 hover:text-primary'
              }`}
            >
              <Home size={17} />
              <span>صفحه اصلی</span>
            </Link>

            {/* آشنایی با پزشک */}
            <Link
              to="/about"
              onClick={handleLinkClick}
              className={`flex items-center gap-3 font-bold text-sm py-2.5 px-3.5 rounded-2xl transition-all ${
                location.pathname === '/about'
                  ? 'bg-primary text-white shadow-sm'
                  : 'text-textDark hover:bg-primary/10 hover:text-primary'
              }`}
            >
              <UserCheck size={17} />
              <span>بیوگرافی و آشنایی با پزشک</span>
            </Link>

            {/* خدمات کلینیک (آکاردئون) */}
            <div className="rounded-2xl border border-primary/15 overflow-hidden bg-white/70 shadow-xs">
              <button
                type="button"
                onClick={() => setServicesOpen(!servicesOpen)}
                className="w-full flex items-center justify-between font-bold text-sm py-2.5 px-3.5 text-textDark hover:bg-primary/5 transition-colors cursor-pointer"
              >
                <span className="flex items-center gap-3 text-textDark">
                  <Stethoscope size={17} className="text-primary" />
                  <span>خدمات درمانی و زیبایی</span>
                </span>
                <ChevronDown
                  size={16}
                  className={`text-primary transition-transform duration-300 ${
                    servicesOpen ? 'rotate-180' : ''
                  }`}
                />
              </button>

              {servicesOpen && (
                <div className="flex flex-col gap-1 py-2 px-2.5 border-t border-primary/10 bg-primary/5 animate-fadeSlide">
                  <Link
                    to="/services"
                    onClick={handleLinkClick}
                    className="flex items-center justify-between text-xs font-bold py-2 px-3 rounded-xl text-textDark hover:bg-white hover:text-primary transition-all"
                  >
                    <span>همه خدمات کلینیک</span>
                  </Link>
                  <Link
                    to="/services#beauty"
                    onClick={handleLinkClick}
                    className="flex items-center gap-2 text-xs font-medium py-2 px-3 rounded-xl text-textDark/85 hover:bg-white hover:text-primary transition-all"
                  >
                    <Scissors size={14} className="text-primary/70 shrink-0" />
                    <span>جراحی‌های زیبایی پستان (ماموپلاستی، پروتز، لیفت)</span>
                  </Link>
                  <Link
                    to="/services#treatment"
                    onClick={handleLinkClick}
                    className="flex items-center gap-2 text-xs font-medium py-2 px-3 rounded-xl text-textDark/85 hover:bg-white hover:text-primary transition-all"
                  >
                    <HeartPulse size={14} className="text-primary/70 shrink-0" />
                    <span>درمان بیماری‌ها، توده‌ها و انکولوژی</span>
                  </Link>
                </div>
              )}
            </div>

            {/* راهنما و منابع علمی (آکاردئون) */}
            <div className="rounded-2xl border border-primary/15 overflow-hidden bg-white/70 shadow-xs">
              <button
                type="button"
                onClick={() => setResourcesOpen(!resourcesOpen)}
                className="w-full flex items-center justify-between font-bold text-sm py-2.5 px-3.5 text-textDark hover:bg-primary/5 transition-colors cursor-pointer"
              >
                <span className="flex items-center gap-3 text-textDark">
                  <BookOpen size={17} className="text-primary" />
                  <span>راهنما و دانستنی‌های پزشکی</span>
                </span>
                <ChevronDown
                  size={16}
                  className={`text-primary transition-transform duration-300 ${
                    resourcesOpen ? 'rotate-180' : ''
                  }`}
                />
              </button>

              {resourcesOpen && (
                <div className="flex flex-col gap-1 py-2 px-2.5 border-t border-primary/10 bg-primary/5 animate-fadeSlide">
                  <Link
                    to="/video"
                    onClick={handleLinkClick}
                    className="flex items-center gap-2 text-xs font-medium py-2 px-3 rounded-xl text-textDark/85 hover:bg-white hover:text-primary transition-all"
                  >
                    <Film size={14} className="text-primary/70 shrink-0" />
                    <span>ویدیوهای آموزشی و بالینی</span>
                  </Link>
                  <Link
                    to="/resources"
                    onClick={handleLinkClick}
                    className="flex items-center gap-2 text-xs font-medium py-2 px-3 rounded-xl text-textDark/85 hover:bg-white hover:text-primary transition-all"
                  >
                    <BookOpen size={14} className="text-primary/70 shrink-0" />
                    <span>مطالب آموزشی و مقالات علمی</span>
                  </Link>
                  <Link
                    to="/faq"
                    onClick={handleLinkClick}
                    className="flex items-center gap-2 text-xs font-medium py-2 px-3 rounded-xl text-textDark/85 hover:bg-white hover:text-primary transition-all"
                  >
                    <HelpCircle size={14} className="text-primary/70 shrink-0" />
                    <span>پرسش‌های متداول بیماران</span>
                  </Link>
                </div>
              )}
            </div>

            {/* تماس با مطب */}
            <a
              href="#contact"
              onClick={handleLinkClick}
              className="flex items-center gap-3 font-bold text-sm py-2.5 px-3.5 rounded-2xl text-textDark hover:bg-primary/10 hover:text-primary transition-all"
            >
              <Phone size={17} />
              <span>ارتباط و موقعیت مطب</span>
            </a>
          </div>

          {/* User Profile / Auth Status Card */}
          <div className="border-t border-primary/15 pt-3 mt-1 shrink-0">
            {isAuthenticated ? (
              <div className="bg-white/80 border border-primary/20 rounded-2xl p-3 flex flex-col gap-2.5 shadow-xs">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-primary/15 text-primary flex items-center justify-center font-bold text-xs">
                      <User size={15} />
                    </div>
                    <div className="flex flex-col">
                      <span className="text-xs font-bold text-textDark">
                        {user?.full_name || 'کاربر گرامی'}
                      </span>
                      <span className="text-[10px] text-textDark/60 font-mono" dir="ltr">
                        {user?.phone_number}
                      </span>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      handleLinkClick();
                      logout();
                    }}
                    title="خروج از حساب کاربری"
                    className="text-xs font-bold text-red-600 bg-red-50 hover:bg-red-100 px-2.5 py-1.5 rounded-xl cursor-pointer transition-colors flex items-center gap-1"
                  >
                    <LogOut size={13} />
                    <span>خروج</span>
                  </button>
                </div>

                {isAdmin ? (
                  <Link
                    to="/admin/appointments"
                    onClick={handleLinkClick}
                    className="flex items-center justify-center gap-1.5 text-xs font-bold bg-primary text-white py-2 px-3 rounded-xl transition-all shadow-sm"
                  >
                    <Shield size={14} />
                    <span>ورود به پنل مدیریت کلینیک</span>
                  </Link>
                ) : (
                  onOpenMyAppointments && (
                    <button
                      type="button"
                      onClick={() => {
                        handleLinkClick();
                        onOpenMyAppointments();
                      }}
                      className="flex items-center justify-center gap-1.5 bg-primary/10 hover:bg-primary hover:text-white text-primary text-xs font-bold py-2 px-3 rounded-xl transition-all cursor-pointer"
                    >
                      <Calendar size={14} />
                      <span>نوبت‌های من (پیگیری و لغو)</span>
                    </button>
                  )
                )}
              </div>
            ) : (
              <button
                type="button"
                onClick={() => {
                  handleLinkClick();
                  openAuthModal();
                }}
                className="w-full bg-white hover:bg-primary hover:text-white border border-primary/25 text-primary text-center font-bold py-2.5 px-4 rounded-2xl transition-all flex items-center justify-center gap-2 shadow-xs cursor-pointer"
              >
                <LogIn size={16} />
                <span>ورود به حساب کاربری / ثبت‌نام</span>
              </button>
            )}
          </div>
        </div>

        {/* Sheet Footer: Direct Call Action & Working Hours */}
        <div className="px-5 py-3 border-t border-primary/15 bg-white/60 backdrop-blur-md flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2 text-xs text-textDark/70 font-medium">
            <Clock size={14} className="text-primary" />
            <span>شنبه تا چهارشنبه ۱۶ الی ۲۰</span>
          </div>

          <a
            href="tel:02112345678"
            className="flex items-center gap-1.5 bg-emerald-50 hover:bg-emerald-500 text-emerald-700 hover:text-white border border-emerald-200 text-xs font-bold py-1.5 px-3 rounded-xl transition-colors no-underline shadow-xs"
          >
            <PhoneCall size={13} />
            <span>تماس مستقیم</span>
          </a>
        </div>
      </div>
    </div>
  );
};

export default MobileNavDrawer;
