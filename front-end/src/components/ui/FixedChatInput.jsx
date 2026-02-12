// src/components/ui/FixedChatInput.jsx
import React, { useState, useEffect } from 'react';
import { Sparkles, ArrowLeft, MessageSquare, X } from 'lucide-react';
import { CHAT_SUGGESTIONS } from '../../data/chatSuggestions';

const FixedChatInput = ({
  isVisible,
  value,
  onChange,
  onSubmitInput,
}) => {
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isSuggestionsOpen, setIsSuggestionsOpen] = useState(false);

  useEffect(() => {
    if (isVisible) {
      const timer = setTimeout(() => {
        setShowSuggestions(true);
      }, 2000);
      return () => clearTimeout(timer);
    } else {
      setShowSuggestions(false);
      setIsSuggestionsOpen(false);
    }
  }, [isVisible]);

  if (!isVisible) return null;

  const handleSubmit = () => {
    onSubmitInput(value);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      handleSubmit();
    }
  };

  const handleSuggestionClick = (text) => {
    onChange(text);
    onSubmitInput(text);
    setIsSuggestionsOpen(false);
  };
const handleCloseSuggestions = () => {
  setShowSuggestions(false);
  setIsSuggestionsOpen(false);
};
  // Calculate button height (approx 44px based on px-4 py-2 classes)
  const buttonHeight = 44;
  const visibleHeight = buttonHeight * 3; // Show 3 buttons height

  return (
    <div className="fixed z-30 left-0 right-0 px-4 transition-all duration-500 ease-out bottom-8 opacity-100 translate-y-0">
      {/* Backdrop when suggestions are open */}
      {isSuggestionsOpen && (
        <div 
          className="fixed inset-0 bg-black/30 backdrop-blur-sm z-20"
          onClick={() => setIsSuggestionsOpen(false)}
        />
      )}
      
      <div className="max-w-xl mx-auto w-full relative group">
        {/* Subtle Medical Glow */}
        <div className="absolute -inset-1 bg-gradient-to-r from-[#2F5D50]/30 to-[#E6C5CC]/30 rounded-2xl blur opacity-30 group-hover:opacity-50 transition duration-500"></div>
        
        {/* Suggestions Section - Appears after 2 seconds */}
        {showSuggestions && (
          <div className="mt-4 w-full">
    <button
      onClick={handleCloseSuggestions}
      className="absolute top-1 left-1 z-10 w-6 h-6 flex items-center justify-center
                 rounded-full bg-black/30 hover:bg-black/50 text-white transition"
      aria-label="بستن پیشنهادات"
    >
      <X size={16} strokeWidth={2.5} />
    </button>
            
            {/* Scrollable container with max 3 button heights */}
            <div 
              className="relative overflow-hidden rounded-xl opacity-100"
              style={{ maxHeight: `${visibleHeight}px` }}
            >

              
              {/* Scrollable content */}
              <div className="overflow-y-auto max-h-[132px]"   style={{ 
    scrollbarWidth: 'none', /* Firefox */
    msOverflowStyle: 'none' /* IE/Edge */
  }}>
                <div className="grid grid-cols-1 gap-2 p-2">
                  {CHAT_SUGGESTIONS.map((text, index) => (
                    <button
                      key={index}
                      onClick={() => handleSuggestionClick(text)}
                      className={`text-right text-md text-black bg-[#E6C5CC]
                                 hover:bg-[#2F5D50]/20 border border-[#E6C5CC]/30
                                 rounded-xl px-4 py-2 transition transform hover:scale-[1.02]
                                 ${index === 0 ? 'opacity-40' :
                                   index === 1 ? 'opacity-60' :
                                   index === 2 ? 'opacity-80' : 'opacity-100'}`}
                    >
                      {text}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
        
        <div className="relative bg-white/95 backdrop-blur-sm border border-[#E6C5CC]/20 rounded-2xl shadow-lg flex items-center p-2 pr-4 transition-all hover:shadow-xl">
          <div className="text-[#2F5D50] animate-pulse mr-2">
            <Sparkles size={20} />
          </div>
          <input
            type="text"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="سوال خود را از دستیار پزشکی بپرسید..."
            className="flex-1 py-3 px-3 bg-transparent outline-none text-[#2F5D50] placeholder-[#6B6E6C]/60 text-base font-medium"
          />
          <button
            onClick={handleSubmit}
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