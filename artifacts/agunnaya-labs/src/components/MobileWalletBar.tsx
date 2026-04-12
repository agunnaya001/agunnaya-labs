import type { WalletState } from '../hooks/useWallet';

interface Props {
  wallet: WalletState & { connect: () => void; switchToBase: () => void };
}

export default function MobileWalletBar({ wallet }: Props) {
  if (wallet.isConnected && !wallet.isWrongNetwork) return null;

  return (
    <div className="mobile-wallet-bar">
      {wallet.isWrongNetwork ? (
        <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', width:'100%' }}>
          <span style={{ fontFamily:'var(--ff-m)', fontSize:'.65rem', color:'var(--orange)', letterSpacing:'.05em' }}>
            ⚠ Wrong Network — Switch to Base
          </span>
          <button className="btn btn-outline" style={{ fontSize:'.62rem', padding:'8px 16px' }} onClick={wallet.switchToBase}>
            Switch →
          </button>
        </div>
      ) : (
        <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', width:'100%' }}>
          <div>
            <div style={{ fontFamily:'var(--ff-m)', fontSize:'.6rem', color:'var(--mid)', letterSpacing:'.06em' }}>Base Mainnet · Chain 8453</div>
            <div style={{ fontFamily:'var(--ff-m)', fontSize:'.62rem', color:'var(--text)', marginTop:2 }}>Connect to view your AGL balance</div>
          </div>
          <button className="btn btn-acid" style={{ fontSize:'.66rem', padding:'10px 18px', flexShrink:0 }} onClick={wallet.connect}>
            Connect →
          </button>
        </div>
      )}
    </div>
  );
}
