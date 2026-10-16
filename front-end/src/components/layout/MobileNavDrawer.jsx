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
  Calendar,
  ChevronDown,
  ArrowUpLeft,
  MapPin,
  FileText,
} from 'lucide-react';
import RibbonLogo from '../ui/RibbonLogo';
import useBodyScrollLock from '../../hooks/useBodyScrollLock';

const MobileNavDrawer = ({
  isOpen,
  onClose,
  onOpenAppointment,
  onOpenChat,
}) => {
  const [servicesOpen, setServicesOpen] = useState(false);
  const [resourcesOpen, setResourcesOpen] = useState(false);

  const location = useLocation();

  // 1. Lock background page body scroll when mobile menu is open
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

  // 3. Reset accordion states on close
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
        className="fixed inset-0 bg-slate-950/60 backdrop-blur-md transition-opacity duration-300 animate-fadeIn"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Floating Modern Sheet from Top */}
      <div
        id="mobile-nav-sheet"
        role="dialog"
        aria-modal="true"
        aria-label="منوی ناوبری موبایل"
        className="fixed top-3 left-3 right-3 sm:left-6 sm:right-6 sm:max-w-lg sm:mx-auto max-h-[88dvh] bg-gradient-to-b from-white/98 via-bgLight/95 to-white/98 backdrop-blur-2xl border border-primary/25 rounded-[2.5rem] shadow-[0_25px_70px_-15px_rgba(231,84,128,0.35)] flex flex-col overflow-hidden animate-slideDown z-[96]"
        style={{ overscrollBehavior: 'contain' }}
      >
        {/* Sheet Header: Clinic Logo, Doctor Title & Close Button */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-primary/15 bg-white/80 backdrop-blur-xl shrink-0">
          <Link
            to="/"
            onClick={handleLinkClick}
            className="flex items-center gap-3 text-textDark no-underline group"
          >
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-primary/15 to-primary/5 border border-primary/20 flex items-center justify-center shadow-xs group-hover:scale-105 transition-transform">
              <RibbonLogo className="w-6 h-6" />
            </div>
            <div className="flex flex-col">
              <span className="text-base font-black text-textDark leading-tight tracking-tight">
                دکتر نگار معشوری
              </span>
              <span className="text-[11px] text-primary font-bold mt-0.5">
                جراح و متخصص بیماری‌های پستان
              </span>
            </div>
          </Link>

          <button
            type="button"
            onClick={onClose}
            aria-label="بستن منو"
            className="w-9 h-9 rounded-2xl bg-primary/10 hover:bg-primary text-textDark hover:text-white border border-primary/20 flex items-center justify-center transition-all cursor-pointer shadow-xs active:scale-95"
          >
            <X size={18} strokeWidth={2.5} />
          </button>
        </div>

        {/* Scrollable Navigation Body */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-6 flex flex-col gap-4 chat-scroll">
          {/* Quick Dual Action Cards: Online Booking & Smart AI Triage */}
          <div className="grid grid-cols-2 gap-2.5 shrink-0">
            {/* Action 1: Booking */}
            <button
              type="button"
              onClick={() => {
                handleLinkClick();
                if (onOpenAppointment) onOpenAppointment();
              }}
              className="group relative overflow-hidden bg-gradient-to-br from-primary to-primary-dark text-white p-3.5 rounded-2xl text-right shadow-md shadow-primary/25 hover:shadow-lg hover:shadow-primary/30 transition-all cursor-pointer active:scale-98 flex flex-col justify-between h-[90px]"
            >
              <div className="flex items-center justify-between w-full">
                <div className="w-7 h-7 rounded-xl bg-white/20 backdrop-blur-md flex items-center justify-center">
                  <Calendar size={15} className="text-white" />
                </div>
                <ArrowUpLeft size={16} className="text-white/70 group-hover:translate-x-[-2px] group-hover:translate-y-[2px] transition-transform" />
              </div>
              <div>
                <span className="block text-xs font-black text-white">رزرو وقت ویزیت</span>
                <span className="block text-[10px] text-white/80 font-medium mt-0.5">انتخاب نوبت آنلاین</span>
              </div>
            </button>

            {/* Action 2: AI Triage */}
            <button
              type="button"
              onClick={() => {
                handleLinkClick();
                if (onOpenChat) onOpenChat();
              }}
              className="group relative overflow-hidden bg-white hover:bg-primary/5 text-textDark border border-primary/30 p-3.5 rounded-2xl text-right shadow-xs hover:border-primary/50 transition-all cursor-pointer active:scale-98 flex flex-col justify-between h-[90px]"
            >
              <div className="flex items-center justify-between w-full">
                <div className="w-7 h-7 rounded-xl bg-primary/10 flex items-center justify-center">
                  <Sparkles size={15} className="text-primary animate-pulse" />
                </div>
                <div className="flex items-center gap-1 bg-emerald-50 border border-emerald-200 px-1.5 py-0.5 rounded-full">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                  <span className="text-[9px] font-bold text-emerald-700">آنلاین</span>
                </div>
              </div>
              <div>
                <span className="block text-xs font-black text-textDark group-hover:text-primary transition-colors">تریاژ و مشاوره</span>
                <span className="block text-[10px] text-textDark/65 font-medium mt-0.5">بررسی هوشمند علائم</span>
              </div>
            </button>
          </div>

          {/* Navigation Section */}
          <div className="flex flex-col gap-2">
            {/* صفحه اصلی */}
            <Link
              to="/"
              onClick={handleLinkClick}
              className={`flex items-center justify-between font-bold text-sm py-3 px-4 rounded-2xl transition-all duration-200 ${
                location.pathname === '/'
                  ? 'bg-gradient-to-r from-primary to-primary-dark text-white shadow-md shadow-primary/20'
                  : 'text-textDark bg-white/60 hover:bg-white hover:text-primary border border-primary/10'
              }`}
            >
              <span className="flex items-center gap-3">
                <Home size={18} />
                <span>صفحه اصلی</span>
              </span>
              <ArrowUpLeft size={15} className="opacity-60" />
            </Link>

            {/* آشنایی با پزشک */}
            <Link
              to="/about"
              onClick={handleLinkClick}
              className={`flex items-center justify-between font-bold text-sm py-3 px-4 rounded-2xl transition-all duration-200 ${
                location.pathname === '/about'
                  ? 'bg-gradient-to-r from-primary to-primary-dark text-white shadow-md shadow-primary/20'
                  : 'text-textDark bg-white/60 hover:bg-white hover:text-primary border border-primary/10'
              }`}
            >
              <span className="flex items-center gap-3">
                <UserCheck size={18} />
                <span>بیوگرافی و سوابق پزشک</span>
              </span>
              <ArrowUpLeft size={15} className="opacity-60" />
            </Link>

            {/* خدمات درمانی و زیبایی (Expandable Accordion) */}
            <div className="rounded-2xl border border-primary/15 overflow-hidden bg-white/70 shadow-xs transition-all">
              <button
                type="button"
                onClick={() => setServicesOpen(!servicesOpen)}
                className="w-full flex items-center justify-between font-bold text-sm py-3 px-4 text-textDark hover:bg-primary/5 transition-colors cursor-pointer"
              >
                <span className="flex items-center gap-3 text-textDark">
                  <Stethoscope size={18} className="text-primary" />
                  <span>خدمات تخصصی کلینیک</span>
                </span>
                <ChevronDown
                  size={16}
                  className={`text-primary transition-transform duration-300 ${
                    servicesOpen ? 'rotate-180' : ''
                  }`}
                />
              </button>

              {servicesOpen && (
                <div className="flex flex-col gap-1.5 p-2.5 border-t border-primary/10 bg-primary/[0.03] animate-fadeSlide">
                  <Link
                    to="/services/aesthetic"
                    onClick={handleLinkClick}
                    className="flex items-center gap-2.5 text-xs font-medium py-2.5 px-3.5 rounded-xl text-textDark/85 hover:bg-white hover:text-primary transition-all"
                  >
                    <Scissors size={14} className="text-primary/70 shrink-0" />
                    <span>جراحی‌های زیبایی پستان (ماموپلاستی، پروتز، لیفت)</span>
                  </Link>

                  <Link
                    to="/services/therapeutic"
                    onClick={handleLinkClick}
                    className="flex items-center gap-2.5 text-xs font-medium py-2.5 px-3.5 rounded-xl text-textDark/85 hover:bg-white hover:text-primary transition-all"
                  >
                    <HeartPulse size={14} className="text-primary/70 shrink-0" />
                    <span>درمان بیماری‌ها، توده‌ها و انکولوژی</span>
                  </Link>
                </div>
              )}
            </div>

            {/* راهنما و دانستنی‌های پزشکی (Expandable Accordion) */}
            <div className="rounded-2xl border border-primary/15 overflow-hidden bg-white/70 shadow-xs transition-all">
              <button
                type="button"
                onClick={() => setResourcesOpen(!resourcesOpen)}
                className="w-full flex items-center justify-between font-bold text-sm py-3 px-4 text-textDark hover:bg-primary/5 transition-colors cursor-pointer"
              >
                <span className="flex items-center gap-3 text-textDark">
                  <BookOpen size={18} className="text-primary" />
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
                <div className="flex flex-col gap-1.5 p-2.5 border-t border-primary/10 bg-primary/[0.03] animate-fadeSlide">
                  <Link
                    to="/video"
                    onClick={handleLinkClick}
                    className="flex items-center gap-2.5 text-xs font-medium py-2.5 px-3.5 rounded-xl text-textDark/85 hover:bg-white hover:text-primary transition-all"
                  >
                    <Film size={14} className="text-primary/70 shrink-0" />
                    <span>ویدیوهای آموزشی و بالینی</span>
                  </Link>

                  <Link
                    to="/resources"
                    onClick={handleLinkClick}
                    className="flex items-center gap-2.5 text-xs font-medium py-2.5 px-3.5 rounded-xl text-textDark/85 hover:bg-white hover:text-primary transition-all"
                  >
                    <FileText size={14} className="text-primary/70 shrink-0" />
                    <span>مقالات و مطالب آموزشی</span>
                  </Link>

                  <Link
                    to="/faq"
                    onClick={handleLinkClick}
                    className="flex items-center gap-2.5 text-xs font-medium py-2.5 px-3.5 rounded-xl text-textDark/85 hover:bg-white hover:text-primary transition-all"
                  >
                    <HelpCircle size={14} className="text-primary/70 shrink-0" />
                    <span>پرسش‌های متداول بیماران</span>
                  </Link>
                </div>
              )}
            </div>

            {/* ارتباط و موقعیت مطب */}
            <a
              href="#contact"
              onClick={handleLinkClick}
              className="flex items-center justify-between font-bold text-sm py-3 px-4 rounded-2xl text-textDark bg-white/60 hover:bg-white hover:text-primary border border-primary/10 transition-all duration-200"
            >
              <span className="flex items-center gap-3">
                <MapPin size={18} className="text-primary" />
                <span>اطلاعات تماس و آدرس مطب</span>
              </span>
              <ArrowUpLeft size={15} className="opacity-60" />
            </a>
          </div>
        </div>

        {/* Minimalist Aesthetic Footer */}
        <div className="px-6 py-3.5 border-t border-primary/15 bg-white/70 backdrop-blur-md flex items-center justify-center shrink-0">
          <p className="text-[11px] text-textDark/60 font-medium text-center">
            کلینیک تخصصی بیماری‌ها و جراحی پستان دکتر نگار معشوری
          </p>
        </div>
      </div>
    </div>
  );
};

export default MobileNavDrawer;
