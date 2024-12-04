// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.27;

// Uncomment this line to use console.log
// import "hardhat/console.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract SunFi is ERC20, Ownable {
    struct Client {
        bool isRegistered;
    }
    struct walletAmount {
        uint256 tokenAmount;
    }

    mapping(address => Client) clients;
    mapping(address => walletAmount) totalMinted;

    event ClientRegistered(address clientAdress);
    event TokenMinted(address indexed recipient, uint256 amount);

    event ReceivedEther(address sender, uint256 amount);
    event FallbackCalled(address sender, uint256 amount, bytes data);

    constructor() payable Ownable(msg.sender) ERC20("SunWatt", "SWT") {}

    // ::::::::::::: GETTERS ::::::::::::: //

    function getClient(address _addr) external view returns (Client memory) {
        return clients[_addr];
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
            clients[recipient].isRegistered == true,
            "This address is not a client adress"
        );
        _mint(recipient, amount);
        totalMinted[recipient].tokenAmount += amount;
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

    // ::::::::::::: RECEIVED FUNTION ::::::::::::: //
    receive() external payable {
        emit ReceivedEther(msg.sender, msg.value);
    }

    // ::::::::::::: FALLBACK FUNTION ::::::::::::: //
    fallback() external payable {
        emit FallbackCalled(msg.sender, msg.value, msg.data);
    }
}
