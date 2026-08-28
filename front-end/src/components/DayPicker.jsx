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
              ? "border-primary bg-primary/5"
              : "border-gray-200 hover:border-primary/40"}
          `}
        >
          <div className="text-sm text-gray-500">{d.label}</div>
          <div className="font-semibold text-primary">{d.display}</div>
        </div>
      ))}
    </div>
  );
}
