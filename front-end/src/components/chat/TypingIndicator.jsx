// src/components/chat/TypingIndicator.jsx
import React from 'react';
import { Bot } from 'lucide-react';

export const TypingIndicator = ({
  showAvatar = true,
  showLabel = true,
  label = 'دستیار در حال بررسی و نگارش پاسخ...',
  className = '',
}) => {
  return (
    <div
      role="status"
      aria-live="polite"
      aria-label="دستیار هوشمند در حال پاسخ‌گویی است"
      className={`flex flex-col mb-2 items-end self-end animate-messageIn ${className}`}
    >
      <div className="bg-white/95 backdrop-blur-md border border-primary/20 text-textDark px-4 py-3 sm:px-5 sm:py-3.5 rounded-2xl sm:rounded-3xl rounded-tl-sm shadow-xs flex items-center gap-2.5 transition-all">
        {showAvatar && (
          <div className="w-6 h-6 rounded-xl bg-gradient-to-br from-primary to-primary-dark text-white flex items-center justify-center shadow-xs shrink-0 ring-2 ring-primary/10">
            <Bot className="w-3.5 h-3.5" />
          </div>
        )}

        <div className="flex items-center gap-1.5 py-1 px-0.5" aria-hidden="true">
          <span className="w-2 h-2 sm:w-2.5 sm:h-2.5 rounded-full bg-gradient-to-br from-primary to-primary-dark shadow-[0_0_8px_rgba(231,84,128,0.35)] chat-typing-dot chat-typing-dot-1" />
          <span className="w-2 h-2 sm:w-2.5 sm:h-2.5 rounded-full bg-gradient-to-br from-primary to-primary-dark shadow-[0_0_8px_rgba(231,84,128,0.35)] chat-typing-dot chat-typing-dot-2" />
          <span className="w-2 h-2 sm:w-2.5 sm:h-2.5 rounded-full bg-gradient-to-br from-primary to-primary-dark shadow-[0_0_8px_rgba(231,84,128,0.35)] chat-typing-dot chat-typing-dot-3" />
        </div>

        {showLabel && (
          <span className="text-[11px] sm:text-xs font-bold text-textDark/60 select-none hidden sm:inline-block pr-1">
            {label}
          </span>
        )}

        <span className="sr-only">در حال نگارش پاسخ...</span>
      </div>

      <span className="text-[10px] sm:text-[11px] px-2 mt-0.5 font-bold text-textDark/50">
        در حال بررسی...
      </span>
    </div>
  );
};

export default TypingIndicator;
