import { useEffect, useRef } from 'react';

export default function CustomCursor() {
  const dotRef = useRef<HTMLDivElement>(null);
  const ringRef = useRef<HTMLDivElement>(null);
  const ring = { x: 0, y: 0 };
  const mouse = { x: 0, y: 0 };
  let raf: number;

  useEffect(() => {
    const onMove = (e: MouseEvent) => {
      mouse.x = e.clientX; mouse.y = e.clientY;
      if (dotRef.current) {
        dotRef.current.style.left = e.clientX + 'px';
        dotRef.current.style.top = e.clientY + 'px';
      }
    };

    const animate = () => {
      ring.x += (mouse.x - ring.x) * 0.12;
      ring.y += (mouse.y - ring.y) * 0.12;
      if (ringRef.current) {
        ringRef.current.style.left = ring.x + 'px';
        ringRef.current.style.top = ring.y + 'px';
      }
      raf = requestAnimationFrame(animate);
    };

    const onEnter = () => document.body.classList.add('hovering');
    const onLeave = () => document.body.classList.remove('hovering');

    document.addEventListener('mousemove', onMove);
    document.querySelectorAll('a,button').forEach(el => {
      el.addEventListener('mouseenter', onEnter);
      el.addEventListener('mouseleave', onLeave);
    });
    animate();

    return () => {
      document.removeEventListener('mousemove', onMove);
      cancelAnimationFrame(raf);
    };
  }, []);

  return (
    <>
      <div ref={dotRef} className="cursor-dot" />
      <div ref={ringRef} className="cursor-ring" />
    </>
  );
}
