// src/hooks/useBodyScrollLock.js
import { useEffect } from 'react';

/**
 * Universal iOS-Safe Body Scroll Lock Hook
 * 
 * - Handles nested modals with an active lock counter.
 * - Saves and restores exact window scroll position without jumping.
 * - Prevents layout shifts on desktop by compensating for scrollbar width.
 * - 100% blocks background touch scrolling on mobile (iOS Safari & Android).
 *
 * @param {boolean} isLocked - Whether the current modal/drawer is open
 */

let lockCount = 0;
let savedScrollY = 0;

export function useBodyScrollLock(isLocked = false) {
  useEffect(() => {
    if (!isLocked) return;

    if (lockCount === 0) {
      savedScrollY = window.scrollY || window.pageYOffset || document.documentElement.scrollTop || 0;
      
      // Calculate scrollbar width on desktop to prevent layout shift
      const scrollBarWidth = window.innerWidth - document.documentElement.clientWidth;

      document.body.style.position = 'fixed';
      document.body.style.top = `-${savedScrollY}px`;
      document.body.style.left = '0';
      document.body.style.right = '0';
      document.body.style.width = '100%';
      document.body.style.overflow = 'hidden';

      if (scrollBarWidth > 0) {
        document.body.style.paddingRight = `${scrollBarWidth}px`;
      }
    }

    lockCount++;

    return () => {
      lockCount--;
      if (lockCount <= 0) {
        lockCount = 0;

        const currentTop = document.body.style.top;
        const targetScrollY = currentTop ? Math.abs(parseInt(currentTop, 10)) : savedScrollY;

        document.body.style.position = '';
        document.body.style.top = '';
        document.body.style.left = '';
        document.body.style.right = '';
        document.body.style.width = '';
        document.body.style.overflow = '';
        document.body.style.paddingRight = '';

        window.scrollTo(0, targetScrollY);
      }
    };
  }, [isLocked]);
}

export default useBodyScrollLock;
