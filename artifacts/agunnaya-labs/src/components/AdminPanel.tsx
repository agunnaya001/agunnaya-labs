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

type Tab = 'dashboard' | 'deploy' | 'liquidity' | 'nft';

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
          {([
            { id: 'dashboard', label: '📊 Dashboard' },
            { id: 'deploy', label: '🚀 Deploy Token' },
            { id: 'liquidity', label: '💧 Add Liquidity' },
            { id: 'nft', label: '🎴 NFT Launch' },
          ] as { id: Tab; label: string }[]).map(({ id, label }) => (
            <button
              key={id}
              onClick={() => setActiveTab(id)}
              className={`btn ${activeTab === id ? 'btn-acid' : ''}`}
              style={{
                fontSize: '.7rem',
                padding: '8px 20px',
                opacity: activeTab === id ? 1 : 0.6,
                background: activeTab === id ? undefined : 'transparent',
                border: '1px solid var(--border)',
              }}
            >
              {label}
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
        {/* ── NFT LAUNCH TAB ───────────────────────────────────── */}
        {activeTab === 'nft' && <NFTTab />}
      </div>
    </section>
  );
}

// ── Genesis NFT data ──────────────────────────────────────────
const GENESIS_NFTS = [
  { id: 1, name: 'Shadow Cipher',  rarity: 'Legendary', power: 98, element: 'Void',      emoji: '⚫' },
  { id: 2, name: 'Iron Sentinel',  rarity: 'Epic',       power: 82, element: 'Metal',     emoji: '🛡️' },
  { id: 3, name: 'Storm Seeker',   rarity: 'Rare',       power: 74, element: 'Lightning', emoji: '⚡' },
  { id: 4, name: 'Flame Warden',   rarity: 'Epic',       power: 86, element: 'Fire',      emoji: '🔥' },
  { id: 5, name: 'Frost Knight',   rarity: 'Rare',       power: 71, element: 'Ice',       emoji: '❄️' },
  { id: 6, name: 'Neon Phantom',   rarity: 'Legendary',  power: 95, element: 'Cyber',     emoji: '👾' },
  { id: 7, name: 'Arc Breaker',    rarity: 'Common',     power: 55, element: 'Thunder',   emoji: '🌪️' },
  { id: 8, name: 'Terra Golem',    rarity: 'Rare',       power: 68, element: 'Earth',     emoji: '🌍' },
];

const ARENA_CHAMPION_V1 = '0x68f08b005b09B0F7D07E1c0B5CDe18E43CE2486A';

const RARITY_COLORS: Record<string, string> = {
  Legendary: '#f59e0b',
  Epic:      '#a855f7',
  Rare:      '#3b82f6',
  Common:    '#6b7280',
};

interface OpenSeaStatus {
  count: number;
  nfts: Array<{ tokenId: string; name: string; openSeaUrl: string }>;
  collectionUrl: string;
}

interface RefreshResult {
  refreshed: number;
  total: number;
  results: Array<{ tokenId: number; ok: boolean; status: number }>;
  message: string;
}

function NFTTab() {
  const [contract, setContract] = useState(ARENA_CHAMPION_V1);
  const [status, setStatus] = useState<OpenSeaStatus | null>(null);
  const [statusLoading, setStatusLoading] = useState(false);
  const [statusError, setStatusError] = useState('');
  const [refreshResult, setRefreshResult] = useState<RefreshResult | null>(null);
  const [refreshLoading, setRefreshLoading] = useState(false);
  const [refreshError, setRefreshError] = useState('');

  const fetchStatus = useCallback(async () => {
    setStatusLoading(true);
    setStatusError('');
    setStatus(null);
    try {
      const res = await fetch(`/api/opensea/status?contract=${contract}`);
      const data = await res.json();
      if (!data.ok) throw new Error(data.error || 'Failed to fetch');
      setStatus(data);
    } catch (err) {
      setStatusError(err instanceof Error ? err.message : 'Failed to fetch OpenSea status');
    } finally {
      setStatusLoading(false);
    }
  }, [contract]);

  const refreshAll = useCallback(async () => {
    setRefreshLoading(true);
    setRefreshError('');
    setRefreshResult(null);
    try {
      const res = await fetch('/api/opensea/refresh', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ contract }),
      });
      const data = await res.json();
      if (!data.ok) throw new Error(data.error || 'Refresh failed');
      setRefreshResult(data);
    } catch (err) {
      setRefreshError(err instanceof Error ? err.message : 'Refresh failed');
    } finally {
      setRefreshLoading(false);
    }
  }, [contract]);

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text).catch(() => {});
  };

  return (
    <div className="reveal" style={{ display: 'grid', gap: 24 }}>

      {/* Top bar — contract selector + actions */}
      <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'flex-end' }}>
        <div style={{ flex: 1, minWidth: 260 }}>
          <label style={{ fontSize: '.7rem', color: 'var(--muted)', display: 'block', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '.06em' }}>
            NFT Contract Address
          </label>
          <input
            value={contract}
            onChange={(e) => setContract(e.target.value)}
            style={{
              width: '100%', boxSizing: 'border-box',
              background: 'var(--bg)', border: '1px solid var(--border)', borderRadius: 6,
              padding: '10px 14px', color: 'var(--fg)', fontSize: '.78rem', fontFamily: 'monospace',
            }}
          />
        </div>
        <button className="btn" onClick={fetchStatus} disabled={statusLoading}
          style={{ fontSize: '.75rem', padding: '10px 18px', whiteSpace: 'nowrap' }}>
          {statusLoading ? 'Checking...' : '🔍 Check OpenSea Status'}
        </button>
        <button className="btn btn-acid" onClick={refreshAll} disabled={refreshLoading}
          style={{ fontSize: '.75rem', padding: '10px 18px', whiteSpace: 'nowrap' }}>
          {refreshLoading ? `Refreshing... (rate limited)` : '🔄 Refresh All on OpenSea'}
        </button>
        <a href={`https://opensea.io/assets/base/${contract}`} target="_blank" rel="noopener noreferrer"
          className="btn" style={{ fontSize: '.75rem', padding: '10px 18px', whiteSpace: 'nowrap' }}>
          View on OpenSea ↗
        </a>
      </div>

      {statusError && (
        <div style={{ background: 'rgba(255,80,80,0.08)', border: '1px solid rgba(255,80,80,0.2)', borderRadius: 8, padding: '12px 16px', fontSize: '.8rem', color: '#ff6b6b' }}>
          {statusError}
        </div>
      )}

      {/* OpenSea live status */}
      {status && (
        <div style={{ border: '1px solid var(--border)', borderRadius: 8, padding: 20, background: 'var(--card)' }}>
          <div style={{ fontWeight: 700, fontSize: '.85rem', marginBottom: 12 }}>
            OpenSea Status — {status.count} NFT{status.count !== 1 ? 's' : ''} indexed
          </div>
          {status.count === 0 ? (
            <div style={{ fontSize: '.8rem', color: 'var(--muted)', lineHeight: 1.6 }}>
              No NFTs found on OpenSea yet. They may not be minted, or OpenSea can take 10–30 minutes to index after the first mint.
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: 10 }}>
              {status.nfts.map((nft) => (
                <a key={nft.tokenId} href={nft.openSeaUrl} target="_blank" rel="noopener noreferrer"
                  style={{
                    display: 'block', background: 'var(--bg)', borderRadius: 6, padding: '10px 14px',
                    textDecoration: 'none', border: '1px solid var(--border)',
                  }}>
                  <div style={{ fontWeight: 700, fontSize: '.8rem', color: 'var(--fg)', marginBottom: 4 }}>
                    #{nft.tokenId} {nft.name || '—'}
                  </div>
                  <div style={{ fontSize: '.65rem', color: 'var(--muted)' }}>View on OpenSea ↗</div>
                </a>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Refresh result */}
      {refreshError && (
        <div style={{ background: 'rgba(255,80,80,0.08)', border: '1px solid rgba(255,80,80,0.2)', borderRadius: 8, padding: '12px 16px', fontSize: '.8rem', color: '#ff6b6b' }}>
          {refreshError}
        </div>
      )}
      {refreshResult && (
        <div style={{ border: '1px solid rgba(0,200,100,0.25)', borderRadius: 8, padding: 20, background: 'rgba(0,200,100,0.04)' }}>
          <div style={{ fontWeight: 700, fontSize: '.85rem', marginBottom: 8, color: '#4ade80' }}>
            ✓ {refreshResult.message}
          </div>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            {refreshResult.results.map((r) => (
              <div key={r.tokenId} style={{
                fontSize: '.7rem', padding: '5px 10px', borderRadius: 4,
                background: r.ok ? 'rgba(0,200,100,0.12)' : 'rgba(255,80,80,0.12)',
                color: r.ok ? '#4ade80' : '#ff6b6b',
              }}>
                #{r.tokenId} {r.ok ? '✓' : '✗'}
              </div>
            ))}
          </div>
          <div style={{ fontSize: '.72rem', color: 'var(--muted)', marginTop: 12 }}>
            OpenSea typically updates within 5–15 minutes after a refresh request.
          </div>
        </div>
      )}

      {/* Genesis NFT grid */}
      <div>
        <div style={{ fontWeight: 700, fontSize: '.85rem', marginBottom: 16 }}>
          8 Genesis Arena Champions — IPFS Metadata Ready
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 12 }}>
          {GENESIS_NFTS.map((nft) => (
            <div key={nft.id} style={{
              border: `1px solid ${RARITY_COLORS[nft.rarity]}44`,
              borderRadius: 8, padding: 16, background: 'var(--card)',
            }}>
              <div style={{ fontSize: '1.8rem', marginBottom: 8 }}>{nft.emoji}</div>
              <div style={{ fontWeight: 700, fontSize: '.85rem', marginBottom: 4 }}>{nft.name}</div>
              <div style={{ display: 'flex', gap: 6, marginBottom: 8, flexWrap: 'wrap' }}>
                <span style={{
                  fontSize: '.6rem', padding: '3px 8px', borderRadius: 4, fontWeight: 700,
                  background: `${RARITY_COLORS[nft.rarity]}22`,
                  color: RARITY_COLORS[nft.rarity],
                }}>
                  {nft.rarity}
                </span>
                <span style={{ fontSize: '.6rem', color: 'var(--muted)', padding: '3px 8px', background: 'var(--bg)', borderRadius: 4 }}>
                  {nft.element}
                </span>
              </div>
              <div style={{ fontSize: '.72rem', color: 'var(--muted)', marginBottom: 8 }}>
                Power: <b style={{ color: 'var(--fg)' }}>{nft.power}</b> / 100
              </div>
              <a href={`https://opensea.io/assets/base/${contract}/${nft.id}`}
                target="_blank" rel="noopener noreferrer"
                style={{ fontSize: '.65rem', color: 'var(--muted)', textDecoration: 'none' }}>
                Token #{nft.id} — OpenSea ↗
              </a>
            </div>
          ))}
        </div>
      </div>

      {/* Launch pipeline */}
      <div style={{ display: 'grid', gap: 16, gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))' }}>
        <div style={{ border: '1px solid var(--border)', borderRadius: 8, padding: 24, background: 'var(--card)' }}>
          <div style={{ fontWeight: 700, fontSize: '.9rem', marginBottom: 4 }}>Full NFT Launch (One Command)</div>
          <div style={{ fontSize: '.75rem', color: 'var(--muted)', marginBottom: 16 }}>
            Deploy ArenaChampionV2 → Mint all 8 NFTs → Verify on BaseScan
          </div>
          <div style={{ position: 'relative' }}>
            <pre style={{
              background: 'var(--bg)', borderRadius: 6, padding: '14px 16px',
              fontSize: '.72rem', color: 'var(--fg)', fontFamily: 'monospace', margin: 0, lineHeight: 1.8,
            }}>
{`cd artifacts/agl-token
npm run nft:launch`}
            </pre>
            <button onClick={() => copyToClipboard('cd artifacts/agl-token\nnpm run nft:launch')}
              className="btn" style={{ position: 'absolute', top: 8, right: 8, fontSize: '.65rem', padding: '5px 10px' }}>
              Copy
            </button>
          </div>
          <div style={{ marginTop: 12, fontSize: '.72rem', color: 'var(--muted)', lineHeight: 1.6 }}>
            Requires: <code>DEPLOYER_PRIVATE_KEY</code> + <code>BASESCAN_API_KEY</code> in <code>.env</code><br />
            Wallet needs ~0.01 ETH for gas on Base
          </div>
        </div>

        <div style={{ border: '1px solid var(--border)', borderRadius: 8, padding: 24, background: 'var(--card)' }}>
          <div style={{ fontWeight: 700, fontSize: '.9rem', marginBottom: 4 }}>Refresh OpenSea Metadata</div>
          <div style={{ fontSize: '.75rem', color: 'var(--muted)', marginBottom: 16 }}>
            Force OpenSea to re-index all your NFT images and attributes
          </div>
          <div style={{ position: 'relative' }}>
            <pre style={{
              background: 'var(--bg)', borderRadius: 6, padding: '14px 16px',
              fontSize: '.72rem', color: 'var(--fg)', fontFamily: 'monospace', margin: 0, lineHeight: 1.8,
            }}>
{`cd artifacts/agl-token
npm run nft:opensea`}
            </pre>
            <button onClick={() => copyToClipboard('cd artifacts/agl-token\nnpm run nft:opensea')}
              className="btn" style={{ position: 'absolute', top: 8, right: 8, fontSize: '.65rem', padding: '5px 10px' }}>
              Copy
            </button>
          </div>
          <div style={{ marginTop: 12, fontSize: '.72rem', color: 'var(--muted)', lineHeight: 1.6 }}>
            Requires: <code>OPENSEA_API_KEY</code> in <code>.env</code><br />
            Or use the "Refresh All on OpenSea" button above
          </div>
        </div>

        <div style={{ border: '1px solid var(--border)', borderRadius: 8, padding: 24, background: 'var(--card)' }}>
          <div style={{ fontWeight: 700, fontSize: '.9rem', marginBottom: 12 }}>Quick Links</div>
          <div style={{ display: 'grid', gap: 8 }}>
            {[
              { label: 'ArenaChampion on OpenSea', href: `https://opensea.io/assets/base/${ARENA_CHAMPION_V1}` },
              { label: 'Arena Champion Collection', href: 'https://opensea.io/collection/arena-champion' },
              { label: 'Contract on BaseScan', href: `https://basescan.org/address/${ARENA_CHAMPION_V1}` },
              { label: 'OpenSea Creator Dashboard', href: 'https://opensea.io/account/settings' },
              { label: 'Verify contract on BaseScan', href: `https://basescan.org/address/${ARENA_CHAMPION_V1}#code` },
            ].map((link) => (
              <a key={link.label} href={link.href} target="_blank" rel="noopener noreferrer"
                className="btn" style={{ fontSize: '.72rem', padding: '8px 14px', textAlign: 'center' }}>
                {link.label} ↗
              </a>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
