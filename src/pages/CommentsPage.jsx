import React, { useState, useEffect } from "react";
import { ArrowRight, Heart } from "lucide-react";
import CommentModal from "../components/CommentModal";

const CommentsPage = ({ onBack }) => {
  const [comments, setComments] = useState([]);
  const [openModal, setOpenModal] = useState(false);

  useEffect(() => {
    setComments([
      {
        id: 1,
        name: "مینا رضایی",
        text: "برخورد پزشک عالی بود، توضیحات کامل و دقیق. حس امنیت و آرامش داشتم.",
        rate: 5
      }
    ]);
  }, []);

  const addComment = (newComment) => {
    setComments(prev => [newComment, ...prev]);
    setOpenModal(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#FAFAF8] to-white pb-32 relative">

      {/* Floating Back Button (Video Style) */}
      <button
        onClick={onBack}
        className="fixed top-50 right-5 z-40 w-11 h-11 rounded-full
                   bg-white/80 backdrop-blur shadow-lg
                   flex items-center justify-center
                   hover:scale-105 transition"
      >
        <ArrowRight className="text-[#2F5D50]" />
      </button>

      {/* Title */}
      <div className="pt-24 pb-6 text-center">
        <h1 className="text-2xl font-bold text-[#2F5D50]">
          تجربه و نظرات مراجعین
        </h1>
        <p className="text-sm text-[#6B6E6C] mt-2">
          دیدگاه واقعی مراجعین درباره تجربه درمان
        </p>
      </div>

      {/* Comments */}
      <div className="max-w-xl mx-auto px-4 space-y-6">
        {comments.map(c => (
          <div
            key={c.id}
            className="bg-white rounded-3xl p-5 shadow-sm
                       border border-[#E6C5CC]/30
                       hover:shadow-md transition"
          >
            <div className="flex items-center gap-3 mb-3">
              <div className="w-11 h-11 rounded-full
                              bg-gradient-to-br from-[#E6C5CC] to-[#f2dde3]
                              text-[#2F5D50]
                              flex items-center justify-center font-bold">
                {c.name[0]}
              </div>

              <div className="flex-1">
                <p className="text-sm font-semibold text-[#2F5D50]">
                  {c.name}
                </p>
                <div className="text-sm">
                  {["😔","😑","😊","😃","🤩"][c.rate - 1]}
                </div>
              </div>
            </div>

            <p className="text-sm leading-relaxed text-[#3B3D3B]">
              {c.text}
            </p>

            <button className="mt-4 flex items-center gap-1 text-xs text-[#6B6E6C] hover:text-[#2F5D50] transition">
              <Heart size={14} />
              پسندیدم
            </button>
          </div>
        ))}
      </div>

      {/* Floating Submit Button */}
      <button
        onClick={() => setOpenModal(true)}
        className="fixed bottom-24 right-4 z-40
                   bg-gradient-to-r from-[#2F5D50] to-[#264C42]
                   text-white px-7 py-3 rounded-full
                   shadow-xl hover:shadow-2xl
                   hover:scale-105 transition-all"
      >
        ✍️ ثبت نظر
      </button>

      <CommentModal
        open={openModal}
        onClose={() => setOpenModal(false)}
        onSubmitSuccess={addComment}
      />
    </div>
  );
};

export default CommentsPage;
