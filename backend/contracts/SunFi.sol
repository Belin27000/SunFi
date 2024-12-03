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

    mapping(address => Client) clients;

    event ClientRegistered(address clientAdress);

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
    }
    receive() external payable {}
    fallback() external payable {}
}
