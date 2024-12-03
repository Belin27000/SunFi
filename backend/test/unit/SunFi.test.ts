import { loadFixture } from "@nomicfoundation/hardhat-toolbox/network-helpers";
import { HardhatEthersSigner } from "@nomicfoundation/hardhat-ethers/signers";
import { expect } from "chai";
import hre from "hardhat";
import { SunFi } from "../../typechain-types";

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

});
