import { useMemo } from 'react';
import { AGL_TOKEN } from '../config';

interface ProSectionProps {
  aglBalance?: string | null;
  isConnected?: boolean;
}

const AGL_PRO_THRESHOLD = 1000;

export default function ProSection({ aglBalance, isConnected }: ProSectionProps) {
  const scrollTo = (id: string) => document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });

  const balance = useMemo(() => {
    if (!aglBalance) return 0;
    const n = parseFloat(aglBalance.replace(/,/g, ''));
    return isNaN(n) ? 0 : n;
  }, [aglBalance]);

  const hasProAccess = isConnected && balance >= AGL_PRO_THRESHOLD;

  return (
    <section id="pro" className="z pro-section">
      <div className="sec-label reveal">Subscriptions · Token-Gated</div>
      <div className="sec-title reveal">GO<br />PRO</div>

      {/* AGL holder gate banner */}
      {isConnected && (
        <div className={`pro-gate-banner reveal ${hasProAccess ? 'pro-gate-active' : 'pro-gate-inactive'}`}>
          {hasProAccess ? (
            <>
              <span className="pro-gate-icon">✅</span>
              <div>
                <div className="pro-gate-title">PRO ACCESS ACTIVE</div>
                <div className="pro-gate-sub">You hold {balance.toLocaleString()} AGL — above the {AGL_PRO_THRESHOLD.toLocaleString()} AGL threshold. Full platform access is unlocked.</div>
              </div>
              <span className="pro-badge-pill">PRO MEMBER</span>
            </>
          ) : (
            <>
              <span className="pro-gate-icon">⚠</span>
              <div>
                <div className="pro-gate-title">YOU HOLD {balance.toLocaleString()} AGL</div>
                <div className="pro-gate-sub">Hold {AGL_PRO_THRESHOLD.toLocaleString()}+ AGL to unlock Pro access. Need {Math.max(0, AGL_PRO_THRESHOLD - balance).toLocaleString()} more AGL.</div>
              </div>
              <button className="btn btn-acid" onClick={() => scrollTo('earn')} style={{ whiteSpace: 'nowrap', fontSize: '.6rem', padding: '7px 16px' }}>Get AGL →</button>
            </>
          )}
        </div>
      )}

      <div className="pro-grid reveal">
        <div className="pro-card">
          <div className="pro-tier">Free Tier</div>
          <div className="pro-price"><sup>$</sup>0<sub>/mo</sub></div>
          <p className="pro-desc">Everything you need to explore the Arena ecosystem. No credit card required.</p>
          <ul className="pro-features">
            <li>GitHub Auditor Bot (public repos)</li>
            <li>On-chain leaderboard</li>
            <li>NFT gallery viewer</li>
            <li>Audit feed (last 10 scans)</li>
            <li className="no">Private repo scanning</li>
            <li className="no">Priority audit queue</li>
            <li className="no">REST API access</li>
            <li className="no">SaaS analytics dashboard</li>
          </ul>
          <button className="btn btn-ghost pro-cta" onClick={() => scrollTo('waitlist')}>Join Waitlist →</button>
        </div>

        <div className={`pro-card featured ${hasProAccess ? 'pro-card-unlocked' : ''}`}>
          {hasProAccess && <div className="pro-unlocked-ribbon">UNLOCKED ✓</div>}
          <div className="pro-tier acid">Pro · {hasProAccess ? 'Active' : 'Hold 1,000 AGL'}</div>
          <div className="pro-price"><sup>$</sup>49<sub>/mo</sub> <span className="pro-or">or hold 1K AGL</span></div>
          <p className="pro-desc">Full platform access for serious builders. Hold 1,000 AGL tokens or subscribe monthly.</p>
          <ul className="pro-features">
            <li>Everything in Free</li>
            <li>Private repo scanning</li>
            <li>Priority audit queue (2× faster)</li>
            <li>REST API access + API key</li>
            <li>Full audit history export</li>
            <li>SaaS analytics (early access)</li>
            <li>AI automation triggers (beta)</li>
            <li>Dedicated support channel</li>
          </ul>
          {hasProAccess ? (
            <a href="https://v0-smart-contract-auditor-bot.vercel.app/" target="_blank" rel="noopener noreferrer">
              <button className="btn btn-acid pro-cta">Access Dashboard ↗</button>
            </a>
          ) : (
            <button className="btn btn-acid pro-cta" onClick={() => scrollTo('earn')}>
              Get AGL to Unlock →
            </button>
          )}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, marginTop: 12, fontFamily: 'var(--ff-m)', fontSize: '.56rem', color: 'var(--dim)', letterSpacing: '.05em' }}>
            <a href={`https://basescan.org/token/${AGL_TOKEN}`} target="_blank" rel="noopener noreferrer" style={{ color: 'var(--sky)' }}>AGL on BaseScan</a>
            · Cancel anytime
          </div>
        </div>
      </div>
    </section>
  );
}
