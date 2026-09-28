// src/hooks/useFooterOverlap.js
import { useState, useEffect } from 'react';

/**
 * Hook to detect when the footer enters the viewport and compute dynamic offset
 * so floating action elements never overlap the footer and stay lifted above it.
 *
 * @param {string} footerId - The DOM ID of the footer element (default: 'site-footer')
 * @param {number} margin - Gap in pixels to keep above the footer (default: 24)
 * @returns {{ isFooterVisible: boolean, bottomOffset: number }}
 */
export function useFooterOverlap(footerId = 'site-footer', margin = 24) {
  const [footerState, setFooterState] = useState({
    isFooterVisible: false,
    bottomOffset: margin,
  });

  useEffect(() => {
    let ticking = false;

    const checkOverlap = () => {
      const footer = document.getElementById(footerId);
      if (!footer) {
        setFooterState((prev) =>
          prev.isFooterVisible ? { isFooterVisible: false, bottomOffset: margin } : prev
        );
        return;
      }

      const rect = footer.getBoundingClientRect();
      const windowHeight = window.innerHeight || document.documentElement.clientHeight;

      // Overlap: amount of footer pixels currently visible in the viewport
      const overlap = windowHeight - rect.top;

      if (overlap > 10) {
        setFooterState({
          isFooterVisible: true,
          bottomOffset: Math.round(overlap + margin),
        });
      } else {
        setFooterState({
          isFooterVisible: false,
          bottomOffset: margin,
        });
      }

      ticking = false;
    };

    const handleScrollOrResize = () => {
      if (!ticking) {
        window.requestAnimationFrame(checkOverlap);
        ticking = true;
      }
    };

    window.addEventListener('scroll', handleScrollOrResize, { passive: true });
    window.addEventListener('resize', handleScrollOrResize, { passive: true });
    checkOverlap();

    return () => {
      window.removeEventListener('scroll', handleScrollOrResize);
      window.removeEventListener('resize', handleScrollOrResize);
    };
  }, [footerId, margin]);

  return footerState;
}

export default useFooterOverlap;
