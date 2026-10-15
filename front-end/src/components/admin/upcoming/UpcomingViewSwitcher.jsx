// src/components/admin/upcoming/UpcomingViewSwitcher.jsx
import React from 'react';
import {
  LayoutGrid,
  Table as TableIcon,
  CalendarDays,
  Clock,
  Columns2,
} from 'lucide-react';

export const AGENDA_VIEWS = [
  { id: 'cards', label: 'کارت‌های روزانه', icon: LayoutGrid, tooltip: 'نمایش کارتی بر اساس روزها' },
  { id: 'table', label: 'جدول فشرده', icon: TableIcon, tooltip: 'نمای متراکم و کارتابلی نوبت‌ها' },
  { id: 'calendar', label: 'تقویم ماهانه', icon: CalendarDays, tooltip: 'نمای شبکه‌ای تقویم و مراجعین' },
  { id: 'timeline', label: 'تایم‌لاین شیفت', icon: Clock, tooltip: 'نمای زمانی ساعتی و اسلات‌ها' },
  { id: 'split', label: 'نمای دوپنله', icon: Columns2, tooltip: 'تقویم و جزئیات همزمان' },
];

export default function UpcomingViewSwitcher({ currentView, onChangeView }) {
  return (
    <div className="flex items-center gap-1 bg-white/80 backdrop-blur-sm border border-primary/20 p-1 rounded-2xl shadow-sm self-start sm:self-auto overflow-x-auto no-scrollbar">
      {AGENDA_VIEWS.map((view) => {
        const Icon = view.icon;
        const isActive = currentView === view.id;

        return (
          <button
            key={view.id}
            type="button"
            onClick={() => onChangeView(view.id)}
            title={view.tooltip}
            aria-label={view.label}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all duration-200 cursor-pointer whitespace-nowrap shrink-0 ${
              isActive
                ? 'bg-primary text-white shadow-sm shadow-primary/20 scale-[1.01]'
                : 'text-textDark/70 hover:text-textDark hover:bg-gray-100/80'
            }`}
          >
            <Icon size={14} className={isActive ? 'text-white' : 'text-primary'} />
            <span className="hidden md:inline">{view.label}</span>
          </button>
        );
      })}
    </div>
  );
}
