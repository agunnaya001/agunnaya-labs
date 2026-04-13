import { Router } from "express";
import { logger } from "../lib/logger";

const router = Router();

const ARENA_CHAMPION = "0x68f08b005b09B0F7D07E1c0B5CDe18E43CE2486A";
const BASESCAN_KEY = process.env.BASESCAN_API_KEY ?? "";

interface NFTItem {
  id: number;
  owner: string;
  name: string;
  rarity: string;
  power: number;
  element: string;
  emoji: string;
  mintedAt: string;
}

const RARITIES = ["Legendary", "Epic", "Rare", "Common"];
const ELEMENTS = ["Void", "Metal", "Lightning", "Fire", "Ice", "Cyber", "Thunder", "Earth", "Shadow", "Storm"];
const EMOJIS = ["⚡", "🛡️", "⚔️", "🔥", "❄️", "👾", "🌪️", "🌍", "🌑", "🌊"];
const NAMES = [
  "Shadow Cipher", "Iron Sentinel", "Storm Seeker", "Flame Warden", "Frost Knight",
  "Neon Phantom", "Arc Breaker", "Terra Golem", "Void Walker", "Storm Blade",
  "Cyber Wraith", "Lava Knight", "Ice Tyrant", "Thunder Drake", "Dark Pulse",
];

function deriveAttributes(tokenId: number): Omit<NFTItem, "id" | "owner" | "mintedAt"> {
  const seed = tokenId * 2654435761; // Knuth multiplicative hash
  const rarityIdx = Math.abs(seed % 100) < 5 ? 0 : Math.abs(seed % 100) < 20 ? 1 : Math.abs(seed % 100) < 50 ? 2 : 3;
  const power = rarityIdx === 0 ? 90 + (seed % 10) : rarityIdx === 1 ? 75 + (seed % 15) : rarityIdx === 2 ? 60 + (seed % 15) : 40 + (seed % 20);
  const nameIdx = tokenId % NAMES.length;
  const elemIdx = tokenId % ELEMENTS.length;
  const emojiIdx = tokenId % EMOJIS.length;
  return {
    name: NAMES[nameIdx],
    rarity: RARITIES[rarityIdx],
    power: Math.abs(power),
    element: ELEMENTS[elemIdx],
    emoji: EMOJIS[emojiIdx],
  };
}

async function fetchNFTs(): Promise<NFTItem[]> {
  const ZERO = "0x0000000000000000000000000000000000000000";
  const url = `https://api.basescan.org/api?module=account&action=tokennfttx&contractaddress=${ARENA_CHAMPION}&sort=desc&offset=100&page=1&apikey=${BASESCAN_KEY}`;
  const res = await fetch(url);
  const data = (await res.json()) as {
    status: string;
    result: Array<{ from: string; to: string; tokenID: string; timeStamp: string }>;
  };

  if (data.status !== "1" || !Array.isArray(data.result) || data.result.length === 0) {
    return [];
  }

  // Latest transfer per tokenID (owner is most recent "to")
  const seen = new Map<number, { owner: string; ts: number }>();
  for (const tx of data.result) {
    const id = parseInt(tx.tokenID, 10);
    const ts = parseInt(tx.timeStamp, 10);
    if (!seen.has(id) || ts > seen.get(id)!.ts) {
      seen.set(id, { owner: tx.to.toLowerCase(), ts });
    }
  }

  // Mints (from = zero address) for display
  const mints: NFTItem[] = [];
  for (const tx of data.result) {
    if (tx.from.toLowerCase() === ZERO.toLowerCase()) {
      const id = parseInt(tx.tokenID, 10);
      const current = seen.get(id);
      const owner = current?.owner ?? tx.to.toLowerCase();
      const attrs = deriveAttributes(id);
      const date = new Date(parseInt(tx.timeStamp, 10) * 1000);
      mints.push({
        id,
        owner: owner.slice(0, 6) + "…" + owner.slice(-4),
        mintedAt: date.toLocaleDateString(),
        ...attrs,
      });
    }
  }

  // Deduplicate by id, keep first occurrence, sort by id
  const unique = Array.from(new Map(mints.map(n => [n.id, n])).values()).sort((a, b) => a.id - b.id);
  return unique;
}

let cache: { data: NFTItem[]; ts: number } | null = null;

router.get("/nfts", async (_req, res) => {
  try {
    const now = Date.now();
    if (cache && now - cache.ts < 120_000) {
      return res.json({ ok: true, nfts: cache.data, source: "cache" });
    }
    const nfts = await fetchNFTs();
    cache = { data: nfts, ts: now };
    return res.json({ ok: true, nfts, source: "live" });
  } catch (err) {
    logger.error({ err }, "nfts fetch failed");
    return res.status(500).json({ ok: false, nfts: [], error: "fetch failed" });
  }
});

export default router;
