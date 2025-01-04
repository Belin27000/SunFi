// pragma solidity ^0.8.27;

// import "@openzeppelin/contracts/access/Ownable.sol";
// import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

// interface ISunFi is IERC20 {
//     function mint(address to, uint256 amount) external;
// }

// contract StakingContract is Ownable {
//     ISunFi public sunFiToken;

//     IERC20 public sunFiToken;

//     struct Stake {
//         uint256 amount; //Tokens Stake
//         uint256 startTime;
//         uint256 rewards;
//     }

//     mapping(address => Stake) public stakes;

//     uint256 public liquidityRate;
//     event Staked(address indexed user, uint256 amount);
//     event Unstaked(address indexed user, uint256 amount, uint256 rewards);
//     event LiquidityRareUpdated(uint256 newRate);

//     constructor(address _sunFiToken) Ownable(msg.sender) {
//         sunFiToken = IERC20(_sunFiToken);
//     }

//     // ::::::::::::: ACTUALISER LE TAUX AAVE ::::::::::::: //

//     function updateLiquidityRate(uint256 _newRate) external onlyOwner {
//         liquidityRate = _newRate;
//         emit LiquidityRareUpdated(_newRate);
//     }

//     // ::::::::::::: ACTIVER LE STAKING ::::::::::::: //

//     function stake(uint256 _amount) external {
//         require(_amount > 0, "Cannot stake 0 tokens");
//         require(
//             sunFiToken.transferFrom(msg.sender, address(this), _amount),
//             "Token transfert failed"
//         );
//         Stake storage userStake = stakes[msg.sender];

//         if (userStake.amount > 0) {
//             uint256 rewards = calculateRewards(msg.sender);
//             userStake.rewards += rewards;
//         }
//         userStake.amount += _amount;
//         userStake.startTime = block.timestamp;
//         emit Staked(msg.sender, _amount);
//     }

//     // ::::::::::::: CALCULER LES RÉCOMPENSES ::::::::::::: //

//     function calculateRewards(address _user) public view returns (uint256) {
//         Stake memory userStake = stakes[_user];
//         if (userStake.amount == 0 || liquidityRate == 0) {
//             return 0;
//         }
//         uint256 timeElapsed = block.timestamp - userStake.startTime;
//         uint256 ratePerSecond = liquidityRate / (365 * 24 * 60 * 60);
//         return (userStake.amount * ratePerSecond * timeElapsed);
//     }

//     // ::::::::::::: RETIRER LES TOKENS ET LES RÉCOMPENSES ::::::::::::: //

//     function unstake() external {
//         Stake storage userStake = stakes[msg.sender];
//         require(userStake.amount > 0, "No tokens staked");
//         uint256 rewards = calculateRewards(msg.sender) + userStake.rewards;
//         uint256 totalAmount = userStake.amount + rewards;
//         userStake.amount = 0;
//         userStake.rewards = 0;
//         userStake.startTime = 0;

//         require(
//             sunFiToken.transfer(msg.sender, totalAmount),
//             "Token transfert failed"
//         );
//         sunFiToken.mint(msg.sender, rewards);
//         emit Unstaked(msg.sender, totalAmount, rewards);
//     }
// }
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.27;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

interface ISunFi is IERC20 {
    function mint(address to, uint256 amount) external;
}

contract StakingContract is Ownable {
    ISunFi public sunFiToken;

    struct Stake {
        uint256 amount; // Tokens stakés
        uint256 startTime;
        uint256 rewards;
    }

    mapping(address => Stake) public stakes;

    uint256 public liquidityRate;

    event Staked(address indexed user, uint256 amount);
    event Unstaked(address indexed user, uint256 amount, uint256 rewards);
    event LiquidityRareUpdated(uint256 newRate);

    constructor(address _sunFiToken) Ownable(msg.sender) {
        sunFiToken = ISunFi(_sunFiToken);
    }

    // ::::::::::::: ACTUALISER LE TAUX AAVE ::::::::::::: //
    function updateLiquidityRate(uint256 _newRate) external onlyOwner {
        liquidityRate = _newRate;
        emit LiquidityRareUpdated(_newRate);
    }

    // ::::::::::::: ACTIVER LE STAKING ::::::::::::: //
    function stake(uint256 _amount) external {
        require(_amount > 0, "Cannot stake 0 tokens");
        require(
            sunFiToken.transferFrom(msg.sender, address(this), _amount),
            "Token transfer failed"
        );

        Stake storage userStake = stakes[msg.sender];

        if (userStake.amount > 0) {
            uint256 rewards = calculateRewards(msg.sender);
            userStake.rewards += rewards;
        }

        userStake.amount += _amount;
        userStake.startTime = block.timestamp;

        emit Staked(msg.sender, _amount);
    }

    // ::::::::::::: CALCULER LES RÉCOMPENSES ::::::::::::: //
    function calculateRewards(address _user) public view returns (uint256) {
        Stake memory userStake = stakes[_user];
        if (userStake.amount == 0 || liquidityRate == 0) {
            return 0;
        }
        uint256 timeElapsed = block.timestamp - userStake.startTime;
        uint256 ratePerSecond = liquidityRate / (365 * 24 * 60 * 60);
        return (userStake.amount * ratePerSecond * timeElapsed) / 1e27;
    }

    // ::::::::::::: RETIRER LES TOKENS ET LES RÉCOMPENSES ::::::::::::: //
    function unstake() external {
        Stake storage userStake = stakes[msg.sender];
        require(userStake.amount > 0, "No tokens staked");

        uint256 rewards = calculateRewards(msg.sender) + userStake.rewards;
        uint256 totalAmount = userStake.amount + rewards;

        // Réinitialisation des données de staking
        userStake.amount = 0;
        userStake.rewards = 0;
        userStake.startTime = 0;

        // Mint les récompenses et transférer les tokens stakés
        sunFiToken.mint(msg.sender, rewards);
        require(
            sunFiToken.transfer(msg.sender, userStake.amount),
            "Token transfer failed"
        );

        emit Unstaked(msg.sender, totalAmount, rewards);
    }
}
