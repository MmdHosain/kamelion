// src/components/admin/ai/AdminAiHeader.jsx
import React, { useState } from 'react';
import { Bot, RotateCcw, Copy, Check, Sparkles } from 'lucide-react';
import { toPersianDigits } from '../../../utils/jalaliDateUtils';

export const AdminAiHeader = ({
  sessionId,
  onOpenResetModal,
  historyCount = 0,
}) => {
  const [copied, setCopied] = useState(false);

  const handleCopySessionId = async () => {
    try {
      await navigator.clipboard.writeText(sessionId);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback
    }
  };

  return (
    <div className="bg-white rounded-3xl border border-border/70 p-5 shadow-sm mb-5">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        {/* Title and Badge */}
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-primary to-primary-light text-white flex items-center justify-center shadow-md shadow-primary/20 shrink-0">
            <Bot className="w-6 h-6 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg md:text-xl font-black text-textDark">
                آزمایشگاه و تست زنده هوش مصنوعی
              </h1>
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-primary/10 text-primary border border-primary/20">
                <Sparkles className="w-3 h-3" />
                تست تریاژ بالینی
              </span>
            </div>
            <p className="text-xs text-mutedText mt-1">
              محیط ایزوله جهت ارزیابی درک بالینی، سطوح ۵‌گانه تریاژ، پاسخ‌های فال‌بک و پایش حافظه مکالمه.
            </p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex flex-wrap items-center gap-2.5 w-full md:w-auto justify-end">
          {/* Session ID Pill */}
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-surface border border-border/60 text-xs font-mono text-textDark/80">
            <span className="text-mutedText font-sans text-[11px]">نشست:</span>
            <span className="truncate max-w-[130px] sm:max-w-[180px] font-semibold">
              {sessionId}
            </span>
            <button
              onClick={handleCopySessionId}
              title="کپی شناسه نشست"
              className="p-1 rounded-lg hover:bg-white text-mutedText hover:text-textDark transition-colors"
            >
              {copied ? (
                <Check className="w-3.5 h-3.5 text-emerald-500" />
              ) : (
                <Copy className="w-3.5 h-3.5" />
              )}
            </button>
          </div>

          {/* Messages in memory counter */}
          <div className="px-3 py-1.5 rounded-xl bg-surface border border-border/60 text-xs text-textDark/80 font-medium">
            حافظه فعال:{' '}
            <span className="font-bold text-primary">
              {toPersianDigits(historyCount)} پیام
            </span>
          </div>

          {/* Reset Memory Button */}
          <button
            onClick={onOpenResetModal}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-red-500/10 hover:bg-red-500 text-red-600 hover:text-white border border-red-500/20 text-xs font-bold transition-all shadow-sm active:scale-95"
            title="ریست حافظه گفتگو و شروع نشست جدید"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>ریست حافظه</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default AdminAiHeader;
