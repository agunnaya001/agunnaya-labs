const fs = require("fs");
const path = require("path");

async function main() {
  console.log("\n╔══════════════════════════════════════════════════╗");
  console.log("║       AGUNNAYA LABS — LIQUIDITY PLAN             ║");
  console.log("╚══════════════════════════════════════════════════╝\n");

  const deployPath = path.join(__dirname, "..", "deployment.json");
  let contractAddress = "NOT_DEPLOYED_YET";
  let totalSupply = 1_000_000_000;

  if (fs.existsSync(deployPath)) {
    const deploy = JSON.parse(fs.readFileSync(deployPath, "utf8"));
    contractAddress = deploy.contractAddress;
  }

  const INITIAL_LIQUIDITY_ETH = 1.0;
  const LIQUIDITY_AGL_PERCENT = 10;
  const LIQUIDITY_AGL_AMOUNT = (totalSupply * LIQUIDITY_AGL_PERCENT) / 100;

  const LOCK_PERIOD_DAYS = 180;
  const LOCK_RECOMMENDATION = "Team Locker (https://teamfinance.com) or UniCrypt (https://unicrypt.network)";

  const plan = {
    pair: "AGL / WETH",
    dex: "Uniswap V3 on Base",
    dexUrl: "https://app.uniswap.org/add/ETH",
    contractAddress,
    initialLiquidityETH: INITIAL_LIQUIDITY_ETH,
    initialLiquidityAGL: LIQUIDITY_AGL_AMOUNT,
    aglPercent: LIQUIDITY_AGL_PERCENT,
    lockPeriodDays: LOCK_PERIOD_DAYS,
    lockRecommendation: LOCK_RECOMMENDATION,
    steps: [
      "1. Deploy AGL contract and verify on BaseScan (run: npm run deploy && npm run verify)",
      "2. Import AGL token into MetaMask using the contract address",
      "3. Go to: https://app.uniswap.org/add/ETH on Base network",
      "4. Select AGL as the second token using the contract address",
      "5. Choose fee tier: 1% (recommended for new/volatile token)",
      `6. Provide ${INITIAL_LIQUIDITY_ETH} ETH + ${LIQUIDITY_AGL_AMOUNT.toLocaleString()} AGL as initial liquidity`,
      `7. Lock LP tokens for minimum ${LOCK_PERIOD_DAYS} days using: ${LOCK_RECOMMENDATION}`,
      "8. Announce LP lock publicly with the lock transaction hash",
    ],
    antiRugBestPractices: [
      "Lock LP tokens immediately — never keep them in a wallet you control",
      "Renounce or use a multisig for owner wallet after initial setup",
      "Publish LP lock proof on X and Telegram before marketing pushes",
      "Do not mint additional tokens — contract has fixed supply",
      "Do not deploy upgrade proxies — contract is immutable",
      "Audit the contract before adding significant liquidity",
      "Start with modest liquidity and grow organically",
    ],
    warnings: [
      "WARNING: Never remove LP tokens until the lock period expires",
      "WARNING: Avoid deploying >5% of supply in one wallet (whale risk)",
      "WARNING: Do not list on centralized exchanges before establishing on-chain liquidity",
    ],
    generatedAt: new Date().toISOString(),
  };

  console.log("LIQUIDITY DEPLOYMENT PLAN");
  console.log("─────────────────────────────────────────────────\n");
  console.log(`Token Pair         : ${plan.pair}`);
  console.log(`DEX                : ${plan.dex}`);
  console.log(`Contract Address   : ${plan.contractAddress}`);
  console.log(`Initial ETH        : ${plan.initialLiquidityETH} ETH`);
  console.log(`Initial AGL        : ${plan.initialLiquidityAGL.toLocaleString()} AGL (${plan.aglPercent}% of supply)`);
  console.log(`LP Lock Period     : ${plan.lockPeriodDays} days minimum`);
  console.log(`Lock Tool          : ${plan.lockRecommendation}`);

  console.log("\nSTEP-BY-STEP INSTRUCTIONS:");
  plan.steps.forEach((step) => console.log(`  ${step}`));

  console.log("\nANTI-RUG BEST PRACTICES:");
  plan.antiRugBestPractices.forEach((p) => console.log(`  ✓ ${p}`));

  console.log("\nWARNINGS:");
  plan.warnings.forEach((w) => console.log(`  ⚠  ${w}`));

  const outPath = path.join(__dirname, "..", "liquidity-plan.json");
  fs.writeFileSync(outPath, JSON.stringify(plan, null, 2));
  console.log("\nLiquidity plan saved to: liquidity-plan.json");
  console.log(`\nUniswap Add Liquidity URL: ${plan.dexUrl}`);

  return plan;
}

main()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error("[ERROR]", err.message);
    process.exit(1);
  });
