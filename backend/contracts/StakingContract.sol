// SPDX-License-Identifier: MIT
pragma solidity ^0.8.27;
import "hardhat/console.sol";

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

interface ISunFi is IERC20 {
    function mint(address to, uint256 amount) external;
    function getClient(
        address _addr
    ) external view returns (bool isRegistered, uint256 maxMintable);
}

contract StakingContract is Ownable {
    ISunFi public sunFiToken;

    struct Stake {
        uint256 amount; // Tokens stakés
        uint256 startTime;
        uint256 rewards;
    }

    mapping(address => Stake) public stakes;
    mapping(address => uint256) public availableTokens;

    uint256 public liquidityRate;
    uint256 constant MAX_UINT256 = type(uint256).max;

    event Staked(address indexed user, uint256 amount);
    event Unstaked(address indexed user, uint256 amount, uint256 rewards);
    event LiquidityRateUpdated(uint256 newRate);

    constructor(address _sunFiToken) Ownable(msg.sender) {
        sunFiToken = ISunFi(_sunFiToken);
        availableTokens[msg.sender] = sunFiToken.balanceOf(msg.sender);
    }

    // ::::::::::::: ACTUALISER LE TAUX AAVE ::::::::::::: //
    function updateLiquidityRate(uint256 _newRate) internal {
        if (_newRate != liquidityRate) {
            liquidityRate = _newRate;
            emit LiquidityRateUpdated(_newRate);
        }
    }

    // ::::::::::::: ACTIVER LE STAKING ::::::::::::: //
    event Debug(address user, uint256 amount, bool approved);
    function stake(uint256 _amount) external {
        emit Debug(
            msg.sender,
            _amount,
            sunFiToken.allowance(msg.sender, address(this)) >= _amount
        );

        require(_amount > 0, "Cannot stake 0 tokens");

        Stake storage userStake = stakes[msg.sender];

        if (userStake.amount > 0) {
            uint256 rewards = calculateRewards(msg.sender);
            userStake.rewards += rewards;
        }
        userStake.amount += _amount;
        userStake.startTime = block.timestamp;
        availableTokens[msg.sender] -= _amount;
        emit Staked(msg.sender, _amount);
    }

    function getAvailableTokens(address _user) public view returns (uint256) {
        return availableTokens[_user];
    }

    function getStake(
        address user
    )
        external
        view
        returns (uint256 amount, uint256 startTime, uint256 rewards)
    {
        Stake memory userStake = stakes[user];
        return (userStake.amount, userStake.startTime, userStake.rewards);
    }
    // ::::::::::::: CALCULER LES RÉCOMPENSES ::::::::::::: //
    function calculateRewards(address _user) public view returns (uint256) {
        Stake memory userStake = stakes[_user];
        if (userStake.amount == 0 || liquidityRate == 0) {
            return 0;
        }
        uint256 timeElapsed = block.timestamp - userStake.startTime;
        uint256 ratePerSecond = (liquidityRate * 1e27) / (365 * 24 * 60 * 60);
        return (userStake.amount * ratePerSecond * timeElapsed) / 1e27;
    }

    // ::::::::::::: RETIRER LES TOKENS ET LES RÉCOMPENSES ::::::::::::: //
    function unstake() external {
        Stake storage userStake = stakes[msg.sender];
        require(userStake.amount > 0, "No tokens staked");

        uint256 rewards = calculateRewards(msg.sender) + userStake.rewards;
        uint256 totalAmount = userStake.amount + rewards;

        // Mint les récompenses et transférer les tokens stakés
        sunFiToken.mint(msg.sender, rewards);
        require(
            sunFiToken.transfer(msg.sender, userStake.amount),
            "Token transfer failed"
        );
        // Réinitialisation des données de staking
        userStake.amount = 0;
        userStake.rewards = 0;
        userStake.startTime = 0;

        emit Unstaked(msg.sender, totalAmount, rewards);
    }
}
