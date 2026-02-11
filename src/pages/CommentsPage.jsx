import React, { useState, useEffect } from "react";
import { ArrowLeft, Heart } from "lucide-react";
import CommentModal from "../components/CommentModal";

const CommentsPage = ({ onBack }) => {
  const [comments, setComments] = useState([]);
  const [openModal, setOpenModal] = useState(false);

  // Load initial comments (mock fallback)
  useEffect(() => {
    const mock = [
      {
        id: 1,
        name: "مینا رضایی",
        text: "برخورد پزشک عالی بود، توضیحات کامل و دقیق.",
        rate: 5
      }
    ];

    setComments(mock);
  }, []);

  const addComment = (newComment) => {
    setComments(prev => [newComment, ...prev]);
    setOpenModal(false);
  };

  return (
    <div className="min-h-screen bg-[#FAFAF8] pb-24">
      
      <header className="sticky top-0 bg-white/80 backdrop-blur border-b border-[#E6C5CC]/30 px-4 py-3 flex items-center gap-3 z-20">
        <button onClick={onBack}>
          <ArrowLeft className="text-[#2F5D50]" />
        </button>
        <h2 className="font-bold text-[#2F5D50]">نظرات کاربران</h2>
      </header>

      <div className="max-w-xl mx-auto px-4 py-6 space-y-6">
        {comments.map(c => (
          <div key={c.id} className="bg-white rounded-2xl p-4 shadow-sm border border-[#E6C5CC]/30">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-full bg-[#E6C5CC]/40 text-[#2F5D50] flex items-center justify-center font-bold">
                {c.name[0]}
              </div>
              <div>
                <p className="text-sm font-semibold text-[#2F5D50]">{c.name}</p>
                <p className="text-xs">{["😔","😑","😊","😃","🤩"][c.rate-1]}</p>
              </div>
            </div>
            <p className="text-sm leading-relaxed">{c.text}</p>

            <button className="mt-3 flex items-center gap-1 text-xs text-[#6B6E6C]">
              <Heart size={14}/>
              پسند
            </button>
          </div>
        ))}
      </div>

      <button
        onClick={() => setOpenModal(true)}
        className="fixed bottom-24 right-4 bg-[#2F5D50] hover:bg-[#264C42] text-white px-6 py-3 rounded-full shadow-xl transition z-30"
      >
        ثبت نظر
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
