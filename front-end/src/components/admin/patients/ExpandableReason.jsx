import React, { useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';

/**
 * ExpandableReason Component
 * Displays the first line of visit reason with a toggle to expand/collapse full multi-line text.
 * Ensures strict word wrapping within parent container bounds.
 */
export default function ExpandableReason({ reason }) {
  const [isExpanded, setIsExpanded] = useState(false);

  if (!reason || reason === '-' || reason.trim() === '') return null;

  // Determine if text is long enough to benefit from truncation
  const trimmed = reason.trim();
  const isMultiLine = trimmed.includes('\n');
  const isLong = trimmed.length > 55 || isMultiLine;

  return (
    <div className="text-[11px] text-gray-700 bg-gray-50/90 p-2.5 rounded-xl leading-relaxed select-text border border-gray-100 w-full min-w-0 break-words">
      <div className="flex items-center justify-between mb-1 gap-2">
        <span className="font-bold text-gray-400 text-[10px] shrink-0">علت مراجعه:</span>
        {isLong && (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setIsExpanded((prev) => !prev);
            }}
            className="inline-flex items-center gap-0.5 text-[10px] font-bold text-primary hover:text-primary-dark transition-colors cursor-pointer select-none shrink-0"
            title={isExpanded ? 'نمایش کمتر' : 'نمایش بیشتر'}
          >
            <span>{isExpanded ? 'نمایش کمتر' : 'نمایش بیشتر'}</span>
            {isExpanded ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
          </button>
        )}
      </div>

      <div
        className={`text-gray-800 transition-all ${
          isExpanded
            ? 'whitespace-pre-wrap break-words leading-relaxed'
            : 'line-clamp-1 break-words overflow-hidden text-ellipsis'
        }`}
      >
        {trimmed}
      </div>
    </div>
  );
}
