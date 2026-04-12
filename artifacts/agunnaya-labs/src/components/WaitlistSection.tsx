import { useState } from 'react';

export default function WaitlistSection() {
  const [email, setEmail] = useState('');
  const [done, setDone] = useState(false);
  const [loading, setLoading] = useState(false);

  const join = async () => {
    if (!email.includes('@')) return;
    setLoading(true);
    // Submit to Formspree
    try {
      await fetch('https://formspree.io/f/mzdyppdj', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify({ email }),
      });
    } catch {}
    await new Promise(r => setTimeout(r, 400));
    setLoading(false);
    setDone(true);
  };

  return (
    <section id="waitlist" className="z waitlist-section">
      <div className="waitlist-inner">
        <div className="sec-label reveal">Early Access</div>
        <div className="sec-title reveal">JOIN THE<br />ECOSYSTEM</div>
        <p className="reveal" style={{ color:'var(--mid)', marginBottom:48, fontWeight:300, fontSize:'.95rem' }}>
          Get early access to Arena Protocol, the AI Auditor Bot, and SaaS tooling as they launch. No spam — ever.
        </p>

        {!done ? (
          <>
            <div className="input-row reveal">
              <input
                type="email"
                placeholder="your@email.com"
                value={email}
                onChange={e => setEmail(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && join()}
              />
              <button className="btn btn-acid" onClick={join} disabled={loading}>
                {loading ? '…' : 'Join →'}
              </button>
            </div>
            <div className="waitlist-note reveal">MIT licensed · Free tier available · Pro plan live</div>
          </>
        ) : (
          <div className="waitlist-success show">
            <span>YOU'RE IN</span>
            <p>We'll reach out when early access opens</p>
          </div>
        )}
      </div>
    </section>
  );
}
