// src/components/admin/upcoming/UpcomingQuickPresets.jsx
import React from 'react';
import { CalendarDays, Sparkles } from 'lucide-react';

const PRESETS = [
  { id: 'today', label: 'امروز' },
  { id: 'tomorrow', label: 'فردا' },
  { id: 'next3', label: '۳ روز آینده' },
  { id: 'next7', label: 'هفته پیش‌رو (۷ روز)' },
  { id: 'next30', label: '۳۰ روز آینده' },
];

export default function UpcomingQuickPresets({ activePreset, onSelectPreset }) {
  return (
    <div className="flex items-center gap-1.5 overflow-x-auto pb-1 chat-scroll">
      {PRESETS.map((preset) => {
        const isActive = activePreset === preset.id;
        return (
          <button
            key={preset.id}
            type="button"
            onClick={() => onSelectPreset(preset.id)}
            className={`px-3.5 py-2 rounded-2xl text-xs font-bold whitespace-nowrap transition-all duration-200 cursor-pointer flex items-center gap-1.5 ${
              isActive
                ? 'bg-primary text-white shadow-md shadow-primary/25 scale-[1.02]'
                : 'bg-white/80 hover:bg-white text-textDark/80 border border-primary/15 hover:border-primary/40'
            }`}
          >
            {preset.id === 'today' && <Sparkles size={12} className={isActive ? 'text-white' : 'text-primary'} />}
            <span>{preset.label}</span>
          </button>
        );
      })}

      {activePreset === 'custom' && (
        <span className="px-3 py-1.5 rounded-2xl text-xs font-black bg-primary/10 text-primary border border-primary/30 flex items-center gap-1">
          <CalendarDays size={13} />
          <span>بازه دلخواه انتخاب‌شده</span>
        </span>
      )}
    </div>
  );
}
