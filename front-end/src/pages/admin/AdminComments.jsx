import React from 'react';
import { MessageSquare, Star, Trash2, CheckCircle2, XCircle } from 'lucide-react';
import { useCommentsStore } from '../../store/commentsStore';

const AdminComments = () => {
  const { comments, deleteComment, toggleApprove } = useCommentsStore();

  return (
    <div className="space-y-6">
      <div className="border-b border-primary/20 pb-4 flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-black text-primary flex items-center gap-2.5">
            <MessageSquare className="w-7 h-7" />
            مدیریت نظرات و دیدگاه‌های مراجعین
          </h1>
          <p className="text-sm text-textDark/70 mt-1 font-medium">
            مشاهده، تایید و انتشار، یا حذف نظرات ثبت‌شده در سایت.
          </p>
        </div>
        <div className="bg-primary/10 border border-primary/25 px-4 py-2 rounded-2xl text-primary font-bold text-sm">
          تعداد کل: {comments.length} نظر
        </div>
      </div>

      {comments.length === 0 ? (
        <div className="text-center py-16 text-textDark/50 text-sm">
          هیچ دیدگاهی تاکنون ثبت نشده است.
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {comments.map((comment) => (
            <div
              key={comment.id}
              className={`p-5 rounded-3xl border transition-all flex flex-col md:flex-row justify-between items-start md:items-center gap-4 ${
                comment.approved !== false
                  ? 'bg-white/80 border-primary/20 shadow-sm'
                  : 'bg-red-50/40 border-red-200 opacity-75'
              }`}
            >
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-9 h-9 rounded-full bg-gradient-to-br from-primary to-primary-dark text-white font-bold flex items-center justify-center text-sm shadow-sm">
                    {comment.avatar}
                  </div>
                  <div>
                    <h3 className="font-bold text-textDark text-sm">{comment.name}</h3>
                    <div className="flex items-center gap-2 text-xs text-textDark/50">
                      <span>{comment.date}</span>
                      {comment.email && <span>• {comment.email}</span>}
                    </div>
                  </div>
                  <div className="flex items-center text-amber-500 mr-2">
                    {[...Array(comment.rating || 5)].map((_, i) => (
                      <Star key={i} className="w-3.5 h-3.5 fill-current" />
                    ))}
                  </div>
                </div>

                <p className="text-sm text-textDark/85 leading-relaxed pr-12 font-medium">
                  {comment.text}
                </p>
              </div>

              <div className="flex items-center gap-2 shrink-0 self-end md:self-center">
                <button
                  onClick={() => toggleApprove(comment.id)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all ${
                    comment.approved !== false
                      ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200'
                      : 'bg-amber-100 text-amber-800 hover:bg-amber-200'
                  }`}
                >
                  {comment.approved !== false ? (
                    <>
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                      منتشر شده
                    </>
                  ) : (
                    <>
                      <XCircle className="w-4 h-4 text-amber-600" />
                      عدم انتشار
                    </>
                  )}
                </button>

                <button
                  onClick={() => {
                    if (window.confirm('آیا از حذف این دیدگاه اطمینان دارید؟')) {
                      deleteComment(comment.id);
                    }
                  }}
                  className="p-2 rounded-xl text-red-500 hover:bg-red-50 hover:text-red-700 transition-colors"
                  title="حذف نظر"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AdminComments;
