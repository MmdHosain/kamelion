import React, { useState } from 'react';
import { X } from 'lucide-react';

const OtpModal = ({ open, phoneNumber, onVerify, onClose, loading, error }) => {
  const [code, setCode] = useState('');

  const handleSubmit = () => {
    if (!code.trim()) return;
    onVerify(code);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') handleSubmit();
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[99999] flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="bg-[#0f1715] w-full max-w-md rounded-2xl p-6 relative border border-[#2F5D50]/30 shadow-xl">
        <button onClick={onClose} className="absolute top-4 left-4 text-[#6B6E6C] hover:text-white">
          <X size={20} />
        </button>

        <h3 className="text-white text-lg font-medium mb-2">کد تایید را وارد کنید</h3>
        <p className="text-[#6B6E6C] text-sm mb-6">
          کد ۵ رقمی به {phoneNumber} ارسال شد
        </p>

        {error && (
          <div className="mb-4 p-3 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400 text-sm">
            {error}
          </div>
        )}

        <input
          value={code}
          onChange={(e) => setCode(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="کد ۵ رقمی"
          maxLength={5}
          className="w-full px-4 py-3 rounded-xl bg-[#1a2522] text-white text-lg font-bold text-center outline-none border border-[#2F5D50]/20 focus:border-[#2F5D50]"
        />

        <button
          onClick={handleSubmit}
          disabled={loading}
          className="w-full mt-5 bg-[#2F5D50] hover:bg-[#264C42] text-white py-3 rounded-xl transition disabled:opacity-50"
        >
          {loading ? 'در حال بررسی...' : 'تایید کد'}
        </button>
      </div>
    </div>
  );
};

export default OtpModal;