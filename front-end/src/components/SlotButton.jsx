// components/SlotButton.jsx
export default function SlotButton({ slot, selected, onSelect }) {
  const isDisabled = slot.status !== 'available';

  const base =
    'px-4 py-2 rounded-lg text-sm font-medium transition';

  const styles = {
    available:
      'border border-[#2F5D50] text-[#2F5D50] hover:bg-[#2F5D50] hover:text-white',
    pending:
      'bg-gray-200 text-gray-400 cursor-not-allowed',
    reserved:
      'bg-red-100 text-red-400 cursor-not-allowed',
  };

  const selectedStyle =
    'bg-[#2F5D50] text-white';

  return (
    <button
      disabled={isDisabled}
      onClick={() => onSelect(slot.time)}
      className={`${base} ${
        selected ? selectedStyle : styles[slot.status]
      }`}
    >
      {slot.time}
    </button>
  );
}
