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
        className="flex-1 bg-dark text-white text-sm rounded-xl px-4 py-3 focus:outline-none focus:ring-1 focus:ring-primary/50 border border-primary/20"
      />
      <button 
        onClick={handleSubmit} 
        className="bg-primary hover:bg-primaryLight text-white p-3 rounded-xl hover:scale-105 transition-transform shadow-lg"
      >
        <ArrowLeft size={18}/>
      </button>
    </>
  );
};

export default ChatInput;
