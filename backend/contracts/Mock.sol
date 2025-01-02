// SPDX-License-Identifier: MIT
pragma solidity ^0.8.27;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract MockUSDC is ERC20 {
    constructor() ERC20("Mock USDC", "mUSDC") {
        // Initial mint to the deployer
        _mint(msg.sender, 1_000_000 * 10 ** decimals());
    }

    function decimals() public pure override returns (uint8) {
        return 6; // USDC utilise 6 décimales
    }
    /**
     * @dev Mints tokens to a specified address
     * @param account The address to receive the minted tokens
     * @param amount The amount of tokens to mint
     */

    function mint(address account, uint256 amount) external {
        _mint(account, amount);
    }
}
