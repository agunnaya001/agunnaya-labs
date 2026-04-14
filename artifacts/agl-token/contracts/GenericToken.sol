// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title GenericToken
 * @notice A reusable, clean ERC-20 token for the Agunnaya Labs ecosystem.
 * @dev Fixed supply. No taxes, no blacklist, no mint after deployment, no proxy, no honeypot.
 *      Deploy with custom name, symbol, and supply via constructor args.
 */
contract GenericToken is ERC20, Ownable {
    uint8 private immutable _decimals;

    constructor(
        string memory name_,
        string memory symbol_,
        uint256 totalSupply_,
        uint8 decimals_,
        address initialOwner_
    )
        ERC20(name_, symbol_)
        Ownable(initialOwner_)
    {
        _decimals = decimals_;
        _mint(initialOwner_, totalSupply_ * (10 ** decimals_));
    }

    function decimals() public view override returns (uint8) {
        return _decimals;
    }

    /**
     * @notice Burns tokens from the caller's balance.
     */
    function burn(uint256 amount) external {
        _burn(msg.sender, amount);
    }
}
