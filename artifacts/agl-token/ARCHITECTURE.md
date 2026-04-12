# Agunnaya Labs — AGL Token Launch System Architecture

```
╔══════════════════════════════════════════════════════════════════════╗
║               AGL TOKEN LAUNCH SYSTEM — ARCHITECTURE                ║
╚══════════════════════════════════════════════════════════════════════╝

  npm run launch
       │
       ▼
  ┌─────────────────────────────────┐
  │       launch.js (Orchestrator)  │
  │   Preflight checks → .env vars  │
  └──────────┬──────────────────────┘
             │
    ┌────────▼────────┐
    │  1. COMPILE     │  hardhat compile → AGLToken.sol → ABI + bytecode
    └────────┬────────┘
             │
    ┌────────▼────────┐
    │  2. DEPLOY      │  deploy.js → Base Mainnet (RPC)
    │                 │    → AGLToken(initialOwner)
    │                 │    → Fixed 1,000,000,000 AGL minted to owner
    │                 │    → Saves deployment.json
    └────────┬────────┘
             │
    ┌────────▼────────┐
    │  3. VERIFY      │  verify.js → BaseScan API
    │                 │    → Source code + constructor args
    │                 │    → Open-source and publicly readable
    └────────┬────────┘
             │
    ┌────────▼────────┐
    │  4+5. IPFS      │  ipfs.js → Pinata API
    │                 │    → logo.png → ipfs://CID_logo
    │                 │    → metadata.json → ipfs://CID_meta
    │                 │    → Saves ipfs.json
    └────────┬────────┘
             │
    ┌────────▼────────┐
    │  6. LIQUIDITY   │  liquidity.js → Uniswap plan
    │                 │    → AGL/WETH pair strategy
    │                 │    → LP lock recommendations
    │                 │    → Saves liquidity-plan.json
    └────────┬────────┘
             │
    ┌────────▼────────┐
    │  7. SUMMARY     │  Full launch report printed to terminal
    └─────────────────┘


CONTRACT ARCHITECTURE (AGLToken.sol)
─────────────────────────────────────

  ERC20 (OpenZeppelin v5)
    ├── name()          → "Agunnaya Labs"
    ├── symbol()        → "AGL"
    ├── decimals()      → 18
    ├── totalSupply()   → 1,000,000,000 * 10^18
    ├── balanceOf()
    ├── transfer()
    ├── approve()
    ├── transferFrom()
    └── burn()          → reduces circulating supply permanently

  Ownable (OpenZeppelin v5)
    ├── owner()         → deployer address at launch
    ├── transferOwnership()
    └── renounceOwnership()  ← recommended post-launch

  ✓ No mint() after constructor
  ✓ No tax logic
  ✓ No blacklist / whitelist
  ✓ No proxy / upgradeable pattern
  ✓ No hidden admin functions


FILE STRUCTURE
──────────────

  agl-token/
  ├── contracts/
  │   └── AGLToken.sol          ← ERC-20 contract (audit-ready)
  ├── scripts/
  │   ├── deploy.js             ← Deploy to Base
  │   ├── verify.js             ← BaseScan verification
  │   ├── ipfs.js               ← Pinata IPFS upload (logo + metadata)
  │   ├── liquidity.js          ← Uniswap liquidity plan generator
  │   └── launch.js             ← Master orchestrator (npm run launch)
  ├── src/
  │   └── logo.png              ← Place 512x512 PNG here before IPFS upload
  ├── hardhat.config.js         ← Hardhat + BaseScan config
  ├── package.json              ← Scripts and dependencies
  ├── metadata.json             ← Token metadata template
  ├── .env.example              ← Environment variable template
  ├── ARCHITECTURE.md           ← This file
  └── LAUNCH_CHECKLIST.md       ← Pre-launch safety checklist


NETWORK TOPOLOGY
────────────────

  Developer Machine
       │
       ├── hardhat → Base Mainnet RPC (mainnet.base.org or Alchemy)
       │                 └── Contract deployment + verification
       │
       ├── node scripts/ipfs.js → Pinata API (api.pinata.cloud)
       │                              └── IPFS pinning (logo + metadata)
       │
       └── Output files
              ├── deployment.json   (contract address, tx hash, network info)
              ├── ipfs.json         (IPFS hashes and gateway URLs)
              └── liquidity-plan.json (Uniswap pair setup guide)
```
