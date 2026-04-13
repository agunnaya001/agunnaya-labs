/**
 * deploy-arena-champion.js
 * Deploys ArenaChampionV2 to Base mainnet.
 * Requires nft-metadata.json to already exist (run upload-nft-metadata.js first).
 * Run: npx hardhat run scripts/deploy-arena-champion.js --network base
 */
require("dotenv").config();
const { ethers } = require("hardhat");
const fs = require("fs");
const path = require("path");

async function main() {
  console.log("\n╔══════════════════════════════════════════════════════╗");
  console.log("║     ARENA CHAMPION V2 — DEPLOY TO BASE MAINNET      ║");
  console.log("╚══════════════════════════════════════════════════════╝\n");

  const metaPath = path.join(__dirname, "..", "nft-metadata.json");
  if (!fs.existsSync(metaPath)) throw new Error("Run upload-nft-metadata.js first");
  const meta = JSON.parse(fs.readFileSync(metaPath, "utf8"));

  const [deployer] = await ethers.getSigners();
  console.log(`Deployer: ${deployer.address}`);
  const balance = await ethers.provider.getBalance(deployer.address);
  console.log(`Balance:  ${ethers.formatEther(balance)} ETH`);

  if (balance < ethers.parseEther("0.001")) {
    console.error("\n⚠  INSUFFICIENT BALANCE");
    console.error("   Fund the deployer wallet with at least 0.01 ETH:");
    console.error(`   ${deployer.address}`);
    console.error("   Base mainnet bridge: https://bridge.base.org");
    process.exit(1);
  }

  console.log("\n[1/3] Compiling ArenaChampionV2...");
  const Factory = await ethers.getContractFactory("ArenaChampionV2");

  console.log(`[2/3] Deploying with contractURI: ${meta.contractURI}`);
  const contract = await Factory.deploy(deployer.address, meta.contractURI);
  await contract.waitForDeployment();
  const address = await contract.getAddress();
  console.log(`[3/3] Deployed at: ${address}`);
  console.log(`      BaseScan:    https://basescan.org/address/${address}`);

  // Persist deployment
  const deploy = JSON.parse(fs.readFileSync(path.join(__dirname, "..", "deployment.json"), "utf8"));
  const nftDeploy = {
    ...meta,
    contractAddress: address,
    deployer: deployer.address,
    deployedAt: new Date().toISOString(),
    network: "base",
    chainId: "8453",
    basescanUrl: `https://basescan.org/address/${address}`,
    openSeaCollection: `https://opensea.io/collection/arena-champion`,
    openSeaAssets: `https://opensea.io/assets/base/${address}`,
  };

  // Update tokenURI openSea URLs now that we have the contract address
  nftDeploy.nfts = nftDeploy.nfts.map(n => ({
    ...n,
    openSeaURL: `https://opensea.io/assets/base/${address}/${n.id}`,
    baseScanURL: `https://basescan.org/token/${address}?a=${n.id}`,
  }));

  fs.writeFileSync(metaPath, JSON.stringify(nftDeploy, null, 2));

  console.log(`\nSaved to nft-metadata.json`);
  console.log("\nNext step: Mint genesis champions");
  console.log("  npx hardhat run scripts/mint-genesis-nfts.js --network base\n");
}

main().catch(e => { console.error("\n[ERROR]", e.message); process.exit(1); });
