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
            className={`flex items-center gap-2 p-2.5 sm:p-3 rounded-xl sm:rounded-2xl border text-right transition-all text-xs font-bold shadow-sm hover:scale-[1.02] active:scale-[0.98] cursor-pointer ${
              prompt.isUrgent
                ? 'bg-rose-500 border-rose-600 text-white hover:bg-rose-600'
                : 'bg-white border-gray-200 text-gray-800 hover:bg-gray-50'
            }`}
          >
            <div
              className={`p-1.5 rounded-lg shrink-0 ${
                prompt.isUrgent
                  ? 'bg-rose-600 text-white'
                  : 'bg-gray-100 text-primary'
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
