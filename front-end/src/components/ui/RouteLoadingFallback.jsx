// src/components/ui/RouteLoadingFallback.jsx
import React from 'react';
import { Loader2 } from 'lucide-react';

const RouteLoadingFallback = () => {
  return (
    <div
      className="min-h-[50vh] flex flex-col items-center justify-center gap-3 p-8 animate-fadeIn"
      role="status"
      aria-live="polite"
    >
      <div className="w-12 h-12 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center shadow-sm">
        <Loader2 className="w-6 h-6 text-primary animate-spin" />
      </div>
      <p className="text-sm font-medium text-textDark/60">در حال بارگذاری صفحه...</p>
    </div>
  );
};

export default RouteLoadingFallback;
