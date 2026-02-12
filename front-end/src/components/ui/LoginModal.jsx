import React, { useState } from 'react';
import { X } from 'lucide-react';

const LoginModal = ({ open, onClose, onAuthSubmit }) => {
  const [phone, setPhone] = useState('');

  const handleSubmit = () => {
    if (!phone.trim()) return;
    onAuthSubmit(phone, 'login');
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[99999] flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="bg-[#0f1715] w-full max-w-md rounded-2xl p-6 relative border border-[#2F5D50]/30 shadow-xl">
        <button onClick={onClose} className="absolute top-4 left-4 text-[#6B6E6C] hover:text-white">
          <X size={20} />
        </button>

        <h3 className="text-white text-lg font-medium mb-4">ورود با شماره موبایل</h3>

        <div className="space-y-3">
          <input
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="شماره موبایل"
            className="w-full px-4 py-3 rounded-xl bg-[#1a2522] text-white text-sm outline-none border border-[#2F5D50]/20 focus:border-[#2F5D50]"
          />
        </div>

        <button
          onClick={handleSubmit}
          className="w-full mt-5 bg-[#2F5D50] hover:bg-[#264C42] text-white py-3 rounded-xl transition"
        >
          ارسال کد تایید
        </button>
      </div>
    </div>
  );
};

export default LoginModal;