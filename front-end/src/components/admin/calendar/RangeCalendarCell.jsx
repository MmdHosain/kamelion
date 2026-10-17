// src/components/admin/calendar/RangeCalendarCell.jsx
import React from 'react';
import {
  classifyRangeDate,
  getRibbonClasses,
  getCellForegroundClasses,
} from '../../../utils/calendarRangeUtils';

/**
 * Modular RangeCalendarCell:
 * Renders a date cell with Google Calendar style continuous capsule ribbon
 * and responsive states (awaiting end pulse, hover ghost preview, selection boundaries).
 */
export default function RangeCalendarCell({
  cell,
  colIndex,
  draftStart,
  draftEnd,
  hovered,
  isRTL = true,
  isToday = false,
  onClick,
  onMouseEnter,
  onMouseLeave,
}) {
  if (!cell) {
    return <div className="h-9 w-full" aria-hidden="true" />;
  }

  const classification = classifyRangeDate({
    ymd: cell.ymd,
    draftStart,
    draftEnd,
    hovered,
  });

  const ribbonClass = getRibbonClasses({
    isRTL,
    colIndex,
    isStart: classification.isStart,
    isEnd: classification.isEnd,
    isInRange: classification.isInRange,
    isHoverPreview: classification.isHoverPreview,
    isSingle: classification.isSingle,
    isAwaitingEnd: classification.isAwaitingEnd,
  });

  const fgClass = getCellForegroundClasses({
    isStart: classification.isStart,
    isEnd: classification.isEnd,
    isInRange: classification.isInRange,
    isSingle: classification.isSingle,
    isAwaitingEnd: classification.isAwaitingEnd,
    isHoveredTarget: classification.isHoveredTarget,
    isToday,
  });

  const isSelectedEndpoint =
    classification.isStart || classification.isEnd || classification.isSingle;

  return (
    <div
      className="relative h-9 w-full flex items-center justify-center select-none"
      onClick={() => onClick && onClick(cell.ymd)}
      onMouseEnter={() => onMouseEnter && onMouseEnter(cell.ymd)}
      onMouseLeave={() => onMouseLeave && onMouseLeave()}
    >
      {/* Background continuous ribbon layer (connecting seamlessly across grid cells) */}
      {ribbonClass && <div className={ribbonClass} />}

      {/* Date circle / number */}
      <div className={fgClass}>
        <span>{cell.displayNum}</span>
        {isToday && (
          <span
            className={`absolute bottom-0.5 w-1 h-1 rounded-full ${
              isSelectedEndpoint ? 'bg-white' : 'bg-primary'
            }`}
          />
        )}
      </div>
    </div>
  );
}
