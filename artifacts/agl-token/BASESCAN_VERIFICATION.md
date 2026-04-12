# BaseScan Manual Verification Guide

If `npm run verify` fails, you can verify manually on BaseScan.

## Automated (Preferred)

```bash
npm run verify
```

This runs `hardhat verify` with the exact constructor arguments from `deployment.json`.

## Manual Verification Steps

1. Go to: `https://basescan.org/address/YOUR_CONTRACT_ADDRESS#code`
2. Click **"Verify and Publish"**
3. Fill in:

| Field | Value |
|---|---|
| Contract Address | (from deployment.json) |
| Compiler Type | Solidity (Single file) |
| Compiler Version | `v0.8.20+commit.a1b79de6` |
| Open Source License | MIT |
| Optimization | Yes |
| Optimization Runs | 200 |

4. Paste the **full contents of `contracts/AGLToken.sol`** into the source code box.

5. Under **Constructor Arguments (ABI-encoded)**:
   - The constructor takes `address initialOwner`
   - ABI-encode your deployer address:
   ```
   000000000000000000000000YOUR_DEPLOYER_ADDRESS_WITHOUT_0x
   ```
   Example for address `0x1234...abcd`:
   ```
   0000000000000000000000001234abcd...
   ```

6. Add **OpenZeppelin library imports** — BaseScan needs the flattened source.
   To flatten:
   ```bash
   npx hardhat flatten contracts/AGLToken.sol > AGLToken.flat.sol
   ```
   Then paste `AGLToken.flat.sol` content instead.

7. Click **Verify and Publish** → should show green checkmark.

## Compiler Settings Summary

```json
{
  "language": "Solidity",
  "compiler": "0.8.20",
  "optimizer": {
    "enabled": true,
    "runs": 200
  },
  "evmVersion": "paris"
}
```

## Troubleshooting

- **"Already Verified"** → Contract is already public, nothing to do.
- **"Bytecode mismatch"** → Ensure exact compiler version `0.8.20` and same optimizer settings.
- **"Invalid constructor arguments"** → Re-check the ABI-encoded deployer address.
- **"Source code size too large"** → Use the flattened file via `hardhat flatten`.
