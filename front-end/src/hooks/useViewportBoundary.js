// front-end/src/hooks/useViewportBoundary.js
import { useLayoutEffect, useEffect } from 'react';

const useIsomorphicLayoutEffect = typeof window !== 'undefined' ? useLayoutEffect : useEffect;

/**
 * Custom Hook: useViewportBoundary
 * Prevents dropdowns, popovers, and floating menus from overflowing
 * or sticking out of the viewport boundaries (left, right, bottom).
 * 
 * @param {boolean} isOpen - Whether the floating element is currently open
 * @param {React.RefObject} popoverRef - Ref attached to the floating popover DOM node
 * @param {object} options - Configuration options
 * @param {number} [options.padding=12] - Minimum distance in px from viewport edges
 */
export function useViewportBoundary(isOpen, popoverRef, { padding = 12 } = {}) {
  useIsomorphicLayoutEffect(() => {
    if (!isOpen || !popoverRef.current) return;

    const adjustPosition = () => {
      const node = popoverRef.current;
      if (!node) return;

      // Reset any existing boundary translation first to measure natural position
      node.style.transform = '';

      const rect = node.getBoundingClientRect();
      const viewportWidth = window.innerWidth;
      let shiftX = 0;

      // Check overflow on the right edge
      if (rect.right > viewportWidth - padding) {
        shiftX = (viewportWidth - padding) - rect.right;
      }
      // Check overflow on the left edge
      else if (rect.left < padding) {
        shiftX = padding - rect.left;
      }

      if (shiftX !== 0) {
        // Apply adjustment without overriding vertical animations
        node.style.transform = `translateX(${shiftX}px)`;
      }
    };

    // Run immediately upon open
    const frameId = requestAnimationFrame(adjustPosition);

    window.addEventListener('resize', adjustPosition, { passive: true });
    window.addEventListener('scroll', adjustPosition, { passive: true, capture: true });

    return () => {
      cancelAnimationFrame(frameId);
      window.removeEventListener('resize', adjustPosition);
      window.removeEventListener('scroll', adjustPosition, { capture: true });
      if (popoverRef.current) {
        popoverRef.current.style.transform = '';
      }
    };
  }, [isOpen, popoverRef, padding]);
}

export default useViewportBoundary;
