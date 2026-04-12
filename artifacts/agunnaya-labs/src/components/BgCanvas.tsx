import { useEffect, useRef } from 'react';

export default function BgCanvas() {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let W = window.innerWidth, H = window.innerHeight;
    canvas.width = W; canvas.height = H;

    const stars = Array.from({ length: 120 }, () => ({
      x: Math.random() * W, y: Math.random() * H,
      r: Math.random() * 1.2 + 0.2,
      a: Math.random(), da: (Math.random() - 0.5) * 0.003,
    }));

    let raf: number;
    const draw = () => {
      ctx.clearRect(0, 0, W, H);
      stars.forEach(s => {
        s.a = Math.max(0.05, Math.min(1, s.a + s.da));
        if (s.a <= 0.05 || s.a >= 1) s.da *= -1;
        ctx.beginPath();
        ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(200,255,0,${s.a * 0.6})`;
        ctx.fill();
      });
      raf = requestAnimationFrame(draw);
    };
    draw();

    const onResize = () => {
      W = window.innerWidth; H = window.innerHeight;
      canvas.width = W; canvas.height = H;
    };
    window.addEventListener('resize', onResize);
    return () => { cancelAnimationFrame(raf); window.removeEventListener('resize', onResize); };
  }, []);

  return <canvas id="bg-canvas" ref={ref} />;
}
