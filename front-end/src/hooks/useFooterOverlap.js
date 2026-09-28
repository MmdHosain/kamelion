// src/hooks/useFooterOverlap.js
import { useState, useEffect } from 'react';

/**
 * Hook to detect when approaching or reaching the footer and compute dynamic offset
 * so floating action elements morph in advance and stay cleanly lifted above the footer.
 *
 * @param {string} footerId - The DOM ID of the footer element (default: 'site-footer')
 * @param {number} margin - Gap in pixels to keep above the footer (default: 24)
 * @param {number} triggerDistance - Distance in pixels before the footer enters where morphing should begin (default: 150)
 * @returns {{ isFooterVisible: boolean, bottomOffset: number }}
 */
export function useFooterOverlap(footerId = 'site-footer', margin = 24, triggerDistance = 150) {
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

      // Distance from footer's top edge to the bottom edge of the viewport
      const distanceToViewportBottom = rect.top - windowHeight;
      // Overlap: how many pixels of footer are inside the viewport
      const overlap = windowHeight - rect.top;

      // Trigger transformation when footer is within triggerDistance of entering viewport
      const shouldTrigger = distanceToViewportBottom <= triggerDistance;

      if (shouldTrigger) {
        // When footer is visible (overlap > 0), lift by overlap + margin
        // When footer is just approaching (overlap <= 0), keep at comfortable base margin
        const dynamicBottom = Math.max(margin, Math.round(overlap + margin));

        setFooterState({
          isFooterVisible: true,
          bottomOffset: dynamicBottom,
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
  }, [footerId, margin, triggerDistance]);

  return footerState;
}

export default useFooterOverlap;
