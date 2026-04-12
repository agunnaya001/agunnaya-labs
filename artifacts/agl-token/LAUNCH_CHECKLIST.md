# Agunnaya Labs — AGL Pre-Launch Safety Checklist

Complete every item before running `npm run launch` on mainnet.

## BEFORE DEPLOYMENT

- [ ] Create a dedicated deployer wallet (never use personal wallet)
- [ ] Fund deployer wallet with at least 0.05 ETH on Base (for gas)
- [ ] Copy `.env.example` to `.env` and fill in all values
- [ ] Confirm `DEPLOYER_PRIVATE_KEY` is the correct wallet
- [ ] Confirm `BASESCAN_API_KEY` is valid (test at basescan.org)
- [ ] Run on testnet first: `npm run launch:testnet`
- [ ] Verify testnet contract is correct at https://sepolia.basescan.org
- [ ] Review AGLToken.sol code one final time
- [ ] (Optional) Get contract audited before adding liquidity

## IPFS

- [ ] Place a 512×512 PNG logo at `src/logo.png`
  - Design prompt: Futuristic AI blockchain logo, neon blue/green palette,
    "AGL" monogram, cyber lab theme, circuit board elements, dark background
- [ ] Add `PINATA_JWT` to `.env` (get at https://app.pinata.cloud/keys)
- [ ] Verify `metadata.json` content is correct before uploading

## AFTER DEPLOYMENT

- [ ] Save `deployment.json` to a secure backup location
- [ ] Save `ipfs.json` to a secure backup location
- [ ] Confirm contract is verified on https://basescan.org
- [ ] Add token to your MetaMask using the contract address

## LIQUIDITY

- [ ] Follow all steps in `liquidity-plan.json`
- [ ] Lock LP tokens BEFORE announcing to community
- [ ] Publish lock proof (transaction hash) publicly
- [ ] Announce on X (@agunnaya001) with lock proof

## SECURITY REMINDERS

- [ ] Delete or rotate the deployer private key after setup (use multisig going forward)
- [ ] Do NOT share `.env` file with anyone
- [ ] Do NOT commit `.env` to GitHub (it's in `.gitignore`)
- [ ] Consider calling `renounceOwnership()` or transferring to a multisig
- [ ] Monitor the contract with a blockchain alert tool (e.g., Tenderly, OpenZeppelin Defender)
