import { useState } from 'react';
import { useToast } from '../context/ToastContext';

export default function WaitlistSection() {
  const { show } = useToast();
  const [email, setEmail] = useState('');
  const [done, setDone] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const validate = (e: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e);

  const join = async () => {
    if (!validate(email)) { setError('Enter a valid email address.'); return; }
    setError('');
    setLoading(true);
    try {
      const res = await fetch('https://formspree.io/f/mzdyppdj', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify({ email }),
      });
      if (res.ok) {
        setDone(true);
        show('You\'re on the waitlist!', 'success');
      } else {
        throw new Error('Failed');
      }
    } catch {
      setError('Something went wrong. Try again.');
      show('Submission failed — try again.', 'error');
    }
    setLoading(false);
  };

  return (
    <section id="waitlist" className="z waitlist-section">
      <div className="waitlist-inner">
        <div className="sec-label reveal">Early Access</div>
        <div className="sec-title reveal">JOIN THE<br />ECOSYSTEM</div>
        <p className="reveal" style={{ color: 'var(--mid)', marginBottom: 48, fontWeight: 300, fontSize: '.95rem' }}>
          Get early access to Arena Protocol, the AI Auditor Bot, and SaaS tooling as they launch. No spam — ever.
        </p>

        {!done ? (
          <>
            <div className={`input-row reveal ${error ? 'input-error' : ''}`}>
              <input
                type="email"
                placeholder="your@email.com"
                value={email}
                onChange={e => { setEmail(e.target.value); setError(''); }}
                onKeyDown={e => e.key === 'Enter' && join()}
                disabled={loading}
                aria-label="Email address"
              />
              <button className="btn btn-acid" onClick={join} disabled={loading || !email}>
                {loading ? '…' : 'Join →'}
              </button>
            </div>
            {error && (
              <div style={{ fontFamily: 'var(--ff-m)', fontSize: '.62rem', color: 'var(--red)', marginTop: 10, letterSpacing: '.04em' }}>
                {error}
              </div>
            )}
            <div className="waitlist-note reveal">MIT licensed · Free tier always available · No spam</div>
          </>
        ) : (
          <div className="waitlist-success show reveal">
            <span>YOU'RE IN</span>
            <p>We'll reach out when early access opens — check your inbox</p>
          </div>
        )}
      </div>
    </section>
  );
}
