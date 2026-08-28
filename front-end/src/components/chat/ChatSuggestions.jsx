// src/components/chat/ChatSuggestions.jsx
import React, { useState, useEffect } from 'react';
import { CHAT_SUGGESTIONS } from '../../data/chatSuggestions';

const ChatSuggestions = ({ onSendMessage }) => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Show suggestions after 2 seconds
    const timer = setTimeout(() => {
      setIsVisible(true);
    }, 2000);
    
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className={`mt-6 w-full max-w-md transition-all duration-500 ease-out ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
      <div className="text-xs text-secondary mb-2 text-center">
        سوالات پیشنهادی:
      </div>
      <div className="grid grid-cols-1 gap-2">
        {CHAT_SUGGESTIONS.map((text, index) => (
          <button
            key={index}
            onClick={() => onSendMessage(text)}
            className="text-right text-sm text-white bg-dark
                       hover:bg-primary/20 border border-primary/30
                       rounded-xl px-4 py-2 transition transform hover:scale-[1.02]"
          >
            {text}
          </button>
        ))}
      </div>
    </div>
  );
};

export default ChatSuggestions;
