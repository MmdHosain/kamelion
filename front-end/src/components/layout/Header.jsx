// src/components/layout/Header.jsx
import React, { useState } from 'react';
import { Menu } from 'lucide-react'; // Import Menu icon
import DesktopNav from '../navigation/DesktopNav';
import MobileMenu from '../navigation/MobileMenu';

const Header = ({ scrolled, onNavigate, onOpenAppointment }) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <>
      <header
        className={`sticky top-0 z-50 flex items-center backdrop-blur-xl transition-all duration-700 ease-in-out ${
          scrolled
            ? 'bg-white/70 shadow-[0_4px_20px_-2px_rgba(0,0,0,0.2)] py-2'
            : 'bg-transparent py-4'
        }`}
      >
        <div className="container mx-auto px-6 flex justify-between items-center">
          {/* LOGO + Title */}
          <div className="flex items-center gap-3 cursor-pointer select-none">
            <img
              src="/images/logo.png"
              alt="Logo"
              className={`transition-all duration-500 ${scrolled ? 'h-9' : 'h-10'}`}
            />
            <h1 className="hidden md:flex text-primary text-lg font-bold tracking-tight">
              دکتر <span className="font-normal ml-1">نگار معشوری</span>
            </h1>
          </div>

          {/* DESKTOP NAV */}
          <DesktopNav onNavigate={onNavigate} />

          {/* CTA + Mobile Trigger */}
          <div className="flex items-center gap-3">
            <button
              onClick={onOpenAppointment}
              className="bg-gradient-to-r from-primary to-primaryLight hover:opacity-90 text-white px-4 py-2 rounded-lg text-sm shadow-md hover:shadow-lg transition-all"
            >
              دریافت نوبت
            </button>
            <button
              onClick={() => setMobileMenuOpen(true)}
              className="md:hidden p-2 rounded-md hover:bg-primary/10 transition-all duration-300"
            >
              <Menu className="text-primary" size={24} />
            </button>
          </div>
        </div>
      </header>

      <MobileMenu
        open={mobileMenuOpen}
        onClose={() => setMobileMenuOpen(false)}
        onNavigate={onNavigate}
        onOpenAppointment={onOpenAppointment}
      />
    </>
  );
};

export default Header;
