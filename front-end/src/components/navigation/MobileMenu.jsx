import React from 'react';
import { X } from 'lucide-react';

const MobileMenu = ({ open, onClose, onNavigate, onOpenAppointment }) => {
  if (!open) return null;

  const menuItems = [
    { label: 'صفحه نخست', action: () => onNavigate('home') },
    { label: 'ویدیو', action: () => onNavigate('video') },
    { label: 'درباره', action: () => {} },
    { label: 'تماس', action: () => {} },
    { label: 'نظرات', action: () => onNavigate('comments') },
  ];

  return (
    <div className="fixed inset-0 z-50">
      {/* BACKDROP */}
      <div
        className="absolute inset-0 bg-lightText/90 backdrop-blur-md"
        onClick={onClose}
      />

      {/* MENU CONTENT */}
      <div className="relative w-full h-screen flex flex-col items-center justify-center gap-8 text-lg font-medium text-primary">

        {/* CLOSE BUTTON */}
        <button
          onClick={onClose}
          className="absolute top-6 left-6 w-10 h-10 flex items-center justify-center rounded-full bg-primary/10 hover:bg-primary/20 transition"
        >
          <X size={20} />
        </button>

        {menuItems.map((m, i) => (
          <button
            key={i}
            onClick={() => {
              m.action();
              onClose();
            }}
            className="w-48 py-3 rounded-xl bg-secondary/20 hover:bg-secondary/40 transition shadow-sm hover:shadow-md"
          >
            {m.label}
          </button>
        ))}

        <button
          onClick={() => {
            onOpenAppointment();
            onClose();
          }}
          className="bg-gradient-to-r from-primary to-primaryLight text-white py-3 px-8 rounded-xl shadow-lg hover:shadow-xl transition"
        >
          دریافت نوبت
        </button>
      </div>
    </div>
  );
};

export default MobileMenu;
