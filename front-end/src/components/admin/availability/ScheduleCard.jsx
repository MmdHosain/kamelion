// ScheduleCard.jsx

import React, { useState } from 'react';
import { Trash2, ChevronDown, ChevronUp, GripVertical } from 'lucide-react'; // ← DND: GripVertical for drag handle


// CONSTANTS


const DAYS        = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const SLOT_OPTIONS = [10, 15, 20, 30, 45, 60];
const GAP_OPTIONS  = [0, 5, 10, 15, 20, 30];


// SCHEDULE CARD


/**
 * Props:
 *   index        {number}    — ← DND: position in the schedules array
 *   schedule     {object}    — full schedule object from parent state
 *   onChange     {function}  — (updatedSchedule) => void
 *   onDelete     {function?} — () => void  (omit to hide trash icon)
 *   dragItem     {ref}       — ← DND: ref to track dragged item index
 *   dragOverItem {ref}       — ← DND: ref to track hovered item index
 *   handleSort   {function}  — ← DND: callback to reorder on drag end
 */
const ScheduleCard = ({ 
  index, 
  schedule, 
  onChange, 
  onDelete, 
  dragItem, 
  dragOverItem, 
  handleSort 
}) => {

  // ── Local UI state ─────────────────────────────────────────────────────────
  const [expanded, setExpanded] = useState(false);
  const [isDragging, setIsDragging] = useState(false); // ← DND: track drag state for styling

  // ── Field helpers ──────────────────────────────────────────────────────────
  const update = (field, value) =>
    onChange({ ...schedule, [field]: value });

  const toggleDay = (day) => {
    const next = schedule.selectedDays.includes(day)
      ? schedule.selectedDays.filter((d) => d !== day)
      : [...schedule.selectedDays, day];
    update('selectedDays', next);
  };

  // ─────────────────────────────────────────────────────────────────────────
  // ← DND: Native HTML5 Drag & Drop Event Handlers
  // ─────────────────────────────────────────────────────────────────────────

  const handleDragStart = (e) => {
    dragItem.current = index;
    setIsDragging(true);
    
    // Optional: Set drag image (can be customized)
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/html', e.target.outerHTML);
  };

  const handleDragEnd = (e) => {
    setIsDragging(false);
    handleSort(); // Parent function to reorder
  };

  const handleDragOver = (e) => {
    e.preventDefault(); // ← CRUCIAL: allows drop to happen
  };

  const handleDragEnter = (e) => {
    dragOverItem.current = index;
  };

  // ─────────────────────────────────────────────────────────────────────────
  // RENDER
  // ─────────────────────────────────────────────────────────────────────────

  return (
    /*
      ← DND: Native HTML5 Drag & Drop attributes
      - draggable={true}       : makes the entire card draggable
      - onDragStart            : fires when drag begins
      - onDragEnd              : fires when drag ends (whether dropped or cancelled)
      - onDragOver             : fires continuously while dragged item is over this card
      - onDragEnter            : fires when dragged item first enters this card area
      - Dynamic styling        : changes appearance during drag
    */
    <div
      draggable={true}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      onDragOver={handleDragOver}
      onDragEnter={handleDragEnter}
      className={`
        relative bg-white rounded-2xl shadow-sm
        flex flex-col
        transition-all duration-200
        cursor-move
        ${isDragging 
          ? 'opacity-50 scale-105 shadow-2xl border-2 border-dashed border-primary rotate-2' 
          : 'hover:shadow-md'
        }
      `}
    >

      {/* ── Card Header ──────────────────────────────────────────────────── */}
      <div className="flex items-center justify-between px-4 pt-4 pb-2 gap-2">

        {/* Active toggle + name */}
        <div className="flex items-center gap-2 flex-1 min-w-0">
          {/* Toggle */}
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation(); // Prevent drag when clicking toggle
              update('isActive', !schedule.isActive);
            }}
            className={`
              relative w-9 h-5 rounded-full flex-shrink-0
              transition-colors duration-200
              ${schedule.isActive ? 'bg-primary' : 'bg-gray-200'}
            `}
            aria-label={schedule.isActive ? 'Deactivate schedule' : 'Activate schedule'}
          >
            <span className={`
              absolute top-0.5 w-4 h-4 bg-white rounded-full shadow
              transition-transform duration-200
              ${schedule.isActive ? 'translate-x-4' : 'translate-x-0.5'}
            `} />
          </button>

          {/* Patient / schedule name */}
          <input
            type="text"
            value={schedule.patientName}
            onChange={(e) => update('patientName', e.target.value)}
            onClick={(e) => e.stopPropagation()} // Prevent drag when clicking input
            placeholder="Schedule name…"
            className="
              flex-1 min-w-0 text-sm font-semibold text-gray-800
              bg-transparent border-none outline-none
              placeholder:text-gray-300
              truncate
            "
          />
        </div>

        {/* Right-side icons */}
        <div className="flex items-center gap-1 flex-shrink-0">

          {/* Trash */}
          {onDelete && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation(); // Prevent drag when clicking delete
                onDelete();
              }}
              aria-label="Delete schedule"
              className="
                p-1.5 rounded-lg text-gray-300
                hover:text-red-400 hover:bg-red-50
                transition-colors duration-150
              "
            >
              <Trash2 size={15} />
            </button>
          )}

          {/*
            ← DND: DRAG HANDLE (visual indicator)
            While the entire card is draggable, this icon gives users
            a clear visual cue that the card can be dragged.
          */}
          <div
            className="
              p-1.5 rounded-lg text-gray-300
              hover:text-primary hover:bg-primary/5
              transition-colors duration-150
              cursor-grab active:cursor-grabbing
            "
            title="Drag to reorder"
          >
            <GripVertical size={15} />
          </div>

          {/* Expand / collapse */}
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation(); // Prevent drag when clicking expand
              setExpanded((v) => !v);
            }}
            aria-label={expanded ? 'Collapse' : 'Expand'}
            className="
              p-1.5 rounded-lg text-gray-300
              hover:text-gray-500 hover:bg-gray-100
              transition-colors duration-150
            "
          >
            {expanded ? <ChevronUp size={15} /> : <ChevronDown size={15} />}
          </button>

        </div>
      </div>

      {/* ── Time summary (always visible) ──────────────────────────────────── */}
      <div className="px-4 pb-3 flex items-center gap-2 text-xs text-gray-400 font-medium">
        <span>{schedule.startTime}</span>
        <span>→</span>
        <span>{schedule.endTime}</span>
        <span className="ml-auto">
          {schedule.selectedDays.length === 7
            ? 'Every day'
            : schedule.selectedDays.length === 0
            ? 'No days'
            : schedule.selectedDays.join(', ')
          }
        </span>
      </div>

      {/* ── Expanded settings ──────────────────────────────────────────────── */}
      {expanded && (
        <div className="border-t border-gray-100 px-4 py-4 flex flex-col gap-4">

          {/* Time range */}
          <div className="flex gap-3">
            <label className="flex-1 flex flex-col gap-1">
              <span className="text-[11px] font-semibold text-gray-400 uppercase tracking-wide">
                Start
              </span>
              <input
                type="time"
                value={schedule.startTime}
                onChange={(e) => update('startTime', e.target.value)}
                onClick={(e) => e.stopPropagation()} // Prevent drag when clicking input
                className="
                  w-full text-sm text-gray-700 bg-gray-50
                  border border-gray-200 rounded-lg px-2 py-1.5
                  focus:outline-none focus:ring-2 focus:ring-primary/30
                "
              />
            </label>
            <label className="flex-1 flex flex-col gap-1">
              <span className="text-[11px] font-semibold text-gray-400 uppercase tracking-wide">
                End
              </span>
              <input
                type="time"
                value={schedule.endTime}
                onChange={(e) => update('endTime', e.target.value)}
                onClick={(e) => e.stopPropagation()} // Prevent drag when clicking input
                className="
                  w-full text-sm text-gray-700 bg-gray-50
                  border border-gray-200 rounded-lg px-2 py-1.5
                  focus:outline-none focus:ring-2 focus:ring-primary/30
                "
              />
            </label>
          </div>

          {/* Slot + Gap duration */}
          <div className="flex gap-3">
            <label className="flex-1 flex flex-col gap-1">
              <span className="text-[11px] font-semibold text-gray-400 uppercase tracking-wide">
                Slot (min)
              </span>
              <select
                value={schedule.slotDuration}
                onChange={(e) => update('slotDuration', Number(e.target.value))}
                onClick={(e) => e.stopPropagation()} // Prevent drag when clicking select
                className="
                  w-full text-sm text-gray-700 bg-gray-50
                  border border-gray-200 rounded-lg px-2 py-1.5
                  focus:outline-none focus:ring-2 focus:ring-primary/30
                "
              >
                {SLOT_OPTIONS.map((v) => (
                  <option key={v} value={v}>{v} min</option>
                ))}
              </select>
            </label>
            <label className="flex-1 flex flex-col gap-1">
              <span className="text-[11px] font-semibold text-gray-400 uppercase tracking-wide">
                Gap (min)
              </span>
              <select
                value={schedule.gapDuration}
                onChange={(e) => update('gapDuration', Number(e.target.value))}
                onClick={(e) => e.stopPropagation()} // Prevent drag when clicking select
                className="
                  w-full text-sm text-gray-700 bg-gray-50
                  border border-gray-200 rounded-lg px-2 py-1.5
                  focus:outline-none focus:ring-2 focus:ring-primary/30
                "
              >
                {GAP_OPTIONS.map((v) => (
                  <option key={v} value={v}>{v === 0 ? 'None' : `${v} min`}</option>
                ))}
              </select>
            </label>
          </div>

          {/* Day picker */}
          <div className="flex flex-col gap-1.5">
            <span className="text-[11px] font-semibold text-gray-400 uppercase tracking-wide">
              Active Days
            </span>
            <div className="flex gap-1 flex-wrap">
              {DAYS.map((day) => {
                const active = schedule.selectedDays.includes(day);
                return (
                  <button
                    key={day}
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation(); // Prevent drag when clicking day buttons
                      toggleDay(day);
                    }}
                    className={`
                      px-2 py-1 rounded-lg text-xs font-semibold
                      transition-all duration-150
                      ${active
                        ? 'bg-primary text-white shadow-sm'
                        : 'bg-gray-100 text-gray-400 hover:bg-gray-200'
                      }
                    `}
                  >
                    {day}
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
