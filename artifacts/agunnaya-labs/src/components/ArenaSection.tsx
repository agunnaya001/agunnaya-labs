import { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import { BASE_RPC, CONTRACTS, AGL_TOKEN, ERC20_ABI } from '../config';

interface TokenInfo { name: string; symbol: string; supply: string; decimals: string; }
interface TxCount { [addr: string]: string }

function CopyBtn({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);
  const copy = () => {
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    });
  };
  return <button className={`copy-btn ${copied ? 'copied' : ''}`} onClick={copy}>{copied ? 'Copied!' : 'Copy'}</button>;
}

export default function ArenaSection() {
  const [token, setToken] = useState<TokenInfo | null>(null);
  const [txCounts, setTxCounts] = useState<TxCount>({});

  useEffect(() => {
    const provider = new ethers.JsonRpcProvider(BASE_RPC);

    // Load AGL token info
    const loadToken = async () => {
      try {
        const t = new ethers.Contract(AGL_TOKEN, ERC20_ABI, provider);
        const [name, symbol, supply, decimals] = await Promise.all([
          t.name(), t.symbol(), t.totalSupply(), t.decimals()
        ]);
        setToken({
          name, symbol,
          supply: (parseFloat(ethers.formatEther(supply))).toLocaleString(undefined, { maximumFractionDigits: 0 }),
          decimals: decimals.toString(),
        });
      } catch {}
    };
    loadToken();

    // Load tx counts via BaseScan API (no key needed for basic count)
    const loadTxCounts = async () => {
      const counts: TxCount = {};
      await Promise.all(CONTRACTS.map(async (c) => {
        try {
          const r = await fetch(`https://api.basescan.org/api?module=account&action=txlist&address=${c.address}&startblock=0&endblock=99999999&sort=asc&page=1&offset=1`);
          const d = await r.json();
          counts[c.address] = d.status === '1' ? '✓ Active' : '—';
        } catch {
          counts[c.address] = '—';
        }
      }));
      setTxCounts(counts);
    };
    loadTxCounts();
  }, []);

  return (
    <section id="arena" className="z arena-section">
      <div className="sec-label reveal">⚔️ Arena Protocol</div>
      <div className="sec-title reveal">DEPLOYED ON<br />BASE MAINNET</div>

      <table className="contracts-table reveal">
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
                    {c.address.slice(0,12)}…{c.address.slice(-8)}
                  </a>
                  <CopyBtn text={c.address} />
                </div>
              </td>
              <td>
                <span className="badge"><span className="badge-dot" />LIVE</span>
              </td>
              <td style={{ textAlign: 'right' }}>
                <a href={`https://basescan.org${c.basescanPath}${c.address}`} target="_blank" rel="noopener noreferrer">
                  <button className="btn btn-ghost" style={{ fontSize: '.6rem', padding: '6px 12px' }}>BaseScan ↗</button>
                </a>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* AGL Token Panel */}
      <div className="token-panel reveal">
        <div className="token-panel-header">
          <h4>AGL TOKEN</h4>
          <span className="live-tag"><div className="gas-dot" />LIVE · BASE MAINNET</span>
        </div>
        <div className="token-metrics">
          <div className="tm-cell">
            <div className="tm-label">Name</div>
            <div className="tm-val" style={{ fontSize: '1.3rem' }}>{token?.name ?? '···'}</div>
          </div>
          <div className="tm-cell">
            <div className="tm-label">Symbol</div>
            <div className="tm-val">{token?.symbol ?? '···'}</div>
          </div>
          <div className="tm-cell">
            <div className="tm-label">Total Supply</div>
            <div className="tm-val">{token?.supply ?? '···'}</div>
            <div className="tm-sub">{token?.symbol}</div>
          </div>
          <div className="tm-cell">
            <div className="tm-label">Decimals</div>
            <div className="tm-val">{token?.decimals ?? '···'}</div>
          </div>
        </div>
      </div>
    </section>
  );
}
