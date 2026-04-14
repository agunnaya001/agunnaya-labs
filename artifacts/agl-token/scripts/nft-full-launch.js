/**
 * nft-full-launch.js
 * ───────────────────────────────────────────────────────────────
 * One-command pipeline: Deploy ArenaChampionV2 → Mint all 8 genesis
 * NFTs → Verify contract on BaseScan.
 *
 * USAGE:
 *   Ensure DEPLOYER_PRIVATE_KEY and BASESCAN_API_KEY are set in .env, then:
 *
 *     npx hardhat run scripts/nft-full-launch.js --network base
 *
 * WHAT IT DOES:
 *   1. Reads IPFS metadata from nft-metadata.json (upload-nft-metadata.js must run first)
 *   2. Deploys ArenaChampionV2 with the collection contractURI
 *   3. Mints all 8 genesis champion NFTs to the deployer wallet
 *   4. Verifies the contract source on BaseScan
 *   5. Saves full results to nft-metadata.json
 *   6. Outputs all OpenSea URLs
 *
 * REQUIREMENTS:
 *   - nft-metadata.json must exist (run upload-nft-metadata.js first)
 *   - Wallet must hold enough ETH for gas (~0.01 ETH covers deploy + 8 mints)
 *   - DEPLOYER_PRIVATE_KEY in .env
 *   - BASESCAN_API_KEY in .env (for verification)
 * ───────────────────────────────────────────────────────────────
 */

require("dotenv").config();
const { ethers, run } = require("hardhat");
const fs = require("fs");
const path = require("path");

const META_PATH = path.join(__dirname, "..", "nft-metadata.json");
const DEPLOYER_ADDRESS = "0xFfb6505912FCE95B42be4860477201bb4e204E9f";

function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

async function deployContract(meta, deployer) {
  console.log("\n── STEP 1: Deploy ArenaChampionV2 ───────────────────");

  if (meta.contractAddress && meta.contractAddress !== "<CONTRACT>" && meta.contractAddress !== "") {
    console.log(`  ✓ Already deployed at: ${meta.contractAddress}`);
    console.log(`    Skipping deployment.`);
    return meta.contractAddress;
  }

  console.log(`  Compiling ArenaChampionV2...`);
  const Factory = await ethers.getContractFactory("ArenaChampionV2");

  console.log(`  Deploying with contractURI: ${meta.contractURI}`);
  const contract = await Factory.deploy(deployer.address, meta.contractURI);
  await contract.waitForDeployment();

  const address = await contract.getAddress();
  console.log(`  ✓ Deployed at: ${address}`);
  console.log(`    BaseScan: https://basescan.org/address/${address}`);

  return address;
}

async function mintAllNFTs(meta, deployer) {
  console.log("\n── STEP 2: Mint Genesis NFTs ─────────────────────────");

  const ABI = [
    "function ownerMint(address to, string tokenURI, string name, string rarity, uint256 power, string element) external",
    "function nextTokenId() view returns (uint256)",
    "function totalSupply() view returns (uint256)",
  ];

  const contract = new ethers.Contract(meta.contractAddress, ABI, await ethers.provider.getSigner());
  const startId = Number(await contract.nextTokenId());
  console.log(`  Next token ID: ${startId}`);

  const alreadyMinted = meta.mints?.length || 0;
  if (alreadyMinted >= meta.nfts.length) {
    console.log(`  ✓ All ${alreadyMinted} NFTs already minted. Skipping.`);
    return meta.mints || [];
  }

  const toMint = meta.nfts.slice(alreadyMinted);
  console.log(`  Minting ${toMint.length} NFTs...\n`);

  const receipts = [...(meta.mints || [])];

  for (let i = 0; i < toMint.length; i++) {
    const nft = toMint[i];
    process.stdout.write(
      `  [${i + 1}/${toMint.length}] ${nft.name} (${nft.rarity}, Power: ${nft.power})... `
    );

    try {
      const tx = await contract.ownerMint(
        deployer.address,
        nft.tokenURI,
        nft.name,
        nft.rarity,
        nft.power,
        nft.element,
        { gasLimit: 350000 }
      );
      const receipt = await tx.wait();

      const tokenId = startId + i;
      console.log(`✓ Token #${tokenId} | Tx: ${receipt.hash}`);

      receipts.push({
        tokenId,
        name: nft.name,
        rarity: nft.rarity,
        power: nft.power,
        element: nft.element,
        txHash: receipt.hash,
        blockNumber: receipt.blockNumber,
        gasUsed: receipt.gasUsed.toString(),
        openSeaURL: `https://opensea.io/assets/base/${meta.contractAddress}/${tokenId}`,
        baseScanTx: `https://basescan.org/tx/${receipt.hash}`,
        baseScanToken: `https://basescan.org/token/${meta.contractAddress}?a=${tokenId}`,
        tokenURI: nft.tokenURI,
        ipfsGateway: nft.ipfsGateway,
      });

      await sleep(1500);
    } catch (err) {
      console.error(`\n  ✗ Failed: ${err.message.slice(0, 200)}`);
    }
  }

  return receipts;
}

async function verifyContract(meta) {
  console.log("\n── STEP 3: Verify on BaseScan ────────────────────────");

  if (meta.verified) {
    console.log(`  ✓ Already verified. Skipping.`);
    return;
  }

  console.log(`  Verifying ArenaChampionV2 at ${meta.contractAddress}...`);
  console.log(`  (This may take 15–60 seconds)`);

  try {
    await run("verify:verify", {
      address: meta.contractAddress,
      constructorArguments: [DEPLOYER_ADDRESS, meta.contractURI],
    });
    console.log(`  ✓ Verified on BaseScan`);
    return true;
  } catch (err) {
    if (err.message?.includes("Already Verified") || err.message?.includes("already verified")) {
      console.log(`  ✓ Contract already verified`);
      return true;
    }
    console.warn(`  ⚠  Verification failed: ${err.message?.slice(0, 120)}`);
    console.warn(`     You can retry: npx hardhat run scripts/verify-arena-champion.js --network base`);
    return false;
  }
}

async function main() {
  console.log("\n╔══════════════════════════════════════════════════════╗");
  console.log("║    ARENA CHAMPION — FULL NFT LAUNCH PIPELINE         ║");
  console.log("║    Deploy → Mint 8 Genesis NFTs → Verify             ║");
  console.log("╚══════════════════════════════════════════════════════╝\n");

  if (!fs.existsSync(META_PATH)) {
    throw new Error(
      "nft-metadata.json not found.\nRun: node scripts/upload-nft-metadata.js first"
    );
  }

  let meta = JSON.parse(fs.readFileSync(META_PATH, "utf8"));

  if (!meta.nfts || meta.nfts.length === 0) {
    throw new Error("No NFTs found in nft-metadata.json. Check your metadata file.");
  }

  const [deployer] = await ethers.getSigners();
  console.log(`Deployer : ${deployer.address}`);
  const balance = await ethers.provider.getBalance(deployer.address);
  console.log(`Balance  : ${ethers.formatEther(balance)} ETH`);

  if (balance < ethers.parseEther("0.005")) {
    throw new Error(
      `Insufficient ETH. Need at least 0.01 ETH for deploy + 8 mints.\n` +
      `Fund this wallet: ${deployer.address}\n` +
      `Bridge ETH to Base: https://bridge.base.org`
    );
  }

  console.log(`NFTs     : ${meta.nfts.length} genesis champions`);
  console.log(`IPFS     : ${meta.contractURI ? "✓ Uploaded" : "✗ Missing"}`);

  // ── STEP 1: Deploy ────────────────────────────────────────────
  const contractAddress = await deployContract(meta, deployer);

  // Update meta with contract address
  meta.contractAddress = contractAddress;
  meta.deployer = deployer.address;
  meta.deployedAt = meta.deployedAt || new Date().toISOString();
  meta.network = "base";
  meta.chainId = "8453";
  meta.basescanUrl = `https://basescan.org/address/${contractAddress}`;
  meta.openSeaCollection = `https://opensea.io/collection/arena-champion`;
  meta.openSeaAssets = `https://opensea.io/assets/base/${contractAddress}`;

  // Update OpenSea URLs now that we have the contract address
  meta.nfts = meta.nfts.map((n) => ({
    ...n,
    openSeaURL: `https://opensea.io/assets/base/${contractAddress}/${n.id}`,
    baseScanURL: `https://basescan.org/token/${contractAddress}?a=${n.id}`,
  }));

  fs.writeFileSync(META_PATH, JSON.stringify(meta, null, 2));

  // ── STEP 2: Mint ──────────────────────────────────────────────
  const mints = await mintAllNFTs(meta, deployer);
  meta.mints = mints;
  meta.mintedAt = meta.mintedAt || new Date().toISOString();
  fs.writeFileSync(META_PATH, JSON.stringify(meta, null, 2));

  // Wait a bit before verification
  if (mints.length > 0) {
    console.log(`\n  Waiting 15s before BaseScan verification...`);
    await sleep(15000);
  }

  // ── STEP 3: Verify ────────────────────────────────────────────
  const verified = await verifyContract(meta);
  meta.verified = verified || false;
  if (verified) meta.verifiedAt = new Date().toISOString();
  fs.writeFileSync(META_PATH, JSON.stringify(meta, null, 2));

  // ── Summary ───────────────────────────────────────────────────
  console.log("\n╔══════════════════════════════════════════════════════╗");
  console.log("║                  LAUNCH COMPLETE ✓                  ║");
  console.log("╚══════════════════════════════════════════════════════╝\n");

  console.log(`  Contract   : ${contractAddress}`);
  console.log(`  Network    : Base Mainnet (Chain ID: 8453)`);
  console.log(`  NFTs Minted: ${mints.length}/${meta.nfts.length}`);
  console.log(`  Verified   : ${meta.verified ? "YES ✓" : "PENDING"}`);
  console.log(`  BaseScan   : https://basescan.org/address/${contractAddress}`);
  console.log(`  OpenSea    : https://opensea.io/assets/base/${contractAddress}`);
  console.log(`  Collection : https://opensea.io/collection/arena-champion`);
  console.log(`  DEX        : https://opensea.io/collection/arena-champion`);

  if (mints.length > 0) {
    console.log("\n  MINTED NFTs:");
    mints.forEach((m) => {
      console.log(`    #${m.tokenId} ${m.name} (${m.rarity})`);
      console.log(`       OpenSea : ${m.openSeaURL}`);
      console.log(`       Tx      : ${m.baseScanTx}`);
    });
  }

  console.log("\n  NOTE: OpenSea may take 10–30 minutes to index new NFTs.");
  console.log("  Visit the collection page and click 'Refresh metadata' on each NFT.\n");
}

main()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error("\n[FATAL]", err.message);
    process.exit(1);
  });
