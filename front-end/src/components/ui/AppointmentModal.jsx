// components/AppointmentModal.jsx
import { useState } from "react";
import { getNext14Days } from "../../utils/dateUtils";
import DayPicker from "../DayPicker";
import TimeSlots from "../TimeSlots";

const mockSlots = {
  "2026-02-23": [
    { time: "18:15", status: "available" },
    { time: "18:30", status: "available" },
    { time: "19:00", status: "pending" },
    { time: "19:30", status: "available" },
    { time: "20:00", status: "reserved" },
  ],
};

export default function AppointmentModal({ open, onClose }) {
  const days = getNext14Days();

  const [activeDay, setActiveDay] = useState(days[0].key);
  const [selectedTime, setSelectedTime] = useState(null);

  if (!open) return null;

  const slots = mockSlots[activeDay] || [];

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
          onSelect={(dayKey) => {
            setActiveDay(dayKey);
            setSelectedTime(null); // ریست ساعت
          }}
        />

        <TimeSlots
          slots={slots}
          selectedTime={selectedTime}
          onSelectTime={setSelectedTime}
        />

        <button
          disabled={!selectedTime}
          className={`mt-6 w-full py-3 rounded-xl text-white transition ${
            selectedTime
              ? "bg-[#2F5D50]"
              : "bg-gray-300 cursor-not-allowed"
          }`}
        >
          ثبت نوبت
        </button>

      </div>
    </div>
  );
}
