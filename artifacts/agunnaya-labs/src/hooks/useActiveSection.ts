import { useState, useEffect } from 'react';

const SECTIONS = ['hero','ai','arena','leaderboard','gallery','audits','pro','saas','waitlist'];

export function useActiveSection() {
  const [active, setActive] = useState('hero');

  useEffect(() => {
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach(e => { if (e.isIntersecting) setActive(e.target.id || 'hero'); });
      },
      { rootMargin: '-40% 0px -55% 0px' }
    );
    SECTIONS.forEach(id => {
      const el = document.getElementById(id);
      if (el) io.observe(el);
    });
    return () => io.disconnect();
  }, []);

  return active;
}
