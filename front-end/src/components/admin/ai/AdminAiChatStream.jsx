// src/components/admin/ai/AdminAiChatStream.jsx
import React, { useEffect, useRef } from 'react';
import { Bot, User, AlertCircle, Clock, Zap, ShieldAlert, Calendar } from 'lucide-react';
import { toPersianDigits } from '../../../utils/jalaliDateUtils';

const TRIAGE_BADGES = {
  urgent: { text: 'اورژانسی (Urgent)', bg: 'bg-red-500 text-white' },
  high_priority: { text: 'اولویت بالا (High)', bg: 'bg-amber-500 text-white' },
  low_priority: { text: 'اولویت عادی (Low)', bg: 'bg-emerald-500 text-white' },
  out_of_scope: { text: 'خارج از حیطه (Out of Scope)', bg: 'bg-gray-500 text-white' },
  unknown: { text: 'نامشخص (Unknown)', bg: 'bg-slate-400 text-white' },
};

export const AdminAiChatStream = ({ messages, isSending }) => {
  const scrollRef = useRef(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isSending]);

  return (
    <div
      ref={scrollRef}
      className="flex-1 overflow-y-auto p-4 space-y-4 max-h-[520px] min-h-[380px] bg-surface/50 rounded-2xl border border-border/60"
    >
      {messages.map((msg) => {
        if (msg.role === 'system') {
          return (
            <div
              key={msg.id}
              className="p-3.5 rounded-2xl bg-primary/5 border border-primary/15 text-xs text-primary leading-relaxed text-center"
            >
              {msg.content}
            </div>
          );
        }

        if (msg.role === 'error') {
          return (
            <div
              key={msg.id}
              className="p-3.5 rounded-2xl bg-red-500/10 border border-red-500/20 text-xs text-red-600 flex items-center gap-2"
            >
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{msg.content}</span>
            </div>
          );
        }

        if (msg.role === 'user') {
          return (
            <div key={msg.id} className="flex justify-start items-start gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-gray-100 border border-border text-textDark flex items-center justify-center shrink-0 shadow-sm">
                <User className="w-4 h-4 text-mutedText" />
              </div>
              <div className="max-w-[85%] sm:max-w-[75%] space-y-1">
                <div className="p-3.5 rounded-2xl rounded-tr-none bg-primary text-white text-xs sm:text-sm leading-relaxed shadow-sm">
                  {msg.content}
                </div>
                <div className="text-[10px] text-mutedText/70 px-1">
                  {msg.time}
                </div>
              </div>
            </div>
          );
        }

        // Assistant / Bot message
        const triageInfo = TRIAGE_BADGES[msg.triageLevel] || TRIAGE_BADGES.unknown;

        return (
          <div key={msg.id} className="flex justify-end items-start gap-2.5">
            <div className="max-w-[90%] sm:max-w-[80%] space-y-1.5 text-right">
              <div className="p-4 rounded-2xl rounded-tl-none bg-white border border-border/80 shadow-sm text-xs sm:text-sm text-textDark leading-relaxed space-y-3">
                {/* Meta header on message */}
                <div className="flex flex-wrap items-center justify-between gap-2 pb-2 border-b border-border/40 text-[11px]">
                  <div className="flex items-center gap-1.5">
                    <span className={`px-2 py-0.5 rounded-md font-bold text-[10px] ${triageInfo.bg}`}>
                      {triageInfo.text}
                    </span>
                    {msg.fallback && (
                      <span className="px-2 py-0.5 rounded-md font-bold text-[10px] bg-amber-100 text-amber-800 border border-amber-300">
                        فال‌بک فعال شد
                      </span>
                    )}
                  </div>
                  {msg.latencyMs > 0 && (
                    <span className="flex items-center gap-1 text-mutedText text-[10px]">
                      <Zap className="w-3 h-3 text-amber-500" />
                      {toPersianDigits(msg.latencyMs)} ms
                    </span>
                  )}
                </div>

                {/* Reply Body */}
                <p className="whitespace-pre-line text-textDark/90">
                  {msg.content}
                </p>

                {/* Emergency Code Banner */}
                {msg.emergencyCode && (
                  <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <ShieldAlert className="w-4 h-4 text-red-600" />
                      <span className="font-bold">کد ارجاع اورژانسی:</span>
                      <span className="font-mono font-black text-sm bg-white px-2 py-0.5 rounded border border-red-300">
                        {msg.emergencyCode}
                      </span>
                    </div>
                  </div>
                )}

                {/* Booking Offer Banner */}
                {msg.bookingOffer && (
                  <div className="p-2.5 rounded-xl bg-primary/10 border border-primary/20 text-primary flex items-center gap-2 text-xs font-semibold">
                    <Calendar className="w-4 h-4 shrink-0" />
                    <span>اکشن رزرو نوبت به بیمار پیشنهاد گردید (Booking Offer)</span>
                  </div>
                )}
              </div>

              <div className="text-[10px] text-mutedText/70 px-1 text-left">
                {msg.time}
              </div>
            </div>

            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-primary to-primary-light text-white flex items-center justify-center shrink-0 shadow-sm">
              <Bot className="w-4 h-4" />
            </div>
          </div>
        );
      })}

      {/* Typing loader */}
      {isSending && (
        <div className="flex justify-end items-center gap-2.5 animate-pulse">
          <div className="p-3 rounded-2xl bg-white border border-border/70 flex items-center gap-1.5 text-xs text-mutedText shadow-sm">
            <span className="w-2 h-2 rounded-full bg-primary animate-bounce"></span>
            <span className="w-2 h-2 rounded-full bg-primary animate-bounce [animation-delay:0.2s]"></span>
            <span className="w-2 h-2 rounded-full bg-primary animate-bounce [animation-delay:0.4s]"></span>
            <span className="mr-2">در حال پردازش هوش مصنوعی...</span>
          </div>
          <div className="w-8 h-8 rounded-xl bg-primary/20 text-primary flex items-center justify-center shrink-0">
            <Bot className="w-4 h-4" />
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminAiChatStream;
