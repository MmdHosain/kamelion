// src/hooks/usePageReady.js
import { useState, useEffect } from 'react';

/**
 * Tracks readiness of critical page assets (Persian fonts, SVGs, and above-the-fold images).
 * Below-the-fold lazy-loaded images do not block readiness.
 * Includes a safety fallback timeout so slow/blocked connections never trap the user.
 *
 * @param {number} safetyTimeoutMs - Max time to wait before forcing ready state (default 12000ms for slow 3G)
 * @returns {boolean} isReady
 */
export const usePageReady = (safetyTimeoutMs = 12000) => {
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    let timeoutId;
    let isCancelled = false;

    const checkReadiness = async () => {
      const startTime = Date.now();
      try {
        // 1. Explicitly load and wait for primary Persian fonts with Persian sample text.
        // Passing Persian characters is crucial: otherwise document.fonts.load only checks Latin glyphs
        // and ignores the Arabic/Persian subset on unicode-range fonts!
        if (document.fonts) {
          const samplePersian = 'دکتر نگار معشوری کلینیک تخصصی بیماری‌ها و جراحی پستان';
          const fontTasks = [];

          if (typeof document.fonts.load === 'function') {
            fontTasks.push(document.fonts.load('400 16px "Vazirmatn"', samplePersian));
            fontTasks.push(document.fonts.load('700 16px "Vazirmatn"', samplePersian));
            fontTasks.push(document.fonts.load('400 16px "Vazirmatn Variable"', samplePersian));
            fontTasks.push(document.fonts.load('700 16px "Vazirmatn Variable"', samplePersian));
          }

          if (typeof document.fonts.ready?.then === 'function') {
            fontTasks.push(document.fonts.ready);
          }

          await Promise.all(fontTasks).catch(() => null);

          // Verify that Persian glyphs are officially ready to render
          if (typeof document.fonts.check === 'function') {
            while (
              !document.fonts.check('16px "Vazirmatn"', samplePersian) &&
              !document.fonts.check('16px "Vazirmatn Variable"', samplePersian) &&
              Date.now() - startTime < safetyTimeoutMs
            ) {
              if (isCancelled) return;
              await new Promise((r) => setTimeout(r, 60));
            }
          }
        }

        // 2. Wait only for above-the-fold critical assets (header logo, eager SVGs, hero)
        const criticalImages = Array.from(
          document.querySelectorAll('header img, #hero img, img[loading="eager"]')
        );

        const imagesPromises = criticalImages.map((img) => {
          if (img.complete) return Promise.resolve();
          return new Promise((resolve) => {
            img.addEventListener('load', resolve, { once: true });
            img.addEventListener('error', resolve, { once: true });
          });
        });

        await Promise.all(imagesPromises);
      } catch {
        // Fallback gracefully on any API failure
      } finally {
        if (!isCancelled) {
          setIsReady(true);
        }
      }
    };

    // Safety timeout ensures user is never stuck if network hangs
    timeoutId = setTimeout(() => {
      if (!isCancelled) {
        setIsReady(true);
      }
    }, safetyTimeoutMs);

    checkReadiness();

    return () => {
      isCancelled = true;
      clearTimeout(timeoutId);
    };
  }, [safetyTimeoutMs]);

  return isReady;
};

export default usePageReady;
