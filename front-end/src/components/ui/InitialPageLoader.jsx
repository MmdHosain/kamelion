// src/components/ui/InitialPageLoader.jsx
import React, { useEffect, useState } from 'react';

/**
 * Manages the zero-latency HTML preloader (#initial-loader).
 * Keeps it active and seamless until isReady is true (fonts + critical assets ready),
 * then triggers a smooth fade-out before removing it from the DOM.
 */
const InitialPageLoader = ({ isReady }) => {
  const [shouldRenderFallback, setShouldRenderFallback] = useState(false);

  useEffect(() => {
    const rawPreloader = document.getElementById('initial-loader');
    if (!rawPreloader) {
      setShouldRenderFallback(true);
      return;
    }

    if (isReady) {
      const elapsed = window.__appStart ? performance.now() - window.__appStart : 1000;
      // If assets were cached/ready before the spinner became visible (<260ms), fade out instantly
      const fadeDuration = elapsed < 260 ? 120 : 300;

      rawPreloader.style.transition = `opacity ${fadeDuration}ms ease-out`;
      rawPreloader.style.opacity = '0';
      rawPreloader.style.pointerEvents = 'none';
      const timer = setTimeout(() => {
        if (rawPreloader.parentNode) {
          rawPreloader.remove();
        }
      }, fadeDuration);
      return () => clearTimeout(timer);
    }
  }, [isReady]);

  if (!shouldRenderFallback || isReady) return null;

  return (
    <div
      className="fixed inset-0 z-[999999] bg-[#faf9fb] flex items-center justify-center transition-opacity duration-400 ease-out"
      role="status"
      aria-label="Loading application"
    >
      <div className="w-10 h-10 border-[3px] border-rose-500/20 border-t-rose-500 rounded-full animate-spin" />
    </div>
  );
};

export default InitialPageLoader;
