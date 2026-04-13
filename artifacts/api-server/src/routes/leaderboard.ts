import { Router } from "express";
import { logger } from "../lib/logger";

const router = Router();

const ARENA_TOKEN = "0x3b855F88CB93aA642EaEB13F59987C552Fc614b5";
const ARENA_BATTLE = "0xF6fc2B6a306B626548ca9dF25B31a22D0f8971CF";
const BASESCAN_KEY = process.env.BASESCAN_API_KEY ?? "";

interface Player {
  rank: number;
  address: string;
  wins: number;
  losses: number;
  rate: number;
  volume: string;
}

async function fetchLeaderboard(): Promise<Player[]> {
  // Fetch ArenaToken ERC-20 transfers — tokens are sent to winners of battles
  const url = `https://api.basescan.org/api?module=account&action=tokentx&contractaddress=${ARENA_TOKEN}&sort=desc&offset=200&page=1&apikey=${BASESCAN_KEY}`;
  const res = await fetch(url);
  const data = (await res.json()) as {
    status: string;
    result: Array<{ from: string; to: string; value: string; tokenDecimal: string }>;
  };

  if (data.status !== "1" || !Array.isArray(data.result) || data.result.length === 0) {
    // No battles yet — return empty to let frontend handle it
    return [];
  }

  // Aggregate wins per address (receiving ArenaToken = winning a battle)
  const stats: Record<string, { wins: number; losses: number; vol: bigint }> = {};
  const ZERO = "0x0000000000000000000000000000000000000000";

  for (const tx of data.result) {
    const to = tx.to.toLowerCase();
    const from = tx.from.toLowerCase();
    // Mint to winner (from arena battle contract or zero address)
    if (to !== ZERO && to !== ARENA_BATTLE.toLowerCase()) {
      if (!stats[to]) stats[to] = { wins: 0, losses: 0, vol: 0n };
      stats[to].wins++;
      stats[to].vol += BigInt(tx.value);
    }
    // Losses are burns / sends back to contract
    if (from !== ZERO && from !== ARENA_BATTLE.toLowerCase() && to === ARENA_BATTLE.toLowerCase()) {
      if (!stats[from]) stats[from] = { wins: 0, losses: 0, vol: 0n };
      stats[from].losses++;
    }
  }

  const sorted = Object.entries(stats)
    .sort(([, a], [, b]) => b.wins - a.wins)
    .slice(0, 10);

  return sorted.map(([addr, s], i) => {
    const total = s.wins + s.losses;
    const rate = total > 0 ? Math.round((s.wins / total) * 100) : 0;
    const volEth = Number(s.vol) / 1e18;
    return {
      rank: i + 1,
      address: addr.slice(0, 6) + "…" + addr.slice(-4),
      wins: s.wins,
      losses: s.losses,
      rate,
      volume: volEth.toFixed(2),
    };
  });
}

// Cache result for 60 seconds
let cache: { data: Player[]; ts: number } | null = null;

router.get("/leaderboard", async (_req, res) => {
  try {
    const now = Date.now();
    if (cache && now - cache.ts < 60_000) {
      return res.json({ ok: true, players: cache.data, source: "cache" });
    }
    const players = await fetchLeaderboard();
    cache = { data: players, ts: now };
    return res.json({ ok: true, players, source: "live" });
  } catch (err) {
    logger.error({ err }, "leaderboard fetch failed");
    return res.status(500).json({ ok: false, players: [], error: "fetch failed" });
  }
});

export default router;
