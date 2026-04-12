import { useEffect, useState } from 'react';
import { ethers } from 'ethers';
import { BASE_RPC, ERC20_ABI, AGL_TOKEN } from '../config';

export default function HeroSection() {
  const [gas, setGas] = useState('—');
  const [supply, setSupply] = useState('···');
  const [stars, setStars] = useState('···');

  useEffect(() => {
    const provider = new ethers.JsonRpcProvider(BASE_RPC);

    // Gas price
    const fetchGas = async () => {
      try {
        const fee = await provider.getFeeData();
        const gwei = parseFloat(ethers.formatUnits(fee.gasPrice ?? 0n, 'gwei'));
        setGas(gwei.toFixed(4) + ' gwei');
      } catch {}
    };
    fetchGas();
    const gasTimer = setInterval(fetchGas, 10000);

    // AGL supply
    const fetchSupply = async () => {
      try {
        const token = new ethers.Contract(AGL_TOKEN, ERC20_ABI, provider);
        const s = await token.totalSupply();
        const n = parseFloat(ethers.formatEther(s));
        setSupply(n >= 1e9 ? (n / 1e9).toFixed(2) + 'B' : n.toLocaleString());
      } catch {}
    };
    fetchSupply();

    // GitHub stars
    const fetchStars = async () => {
      try {
        const r = await fetch('https://api.github.com/repos/Agunnaya-Labs/agunnaya-labs.github.io');
        const d = await r.json();
        setStars((d.stargazers_count ?? 0).toString());
      } catch {}
    };
    fetchStars();

    return () => clearInterval(gasTimer);
  }, []);

  const scrollTo = (id: string) => document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });

  return (
    <div className="hero z">
      <div className="hero-eyebrow">
        <span className="eyebrow-line" />
        Base Mainnet · Chain ID 8453
        <div className="gas-pill"><div className="gas-dot" /><span>{gas}</span></div>
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
          <div className="stat-n">{supply}</div>
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
          <div className="stat-n">{stars}</div>
          <div className="stat-l">GitHub Stars</div>
        </div>
      </div>

      <div className="hero-scroll"><span className="scroll-bar" />SCROLL</div>
    </div>
  );
}
