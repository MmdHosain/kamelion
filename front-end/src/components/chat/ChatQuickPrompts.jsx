// src/components/chat/ChatQuickPrompts.jsx
import React from 'react';
import {
  AlertTriangle,
  Activity,
  Sparkles,
  Stethoscope,
  HeartPulse,
  Calendar,
} from 'lucide-react';

export const QUICK_PROMPTS = [
  { text: 'درد یا خونریزی شدید دارم', icon: AlertTriangle, isUrgent: true },
  { text: 'توده جدید در سینه لمس کرده‌ام', icon: Activity },
  { text: 'مشاوره جراحی ماموپلاستی و زیبایی', icon: Sparkles },
  { text: 'بررسی جواب ماموگرافی و سونوگرافی', icon: Stethoscope },
  { text: 'مراقبت‌های بعد از جراحی', icon: HeartPulse },
  { text: 'رزرو نوبت ویزیت با پزشک', icon: Calendar, isBooking: true },
];

export const ChatQuickPrompts = ({ onSelectPrompt, onOpenAppointment }) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2 sm:gap-2.5">
      {QUICK_PROMPTS.map((prompt, idx) => {
        const Icon = prompt.icon;
        return (
          <button
            key={idx}
            type="button"
            onClick={() => {
              if (prompt.isBooking && onOpenAppointment) {
                onOpenAppointment();
              } else {
                onSelectPrompt(prompt.text);
              }
            }}
            className={`chat-suggestion-chip flex items-center gap-2 p-2.5 sm:p-3 rounded-xl sm:rounded-2xl border text-right transition-all duration-200 ease-[cubic-bezier(0.4,0,0.2,1)] text-xs font-bold shadow-xs hover:-translate-y-0.5 active:translate-y-0 active:scale-95 cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-white motion-reduce:hover:translate-y-0 motion-reduce:active:scale-100 motion-reduce:transition-none select-none ${
              prompt.isUrgent
                ? 'bg-rose-600 border-rose-700/80 text-white hover:brightness-110 hover:border-rose-600 hover:shadow-md hover:shadow-rose-600/30 active:brightness-90 focus-visible:ring-rose-500'
                : 'bg-white/95 border-primary/20 text-textDark hover:bg-primary/10 hover:border-primary/50 hover:brightness-105 hover:shadow-md hover:shadow-primary/15 active:bg-primary/15 active:brightness-95 focus-visible:ring-primary'
            }`}
          >
            <div
              className={`p-1.5 rounded-lg shrink-0 ${
                prompt.isUrgent
                  ? 'bg-white/20 text-white'
                  : 'bg-primary/10 text-primary'
              }`}
            >
              <Icon className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            </div>
            <span className="line-clamp-1">{prompt.text}</span>
          </button>
        );
      })}
    </div>
  );
};

export default ChatQuickPrompts;
