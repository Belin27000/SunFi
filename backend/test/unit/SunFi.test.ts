import { loadFixture } from "@nomicfoundation/hardhat-toolbox/network-helpers";
import { HardhatEthersSigner } from "@nomicfoundation/hardhat-ethers/signers";
import { expect } from "chai";
import hre from "hardhat";
import { SunFi } from "../../typechain-types";
import { assert } from "console";

describe("SunFi contract test", function () {

    let owner: HardhatEthersSigner
    let addr1: HardhatEthersSigner
    let addr2: HardhatEthersSigner
    let contractDeployed: SunFi;


    async function deployContractFixture() {
        [owner, addr1, addr2] = await hre.ethers.getSigners();
        const contractDeployed = await hre.ethers.deployContract("SunFi");

        return { contractDeployed, owner, addr1, addr2 }
    }
    // ::::::::::::: FONCTIONS UTILITAIRES ::::::::::::: //

    // Fonction utilitaire pour ajouter des clients
    async function addClient(client: HardhatEthersSigner) {
        await contractDeployed.connect(owner).addClient(client)
    }

    //Deploiement du contrat avant chaque test
    beforeEach(async function () {
        ({ contractDeployed, owner, addr1, addr2 } = await loadFixture(deployContractFixture));
    })

    it("Should set the right owner", async function () {
        const { owner, contractDeployed } = await loadFixture(deployContractFixture)
        expect(await contractDeployed.owner()).to.equal(owner.address);
    })

    // ::::::::::::: GETTERS ::::::::::::: //

    it("Should return  the correct client information for a registered address", async function () {
        await contractDeployed.connect(owner).addClient(addr1.address)
        const client = await contractDeployed.getClient(addr1.address);
        expect(client.isRegistered).to.equal(true);
    })
    // ::::::::::::: CLIENT REGISTRATION ::::::::::::: //

    it("Should revert if the owner try to be registered as client", async function () {

        await expect(addClient(owner)).to.be.revertedWith("Owner cannot be registered as a client");

    })
    it("Should revert if an adress is already registered", async function () {
        await addClient(addr1)
        await expect(addClient(addr1)).to.be.revertedWith("This adress already registered as a client address!");

    })

    it("Should emit the event ClientRegistered", async function () {
        // await expect(addClient(addr1)).to.emit(contractDeployed, "ClientRegistered").withArgs(addr1.address);
        await expect(contractDeployed.connect(owner).addClient(addr1.address))
            .to.emit(contractDeployed, "ClientRegistered")
            .withArgs(addr1.address);
    })
    it("Should revert if the adress is not in the list 'clients'", async function () {
        await expect(contractDeployed.connect(owner).deleteClient(addr1.address))
            .to.revertedWith("This address is not a client adress")
    })
    it("Should emit if the client is delete from the list 'clients'", async function () {
        await contractDeployed.connect(owner).addClient(addr1.address);
        await expect(contractDeployed.connect(owner).deleteClient(addr1.address))
            .to.emit(contractDeployed, "ClientRegistered")
            .withArgs(addr1.address);
    })

    // ::::::::::::: Mint Token ::::::::::::: //
    it("Sould revert if the mint adrress is not into the list 'clients'", async function () {
        await contractDeployed.connect(owner).addClient(addr1.address);
        await expect(contractDeployed.connect(addr1).getSunWattToken(addr2.address, 100))
            .to.be.revertedWith("This address is not a client adress")
    })
    it("Should mint tokens for a registered client", async function () {
        await contractDeployed.connect(owner).addClient(addr1.address);
        await contractDeployed.connect(addr1).getSunWattToken(addr1.address, 1000);

        const balance = await contractDeployed.balanceOf(addr1.address);
        expect(balance).to.equal(1000);

    })

});
