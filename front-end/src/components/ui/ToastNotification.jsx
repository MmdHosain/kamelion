import React from 'react';
import { createPortal } from 'react-dom';
import { CheckCircle2, AlertCircle, X } from 'lucide-react';

/**
 * ToastNotification Component
 * Displays a floating responsive feedback notification (portal to document.body).
 * Automatically handles mobile viewport constraints (safe inset-x padding)
 * without transform-collision issues.
 */
const ToastNotification = ({ toast, onClose }) => {
  if (!toast) return null;

  return createPortal(
    <div className="fixed top-4 inset-x-4 sm:inset-x-auto sm:top-6 sm:left-1/2 sm:-translate-x-1/2 z-[1000] sm:max-w-lg pointer-events-none flex justify-center">
      <div
        className={`w-full sm:w-auto p-4 sm:px-5 sm:py-3.5 rounded-2xl shadow-2xl backdrop-blur-xl border flex items-center gap-3.5 text-xs sm:text-sm font-medium animate-scaleUp pointer-events-auto ${
          toast.type === 'success'
            ? 'bg-slate-900/95 border-emerald-500/50 text-emerald-300 shadow-[0_10px_35px_-5px_rgba(16,185,129,0.35)]'
            : 'bg-slate-900/95 border-rose-500/50 text-rose-300 shadow-[0_10px_35px_-5px_rgba(244,63,94,0.35)]'
        }`}
      >
        {toast.type === 'success' ? (
          <div className="w-7 h-7 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
            <CheckCircle2 className="w-4 h-4" />
          </div>
        ) : (
          <div className="w-7 h-7 rounded-full bg-rose-500/20 text-rose-400 flex items-center justify-center shrink-0">
            <AlertCircle className="w-4 h-4" />
          </div>
        )}
        <div className="flex-1 leading-relaxed text-white font-medium">
          {toast.message}
        </div>
        <button
          type="button"
          onClick={onClose}
          className="text-white/50 hover:text-white p-1 transition-colors cursor-pointer mr-1 shrink-0"
          aria-label="بستن"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>,
    document.body
  );
};

export default ToastNotification;
