import React from 'react';
import { Sparkles } from 'lucide-react';

const ResumeButton = ({ onClick }) => {
  return (
    <div 
      onClick={onClick}
      className="fixed bottom-24 left-1/2 opacity-80 transform -translate-x-1/2 z-40 bg-primary text-white px-8 py-5 rounded-full shadow-lg cursor-pointer hover:bg-primaryLight hover:opacity-100 transition-all flex items-center gap-2"
    >
      <Sparkles size={16} />
      <span className="text-md font-medium">ادامه گفتگو</span>
    </div>
  );
};

export default ResumeButton;
