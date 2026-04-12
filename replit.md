# Workspace

## Overview

pnpm workspace monorepo using TypeScript. Each package manages its own dependencies.
Also contains the **Agunnaya Labs (AGL) Token Launch System** — a complete ERC-20 token deployment toolkit for Base network.

## Stack

- **Monorepo tool**: pnpm workspaces
- **Node.js version**: 24
- **Package manager**: pnpm
- **TypeScript version**: 5.9
- **API framework**: Express 5
- **Database**: PostgreSQL + Drizzle ORM
- **Validation**: Zod (`zod/v4`), `drizzle-zod`
- **API codegen**: Orval (from OpenAPI spec)
- **Build**: esbuild (CJS bundle)
- **Blockchain**: Hardhat + OpenZeppelin (ERC-20, Base network)

## Key Commands

- `pnpm run typecheck` — full typecheck across all packages
- `pnpm run build` — typecheck + build all packages
- `pnpm --filter @workspace/api-spec run codegen` — regenerate API hooks and Zod schemas from OpenAPI spec
- `pnpm --filter @workspace/db run push` — push DB schema changes (dev only)
- `pnpm --filter @workspace/api-server run dev` — run API server locally

See the `pnpm-workspace` skill for workspace structure, TypeScript setup, and package details.

## Agunnaya Labs Web App

Located at `artifacts/agunnaya-labs/`. React + Vite + TypeScript + Tailwind + ethers.js.

### AGL Token
- Contract: `0xEA1221B4d80A89BD8C75248Fae7c176BD1854698` — Base Mainnet
- 1,000,000,000 fixed supply · ERC-20 · Verified on BaseScan

### Site Sections
- **Hero** — Live gas price, live AGL total supply, GitHub star count
- **AI Security** — Smart contract auditor bot (GitHub App install link)
- **Arena** — 4 live contracts table with copy addresses, AGL token panel with on-chain data
- **Leaderboard** — On-chain battle rankings, animated podium, win-rate bars
- **NFT Gallery** — ArenaChampion ERC-721 gallery with filter + modal
- **Audit Feed** — Live vulnerability scan results terminal, severity color-coded
- **Pro** — Free vs Pro pricing, Formspree waitlist (`mzdyppdj`)
- **SaaS Roadmap** — Upcoming platform features
- **Waitlist** — Email capture via Formspree

### Design
- Colors: acid green `#c8ff00`, ink `#04070e`, sky `#00aaff`
- Fonts: Bebas Neue (display), DM Sans (body), DM Mono (mono)
- Custom animated cursor, star canvas background, scroll progress bar, scroll-triggered reveals

## AGL Token Launch System

Located at `artifacts/agl-token/`. Self-contained Node.js project (not part of the pnpm workspace).

### Quick Start
```bash
cd artifacts/agl-token
npm install
cp .env.example .env    # fill in DEPLOYER_PRIVATE_KEY + BASESCAN_API_KEY
npm run launch           # full launch: deploy → verify → IPFS → liquidity plan
```

### Individual Commands
- `npm run compile` — compile Solidity contract
- `npm run deploy` — deploy to Base mainnet
- `npm run deploy:testnet` — deploy to Base Sepolia (testnet)
- `npm run verify` — verify on BaseScan
- `npm run ipfs` — upload logo + metadata to IPFS via Pinata
- `npm run liquidity` — generate Uniswap liquidity plan
- `npm run launch` — run full launch sequence

### Files
- `contracts/AGLToken.sol` — ERC-20 contract (OpenZeppelin, audit-ready)
- `scripts/deploy.js` — deployment script
- `scripts/verify.js` — BaseScan verification
- `scripts/ipfs.js` — IPFS upload via Pinata
- `scripts/liquidity.js` — Uniswap liquidity plan generator
- `scripts/launch.js` — master orchestrator
- `hardhat.config.js` — Hardhat config for Base network
- `ARCHITECTURE.md` — system architecture diagram
- `LAUNCH_CHECKLIST.md` — pre-launch safety checklist
- `BASESCAN_VERIFICATION.md` — manual verification guide
- `.env.example` — environment variable template
