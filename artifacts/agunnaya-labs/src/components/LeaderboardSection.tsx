import { useState, useEffect, useCallback, memo } from 'react';

interface Player {
  rank: number; address: string; wins: number; losses: number; rate: number; volume: string;
}

const PodiumCard = memo(function PodiumCard({ player, pos }: { player: Player; pos: 1|2|3 }) {
  return (
    <div className={`podium-card rank-${pos}`}>
      {pos === 1 && <span className="podium-crown">👑</span>}
      <div className="podium-rank">{pos === 1 ? '🥇' : pos === 2 ? '🥈' : '🥉'}</div>
      <div className="podium-addr">{player.address}</div>
      <div className="podium-wins">{player.wins}</div>
      <div className="podium-wl">{player.wins}W · {player.losses}L</div>
    </div>
  );
});

function PodiumSkeleton() {
  return (
    <div className="lb-podium">
      {[180, 220, 160].map((h, i) => (
        <div key={i} style={{ height: h, background: 'var(--border)', borderRadius: 8, animation: `pulse 1.4s ease-in-out ${i * 120}ms infinite` }} />
      ))}
    </div>
  );
}

export default function LeaderboardSection() {
  const [players, setPlayers] = useState<Player[]>([]);
  const [loading, setLoading] = useState(true);
  const [spinning, setSpinning] = useState(false);
  const [status, setStatus] = useState('Loading…');
  const [error, setError] = useState('');

  const load = useCallback(async (refresh = false) => {
    if (refresh) setSpinning(true);
    setStatus('Reading chain…');
    setError('');
    try {
      const res = await fetch('/api/leaderboard');
      const data = await res.json() as { ok: boolean; players: Player[] };
      if (data.ok && data.players.length > 0) {
        setPlayers(data.players);
        setStatus(`Live · ${new Date().toLocaleTimeString()}`);
      } else {
        setPlayers([]);
        setStatus('No battles recorded yet');
      }
    } catch {
      setError('Could not load leaderboard — check your connection.');
      setStatus('Error loading');
    } finally {
      setLoading(false);
      setSpinning(false);
    }
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
          <button
            className={`lb-refresh-btn ${spinning ? 'spinning' : ''}`}
            onClick={() => load(true)}
            disabled={spinning || loading}
            aria-label="Refresh leaderboard"
          >
            ↻ Refresh
          </button>
          <span>ArenaBattle Contract · Base Mainnet</span>
        </div>
      </div>

      {error && (
        <div style={{ fontFamily: 'var(--ff-m)', fontSize: '.68rem', color: 'var(--red)', marginBottom: 24, padding: '12px 16px', border: '1px solid rgba(239,68,68,.2)', borderRadius: 6 }}>
          {error}
        </div>
      )}

      {loading ? (
        <PodiumSkeleton />
      ) : top3.length >= 3 ? (
        <div className="lb-podium">
          <PodiumCard player={top3[1]} pos={2} />
          <PodiumCard player={top3[0]} pos={1} />
          <PodiumCard player={top3[2]} pos={3} />
        </div>
      ) : players.length > 0 ? (
        <div className="lb-podium">
          {players.slice(0, Math.min(3, players.length)).map((p, i) => (
            <PodiumCard key={p.rank} player={p} pos={(i + 1) as 1|2|3} />
          ))}
        </div>
      ) : (
        <div className="lb-empty-state reveal">
          <div style={{ fontSize: '3rem', marginBottom: 16 }}>⚔️</div>
          <div style={{ fontFamily: 'var(--ff-d)', fontSize: '1.4rem', marginBottom: 10, color: 'var(--text)' }}>NO BATTLES YET</div>
          <p style={{ fontFamily: 'var(--ff-m)', fontSize: '.7rem', color: 'var(--mid)', maxWidth: 380, margin: '0 auto 24px' }}>
            The Arena is live on Base mainnet — be the first to battle and claim the top spot.
          </p>
          <a href="https://basescan.org/address/0xF6fc2B6a306B626548ca9dF25B31a22D0f8971CF" target="_blank" rel="noopener noreferrer">
            <button className="btn btn-acid">View Contract on BaseScan ↗</button>
          </a>
        </div>
      )}

      {rest.length > 0 && (
        <div style={{ overflowX: 'auto' }} className="reveal">
          <table className="lb-table" style={{ minWidth: 480 }}>
            <thead>
              <tr>
                <th>#</th><th>Champion</th><th>Wins</th><th>Losses</th><th>Win Rate</th><th>Volume</th>
              </tr>
            </thead>
            <tbody>
              {rest.map(p => (
                <tr key={p.rank}>
                  <td><div className={`lb-rank-cell ${p.rank <= 3 ? 'top3' : ''}`}>{p.rank}</div></td>
                  <td>
                    <a href={`https://basescan.org/address/${p.address}`} target="_blank" rel="noopener noreferrer" className="lb-addr">{p.address}</a>
                  </td>
                  <td><span className="lb-wins">{p.wins}</span></td>
                  <td><span className="lb-losses">{p.losses}</span></td>
                  <td>
                    <div className="lb-rate-bar">
                      <div className="lb-bar-track"><div className="lb-bar-fill" style={{ width: p.rate + '%' }} /></div>
                      <span className="lb-rate-pct">{p.rate}%</span>
                    </div>
                  </td>
                  <td><span style={{ fontFamily: 'var(--ff-m)', fontSize: '.65rem', color: 'var(--mid)' }}>{p.volume} AT</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}
