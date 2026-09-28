import React, { useState, useEffect } from "react";
import useBodyScrollLock from "../hooks/useBodyScrollLock";

const CommentModal = ({ open, onClose, onSubmitSuccess }) => {
  const [rate, setRate] = useState(5);
  const [text, setText] = useState("");
  const [mobile, setMobile] = useState("");

  useBodyScrollLock(open);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && open) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [open, onClose]);

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

    onSubmitSuccess(newComment);
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="ثبت نظر"
      className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[999] flex items-end sm:items-center justify-center px-4"
    >
      <div
        className="bg-white w-full max-w-lg rounded-t-3xl sm:rounded-3xl p-6 relative animate-slideUp shadow-2xl"
        style={{ overscrollBehavior: 'contain' }}
      >

        <div className="w-12 h-1 bg-secondary rounded-full mx-auto mb-4 sm:hidden" />

        <button
          onClick={onClose}
          className="absolute top-4 left-4 text-xl text-mutedText"
        >
          ×
        </button>

        <h2 className="text-lg font-bold text-primary mb-2">
          ثبت تجربه شما
        </h2>
        <p className="text-xs text-mutedText mb-4">
          نظر شما به بهبود کیفیت خدمات کمک می‌کند
        </p>

        <div className="flex justify-between my-4">
          {[1,2,3,4,5].map(v => (
            <button
              key={v}
              onClick={() => setRate(v)}
              className={`text-3xl transition
                ${rate === v ? "scale-110" : "opacity-30"}`}
            >
              {["😔","😑","😊","😃","🤩"][v - 1]}
            </button>
          ))}
        </div>

        <textarea
          className="w-full border border-secondary/40 rounded-2xl p-3 mt-2
                     focus:outline-none focus:ring-1 focus:ring-primary/40"
          placeholder="تجربه خود را صادقانه بنویسید..."
          value={text}
          onChange={e => setText(e.target.value)}
        />

        <input
          className="w-full border border-secondary/40 rounded-2xl p-3 mt-3
                     focus:outline-none focus:ring-1 focus:ring-primary/40"
          placeholder="شماره موبایل (اختیاری)"
          value={mobile}
          onChange={e => setMobile(e.target.value)}
        />

        <button
          onClick={submit}
          className="w-full mt-5 py-3 rounded-2xl
                     bg-gradient-to-r from-primary to-primaryLight
                     text-white font-medium
                     hover:scale-[1.02] transition"
        >
          ثبت نظر ✨
        </button>
      </div>
    </div>
  );
};

export default CommentModal;
