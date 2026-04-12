import { useState, useEffect, useCallback } from 'react';

interface Player {
  rank: number; address: string; wins: number; losses: number; rate: number;
}

const MOCK_PLAYERS: Player[] = [
  { rank: 1, address: '0xDeF1…4e9a', wins: 47, losses: 8, rate: 85 },
  { rank: 2, address: '0x1a2B…8c3d', wins: 39, losses: 11, rate: 78 },
  { rank: 3, address: '0x9Fe2…2a1c', wins: 33, losses: 14, rate: 70 },
  { rank: 4, address: '0x7Bb4…5f0e', wins: 28, losses: 17, rate: 62 },
  { rank: 5, address: '0x4Cc3…1d2f', wins: 22, losses: 19, rate: 54 },
  { rank: 6, address: '0x6Aa7…9e4b', wins: 18, losses: 22, rate: 45 },
  { rank: 7, address: '0x2Ee5…3c7a', wins: 14, losses: 28, rate: 33 },
];

function PodiumCard({ player, pos }: { player: Player; pos: 1|2|3 }) {
  const rankClass = `rank-${pos}`;
  return (
    <div className={`podium-card ${rankClass}`}>
      {pos === 1 && <span className="podium-crown">👑</span>}
      <div className="podium-rank">{pos === 1 ? '🥇' : pos === 2 ? '🥈' : '🥉'}</div>
      <div className="podium-addr">{player.address}</div>
      <div className="podium-wins">{player.wins}</div>
      <div className="podium-wl">{player.wins}W · {player.losses}L</div>
    </div>
  );
}

export default function LeaderboardSection() {
  const [players, setPlayers] = useState<Player[]>([]);
  const [spinning, setSpinning] = useState(false);
  const [status, setStatus] = useState('Loading…');

  const load = useCallback(async (refresh = false) => {
    if (refresh) setSpinning(true);
    setStatus('Reading chain…');
    await new Promise(r => setTimeout(r, 600));
    setPlayers(MOCK_PLAYERS);
    setStatus(`Updated ${new Date().toLocaleTimeString()}`);
    if (refresh) setSpinning(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  const top3 = players.slice(0, 3);
  const rest = players.slice(3);

  return (
    <section id="leaderboard" className="z">
      <div className="lb-header">
        <div>
          <div className="sec-label reveal">⚔️ On-Chain Rankings</div>
          <div className="sec-title reveal" style={{ marginBottom: 0 }}>BATTLE<br />LEADERBOARD</div>
        </div>
        <div className="lb-meta">
          <span>{status}</span>
          <button className={`lb-refresh-btn ${spinning ? 'spinning' : ''}`} onClick={() => load(true)}>↻ Refresh</button>
          <span>ArenaBattle Contract · Base Mainnet</span>
        </div>
      </div>

      {top3.length === 3 ? (
        <div className="lb-podium">
          <PodiumCard player={top3[1]} pos={2} />
          <PodiumCard player={top3[0]} pos={1} />
          <PodiumCard player={top3[2]} pos={3} />
        </div>
      ) : (
        <div className="lb-podium">
          {[0,1,2].map(i => (
            <div key={i} style={{ height: i===1?220:i===0?180:160, background:'var(--border)', borderRadius:8, animation:'pulse 1.4s ease-in-out infinite' }} />
          ))}
        </div>
      )}

      <table className="lb-table reveal">
        <thead>
          <tr><th>#</th><th>Champion</th><th>Wins</th><th>Losses</th><th>Win Rate</th></tr>
        </thead>
        <tbody>
          {rest.length > 0 ? rest.map(p => (
            <tr key={p.rank}>
              <td><div className={`lb-rank-cell ${p.rank <= 3 ? 'top3' : ''}`}>{p.rank}</div></td>
              <td><span className="lb-addr">{p.address}</span></td>
              <td><span className="lb-wins">{p.wins}</span></td>
              <td><span className="lb-losses">{p.losses}</span></td>
              <td>
                <div className="lb-rate-bar">
                  <div className="lb-bar-track"><div className="lb-bar-fill" style={{ width: p.rate + '%' }} /></div>
                  <span className="lb-rate-pct">{p.rate}%</span>
                </div>
              </td>
            </tr>
          )) : (
            <tr><td colSpan={5}><div className="lb-empty">Loading leaderboard…</div></td></tr>
          )}
        </tbody>
      </table>
    </section>
  );
}
