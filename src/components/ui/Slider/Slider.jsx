import SliderCard from './SliderCard';

export default function Slider({ items = [] }) {
  if (!Array.isArray(items) || items.length === 0) {
return (
<div className="text-xs text-gray-400">
آیتمی برای نمایش در اسلایدر وجود ندارد.
</div>
);
  }

  return (
<div className="flex gap-4 overflow-x-auto py-3">
{items.map((item, idx) => (
<SliderCard key={idx} {...item} />
))}
</div>
  );
}