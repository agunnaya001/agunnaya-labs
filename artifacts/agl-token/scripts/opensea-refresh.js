/**
 * opensea-refresh.js
 * ───────────────────────────────────────────────────────────────
 * Uses the OpenSea API to refresh NFT metadata for all minted
 * Arena Champion NFTs so they display correctly on OpenSea.
 *
 * USAGE:
 *   Ensure OPENSEA_API_KEY is in your .env, then:
 *
 *     node scripts/opensea-refresh.js
 *
 * WHAT IT DOES:
 *   1. Reads contract address from nft-metadata.json (if available)
 *   2. Triggers metadata refresh for each minted NFT via OpenSea API
 *   3. Optionally fetches collection status and floor price
 *   4. Logs all OpenSea URLs for quick access
 *
 * NOTES:
 *   - OpenSea indexes Base Mainnet automatically after minting
 *   - It can take 10–30 minutes for NFTs to appear after first mint
 *   - Refresh forces OpenSea to re-read your IPFS metadata
 *   - Rate limit: 1 request/second on most API tiers
 * ───────────────────────────────────────────────────────────────
 */

require("dotenv").config();
const fs = require("fs");
const path = require("path");

const OPENSEA_API_KEY = process.env.OPENSEA_API_KEY;
const CHAIN           = "base";
const META_PATH       = path.join(__dirname, "..", "nft-metadata.json");

const OLD_CONTRACT    = "0x68f08b005b09B0F7D07E1c0B5CDe18E43CE2486A";
const V2_CONTRACT     = process.env.ARENA_CHAMPION_V2 || "";

if (!OPENSEA_API_KEY) {
  console.error("\n[ERROR] OPENSEA_API_KEY not set in .env");
  process.exit(1);
}

function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

async function openSeaGet(path_) {
  const res = await fetch(`https://api.opensea.io/api/v2${path_}`, {
    headers: { accept: "application/json", "x-api-key": OPENSEA_API_KEY },
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`${res.status}: ${text.slice(0, 200)}`);
  }
  return res.json();
}

async function openSeaRefresh(contract, tokenId) {
  const res = await fetch(
    `https://api.opensea.io/api/v2/chain/${CHAIN}/contract/${contract}/nfts/${tokenId}/refresh`,
    {
      method: "POST",
      headers: {
        accept: "application/json",
        "content-type": "application/json",
        "x-api-key": OPENSEA_API_KEY,
      },
    }
  );
  return { status: res.status, ok: res.ok };
}

async function getCollectionStatus(slug) {
  try {
    const data = await openSeaGet(`/collections/${slug}`);
    return data;
  } catch {
    return null;
  }
}

async function getNFTsForContract(contract) {
  try {
    const data = await openSeaGet(`/chain/${CHAIN}/contract/${contract}/nfts?limit=50`);
    return data.nfts || [];
  } catch {
    return [];
  }
}

async function main() {
  console.log("\n╔══════════════════════════════════════════════════════╗");
  console.log("║     OPENSEA — REFRESH ARENA CHAMPION NFTs            ║");
  console.log("╚══════════════════════════════════════════════════════╝\n");

  // Determine contract(s) to use
  let contracts = [];

  // Check V2 from metadata
  if (fs.existsSync(META_PATH)) {
    const meta = JSON.parse(fs.readFileSync(META_PATH, "utf8"));
    if (meta.contractAddress && meta.contractAddress !== "<CONTRACT>") {
      contracts.push({ address: meta.contractAddress, label: "ArenaChampionV2", nfts: meta.nfts || [] });
    }
  }

  // Always include old contract if it has mints
  contracts.push({ address: OLD_CONTRACT, label: "ArenaChampion (V1)", nfts: [] });

  console.log(`API Key  : ${OPENSEA_API_KEY.slice(0, 8)}...`);
  console.log(`Chain    : ${CHAIN}`);
  console.log(`Contracts: ${contracts.map(c => c.label).join(", ")}\n`);

  for (const { address, label, nfts } of contracts) {
    console.log(`\n── ${label} (${address}) ─────────────────────────`);

    // Get NFTs from OpenSea
    console.log("  Fetching minted NFTs from OpenSea...");
    const openSeaNFTs = await getNFTsForContract(address);
    console.log(`  Found ${openSeaNFTs.length} NFTs indexed on OpenSea`);

    if (openSeaNFTs.length === 0 && nfts.length === 0) {
      console.log("  ℹ  No NFTs found. They may not be minted yet, or OpenSea needs time to index.");
      console.log(`     Collection URL: https://opensea.io/assets/base/${address}`);
      continue;
    }

    // Determine which token IDs to refresh
    const tokenIds = openSeaNFTs.length > 0
      ? openSeaNFTs.map(n => parseInt(n.identifier, 10))
      : nfts.map(n => n.id);

    if (tokenIds.length === 0) {
      console.log("  ℹ  No token IDs to refresh.");
      continue;
    }

    console.log(`\n  Refreshing metadata for ${tokenIds.length} NFTs...\n`);

    const results = [];
    for (let i = 0; i < tokenIds.length; i++) {
      const tokenId = tokenIds[i];
      process.stdout.write(`  [${i + 1}/${tokenIds.length}] Token #${tokenId}... `);
      try {
        const r = await openSeaRefresh(address, tokenId);
        const ok = r.ok || r.status === 200 || r.status === 202;
        console.log(ok ? `✓ (${r.status})` : `⚠ (${r.status})`);
        results.push({ tokenId, ok, status: r.status });
        await sleep(1100); // Rate limit: 1 req/sec
      } catch (err) {
        console.log(`✗ ${err.message?.slice(0, 60)}`);
        results.push({ tokenId, ok: false, status: 0 });
      }
    }

    const success = results.filter(r => r.ok).length;
    console.log(`\n  ✓ Refreshed ${success}/${results.length} NFTs`);
    console.log(`  View collection: https://opensea.io/assets/base/${address}`);

    // Show individual NFT URLs
    console.log("\n  NFT URLS:");
    tokenIds.forEach(id => {
      console.log(`    Token #${id}: https://opensea.io/assets/base/${address}/${id}`);
    });
  }

  // Check collection status
  console.log("\n── Collection Status ─────────────────────────────────");
  const collection = await getCollectionStatus("arena-champion");
  if (collection) {
    console.log(`  Name         : ${collection.name || "—"}`);
    console.log(`  Total Supply : ${collection.total_supply ?? "—"}`);
    console.log(`  OpenSea      : https://opensea.io/collection/arena-champion`);
  } else {
    console.log("  Collection not yet indexed on OpenSea.");
    console.log("  NFTs will appear 10–30 minutes after first mint.");
  }

  console.log("\n╔══════════════════════════════════════════════════════╗");
  console.log("  DONE. OpenSea typically updates within 5–15 minutes.");
  console.log("  Tip: Visit each NFT URL and click 'Refresh Metadata'");
  console.log("╚══════════════════════════════════════════════════════╝\n");
}

main().catch(err => {
  console.error("\n[ERROR]", err.message);
  process.exit(1);
});
