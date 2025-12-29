import React from 'react';
import SliderCard from './SliderCard';

export default function Slider({ items = [] }) {
  // بررسی اینکه آرایه خالی نباشد
  if (!Array.isArray(items) || items.length === 0) {
    return null;
  }

  return (
    <div className="w-full mt-2 mb-4">
      <div 
        className="flex gap-3 overflow-x-auto pb-6 pt-2 px-1 snap-x snap-mandatory no-scrollbar" 
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
      >
        {items.map((item, idx) => (
          <div key={idx} className="snap-center shrink-0 first:pl-2 last:pr-2">
            <SliderCard {...item} />
          </div>
        ))}
      </div>
    </div>
  );
}
