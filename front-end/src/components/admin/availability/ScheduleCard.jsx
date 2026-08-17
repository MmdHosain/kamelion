// ScheduleCard.jsx
import React, { useState } from 'react';
import { Trash2, ChevronDown, ChevronUp, GripVertical, Clock, Calendar } from 'lucide-react';

const DAYS_MAP = [
  { code: 'Sat', fa: 'شنبه' },
  { code: 'Sun', fa: '۱شنبه' },
  { code: 'Mon', fa: '۲شنبه' },
  { code: 'Tue', fa: '۳شنبه' },
  { code: 'Wed', fa: '۴شنبه' },
  { code: 'Thu', fa: '۵شنبه' },
  { code: 'Fri', fa: 'جمعه' },
];

const SLOT_OPTIONS = [15, 20, 30, 45, 60];
const GAP_OPTIONS = [0, 5, 10, 15, 20];

const ScheduleCard = ({
  index,
  schedule,
  onChange,
  onDelete,
  dragItem,
  dragOverItem,
  handleSort,
}) => {
  const [expanded, setExpanded] = useState(false);
  const [isDragging, setIsDragging] = useState(false);

  const update = (field, value) =>
    onChange({ ...schedule, [field]: value });

  const toggleDay = (day) => {
    const next = schedule.selectedDays.includes(day)
      ? schedule.selectedDays.filter((d) => d !== day)
      : [...schedule.selectedDays, day];
    update('selectedDays', next);
  };

  const handleDragStart = (e) => {
    dragItem.current = index;
    setIsDragging(true);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragEnd = () => {
    setIsDragging(false);
    handleSort();
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const handleDragEnter = () => {
    dragOverItem.current = index;
  };

  return (
    <div
      draggable={true}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      onDragOver={handleDragOver}
      onDragEnter={handleDragEnter}
      className={`relative bg-white/90 backdrop-blur-md rounded-3xl border border-primary/20 p-4 shadow-sm flex flex-col transition-all duration-200 cursor-move ${
        isDragging
          ? 'opacity-50 scale-105 shadow-2xl border-2 border-dashed border-primary rotate-2'
          : 'hover:shadow-md hover:border-primary/40'
      }`}
    >
      {/* Card Header */}
      <div className="flex items-center justify-between gap-2 pb-2">
        <div className="flex items-center gap-2 flex-1 min-w-0">
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              update('isActive', !schedule.isActive);
            }}
            className={`relative w-9 h-5 rounded-full flex-shrink-0 transition-colors duration-200 ${
              schedule.isActive ? 'bg-primary' : 'bg-gray-200'
            }`}
            aria-label="Toggle active"
          >
            <span
              className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform duration-200 ${
                schedule.isActive ? 'translate-x-4' : 'translate-x-0.5'
              }`}
            />
          </button>

          <input
            type="text"
            value={schedule.patientName}
            onChange={(e) => update('patientName', e.target.value)}
            onClick={(e) => e.stopPropagation()}
            placeholder="عنوان شیفت (مثلاً شیفت صبح)..."
            className="flex-1 min-w-0 text-xs md:text-sm font-bold text-textDark bg-transparent border-none outline-none placeholder:text-textDark/40 truncate"
          />
        </div>

        <div className="flex items-center gap-1 flex-shrink-0">
          {onDelete && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onDelete();
              }}
              className="p-1.5 rounded-xl text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors"
              title="حذف این شیفت"
            >
              <Trash2 size={15} />
            </button>
          )}

          <div
            className="p-1.5 rounded-xl text-gray-400 hover:text-primary hover:bg-primary/5 transition-colors cursor-grab active:cursor-grabbing"
            title="جابجایی ترتیب"
          >
            <GripVertical size={15} />
          </div>

          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setExpanded((v) => !v);
            }}
            className="p-1.5 rounded-xl text-gray-400 hover:text-primary hover:bg-primary/5 transition-colors"
          >
            {expanded ? <ChevronUp size={15} /> : <ChevronDown size={15} />}
          </button>
        </div>
      </div>

      {/* Time Summary */}
      <div className="flex items-center justify-between text-xs text-textDark/70 font-bold border-t border-primary/10 pt-2.5">
        <div className="flex items-center gap-1 font-mono text-primary">
          <Clock size={13} />
          <span>{schedule.startTime}</span>
          <span>تا</span>
          <span>{schedule.endTime}</span>
        </div>
        <span className="text-[11px] text-textDark/60 truncate max-w-[140px]">
          {schedule.selectedDays.length === 7
            ? 'همه روزها'
            : schedule.selectedDays.length === 0
            ? 'بدون روز انتخابی'
            : schedule.selectedDays
                .map((d) => DAYS_MAP.find((m) => m.code === d)?.fa || d)
                .join('، ')}
        </span>
      </div>

      {/* Expanded Settings */}
      {expanded && (
        <div className="border-t border-primary/15 mt-3 pt-3 flex flex-col gap-3">
          {/* Time Range */}
          <div className="grid grid-cols-2 gap-2">
            <label className="flex flex-col gap-1 text-[11px] font-bold text-textDark/70">
              <span>ساعت شروع:</span>
              <input
                type="time"
                value={schedule.startTime}
                onChange={(e) => update('startTime', e.target.value)}
                onClick={(e) => e.stopPropagation()}
                className="w-full text-xs text-textDark bg-white border border-primary/20 rounded-xl px-2 py-1.5 focus:outline-none focus:border-primary font-mono"
              />
            </label>
            <label className="flex flex-col gap-1 text-[11px] font-bold text-textDark/70">
              <span>ساعت پایان:</span>
              <input
                type="time"
                value={schedule.endTime}
                onChange={(e) => update('endTime', e.target.value)}
                onClick={(e) => e.stopPropagation()}
                className="w-full text-xs text-textDark bg-white border border-primary/20 rounded-xl px-2 py-1.5 focus:outline-none focus:border-primary font-mono"
              />
            </label>
          </div>

          {/* Durations */}
          <div className="grid grid-cols-2 gap-2">
            <label className="flex flex-col gap-1 text-[11px] font-bold text-textDark/70">
              <span>مدت هر ویزیت:</span>
              <select
                value={schedule.slotDuration}
                onChange={(e) => update('slotDuration', Number(e.target.value))}
                onClick={(e) => e.stopPropagation()}
                className="w-full text-xs text-textDark bg-white border border-primary/20 rounded-xl px-2 py-1.5 focus:outline-none focus:border-primary"
              >
                {SLOT_OPTIONS.map((min) => (
                  <option key={min} value={min}>
                    {min} دقیقه
                  </option>
                ))}
              </select>
            </label>

            <label className="flex flex-col gap-1 text-[11px] font-bold text-textDark/70">
              <span>فاصله استراحت:</span>
              <select
                value={schedule.gapDuration}
                onChange={(e) => update('gapDuration', Number(e.target.value))}
                onClick={(e) => e.stopPropagation()}
                className="w-full text-xs text-textDark bg-white border border-primary/20 rounded-xl px-2 py-1.5 focus:outline-none focus:border-primary"
              >
                {GAP_OPTIONS.map((min) => (
                  <option key={min} value={min}>
                    {min} دقیقه
                  </option>
                ))}
              </select>
            </label>
          </div>

          {/* Days Selection */}
          <div className="flex flex-col gap-1.5">
            <span className="text-[11px] font-bold text-textDark/70">روزهای فعال کاری:</span>
            <div className="grid grid-cols-4 gap-1.5">
              {DAYS_MAP.map((day) => {
                const isSelected = schedule.selectedDays.includes(day.code);
                return (
                  <button
                    key={day.code}
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleDay(day.code);
                    }}
                    className={`py-1.5 px-1 rounded-xl text-[10px] font-bold transition-all ${
                      isSelected
                        ? 'bg-primary text-white shadow-sm'
                        : 'bg-white border border-primary/20 text-textDark/70 hover:border-primary'
                    }`}
                  >
                    {day.fa}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ScheduleCard;
