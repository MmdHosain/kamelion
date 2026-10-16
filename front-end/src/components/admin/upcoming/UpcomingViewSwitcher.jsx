// src/components/admin/upcoming/UpcomingViewSwitcher.jsx
import React, { useState, useRef, useEffect } from 'react';
import {
  LayoutGrid,
  Table as TableIcon,
  CalendarDays,
  Clock,
  Columns2,
  ChevronDown,
  Check,
  SlidersHorizontal,
} from 'lucide-react';
import { useViewportBoundary } from '../../../hooks/useViewportBoundary';

export const AGENDA_VIEWS = [
  { id: 'cards', label: 'کارت‌های روزانه', icon: LayoutGrid, tooltip: 'نمایش کارتی بر اساس روزها' },
  { id: 'table', label: 'جدول فشرده', icon: TableIcon, tooltip: 'نمای متراکم و کارتابلی نوبت‌ها' },
  { id: 'calendar', label: 'تقویم ماهانه', icon: CalendarDays, tooltip: 'نمای شبکه‌ای تقویم و مراجعین' },
  { id: 'timeline', label: 'تایم‌لاین شیفت', icon: Clock, tooltip: 'نمای زمانی ساعتی و اسلات‌ها' },
  { id: 'split', label: 'نمای دوپنله', icon: Columns2, tooltip: 'تقویم و جزئیات همزمان' },
];

export default function UpcomingViewSwitcher({ currentView, onChangeView }) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef(null);
  const popoverRef = useRef(null);

  useViewportBoundary(isOpen, popoverRef, { padding: 12 });

  const activeViewObj = AGENDA_VIEWS.find((v) => v.id === currentView) || AGENDA_VIEWS[0];
  const ActiveIcon = activeViewObj.icon;

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const handleSelect = (viewId) => {
    onChangeView(viewId);
    setIsOpen(false);
  };

  return (
    <div className="relative inline-block text-right shrink-0" ref={containerRef}>
      {/* Trigger Button */}
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        aria-expanded={isOpen}
        aria-haspopup="true"
        className="flex items-center gap-2 px-3.5 py-2 rounded-2xl bg-white border border-primary/20 hover:border-primary text-textDark text-xs md:text-sm font-bold shadow-sm hover:shadow transition-all duration-200 cursor-pointer"
        title="تغییر نحوه نمایش تقویم نوبت‌ها"
      >
        <span className="w-6 h-6 rounded-lg bg-primary/10 text-primary flex items-center justify-center shrink-0">
          <ActiveIcon size={14} />
        </span>
        <span className="text-textDark/70 text-xs hidden sm:inline font-medium">نحوه نمایش:</span>
        <span className="text-primary font-black text-xs md:text-sm">{activeViewObj.label}</span>
        <ChevronDown
          size={15}
          className={`text-textDark/50 transition-transform duration-200 ${isOpen ? 'rotate-180 text-primary' : ''}`}
        />
      </button>

      {/* Popover Dropdown Menu */}
      {isOpen && (
        <div
          ref={popoverRef}
          className="absolute right-0 left-auto top-full mt-2 w-64 max-w-[calc(100vw-1.5rem)] bg-white/95 backdrop-blur-md rounded-2xl border border-primary/20 shadow-xl p-1.5 z-50 animate-in fade-in zoom-in-95 duration-150"
        >
          <div className="px-3 py-2 border-b border-primary/10 mb-1 flex items-center justify-between">
            <span className="text-xs font-black text-textDark flex items-center gap-1.5">
              <SlidersHorizontal size={13} className="text-primary" />
              <span>انتخاب نمای تقویم</span>
            </span>
            <span className="text-[10px] text-textDark/50 font-medium">ذخیره خودکار</span>
          </div>

          <div className="space-y-1">
            {AGENDA_VIEWS.map((view) => {
              const Icon = view.icon;
              const isSelected = view.id === currentView;

              return (
                <button
                  key={view.id}
                  type="button"
                  onClick={() => handleSelect(view.id)}
                  className={`w-full flex items-center justify-between p-2 rounded-xl text-right transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-primary/10 text-primary font-black border border-primary/25'
                      : 'hover:bg-primary/5 text-textDark/80 hover:text-textDark'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <div
                      className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${
                        isSelected ? 'bg-primary text-white shadow-sm' : 'bg-gray-100 text-gray-600'
                      }`}
                    >
                      <Icon size={14} />
                    </div>
                    <div className="flex flex-col text-right">
                      <span className="text-xs font-bold leading-tight">{view.label}</span>
                      <span className="text-[10px] text-textDark/50 font-medium leading-tight mt-0.5">
                        {view.tooltip}
                      </span>
                    </div>
                  </div>

                  {isSelected && (
                    <Check size={14} className="text-primary shrink-0 mr-2" />
                  )}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
