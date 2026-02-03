// components/SlotButton.jsx
export default function SlotButton({ time, status, onClick }) {
  const base =
    "px-4 py-2 rounded-lg text-sm font-medium transition cursor-pointer";

  const styles = {
    available: "bg-[#2F5D50]/10 text-[#2F5D50] hover:bg-[#2F5D50] hover:text-white",
    pending: "bg-[#E6C5CC] text-[#2F5D50] cursor-not-allowed",
    reserved: "bg-red-200 text-red-700 cursor-not-allowed"
  };

  return (
    <button
      disabled={status !== "available"}
      onClick={onClick}
      className={`${base} ${styles[status]}`}
    >
      {time}
    </button>
  );
}
