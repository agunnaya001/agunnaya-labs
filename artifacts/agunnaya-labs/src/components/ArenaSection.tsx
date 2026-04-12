import { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import { CONTRACTS, AGL_TOKEN, ERC20_ABI } from '../config';
import { useProvider } from '../context/ProviderContext';
import { useToast } from '../context/ToastContext';

interface TokenInfo { name: string; symbol: string; supply: string; decimals: string; owner: string; }

function CopyBtn({ text }: { text: string }) {
  const { show } = useToast();
  const [copied, setCopied] = useState(false);
  const copy = () => {
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      show('Address copied!', 'success');
      setTimeout(() => setCopied(false), 1500);
    });
  };
  return (
    <button className={`copy-btn ${copied ? 'copied' : ''}`} onClick={copy}>
      {copied ? '✓' : 'Copy'}
    </button>
  );
}

export default function ArenaSection() {
  const provider = useProvider();
  const [token, setToken] = useState<TokenInfo | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!provider) return;
    const loadToken = async () => {
      try {
        const t = new ethers.Contract(AGL_TOKEN, ERC20_ABI, provider);
        const [name, symbol, supply, decimals] = await Promise.all([
          t.name(), t.symbol(), t.totalSupply(), t.decimals()
        ]);
        const supplyNum = parseFloat(ethers.formatEther(supply));
        setToken({
          name, symbol,
          supply: supplyNum.toLocaleString(undefined, { maximumFractionDigits: 0 }),
          decimals: decimals.toString(),
          owner: '0xFfb6505912FCE95B42be4860477201bb4e204E9f',
        });
      } catch {}
      setLoading(false);
    };
    loadToken();
  }, [provider]);

  const addToMetaMask = async () => {
    const win = window as unknown as { ethereum?: { request?: (args: unknown) => Promise<unknown> } };
    if (!win.ethereum?.request) { window.open('https://metamask.io', '_blank'); return; }
    try {
      await win.ethereum.request({
        method: 'wallet_watchAsset',
        params: { type: 'ERC20', options: { address: AGL_TOKEN, symbol: 'AGL', decimals: 18, image: '' } },
      });
    } catch {}
  };

  return (
    <section id="arena" className="z arena-section">
      <div className="sec-label reveal">⚔️ Arena Protocol</div>
      <div className="sec-title reveal">DEPLOYED ON<br />BASE MAINNET</div>

      {/* Scrollable contracts table on mobile */}
      <div style={{ overflowX: 'auto', maxWidth: 1200 }} className="reveal">
        <table className="contracts-table" style={{ minWidth: 580 }}>
          <thead>
            <tr>
              <th>Contract</th>
              <th>Address</th>
              <th>Status</th>
              <th style={{ textAlign: 'right' }}>Explorer</th>
            </tr>
          </thead>
          <tbody>
            {CONTRACTS.map((c) => (
              <tr key={c.address}>
                <td>
                  <div className="ct-name">{c.name}</div>
                  <div className="ct-type">{c.type}</div>
                </td>
                <td>
                  <div className="ct-addr-wrap">
                    <a
                      className="ct-addr"
                      href={`https://basescan.org${c.basescanPath}${c.address}`}
                      target="_blank" rel="noopener noreferrer"
                    >
                      {c.address.slice(0, 10)}…{c.address.slice(-6)}
                    </a>
                    <CopyBtn text={c.address} />
                  </div>
                </td>
                <td>
                  <span className="badge"><span className="badge-dot" />LIVE</span>
                </td>
                <td style={{ textAlign: 'right' }}>
                  <a href={`https://basescan.org${c.basescanPath}${c.address}`} target="_blank" rel="noopener noreferrer">
                    <button className="btn btn-ghost" style={{ fontSize: '.6rem', padding: '6px 12px' }}>↗</button>
                  </a>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* AGL Token Panel */}
      <div className="token-panel reveal">
        <div className="token-panel-header">
          <h4>AGL TOKEN</h4>
          <span className="live-tag"><div className="gas-dot" />LIVE · BASE MAINNET</span>
          <button
            className="btn btn-outline"
            style={{ marginLeft: 'auto', fontSize: '.58rem', padding: '5px 12px' }}
            onClick={addToMetaMask}
          >
            + Add to MetaMask
          </button>
        </div>
        <div className="token-metrics">
          {loading ? (
            [0,1,2,3].map(i => (
              <div key={i} className="tm-cell">
                <div className="skel" style={{ height: 10, width: 60, marginBottom: 10 }} />
                <div className="skel" style={{ height: 28, width: 100 }} />
              </div>
            ))
          ) : (
            <>
              <div className="tm-cell">
                <div className="tm-label">Name</div>
                <div className="tm-val" style={{ fontSize: '1.3rem' }}>{token?.name ?? '—'}</div>
              </div>
              <div className="tm-cell">
                <div className="tm-label">Symbol</div>
                <div className="tm-val">{token?.symbol ?? '—'}</div>
              </div>
              <div className="tm-cell">
                <div className="tm-label">Total Supply</div>
                <div className="tm-val">{token?.supply ?? '—'}</div>
                <div className="tm-sub">{token?.symbol}</div>
              </div>
              <div className="tm-cell">
                <div className="tm-label">Decimals</div>
                <div className="tm-val">{token?.decimals ?? '—'}</div>
                <div className="tm-sub">ERC-20 Standard</div>
              </div>
            </>
          )}
        </div>
        {token && (
          <div style={{ padding: '14px 28px', borderTop: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
            <span style={{ fontFamily: 'var(--ff-m)', fontSize: '.58rem', color: 'var(--dim)', letterSpacing: '.06em' }}>CONTRACT:</span>
            <a className="ct-addr" href={`https://basescan.org/token/${AGL_TOKEN}`} target="_blank" rel="noopener noreferrer" style={{ fontSize: '.65rem' }}>{AGL_TOKEN}</a>
            <CopyBtn text={AGL_TOKEN} />
            <a href={`https://basescan.org/token/${AGL_TOKEN}`} target="_blank" rel="noopener noreferrer" style={{ marginLeft: 'auto' }}>
              <button className="btn btn-ghost" style={{ fontSize: '.6rem', padding: '6px 14px' }}>View on BaseScan ↗</button>
            </a>
          </div>
        )}
      </div>
    </section>
  );
}
