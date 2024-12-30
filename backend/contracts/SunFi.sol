// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.27;

// Uncomment this line to use console.log
import "hardhat/console.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
contract SunFi is ERC20, Ownable {
    struct Client {
        bool isRegistered;
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

    event ClientRegistered(address clientAdress);
    event TokenMinted(address indexed recipient, uint256 amount);

    event ReceivedEther(address sender, uint256 amount);
    event FallbackCalled(address sender, uint256 amount, bytes data);

    constructor() payable Ownable(msg.sender) ERC20("SunWatt", "KWH") {}

    // ::::::::::::: GETTERS ::::::::::::: //

    function getClient(address _addr) external view returns (bool) {
        return clients[_addr].isRegistered;
    }

    // ::::::::::::: CLIENT REGISTRATION ::::::::::::: //
    function addClient(address _addr) external onlyOwner {
        require(_addr != owner(), "Owner cannot be registered as a client");
        require(
            clients[_addr].isRegistered != true,
            "This adress already registered as a client address!"
        );

        clients[_addr].isRegistered = true;

        emit ClientRegistered(_addr);
    }
    // ::::::::::::: CLIENT DELETION ::::::::::::: //

    function deleteClient(address _addr) external onlyOwner {
        require(
            clients[_addr].isRegistered == true,
            "This address is not a client adress"
        );
        clients[_addr].isRegistered = false;
        emit ClientRegistered(_addr);
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
        _mint(recipient, amount);
        totalMinted[recipient].tokenAmount += amount;

        MintRecord memory record = MintRecord({
            amount: amount,
            timestamp: block.timestamp
        });
        mintHistory[recipient].push(record);
        // Debug log
        // console.log("Mint record added for:", msg.sender);
        // for (uint256 i = 0; i < mintHistory[recipient].length; i++) {
        //     console.log("Mint Entry Amount:", mintHistory[recipient][i].amount);
        //     console.log(
        //         "Mint Entry Timestamp:",
        //         mintHistory[recipient][i].timestamp
        //     );
        // }

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
