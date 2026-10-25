// src/hooks/useVirtualKeyboard.js
import { useState, useEffect, useRef, useCallback } from 'react';

/**
 * Headless Viewport CSS Synchronizer Hook
 *
 * Sets and continuously updates `--visual-viewport-height` and `--keyboard-height`
 * directly on `document.documentElement` at 60/120fps via requestAnimationFrame
 * WITHOUT triggering ANY React component re-renders.
 *
 * Ideal for root invocation (e.g. in App.jsx) to eliminate re-render storms.
 */
export function useViewportCssSync() {
  useEffect(() => {
    if (typeof window === 'undefined' || typeof document === 'undefined') return;

    let rafId = null;
    let maxBaseHeight = Math.max(
      window.innerHeight || 0,
      Math.round(window.visualViewport?.height || 0)
    );

    const syncCssVars = () => {
      if (rafId) cancelAnimationFrame(rafId);

      rafId = requestAnimationFrame(() => {
        const vv = window.visualViewport;
        const currentInnerHeight = window.innerHeight;
        const currentVvHeight = vv ? Math.round(vv.height) : currentInnerHeight;
        const currentOffsetTop = vv ? Math.round(vv.offsetTop || 0) : 0;

        // If orientation or window resized without keyboard, adapt maxBaseHeight
        if (currentInnerHeight > maxBaseHeight) {
          maxBaseHeight = currentInnerHeight;
        }

        // Cross-platform keyboard height detection:
        // iOS: innerHeight stays large, vv.height shrinks
        // Android with interactive-widget=resizes-content: innerHeight shrinks with vv.height
        const heightDiffIos = currentInnerHeight - currentVvHeight - currentOffsetTop;
        const heightDiffAndroid = maxBaseHeight - currentVvHeight;
        const rawDiff = Math.max(heightDiffIos, heightDiffAndroid, 0);

        const isKb = rawDiff > 80;
        const detectedKbHeight = isKb ? rawDiff : 0;

        const docStyle = document.documentElement.style;
        docStyle.setProperty('--visual-viewport-height', `${currentVvHeight}px`);
        docStyle.setProperty('--keyboard-height', `${detectedKbHeight}px`);
      });
    };

    const handleOrientationChange = () => {
      // Reset base height calculation on rotation
      setTimeout(() => {
        maxBaseHeight = Math.max(
          window.innerHeight || 0,
          Math.round(window.visualViewport?.height || 0)
        );
        syncCssVars();
      }, 100);
    };

    if (window.visualViewport) {
      window.visualViewport.addEventListener('resize', syncCssVars, { passive: true });
      window.visualViewport.addEventListener('scroll', syncCssVars, { passive: true });
    }
    window.addEventListener('resize', syncCssVars, { passive: true });
    window.addEventListener('orientationchange', handleOrientationChange, { passive: true });

    syncCssVars();

    return () => {
      if (rafId) cancelAnimationFrame(rafId);
      if (window.visualViewport) {
        window.visualViewport.removeEventListener('resize', syncCssVars);
        window.visualViewport.removeEventListener('scroll', syncCssVars);
      }
      window.removeEventListener('resize', syncCssVars);
      window.removeEventListener('orientationchange', handleOrientationChange);
    };
  }, []);
}

/**
 * Universal Mobile Virtual Keyboard & Viewport Tracking Hook
 *
 * Provides real-time synchronization between mobile virtual keyboards (iOS Safari & Android Chrome)
 * and modal/bottom-sheet dialog layouts.
 *
 * Optimized to prevent 60fps re-render storms:
 * Boolean state changes (`isKeyboardOpen`, `isMobile`) are only committed when their values
 * actually transition, leaving continuous frame animations to hardware-accelerated CSS variables.
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
  const maxBaseHeightRef = useRef(
    typeof window !== 'undefined'
      ? Math.max(window.innerHeight || 0, Math.round(window.visualViewport?.height || 0))
      : 800
  );
  const isKeyboardOpenRef = useRef(false);
  const isMobileRef = useRef(isMobile);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const updateMetrics = () => {
      if (rafIdRef.current) {
        cancelAnimationFrame(rafIdRef.current);
      }

      rafIdRef.current = requestAnimationFrame(() => {
        const mobileCheck = window.innerWidth < 768;
        if (mobileCheck !== isMobileRef.current) {
          isMobileRef.current = mobileCheck;
          setIsMobile(mobileCheck);
        }

        if (!window.visualViewport) {
          setViewportHeight(window.innerHeight);
          setKeyboardHeight(0);
          if (isKeyboardOpenRef.current) {
            isKeyboardOpenRef.current = false;
            setIsKeyboardOpen(false);
          }
          setOffsetTop(0);
          return;
        }

        const vv = window.visualViewport;
        const currentWindowHeight = window.innerHeight;
        const currentVvHeight = Math.round(vv.height);
        const currentOffsetTop = Math.round(vv.offsetTop || 0);

        if (currentWindowHeight > maxBaseHeightRef.current) {
          maxBaseHeightRef.current = currentWindowHeight;
        }

        // Dual platform diff computation
        const heightDiffIos = currentWindowHeight - currentVvHeight - currentOffsetTop;
        const heightDiffAndroid = maxBaseHeightRef.current - currentVvHeight;
        const rawDiff = Math.max(heightDiffIos, heightDiffAndroid, 0);

        const isOpen = rawDiff > threshold;
        const detectedKeyboardHeight = isOpen ? rawDiff : 0;

        // Keep root CSS variables fresh
        if (typeof document !== 'undefined' && document.documentElement) {
          document.documentElement.style.setProperty(
            '--visual-viewport-height',
            `${currentVvHeight}px`
          );
          document.documentElement.style.setProperty(
            '--keyboard-height',
            `${detectedKeyboardHeight}px`
          );
        }

        // Only trigger React state updates when state values meaningfully differ
        setViewportHeight((prev) => (Math.abs(prev - currentVvHeight) > 2 ? currentVvHeight : prev));
        setKeyboardHeight((prev) => (Math.abs(prev - detectedKeyboardHeight) > 2 ? detectedKeyboardHeight : prev));
        setOffsetTop((prev) => (Math.abs(prev - currentOffsetTop) > 2 ? currentOffsetTop : prev));

        if (isOpen !== isKeyboardOpenRef.current) {
          isKeyboardOpenRef.current = isOpen;
          setIsKeyboardOpen(isOpen);
        }
      });
    };

    const handleOrientationChange = () => {
      setTimeout(() => {
        maxBaseHeightRef.current = Math.max(
          window.innerHeight || 0,
          Math.round(window.visualViewport?.height || 0)
        );
        updateMetrics();
      }, 100);
    };

    if (window.visualViewport) {
      window.visualViewport.addEventListener('resize', updateMetrics, { passive: true });
      window.visualViewport.addEventListener('scroll', updateMetrics, { passive: true });
    }
    window.addEventListener('resize', updateMetrics, { passive: true });
    window.addEventListener('orientationchange', handleOrientationChange, { passive: true });

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
      window.removeEventListener('orientationchange', handleOrientationChange);
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
