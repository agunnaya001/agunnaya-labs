# Agunnaya Labs — Web3 × AI Ecosystem

> Full-stack Web3 platform combining AI-powered smart contract security, on-chain blockchain gaming, and SaaS infrastructure — all live on **Base mainnet**.

![Base Mainnet](https://img.shields.io/badge/Network-Base%20Mainnet-0052ff?style=flat-square&logo=coinbase)
![Chain ID](https://img.shields.io/badge/Chain%20ID-8453-0052ff?style=flat-square)
![Token](https://img.shields.io/badge/AGL%20Token-ERC--20-c8ff00?style=flat-square)
![License](https://img.shields.io/badge/License-MIT-22c55e?style=flat-square)
![React](https://img.shields.io/badge/React-19-61dafb?style=flat-square&logo=react)
![Vite](https://img.shields.io/badge/Vite-7-646cff?style=flat-square&logo=vite)
![Solidity](https://img.shields.io/badge/Solidity-0.8-363636?style=flat-square&logo=solidity)

-----

## Table of Contents

1. [Overview](#overview)
1. [Live Contracts](#live-contracts)
1. [Features](#features)
1. [Tech Stack](#tech-stack)
1. [Project Structure](#project-structure)
1. [Getting Started](#getting-started)
1. [Environment Variables](#environment-variables)
1. [Deployment](#deployment)
1. [Smart Contract Addresses](#smart-contract-addresses)
1. [Security](#security)
1. [Contributing](#contributing)
1. [License](#license)

-----

## Overview

Agunnaya Labs is a four-product ecosystem built on Base mainnet:

|Product           |Description                                                 |
|------------------|------------------------------------------------------------|
|**AGL Token**     |ERC-20 governance and utility token · 1 billion fixed supply|
|**Arena**         |On-chain PvP battle game with ERC-721 champion NFTs         |
|**AI Auditor Bot**|GitHub-integrated smart contract vulnerability scanner      |
|**SaaS Platform** |Analytics, automation, and REST API for Web3 builders       |

The web app is a single-page React application with live on-chain reads (ethers.js), MetaMask wallet integration, and a custom terminal-inspired dark UI.

-----

## Live Contracts

All contracts are deployed on **Base Mainnet (Chain ID 8453)** and verified on BaseScan.

|Contract                   |Address                                     |BaseScan                                                                         |
|---------------------------|--------------------------------------------|---------------------------------------------------------------------------------|
|**AGL Token** (ERC-20)     |`0xEA1221B4d80A89BD8C75248Fae7c176BD1854698`|[View ↗](https://basescan.org/token/0xEA1221B4d80A89BD8C75248Fae7c176BD1854698)  |
|**ArenaToken** (ERC-20)    |`0x3b855F88CB93aA642EaEB13F59987C552Fc614b5`|[View ↗](https://basescan.org/token/0x3b855F88CB93aA642EaEB13F59987C552Fc614b5)  |
|**ArenaChampion** (ERC-721)|`0x68f08b005b09B0F7D07E1c0B5CDe18E43CE2486A`|[View ↗](https://basescan.org/token/0x68f08b005b09B0F7D07E1c0B5CDe18E43CE2486A)  |
|**ArenaBattle**            |`0xF6fc2B6a306B626548ca9dF25B31a22D0f8971CF`|[View ↗](https://basescan.org/address/0xF6fc2B6a306B626548ca9dF25B31a22D0f8971CF)|


> Deployer wallet: `0xFfb6505912FCE95B42be4860477201bb4e204E9f`

-----

## Features

### Web App

- **Live on-chain data** — block number, gas price, AGL total supply, and holder stats read directly from Base RPC in real time
- **MetaMask wallet** — connect, switch to Base network, view AGL balance, add AGL token to wallet in one click, auto-reconnect on page load
- **Custom cursor** — acid-green dot + ring cursor, hidden on touch devices
- **Animated stat counters** — numbers count up from zero on scroll-into-view
- **Toast notifications** — feedback for copy events, wallet actions, and form errors
- **Scroll progress bar** — fixed top indicator showing reading progress
- **Back-to-top FAB** — appears after 500px scroll
- **Mobile sticky wallet bar** — bottom bar on phones showing wallet/network status
- **Active section nav highlighting** — current section lit in the nav as you scroll
- **Lazy loading** — all below-fold sections loaded on demand (Suspense + lazy)
- **Error boundaries** — every section wrapped; individual failures show a retry button
- **Reduce-motion support** — all animations disabled when system prefers-reduced-motion

### Sections

|Section           |What it shows                                                         |
|------------------|----------------------------------------------------------------------|
|**Hero**          |Headline, live RPC stats (supply, block, gas), CTA buttons            |
|**AI Security**   |GitHub Auditor Bot feature cards, integration instructions            |
|**Arena**         |Contract breakdown, token metrics, live gas price                     |
|**Leaderboard**   |On-chain PvP rankings podium + sortable table                         |
|**NFT Gallery**   |ArenaChampion ERC-721 cards with rarity filter, sort, and detail modal|
|**Audit Activity**|Live vulnerability feed with severity filter tabs                     |
|**Pro**           |Free vs Pro pricing cards                                             |
|**SaaS**          |Upcoming platform products (Analytics, AI Automation, Security API)   |
|**Waitlist**      |Email opt-in form via Formspree                                       |

-----

## Tech Stack

### Frontend

|Technology                    |Version     |Purpose                        |
|------------------------------|------------|-------------------------------|
|React                         |19          |UI framework                   |
|TypeScript                    |5.x         |Type safety                    |
|Vite                          |7           |Build tool & dev server        |
|Tailwind CSS                  |4           |Utility-first styling          |
|ethers.js                     |6           |Ethereum / Base RPC interaction|
|Framer Motion                 |11          |Animations                     |
|Lucide React                  |latest      |Icon system                    |
|DM Mono / DM Sans / Bebas Neue|Google Fonts|Typography                     |

### Smart Contracts

|Technology            |Version|Purpose                |
|----------------------|-------|-----------------------|
|Solidity              |0.8.x  |Smart contract language|
|Hardhat               |2.x    |Compile, test, deploy  |
|OpenZeppelin Contracts|5      |ERC-20 / ERC-721 base  |
|hardhat-etherscan     |latest |BaseScan verification  |

### Infrastructure

|Service                  |Purpose                             |
|-------------------------|------------------------------------|
|Base Mainnet (Chain 8453)|L2 Ethereum chain for all contracts |
|Pinata (IPFS)            |Token metadata and NFT asset hosting|
|BaseScan                 |Contract verification and explorer  |
|Formspree                |Waitlist form backend               |
|Vercel                   |AI Auditor Bot deployment           |
|Replit                   |Web app hosting & development       |

-----

## Project Structure

```
agunnaya-labs/
├── src/
│   ├── components/
│   │   ├── Header.tsx          # Sticky nav, wallet panel, block number
│   │   ├── HeroSection.tsx     # Hero with live RPC stats
│   │   ├── AISection.tsx       # AI Security feature cards
│   │   ├── ArenaSection.tsx    # Arena contracts + token metrics
│   │   ├── LeaderboardSection.tsx  # PvP rankings podium + table
│   │   ├── NFTSection.tsx      # ERC-721 gallery + modal
│   │   ├── AuditSection.tsx    # Vulnerability feed + severity filters
│   │   ├── ProSection.tsx      # Pricing tiers
│   │   ├── SaasSection.tsx     # Upcoming SaaS products
│   │   ├── WaitlistSection.tsx # Email form
│   │   ├── SiteFooter.tsx      # Footer + contract links
│   │   ├── CustomCursor.tsx    # Acid-green cursor
│   │   ├── BgCanvas.tsx        # Animated particle canvas
│   │   ├── BackToTop.tsx       # Floating back-to-top button
│   │   ├── MobileWalletBar.tsx # Mobile bottom wallet bar
│   │   └── ErrorBoundary.tsx   # Per-section error catching
│   ├── context/
│   │   ├── ProviderContext.tsx  # Shared ethers JsonRpcProvider
│   │   └── ToastContext.tsx     # Global toast notification system
│   ├── hooks/
│   │   ├── useWallet.ts        # MetaMask connection + AGL balance
│   │   └── useReveal.ts        # Scroll-triggered reveal animations
│   ├── config.ts               # Contract addresses, RPC URL, constants
│   ├── App.tsx                 # Root layout with lazy section loading
│   ├── main.tsx                # React entry point
│   └── index.css               # Global styles, design tokens, keyframes
├── index.html                  # SEO meta, Open Graph, JSON-LD
├── vite.config.ts              # Vite + Tailwind + Replit plugins
├── tsconfig.json
└── package.json
```

-----

## Getting Started

### Prerequisites

- Node.js 20+
- pnpm 9+ (`npm i -g pnpm`)
- MetaMask browser extension (for wallet features)

### Install

```bash
git clone https://github.com/agunnaya001/agunnaya-labs.git
cd agunnaya-labs
pnpm install
```

### Development

```bash
PORT=5173 BASE_PATH=/ pnpm --filter @workspace/agunnaya-labs run dev
```

Open <http://localhost:5173>.

### Build

```bash
PORT=5173 BASE_PATH=/ pnpm --filter @workspace/agunnaya-labs run build
```

Output goes to `dist/public/`.

### Typecheck

```bash
pnpm --filter @workspace/agunnaya-labs run typecheck
```

-----

## Environment Variables

The following environment variables are required at build/dev time:

|Variable   |Required|Description                  |
|-----------|--------|-----------------------------|
|`PORT`     |Yes     |Dev server port (e.g. `5173`)|
|`BASE_PATH`|Yes     |Vite base path (e.g. `/`)    |

The following variables are for the smart contract tooling (Hardhat), not the frontend:

|Variable              |Required   |Description                               |
|----------------------|-----------|------------------------------------------|
|`DEPLOYER_PRIVATE_KEY`|Deploy only|Private key of the deployer wallet        |
|`BASESCAN_API_KEY`    |Verify only|BaseScan API key for contract verification|
|`PINATA_JWT`          |Upload only|Pinata JWT for IPFS metadata uploads      |


> **Never commit private keys.** Use `.env` files locally (gitignored) or your hosting provider’s secrets manager.

-----

## Deployment

### Web App

The app is hosted on Replit and published as a static web application. To deploy to your own server:

```bash
pnpm --filter @workspace/agunnaya-labs run build
# Serve dist/public/ with any static host (Vercel, Netlify, Nginx, etc.)
```

### Smart Contracts

Contracts are already deployed on Base mainnet. To re-deploy or deploy to a testnet:

```bash
cd contracts
pnpm install
npx hardhat compile
npx hardhat run scripts/deploy.ts --network base
npx hardhat verify --network base <CONTRACT_ADDRESS> <CONSTRUCTOR_ARGS>
```

Set your `.env`:

```
DEPLOYER_PRIVATE_KEY=your_private_key_here
BASESCAN_API_KEY=your_basescan_api_key_here
```

-----

## Smart Contract Addresses

### AGL Token — ERC-20

```
Address:     0xEA1221B4d80A89BD8C75248Fae7c176BD1854698
Name:        Agunnaya Labs Token
Symbol:      AGL
Decimals:    18
Total Supply: 1,000,000,000 AGL (fixed, no mint)
Network:     Base Mainnet (Chain ID 8453)
```

**Add to MetaMask:**

- Token Address: `0xEA1221B4d80A89BD8C75248Fae7c176BD1854698`
- Symbol: `AGL`
- Decimals: `18`

Or click “Add AGL to MetaMask” on the [live site](https://agunnaya-labs.replit.app).

### Arena Contracts

```
ArenaToken   (ERC-20):  0x3b855F88CB93aA642EaEB13F59987C552Fc614b5
ArenaChampion (ERC-721): 0x68f08b005b09B0F7D07E1c0B5CDe18E43CE2486A
ArenaBattle:             0xF6fc2B6a306B626548ca9dF25B31a22D0f8971CF
```

-----

## Security

- All contracts are verified on BaseScan
- AGL token: fixed supply, no owner privileges, no mint or burn functions, no proxy
- Arena contracts: battle logic separated from token; champion NFTs owned by player wallets
- Frontend: no private keys, no signing, read-only RPC calls for data display
- AI Auditor Bot scans for: reentrancy, tx.origin misuse, integer overflow, honeypot patterns, unchecked returns, and more

**Found a vulnerability?** Please open a private security advisory on GitHub or email the org directly — do not open a public issue.

-----

## Contributing

Contributions, issues, and feature requests are welcome.

1. Fork the repo
1. Create a feature branch (`git checkout -b feat/your-feature`)
1. Commit your changes (`git commit -m 'feat: add your feature'`)
1. Push to the branch (`git push origin feat/your-feature`)
1. Open a Pull Request

Please follow the existing code style (TypeScript strict, no `any`, functional components, CSS custom properties for design tokens).

-----

## Organization

**Agunnaya Labs** — building AI × Web3 infrastructure on Base.

- GitHub Org: [github.com/Agunnaya-Labs](https://github.com/Agunnaya-Labs)
- GitHub Profile: [@agunnaya001](https://github.com/agunnaya001)
- BaseScan: [basescan.org/token/0xEA1221…](https://basescan.org/token/0xEA1221B4d80A89BD8C75248Fae7c176BD1854698)

-----

## License

MIT © 2025 Agunnaya Labs

-----

<div align="center">
  Built on <strong>Base</strong> · Powered by <strong>AI</strong> · Secured by <strong>Code</strong>
</div>
