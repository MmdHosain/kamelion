// components/AppointmentModal.jsx
import { useEffect, useState } from "react";
import { getNext14Days } from "../utils/dateUtils";
import DayPicker from "./DayPicker";
import TimeSlots from "./TimeSlots";

export default function AppointmentModal({ open, onClose }) {
  const days = getNext14Days();
  const [activeDay, setActiveDay] = useState(days[0].key);
  const [slots, setSlots] = useState([]);

  useEffect(() => {
    fetch(`/data?day=${activeDay}`)
      .then(r => r.json())
      .then(data => setSlots(data.slots));
  }, [activeDay]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[9999] bg-black/40 backdrop-blur-sm flex items-center justify-center">
      <div className="bg-[#FAFAF8] w-full max-w-3xl rounded-3xl p-6 relative">

        <button
          onClick={onClose}
          className="absolute top-4 left-4 text-gray-400 hover:text-black"
        >
          ✕
        </button>

        <h2 className="text-xl font-bold text-[#2F5D50] mb-6">
          انتخاب زمان نوبت
        </h2>

        <DayPicker
          days={days}
          activeDay={activeDay}
          onSelect={setActiveDay}
        />

        <TimeSlots
          slots={slots}
          onReserve={(time) => {
            fetch("/reserve", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ day: activeDay, time })
            }).then(() => alert("در انتظار تأیید"));
          }}
        />
      </div>
    </div>
  );
}
