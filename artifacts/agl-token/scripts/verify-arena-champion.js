/**
 * verify-arena-champion.js
 * Verifies ArenaChampionV2 source code on BaseScan.
 * Run: npx hardhat run scripts/verify-arena-champion.js --network base
 */
require("dotenv").config();
const { run } = require("hardhat");
const fs = require("fs");
const path = require("path");

async function main() {
  console.log("\n╔══════════════════════════════════════════════════════╗");
  console.log("║     ARENA CHAMPION V2 — BASESCAN VERIFICATION       ║");
  console.log("╚══════════════════════════════════════════════════════╝\n");

  const metaPath = path.join(__dirname, "..", "nft-metadata.json");
  if (!fs.existsSync(metaPath)) throw new Error("Run deploy + mint scripts first");
  const meta = JSON.parse(fs.readFileSync(metaPath, "utf8"));
  if (!meta.contractAddress) throw new Error("No contractAddress in nft-metadata.json");

  const DEPLOYER = "0xFfb6505912FCE95B42be4860477201bb4e204E9f";
  console.log(`Contract: ${meta.contractAddress}`);
  console.log(`Verifying on BaseScan...\n`);

  await run("verify:verify", {
    address: meta.contractAddress,
    constructorArguments: [DEPLOYER, meta.contractURI],
  });

  meta.verified = true;
  meta.verifiedAt = new Date().toISOString();
  meta.basescanVerifyUrl = `https://basescan.org/address/${meta.contractAddress}#code`;
  fs.writeFileSync(metaPath, JSON.stringify(meta, null, 2));

  console.log(`\n✓ Verified: https://basescan.org/address/${meta.contractAddress}#code`);
  console.log(`✓ OpenSea collection: https://opensea.io/assets/base/${meta.contractAddress}`);
  console.log(`\n  View individual NFTs:`);
  (meta.nfts || []).slice(0, 3).forEach(n => console.log(`  ${n.openSeaURL}`));
}

main().catch(e => { console.error("\n[ERROR]", e.message); process.exit(1); });
