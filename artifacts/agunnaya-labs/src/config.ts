export const BASE_RPC = 'https://mainnet.base.org';
export const BASE_CHAIN_ID = 8453;
export const BASE_CHAIN_HEX = '0x2105';

// Deployed AGL Token
export const AGL_TOKEN = '0xEA1221B4d80A89BD8C75248Fae7c176BD1854698';

// Agunnaya Labs / Arena ecosystem contracts on Base Mainnet
export const ARENA_TOKEN    = '0x3b855F88CB93aA642EaEB13F59987C552Fc614b5';
export const ARENA_CHAMPION = '0x68f08b005b09B0F7D07E1c0B5CDe18E43CE2486A';
export const ARENA_BATTLE   = '0xF6fc2B6a306B626548ca9dF25B31a22D0f8971CF';

export const AUDIT_REPO = 'Agunnaya-Labs/agunnaya-labs.github.io';

export const CONTRACTS = [
  { name: 'AGL Token', type: 'ERC-20', address: AGL_TOKEN, basescanPath: '/token/' },
  { name: 'ArenaToken', type: 'ERC-20', address: ARENA_TOKEN, basescanPath: '/token/' },
  { name: 'ArenaChampion', type: 'ERC-721 NFT', address: ARENA_CHAMPION, basescanPath: '/address/' },
  { name: 'ArenaBattle', type: 'Game Logic', address: ARENA_BATTLE, basescanPath: '/address/' },
];

export const ERC20_ABI = [
  'function name() view returns (string)',
  'function symbol() view returns (string)',
  'function totalSupply() view returns (uint256)',
  'function decimals() view returns (uint8)',
  'function balanceOf(address) view returns (uint256)',
];
