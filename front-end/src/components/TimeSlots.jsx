// components/TimeSlots.jsx
import SlotButton from './SlotButton';

export default function TimeSlots({
  slots,
  selectedTime,
  onSelectTime,
}) {
  if (!slots || slots.length === 0) {
    return (
      <p className="text-sm text-gray-400 mt-6">
        ساعتی برای این روز تعریف نشده است
      </p>
    );
  }

  return (
    <div className="mt-6">
      <h4 className="text-sm font-semibold text-[#2F5D50] mb-3">
        انتخاب ساعت
      </h4>

      <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
        {slots.map((slot) => (
          <SlotButton
            key={slot.time}
            slot={slot}
            selected={selectedTime === slot.time}
            onSelect={onSelectTime}
          />
        ))}
      </div>
    </div>
  );
}
