// src/components/chat/ChatMessageItem.jsx
import React, { useState, useRef, useCallback } from 'react';
import {
  AlertTriangle,
  Calendar,
  Check,
  Copy,
  PhoneCall,
  LogIn,
  AlertCircle,
  Bot,
} from 'lucide-react';
import useAuthStore from '../../store/authStore';
import { useTypewriter } from '../../hooks/useTypewriter';
import { CLINIC_PHONE_TEL } from '../../constants/contact';
export { TypingIndicator } from './TypingIndicator';

const CLINIC_PHONE = CLINIC_PHONE_TEL;

export const ChatMessageItem = ({
  message,
  onOpenAppointment,
  onToggleChat,
  onScrollToBottom,
}) => {
  const [copied, setCopied] = useState(false);
  const openAuthModal = useAuthStore((state) => state.openAuthModal);

  const isUser = message.sender === 'user';
  const hasAnimatedRef = useRef(false);
  const shouldAnimate = Boolean(!isUser && message.isNew && !hasAnimatedRef.current);

  const handleComplete = useCallback(() => {
    hasAnimatedRef.current = true;
    if (message.isNew) {
      message.isNew = false;
    }
    // Final scroll so trailing CTAs are in full view
    onScrollToBottom?.(true);
  }, [message, onScrollToBottom]);

  const {
    chunks,
    displayedCount,
    isTyping: isTypingActive,
    revealAll,
  } = useTypewriter({
    text: message.text || '',
    enabled: shouldAnimate,
    onWordRevealed: onScrollToBottom,
    onComplete: handleComplete,
  });

  const handleCopyCode = (code) => {
    if (!code) return;
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <div
      className={`flex flex-col mb-2.5 animate-messageIn ${
        isUser ? 'items-start' : 'items-end'
      }`}
    >
      <div
        className={`p-3.5 sm:p-4 md:p-5 rounded-2xl sm:rounded-3xl max-w-[92%] sm:max-w-[85%] text-xs sm:text-sm md:text-base leading-relaxed flex flex-col gap-2 transition-all duration-300 ${
          isUser
            ? 'bg-primary text-white rounded-tr-sm shadow-md font-medium'
            : 'bg-white/95 backdrop-blur-md border border-primary/20 text-textDark rounded-tl-sm shadow-xs font-medium'
        }`}
      >
        {/* Bot Identity Header with Avatar matching the Typing Indicator */}
        {!isUser && (
          <div className="flex items-center justify-between pb-1.5 border-b border-primary/10 text-xs font-bold">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-xl bg-gradient-to-br from-primary to-primary-dark text-white flex items-center justify-center shadow-xs shrink-0 ring-2 ring-primary/10">
                <Bot className="w-3.5 h-3.5" />
              </div>
              <span className="text-[11px] sm:text-xs font-black text-textDark/85">
                دستیار هوشمند تریاژ
              </span>
            </div>
          </div>
        )}

        {/* Loading Dots Morph (Seamless handoff for the initial ~90ms tick) */}
        {!isUser && isTypingActive && displayedCount === 0 && (
          <div className="flex items-center gap-1.5 py-2 px-1 text-primary animate-fadeIn" aria-hidden="true">
            <span className="w-2 h-2 sm:w-2.5 sm:h-2.5 rounded-full bg-gradient-to-br from-primary to-primary-dark shadow-[0_0_8px_rgba(231,84,128,0.35)] chat-typing-dot chat-typing-dot-1" />
            <span className="w-2 h-2 sm:w-2.5 sm:h-2.5 rounded-full bg-gradient-to-br from-primary to-primary-dark shadow-[0_0_8px_rgba(231,84,128,0.35)] chat-typing-dot chat-typing-dot-2" />
            <span className="w-2 h-2 sm:w-2.5 sm:h-2.5 rounded-full bg-gradient-to-br from-primary to-primary-dark shadow-[0_0_8px_rgba(231,84,128,0.35)] chat-typing-dot chat-typing-dot-3" />
          </div>
        )}

        {/* Main Content Area: Word-by-word fade-in stream */}
        <div
          className="whitespace-pre-line leading-relaxed select-text transition-all"
          onClick={isTypingActive ? revealAll : undefined}
          title={isTypingActive ? 'جهت نمایش فوری کل متن کلیک کنید' : undefined}
        >
          {shouldAnimate
            ? chunks.slice(0, displayedCount).map((chunk, idx) => {
                const isRecent = isTypingActive && idx >= displayedCount - 3;
                return (
                  <span
                    key={idx}
                    className={isRecent ? 'animate-wordFadeIn inline' : 'inline'}
                  >
                    {chunk}
                  </span>
                );
              })
            : message.text}

          {/* Pulsing Typewriter Cursor */}
          {isTypingActive && displayedCount > 0 && (
            <span
              className="inline-block w-1.5 h-3.5 sm:h-4 bg-primary/80 rounded-full mr-1 align-middle animate-cursorPulse"
              aria-hidden="true"
            />
          )}
        </div>

        {/* Supplementary CTAs & Badges (Smoothly slide in only when typing reaches completion) */}
        {!isTypingActive && (
          <div className="flex flex-col gap-1.5 animate-fadeSlide">
            {/* Fallback Warning Notice */}
            {message.fallback && !isUser && (
              <div className="flex items-center gap-1.5 text-[11px] text-amber-700 bg-amber-500/10 border border-amber-500/20 px-2.5 py-1.5 rounded-xl mt-1">
                <AlertCircle className="w-3.5 h-3.5 shrink-0 text-amber-600" />
                <span>پاسخ آفلاین سامانه در شرایط اختلال ارتباطی</span>
              </div>
            )}

            {/* Auth Required CTA */}
            {message.requiresAuth && !isUser && (
              <button
                type="button"
                onClick={() => openAuthModal && openAuthModal()}
                className="mt-2 w-full bg-primary hover:bg-primary-dark text-white font-bold py-2 px-3.5 rounded-xl text-xs sm:text-sm flex items-center justify-center gap-2 shadow-sm transition-all cursor-pointer"
              >
                <LogIn className="w-4 h-4" />
                ورود با شماره موبایل (OTP)
              </button>
            )}

            {/* Emergency Code Box */}
            {(message.isEmergency || message.emergencyCode) && !isUser && (
              <div className="bg-red-500/15 border border-red-500/30 p-3.5 sm:p-5 rounded-2xl mt-3 sm:mt-4 text-center backdrop-blur-md">
                <div className="flex items-center justify-center gap-1.5 text-red-600 font-black text-xs sm:text-base mb-1.5 sm:mb-2">
                  <AlertTriangle className="w-4 h-4 sm:w-5 sm:h-5" />
                  کد تریاژ اورژانس صادر شد
                </div>
                <div className="text-xl sm:text-3xl font-mono font-black text-red-600 bg-white py-1.5 sm:py-2 rounded-2xl shadow-inner mb-2.5 sm:mb-3 tracking-widest">
                  {message.emergencyCode}
                </div>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => handleCopyCode(message.emergencyCode)}
                    className="flex-1 bg-white hover:bg-red-50 border border-red-200 text-red-600 py-2 sm:py-2.5 rounded-xl transition-all text-xs sm:text-sm font-bold flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    {copied ? (
                      <>
                        <Check className="w-4 h-4" />
                        کپی شد!
                      </>
                    ) : (
                      <>
                        <Copy className="w-4 h-4" />
                        کپی کد
                      </>
                    )}
                  </button>
                  <a
                    href={`tel:${CLINIC_PHONE}`}
                    className="flex-1 bg-primary hover:bg-primary-dark text-white py-2 sm:py-2.5 rounded-xl transition-all text-xs sm:text-sm font-bold flex items-center justify-center gap-1.5 shadow-md shadow-primary/20 no-underline"
                  >
                    <PhoneCall className="w-4 h-4" />
                    تماس با مطب
                  </a>
                </div>
              </div>
            )}

            {/* Booking CTA Button */}
            {(message.showBookingAction || message.bookingOffer) && !isUser && (
              <button
                type="button"
                onClick={() => {
                  if (onToggleChat) onToggleChat();
                  if (onOpenAppointment) onOpenAppointment();
                }}
                className="mt-3 w-full bg-primary hover:bg-primary-dark text-white font-bold py-2.5 px-4 rounded-xl text-xs sm:text-sm flex items-center justify-center gap-2 shadow-md shadow-primary/20 transition-all cursor-pointer"
              >
                <Calendar className="w-4 h-4" />
                مشاهده تقویم و رزرو وقت ویزیت حضوری
              </button>
            )}
          </div>
        )}
      </div>

      <span className="text-[11px] px-2 mt-0.5 font-bold text-textDark/60">
        {message.time}
      </span>
    </div>
  );
};

export default ChatMessageItem;
