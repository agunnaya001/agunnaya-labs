import { useState, useEffect } from 'react';

export default function AISection() {
  const [stars, setStars] = useState('—');
  const [forks, setForks] = useState('—');

  useEffect(() => {
    fetch('https://api.github.com/repos/Agunnaya-Labs/agunnaya-labs.github.io')
      .then(r => r.json())
      .then(d => {
        setStars(d.stargazers_count ?? '—');
        setForks(d.forks_count ?? '—');
      })
      .catch(() => {});
  }, []);

  return (
    <section id="ai" className="z">
      <div className="sec-label reveal">AI Security System</div>
      <div className="sec-title reveal">SMART CONTRACT<br />SECURITY</div>

      <div className="ai-grid reveal">
        <div className="ai-card">
          <div className="ai-num">01</div>
          <h3>Auditor Bot</h3>
          <p>GitHub App that runs static analysis on every Solidity PR. Six detectors, severity-coded comments, and GitHub Checks — zero config, fully automatic.</p>
          <a className="ai-link" href="https://github.com/apps/smart-contract-auditor-bot" target="_blank" rel="noopener noreferrer">
            Install App ↗
          </a>
          <div className="detectors">
            {['Reentrancy','tx.origin misuse','Unchecked calls','Selfdestruct','Honeypot / Rug-pull','Hardcoded secrets'].map(t => (
              <span key={t} className="det-tag">{t}</span>
            ))}
          </div>
          <div className="gh-stat">
            <span className="gh-star">★</span>
            <span>{stars} stars</span>&nbsp;·&nbsp;<span>{forks} forks</span>
          </div>
        </div>

        <div className="ai-card">
          <div className="ai-num">02</div>
          <h3>Audit Dashboard</h3>
          <p>Live vulnerability detection interface. Real-time results from every PR scan — severity breakdowns, remediation guidance, and historical audit logs.</p>
          <a className="ai-link" href="https://v0-smart-contract-auditor-bot.vercel.app/" target="_blank" rel="noopener noreferrer">
            Open Dashboard ↗
          </a>
          <br /><br />
          <a className="ai-link" href="https://github.com/agunnaya001" target="_blank" rel="noopener noreferrer" style={{ marginTop: 12 }}>
            View GitHub ↗
          </a>
        </div>
      </div>
    </section>
  );
}
