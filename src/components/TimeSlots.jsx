// components/TimeSlots.jsx
import SlotButton from "./SlotButton";

export default function TimeSlots({ slots, onReserve }) {
  return (
    <div className="grid grid-cols-3 gap-3 mt-6">
      {slots.map(slot => (
        <SlotButton
          key={slot.time}
          time={slot.time}
          status={slot.status}
          onClick={() => onReserve(slot.time)}
        />
      ))}
    </div>
  );
}
