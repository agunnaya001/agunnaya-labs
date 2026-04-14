import { Router } from "express";
import { logger } from "../lib/logger";

const router = Router();

const OPENSEA_API_KEY   = process.env.OPENSEA_API_KEY ?? "";
const CHAIN             = "base";
const OLD_CONTRACT      = "0x68f08b005b09B0F7D07E1c0B5CDe18E43CE2486A";

// Genesis NFTs with IPFS metadata — token IDs assigned after minting
const GENESIS_NFTS = [
  { id: 1, name: "Shadow Cipher",  rarity: "Legendary", power: 98, element: "Void" },
  { id: 2, name: "Iron Sentinel",  rarity: "Epic",       power: 82, element: "Metal" },
  { id: 3, name: "Storm Seeker",   rarity: "Rare",       power: 74, element: "Lightning" },
  { id: 4, name: "Flame Warden",   rarity: "Epic",       power: 86, element: "Fire" },
  { id: 5, name: "Frost Knight",   rarity: "Rare",       power: 71, element: "Ice" },
  { id: 6, name: "Neon Phantom",   rarity: "Legendary",  power: 95, element: "Cyber" },
  { id: 7, name: "Arc Breaker",    rarity: "Common",     power: 55, element: "Thunder" },
  { id: 8, name: "Terra Golem",    rarity: "Rare",       power: 68, element: "Earth" },
];

function openSeaHeaders() {
  return {
    "accept": "application/json",
    "content-type": "application/json",
    "x-api-key": OPENSEA_API_KEY,
  };
}

async function openSeaGet(path: string) {
  const res = await fetch(`https://api.opensea.io/api/v2${path}`, {
    method: "GET",
    headers: openSeaHeaders(),
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`OpenSea API ${res.status}: ${text.slice(0, 200)}`);
  }
  return res.json();
}

async function openSeaPost(path: string, body?: object) {
  const res = await fetch(`https://api.opensea.io/api/v2${path}`, {
    method: "POST",
    headers: openSeaHeaders(),
    body: body ? JSON.stringify(body) : undefined,
  });
  return { status: res.status, ok: res.ok, body: await res.text() };
}

// ── GET /api/opensea/status ────────────────────────────────────
// Returns NFT count and metadata for the ArenaChampion contract
router.get("/opensea/status", async (req, res) => {
  const contract = (req.query.contract as string) || OLD_CONTRACT;

  if (!OPENSEA_API_KEY) {
    return res.status(400).json({ ok: false, error: "OPENSEA_API_KEY not set" });
  }

  try {
    const data = await openSeaGet(
      `/chain/${CHAIN}/contract/${contract}/nfts?limit=50`
    ) as { nfts?: Array<{ identifier: string; name: string; image_url: string; metadata_url: string }> };

    const nfts = (data.nfts || []).map((n) => ({
      tokenId: n.identifier,
      name: n.name || "—",
      image: n.image_url || null,
      metadataUrl: n.metadata_url || null,
      openSeaUrl: `https://opensea.io/assets/base/${contract}/${n.identifier}`,
    }));

    return res.json({
      ok: true,
      contract,
      count: nfts.length,
      nfts,
      collectionUrl: `https://opensea.io/assets/base/${contract}`,
    });
  } catch (err) {
    logger.error({ err }, "opensea status failed");
    return res.status(500).json({ ok: false, error: String(err) });
  }
});

// ── POST /api/opensea/refresh ──────────────────────────────────
// Refreshes metadata for all minted NFTs (or specific token IDs)
router.post("/opensea/refresh", async (req, res) => {
  const contract  = (req.body?.contract as string) || OLD_CONTRACT;
  const tokenIds  = (req.body?.tokenIds as number[]) || GENESIS_NFTS.map((n) => n.id);

  if (!OPENSEA_API_KEY) {
    return res.status(400).json({ ok: false, error: "OPENSEA_API_KEY not set" });
  }

  logger.info({ contract, tokenIds }, "opensea refresh triggered");

  const results: Array<{
    tokenId: number;
    status: number;
    ok: boolean;
    openSeaUrl: string;
  }> = [];

  for (const tokenId of tokenIds) {
    try {
      const r = await openSeaPost(
        `/chain/${CHAIN}/contract/${contract}/nfts/${tokenId}/refresh`
      );
      results.push({
        tokenId,
        status: r.status,
        ok: r.ok || r.status === 200 || r.status === 202,
        openSeaUrl: `https://opensea.io/assets/base/${contract}/${tokenId}`,
      });
      logger.info({ tokenId, status: r.status }, "opensea refresh sent");
      // Respect OpenSea rate limits (1 req/sec on free tier)
      await new Promise((r) => setTimeout(r, 1100));
    } catch (err) {
      results.push({
        tokenId,
        status: 0,
        ok: false,
        openSeaUrl: `https://opensea.io/assets/base/${contract}/${tokenId}`,
      });
      logger.error({ err, tokenId }, "opensea refresh failed");
    }
  }

  const successCount = results.filter((r) => r.ok).length;

  return res.json({
    ok: true,
    contract,
    refreshed: successCount,
    total: results.length,
    results,
    message: `Refreshed ${successCount}/${results.length} NFTs on OpenSea`,
  });
});

// ── GET /api/opensea/collection ────────────────────────────────
// Returns collection-level metadata from OpenSea
router.get("/opensea/collection", async (req, res) => {
  const slug = (req.query.slug as string) || "arena-champion";

  if (!OPENSEA_API_KEY) {
    return res.status(400).json({ ok: false, error: "OPENSEA_API_KEY not set" });
  }

  try {
    const data = await openSeaGet(`/collections/${slug}`) as {
      name?: string;
      description?: string;
      image_url?: string;
      total_supply?: number;
      floor_price?: { unit: string; quantity: string };
      stats?: { total_volume: number; floor_price: number; num_owners: number };
    };

    return res.json({
      ok: true,
      name: data.name,
      description: data.description,
      image: data.image_url,
      totalSupply: data.total_supply,
      floorPrice: data.floor_price,
      stats: data.stats,
      openSeaUrl: `https://opensea.io/collection/${slug}`,
    });
  } catch (err) {
    logger.warn({ err }, "opensea collection fetch failed");
    return res.status(404).json({ ok: false, error: "Collection not found or not indexed yet" });
  }
});

export default router;
