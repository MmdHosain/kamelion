// src/components/admin/ai/AdminAiChatInput.jsx
import React, { useState } from 'react';
import { Send, CornerDownLeft, Loader2 } from 'lucide-react';

export const AdminAiChatInput = ({ onSend, disabled, placeholder }) => {
  const [text, setText] = useState('');

  const handleSubmit = (e) => {
    if (e) e.preventDefault();
    if (!text.trim() || disabled) return;
    onSend(text.trim());
    setText('');
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  return (
    <form onSubmit={handleSubmit} className="mt-4">
      <div className="relative rounded-2xl border border-border/80 bg-white p-2 shadow-sm focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/10 transition-all">
        <textarea
          rows={2}
          value={text}
          disabled={disabled}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder || 'پیام تستی بیمار را بنویسید (Enter برای ارسال)...'}
          className="w-full resize-none border-none bg-transparent p-2 text-xs sm:text-sm text-textDark placeholder:text-mutedText/60 focus:outline-none disabled:opacity-50"
        />

        <div className="flex items-center justify-between pt-2 border-t border-border/40 px-2">
          <div className="text-[11px] text-mutedText flex items-center gap-1">
            <CornerDownLeft className="w-3 h-3" />
            <span>Shift + Enter برای سطر جدید</span>
          </div>

          <button
            type="submit"
            disabled={!text.trim() || disabled}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-primary hover:bg-primary-dark text-white text-xs font-bold transition-all shadow-md shadow-primary/20 disabled:opacity-40 disabled:cursor-not-allowed active:scale-95"
          >
            {disabled ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                <span>در حال ارسال...</span>
              </>
            ) : (
              <>
                <Send className="w-3.5 h-3.5 -scale-x-100" />
                <span>ارسال تست</span>
              </>
            )}
          </button>
        </div>
      </div>
    </form>
  );
};

export default AdminAiChatInput;
