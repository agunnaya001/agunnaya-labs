/**
 * upload-nft-metadata.js
 * Uploads all 8 genesis ArenaChampion NFT metadata files + collection info to IPFS via Pinata.
 * Run: node scripts/upload-nft-metadata.js
 */
require("dotenv").config();
const fs = require("fs");
const path = require("path");

const PINATA_JWT = process.env.PINATA_JWT;
const DEPLOYER   = "0xFfb6505912FCE95B42be4860477201bb4e204E9f";
const SITE_URL   = "https://agunnaya-labs.replit.app";

if (!PINATA_JWT) throw new Error("PINATA_JWT not set");

// ── Champions ──────────────────────────────────────────────────────────────
const CHAMPIONS = [
  { id:1, name:"Shadow Cipher",  rarity:"Legendary", power:98, element:"Void",      color:"#c8ff00", bg:"#04070e", accent:"#1a2200", emoji:"⚡" },
  { id:2, name:"Iron Sentinel",  rarity:"Epic",      power:82, element:"Metal",     color:"#a855f7", bg:"#0d0415", accent:"#1a0a24", emoji:"🛡️" },
  { id:3, name:"Storm Seeker",   rarity:"Rare",      power:74, element:"Lightning", color:"#00aaff", bg:"#00080f", accent:"#001a2e", emoji:"⚔️" },
  { id:4, name:"Flame Warden",   rarity:"Epic",      power:86, element:"Fire",      color:"#f97316", bg:"#0f0500", accent:"#1f0a00", emoji:"🔥" },
  { id:5, name:"Frost Knight",   rarity:"Rare",      power:71, element:"Ice",       color:"#67e8f9", bg:"#000d10", accent:"#001820", emoji:"❄️" },
  { id:6, name:"Neon Phantom",   rarity:"Legendary", power:95, element:"Cyber",     color:"#c8ff00", bg:"#03050a", accent:"#111800", emoji:"👾" },
  { id:7, name:"Arc Breaker",    rarity:"Common",    power:55, element:"Thunder",   color:"#7a8799", bg:"#070a0e", accent:"#111518", emoji:"⚡" },
  { id:8, name:"Terra Golem",    rarity:"Rare",      power:68, element:"Earth",     color:"#22c55e", bg:"#010802", accent:"#051005", emoji:"🌍" },
];

// ── SVG Card Image ─────────────────────────────────────────────────────────
function makeSVG(c) {
  const rarityGlow = c.rarity === "Legendary" ? `<filter id="glow"><feGaussianBlur stdDeviation="3" result="coloredBlur"/><feMerge><feMergeNode in="coloredBlur"/><feMergeNode in="SourceGraphic"/></feMerge></filter>` : "";
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 400" width="400" height="400">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="${c.bg}"/>
      <stop offset="100%" stop-color="${c.accent}"/>
    </linearGradient>
    <linearGradient id="border" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="${c.color}" stop-opacity="0.8"/>
      <stop offset="100%" stop-color="${c.color}" stop-opacity="0.1"/>
    </linearGradient>
    ${rarityGlow}
  </defs>
  <!-- Background -->
  <rect width="400" height="400" fill="url(#bg)" rx="16"/>
  <!-- Border -->
  <rect x="2" y="2" width="396" height="396" fill="none" stroke="url(#border)" stroke-width="2" rx="15"/>
  <!-- Inner border -->
  <rect x="8" y="8" width="384" height="384" fill="none" stroke="${c.color}" stroke-width="0.5" stroke-opacity="0.2" rx="12"/>
  <!-- Dot grid pattern -->
  <pattern id="dots" x="0" y="0" width="20" height="20" patternUnits="userSpaceOnUse">
    <circle cx="1" cy="1" r="0.5" fill="${c.color}" fill-opacity="0.08"/>
  </pattern>
  <rect width="400" height="400" fill="url(#dots)" rx="16"/>
  <!-- Top label -->
  <text x="20" y="36" font-family="monospace" font-size="10" fill="${c.color}" opacity="0.6" letter-spacing="2">ARENA CHAMPION · BASE</text>
  <text x="380" y="36" font-family="monospace" font-size="10" fill="${c.color}" opacity="0.4" text-anchor="end">#${String(c.id).padStart(4,"0")}</text>
  <!-- Divider line -->
  <line x1="20" y1="46" x2="380" y2="46" stroke="${c.color}" stroke-width="0.5" stroke-opacity="0.3"/>
  <!-- Central emoji / art area -->
  <rect x="20" y="56" width="360" height="220" fill="${c.color}" fill-opacity="0.03" rx="8"/>
  <text x="200" y="190" font-size="88" text-anchor="middle" dominant-baseline="middle" ${c.rarity === "Legendary" ? 'filter="url(#glow)"' : ''}>${c.emoji}</text>
  <!-- Power bar -->
  <rect x="20" y="290" width="360" height="4" fill="${c.color}" fill-opacity="0.1" rx="2"/>
  <rect x="20" y="290" width="${Math.round(360 * c.power / 100)}" height="4" fill="${c.color}" fill-opacity="0.8" rx="2"/>
  <!-- Stats row -->
  <text x="20" y="318" font-family="monospace" font-size="9" fill="${c.color}" opacity="0.5" letter-spacing="1">POWER</text>
  <text x="20" y="332" font-family="monospace" font-size="18" fill="${c.color}" font-weight="bold">${c.power}</text>
  <text x="200" y="318" font-family="monospace" font-size="9" fill="${c.color}" opacity="0.5" letter-spacing="1" text-anchor="middle">ELEMENT</text>
  <text x="200" y="332" font-family="monospace" font-size="14" fill="${c.color}" text-anchor="middle">${c.element}</text>
  <text x="380" y="318" font-family="monospace" font-size="9" fill="${c.color}" opacity="0.5" letter-spacing="1" text-anchor="end">RARITY</text>
  <text x="380" y="332" font-family="monospace" font-size="14" fill="${c.color}" text-anchor="end">${c.rarity}</text>
  <!-- Bottom divider -->
  <line x1="20" y1="348" x2="380" y2="348" stroke="${c.color}" stroke-width="0.5" stroke-opacity="0.3"/>
  <!-- Name -->
  <text x="200" y="376" font-family="sans-serif" font-size="22" font-weight="bold" fill="${c.color}" text-anchor="middle" letter-spacing="2">${c.name.toUpperCase()}</text>
</svg>`;
}

// ── Upload single file to Pinata ───────────────────────────────────────────
async function pinFile(blob, name, mimeType) {
  const form = new FormData();
  form.append("file", new File([blob], name, { type: mimeType }));
  form.append("pinataMetadata", JSON.stringify({ name }));
  const res = await fetch("https://api.pinata.cloud/pinning/pinFileToIPFS", {
    method: "POST",
    headers: { Authorization: `Bearer ${PINATA_JWT}` },
    body: form,
  });
  if (!res.ok) throw new Error(`Pinata error: ${res.status} ${await res.text()}`);
  const { IpfsHash } = await res.json();
  return IpfsHash;
}

// ── Upload JSON to Pinata ─────────────────────────────────────────────────
async function pinJSON(obj, name) {
  const res = await fetch("https://api.pinata.cloud/pinning/pinJSONToIPFS", {
    method: "POST",
    headers: { Authorization: `Bearer ${PINATA_JWT}`, "Content-Type": "application/json" },
    body: JSON.stringify({ pinataContent: obj, pinataMetadata: { name } }),
  });
  if (!res.ok) throw new Error(`Pinata JSON error: ${res.status} ${await res.text()}`);
  const { IpfsHash } = await res.json();
  return IpfsHash;
}

async function main() {
  console.log("\n╔══════════════════════════════════════════════════════╗");
  console.log("║      ARENA CHAMPION — NFT METADATA IPFS UPLOAD      ║");
  console.log("╚══════════════════════════════════════════════════════╝\n");

  const results = [];

  for (const c of CHAMPIONS) {
    process.stdout.write(`[${c.id}/8] ${c.name} — uploading SVG... `);

    // 1. Upload SVG image
    const svg = makeSVG(c);
    const imgHash = await pinFile(svg, `arena-champion-${c.id}.svg`, "image/svg+xml");
    const imageURI = `ipfs://${imgHash}`;
    console.log(`✓ image → ${imgHash}`);

    // 2. Build OpenSea-compatible metadata
    const metadata = {
      name: `${c.name} #${String(c.id).padStart(4,"0")}`,
      description: `${c.name} is an ${c.rarity}-rarity Arena Champion deployed on Base mainnet. Earn this NFT by winning battles in the Agunnaya Labs Arena Protocol. Power: ${c.power} · Element: ${c.element}.`,
      image: imageURI,
      external_url: `${SITE_URL}/#gallery`,
      background_color: c.bg.replace("#",""),
      attributes: [
        { trait_type: "Rarity",  value: c.rarity },
        { trait_type: "Element", value: c.element },
        { trait_type: "Power",   display_type: "number", value: c.power },
        { trait_type: "Class",   value: "Champion" },
        { trait_type: "Season",  value: "Genesis" },
        { trait_type: "Chain",   value: "Base" },
      ],
    };

    // 3. Upload metadata JSON
    process.stdout.write(`          uploading metadata... `);
    const metaHash = await pinJSON(metadata, `arena-champion-${c.id}-metadata`);
    const tokenURI = `ipfs://${metaHash}`;
    console.log(`✓ meta  → ${metaHash}`);

    results.push({
      id: c.id,
      name: c.name,
      rarity: c.rarity,
      power: c.power,
      element: c.element,
      imageHash: imgHash,
      imageURI,
      metaHash,
      tokenURI,
      openSeaURL: `https://opensea.io/assets/base/<CONTRACT>/${c.id}`,
      ipfsGateway: `https://gateway.pinata.cloud/ipfs/${metaHash}`,
    });
  }

  // 4. Collection-level contractURI
  console.log("\n[+] Uploading collection metadata (contractURI)...");
  const collection = {
    name: "Arena Champion",
    description: "Arena Champions are on-chain NFTs earned through battle victories in the Agunnaya Labs Arena Protocol on Base mainnet. Each champion has unique attributes: rarity (Legendary/Epic/Rare/Common), elemental affinity, and a power rating from 1-100. Genesis champions are minted by the Agunnaya Labs team as the first 8 NFTs of a 1,000 max-supply collection.",
    image: `ipfs://${results[0].imageHash}`,
    external_link: SITE_URL,
    seller_fee_basis_points: 500,
    fee_recipient: DEPLOYER,
  };
  const collectionHash = await pinJSON(collection, "arena-champion-collection");
  console.log(`✓ collection → ipfs://${collectionHash}`);

  // 5. Save results
  const out = {
    uploadedAt: new Date().toISOString(),
    contractURI: `ipfs://${collectionHash}`,
    contractURIGateway: `https://gateway.pinata.cloud/ipfs/${collectionHash}`,
    nfts: results,
  };
  const outPath = path.join(__dirname, "..", "nft-metadata.json");
  fs.writeFileSync(outPath, JSON.stringify(out, null, 2));

  console.log("\n╔══════════════════════════════════════════════════════╗");
  console.log("║                   UPLOAD COMPLETE                   ║");
  console.log("╚══════════════════════════════════════════════════════╝");
  console.log(`\ncontractURI: ipfs://${collectionHash}`);
  console.log(`Results saved to: nft-metadata.json`);
  console.log("\nNext step: Deploy ArenaChampionV2 contract");
  console.log("  npx hardhat run scripts/deploy-arena-champion.js --network base\n");
}

main().catch(e => { console.error("\n[ERROR]", e.message); process.exit(1); });
