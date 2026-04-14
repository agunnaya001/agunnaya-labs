/**
 * add-liquidity.js
 * ───────────────────────────────────────────────────────────────
 * Adds liquidity to a Uniswap V3 pool on Base Mainnet.
 * Creates the pool if it doesn't exist, then mints a full-range LP position.
 *
 * USAGE:
 *   Set the following environment variables in your .env file:
 *     DEPLOYER_PRIVATE_KEY  — wallet holding both the token and ETH
 *     TOKEN_ADDRESS         — ERC-20 token contract address (e.g. AGL)
 *     LIQUIDITY_ETH         — ETH to deposit (e.g. 0.5)
 *     LIQUIDITY_TOKENS      — Token amount to deposit (e.g. 100000000)
 *     INITIAL_PRICE_ETH     — (optional) price in ETH per token, defaults to auto-computed
 *
 *   Then run:
 *     npm run add-liquidity
 *
 * WHAT IT DOES:
 *   1. Wraps your ETH → WETH
 *   2. Approves token + WETH to Uniswap V3 Position Manager
 *   3. Creates the pool at Uniswap V3 Factory (if not exists)
 *   4. Initializes the pool price (sqrtPriceX96)
 *   5. Mints a full-range LP position
 *   6. Saves pool info to liquidity-result.json
 *
 * CONTRACTS (Base Mainnet):
 *   Uniswap V3 Factory              : 0x33128a8fC17869897dcE68Ed026d694621f6FDfD
 *   NonfungiblePositionManager      : 0x03a520b32C04BF3bEEf7BEb72E919cf822Ed34f4
 *   WETH                            : 0x4200000000000000000000000000000000000006
 *   Fee Tier Used                   : 1% (10000)
 * ───────────────────────────────────────────────────────────────
 */

require("dotenv").config();
const { ethers } = require("ethers");
const fs = require("fs");
const path = require("path");

// ── Base Mainnet addresses ─────────────────────────────────────
const UNISWAP_V3_FACTORY       = "0x33128a8fC17869897dcE68Ed026d694621f6FDfD";
const NONFUNGIBLE_POS_MANAGER  = "0x03a520b32C04BF3bEEf7BEb72E919cf822Ed34f4";
const WETH_ADDRESS             = "0x4200000000000000000000000000000000000006";
const FEE_TIER                 = 10000; // 1%

// Uniswap V3 min/max ticks for 1% fee tier
const TICK_SPACING = 200;
const MIN_TICK     = -887200;
const MAX_TICK     =  887200;

// ── ABIs ──────────────────────────────────────────────────────
const ERC20_ABI = [
  "function approve(address spender, uint256 amount) returns (bool)",
  "function allowance(address owner, address spender) view returns (uint256)",
  "function balanceOf(address account) view returns (uint256)",
  "function decimals() view returns (uint8)",
  "function symbol() view returns (string)",
];

const WETH_ABI = [
  ...ERC20_ABI,
  "function deposit() payable",
  "function withdraw(uint256 amount)",
];

const FACTORY_ABI = [
  "function getPool(address tokenA, address tokenB, uint24 fee) view returns (address pool)",
  "function createPool(address tokenA, address tokenB, uint24 fee) returns (address pool)",
];

const POOL_ABI = [
  "function initialize(uint160 sqrtPriceX96)",
  "function slot0() view returns (uint160 sqrtPriceX96, int24 tick, uint16, uint16, uint16, uint8, bool)",
];

const POS_MANAGER_ABI = [
  "function mint((address token0, address token1, uint24 fee, int24 tickLower, int24 tickUpper, uint256 amount0Desired, uint256 amount1Desired, uint256 amount0Min, uint256 amount1Min, address recipient, uint256 deadline)) returns (uint256 tokenId, uint128 liquidity, uint256 amount0, uint256 amount1)",
];

// ── Helpers ────────────────────────────────────────────────────
function sqrt(value) {
  if (value < 0n) throw new Error("Square root of negative numbers is not supported");
  if (value === 0n) return 0n;
  let z = value;
  let x = value / 2n + 1n;
  while (x < z) { z = x; x = (value / x + x) / 2n; }
  return z;
}

function computeSqrtPriceX96(token0Amount, token1Amount) {
  // price = token1 / token0
  // sqrtPriceX96 = sqrt(price) * 2^96
  const Q96 = 2n ** 96n;
  const SCALE = 10n ** 18n;
  const numerator   = BigInt(token1Amount) * SCALE;
  const denominator = BigInt(token0Amount);
  const priceScaled = numerator / denominator;
  return sqrt(priceScaled) * Q96 / sqrt(SCALE);
}

async function main() {
  const PRIVATE_KEY       = process.env.DEPLOYER_PRIVATE_KEY;
  const TOKEN_ADDRESS     = process.env.TOKEN_ADDRESS;
  const LIQUIDITY_ETH     = process.env.LIQUIDITY_ETH;
  const LIQUIDITY_TOKENS  = process.env.LIQUIDITY_TOKENS;

  if (!PRIVATE_KEY || !TOKEN_ADDRESS || !LIQUIDITY_ETH || !LIQUIDITY_TOKENS) {
    console.error("\n[ERROR] Missing required environment variables.");
    console.error("  Required: DEPLOYER_PRIVATE_KEY, TOKEN_ADDRESS, LIQUIDITY_ETH, LIQUIDITY_TOKENS");
    console.error("\n  Example .env entries:");
    console.error(`    TOKEN_ADDRESS="${require("../deployment.json").contractAddress || "0x..."}" `);
    console.error('    LIQUIDITY_ETH="0.5"');
    console.error('    LIQUIDITY_TOKENS="100000000"');
    process.exit(1);
  }

  console.log("\n╔══════════════════════════════════════════════════╗");
  console.log("║     AGUNNAYA LABS — ADD UNISWAP V3 LIQUIDITY     ║");
  console.log("╚══════════════════════════════════════════════════╝\n");

  const provider = new ethers.JsonRpcProvider(process.env.BASE_RPC_URL || "https://mainnet.base.org");
  const wallet   = new ethers.Wallet(PRIVATE_KEY, provider);

  console.log(`Wallet address   : ${wallet.address}`);
  const ethBal = await provider.getBalance(wallet.address);
  console.log(`ETH balance      : ${ethers.formatEther(ethBal)} ETH`);

  const token     = new ethers.Contract(TOKEN_ADDRESS, ERC20_ABI, wallet);
  const tokenSym  = await token.symbol();
  const tokenDec  = await token.decimals();
  const tokenBal  = await token.balanceOf(wallet.address);
  console.log(`Token            : ${tokenSym} (${TOKEN_ADDRESS})`);
  console.log(`Token balance    : ${ethers.formatUnits(tokenBal, tokenDec)} ${tokenSym}`);

  const weth = new ethers.Contract(WETH_ADDRESS, WETH_ABI, wallet);

  const ethAmount    = ethers.parseEther(LIQUIDITY_ETH);
  const tokenAmount  = ethers.parseUnits(LIQUIDITY_TOKENS, tokenDec);

  if (ethBal < ethAmount + ethers.parseEther("0.01")) {
    throw new Error(`Insufficient ETH. Need at least ${LIQUIDITY_ETH} ETH + 0.01 ETH for gas.`);
  }
  if (tokenBal < tokenAmount) {
    throw new Error(`Insufficient ${tokenSym}. Need ${LIQUIDITY_TOKENS}, have ${ethers.formatUnits(tokenBal, tokenDec)}.`);
  }

  // ── Step 1: Wrap ETH → WETH ──────────────────────────────
  console.log(`\n[1/5] Wrapping ${LIQUIDITY_ETH} ETH → WETH...`);
  const wrapTx = await weth.deposit({ value: ethAmount });
  await wrapTx.wait();
  console.log(`  Done: ${wrapTx.hash}`);

  // ── Step 2: Approve WETH + Token to Position Manager ─────
  console.log(`\n[2/5] Approving WETH to Position Manager...`);
  const approveTx1 = await weth.approve(NONFUNGIBLE_POS_MANAGER, ethAmount);
  await approveTx1.wait();
  console.log(`  Done: ${approveTx1.hash}`);

  console.log(`  Approving ${tokenSym} to Position Manager...`);
  const approveTx2 = await token.approve(NONFUNGIBLE_POS_MANAGER, tokenAmount);
  await approveTx2.wait();
  console.log(`  Done: ${approveTx2.hash}`);

  // ── Sort tokens (Uniswap requires token0 < token1) ───────
  const [token0, token1, amount0Desired, amount1Desired] =
    TOKEN_ADDRESS.toLowerCase() < WETH_ADDRESS.toLowerCase()
      ? [TOKEN_ADDRESS, WETH_ADDRESS, tokenAmount, ethAmount]
      : [WETH_ADDRESS, TOKEN_ADDRESS, ethAmount, tokenAmount];

  const factory = new ethers.Contract(UNISWAP_V3_FACTORY, FACTORY_ABI, wallet);

  // ── Step 3: Create pool if it doesn't exist ───────────────
  console.log(`\n[3/5] Checking if pool exists...`);
  let poolAddress = await factory.getPool(token0, token1, FEE_TIER);

  if (poolAddress === ethers.ZeroAddress) {
    console.log(`  Pool not found. Creating ${tokenSym}/WETH pool (1% fee)...`);
    const createTx = await factory.createPool(token0, token1, FEE_TIER);
    const receipt  = await createTx.wait();
    poolAddress    = await factory.getPool(token0, token1, FEE_TIER);
    console.log(`  Pool created: ${poolAddress}`);
    console.log(`  Tx: ${receipt.hash}`);
  } else {
    console.log(`  Pool already exists: ${poolAddress}`);
  }

  // ── Step 4: Initialize pool price if needed ───────────────
  console.log(`\n[4/5] Initializing pool price...`);
  const pool    = new ethers.Contract(poolAddress, POOL_ABI, wallet);
  const slot0   = await pool.slot0();
  const currentSqrtPriceX96 = slot0[0];

  if (currentSqrtPriceX96 === 0n) {
    const sqrtPriceX96 = computeSqrtPriceX96(amount0Desired, amount1Desired);
    console.log(`  Setting initial price (sqrtPriceX96: ${sqrtPriceX96})...`);
    const initTx = await pool.initialize(sqrtPriceX96);
    await initTx.wait();
    console.log(`  Done: ${initTx.hash}`);
  } else {
    console.log(`  Pool already initialized.`);
  }

  // ── Step 5: Mint LP position ──────────────────────────────
  console.log(`\n[5/5] Adding liquidity (minting LP position)...`);
  const posManager = new ethers.Contract(NONFUNGIBLE_POS_MANAGER, POS_MANAGER_ABI, wallet);
  const deadline   = Math.floor(Date.now() / 1000) + 600; // 10 min

  const mintTx = await posManager.mint({
    token0,
    token1,
    fee: FEE_TIER,
    tickLower: MIN_TICK,
    tickUpper: MAX_TICK,
    amount0Desired,
    amount1Desired,
    amount0Min: 0n,
    amount1Min: 0n,
    recipient: wallet.address,
    deadline,
  });
  const mintReceipt = await mintTx.wait();
  console.log(`  Done: ${mintTx.hash}`);

  const result = {
    poolAddress,
    token0,
    token1,
    tokenSymbol: tokenSym,
    feeTier: FEE_TIER,
    liquidityETH: LIQUIDITY_ETH,
    liquidityTokens: LIQUIDITY_TOKENS,
    lpOwner: wallet.address,
    mintTxHash: mintTx.hash,
    addedAt: new Date().toISOString(),
    basescanPool: `https://basescan.org/address/${poolAddress}`,
    uniswapPool: `https://app.uniswap.org/explore/pools/base/${poolAddress}`,
    dextoolsUrl: `https://www.dextools.io/app/en/base/pair-explorer/${poolAddress}`,
  };

  const outPath = path.join(__dirname, "..", "liquidity-result.json");
  fs.writeFileSync(outPath, JSON.stringify(result, null, 2));

  console.log("\n╔══════════════════════════════════════════════════╗");
  console.log("  LIQUIDITY ADDED SUCCESSFULLY");
  console.log(`  Pool       : ${poolAddress}`);
  console.log(`  Pair       : ${tokenSym} / WETH`);
  console.log(`  Fee Tier   : 1%`);
  console.log(`  Mint TX    : ${mintTx.hash}`);
  console.log(`  BaseScan   : ${result.basescanPool}`);
  console.log(`  Uniswap    : ${result.uniswapPool}`);
  console.log(`  DEXTools   : ${result.dextoolsUrl}`);
  console.log(`  Saved to   : liquidity-result.json`);
  console.log("\n  ⚠  IMPORTANT: Lock your LP tokens immediately!");
  console.log("     Use: https://app.uncx.network/services/lock-liquidity");
  console.log("     or:  https://team.finance/lock-liquidity");
  console.log("╚══════════════════════════════════════════════════╝\n");

  return result;
}

main()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error("\n[ERROR] Add-liquidity failed:", err.message);
    process.exit(1);
  });
