import React, { useState } from "react";

const CommentModal = ({ open, onClose, onSubmitSuccess }) => {
  const [rate, setRate] = useState(5);
  const [text, setText] = useState("");
  const [mobile, setMobile] = useState("");

  if (!open) return null;

  const submit = () => {
    if (!text.trim()) return;

    const newComment = {
      id: Date.now(),
      name: "کاربر",
      text,
      rate,
      mobile
    };

    onSubmitSuccess(newComment); // ارسال کامنت به صفحه اصلی
  };

  return (
    <div className="fixed inset-0 bg-black/40 z-[999] flex items-center justify-center px-4">
      <div className="bg-white w-full max-w-lg rounded-3xl p-6 relative">

        <button onClick={onClose} className="absolute top-4 left-4 text-xl">×</button>

        <h2 className="text-lg font-bold text-[#2F5D50] mb-4">
          ثبت تجربه و نظر شما
        </h2>

        <div className="flex justify-between my-3">
          {[1,2,3,4,5].map(v => (
            <button
              key={v}
              onClick={() => setRate(v)}
              className={`text-3xl transition ${rate === v ? "scale-110" : "opacity-40"}`}
            >
              {["😔","😑","😊","😃","🤩"][v-1]}
            </button>
          ))}
        </div>

        <textarea
          className="w-full border rounded-xl p-3 mt-4"
          placeholder="نظر خود را بنویسید..."
          value={text}
          onChange={e => setText(e.target.value)}
        />

        <input
          className="w-full border rounded-xl p-3 mt-3"
          placeholder="شماره موبایل"
          value={mobile}
          onChange={e => setMobile(e.target.value)}
        />

        <button
          onClick={submit}
          className="w-full bg-[#2F5D50] hover:bg-[#264C42] text-white py-3 rounded-xl mt-5"
        >
          ثبت نظر
        </button>
      </div>
    </div>
  );
};

export default CommentModal;
