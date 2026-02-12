// components/DayPicker.jsx
export default function DayPicker({ days, activeDay, onSelect }) {
  return (
    <div className="flex gap-3 overflow-x-auto pb-4">
      {days.map(d => (
        <div
          key={d.key}
          onClick={() => onSelect(d.key)}
          className={`min-w-[120px] p-4 rounded-xl border text-center cursor-pointer transition
            ${activeDay === d.key
              ? "border-[#2F5D50] bg-[#2F5D50]/5"
              : "border-gray-200 hover:border-[#2F5D50]/40"}
          `}
        >
          <div className="text-sm text-gray-500">{d.label}</div>
          <div className="font-semibold text-[#2F5D50]">{d.display}</div>
        </div>
      ))}
    </div>
  );
}
