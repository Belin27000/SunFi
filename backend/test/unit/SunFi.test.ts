import { loadFixture } from "@nomicfoundation/hardhat-toolbox/network-helpers";
import { HardhatEthersSigner } from "@nomicfoundation/hardhat-ethers/signers";
import { assert, expect } from "chai";
import hre, { ethers } from "hardhat";
import { SunFi } from "../../typechain-types";
import { fetchContractData, fetchSupplierRates } from "../../ignition/modules/aave-project/aaveDataFetcher";


describe("SunFi contract test", function () {

    let owner: HardhatEthersSigner
    let addr1: HardhatEthersSigner
    let addr2: HardhatEthersSigner
    let contractDeployed: SunFi;
    let contractAdress: string;


    async function deployContractFixture() {
        [owner, addr1, addr2] = await ethers.getSigners();

        contractDeployed = await hre.ethers.deployContract("SunFi")
        contractAdress = await contractDeployed.getAddress()

        return { contractDeployed, owner, addr1, addr2, contractAdress }
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

    // ::::::::::::: DEPLOIEMENT DU CONTRAT ::::::::::::: //
    it("DEPLOY - Should deploy the contract and have a valid address", async function () {
        expect(contractAdress).to.be.a("string"); // Vérifiez que l'adresse est une chaîne valide
        console.log("Deployed contract address:", contractAdress);
    });


    it("DEPLOY - Should set the right owner", async function () {
        // const { owner, contractDeployed } = await loadFixture(deployContractFixture)
        expect(await contractDeployed.owner()).to.equal(owner.address);
    })

    // ::::::::::::: GETTERS ::::::::::::: //

    it("GETTERS - Should return  the correct client information for a registered address", async function () {
        await contractDeployed.connect(owner).addClient(addr1.address)
        const client = await contractDeployed.getClient(addr1.address);
        expect(client.isRegistered).to.equal(true);
    })
    // ::::::::::::: CLIENT REGISTRATION ::::::::::::: //

    it("REGISTRATION - Should revert if an address differente form the owner try to add a client", async function () {
        await expect(contractDeployed.connect(addr1).addClient(addr2.address)).to.be.reverted;
    })
    it("REGISTRATION - Should revert if the owner try to be registered as client", async function () {

        await expect(addClient(owner)).to.be.revertedWith("Owner cannot be registered as a client");

    })
    it("REGISTRATION - Should revert if an adress is already registered", async function () {
        await addClient(addr1)
        await expect(addClient(addr1)).to.be.revertedWith("This adress already registered as a client address!");

    })

    it("REGISTRATION - Should emit the event ClientRegistered", async function () {

        await expect(contractDeployed.connect(owner).addClient(addr1.address))
            .to.emit(contractDeployed, "ClientRegistered")
            .withArgs(addr1.address);
    })

    // ::::::::::::: CLIENT DELETION ::::::::::::: //
    it("Client DELETION - Should revert if an address differente form the owner try to add a client", async function () {
        await expect(contractDeployed.connect(addr1).deleteClient(addr2.address)).to.be.reverted;
    })

    it("Client DELETION - Should revert if the adress is not in the list 'clients'", async function () {
        await expect(contractDeployed.connect(owner).deleteClient(addr1.address))
            .to.revertedWith("This address is not a client adress")
    })
    it("Client DELETION - Should emit if the client is delete from the list 'clients'", async function () {
        await contractDeployed.connect(owner).addClient(addr1.address);
        await expect(contractDeployed.connect(owner).deleteClient(addr1.address))
            .to.emit(contractDeployed, "ClientRegistered")
            .withArgs(addr1.address);
    })

    // ::::::::::::: Mint Token ::::::::::::: //
    it("Mint - Sould revert if the mint adrress is not the connected address'", async function () {
        await contractDeployed.connect(owner).addClient(addr1.address);
        await expect(contractDeployed.connect(addr1).getSunWattToken(addr2.address, 100))
            .to.be.revertedWith("Unauthorized: Only token owner can burn their tokens")
    })
    it("Mint - Sould revert if the mint adrress is not into the list 'clients'", async function () {
        await contractDeployed.connect(owner).addClient(addr1.address);
        await expect(contractDeployed.connect(addr2).getSunWattToken(addr2.address, 100))
            .to.be.revertedWith("This address is not a client adress")
    })
    it("Mint - Should not revert mint tokens for a registered client", async function () {
        await contractDeployed.connect(owner).addClient(addr1.address);
        await contractDeployed.connect(addr1).getSunWattToken(addr1.address, 1000);

        const balance = await contractDeployed.balanceOf(addr1.address);
        await expect(balance).to.equal(1000);

    })
    // ::::::::::::: Check Token ::::::::::::: //
    it("Check - Should revert if the address is not into client list", async function () {

        await contractDeployed.connect(owner).addClient(addr1.address)
        await expect(contractDeployed.connect(addr1).getTotalMinted(addr2.address)).to.be.revertedWith("This address is not a client adress")

    })
    it("Check - Should return the correct total minted for an adress", async function () {
        await contractDeployed.connect(owner).addClient(addr1.address)

        await contractDeployed.connect(addr1).getSunWattToken(addr1.address, 100)

        const totalMinted = await contractDeployed.getTotalMinted(addr1.address);
        assert.equal(totalMinted.toString(), "100", "Total minted should be 100")
    })

    it("Check - Should return 0 for an address with no minted tokens", async function () {

        await contractDeployed.connect(owner).addClient(addr1.address)
        await contractDeployed.connect(addr1)

        const totalMinted = await contractDeployed.getTotalMinted(addr1.address)
        assert.equal(totalMinted.toString(), "0", "Total minted should be 0")

    })
    // ::::::::::::: BURN FUNTION ::::::::::::: //
    it("Burn - Should revert if the connect adress try to burn token from other address", async function () {
        await contractDeployed.connect(owner).addClient(addr1.address);
        await contractDeployed.connect(addr1).getSunWattToken(addr1.address, 100)

        await expect(contractDeployed.connect(addr2).burnSunWattToken(addr1.address, 50)).to.be.revertedWith("Unauthorized: Only token owner can burn their tokens")
    })
    it("Burn - Should revert if the address is not in the client list", async function () {
        await contractDeployed.connect(owner).addClient(addr1.address);
        await contractDeployed.connect(addr1).getSunWattToken(addr1.address, 100)

        await expect(contractDeployed.connect(addr2).burnSunWattToken(addr2.address, 50)).to.be.revertedWith("This address is not a client adress")
    })
    it("Burn - Should revert if the address doesn't have any token", async function () {
        await contractDeployed.connect(owner).addClient(addr1.address);

        await expect(contractDeployed.connect(addr1).burnSunWattToken(addr1.address, 50)).to.be.revertedWith("Can not burn Token as this address doesn't have any")

    })
    it("Burn - Should revert if the amount burn is higher than the address get", async function () {
        await contractDeployed.connect(owner).addClient(addr1.address);
        await contractDeployed.connect(addr1).getSunWattToken(addr1.address, 100)

        await expect(contractDeployed.connect(addr1).burnSunWattToken(addr1.address, 150)).to.be.revertedWith("Can not burn more Token than address get")

    })
    it("Burn - Should emit with the right amount of updated after burn", async function () {
        await contractDeployed.connect(owner).addClient(addr1.address);
        await contractDeployed.connect(addr1).getSunWattToken(addr1.address, 100)

        const totalMintedBeforeBurn = await contractDeployed.getTotalMinted(addr1.address);

        assert.equal(totalMintedBeforeBurn.toString(), "100", "Total minted should be 100")
        await expect(contractDeployed.connect(addr1).burnSunWattToken(addr1.address, 50)).to.not.be.reverted

        const totalMintedAfterBurn = await contractDeployed.getTotalMinted(addr1.address);
        assert.equal(totalMintedAfterBurn.toString(), "50", "Total minted should be 100")



    })
    // ::::::::::::: RECEIVED FUNTION ::::::::::::: //
    it("RECEIVED - Should accept Ether via receive function", async function () {
        const amount = ethers.parseEther("1.0")
        const tx = await owner.sendTransaction({
            to: contractAdress,
            value: amount
        });

        await tx.wait()

        const balance = await ethers.provider.getBalance(contractAdress)
        await expect(balance.toString()).to.equal(amount.toString())
    })

    it("RECEIVED - Should emit an event if the receive function receive Ether", async function () {
        const amount = ethers.parseEther("5")

        const tx = await owner.sendTransaction({
            to: contractAdress,
            value: amount
        });

        await tx.wait()

        await expect(tx)
            .to.emit(contractDeployed, "ReceivedEther").withArgs(owner.address, amount)
    })
    // ::::::::::::: FALLBACK FUNTION ::::::::::::: //

    it("FALLBACK - Should call the fallback function and emit an event", async function () {
        const amount = ethers.parseEther("2");

        const tx = await owner.sendTransaction({
            to: contractAdress,
            value: amount,
            data: "0x123456"
        });
        await tx.wait()

        await expect(tx).to.emit(contractDeployed, "FallbackCalled").withArgs(owner.address, amount, "0x123456")

    })

})

describe('Aave Data Fetcher', function () {
    it("Should fetch data from Aave protocol", async function () {
        const data = await fetchContractData()
        const rate = await fetchSupplierRates()

        console.log(rate);
        // console.log(data.reserves);
        await expect(data).to.have.property('reserves');
        await expect(data).to.have.property('userReserves');

    })
})