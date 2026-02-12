import React from 'react';
import { CHAT_SUGGESTIONS } from '../../data/chatSuggestions';

const ChatSuggestions = ({ onSendMessage }) => {
  return (
    <div className="mt-6 w-full max-w-md">
      <div className="text-xs text-[#E6C5CC] mb-2 text-center">
        سوالات پیشنهادی:
      </div>
      <div className="grid grid-cols-1 gap-2">
        {CHAT_SUGGESTIONS.map((text, index) => (
          <button
            key={index}
            onClick={() => onSendMessage(text)}
            className="text-right text-sm text-white bg-[#1a2522]
                       hover:bg-[#2F5D50]/20 border border-[#2F5D50]/30
                       rounded-xl px-4 py-2 transition"
          >
            {text}
          </button>
        ))}
      </div>
    </div>
  );
};

export default ChatSuggestions;