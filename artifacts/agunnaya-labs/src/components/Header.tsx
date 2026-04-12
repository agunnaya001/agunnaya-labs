import { useEffect, useState } from 'react';
import type { WalletState } from '../hooks/useWallet';

interface Props {
  wallet: WalletState & { connect: () => void; disconnect: () => void; switchToBase: () => void };
}

export default function Header({ wallet }: Props) {
  const [scrolled, setScrolled] = useState(false);
  const [panelOpen, setPanelOpen] = useState(false);
  const [mobOpen, setMobOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const scrollTo = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
    setMobOpen(false);
  };

  const fmt = (a: string) => a.slice(0, 6) + '…' + a.slice(-4);

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
          {['ai','arena','leaderboard','gallery','audits','pro','waitlist'].map(id => (
            <a key={id} href={`#${id}`} onClick={e => { e.preventDefault(); scrollTo(id); }}>
              {id === 'ai' ? 'AI Security' : id === 'pro' ? 'Pro' : id.charAt(0).toUpperCase() + id.slice(1)}
            </a>
          ))}
        </nav>

        <div className="nav-ctas">
          <button className={walletBtnClass} onClick={() => {
            if (!wallet.isConnected) wallet.connect();
            else setPanelOpen(p => !p);
          }}>{walletLabel}</button>
          <button className="btn btn-acid" onClick={() => scrollTo('pro')}>Get Pro →</button>
          <button className={`ham ${mobOpen ? 'open' : ''}`} onClick={() => setMobOpen(m => !m)}>
            <span /><span /><span />
          </button>
        </div>
      </header>

      {/* Wallet Panel */}
      {wallet.isConnected && (
        <div className={`wallet-panel ${panelOpen ? 'open' : ''}`}>
          <div className="wp-row"><span className="wp-label">Address</span><span className="wp-val">{fmt(wallet.address!)}</span></div>
          <div className="wp-row"><span className="wp-label">Network</span><span className={`wp-val ${wallet.isWrongNetwork ? '' : 'green'}`}>{wallet.network}</span></div>
          <div className="wp-divider" />
          <div className="wp-row"><span className="wp-label">ETH Balance</span><span className="wp-val">{wallet.ethBalance} ETH</span></div>
          <div className="wp-row"><span className="wp-label">AGL Balance</span><span className="wp-val accent">{wallet.aglBalance} AGL</span></div>
          <div className="wp-divider" />
          <div className="wp-actions">
            <button className="btn btn-ghost" onClick={wallet.switchToBase}>Switch to Base</button>
            <button className="btn btn-ghost" onClick={() => { wallet.disconnect(); setPanelOpen(false); }}>Disconnect</button>
          </div>
        </div>
      )}

      {/* Mobile menu */}
      <div className={`mobile-menu ${mobOpen ? 'open' : ''}`}>
        {['ai','arena','leaderboard','gallery','audits','pro','waitlist'].map(id => (
          <a key={id} href={`#${id}`} onClick={e => { e.preventDefault(); scrollTo(id); }}>
            {id === 'ai' ? 'AI Security' : id.charAt(0).toUpperCase() + id.slice(1)}
          </a>
        ))}
      </div>
    </>
  );
}
