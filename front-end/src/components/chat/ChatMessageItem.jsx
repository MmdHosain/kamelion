// src/components/chat/ChatMessageItem.jsx
import React, { useState } from 'react';
import {
  AlertTriangle,
  Calendar,
  Check,
  Copy,
  PhoneCall,
  LogIn,
  AlertCircle,
} from 'lucide-react';
import useAuthStore from '../../store/authStore';

const CLINIC_PHONE = '02112345678';

export const ChatMessageItem = ({
  message,
  onOpenAppointment,
  onToggleChat,
}) => {
  const [copied, setCopied] = useState(false);
  const openAuthModal = useAuthStore((state) => state.openAuthModal);

  const handleCopyCode = (code) => {
    if (!code) return;
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const isUser = message.sender === 'user';

  return (
    <div
      className={`flex flex-col mb-2 ${
        isUser ? 'items-start' : 'items-end'
      }`}
    >
      <div
        className={`p-3.5 sm:p-4 md:p-5 rounded-2xl sm:rounded-3xl max-w-[90%] sm:max-w-[80%] text-xs sm:text-sm md:text-base leading-relaxed flex flex-col gap-1.5 ${
          isUser
            ? 'bg-primary text-white rounded-tr-sm shadow-md font-medium'
            : 'bg-white/90 border border-primary/20 text-textDark rounded-tl-sm shadow-xs font-medium'
        }`}
      >
        <div className="whitespace-pre-line">{message.text}</div>

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

      <span className="text-[11px] px-2 mt-0.5 font-bold text-white/70">
        {message.time}
      </span>
    </div>
  );
};

export default ChatMessageItem;
