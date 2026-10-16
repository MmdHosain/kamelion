import { useEffect } from 'react';

export const useScrollFade = () => {
  useEffect(() => {
    const observerOptions = {
      root: null,
      rootMargin: '0px',
      threshold: 0.1,
    };

    const fadeObserver = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
        }
      });
    }, observerOptions);

    // Lazy routes commit after App's effect has run. Observe their sections too.
    const observeSections = (root) => {
      if (root.nodeType !== Node.ELEMENT_NODE) return;
      if (root.matches('.fade-section')) fadeObserver.observe(root);
      root.querySelectorAll('.fade-section').forEach((el) => fadeObserver.observe(el));
    };
    observeSections(document.body);
    const mutationObserver = new MutationObserver((records) => {
      records.forEach((record) => record.addedNodes.forEach(observeSections));
    });
    mutationObserver.observe(document.body, { childList: true, subtree: true });

    const progressBar = document.getElementById('progress');
    const handleScroll = () => {
      const totalHeight = document.documentElement.scrollHeight - window.innerHeight;
      if (totalHeight > 0 && progressBar) {
        const progress = (window.scrollY / totalHeight) * 100;
        progressBar.style.width = `${Math.min(100, Math.max(0, progress))}%`;
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();

    return () => {
      mutationObserver.disconnect();
      fadeObserver.disconnect();
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);
};
