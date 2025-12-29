export default function SliderCard({
  title = 'بدون عنوان',
  desc = '',
  img_path = '',
}) {
  return (
<div className="min-w-[220px] rounded-xl bg-gray-900 text-white">
<img
src={img_path || 'https://via.placeholder.com/220x300?text=No+Image'}
alt={title}
className="w-full h-[300px] object-cover rounded-t-xl"
/>
<div className="p-3">
<h4 className="font-semibold">{title}</h4>
{desc && <p className="text-sm text-gray-400">{desc}</p>}
</div>
</div>
  );
}