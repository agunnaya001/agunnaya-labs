/**
 * Agunnaya Labs — AGL Token Master Launch Script
 * ────────────────────────────────────────────────
 * Usage: npm run launch
 *
 * This script orchestrates the full token launch sequence:
 *   A. Deploy AGLToken contract to Base mainnet
 *   B. Output contract address
 *   C. Verify contract on BaseScan
 *   D. Upload token logo to IPFS (Pinata)
 *   E. Upload metadata JSON to IPFS
 *   F. Generate liquidity plan for Uniswap (Base)
 *   G. Print full launch summary
 */

const { execSync } = require("child_process");
const fs = require("fs");
const path = require("path");

function step(n, total, label) {
  console.log(`\n${"─".repeat(52)}`);
  console.log(`  STEP ${n}/${total}  —  ${label}`);
  console.log("─".repeat(52));
}

function runCmd(cmd, label) {
  try {
    execSync(cmd, { stdio: "inherit", cwd: path.join(__dirname, "..") });
  } catch (err) {
    console.error(`\n[ERROR] Failed during: ${label}`);
    console.error(err.message);
    process.exit(1);
  }
}

async function main() {
  const NETWORK = process.env.NETWORK || "base";
  const TOTAL_STEPS = 7;

  console.log("\n");
  console.log("╔══════════════════════════════════════════════════════╗");
  console.log("║       AGUNNAYA LABS — AGL TOKEN LAUNCH SYSTEM       ║");
  console.log("║             github.com/agunnaya001                  ║");
  console.log("╚══════════════════════════════════════════════════════╝");
  console.log(`  Network : ${NETWORK}`);
  console.log(`  Started : ${new Date().toISOString()}`);

  // PRE-FLIGHT CHECKS
  const required = ["DEPLOYER_PRIVATE_KEY", "BASESCAN_API_KEY"];
  const optional = ["PINATA_JWT", "BASE_RPC_URL"];
  const missing = required.filter((k) => !process.env[k]);

  if (missing.length > 0) {
    console.error("\n[PREFLIGHT ERROR] Missing required environment variables:");
    missing.forEach((k) => console.error(`  - ${k}`));
    console.error("\nSet them in your .env file before running npm run launch");
    process.exit(1);
  }

  const missingOptional = optional.filter((k) => !process.env[k]);
  if (missingOptional.length > 0) {
    console.warn("\n[PREFLIGHT WARN] Optional env vars not set:");
    missingOptional.forEach((k) => console.warn(`  - ${k} (IPFS upload will be skipped if PINATA_JWT is missing)`));
  }

  // STEP 1: COMPILE
  step(1, TOTAL_STEPS, "Compiling Solidity Contract");
  runCmd("npx hardhat compile", "compile");

  // STEP 2: DEPLOY
  step(2, TOTAL_STEPS, "Deploying AGLToken to Base Mainnet");
  runCmd(`npx hardhat run scripts/deploy.js --network ${NETWORK}`, "deploy");

  const deployPath = path.join(__dirname, "..", "deployment.json");
  const deploy = JSON.parse(fs.readFileSync(deployPath, "utf8"));
  console.log(`\n  ★ Contract Address: ${deploy.contractAddress}`);
  console.log(`  ★ BaseScan: https://basescan.org/address/${deploy.contractAddress}`);

  // STEP 3: VERIFY
  step(3, TOTAL_STEPS, "Verifying Contract on BaseScan");
  runCmd(`npx hardhat run scripts/verify.js --network ${NETWORK}`, "verify");

  // STEP 4 & 5: IPFS UPLOAD
  if (process.env.PINATA_JWT) {
    step(4, TOTAL_STEPS, "Uploading Logo to IPFS");
    step(5, TOTAL_STEPS, "Uploading Metadata JSON to IPFS");
    runCmd("node scripts/ipfs.js", "ipfs");
  } else {
    step(4, TOTAL_STEPS, "Uploading Logo to IPFS — SKIPPED (no PINATA_JWT)");
    step(5, TOTAL_STEPS, "Uploading Metadata JSON to IPFS — SKIPPED (no PINATA_JWT)");
    console.log("  Add PINATA_JWT to .env and run: node scripts/ipfs.js");
  }

  // STEP 6: LIQUIDITY PLAN
  step(6, TOTAL_STEPS, "Generating Uniswap Liquidity Plan");
  runCmd("node scripts/liquidity.js", "liquidity");

  // STEP 7: LAUNCH SUMMARY
  step(7, TOTAL_STEPS, "Full Launch Summary");

  const latestDeploy = JSON.parse(fs.readFileSync(deployPath, "utf8"));
  let ipfsInfo = null;
  const ipfsPath = path.join(__dirname, "..", "ipfs.json");
  if (fs.existsSync(ipfsPath)) {
    ipfsInfo = JSON.parse(fs.readFileSync(ipfsPath, "utf8"));
  }
  const liqPath = path.join(__dirname, "..", "liquidity-plan.json");
  const liqPlan = JSON.parse(fs.readFileSync(liqPath, "utf8"));

  console.log("\n");
  console.log("╔══════════════════════════════════════════════════════╗");
  console.log("║           LAUNCH COMPLETE — FULL SUMMARY            ║");
  console.log("╚══════════════════════════════════════════════════════╝");
  console.log("");
  console.log("  TOKEN");
  console.log(`    Name           : ${latestDeploy.tokenName}`);
  console.log(`    Symbol         : ${latestDeploy.tokenSymbol}`);
  console.log(`    Decimals       : ${latestDeploy.decimals}`);
  console.log(`    Total Supply   : ${Number(latestDeploy.totalSupply).toLocaleString()} AGL`);
  console.log("");
  console.log("  DEPLOYMENT");
  console.log(`    Contract       : ${latestDeploy.contractAddress}`);
  console.log(`    Network        : ${latestDeploy.network} (Chain ID: ${latestDeploy.chainId})`);
  console.log(`    Owner          : ${latestDeploy.deployer}`);
  console.log(`    Deployed At    : ${latestDeploy.deployedAt}`);
  console.log(`    Verified       : ${latestDeploy.verified ? "YES ✓" : "NO ✗"}`);
  console.log("");
  console.log("  LINKS");
  console.log(`    BaseScan       : https://basescan.org/address/${latestDeploy.contractAddress}`);
  console.log(`    Uniswap        : ${latestDeploy.uniswapUrl}`);
  console.log(`    X (Twitter)    : https://x.com/agunnaya001`);
  console.log(`    GitHub         : https://github.com/agunnaya001`);

  if (ipfsInfo) {
    console.log("");
    console.log("  IPFS");
    console.log(`    Logo           : ${ipfsInfo.logoUrl}`);
    console.log(`    Metadata       : ${ipfsInfo.metadataUrl}`);
    console.log(`    Logo Gateway   : ${ipfsInfo.logoGateway}`);
    console.log(`    Meta Gateway   : ${ipfsInfo.metadataGateway}`);
  }

  console.log("");
  console.log("  LIQUIDITY (NEXT STEPS)");
  liqPlan.steps.slice(0, 4).forEach((s) => console.log(`    ${s}`));
  console.log(`    ...see liquidity-plan.json for full steps`);

  console.log("");
  console.log("  SECURITY REMINDERS");
  console.log("    ⚠  Lock LP tokens immediately after adding liquidity");
  console.log("    ⚠  Never share your DEPLOYER_PRIVATE_KEY");
  console.log("    ⚠  Consider renouncing ownership or using a multisig");
  console.log("");
  console.log("╚══════════════════════════════════════════════════════╝");
  console.log(`  Completed : ${new Date().toISOString()}`);
  console.log("╚══════════════════════════════════════════════════════╝\n");
}

main().catch((err) => {
  console.error("\n[FATAL] Launch script crashed:", err.message);
  process.exit(1);
});
