// src/hooks/useVirtualKeyboard.js
import { useState, useEffect, useRef } from 'react';

/**
 * Universal Mobile Virtual Keyboard & Viewport Synchronization Hook
 *
 * Provides real-time synchronization between mobile virtual keyboards (iOS Safari & Android Chrome)
 * and modal/bottom-sheet dialog layouts.
 *
 * @param {Object} [options]
 * @param {number} [options.threshold=80] - Minimum difference in px to consider keyboard open
 * @returns {{
 *   viewportHeight: number,
 *   keyboardHeight: number,
 *   isKeyboardOpen: boolean,
 *   isMobile: boolean,
 *   offsetTop: number
 * }}
 */
export function useVirtualKeyboard({ threshold = 80 } = {}) {
  const [viewportHeight, setViewportHeight] = useState(() =>
    typeof window !== 'undefined'
      ? Math.round(window.visualViewport?.height || window.innerHeight)
      : 800
  );
  const [keyboardHeight, setKeyboardHeight] = useState(0);
  const [isKeyboardOpen, setIsKeyboardOpen] = useState(false);
  const [offsetTop, setOffsetTop] = useState(0);
  const [isMobile, setIsMobile] = useState(() =>
    typeof window !== 'undefined' ? window.innerWidth < 768 : false
  );

  const rafIdRef = useRef(null);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const updateMetrics = () => {
      if (rafIdRef.current) {
        cancelAnimationFrame(rafIdRef.current);
      }

      rafIdRef.current = requestAnimationFrame(() => {
        const mobileCheck = window.innerWidth < 768;
        setIsMobile(mobileCheck);

        if (!window.visualViewport) {
          setViewportHeight(window.innerHeight);
          setKeyboardHeight(0);
          setIsKeyboardOpen(false);
          setOffsetTop(0);
          return;
        }

        const vv = window.visualViewport;
        const currentWindowHeight = window.innerHeight;
        const currentVvHeight = Math.round(vv.height);
        const currentOffsetTop = Math.round(vv.offsetTop || 0);

        // Raw height difference between layout viewport and visual viewport
        const rawDiff = currentWindowHeight - currentVvHeight - currentOffsetTop;
        const detectedKeyboardHeight = Math.max(0, Math.round(rawDiff));
        const isOpen = detectedKeyboardHeight > threshold;

        setViewportHeight(currentVvHeight);
        setKeyboardHeight(isOpen ? detectedKeyboardHeight : 0);
        setIsKeyboardOpen(isOpen);
        setOffsetTop(currentOffsetTop);

        // Sync global CSS variables on document.documentElement for universal modal support
        if (typeof document !== 'undefined' && document.documentElement) {
          document.documentElement.style.setProperty(
            '--visual-viewport-height',
            `${currentVvHeight}px`
          );
          document.documentElement.style.setProperty(
            '--keyboard-height',
            `${isOpen ? detectedKeyboardHeight : 0}px`
          );
        }
      });
    };

    if (window.visualViewport) {
      window.visualViewport.addEventListener('resize', updateMetrics);
      window.visualViewport.addEventListener('scroll', updateMetrics);
    }
    window.addEventListener('resize', updateMetrics);
    window.addEventListener('orientationchange', updateMetrics);

    updateMetrics();

    return () => {
      if (rafIdRef.current) {
        cancelAnimationFrame(rafIdRef.current);
      }
      if (window.visualViewport) {
        window.visualViewport.removeEventListener('resize', updateMetrics);
        window.visualViewport.removeEventListener('scroll', updateMetrics);
      }
      window.removeEventListener('resize', updateMetrics);
      window.removeEventListener('orientationchange', updateMetrics);
    };
  }, [threshold]);

  return {
    viewportHeight,
    keyboardHeight,
    isKeyboardOpen,
    isMobile,
    offsetTop,
  };
}

export default useVirtualKeyboard;
