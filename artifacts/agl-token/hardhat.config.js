require("@nomicfoundation/hardhat-toolbox");
require("dotenv").config();

const PRIVATE_KEY = process.env.DEPLOYER_PRIVATE_KEY || "0x0000000000000000000000000000000000000000000000000000000000000001";
const BASESCAN_API_KEY = process.env.BASESCAN_API_KEY || "";

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: {
    version: "0.8.20",
    settings: {
      optimizer: {
        enabled: true,
        runs: 200,
      },
    },
  },
  networks: {
    base: {
      url: process.env.BASE_RPC_URL || "https://mainnet.base.org",
      accounts: [PRIVATE_KEY],
      chainId: 8453,
      // Use explicit minimal gas for Base L2 — much cheaper than Ethereum mainnet
      // maxFeePerGas: 0.015 gwei (well above current ~0.006-0.011 gwei base fee)
      // maxPriorityFeePerGas: 0.001 gwei (minimal tip)
      maxFeePerGas: 15000000,        // 0.015 gwei in wei
      maxPriorityFeePerGas: 1000000, // 0.001 gwei in wei
      gas: 800000,                   // explicit gas limit — avoids over-estimation
    },
    "base-sepolia": {
      url: "https://sepolia.base.org",
      accounts: [PRIVATE_KEY],
      chainId: 84532,
      maxFeePerGas: 15000000,
      maxPriorityFeePerGas: 1000000,
      gas: 800000,
    },
    hardhat: {
      chainId: 1337,
    },
  },
  etherscan: {
    // Etherscan V2: single key, chain-aware routing
    apiKey: BASESCAN_API_KEY,
    customChains: [
      {
        network: "base",
        chainId: 8453,
        urls: {
          apiURL: "https://api.etherscan.io/v2/api?chainid=8453",
          browserURL: "https://basescan.org",
        },
      },
      {
        network: "base-sepolia",
        chainId: 84532,
        urls: {
          apiURL: "https://api.etherscan.io/v2/api?chainid=84532",
          browserURL: "https://sepolia.basescan.org",
        },
      },
    ],
  },
  sourcify: {
    enabled: false,
  },
};
