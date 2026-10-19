// src/components/ui/RouteLoadingFallback.jsx
import React from 'react';
import { Loader2 } from 'lucide-react';

const RouteLoadingFallback = () => {
  return (
    <div
      className="min-h-[50vh] flex items-center justify-center p-8 animate-fadeIn"
      role="status"
      aria-label="Loading"
    >
      <div className="w-11 h-11 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center shadow-sm">
        <Loader2 className="w-5 h-5 text-primary animate-spin" />
      </div>
    </div>
  );
};

export default RouteLoadingFallback;
