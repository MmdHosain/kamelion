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
            className={`flex items-center gap-2 p-2.5 sm:p-3 rounded-xl sm:rounded-2xl border text-right transition-all text-xs font-bold shadow-xs hover:scale-[1.02] active:scale-[0.98] cursor-pointer ${
              prompt.isUrgent
                ? 'bg-red-500/10 border-red-500/30 text-red-600 hover:bg-red-500/20'
                : 'bg-white/90 border-primary/20 text-textDark hover:bg-primary/10 hover:border-primary/40'
            }`}
          >
            <div
              className={`p-1.5 rounded-lg shrink-0 ${
                prompt.isUrgent
                  ? 'bg-red-500/20 text-red-600'
                  : 'bg-primary/15 text-primary'
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
