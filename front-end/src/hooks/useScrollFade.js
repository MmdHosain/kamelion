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

    const elements = document.querySelectorAll('.fade-section');
    elements.forEach((el) => fadeObserver.observe(el));

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
      elements.forEach((el) => fadeObserver.unobserve(el));
      fadeObserver.disconnect();
      window.removeEventListener('scroll', handleScroll);
    };
  });
};
