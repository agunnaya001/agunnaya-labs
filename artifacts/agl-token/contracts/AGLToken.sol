// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title AGLToken
 * @notice Agunnaya Labs Token (AGL) — AI-powered smart contract security research token on Base
 * @dev Fixed supply ERC-20. No taxes, no blacklist, no mint after deployment, no proxy, no honeypot.
 *      Clean, audit-friendly, production-safe.
 */
contract AGLToken is ERC20, Ownable {
    uint256 public constant TOTAL_SUPPLY = 1_000_000_000 * 10 ** 18; // 1 Billion AGL

    constructor(address initialOwner)
        ERC20("Agunnaya Labs", "AGL")
        Ownable(initialOwner)
    {
        _mint(initialOwner, TOTAL_SUPPLY);
    }

    /**
     * @notice Burns tokens from the caller's balance.
     * @dev Tokens burned are permanently removed from circulation.
     */
    function burn(uint256 amount) external {
        _burn(msg.sender, amount);
    }
}
