// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.27;

// Uncomment this line to use console.log
import "hardhat/console.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

interface IPool {
    function supply(
        address asset,
        uint256 amount,
        address onBehalfOf,
        uint referralCode
    ) external;
    function withdraw(
        address asset,
        uint256 amount,
        address to
    ) external returns (uint256);
}

contract SunFi is ERC20, Ownable {
    address public poolAddress; // Adresse du Pool d'Aave
    address public usdcAddress; // Adresse du contrat USDC

    struct Client {
        bool isRegistered;
        uint256 maxMintable;
        uint256 unusedMintAllowance;
        uint256 lastMintTimestamp;
    }
    struct walletAmount {
        uint256 tokenAmount;
    }
    //Structure de stockage de l'historique des mint de tokens
    struct MintRecord {
        uint256 amount;
        uint256 timestamp;
    }
    mapping(address => Client) clients;
    mapping(address => walletAmount) totalMinted;
    mapping(address => MintRecord[]) public mintHistory;

    event ClientRegistered(address clientAdress, uint256 maxMintable);
    event TokenMinted(address indexed recipient, uint256 amount);
    event MaxMintableUpdated(address indexed client, uint256 newMaxMintable);
    event ReceivedEther(address sender, uint256 amount);
    event FallbackCalled(address sender, uint256 amount, bytes data);

    constructor(
        address _poolAddress,
        address _usdcAddress
    ) payable Ownable(msg.sender) ERC20("SunWatt", "KWH") {
        poolAddress = _poolAddress;
        usdcAddress = _usdcAddress;
    }
    // ::::::::::::: INTERACTIONS WITH AAVE ::::::::::::: //
    function depositUSDC(uint256 amount) external {
        IERC20 usdc = IERC20(usdcAddress);

        uint256 allowance = usdc.allowance(msg.sender, address(this));
        uint256 balance = usdc.balanceOf(msg.sender);

        console.log("Allowance for SunFi:", allowance);
        console.log("Sender balance:", balance);
        console.log("Amount to deposit:", amount);

        require(allowance >= amount, "Insufficient allowance");
        require(balance >= amount, "Insufficient balance");

        bool success = usdc.transferFrom(msg.sender, address(this), amount);
        require(success, "Transfer failed");

        emit ReceivedEther(msg.sender, amount);
    }
    /**
     * @dev Approves and supplies USDC to the Aave Pool
     * @param amount Amount of USDC to supply
     */
    function supplyToAave(uint256 amount) external onlyOwner {
        require(amount > 0, "Amount must be greater than zero");
        require(
            IERC20(usdcAddress).balanceOf(address(this)) >= amount,
            "Insufficient USDC balance in contract"
        );

        // Approve Aave Pool to spend USDC
        IERC20(usdcAddress).approve(poolAddress, amount);

        // Supply USDC to Aave Pool
        IPool(poolAddress).supply(usdcAddress, amount, address(this), 0);

        console.log("Supplied", amount, "USDC to Aave Pool");
    }

    /**
     * @dev Withdraws USDC from Aave Pool
     * @param amount Amount of USDC to withdraw
     */
    function withdrawFromAave(uint256 amount) external onlyOwner {
        require(amount > 0, "Amount must be greater than zero");

        uint256 withdrawnAmount = IPool(poolAddress).withdraw(
            usdcAddress,
            amount,
            address(this)
        );
        require(withdrawnAmount > 0, "Withdrawal failed");

        console.log("Withdrawn", withdrawnAmount, "USDC from Aave Pool");
    }
    // ::::::::::::: GETTERS ::::::::::::: //

    function getClient(
        address _addr
    ) external view returns (bool isRegistered, uint256 maxMintable) {
        if (clients[_addr].isRegistered) {
            return (true, clients[_addr].maxMintable);
        }
        return (false, 0);
    }
    // NOTE: This function is for testing purposes only. Remove in production.

    function getClientData(
        address _addr
    )
        external
        view
        returns (
            bool isRegistered,
            uint256 maxMintable,
            uint256 unusedMintAllowance,
            uint256 lastMintTimestamp
        )
    {
        Client memory client = clients[_addr];
        return (
            client.isRegistered,
            client.maxMintable,
            client.unusedMintAllowance,
            client.lastMintTimestamp
        );
    }
    // ::::::::::::: CLIENT REGISTRATION ::::::::::::: //
    function addClient(address _addr, uint256 _mintableNbr) external onlyOwner {
        require(_addr != owner(), "Owner cannot be registered as a client");
        require(_mintableNbr > 0, "Mintable number must be greater than zero");
        require(
            clients[_addr].isRegistered != true,
            "This adress already registered as a client address!"
        );

        clients[_addr] = Client({
            isRegistered: true,
            maxMintable: _mintableNbr,
            unusedMintAllowance: _mintableNbr,
            lastMintTimestamp: block.timestamp
        });

        emit ClientRegistered(_addr, _mintableNbr);
    }
    // ::::::::::::: CLIENT DELETION ::::::::::::: //

    function deleteClient(address _addr) external onlyOwner {
        require(
            clients[_addr].isRegistered == true,
            "This address is not a client adress"
        );
        clients[_addr] = Client({
            isRegistered: false,
            maxMintable: 0,
            unusedMintAllowance: 0,
            lastMintTimestamp: 0
        });
        emit ClientRegistered(_addr, 0);
    }
    // ::::::::::::: Mint Token ::::::::::::: //
    function getSunWattToken(address recipient, uint amount) external {
        require(
            msg.sender == recipient,
            "Unauthorized: Only token owner can burn their tokens"
        );
        require(
            clients[recipient].isRegistered == true,
            "This address is not a client adress"
        );
        Client storage client = clients[recipient];

        //Calculate the number of days since last mint
        uint256 currentTimestamp = block.timestamp;
        uint256 daysElapsed = (currentTimestamp - client.lastMintTimestamp) /
            1 days;

        if (daysElapsed > 0) {
            uint256 additionalAllowance = daysElapsed * client.maxMintable;

            client.unusedMintAllowance =
                client.maxMintable +
                additionalAllowance;

            //Optional limit the maximum token unused allowance
            // if (client.unusedMintAllowance > client.maxMintable * 10) {
            //     client.unusedMintAllowance = client.maxMintable * 10;
            // }

            // Reset the timestamp to the current day
            client.lastMintTimestamp = currentTimestamp;
        }
        require(
            amount <= client.unusedMintAllowance,
            "Amount exceeds the maximum mintable tokens available"
        );
        client.unusedMintAllowance -= amount;
        _mint(recipient, amount);
        totalMinted[recipient].tokenAmount += amount;

        MintRecord memory record = MintRecord({
            amount: amount,
            timestamp: block.timestamp
        });
        mintHistory[recipient].push(record);

        emit TokenMinted(recipient, amount);
    }
    // ::::::::::::: Burn Token ::::::::::::: //
    function burnSunWattToken(address recipient, uint amount) external {
        require(
            msg.sender == recipient,
            "Unauthorized: Only token owner can burn their tokens"
        );
        require(
            clients[recipient].isRegistered == true,
            "This address is not a client adress"
        );
        require(
            totalMinted[recipient].tokenAmount > 0,
            "Can not burn Token as this address doesn't have any"
        );
        require(
            totalMinted[recipient].tokenAmount > amount,
            "Can not burn more Token than address get"
        );
        _burn(recipient, amount);
        totalMinted[recipient].tokenAmount -= amount;
        emit TokenMinted(recipient, amount);
    }

    // ::::::::::::: Check Token ::::::::::::: //
    function getTotalMinted(address _addr) external view returns (uint256) {
        require(
            clients[_addr].isRegistered == true,
            "This address is not a client adress"
        );

        return totalMinted[_addr].tokenAmount;
    }

    // ::::::::::::: History FUNTION ::::::::::::: //
    function getMintHistory(
        address user
    ) external view returns (uint256[] memory, uint256[] memory) {
        uint256 length = mintHistory[user].length;
        require(length > 0, "No mint history found");

        // console.log("Mint Get History record added for:", user);

        uint256[] memory amounts = new uint256[](length);
        uint256[] memory timestamps = new uint256[](length);

        for (uint256 i = 0; i < length; i++) {
            amounts[i] = mintHistory[user][i].amount;
            timestamps[i] = mintHistory[user][i].timestamp;

            // console.log("Amount for the transaction", amounts[i]);
            // console.log("Amount for the transaction", timestamps[i]);
        }

        return (amounts, timestamps);
    }
    // ::::::::::::: RECEIVED FUNTION ::::::::::::: //
    receive() external payable {
        emit ReceivedEther(msg.sender, msg.value);
    }

    // ::::::::::::: FALLBACK FUNTION ::::::::::::: //
    fallback() external payable {
        emit FallbackCalled(msg.sender, msg.value, msg.data);
    }
}
