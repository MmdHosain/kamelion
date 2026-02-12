// src/components/ui/FixedChatInput.jsx
import React from 'react';
// Import icons
import { Sparkles, ArrowLeft, MessageSquare } from 'lucide-react';

const FixedChatInput = ({
  isVisible,
  value,
  onChange,
  onSubmitInput, // Use the new prop name
}) => {
  if (!isVisible) return null;

  const handleSubmit = () => {
    // Call the onSubmitInput prop from App.jsx, passing the current text value
    onSubmitInput(value); // Pass only the string value
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      handleSubmit();
    }
  };

  return (
    <div className="fixed z-30 left-0 right-0 px-4 transition-all duration-500 ease-out bottom-8 opacity-100 translate-y-0">
      <div className="max-w-xl mx-auto w-full relative group">
        {/* Subtle Medical Glow */}
        <div className="absolute -inset-1 bg-gradient-to-r from-[#2F5D50]/30 to-[#E6C5CC]/30 rounded-2xl blur opacity-30 group-hover:opacity-50 transition duration-500"></div>

        <div className="relative bg-white/95 backdrop-blur-sm border border-[#E6C5CC]/20 rounded-2xl shadow-lg flex items-center p-2 pr-4 transition-all hover:shadow-xl">
          <div className="text-[#2F5D50] animate-pulse mr-2">
            <Sparkles size={20} />
          </div>
          <input
            type="text"
            value={value}
            onChange={(e) => onChange(e.target.value)} // Pass updated value back via onChange prop
            onKeyDown={handleKeyDown}
            placeholder="سوال خود را از دستیار پزشکی بپرسید..."
            className="flex-1 py-3 px-3 bg-transparent outline-none text-[#2F5D50] placeholder-[#6B6E6C]/60 text-base font-medium"
          />
          <button
            onClick={handleSubmit} // Call handleSubmit which calls onSubmitInput
            className={`p-2.5 rounded-xl transition-all duration-300 flex items-center justify-center shadow-sm
              ${value
                ? 'bg-[#2F5D50] hover:bg-[#264C42] text-white scale-105'
                : 'bg-[#E6C5CC]/30 text-[#2F5D50]/70 hover:bg-[#E6C5CC]/40'
              }`}
          >
            {value ? <ArrowLeft size={18} /> : <MessageSquare size={18} />}
          </button>
        </div>
        <div className="absolute -bottom-6 left-0 right-0 text-center text-[11px] text-[#6B6E6C] font-medium">
          پاسخگویی تخصصی • مشاوره رایگان • رزرو نوبت آنلاین
        </div>
      </div>
    </div>
  );
};

export default FixedChatInput;