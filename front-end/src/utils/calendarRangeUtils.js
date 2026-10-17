// src/utils/calendarRangeUtils.js

/**
 * Classifies a date cell within a range selection workflow.
 *
 * @param {Object} params
 * @param {string} params.ymd - 'YYYY-MM-DD'
 * @param {string} params.draftStart - 'YYYY-MM-DD' | ''
 * @param {string} params.draftEnd - 'YYYY-MM-DD' | ''
 * @param {string|null} params.hovered - 'YYYY-MM-DD' | null
 * @returns {Object} Classification metadata
 */
export function classifyRangeDate({ ymd, draftStart, draftEnd, hovered }) {
  if (!ymd) {
    return { isDate: false };
  }

  const candidateEnd = draftEnd || (draftStart && !draftEnd ? hovered : null);

  if (!draftStart && !candidateEnd) {
    return {
      isDate: true,
      isStart: false,
      isEnd: false,
      isInRange: false,
      isSingle: false,
      isAwaitingEnd: false,
      isHoverPreview: false,
      isHoveredTarget: false,
    };
  }

  // Only start is selected, no end and no active hover preview
  if (draftStart && !candidateEnd) {
    const isStart = ymd === draftStart;
    return {
      isDate: true,
      isStart,
      isEnd: false,
      isInRange: false,
      isSingle: false,
      isAwaitingEnd: isStart,
      isHoverPreview: false,
      isHoveredTarget: false,
    };
  }

  const isHoverPreview = Boolean(!draftEnd && hovered && hovered !== draftStart);
  const minDate = draftStart <= candidateEnd ? draftStart : candidateEnd;
  const maxDate = draftStart <= candidateEnd ? candidateEnd : draftStart;

  const isSingle = minDate === maxDate;
  const isStart = ymd === minDate;
  const isEnd = ymd === maxDate;
  const isInRange = ymd > minDate && ymd < maxDate;
  const isHoveredTarget = isHoverPreview && ymd === hovered;

  return {
    isDate: true,
    isStart,
    isEnd,
    isInRange,
    isSingle,
    isAwaitingEnd: false,
    isHoverPreview,
    isHoveredTarget,
  };
}

/**
 * Computes background ribbon classes for continuous capsule styling (Google Calendar style).
 * Ensures zero gap between adjacent cells in a 7-column grid and rounds row boundaries.
 *
 * @param {Object} params
 * @param {boolean} params.isRTL - true for Jalali (Sat=col 0), false for Gregorian (Sun=col 0)
 * @param {number} params.colIndex - column index in row (0 to 6)
 * @param {boolean} params.isStart
 * @param {boolean} params.isEnd
 * @param {boolean} params.isInRange
 * @param {boolean} params.isHoverPreview
 * @param {boolean} params.isSingle
 * @param {boolean} params.isAwaitingEnd
 * @returns {string|null} CSS classes for the ribbon element
 */
export function getRibbonClasses({
  isRTL = true,
  colIndex = 0,
  isStart = false,
  isEnd = false,
  isInRange = false,
  isHoverPreview = false,
  isSingle = false,
  isAwaitingEnd = false,
}) {
  if (isSingle || isAwaitingEnd || (!isStart && !isEnd && !isInRange)) {
    return null;
  }

  // Ribbon base styling: prominent drawn capsule band (Google Calendar style)
  const baseBg = isHoverPreview
    ? 'bg-pink-50 border-dashed border-pink-300'
    : 'bg-pink-100 border-solid border-pink-300';

  let roundBorderClass = 'rounded-none border-y';
  let positionClass = 'inset-x-0';

  if (isInRange) {
    positionClass = 'inset-x-0';
    if (isRTL) {
      if (colIndex === 0) roundBorderClass = 'rounded-r-full border-y border-r';
      else if (colIndex === 6) roundBorderClass = 'rounded-l-full border-y border-l';
      else roundBorderClass = 'rounded-none border-y';
    } else {
      if (colIndex === 0) roundBorderClass = 'rounded-l-full border-y border-l';
      else if (colIndex === 6) roundBorderClass = 'rounded-r-full border-y border-r';
      else roundBorderClass = 'rounded-none border-y';
    }
  } else if (isStart) {
    // In RTL: days flow right to left -> subsequent days are to the LEFT of start.
    // The ribbon extends from center (50%) to the left edge (0).
    // In LTR: days flow left to right -> subsequent days are to the RIGHT of start.
    // The ribbon extends from center (50%) to the right edge (0).
    if (isRTL) {
      positionClass = 'left-0 right-1/2';
      roundBorderClass = colIndex === 6 ? 'rounded-l-full border-y border-l' : 'border-y';
    } else {
      positionClass = 'left-1/2 right-0';
      roundBorderClass = colIndex === 6 ? 'rounded-r-full border-y border-r' : 'border-y';
    }
  } else if (isEnd) {
    // In RTL: preceding days are to the RIGHT of end.
    // The ribbon extends from right edge (0) to center (50%).
    // In LTR: preceding days are to the LEFT of end.
    // The ribbon extends from left edge (0) to center (50%).
    if (isRTL) {
      positionClass = 'right-0 left-1/2';
      roundBorderClass = colIndex === 0 ? 'rounded-r-full border-y border-r' : 'border-y';
    } else {
      positionClass = 'left-0 right-1/2';
      roundBorderClass = colIndex === 0 ? 'rounded-l-full border-y border-l' : 'border-y';
    }
  }

  return `absolute inset-y-0.5 ${positionClass} ${baseBg} ${roundBorderClass} pointer-events-none transition-all duration-150`;
}

/**
 * Computes the foreground date number button styling.
 * Start & End use the prominent brand purple button (--primary: #e75480) with white text.
 * Intermediate in-range days use high-contrast deep plum text (--text-dark: #4a2545).
 * "Today" is styled with distinct indicators and a dedicated dot marker.
 */
export function getCellForegroundClasses({
  isStart = false,
  isEnd = false,
  isInRange = false,
  isSingle = false,
  isAwaitingEnd = false,
  isHoveredTarget = false,
  isToday = false,
}) {
  const base =
    'relative z-10 w-8 h-8 flex items-center justify-center text-xs md:text-sm select-none cursor-pointer rounded-full transition-all duration-150 ';

  // ── Case 1: Start, End, or Single Selection ───────────────────────────────
  if (isStart || isEnd || isSingle) {
    if (isAwaitingEnd) {
      return (
        base +
        'bg-primary text-white shadow-md ring-4 ring-pink-300 animate-pulse font-black'
      );
    }
    if (isHoveredTarget) {
      return (
        base +
        'bg-primary text-white shadow-lg ring-2 ring-pink-400 font-black scale-105'
      );
    }
    return base + 'bg-primary text-white shadow-md font-black';
  }

  // ── Case 2: Intermediate / In-Range days ──────────────────────────────────
  if (isInRange) {
    if (isToday) {
      return (
        base +
        'text-textDark font-black ring-1 ring-primary/40 bg-white/70 hover:bg-white/90'
      );
    }
    return (
      base +
      'text-textDark font-black hover:bg-pink-200/60'
    );
  }

  // ── Case 3: Today unselected ─────────────────────────────────────────────
  if (isToday) {
    return (
      base +
      'text-primary font-black border border-primary/40 bg-pink-50/50 hover:bg-primary/10 shadow-xs'
    );
  }

  // ── Case 4: Normal unselected day ─────────────────────────────────────────
  return base + 'text-textDark/80 hover:bg-pink-50 hover:text-textDark font-medium';
}
