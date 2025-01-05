// SPDX-License-Identifier: MIT
pragma solidity ^0.8.27;

// Uncomment this line to use console.log
import "hardhat/console.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract SunFi is ERC20, Ownable {
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
    mapping(address => bool) private authorizedMinters;

    event ClientRegistered(address clientAdress, uint256 maxMintable);
    event TokenMinted(address indexed recipient, uint256 amount);
    event MaxMintableUpdated(address indexed client, uint256 newMaxMintable);

    event ReceivedEther(address sender, uint256 amount);
    event FallbackCalled(address sender, uint256 amount, bytes data);

    // Modifier pour restreindre l'accès à `mint`
    modifier onlyAuthorized() {
        require(authorizedMinters[msg.sender], "Not authorized to mint");
        _;
    }
    constructor() payable Ownable(msg.sender) ERC20("SunWatt", "KWH") {}

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

    // ::::::::::::: Mint Rewards Token ::::::::::::: //

    // Ajouter une fonction pour autoriser un contrat spécifique
    function authorizeMinter(address minter) external onlyOwner {
        authorizedMinters[minter] = true;
    }

    // Supprimer l'autorisation d'un minter
    function revokeMinter(address minter) external onlyOwner {
        authorizedMinters[minter] = false;
    }

    // Mise à jour de la fonction `mint`
    function mint(address to, uint256 amount) external onlyAuthorized {
        _mint(to, amount);
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

        uint256[] memory amounts = new uint256[](length);
        uint256[] memory timestamps = new uint256[](length);

        for (uint256 i = 0; i < length; i++) {
            amounts[i] = mintHistory[user][i].amount;
            timestamps[i] = mintHistory[user][i].timestamp;
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
