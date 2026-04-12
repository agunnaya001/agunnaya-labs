import { useEffect, useState, useRef } from 'react';
import { ethers } from 'ethers';
import { ERC20_ABI, AGL_TOKEN } from '../config';
import { useProvider } from '../context/ProviderContext';

function useCountUp(target: number, active: boolean, duration = 1400) {
  const [count, setCount] = useState(0);
  const startRef = useRef<number | null>(null);
  const rafRef = useRef<number>(0);

  useEffect(() => {
    if (!target || !active) return;
    startRef.current = null;
    cancelAnimationFrame(rafRef.current);
    const step = (ts: number) => {
      if (!startRef.current) startRef.current = ts;
      const progress = Math.min((ts - startRef.current) / duration, 1);
      const ease = 1 - Math.pow(1 - progress, 3);
      setCount(Math.floor(ease * target));
      if (progress < 1) rafRef.current = requestAnimationFrame(step);
    };
    rafRef.current = requestAnimationFrame(step);
    return () => cancelAnimationFrame(rafRef.current);
  }, [target, active, duration]);

  return count;
}

export default function HeroSection() {
  const provider = useProvider();
  const [gas, setGas] = useState('—');
  const [supplyRaw, setSupplyRaw] = useState(0);
  const [starsRaw, setStarsRaw] = useState(0);
  const [visible, setVisible] = useState(false);
  const heroRef = useRef<HTMLDivElement>(null);

  const supplyCount = useCountUp(supplyRaw, visible, 1600);
  const starsCount = useCountUp(starsRaw, visible, 1000);

  useEffect(() => {
    const io = new IntersectionObserver(([e]) => { if (e.isIntersecting) setVisible(true); }, { threshold: 0.1 });
    if (heroRef.current) io.observe(heroRef.current);
    return () => io.disconnect();
  }, []);

  useEffect(() => {
    if (!provider) return;

    const fetchGas = async () => {
      try {
        const fee = await provider.getFeeData();
        const gwei = parseFloat(ethers.formatUnits(fee.gasPrice ?? 0n, 'gwei'));
        setGas(gwei < 0.0001 ? '< 0.001 gwei' : gwei.toFixed(4) + ' gwei');
      } catch {}
    };
    fetchGas();
    const gasTimer = setInterval(fetchGas, 12000);

    const fetchSupply = async () => {
      try {
        const token = new ethers.Contract(AGL_TOKEN, ERC20_ABI, provider);
        const s = await token.totalSupply();
        setSupplyRaw(parseFloat(ethers.formatEther(s)));
      } catch {}
    };
    fetchSupply();

    const fetchStars = async () => {
      try {
        const r = await fetch('https://api.github.com/repos/Agunnaya-Labs/agunnaya-labs.github.io');
        const d = await r.json();
        setStarsRaw(d.stargazers_count ?? 0);
      } catch {}
    };
    fetchStars();

    return () => clearInterval(gasTimer);
  }, [provider]);

  const scrollTo = (id: string) => document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });

  const supplyLabel = supplyRaw >= 1e9
    ? (supplyCount / 1e9).toFixed(2) + 'B'
    : supplyCount > 0 ? supplyCount.toLocaleString() : '···';

  const starsLabel = starsRaw > 0 ? starsCount.toString() : '···';

  return (
    <div id="hero" className="hero z" ref={heroRef}>
      <div className="hero-eyebrow">
        <span className="eyebrow-line" />
        Base Mainnet · Chain ID 8453
        <div className="gas-pill">
          <div className="gas-dot" />
          <span>{gas}</span>
        </div>
      </div>

      <h1 className="hero-h1">
        AI + WEB3<br />
        <em>AUTONOMOUS</em>
        <span className="line2">ECOSYSTEM</span>
      </h1>

      <p className="hero-body">
        Full-stack Web3 platform combining AI-powered smart contract security, on-chain blockchain gaming, and SaaS infrastructure — all live on Base mainnet.
      </p>

      <div className="hero-actions">
        <button className="btn btn-acid btn-xl" onClick={() => scrollTo('leaderboard')}>View Leaderboard →</button>
        <a href="https://github.com/apps/smart-contract-auditor-bot" target="_blank" rel="noopener noreferrer">
          <button className="btn btn-outline btn-xl">Install Auditor Bot</button>
        </a>
      </div>

      <div className="hero-stats">
        <div className="stat">
          <div className="stat-n">{supplyLabel}</div>
          <div className="stat-l">AGL Supply</div>
        </div>
        <div className="stat">
          <div className="stat-n">4</div>
          <div className="stat-l">Live Contracts</div>
        </div>
        <div className="stat">
          <div className="stat-n">Base</div>
          <div className="stat-l">Network</div>
        </div>
        <div className="stat">
          <div className="stat-n">{starsLabel}</div>
          <div className="stat-l">GitHub Stars</div>
        </div>
      </div>

      <div className="hero-scroll"><span className="scroll-bar" />SCROLL</div>
    </div>
  );
}
