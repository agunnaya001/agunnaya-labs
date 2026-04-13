import { useState, useEffect, memo } from 'react';

interface NFT {
  id: number; name: string; rarity: string; power: number; element: string; emoji: string;
}

const NFTS: NFT[] = [
  { id: 1, name: 'Shadow Cipher', rarity: 'Legendary', power: 98, element: 'Void', emoji: '⚡' },
  { id: 2, name: 'Iron Sentinel', rarity: 'Epic', power: 82, element: 'Metal', emoji: '🛡️' },
  { id: 3, name: 'Storm Seeker', rarity: 'Rare', power: 74, element: 'Lightning', emoji: '⚔️' },
  { id: 4, name: 'Flame Warden', rarity: 'Epic', power: 86, element: 'Fire', emoji: '🔥' },
  { id: 5, name: 'Frost Knight', rarity: 'Rare', power: 71, element: 'Ice', emoji: '❄️' },
  { id: 6, name: 'Neon Phantom', rarity: 'Legendary', power: 95, element: 'Cyber', emoji: '👾' },
  { id: 7, name: 'Arc Breaker', rarity: 'Common', power: 55, element: 'Thunder', emoji: '⚡' },
  { id: 8, name: 'Terra Golem', rarity: 'Rare', power: 68, element: 'Earth', emoji: '🌍' },
];

const RARITY_COLOR: Record<string, string> = {
  Legendary: 'var(--acid)', Epic: '#a855f7', Rare: 'var(--sky)', Common: 'var(--mid)',
};
const RARITY_ORDER = ['Legendary', 'Epic', 'Rare', 'Common'];

type Filter = 'all' | 'legendary' | 'epic' | 'rare' | 'common';

const NFTCard = memo(function NFTCard({ nft, onClick }: { nft: NFT; onClick: () => void }) {
  const color = RARITY_COLOR[nft.rarity];
  return (
    <div
      className="nft-card"
      onClick={onClick}
      onKeyDown={e => e.key === 'Enter' && onClick()}
      tabIndex={0}
      role="button"
      aria-label={`View ${nft.name}`}
    >
      <div className="nft-art">{nft.emoji}</div>
      <div className="nft-info">
        <div className="nft-name">{nft.name}</div>
        <div className="nft-id">#{nft.id.toString().padStart(4, '0')}</div>
        <div className="nft-tags">
          <span className="nft-tag" style={{ color, borderColor: color + '44' }}>{nft.rarity}</span>
          <span className="nft-tag">PWR {nft.power}</span>
          <span className="nft-tag">{nft.element}</span>
        </div>
      </div>
    </div>
  );
});

function NFTModal({ nft, onClose }: { nft: NFT; onClose: () => void }) {
  // Close on Escape
  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', handler);
    document.body.style.overflow = 'hidden';
    return () => { document.removeEventListener('keydown', handler); document.body.style.overflow = ''; };
  }, [onClose]);

  const color = RARITY_COLOR[nft.rarity];

  return (
    <div
      className="nft-modal-bg"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label={nft.name}
    >
      <div className="nft-modal" onClick={e => e.stopPropagation()}>
        <button className="nft-modal-close" onClick={onClose} aria-label="Close">✕</button>
        <div className="nft-modal-art">{nft.emoji}</div>
        <div className="nft-modal-body">
          <div className="nft-modal-name">{nft.name}</div>
          <div className="nft-modal-id">#{nft.id.toString().padStart(4, '0')} · ArenaChampion ERC-721</div>
          <div className="nft-modal-attrs">
            {[['Rarity', nft.rarity], ['Power', nft.power.toString()], ['Element', nft.element]].map(([k, v]) => (
              <div key={k} className="nft-attr">
                <div className="nft-attr-key">{k}</div>
                <div className="nft-attr-val" style={k === 'Rarity' ? { color } : {}}>{v}</div>
              </div>
            ))}
          </div>
          <div className="nft-modal-actions">
            <a href={`https://opensea.io/assets/base/0x68f08b005b09B0F7D07E1c0B5CDe18E43CE2486A/${nft.id}`} target="_blank" rel="noopener noreferrer">
              <button className="btn btn-outline">OpenSea ↗</button>
            </a>
            <a href={`https://basescan.org/token/0x68f08b005b09B0F7D07E1c0B5CDe18E43CE2486A?a=${nft.id}`} target="_blank" rel="noopener noreferrer">
              <button className="btn btn-ghost">BaseScan ↗</button>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function NFTSection() {
  const [filter, setFilter] = useState<Filter>('all');
  const [selected, setSelected] = useState<NFT | null>(null);
  const [sort, setSort] = useState<'id' | 'power' | 'rarity'>('id');

  const filtered = NFTS
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
        <div className="sec-label reveal">ArenaChampion · ERC-721</div>
        <div className="sec-title reveal">NFT<br />GALLERY</div>

        <div className="nft-controls reveal">
          <div className="nft-filters">
            {FILTERS.map(f => (
              <button
                key={f.value}
                className={`nft-filter-btn ${filter === f.value ? 'active' : ''}`}
                onClick={() => setFilter(f.value)}
              >
                {f.label}
              </button>
            ))}
          </div>
          <div className="nft-sort-row">
            <span className="nft-count">{filtered.length} NFTs</span>
            <select
              className="nft-sort"
              value={sort}
              onChange={e => setSort(e.target.value as typeof sort)}
              aria-label="Sort NFTs"
            >
              <option value="id">Sort: ID</option>
              <option value="power">Sort: Power ↓</option>
              <option value="rarity">Sort: Rarity</option>
            </select>
          </div>
        </div>

        <div className="nft-grid reveal">
          {filtered.map(nft => (
            <NFTCard key={nft.id} nft={nft} onClick={() => setSelected(nft)} />
          ))}
          {filtered.length === 0 && (
            <div style={{ gridColumn: '1/-1', textAlign: 'center', padding: '48px 24px', fontFamily: 'var(--ff-m)', fontSize: '.72rem', color: 'var(--dim)' }}>
              No NFTs match this filter.
            </div>
          )}
        </div>
      </section>

      {selected && <NFTModal nft={selected} onClose={() => setSelected(null)} />}
    </>
  );
}
