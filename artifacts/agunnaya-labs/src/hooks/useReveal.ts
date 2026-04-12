import { useEffect } from 'react';

export function useReveal() {
  useEffect(() => {
    const observe = () => {
      const els = document.querySelectorAll('.reveal:not(.visible)');
      if (!els.length) return;
      const io = new IntersectionObserver(
        (entries) => entries.forEach(e => { if (e.isIntersecting) e.target.classList.add('visible'); }),
        { threshold: 0.08 }
      );
      els.forEach(el => io.observe(el));
      return io;
    };

    // Initial run
    let io = observe();

    // Re-run on DOM mutations (for dynamic content)
    const mo = new MutationObserver(() => {
      io?.disconnect();
      io = observe();
    });
    mo.observe(document.body, { childList: true, subtree: true });

    return () => { io?.disconnect(); mo.disconnect(); };
  }, []);
}
