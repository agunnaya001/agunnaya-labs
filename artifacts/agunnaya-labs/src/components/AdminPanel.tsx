import { useState, useCallback } from 'react';
import { ethers } from 'ethers';
import { AGL_TOKEN, CONTRACTS, ERC20_ABI } from '../config';

const UNISWAP_ADD_LIQUIDITY = (tokenAddress: string) =>
  `https://app.uniswap.org/add/ETH/${tokenAddress}/10000`;

const BASESCAN_URL = (addr: string) =>
  `https://basescan.org/address/${addr}`;

const DEXTOOLS_URL = (pair: string) =>
  `https://www.dextools.io/app/en/base/pair-explorer/${pair}`;

const AGL_POOL_ADDRESS = ''; // fill in after first liquidity add

interface TokenInfo {
  address: string;
  name: string;
  symbol: string;
  decimals: number;
  totalSupply: string;
  balance: string;
}

type Tab = 'dashboard' | 'deploy' | 'liquidity';

type EthWindow = {
  ethereum?: ethers.Eip1193Provider & {
    request?: (args: { method: string; params?: unknown[] }) => Promise<unknown>;
  };
};

export default function AdminPanel() {
  const [activeTab, setActiveTab] = useState<Tab>('dashboard');
  const [tokenInfo, setTokenInfo] = useState<TokenInfo | null>(null);
  const [lookupAddress, setLookupAddress] = useState(AGL_TOKEN);
  const [lookupLoading, setLookupLoading] = useState(false);
  const [lookupError, setLookupError] = useState('');

  // Deploy form
  const [tokenName, setTokenName] = useState('');
  const [tokenSymbol, setTokenSymbol] = useState('');
  const [tokenSupply, setTokenSupply] = useState('1000000000');
  const [tokenDecimals, setTokenDecimals] = useState('18');

  // Liquidity form
  const [liqToken, setLiqToken] = useState(AGL_TOKEN);
  const [liqEth, setLiqEth] = useState('0.5');
  const [liqTokens, setLiqTokens] = useState('100000000');

  const lookupToken = useCallback(async () => {
    if (!lookupAddress || !ethers.isAddress(lookupAddress)) {
      setLookupError('Enter a valid contract address.');
      return;
    }
    setLookupLoading(true);
    setLookupError('');
    setTokenInfo(null);
    try {
      const provider = new ethers.JsonRpcProvider('https://mainnet.base.org');
      const contract = new ethers.Contract(lookupAddress, ERC20_ABI, provider);
      const [name, symbol, decimals, totalSupply, balance] = await Promise.all([
        contract.name(),
        contract.symbol(),
        contract.decimals(),
        contract.totalSupply(),
        contract.balanceOf(lookupAddress),
      ]);
      setTokenInfo({
        address: lookupAddress,
        name,
        symbol,
        decimals: Number(decimals),
        totalSupply: parseFloat(ethers.formatUnits(totalSupply, decimals)).toLocaleString(),
        balance: parseFloat(ethers.formatUnits(balance, decimals)).toLocaleString(),
      });
    } catch {
      setLookupError('Could not fetch token. Check the address and try again.');
    } finally {
      setLookupLoading(false);
    }
  }, [lookupAddress]);

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text).catch(() => {});
  };

  const deployEnvScript = () => {
    const lines = [
      `TOKEN_NAME="${tokenName}"`,
      `TOKEN_SYMBOL="${tokenSymbol}"`,
      `TOKEN_SUPPLY="${tokenSupply}"`,
      `TOKEN_DECIMALS="${tokenDecimals}"`,
    ].join('\n');
    return lines;
  };

  const liquidityEnvScript = () => {
    return [
      `TOKEN_ADDRESS="${liqToken}"`,
      `LIQUIDITY_ETH="${liqEth}"`,
      `LIQUIDITY_TOKENS="${liqTokens}"`,
    ].join('\n');
  };

  const switchToBase = async () => {
    const win = window as unknown as EthWindow;
    if (!win.ethereum?.request) {
      window.open('https://metamask.io/download/', '_blank');
      return;
    }
    try {
      await win.ethereum.request({ method: 'wallet_switchEthereumChain', params: [{ chainId: '0x2105' }] });
    } catch {}
  };

  return (
    <section id="admin" className="z" style={{ padding: '80px 0', maxWidth: 1100, margin: '0 auto' }}>
      <div style={{ padding: '0 48px' }}>
        <div className="sec-label reveal">Token Operations · Admin Tools</div>
        <div className="sec-title reveal" style={{ fontSize: 'clamp(2rem, 6vw, 4rem)', marginBottom: 12 }}>
          TOKEN<br />ADMIN
        </div>
        <p className="reveal" style={{ color: 'var(--muted)', maxWidth: 540, marginBottom: 40, fontSize: '.9rem' }}>
          Deploy new tokens to Base Mainnet, add Uniswap V3 liquidity, and monitor on-chain token status.
          Run the scripts locally with your wallet private key — never share it.
        </p>

        {/* Tabs */}
        <div className="reveal" style={{ display: 'flex', gap: 8, marginBottom: 40, flexWrap: 'wrap' }}>
          {(['dashboard', 'deploy', 'liquidity'] as Tab[]).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`btn ${activeTab === tab ? 'btn-acid' : ''}`}
              style={{
                fontSize: '.7rem',
                padding: '8px 20px',
                opacity: activeTab === tab ? 1 : 0.6,
                background: activeTab === tab ? undefined : 'transparent',
                border: '1px solid var(--border)',
              }}
            >
              {tab === 'dashboard' ? '📊 Dashboard' : tab === 'deploy' ? '🚀 Deploy Token' : '💧 Add Liquidity'}
            </button>
          ))}
        </div>

        {/* ── DASHBOARD TAB ─────────────────────────────────────── */}
        {activeTab === 'dashboard' && (
          <div className="reveal">
            <div style={{ marginBottom: 32 }}>
              <div style={{ color: 'var(--muted)', fontSize: '.75rem', letterSpacing: '.08em', marginBottom: 16, textTransform: 'uppercase' }}>
                Deployed Contracts
              </div>
              <div style={{ display: 'grid', gap: 12 }}>
                {CONTRACTS.map((c) => (
                  <div key={c.address} style={{
                    border: '1px solid var(--border)', borderRadius: 8, padding: '16px 20px',
                    display: 'flex', alignItems: 'center', gap: 16, flexWrap: 'wrap',
                    background: 'var(--card)',
                  }}>
                    <div style={{ flex: 1, minWidth: 200 }}>
                      <div style={{ fontWeight: 700, fontSize: '.85rem', marginBottom: 2 }}>{c.name}</div>
                      <div style={{ fontSize: '.7rem', color: 'var(--muted)', fontFamily: 'monospace' }}>
                        {c.address}
                      </div>
                      <div style={{ fontSize: '.65rem', color: 'var(--muted)', marginTop: 2 }}>{c.type}</div>
                    </div>
                    <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                      <a href={BASESCAN_URL(c.address)} target="_blank" rel="noopener noreferrer"
                        className="btn" style={{ fontSize: '.65rem', padding: '6px 14px' }}>
                        BaseScan ↗
                      </a>
                      {c.type === 'ERC-20' && (
                        <a href={UNISWAP_ADD_LIQUIDITY(c.address)} target="_blank" rel="noopener noreferrer"
                          className="btn btn-acid" style={{ fontSize: '.65rem', padding: '6px 14px' }}>
                          Add Liquidity ↗
                        </a>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Token Lookup */}
            <div style={{ border: '1px solid var(--border)', borderRadius: 8, padding: 24, background: 'var(--card)' }}>
              <div style={{ fontWeight: 700, fontSize: '.85rem', marginBottom: 16 }}>🔍 Token Lookup</div>
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 16 }}>
                <input
                  value={lookupAddress}
                  onChange={(e) => setLookupAddress(e.target.value)}
                  placeholder="0x... contract address"
                  style={{
                    flex: 1, minWidth: 260,
                    background: 'var(--bg)', border: '1px solid var(--border)', borderRadius: 6,
                    padding: '10px 14px', color: 'var(--fg)', fontSize: '.8rem', fontFamily: 'monospace',
                  }}
                />
                <button className="btn btn-acid" onClick={lookupToken} disabled={lookupLoading}
                  style={{ fontSize: '.75rem', padding: '10px 20px', whiteSpace: 'nowrap' }}>
                  {lookupLoading ? 'Loading...' : 'Lookup'}
                </button>
              </div>
              {lookupError && (
                <div style={{ color: '#ff4d4f', fontSize: '.8rem', marginBottom: 12 }}>{lookupError}</div>
              )}
              {tokenInfo && (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: 12 }}>
                  {[
                    { label: 'Name', value: tokenInfo.name },
                    { label: 'Symbol', value: tokenInfo.symbol },
                    { label: 'Decimals', value: tokenInfo.decimals.toString() },
                    { label: 'Total Supply', value: tokenInfo.totalSupply },
                  ].map((item) => (
                    <div key={item.label} style={{ background: 'var(--bg)', borderRadius: 6, padding: '12px 16px' }}>
                      <div style={{ fontSize: '.65rem', color: 'var(--muted)', marginBottom: 4, textTransform: 'uppercase', letterSpacing: '.06em' }}>{item.label}</div>
                      <div style={{ fontWeight: 700, fontSize: '.9rem' }}>{item.value}</div>
                    </div>
                  ))}
                </div>
              )}
              {tokenInfo && (
                <div style={{ marginTop: 16, display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                  <a href={BASESCAN_URL(tokenInfo.address)} target="_blank" rel="noopener noreferrer"
                    className="btn" style={{ fontSize: '.7rem', padding: '7px 16px' }}>BaseScan ↗</a>
                  <a href={UNISWAP_ADD_LIQUIDITY(tokenInfo.address)} target="_blank" rel="noopener noreferrer"
                    className="btn btn-acid" style={{ fontSize: '.7rem', padding: '7px 16px' }}>Add Liquidity on Uniswap ↗</a>
                </div>
              )}
            </div>

            {/* Quick links */}
            <div style={{ marginTop: 24, display: 'flex', gap: 12, flexWrap: 'wrap' }}>
              <a href="https://app.uniswap.org/pools" target="_blank" rel="noopener noreferrer"
                className="btn" style={{ fontSize: '.75rem', padding: '9px 18px' }}>Uniswap Pools ↗</a>
              <a href="https://basescan.org" target="_blank" rel="noopener noreferrer"
                className="btn" style={{ fontSize: '.75rem', padding: '9px 18px' }}>BaseScan ↗</a>
              <a href="https://app.uncx.network/services/lock-liquidity" target="_blank" rel="noopener noreferrer"
                className="btn" style={{ fontSize: '.75rem', padding: '9px 18px' }}>Lock LP Tokens ↗</a>
              <button className="btn btn-acid" onClick={switchToBase}
                style={{ fontSize: '.75rem', padding: '9px 18px' }}>Switch Wallet to Base</button>
            </div>
          </div>
        )}

        {/* ── DEPLOY TOKEN TAB ──────────────────────────────────── */}
        {activeTab === 'deploy' && (
          <div className="reveal" style={{ display: 'grid', gap: 24, gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))' }}>

            {/* Form */}
            <div style={{ border: '1px solid var(--border)', borderRadius: 8, padding: 24, background: 'var(--card)' }}>
              <div style={{ fontWeight: 700, fontSize: '.9rem', marginBottom: 20 }}>1. Configure Your Token</div>
              <div style={{ display: 'grid', gap: 14 }}>
                {[
                  { label: 'Token Name', value: tokenName, setter: setTokenName, placeholder: 'e.g. My Token' },
                  { label: 'Token Symbol', value: tokenSymbol, setter: setTokenSymbol, placeholder: 'e.g. MTK' },
                  { label: 'Total Supply', value: tokenSupply, setter: setTokenSupply, placeholder: '1000000000' },
                  { label: 'Decimals', value: tokenDecimals, setter: setTokenDecimals, placeholder: '18' },
                ].map((field) => (
                  <div key={field.label}>
                    <label style={{ fontSize: '.7rem', color: 'var(--muted)', display: 'block', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '.06em' }}>
                      {field.label}
                    </label>
                    <input
                      value={field.value}
                      onChange={(e) => field.setter(e.target.value)}
                      placeholder={field.placeholder}
                      style={{
                        width: '100%', boxSizing: 'border-box',
                        background: 'var(--bg)', border: '1px solid var(--border)', borderRadius: 6,
                        padding: '10px 14px', color: 'var(--fg)', fontSize: '.85rem',
                      }}
                    />
                  </div>
                ))}
              </div>

              {tokenName && tokenSymbol && tokenSupply && (
                <div style={{ marginTop: 20, padding: 16, background: 'var(--bg)', borderRadius: 6 }}>
                  <div style={{ fontSize: '.7rem', color: 'var(--muted)', marginBottom: 8, textTransform: 'uppercase', letterSpacing: '.06em' }}>
                    Preview
                  </div>
                  <div style={{ fontSize: '.85rem' }}>
                    <b>{tokenName}</b> ({tokenSymbol})
                  </div>
                  <div style={{ fontSize: '.75rem', color: 'var(--muted)', marginTop: 4 }}>
                    Supply: {parseInt(tokenSupply).toLocaleString()} · Decimals: {tokenDecimals}
                  </div>
                </div>
              )}
            </div>

            {/* Instructions */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div style={{ border: '1px solid var(--border)', borderRadius: 8, padding: 24, background: 'var(--card)' }}>
                <div style={{ fontWeight: 700, fontSize: '.9rem', marginBottom: 16 }}>2. Add to .env File</div>
                <div style={{ position: 'relative' }}>
                  <pre style={{
                    background: 'var(--bg)', borderRadius: 6, padding: '14px 16px',
                    fontSize: '.75rem', overflowX: 'auto', color: 'var(--fg)',
                    fontFamily: 'monospace', margin: 0, lineHeight: 1.6,
                  }}>
                    {deployEnvScript()}
                  </pre>
                  <button
                    onClick={() => copyToClipboard(deployEnvScript())}
                    className="btn"
                    style={{ position: 'absolute', top: 8, right: 8, fontSize: '.65rem', padding: '5px 10px' }}>
                    Copy
                  </button>
                </div>
              </div>

              <div style={{ border: '1px solid var(--border)', borderRadius: 8, padding: 24, background: 'var(--card)' }}>
                <div style={{ fontWeight: 700, fontSize: '.9rem', marginBottom: 16 }}>3. Run the Deploy Script</div>
                <div style={{ position: 'relative' }}>
                  <pre style={{
                    background: 'var(--bg)', borderRadius: 6, padding: '14px 16px',
                    fontSize: '.75rem', color: 'var(--fg)', fontFamily: 'monospace',
                    margin: 0, lineHeight: 1.8,
                  }}>
{`cd artifacts/agl-token
npm run deploy:token`}
                  </pre>
                  <button
                    onClick={() => copyToClipboard('cd artifacts/agl-token\nnpm run deploy:token')}
                    className="btn"
                    style={{ position: 'absolute', top: 8, right: 8, fontSize: '.65rem', padding: '5px 10px' }}>
                    Copy
                  </button>
                </div>
                <div style={{ marginTop: 12, fontSize: '.75rem', color: 'var(--muted)', lineHeight: 1.6 }}>
                  The contract will be deployed on Base Mainnet.
                  Output is saved to <code>deployments/{tokenSymbol.toLowerCase() || 'symbol'}-deployment.json</code>
                </div>
              </div>

              <div style={{ border: '1px solid var(--border)', borderRadius: 8, padding: 20, background: 'rgba(255,200,0,0.04)' }}>
                <div style={{ fontSize: '.75rem', color: 'var(--muted)', lineHeight: 1.7 }}>
                  <b style={{ color: 'var(--fg)' }}>Requirements:</b><br />
                  • <code>DEPLOYER_PRIVATE_KEY</code> in your <code>.env</code><br />
                  • Wallet funded with ETH on Base (for gas)<br />
                  • Hardhat installed (<code>npm install</code> in <code>artifacts/agl-token</code>)
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ── ADD LIQUIDITY TAB ─────────────────────────────────── */}
        {activeTab === 'liquidity' && (
          <div className="reveal" style={{ display: 'grid', gap: 24, gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))' }}>

            {/* Config form */}
            <div style={{ border: '1px solid var(--border)', borderRadius: 8, padding: 24, background: 'var(--card)' }}>
              <div style={{ fontWeight: 700, fontSize: '.9rem', marginBottom: 20 }}>1. Set Liquidity Amounts</div>
              <div style={{ display: 'grid', gap: 14 }}>
                <div>
                  <label style={{ fontSize: '.7rem', color: 'var(--muted)', display: 'block', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '.06em' }}>
                    Token Contract Address
                  </label>
                  <input
                    value={liqToken}
                    onChange={(e) => setLiqToken(e.target.value)}
                    placeholder="0x..."
                    style={{
                      width: '100%', boxSizing: 'border-box',
                      background: 'var(--bg)', border: '1px solid var(--border)', borderRadius: 6,
                      padding: '10px 14px', color: 'var(--fg)', fontSize: '.8rem', fontFamily: 'monospace',
                    }}
                  />
                </div>
                <div>
                  <label style={{ fontSize: '.7rem', color: 'var(--muted)', display: 'block', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '.06em' }}>
                    ETH to Deposit
                  </label>
                  <input
                    value={liqEth}
                    onChange={(e) => setLiqEth(e.target.value)}
                    placeholder="0.5"
                    style={{
                      width: '100%', boxSizing: 'border-box',
                      background: 'var(--bg)', border: '1px solid var(--border)', borderRadius: 6,
                      padding: '10px 14px', color: 'var(--fg)', fontSize: '.85rem',
                    }}
                  />
                </div>
                <div>
                  <label style={{ fontSize: '.7rem', color: 'var(--muted)', display: 'block', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '.06em' }}>
                    Tokens to Deposit
                  </label>
                  <input
                    value={liqTokens}
                    onChange={(e) => setLiqTokens(e.target.value)}
                    placeholder="100000000"
                    style={{
                      width: '100%', boxSizing: 'border-box',
                      background: 'var(--bg)', border: '1px solid var(--border)', borderRadius: 6,
                      padding: '10px 14px', color: 'var(--fg)', fontSize: '.85rem',
                    }}
                  />
                </div>
              </div>

              {liqEth && liqTokens && (
                <div style={{ marginTop: 20, padding: 14, background: 'var(--bg)', borderRadius: 6, fontSize: '.8rem' }}>
                  <div style={{ color: 'var(--muted)', fontSize: '.65rem', textTransform: 'uppercase', letterSpacing: '.06em', marginBottom: 6 }}>Implied Price</div>
                  <div>1 Token = {(parseFloat(liqEth) / parseFloat(liqTokens)).toExponential(4)} ETH</div>
                  <div style={{ color: 'var(--muted)', marginTop: 4 }}>
                    Pool Pair: Token / WETH · Fee: 1%
                  </div>
                </div>
              )}

              <a
                href={UNISWAP_ADD_LIQUIDITY(liqToken || AGL_TOKEN)}
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-acid"
                style={{ display: 'block', textAlign: 'center', marginTop: 20, fontSize: '.8rem', padding: '12px 20px' }}
              >
                Open on Uniswap V3 ↗
              </a>
              <div style={{ fontSize: '.7rem', color: 'var(--muted)', textAlign: 'center', marginTop: 8 }}>
                Opens Uniswap with your token pre-selected on Base
              </div>
            </div>

            {/* Script Instructions */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div style={{ border: '1px solid var(--border)', borderRadius: 8, padding: 24, background: 'var(--card)' }}>
                <div style={{ fontWeight: 700, fontSize: '.9rem', marginBottom: 4 }}>Option A: Use the Script</div>
                <div style={{ fontSize: '.75rem', color: 'var(--muted)', marginBottom: 16 }}>
                  Automated — runs entirely from your terminal
                </div>

                <div style={{ fontSize: '.75rem', color: 'var(--muted)', marginBottom: 8, textTransform: 'uppercase', letterSpacing: '.06em' }}>
                  Add to .env
                </div>
                <div style={{ position: 'relative', marginBottom: 14 }}>
                  <pre style={{
                    background: 'var(--bg)', borderRadius: 6, padding: '14px 16px',
                    fontSize: '.72rem', overflowX: 'auto', color: 'var(--fg)',
                    fontFamily: 'monospace', margin: 0, lineHeight: 1.7,
                  }}>
                    {liquidityEnvScript()}
                  </pre>
                  <button
                    onClick={() => copyToClipboard(liquidityEnvScript())}
                    className="btn"
                    style={{ position: 'absolute', top: 8, right: 8, fontSize: '.65rem', padding: '5px 10px' }}>
                    Copy
                  </button>
                </div>

                <div style={{ fontSize: '.75rem', color: 'var(--muted)', marginBottom: 8, textTransform: 'uppercase', letterSpacing: '.06em' }}>
                  Run the script
                </div>
                <div style={{ position: 'relative' }}>
                  <pre style={{
                    background: 'var(--bg)', borderRadius: 6, padding: '14px 16px',
                    fontSize: '.72rem', color: 'var(--fg)', fontFamily: 'monospace',
                    margin: 0, lineHeight: 1.8,
                  }}>
{`cd artifacts/agl-token
npm run add-liquidity`}
                  </pre>
                  <button
                    onClick={() => copyToClipboard('cd artifacts/agl-token\nnpm run add-liquidity')}
                    className="btn"
                    style={{ position: 'absolute', top: 8, right: 8, fontSize: '.65rem', padding: '5px 10px' }}>
                    Copy
                  </button>
                </div>
              </div>

              <div style={{ border: '1px solid var(--border)', borderRadius: 8, padding: 24, background: 'var(--card)' }}>
                <div style={{ fontWeight: 700, fontSize: '.9rem', marginBottom: 4 }}>Option B: Manual via Uniswap</div>
                <div style={{ fontSize: '.75rem', color: 'var(--muted)', marginBottom: 16 }}>
                  Use your MetaMask wallet directly in the browser
                </div>
                <ol style={{ paddingLeft: 20, margin: 0, display: 'grid', gap: 10 }}>
                  {[
                    'Connect MetaMask to Base Mainnet (button below)',
                    'Click "Open on Uniswap V3" on the left panel',
                    'Select fee tier: 1% (best for new tokens)',
                    `Enter ${liqEth || '0.5'} ETH and ${parseInt(liqTokens || '100000000').toLocaleString()} tokens`,
                    'Set price range: Full Range for maximum coverage',
                    'Approve token spend, then click Add Liquidity',
                    'Lock your LP tokens immediately after (link below)',
                  ].map((step, i) => (
                    <li key={i} style={{ fontSize: '.78rem', color: 'var(--muted)', lineHeight: 1.5 }}>
                      {step}
                    </li>
                  ))}
                </ol>
              </div>

              <div style={{ border: '1px solid var(--border)', borderRadius: 8, padding: 20, background: 'var(--card)' }}>
                <div style={{ fontWeight: 700, fontSize: '.85rem', marginBottom: 12 }}>After Adding Liquidity</div>
                <div style={{ display: 'grid', gap: 8 }}>
                  {[
                    { label: 'Lock LP Tokens (UNCX)', href: 'https://app.uncx.network/services/lock-liquidity' },
                    { label: 'Lock LP Tokens (Team Finance)', href: 'https://team.finance/lock-liquidity' },
                    { label: 'Check Pool on DEXTools', href: DEXTOOLS_URL(AGL_POOL_ADDRESS || liqToken) },
                    { label: 'View on BaseScan', href: BASESCAN_URL(liqToken || AGL_TOKEN) },
                  ].map((link) => (
                    <a
                      key={link.label}
                      href={link.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn"
                      style={{ fontSize: '.72rem', padding: '8px 14px', textAlign: 'center' }}
                    >
                      {link.label} ↗
                    </a>
                  ))}
                </div>
              </div>

              <div style={{ border: '1px solid rgba(255,80,80,0.2)', borderRadius: 8, padding: 16, background: 'rgba(255,80,80,0.04)' }}>
                <div style={{ fontSize: '.75rem', color: 'var(--muted)', lineHeight: 1.7 }}>
                  <b style={{ color: '#ff6b6b' }}>Security reminders</b><br />
                  • Lock LP tokens immediately — never leave them unlocked<br />
                  • Never share your <code>DEPLOYER_PRIVATE_KEY</code><br />
                  • Consider using a multisig after setup is complete
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
