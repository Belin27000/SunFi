// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.27;

// Uncomment this line to use console.log
// import "hardhat/console.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract SunFi is Ownable {
    struct Client {
        bool isRegistered;
    }

    mapping(address => Client) clients;

    event ClientRegistered(address clientAdress);

    constructor() payable Ownable(msg.sender) {}

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
}
