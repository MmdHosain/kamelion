import React from 'react';
import { Minus } from 'lucide-react';

const ChatHeader = ({ onMinimize }) => {
  return (
    <div className="bg-[#1a2522] px-4 py-3 border-b border-[#2F5D50]/40 rounded-t-3xl flex items-center justify-between">
      <div className="flex items-center gap-2 text-white font-medium text-sm">
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 16V8"/>
          <path d="M10 14 8 12"/>
          <path d="M14 10 16 8"/>
          <circle cx="12" cy="12" r="10"/>
        </svg>
        دستیار پزشکی دکتر معشوری
      </div>
      <div className="flex gap-3 text-[#6B6E6C]">
        <button 
          onClick={onMinimize}
          className="hover:text-[#E6C5CC]"
        >
          <Minus size={18}/>
        </button>
      </div>
    </div>
  );
};

export default ChatHeader;