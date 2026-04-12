export default function ProSection() {
  const scrollTo = (id: string) => document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });

  return (
    <section id="pro" className="z pro-section">
      <div className="sec-label reveal">Subscriptions</div>
      <div className="sec-title reveal">GO<br />PRO</div>

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

        <div className="pro-card featured">
          <div className="pro-tier acid">Pro · Most Popular</div>
          <div className="pro-price"><sup>$</sup>49<sub>/mo</sub></div>
          <p className="pro-desc">Full platform access for serious builders. Priority scanning, API keys, and SaaS tooling as it ships.</p>
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
          <button className="btn btn-acid pro-cta" onClick={() => scrollTo('waitlist')}>Join Waitlist →</button>
          <div style={{ display:'flex', alignItems:'center', justifyContent:'center', gap:6, marginTop:12, fontFamily:'var(--ff-m)', fontSize:'.56rem', color:'var(--dim)', letterSpacing:'.05em' }}>
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" opacity=".4"><rect x="1" y="4" width="22" height="16" rx="2"/><line x1="1" y1="10" x2="23" y2="10"/></svg>
            Contact for access · Cancel anytime
          </div>
        </div>
      </div>
    </section>
  );
}
