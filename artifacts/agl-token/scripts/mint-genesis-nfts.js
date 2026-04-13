/**
 * mint-genesis-nfts.js
 * Mints all 8 genesis ArenaChampion NFTs to the deployer wallet.
 * Run: npx hardhat run scripts/mint-genesis-nfts.js --network base
 */
require("dotenv").config();
const { ethers } = require("hardhat");
const fs = require("fs");
const path = require("path");

async function main() {
  console.log("\n╔══════════════════════════════════════════════════════╗");
  console.log("║       ARENA CHAMPION — MINT GENESIS NFTs             ║");
  console.log("╚══════════════════════════════════════════════════════╝\n");

  const metaPath = path.join(__dirname, "..", "nft-metadata.json");
  if (!fs.existsSync(metaPath)) throw new Error("Run deploy-arena-champion.js first");
  const meta = JSON.parse(fs.readFileSync(metaPath, "utf8"));

  if (!meta.contractAddress) throw new Error("No contractAddress in nft-metadata.json — deploy first");

  const [deployer] = await ethers.getSigners();
  console.log(`Deployer : ${deployer.address}`);
  const balance = await ethers.provider.getBalance(deployer.address);
  console.log(`Balance  : ${ethers.formatEther(balance)} ETH\n`);

  const ABI = [
    "function ownerMint(address to, string tokenURI, string name, string rarity, uint256 power, string element) external",
    "function nextTokenId() view returns (uint256)",
    "function tokenURI(uint256) view returns (string)",
    "function totalSupply() view returns (uint256)",
  ];
  const contract = new ethers.Contract(meta.contractAddress, ABI, await ethers.provider.getSigner());

  const txReceipts = [];

  for (const nft of meta.nfts) {
    process.stdout.write(`[${nft.id}/8] Minting ${nft.name} (${nft.rarity})... `);
    try {
      const tx = await contract.ownerMint(
        deployer.address,
        nft.tokenURI,
        nft.name,
        nft.rarity,
        nft.power,
        nft.element,
        { gasLimit: 300000 }
      );
      const receipt = await tx.wait();
      console.log(`✓ Tx: ${receipt.hash}`);
      txReceipts.push({
        tokenId: nft.id,
        name: nft.name,
        txHash: receipt.hash,
        blockNumber: receipt.blockNumber,
        gasUsed: receipt.gasUsed.toString(),
        openSeaURL: nft.openSeaURL,
        baseScanURL: nft.baseScanURL,
        baseScanTx: `https://basescan.org/tx/${receipt.hash}`,
      });
      // Small delay between mints
      await new Promise(r => setTimeout(r, 1200));
    } catch (err) {
      console.error(`\n  ✗ Failed: ${err.message}`);
    }
  }

  meta.mints = txReceipts;
  meta.mintedAt = new Date().toISOString();
  fs.writeFileSync(metaPath, JSON.stringify(meta, null, 2));

  console.log("\n╔══════════════════════════════════════════════════════╗");
  console.log("║                  MINTING COMPLETE                   ║");
  console.log("╚══════════════════════════════════════════════════════╝");
  console.log(`\n✓ ${txReceipts.length} NFTs minted`);
  console.log(`  Contract:  https://basescan.org/address/${meta.contractAddress}`);
  console.log(`  OpenSea:   https://opensea.io/assets/base/${meta.contractAddress}`);
  console.log("\nNext step: Verify contract on BaseScan");
  console.log("  npx hardhat run scripts/verify-arena-champion.js --network base\n");
}

main().catch(e => { console.error("\n[ERROR]", e.message); process.exit(1); });
