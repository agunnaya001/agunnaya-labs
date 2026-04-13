/**
 * mint-existing-champion.js
 * Mints champion NFTs on the existing ArenaChampion contract
 * (0x68f08b005b09B0F7D07E1c0B5CDe18E43CE2486A) using the minimal gas available.
 *
 * mintChampion(address to, uint256 attack, uint256 defense, uint8 rarity)
 * Rarity: 0=Common, 1=Rare, 2=Epic, 3=Legendary
 *
 * Run: npx hardhat run scripts/mint-existing-champion.js --network base
 */
require("dotenv").config();
const { ethers } = require("hardhat");
const fs = require("fs");
const path = require("path");

const CONTRACT = "0x68f08b005b09B0F7D07E1c0B5CDe18E43CE2486A";

const MINT_QUEUE = [
  { attack: 98n, defense: 90n, rarity: 3 },  // Legendary (Shadow Cipher)
  { attack: 86n, defense: 78n, rarity: 2 },  // Epic (Flame Warden)
  { attack: 82n, defense: 74n, rarity: 2 },  // Epic (Iron Sentinel)
  { attack: 74n, defense: 68n, rarity: 1 },  // Rare (Storm Seeker)
];

const ABI = [
  "function mintChampion(address to, uint256 attack, uint256 defense, uint8 rarity) external",
  "function nextTokenId() view returns (uint256)",
  "function ownerOf(uint256 tokenId) view returns (address)",
  "function name() view returns (string)",
  "function symbol() view returns (string)",
  "function champions(uint256) view returns (uint256 attack, uint256 defense, uint8 rarity)",
];

async function main() {
  console.log("\n╔══════════════════════════════════════════════════════╗");
  console.log("║     ARENA CHAMPION — MINT ON EXISTING CONTRACT      ║");
  console.log("╚══════════════════════════════════════════════════════╝\n");

  const [deployer] = await ethers.getSigners();
  const provider = ethers.provider;
  const balance = await provider.getBalance(deployer.address);
  const fees = await provider.getFeeData();

  console.log(`Contract  : ${CONTRACT}`);
  console.log(`Deployer  : ${deployer.address}`);
  console.log(`Balance   : ${ethers.formatEther(balance)} ETH`);
  console.log(`gasPrice  : ${ethers.formatUnits(fees.gasPrice || 0n, "gwei")} gwei`);

  const contract = new ethers.Contract(CONTRACT, ABI, await provider.getSigner());
  const startId = await contract.nextTokenId();
  console.log(`\nNext token ID: ${startId}`);

  // Estimate how many mints we can afford
  const GAS_PER_MINT = 150000n;
  const maxFee = fees.maxFeePerGas || fees.gasPrice || ethers.parseUnits("0.01", "gwei");
  const costPerMint = GAS_PER_MINT * maxFee;
  const affordable = Number(balance / costPerMint);
  console.log(`Cost/mint : ${ethers.formatEther(costPerMint)} ETH`);
  console.log(`Affordable: ${affordable} mint(s) with current balance\n`);

  if (affordable === 0) {
    console.error("⚠  Insufficient ETH to mint.");
    console.error(`   Fund wallet: ${deployer.address}`);
    console.error("   Bridge ETH to Base: https://bridge.base.org");
    process.exit(1);
  }

  const toMint = MINT_QUEUE.slice(0, Math.min(affordable, MINT_QUEUE.length));
  const receipts = [];
  const rarityLabel = ["Common", "Rare", "Epic", "Legendary"];

  for (let i = 0; i < toMint.length; i++) {
    const { attack, defense, rarity } = toMint[i];
    const tokenId = Number(startId) + i;
    process.stdout.write(`[${i+1}/${toMint.length}] Minting token #${tokenId} (${rarityLabel[rarity]}, ATK:${attack} DEF:${defense})... `);

    try {
      const tx = await contract.mintChampion(deployer.address, attack, defense, rarity, {
        gasLimit: 200000,
        maxFeePerGas: maxFee,
        maxPriorityFeePerGas: fees.maxPriorityFeePerGas || ethers.parseUnits("0.001", "gwei"),
      });
      const receipt = await tx.wait();
      console.log(`✓ ${receipt.hash}`);
      receipts.push({
        tokenId,
        rarity: rarityLabel[rarity],
        attack: attack.toString(),
        defense: defense.toString(),
        txHash: receipt.hash,
        blockNumber: receipt.blockNumber,
        gasUsed: receipt.gasUsed.toString(),
        openSeaURL: `https://opensea.io/assets/base/${CONTRACT}/${tokenId}`,
        baseScanTx: `https://basescan.org/tx/${receipt.hash}`,
        baseScanToken: `https://basescan.org/token/${CONTRACT}?a=${tokenId}`,
      });
      await new Promise(r => setTimeout(r, 2000));
    } catch (err) {
      console.error(`\n  ✗ ${err.message.slice(0, 120)}`);
    }
  }

  const outPath = path.join(__dirname, "..", "existing-champion-mints.json");
  fs.writeFileSync(outPath, JSON.stringify({
    contract: CONTRACT,
    mintedAt: new Date().toISOString(),
    mints: receipts,
  }, null, 2));

  console.log("\n╔══════════════════════════════════════════════════════╗");
  console.log("║                  MINTING COMPLETE                   ║");
  console.log("╚══════════════════════════════════════════════════════╝");
  console.log(`\n✓ ${receipts.length} NFTs minted on ArenaChampion`);
  receipts.forEach(r => {
    console.log(`\n  Token #${r.tokenId} (${r.rarity})`);
    console.log(`  BaseScan TX: ${r.baseScanTx}`);
    console.log(`  OpenSea:     ${r.openSeaURL}`);
  });
  console.log();
}

main().catch(e => { console.error("\n[ERROR]", e.message); process.exit(1); });
