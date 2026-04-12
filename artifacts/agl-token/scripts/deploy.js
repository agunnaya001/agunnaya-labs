const { ethers } = require("hardhat");
const fs = require("fs");
const path = require("path");

async function main() {
  console.log("\n╔══════════════════════════════════════════════════╗");
  console.log("║         AGUNNAYA LABS — AGL TOKEN DEPLOY         ║");
  console.log("╚══════════════════════════════════════════════════╝\n");

  const [deployer] = await ethers.getSigners();
  console.log(`Deployer address : ${deployer.address}`);

  const balance = await ethers.provider.getBalance(deployer.address);
  console.log(`Deployer balance : ${ethers.formatEther(balance)} ETH`);

  if (balance === 0n) {
    throw new Error("Deployer wallet has no ETH. Fund the wallet before deploying.");
  }

  console.log("\n[1/3] Compiling contract...");
  const AGLToken = await ethers.getContractFactory("AGLToken");

  console.log("[2/3] Deploying AGLToken to network...");
  const token = await AGLToken.deploy(deployer.address);
  await token.waitForDeployment();

  const contractAddress = await token.getAddress();
  console.log(`[3/3] Contract deployed at: ${contractAddress}`);

  const totalSupply = await token.totalSupply();
  console.log(`\nToken Name   : ${await token.name()}`);
  console.log(`Token Symbol : ${await token.symbol()}`);
  console.log(`Decimals     : ${await token.decimals()}`);
  console.log(`Total Supply : ${ethers.formatEther(totalSupply)} AGL`);
  console.log(`Owner        : ${await token.owner()}`);

  const deployInfo = {
    contractAddress,
    deployer: deployer.address,
    network: (await ethers.provider.getNetwork()).name,
    chainId: (await ethers.provider.getNetwork()).chainId.toString(),
    tokenName: "Agunnaya Labs",
    tokenSymbol: "AGL",
    decimals: 18,
    totalSupply: "1000000000",
    deployedAt: new Date().toISOString(),
    basescanUrl: `https://basescan.org/address/${contractAddress}`,
    uniswapUrl: `https://app.uniswap.org/explore/tokens/base/${contractAddress}`,
  };

  const outPath = path.join(__dirname, "..", "deployment.json");
  fs.writeFileSync(outPath, JSON.stringify(deployInfo, null, 2));
  console.log(`\nDeployment info saved to: deployment.json`);
  console.log(`BaseScan URL : ${deployInfo.basescanUrl}`);

  return deployInfo;
}

main()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error("\n[ERROR] Deployment failed:", err.message);
    process.exit(1);
  });
