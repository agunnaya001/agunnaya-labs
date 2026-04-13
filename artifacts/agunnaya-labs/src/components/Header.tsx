import { useEffect, useState, useRef } from 'react';
import type { WalletState } from '../hooks/useWallet';
import LiveBlock from './LiveBlock';
import { useActiveSection } from '../hooks/useActiveSection';

interface Props {
  wallet: WalletState & { connect: () => void; disconnect: () => void; switchToBase: () => void; addAGLToWallet: () => Promise<boolean> };
  onToast: (msg: string, type?: 'default'|'success'|'error'|'warning') => void;
}

const NAV = [
  { id:'ai', label:'AI Security' },
  { id:'arena', label:'Arena' },
  { id:'leaderboard', label:'Leaderboard' },
  { id:'gallery', label:'Gallery' },
  { id:'audits', label:'Audits' },
  { id:'earn', label:'Earn' },
  { id:'pro', label:'Pro' },
  { id:'waitlist', label:'Waitlist' },
];

export default function Header({ wallet, onToast }: Props) {
  const [scrolled, setScrolled] = useState(false);
  const [panelOpen, setPanelOpen] = useState(false);
  const [mobOpen, setMobOpen] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);
  const active = useActiveSection();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // Close panel on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
        setPanelOpen(false);
      }
    };
    if (panelOpen) document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [panelOpen]);

  // Close mobile menu on Escape
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') { setMobOpen(false); setPanelOpen(false); }
    };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, []);

  const scrollTo = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
    setMobOpen(false);
    setPanelOpen(false);
  };

  const fmt = (a: string) => a.slice(0, 6) + '…' + a.slice(-4);

  const copyAddress = () => {
    if (!wallet.address) return;
    navigator.clipboard.writeText(wallet.address).then(() => onToast('Address copied!', 'success'));
  };

  const handleAddAGL = async () => {
    const ok = await wallet.addAGLToWallet();
    onToast(ok ? 'AGL added to MetaMask!' : 'Could not add token — try manually.', ok ? 'success' : 'error');
  };

  const walletBtnClass = wallet.isConnected
    ? wallet.isWrongNetwork ? 'btn btn-ghost btn-wallet-wrong' : 'btn btn-ghost btn-wallet-connected'
    : 'btn btn-ghost';

  const walletLabel = wallet.isConnected
    ? wallet.isWrongNetwork ? '⚠ Wrong Network' : fmt(wallet.address!)
    : 'Connect Wallet';

  return (
    <>
      <header className={`site-header z ${scrolled ? 'scrolled' : ''}`}>
        <div className="logo" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
          <div className="logo-dot" />
          AGUNNAYA LABS
        </div>

        <nav className="nav-links">
          {NAV.map(({ id, label }) => (
            <a
              key={id}
              href={`#${id}`}
              className={active === id ? 'nav-active' : ''}
              onClick={e => { e.preventDefault(); scrollTo(id); }}
            >
              {label}
            </a>
          ))}
        </nav>

        <div className="nav-ctas">
          <LiveBlock />
          <button className={walletBtnClass} onClick={() => {
            if (!wallet.isConnected) wallet.connect();
            else setPanelOpen(p => !p);
          }}>{walletLabel}</button>
          <button className="btn btn-acid hide-sm" onClick={() => scrollTo('pro')}>Get Pro →</button>
          <button
            className={`ham ${mobOpen ? 'open' : ''}`}
            onClick={() => setMobOpen(m => !m)}
            aria-label="Toggle menu"
            aria-expanded={mobOpen}
          >
            <span /><span /><span />
          </button>
        </div>
      </header>

      {/* Wallet Panel */}
      {wallet.isConnected && (
        <div ref={panelRef} className={`wallet-panel ${panelOpen ? 'open' : ''}`}>
          <div className="wp-row">
            <span className="wp-label">Address</span>
            <button className="wp-val" style={{ background:'none', border:'none', cursor:'pointer', color:'var(--sky)', fontFamily:'var(--ff-m)', fontSize:'.74rem' }} onClick={copyAddress} title="Click to copy">
              {fmt(wallet.address!)} ⎘
            </button>
          </div>
          <div className="wp-row">
            <span className="wp-label">Network</span>
            <span className={`wp-val ${wallet.isWrongNetwork ? '' : 'green'}`}>{wallet.network}</span>
          </div>
          <div className="wp-divider" />
          <div className="wp-row"><span className="wp-label">ETH</span><span className="wp-val">{wallet.ethBalance} ETH</span></div>
          <div className="wp-row"><span className="wp-label">AGL</span><span className="wp-val accent">{wallet.aglBalance} AGL</span></div>
          {(() => {
            try {
              const bal = parseFloat((wallet.aglBalance ?? '0').replace(/,/g, ''));
              if (bal >= 1000) return (
                <div className="wp-row"><span className="wp-label">Status</span><span className="wp-val" style={{ color: 'var(--acid)' }}>⚡ PRO MEMBER</span></div>
              );
            } catch {}
            return null;
          })()}
          <div className="wp-divider" />
          {(() => {
            try {
              const refCount = parseInt(localStorage.getItem('agl_ref_count') ?? '0', 10);
              return (
                <div className="wp-row">
                  <span className="wp-label">Referrals</span>
                  <span className="wp-val">{refCount} → {refCount * 1000} AGL</span>
                </div>
              );
            } catch { return null; }
          })()}
          <div className="wp-actions">
            <button className="btn btn-ghost" style={{ fontSize:'.6rem' }} onClick={handleAddAGL}>+ AGL to Wallet</button>
            <button className="btn btn-ghost" style={{ fontSize:'.6rem' }} onClick={wallet.switchToBase}>Switch to Base</button>
          </div>
          <div className="wp-actions" style={{ marginTop:6 }}>
            <button className="btn btn-acid" style={{ flex:1, fontSize:'.6rem' }} onClick={() => { scrollTo('earn'); setPanelOpen(false); }}>Earn AGL →</button>
          </div>
          <div className="wp-actions" style={{ marginTop:6 }}>
            <button className="btn btn-ghost" style={{ flex:1, fontSize:'.6rem' }} onClick={() => { wallet.disconnect(); setPanelOpen(false); }}>Disconnect</button>
          </div>
        </div>
      )}

      {/* Mobile overlay */}
      {mobOpen && <div className="mob-overlay" onClick={() => setMobOpen(false)} />}

      {/* Mobile menu */}
      <nav className={`mobile-menu ${mobOpen ? 'open' : ''}`} aria-hidden={!mobOpen}>
        <div className="mob-menu-logo">AGUNNAYA LABS</div>
        {NAV.map(({ id, label }) => (
          <a key={id} href={`#${id}`} className={active === id ? 'mob-active' : ''} onClick={e => { e.preventDefault(); scrollTo(id); }}>
            {label}
          </a>
        ))}
        <div style={{ marginTop:8, borderTop:'1px solid var(--border)', paddingTop:20 }}>
          {!wallet.isConnected ? (
            <button className="btn btn-acid" style={{ width:'100%', padding:14 }} onClick={() => { wallet.connect(); setMobOpen(false); }}>
              Connect Wallet →
            </button>
          ) : (
            <div style={{ fontFamily:'var(--ff-m)', fontSize:'.65rem', color:'var(--green)', padding:'8px 0' }}>
              ● Connected: {fmt(wallet.address!)}
            </div>
          )}
        </div>
      </nav>
    </>
  );
}
