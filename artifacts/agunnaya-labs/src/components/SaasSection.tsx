import { memo } from 'react';

const CARDS = [
  { icon: '📊', title: 'Analytics Engine', desc: 'On-chain event indexing and wallet analytics across Base mainnet. Track AGL holders, arena battles, and NFT transfers in real time.', pill: 'COMING SOON', delay: 0 },
  { icon: '🤖', title: 'AI Automation', desc: 'Trigger-based contract interactions driven by configurable AI conditions. Set rules, let the bot execute.', pill: 'IN DEVELOPMENT', delay: 100 },
  { icon: '🔐', title: 'Security API', desc: 'REST API for programmatic smart contract auditing. Integrate vulnerability scanning directly into your CI/CD pipeline.', pill: 'BETA', delay: 200 },
];

const SaasSection = memo(function SaasSection() {
  return (
    <section id="saas" className="z">
      <div className="sec-label reveal">SaaS Infrastructure</div>
      <div className="sec-title reveal">BUILT TO<br />SCALE</div>

      <div className="saas-grid">
        {CARDS.map((c, i) => (
          <div key={i} className="saas-card reveal" style={{ transitionDelay: c.delay + 'ms' }}>
            <div className="saas-icon">{c.icon}</div>
            <h3>{c.title}</h3>
            <p>{c.desc}</p>
            <span className="saas-pill">{c.pill}</span>
          </div>
        ))}
      </div>
    </section>
  );
});

export default SaasSection;
