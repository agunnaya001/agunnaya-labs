import { useState, useCallback, memo } from 'react';
import { AGL_TOKEN } from '../config';
import { useToast } from '../context/ToastContext';

const DEPLOYER = '0xFfb6505912FCE95B42be4860477201bb4e204E9f';

type EthWindow = { ethereum?: {
  request?: (args: { method: string; params?: unknown[] }) => Promise<unknown>;
}};

// ─── Tip Jar ────────────────────────────────────────────────────────────────
const TIP_AMOUNTS = [
  { label: '☕ 0.001 ETH', value: '0x38D7EA4C68000' },   // 0.001 ETH in hex wei
  { label: '🍕 0.005 ETH', value: '0x11C37937E08000' },  // 0.005 ETH
  { label: '🚀 0.01 ETH',  value: '0x2386F26FC10000' },  // 0.01 ETH
];

function TipJar() {
  const [sending, setSending] = useState(false);
  const [done, setDone] = useState('');
  const { show } = useToast();

  const send = useCallback(async (hexVal: string, label: string) => {
    const win = window as unknown as EthWindow;
    if (!win.ethereum?.request) {
      window.open('https://metamask.io/download/', '_blank');
      return;
    }
    setSending(true);
    try {
      const accounts = await win.ethereum.request({ method: 'eth_accounts' }) as string[];
      if (!accounts?.length) {
        await win.ethereum.request({ method: 'eth_requestAccounts' });
      }
      const from = (await win.ethereum.request({ method: 'eth_accounts' }) as string[])[0];
      const txHash = await win.ethereum.request({
        method: 'eth_sendTransaction',
        params: [{ from, to: DEPLOYER, value: hexVal }],
      }) as string;
      setDone(txHash);
      show(`${label} sent — thank you! 🙏`, 'success');
    } catch (err: unknown) {
      const e = err as { code?: number };
      if (e.code !== 4001) show('Transaction failed — try again.', 'error');
    } finally {
      setSending(false);
    }
  }, [show]);

  return (
    <div className="tip-jar">
      <div className="tip-jar-header">
        <span>☕</span>
        <div>
          <div className="tip-jar-title">Tip the Builder</div>
          <div className="tip-jar-sub">Support open-source development on Base</div>
        </div>
      </div>
      {done ? (
        <div style={{ fontFamily: 'var(--ff-m)', fontSize: '.62rem', color: 'var(--green)', padding: '12px 0' }}>
          ✓ Sent! Tx: <a href={`https://basescan.org/tx/${done}`} target="_blank" rel="noopener noreferrer" style={{ color: 'var(--sky)' }}>{done.slice(0, 12)}…</a>
        </div>
      ) : (
        <div className="tip-amounts">
          {TIP_AMOUNTS.map(t => (
            <button
              key={t.value}
              className="btn btn-ghost tip-btn"
              onClick={() => send(t.value, t.label)}
              disabled={sending}
            >
              {sending ? '…' : t.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Referral ────────────────────────────────────────────────────────────────
const ReferralWidget = memo(function ReferralWidget() {
  const { show } = useToast();
  const [copied, setCopied] = useState(false);

  // Get own wallet from localStorage ref record
  const myRef = (() => {
    try { return localStorage.getItem('agl_wallet') ?? ''; } catch { return ''; }
  })();

  const refCount = (() => {
    try { return parseInt(localStorage.getItem('agl_ref_count') ?? '0', 10); } catch { return 0; }
  })();

  const refLink = myRef
    ? `${window.location.origin}${window.location.pathname}?ref=${myRef}`
    : `${window.location.origin}${window.location.pathname}?ref=connect-wallet-first`;

  const copy = () => {
    if (!myRef) { show('Connect your wallet to generate a referral link', 'warning'); return; }
    navigator.clipboard.writeText(refLink).then(() => {
      setCopied(true);
      show('Referral link copied!', 'success');
      setTimeout(() => setCopied(false), 2000);
    });
  };

  return (
    <div className="referral-widget">
      <div className="referral-title">🔗 Refer &amp; Earn AGL</div>
      <p className="referral-desc">Share your link. Every friend who joins the waitlist counts as a referral — early referrers get priority AGL allocation.</p>
      <div className="referral-stats">
        <div className="referral-stat">
          <div className="referral-stat-n">{refCount}</div>
          <div className="referral-stat-l">Referrals</div>
        </div>
        <div className="referral-stat">
          <div className="referral-stat-n">{refCount * 1000}</div>
          <div className="referral-stat-l">AGL Earned</div>
        </div>
      </div>
      <div className="referral-link-row">
        <div className="referral-link-box">{myRef ? refLink : 'Connect wallet to generate link'}</div>
        <button className="btn btn-acid" onClick={copy}>{copied ? '✓ Copied' : 'Copy'}</button>
      </div>
    </div>
  );
});

// ─── Buy AGL ─────────────────────────────────────────────────────────────────
const DEX_LINKS = [
  { name: 'Uniswap', href: `https://app.uniswap.org/swap?outputCurrency=${AGL_TOKEN}&chain=base`, icon: '🦄', desc: 'Largest DEX on Base' },
  { name: 'Aerodrome', href: `https://aerodrome.finance/swap?to=${AGL_TOKEN}&chain=base`, icon: '✈️', desc: 'Native Base liquidity' },
  { name: 'BaseScan', href: `https://basescan.org/token/${AGL_TOKEN}`, icon: '🔍', desc: 'View contract & holders' },
];

const HOW_TO = [
  { step: '01', title: 'Get ETH on Base', body: 'Bridge ETH to Base via bridge.base.org or buy directly in MetaMask.' },
  { step: '02', title: 'Open Uniswap on Base', body: `Go to Uniswap, select Base network, paste the AGL contract address.` },
  { step: '03', title: 'Swap for AGL', body: 'Set slippage to 1%, confirm the transaction, and AGL appears in your wallet.' },
  { step: '04', title: 'Add AGL to MetaMask', body: 'Click "Add AGL to MetaMask" anywhere on this site to track your balance.' },
];

// ─── Main Section ─────────────────────────────────────────────────────────────
export default function TokenRewardsSection() {
  return (
    <section id="earn" className="z rewards-section">
      <div className="sec-label reveal">Token Economics · Rewards</div>
      <div className="sec-title reveal">EARN &amp;<br />OWN AGL</div>

      {/* How to earn */}
      <div className="rewards-grid reveal">
        {[
          { icon: '⚔️', title: 'Win Battles', desc: 'Beat opponents in the Arena Protocol — each win rewards ArenaToken redeemable for AGL.', badge: 'LIVE' },
          { icon: '🏆', title: 'Hold NFTs', desc: 'ArenaChampion holders receive priority airdrop allocations and Pro access perks.', badge: 'LIVE' },
          { icon: '🔗', title: 'Refer Friends', desc: 'Every successful referral earns you 1,000 AGL in the genesis airdrop pool.', badge: 'COMING' },
          { icon: '🔐', title: 'Audit Repos', desc: 'Run the AI Auditor Bot on your repos — contributors to open-source security earn allocation.', badge: 'BETA' },
          { icon: '📊', title: 'Stake AGL', desc: 'Lock AGL to earn passive yield from Arena battle fees. Staking module in development.', badge: 'SOON' },
          { icon: '🤝', title: 'Join Waitlist', desc: 'Early waitlist members receive priority access to the token sale and genesis airdrop.', badge: 'OPEN' },
        ].map((c, i) => (
          <div key={i} className="reward-card" style={{ animationDelay: i * 80 + 'ms' }}>
            <div className="reward-icon">{c.icon}</div>
            <div>
              <div className="reward-title">{c.title} <span className={`reward-badge ${c.badge === 'LIVE' ? 'badge-live' : c.badge === 'BETA' ? 'badge-beta' : c.badge === 'OPEN' ? 'badge-open' : 'badge-soon'}`}>{c.badge}</span></div>
              <div className="reward-desc">{c.desc}</div>
            </div>
          </div>
        ))}
      </div>

      <div className="rewards-bottom reveal">
        {/* Buy AGL */}
        <div className="buy-agl-card">
          <div className="buy-agl-header">
            <div>
              <div className="buy-agl-title">Get AGL Tokens</div>
              <div className="buy-agl-sub">AGL · ERC-20 · Base Mainnet · 1B Fixed Supply</div>
            </div>
            <div className="buy-agl-addr">
              <span style={{ fontFamily: 'var(--ff-m)', fontSize: '.56rem', color: 'var(--dim)' }}>CONTRACT</span>
              <div style={{ fontFamily: 'var(--ff-m)', fontSize: '.6rem', color: 'var(--sky)' }}>{AGL_TOKEN.slice(0, 10)}…{AGL_TOKEN.slice(-6)}</div>
            </div>
          </div>

          <div className="dex-links">
            {DEX_LINKS.map(d => (
              <a key={d.name} href={d.href} target="_blank" rel="noopener noreferrer" className="dex-link">
                <span className="dex-icon">{d.icon}</span>
                <div>
                  <div className="dex-name">{d.name}</div>
                  <div className="dex-desc">{d.desc}</div>
                </div>
                <span className="dex-arrow">↗</span>
              </a>
            ))}
          </div>

          <div className="how-to-buy">
            <div style={{ fontFamily: 'var(--ff-m)', fontSize: '.6rem', letterSpacing: '.1em', color: 'var(--dim)', marginBottom: 16 }}>HOW TO BUY</div>
            <div className="how-steps">
              {HOW_TO.map(h => (
                <div key={h.step} className="how-step">
                  <div className="how-step-num">{h.step}</div>
                  <div>
                    <div className="how-step-title">{h.title}</div>
                    <div className="how-step-body">{h.body}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right column: Referral + Tip */}
        <div className="rewards-right">
          <ReferralWidget />
          <TipJar />
        </div>
      </div>
    </section>
  );
}
