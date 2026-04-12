import { useState } from 'react';

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

const rarityColor: Record<string, string> = {
  Legendary: 'var(--acid)', Epic: '#a855f7', Rare: 'var(--sky)', Common: 'var(--mid)',
};

export default function NFTSection() {
  const [filter, setFilter] = useState<'all' | 'legendary' | 'epic' | 'rare'>('all');
  const [selected, setSelected] = useState<NFT | null>(null);

  const filtered = filter === 'all' ? NFTS : NFTS.filter(n => n.rarity.toLowerCase() === filter);

  return (
    <>
      <section id="gallery" className="z nft-section">
        <div className="sec-label reveal">ArenaChampion · ERC-721</div>
        <div className="sec-title reveal">NFT<br />GALLERY</div>

        <div style={{ display:'flex', alignItems:'center', gap:12, marginBottom:40, flexWrap:'wrap' }} className="reveal">
          {(['all','legendary','epic','rare'] as const).map(f => (
            <button
              key={f}
              className={`nft-filter ${filter === f ? 'active' : ''}`}
              onClick={() => setFilter(f)}
              style={{ fontFamily:'var(--ff-m)', fontSize:'.62rem', color: filter===f ? 'var(--acid)' : 'var(--mid)', border:`1px solid ${filter===f?'rgba(200,255,0,.3)':'var(--border)'}`, padding:'7px 16px', borderRadius:3, cursor:'pointer', transition:'all .2s', background: filter===f?'rgba(200,255,0,.04)':'transparent', letterSpacing:'.06em' }}
            >
              {f.charAt(0).toUpperCase() + f.slice(1)} {f === 'all' ? 'Champions' : ''}
            </button>
          ))}
          <span style={{ marginLeft:'auto', fontFamily:'var(--ff-m)', fontSize:'.62rem', color:'var(--dim)' }}>{filtered.length} NFTs</span>
        </div>

        <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(230px,1fr))', gap:16, maxWidth:1200 }} className="reveal">
          {filtered.map(nft => (
            <div
              key={nft.id}
              onClick={() => setSelected(nft)}
              style={{ background:'var(--card)', border:'1px solid var(--border)', borderRadius:8, overflow:'hidden', transition:'border-color .3s,transform .3s', cursor:'pointer' }}
              onMouseEnter={e => { (e.currentTarget as HTMLElement).style.borderColor = 'rgba(200,255,0,.25)'; (e.currentTarget as HTMLElement).style.transform = 'translateY(-4px)'; }}
              onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor = 'var(--border)'; (e.currentTarget as HTMLElement).style.transform = 'none'; }}
            >
              <div style={{ aspectRatio:'1', background:'linear-gradient(135deg,var(--ink),#0d1526)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'4rem' }}>
                {nft.emoji}
              </div>
              <div style={{ padding:16 }}>
                <div style={{ fontFamily:'var(--ff-d)', fontSize:'1.25rem', letterSpacing:'.04em', marginBottom:3 }}>{nft.name}</div>
                <div style={{ fontFamily:'var(--ff-m)', fontSize:'.56rem', color:'var(--dim)', letterSpacing:'.06em', marginBottom:10 }}>#{nft.id.toString().padStart(4,'0')}</div>
                <div style={{ display:'flex', flexWrap:'wrap', gap:5 }}>
                  <span style={{ fontFamily:'var(--ff-m)', fontSize:'.53rem', color:rarityColor[nft.rarity], border:`1px solid ${rarityColor[nft.rarity]}33`, padding:'3px 7px', borderRadius:2 }}>{nft.rarity}</span>
                  <span style={{ fontFamily:'var(--ff-m)', fontSize:'.53rem', color:'var(--mid)', border:'1px solid var(--border)', padding:'3px 7px', borderRadius:2 }}>PWR {nft.power}</span>
                  <span style={{ fontFamily:'var(--ff-m)', fontSize:'.53rem', color:'var(--mid)', border:'1px solid var(--border)', padding:'3px 7px', borderRadius:2 }}>{nft.element}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Modal */}
      {selected && (
        <div style={{ display:'flex', position:'fixed', inset:0, zIndex:400, background:'rgba(4,7,14,.9)', backdropFilter:'blur(12px)', alignItems:'center', justifyContent:'center', padding:24 }} onClick={() => setSelected(null)}>
          <div style={{ position:'relative', maxWidth:560, width:'100%' }} onClick={e => e.stopPropagation()}>
            <button onClick={() => setSelected(null)} style={{ position:'absolute', top:-14, right:-14, zIndex:1, background:'var(--card)', border:'1px solid var(--border)', color:'var(--mid)', width:32, height:32, borderRadius:'50%', cursor:'pointer', fontSize:'1rem', display:'flex', alignItems:'center', justifyContent:'center' }}>✕</button>
            <div style={{ background:'var(--card)', border:'1px solid rgba(200,255,0,.18)', borderRadius:12, overflow:'hidden' }}>
              <div style={{ aspectRatio:'1', width:'100%', background:'linear-gradient(135deg,var(--ink),#0d1526)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'6rem', maxHeight:300 }}>
                {selected.emoji}
              </div>
              <div style={{ padding:28 }}>
                <div style={{ fontFamily:'var(--ff-d)', fontSize:'2.2rem', letterSpacing:'.04em', marginBottom:5 }}>{selected.name}</div>
                <div style={{ fontFamily:'var(--ff-m)', fontSize:'.62rem', color:'var(--mid)', letterSpacing:'.06em', marginBottom:22 }}>
                  #{selected.id.toString().padStart(4,'0')} · ArenaChampion ERC-721
                </div>
                <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:8, marginBottom:22 }}>
                  {[['Rarity', selected.rarity],['Power', selected.power.toString()],['Element', selected.element]].map(([k,v]) => (
                    <div key={k} style={{ background:'rgba(200,255,0,.03)', border:'1px solid rgba(200,255,0,.1)', borderRadius:4, padding:'10px 12px' }}>
                      <div style={{ fontFamily:'var(--ff-m)', fontSize:'.52rem', color:'var(--mid)', letterSpacing:'.1em', textTransform:'uppercase', marginBottom:3 }}>{k}</div>
                      <div style={{ fontFamily:'var(--ff-m)', fontSize:'.72rem', color:'var(--text)' }}>{v}</div>
                    </div>
                  ))}
                </div>
                <div style={{ display:'flex', gap:10 }}>
                  <a href={`https://opensea.io/assets/base/0x68f08b005b09B0F7D07E1c0B5CDe18E43CE2486A/${selected.id}`} target="_blank" rel="noopener noreferrer">
                    <button className="btn btn-outline">OpenSea ↗</button>
                  </a>
                  <a href={`https://basescan.org/token/0x68f08b005b09B0F7D07E1c0B5CDe18E43CE2486A?a=${selected.id}`} target="_blank" rel="noopener noreferrer">
                    <button className="btn btn-ghost">BaseScan ↗</button>
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
