// utils/dateUtils.js
export function getNext14Days() {
  const days = [];
  const today = new Date();

  for (let i = 0; i < 14; i++) {
    const d = new Date();
    d.setDate(today.getDate() + i);

    days.push({
      key: d.toISOString().slice(0, 10),
      date: d,
      label:
        i === 0 ? "امروز" :
        i === 1 ? "فردا" :
        d.toLocaleDateString("fa-IR", { weekday: "long" }),
      display: d.toLocaleDateString("fa-IR", {
        day: "numeric",
        month: "long"
      })
    });
  }

  return days;
}
