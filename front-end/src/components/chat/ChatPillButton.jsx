// src/components/chat/ChatPillButton.jsx
import React, { useState, useEffect } from 'react';
import { Sparkles, Send, X } from 'lucide-react';
import { QUICK_PROMPTS } from './ChatQuickPrompts';

const ROTATING_PLACEHOLDERS = [
  'علائم خود را بنویسید (درد سینه، لمس توده)...',
  'سوال درباره جراحی ماموپلاستی، پروتز یا لیفت...',
  'بررسی جواب سونوگرافی یا ماموگرافی...',
  'علت ترشحات یا تغییر شکل سینه...',
];

export const ChatPillButton = ({
  isOpen,
  onToggle,
  onSubmitText,
  isFooterVisible,
  bottomOffset,
}) => {
  const [inputValue, setInputValue] = useState('');
  const [isMinimized, setIsMinimized] = useState(false);
  const [placeholderIndex, setPlaceholderIndex] = useState(0);

  // Rotate placeholder text smoothly
  useEffect(() => {
    const interval = setInterval(() => {
      setPlaceholderIndex((prev) => (prev + 1) % ROTATING_PLACEHOLDERS.length);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  if (isOpen) return null;

  // 1. Compact Floating FAB when Approaching/Reaching Footer (Lifted cleanly above footer)
  if (isFooterVisible) {
    return (
      <div
        style={{ bottom: `${bottomOffset}px` }}
        className="fixed left-4 sm:left-6 z-[90] transition-[bottom] duration-150 ease-out animate-scaleUp pointer-events-auto"
      >
        <button
          type="button"
          onClick={() => onToggle && onToggle()}
          className="group bg-gradient-to-br from-primary to-primary-dark hover:brightness-110 text-white p-3 sm:p-3.5 rounded-full shadow-[0_12px_35px_-5px_rgba(231,84,128,0.5)] border-2 border-white/90 hover:scale-105 active:scale-95 transition-all duration-300 flex items-center gap-2 cursor-pointer"
          aria-label="گفتگو با دستیار هوشمند تریاژ"
          title="دستیار هوشمند تریاژ مطب"
        >
          <div className="relative flex items-center justify-center">
            <Sparkles className="w-5 h-5 sm:w-6 sm:h-6 text-white group-hover:rotate-12 transition-transform" />
            <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-emerald-400 border-2 border-primary animate-pulse"></span>
          </div>
          <span className="hidden sm:inline-block text-xs font-black tracking-wide pr-1">
            دستیار هوشمند تریاژ
          </span>
        </button>
      </div>
    );
  }

  // 2. Floating Slim Chat Capsule at Bottom Center (Normal Page Scroll)
  return (
    <div className="fixed bottom-3 sm:bottom-6 left-0 right-0 z-[90] pointer-events-none px-3 sm:px-4 flex justify-center pb-[calc(0.5rem+env(safe-area-inset-bottom))] animate-fadeIn">
      <div className="w-full max-w-lg md:max-w-2xl pointer-events-auto transition-all duration-300">
        {isMinimized ? (
          /* Minimized Pill */
          <div className="flex justify-center">
            <button
              type="button"
              onClick={() => setIsMinimized(false)}
              className="bg-white/95 backdrop-blur-xl border-2 border-primary/30 text-primary hover:bg-primary hover:text-white px-4 py-2 sm:px-5 sm:py-2.5 rounded-full text-xs font-black shadow-2xl flex items-center gap-2 transition-all hover:scale-105 cursor-pointer"
            >
              <Sparkles size={15} />
              <span>دستیار هوشمند تریاژ</span>
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            </button>
          </div>
        ) : (
          <div className="flex flex-col gap-1.5 sm:gap-2">
            {/* Quick Suggestion Chips */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 px-1 chat-scroll justify-start sm:justify-center">
              {QUICK_PROMPTS.slice(0, 3).map((prompt, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => onSubmitText(prompt.text)}
                  className={`whitespace-nowrap px-3 py-1 sm:px-3.5 sm:py-1.5 rounded-full text-[10px] sm:text-[11px] font-bold border backdrop-blur-md shadow-xs transition-all duration-200 hover:scale-102 shrink-0 cursor-pointer ${
                    prompt.isUrgent
                      ? 'bg-red-500/15 border-red-500/35 text-red-700 hover:bg-red-500 hover:text-white'
                      : 'bg-white/90 border-primary/25 text-textDark/85 hover:bg-primary hover:text-white hover:border-transparent'
                  }`}
                >
                  {prompt.text}
                </button>
              ))}

              {/* Minimize Button */}
              <button
                type="button"
                onClick={() => setIsMinimized(true)}
                className="p-1 rounded-full text-textDark/40 hover:text-textDark hover:bg-white/80 transition-colors shrink-0 cursor-pointer"
                title="کوچک کردن"
                aria-label="کوچک کردن ویجت"
              >
                <X size={14} />
              </button>
            </div>

            {/* Main Slim Capsule Input Bar */}
            <form
              onSubmit={(e) => {
                e.preventDefault();
                const text = inputValue.trim();
                if (text) {
                  onSubmitText(text);
                  setInputValue('');
                }
              }}
              className="bg-white/95 backdrop-blur-2xl border-2 border-primary/35 rounded-full p-1 sm:p-1.5 pr-3.5 sm:pr-4 pl-1 sm:pl-1.5 shadow-2xl shadow-primary/25 flex items-center gap-1.5 sm:gap-2 transition-all hover:border-primary/60 focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/25"
            >
              <div className="text-primary shrink-0 animate-pulse flex items-center">
                <Sparkles size={18} className="sm:w-5 sm:h-5" />
              </div>

              <input
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                placeholder={ROTATING_PLACEHOLDERS[placeholderIndex]}
                className="flex-1 bg-transparent border-none outline-none text-xs sm:text-sm text-textDark placeholder:text-textDark/45 font-medium min-w-0"
              />

              <button
                type="submit"
                aria-label="ارسال و شروع چت"
                className="bg-gradient-to-r from-primary to-primary-dark text-white rounded-full w-8 h-8 sm:w-10 sm:h-10 flex items-center justify-center transition-all hover:scale-105 shrink-0 shadow-md shadow-primary/30 cursor-pointer"
              >
                <Send size={14} className="rotate-180 ml-0.5 sm:w-4 sm:h-4" />
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};

export default ChatPillButton;
