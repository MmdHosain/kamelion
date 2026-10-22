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
  onExpand,
  onSubmitText,
  inputValue = '',
  setInputValue,
  isFooterVisible,
  bottomOffset,
  onOpenAppointment,
}) => {
  const [localInput, setLocalInput] = useState('');
  const [isMinimized, setIsMinimized] = useState(false);
  const [placeholderIndex, setPlaceholderIndex] = useState(0);

  const currentText = typeof inputValue === 'string' ? inputValue : localInput;

  const handleTextChange = (val) => {
    if (setInputValue) setInputValue(val);
    else setLocalInput(val);
  };

  // Rotate placeholder text smoothly
  useEffect(() => {
    const interval = setInterval(() => {
      setPlaceholderIndex((prev) => (prev + 1) % ROTATING_PLACEHOLDERS.length);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  // Handle expansion trigger on focus / click / typing
  const handleTriggerExpand = (initialText = '') => {
    if (onExpand) {
      onExpand(initialText || currentText);
    } else if (onToggle) {
      onToggle(true);
    }
  };

  // 1. Compact Floating FAB when Approaching/Reaching Footer
  if (isFooterVisible) {
    return (
      <div
        style={{ bottom: `${bottomOffset}px` }}
        className={`fixed left-4 sm:left-6 z-[90] transition-all duration-200 ease-out animate-scaleUp ${
          isOpen
            ? 'opacity-0 pointer-events-none scale-90'
            : 'opacity-100 pointer-events-auto scale-100'
        }`}
      >
        <button
          type="button"
          onClick={() => handleTriggerExpand()}
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
    <div
      className={`fixed bottom-3 sm:bottom-6 left-0 right-0 z-[90] pointer-events-none px-3 sm:px-4 flex justify-center pb-[calc(0.5rem+env(safe-area-inset-bottom))] transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] ${
        isOpen
          ? 'opacity-0 pointer-events-none translate-y-6 scale-95'
          : 'opacity-100 pointer-events-auto translate-y-0 scale-100'
      }`}
    >
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
                  onClick={() => {
                    if (prompt.isBooking && onOpenAppointment) {
                      onOpenAppointment();
                    } else {
                      onSubmitText(prompt.text);
                    }
                  }}
                  className={`chat-suggestion-chip whitespace-nowrap px-3 py-1 sm:px-3.5 sm:py-1.5 rounded-full text-[10px] sm:text-[11px] font-bold border shrink-0 cursor-pointer select-none shadow-xs transition-all duration-200 ease-[cubic-bezier(0.4,0,0.2,1)] hover:-translate-y-0.5 active:translate-y-0 active:scale-95 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-white motion-reduce:hover:translate-y-0 motion-reduce:active:scale-100 motion-reduce:transition-none ${
                    prompt.isUrgent
                      ? 'bg-rose-600 border-rose-700/80 text-white hover:brightness-110 hover:border-rose-600 hover:shadow-md hover:shadow-rose-600/30 active:brightness-90 focus-visible:ring-rose-500'
                      : 'bg-white/95 backdrop-blur-md border-primary/20 text-textDark hover:bg-primary/10 hover:border-primary/50 hover:brightness-105 hover:shadow-md hover:shadow-primary/15 active:bg-primary/15 active:brightness-95 focus-visible:ring-primary'
                  }`}
                >
                  {prompt.text}
                </button>
              ))}

              {/* Minimize Button */}
              <button
                type="button"
                onClick={() => setIsMinimized(true)}
                className="chat-suggestion-chip p-1 sm:p-1.5 rounded-full bg-white/95 backdrop-blur-md border border-primary/20 text-textDark/60 hover:text-textDark hover:bg-primary/10 hover:border-primary/50 hover:brightness-105 hover:-translate-y-0.5 hover:shadow-md hover:shadow-primary/15 active:translate-y-0 active:scale-95 shadow-xs transition-all duration-200 ease-[cubic-bezier(0.4,0,0.2,1)] shrink-0 cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-white motion-reduce:hover:translate-y-0 motion-reduce:active:scale-100 motion-reduce:transition-none"
                title="کوچک کردن"
                aria-label="کوچک کردن ویجت"
              >
                <X size={14} />
              </button>
            </div>

            {/* Main Slim Capsule Input Bar - Auto-expands on focus, click or typing */}
            <form
              onSubmit={(e) => {
                e.preventDefault();
                const text = currentText.trim();
                if (text) {
                  onSubmitText(text);
                  handleTextChange('');
                }
              }}
              onClick={(e) => {
                if (e.target.closest('button[type="submit"]')) return;
                handleTriggerExpand(currentText);
              }}
              className="bg-white/95 backdrop-blur-2xl border-2 border-primary/35 rounded-full p-1 sm:p-1.5 pr-3.5 sm:pr-4 pl-1 sm:pl-1.5 shadow-2xl shadow-primary/25 flex items-center gap-1.5 sm:gap-2 transition-all hover:border-primary/60 focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/25 cursor-text"
            >
              <div className="text-primary shrink-0 animate-pulse flex items-center">
                <Sparkles size={18} className="sm:w-5 sm:h-5" />
              </div>

              <input
                type="text"
                value={currentText}
                onChange={(e) => {
                  const val = e.target.value;
                  handleTextChange(val);
                  handleTriggerExpand(val);
                }}
                onFocus={(e) => {
                  handleTriggerExpand(e.target.value);
                }}
                placeholder={ROTATING_PLACEHOLDERS[placeholderIndex]}
                className="flex-1 bg-transparent border-none outline-none text-xs sm:text-sm text-textDark placeholder:text-textDark/45 font-medium min-w-0 cursor-text"
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
