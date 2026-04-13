import { useState, useEffect, memo } from 'react';
import { ARENA_CHAMPION } from '../config';

interface NFT {
  id: number; owner: string; name: string; rarity: string; power: number; element: string; emoji: string; mintedAt: string;
}

const RARITY_COLOR: Record<string, string> = {
  Legendary: 'var(--acid)', Epic: '#a855f7', Rare: 'var(--sky)', Common: 'var(--mid)',
};
const RARITY_ORDER = ['Legendary', 'Epic', 'Rare', 'Common'];

type Filter = 'all' | 'legendary' | 'epic' | 'rare' | 'common';

const NFTCard = memo(function NFTCard({ nft, onClick }: { nft: NFT; onClick: () => void }) {
  const color = RARITY_COLOR[nft.rarity] ?? 'var(--mid)';
  return (
    <div className="nft-card" onClick={onClick} onKeyDown={e => e.key === 'Enter' && onClick()} tabIndex={0} role="button" aria-label={`View ${nft.name}`}>
      <div className="nft-art">{nft.emoji}</div>
      <div className="nft-info">
        <div className="nft-name">{nft.name}</div>
        <div className="nft-id">#{nft.id.toString().padStart(4, '0')}</div>
        <div className="nft-tags">
          <span className="nft-tag" style={{ color, borderColor: color + '44' }}>{nft.rarity}</span>
          <span className="nft-tag">PWR {nft.power}</span>
          <span className="nft-tag">{nft.element}</span>
        </div>
        <div style={{ marginTop: 6, fontFamily: 'var(--ff-m)', fontSize: '.5rem', color: 'var(--dim)' }}>Owner: {nft.owner}</div>
      </div>
    </div>
  );
});

function NFTModal({ nft, onClose }: { nft: NFT; onClose: () => void }) {
  useEffect(() => {
    const h = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', h);
    document.body.style.overflow = 'hidden';
    return () => { document.removeEventListener('keydown', h); document.body.style.overflow = ''; };
  }, [onClose]);
  const color = RARITY_COLOR[nft.rarity] ?? 'var(--mid)';
  return (
    <div className="nft-modal-bg" onClick={onClose} role="dialog" aria-modal="true">
      <div className="nft-modal" onClick={e => e.stopPropagation()}>
        <button className="nft-modal-close" onClick={onClose} aria-label="Close">✕</button>
        <div className="nft-modal-art">{nft.emoji}</div>
        <div className="nft-modal-body">
          <div className="nft-modal-name">{nft.name}</div>
          <div className="nft-modal-id">#{nft.id.toString().padStart(4, '0')} · ArenaChampion ERC-721 · Minted {nft.mintedAt}</div>
          <div className="nft-modal-attrs">
            {[['Rarity', nft.rarity], ['Power', nft.power.toString()], ['Element', nft.element]].map(([k, v]) => (
              <div key={k} className="nft-attr">
                <div className="nft-attr-key">{k}</div>
                <div className="nft-attr-val" style={k === 'Rarity' ? { color } : {}}>{v}</div>
              </div>
            ))}
          </div>
          <div style={{ fontFamily: 'var(--ff-m)', fontSize: '.6rem', color: 'var(--dim)', marginBottom: 18 }}>
            Owner: <span style={{ color: 'var(--sky)' }}>{nft.owner}</span>
          </div>
          <div className="nft-modal-actions">
            <a href={`https://opensea.io/assets/base/${ARENA_CHAMPION}/${nft.id}`} target="_blank" rel="noopener noreferrer">
              <button className="btn btn-outline">OpenSea ↗</button>
            </a>
            <a href={`https://basescan.org/token/${ARENA_CHAMPION}?a=${nft.id}`} target="_blank" rel="noopener noreferrer">
              <button className="btn btn-ghost">BaseScan ↗</button>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}

function NFTSkeleton() {
  return (
    <div className="nft-grid">
      {[...Array(8)].map((_, i) => (
        <div key={i} className="nft-card" style={{ pointerEvents: 'none' }}>
          <div style={{ aspectRatio: '1', background: 'var(--border)', animation: `pulse 1.4s ${i * 80}ms ease-in-out infinite` }} />
          <div style={{ padding: 14 }}>
            <div style={{ height: 20, width: '70%', background: 'var(--border)', borderRadius: 3, marginBottom: 8, animation: 'pulse 1.4s ease-in-out infinite' }} />
            <div style={{ height: 10, width: '40%', background: 'var(--border)', borderRadius: 3, animation: 'pulse 1.4s ease-in-out infinite' }} />
          </div>
        </div>
      ))}
    </div>
  );
}

export default function NFTSection() {
  const [nfts, setNfts] = useState<NFT[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState<Filter>('all');
  const [sort, setSort] = useState<'id' | 'power' | 'rarity'>('id');
  const [selected, setSelected] = useState<NFT | null>(null);
  const [totalSupply, setTotalSupply] = useState(0);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetch('/api/nfts');
        const data = await res.json() as { ok: boolean; nfts: NFT[] };
        if (data.ok) {
          setNfts(data.nfts);
          setTotalSupply(data.nfts.length);
        }
      } catch {
        setError('Could not load NFT data.');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const filtered = nfts
    .filter(n => filter === 'all' || n.rarity.toLowerCase() === filter)
    .sort((a, b) => {
      if (sort === 'power') return b.power - a.power;
      if (sort === 'rarity') return RARITY_ORDER.indexOf(a.rarity) - RARITY_ORDER.indexOf(b.rarity);
      return a.id - b.id;
    });

  const FILTERS: { value: Filter; label: string }[] = [
    { value: 'all', label: 'All Champions' },
    { value: 'legendary', label: 'Legendary' },
    { value: 'epic', label: 'Epic' },
    { value: 'rare', label: 'Rare' },
    { value: 'common', label: 'Common' },
  ];

  return (
    <>
      <section id="gallery" className="z">
        <div className="sec-label reveal">ArenaChampion · ERC-721 · Base Mainnet</div>
        <div className="sec-title reveal">NFT<br />GALLERY</div>

        {!loading && totalSupply > 0 && (
          <div className="nft-controls reveal">
            <div className="nft-filters">
              {FILTERS.map(f => (
                <button key={f.value} className={`nft-filter-btn ${filter === f.value ? 'active' : ''}`} onClick={() => setFilter(f.value)}>{f.label}</button>
              ))}
            </div>
            <div className="nft-sort-row">
              <span className="nft-count">{filtered.length} of {totalSupply} minted</span>
              <select className="nft-sort" value={sort} onChange={e => setSort(e.target.value as typeof sort)}>
                <option value="id">Sort: ID</option>
                <option value="power">Sort: Power ↓</option>
                <option value="rarity">Sort: Rarity</option>
              </select>
            </div>
          </div>
        )}

        {loading ? <NFTSkeleton /> : error ? (
          <div style={{ padding: '48px', textAlign: 'center', fontFamily: 'var(--ff-m)', fontSize: '.72rem', color: 'var(--red)' }}>{error}</div>
        ) : nfts.length === 0 ? (
          <div className="nft-empty-state reveal">
            <div style={{ fontSize: '4rem', marginBottom: 20 }}>🏆</div>
            <div style={{ fontFamily: 'var(--ff-d)', fontSize: '1.6rem', letterSpacing: '.06em', marginBottom: 12 }}>BE THE FIRST TO MINT</div>
            <p style={{ fontFamily: 'var(--ff-m)', fontSize: '.72rem', color: 'var(--mid)', maxWidth: 420, margin: '0 auto 28px', lineHeight: 1.7 }}>
              ArenaChampion NFTs are earned through battle victories on the Arena Protocol. Win battles to receive your on-chain champion.
            </p>
            <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', justifyContent: 'center' }}>
              <a href={`https://opensea.io/assets/base/${ARENA_CHAMPION}`} target="_blank" rel="noopener noreferrer">
                <button className="btn btn-acid">View on OpenSea ↗</button>
              </a>
              <a href={`https://basescan.org/token/${ARENA_CHAMPION}`} target="_blank" rel="noopener noreferrer">
                <button className="btn btn-outline">Contract on BaseScan ↗</button>
              </a>
            </div>
          </div>
        ) : (
          <div className="nft-grid reveal">
            {filtered.map(nft => (
              <NFTCard key={nft.id} nft={nft} onClick={() => setSelected(nft)} />
            ))}
            {filtered.length === 0 && (
              <div style={{ gridColumn: '1/-1', textAlign: 'center', padding: '48px', fontFamily: 'var(--ff-m)', fontSize: '.72rem', color: 'var(--dim)' }}>
                No {filter} NFTs found.
              </div>
            )}
          </div>
        )}

        {/* Always show mint CTA if some exist */}
        {!loading && nfts.length > 0 && (
          <div style={{ marginTop: 32, display: 'flex', gap: 12, flexWrap: 'wrap' }} className="reveal">
            <a href={`https://opensea.io/assets/base/${ARENA_CHAMPION}`} target="_blank" rel="noopener noreferrer">
              <button className="btn btn-outline">View on OpenSea ↗</button>
            </a>
            <a href={`https://basescan.org/token/${ARENA_CHAMPION}`} target="_blank" rel="noopener noreferrer">
              <button className="btn btn-ghost">Contract on BaseScan ↗</button>
            </a>
          </div>
        )}
      </section>

      {selected && <NFTModal nft={selected} onClose={() => setSelected(null)} />}
    </>
  );
}
