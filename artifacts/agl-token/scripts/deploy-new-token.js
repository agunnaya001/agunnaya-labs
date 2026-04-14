/**
 * deploy-new-token.js
 * ───────────────────────────────────────────────────────────────
 * Deploys a new ERC-20 token to Base Mainnet (or Base Sepolia).
 *
 * USAGE:
 *   Set the following environment variables in your .env file:
 *     DEPLOYER_PRIVATE_KEY  — wallet that will deploy and receive all tokens
 *     TOKEN_NAME            — e.g. "My Token"
 *     TOKEN_SYMBOL          — e.g. "MTK"
 *     TOKEN_SUPPLY          — total supply (whole units, e.g. 1000000000 = 1B)
 *     TOKEN_DECIMALS        — (optional) defaults to 18
 *
 *   Then run:
 *     npm run deploy:token          (Base Mainnet)
 *     npm run deploy:token:testnet  (Base Sepolia)
 *
 * OUTPUT:
 *   Saves deployment info to deployments/<SYMBOL>-deployment.json
 * ───────────────────────────────────────────────────────────────
 */

require("dotenv").config();
const { ethers } = require("hardhat");
const fs = require("fs");
const path = require("path");

async function main() {
  const TOKEN_NAME     = process.env.TOKEN_NAME;
  const TOKEN_SYMBOL   = process.env.TOKEN_SYMBOL;
  const TOKEN_SUPPLY   = process.env.TOKEN_SUPPLY;
  const TOKEN_DECIMALS = parseInt(process.env.TOKEN_DECIMALS || "18", 10);

  if (!TOKEN_NAME || !TOKEN_SYMBOL || !TOKEN_SUPPLY) {
    console.error("\n[ERROR] Missing required environment variables.");
    console.error("  Required: TOKEN_NAME, TOKEN_SYMBOL, TOKEN_SUPPLY");
    console.error("  Optional: TOKEN_DECIMALS (default: 18)\n");
    console.error("  Example .env entries:");
    console.error('    TOKEN_NAME="My Token"');
    console.error('    TOKEN_SYMBOL="MTK"');
    console.error('    TOKEN_SUPPLY="1000000000"');
    process.exit(1);
  }

  const supply = BigInt(TOKEN_SUPPLY);

  console.log("\n╔══════════════════════════════════════════════════╗");
  console.log("║      AGUNNAYA LABS — NEW TOKEN DEPLOY            ║");
  console.log("╚══════════════════════════════════════════════════╝\n");

  const [deployer] = await ethers.getSigners();
  console.log(`Deployer address : ${deployer.address}`);

  const balance = await ethers.provider.getBalance(deployer.address);
  console.log(`Deployer balance : ${ethers.formatEther(balance)} ETH`);

  if (balance === 0n) {
    throw new Error("Deployer wallet has no ETH. Fund the wallet before deploying.");
  }

  console.log(`\nToken Name       : ${TOKEN_NAME}`);
  console.log(`Token Symbol     : ${TOKEN_SYMBOL}`);
  console.log(`Total Supply     : ${supply.toLocaleString()} ${TOKEN_SYMBOL}`);
  console.log(`Decimals         : ${TOKEN_DECIMALS}`);

  console.log("\n[1/3] Compiling GenericToken contract...");
  const GenericToken = await ethers.getContractFactory("GenericToken");

  console.log("[2/3] Deploying to network...");
  const token = await GenericToken.deploy(
    TOKEN_NAME,
    TOKEN_SYMBOL,
    supply,
    TOKEN_DECIMALS,
    deployer.address
  );
  await token.waitForDeployment();

  const contractAddress = await token.getAddress();
  const network = await ethers.provider.getNetwork();

  console.log(`[3/3] Contract deployed at: ${contractAddress}`);

  const deployInfo = {
    contractAddress,
    deployer: deployer.address,
    network: network.name,
    chainId: network.chainId.toString(),
    tokenName: TOKEN_NAME,
    tokenSymbol: TOKEN_SYMBOL,
    decimals: TOKEN_DECIMALS,
    totalSupply: TOKEN_SUPPLY,
    deployedAt: new Date().toISOString(),
    basescanUrl: `https://basescan.org/address/${contractAddress}`,
    uniswapUrl: `https://app.uniswap.org/explore/tokens/base/${contractAddress}`,
    addLiquidityUrl: `https://app.uniswap.org/add/ETH/${contractAddress}/10000`,
  };

  const outDir = path.join(__dirname, "..", "deployments");
  if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });

  const outPath = path.join(outDir, `${TOKEN_SYMBOL.toLowerCase()}-deployment.json`);
  fs.writeFileSync(outPath, JSON.stringify(deployInfo, null, 2));

  console.log("\n╔══════════════════════════════════════════════════╗");
  console.log("  DEPLOYMENT COMPLETE");
  console.log(`  Contract  : ${contractAddress}`);
  console.log(`  Network   : ${network.name} (Chain ID: ${network.chainId})`);
  console.log(`  BaseScan  : ${deployInfo.basescanUrl}`);
  console.log(`  Uniswap   : ${deployInfo.uniswapUrl}`);
  console.log(`  Saved to  : ${outPath}`);
  console.log("\n  NEXT STEP: Add liquidity so the token is tradeable:");
  console.log(`  ${deployInfo.addLiquidityUrl}`);
  console.log("╚══════════════════════════════════════════════════╝\n");

  return deployInfo;
}

main()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error("\n[ERROR] Deployment failed:", err.message);
    process.exit(1);
  });
