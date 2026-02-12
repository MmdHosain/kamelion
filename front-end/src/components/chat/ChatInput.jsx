import React from 'react';
import { ArrowLeft } from 'lucide-react';

const ChatInput = ({ value, onChange, onSubmit }) => {
  const handleSubmit = () => {
    onSubmit(value);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      handleSubmit();
    }
  };

  return (
    <>
      <input 
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder="سوال خود را بنویسید..."
        className="flex-1 bg-[#1a2522] text-white text-sm rounded-xl px-4 py-3 focus:outline-none focus:ring-1 focus:ring-[#2F5D50]/50 border border-[#2F5D50]/20"
      />
      <button 
        onClick={handleSubmit} 
        className="bg-[#2F5D50] hover:bg-[#264C42] text-white p-3 rounded-xl hover:scale-105 transition-transform shadow-lg"
      >
        <ArrowLeft size={18}/>
      </button>
    </>
  );
};

export default ChatInput;