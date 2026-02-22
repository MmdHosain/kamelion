import React from 'react';
import { Menu, Bell, Mail } from 'lucide-react';

const AdminHeader = ({ onMenuClick }) => {
  return (
    <header className="h-16 bg-white border-b flex items-center px-6 gap-4">
      <button
        onClick={onMenuClick}
        className="p-2 rounded-lg hover:bg-[#E6C5CC]/40 transition"
      >
        <Menu size={22} className="text-[#2F5D50]" />
      </button>

      <input
        placeholder="Search..."
        className="flex-1 max-w-md bg-[#FAFAF8] px-4 py-2 rounded-lg text-sm outline-none"
      />

      <div className="flex items-center gap-4">
        <Bell size={20} />
        <Mail size={20} />
        <div className="w-9 h-9 rounded-full bg-[#E6C5CC]" />
      </div>
    </header>
  );
};

export default AdminHeader;
