import { loadFixture } from "@nomicfoundation/hardhat-toolbox/network-helpers";
import { HardhatEthersSigner } from "@nomicfoundation/hardhat-ethers/signers";
import { assert, expect } from "chai";
import hre, { ethers } from "hardhat";
import { SunFi, MockUSDC } from "../../typechain-types";
// import { fetchContractData, fetchSupplierRates } from "../../ignition/modules/aave-project/aaveDataFetcher";
import * as dotenv from "dotenv";
dotenv.config();


describe("SunFi contract test", function () {

    let owner: HardhatEthersSigner
    let addr1: HardhatEthersSigner
    let addr2: HardhatEthersSigner
    let contractDeployed: SunFi;
    let contractAdress: string;


    // async function deployContractFixture() {
    //     [owner, addr1, addr2] = await ethers.getSigners();

    //     //------------------//
    //     const poolAddress = process.env.POOL_CONTRACT_ADDRESS;
    //     const usdcAddress = process.env.USDC_CONTRACT_ADDRESS;

    //     if (!poolAddress || !usdcAddress) {
    //         throw new Error("POOL_CONTRACT_ADDRESS or USDC_CONTRACT_ADDRESS is not defined in the environment variables.");
    //     }
    //     //------------------//
    //     contractDeployed = await hre.ethers.deployContract("SunFi", [poolAddress, usdcAddress])
    //     // contractDeployed = await hre.ethers.deployContract("SunFi")
    //     contractAdress = await contractDeployed.getAddress()
    //     console.log(contractAdress)
    //     // return { contractDeployed, owner, addr1, addr2, contractAdress }
    //     return { contractDeployed, owner, addr1, addr2, contractAdress, poolAddress, usdcAddress };

    // }
    let mockUSDC: MockUSDC; // Ajout d'une référence pour le contrat mock USDC

    async function deployContractFixture() {
        [owner, addr1, addr2] = await ethers.getSigners();

        // MockUSDC
        const MockUSDCFactory = await ethers.getContractFactory("MockUSDC");
        mockUSDC = await MockUSDCFactory.deploy();
        // await mockUSDC.deployed();
        const usdcAddress = process.env.USDC_CONTRACT_ADDRESS || mockUSDC.getAddress();

        // Pool Address
        const poolAddress = process.env.POOL_CONTRACT_ADDRESS;
        if (!poolAddress) {
            throw new Error("POOL_CONTRACT_ADDRESS is not defined in the environment variables.");
        }

        // Déploiement de SunFi
        const SunFiFactory = await ethers.getContractFactory("SunFi");
        contractDeployed = await SunFiFactory.deploy(poolAddress, usdcAddress);
        console.log("contractDeployed", contractDeployed.getAddress());
        console.log("Owner", owner.address);

        // await contractDeployed.deployed();

        return { contractDeployed, mockUSDC, owner, addr1, addr2, poolAddress, usdcAddress };
    }
    // ::::::::::::: FONCTIONS UTILITAIRES ::::::::::::: //

    // Fonction utilitaire pour ajouter des clients
    async function addClient(client: HardhatEthersSigner, maxMintable: number) {

        await contractDeployed.connect(owner).addClient(client, maxMintable)
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

    it("GETTERS - Should return the correct client information for a registered address", async function () {
        const mintableLimit = 50
        await contractDeployed.connect(owner).addClient(addr1.address, mintableLimit)
        const client = await contractDeployed.getClient(addr1.address);
        expect(client.isRegistered).to.equal(true);
        assert.equal(mintableLimit.toString(), "50", "Mintable number token doesn't match the limit")
    })
    // ::::::::::::: CLIENT REGISTRATION ::::::::::::: //

    it("REGISTRATION - Should revert if an address differente form the owner try to add a client", async function () {
        await expect(contractDeployed.connect(addr1).addClient(addr2.address, 50)).to.be.reverted;
    })
    it("REGISTRATION - Should revert if the owner try to be registered as client", async function () {
        const mintableLimit = 50
        await expect(
            contractDeployed.connect(owner).addClient(owner.address, mintableLimit)
        ).to.be.revertedWith("Owner cannot be registered as a client");

    })
    it("REGISTRATION - Should revert if an adress is already registered", async function () {
        await addClient(addr1, 40)
        await expect(addClient(addr1, 50)).to.be.revertedWith("This adress already registered as a client address!");

    })

    it("REGISTRATION - Should emit the event ClientRegistered", async function () {

        await expect(
            contractDeployed.connect(owner).addClient(addr1.address, 50)
        )
            .to.emit(contractDeployed, "ClientRegistered")
            .withArgs(addr1.address, 50)
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
        await contractDeployed.connect(owner).addClient(addr1.address, 50);
        await expect(contractDeployed.connect(owner).deleteClient(addr1.address))
            .to.emit(contractDeployed, "ClientRegistered")
            .withArgs(addr1.address, 0);
    })

    // ::::::::::::: Mint Token ::::::::::::: //
    it("Mint - Sould revert if the mint adrress is not the connected address'", async function () {
        await contractDeployed.connect(owner).addClient(addr1.address, 50);
        await expect(contractDeployed.connect(addr1).getSunWattToken(addr2.address, 100))
            .to.be.revertedWith("Unauthorized: Only token owner can burn their tokens")
    })
    it("Mint - Sould revert if the mint adrress is not into the list 'clients'", async function () {
        await contractDeployed.connect(owner).addClient(addr1.address, 50);
        await expect(contractDeployed.connect(addr2).getSunWattToken(addr2.address, 100))
            .to.be.revertedWith("This address is not a client adress")
    })
    it("Mint - Should not revert mint tokens for a registered client", async function () {
        await contractDeployed.connect(owner).addClient(addr1.address, 1500);
        await contractDeployed.connect(addr1).getSunWattToken(addr1.address, 1000);

        const balance = await contractDeployed.balanceOf(addr1.address);
        await expect(balance).to.equal(1000);

    })

    it("Mint - Should allow minting up to maxMintable tokens per day", async function () {
        await contractDeployed.connect(owner).addClient(addr1.address, 100);

        await contractDeployed.connect(addr1).getSunWattToken(addr1.address, 50);
        const balance = await contractDeployed.balanceOf(addr1.address);
        expect(balance).to.equal(50);

        const client = await contractDeployed.getClient(addr1.address);
        expect(client.maxMintable).to.equal(100);
    })
    it("Mint - Should revert if attempting to mint more than maxMintable tokens in a day", async function () {
        await contractDeployed.connect(owner).addClient(addr1.address, 50);

        // Try to mint 100 tokens (exceeds maxMintable)
        await expect(
            contractDeployed.connect(addr1).getSunWattToken(addr1.address, 100)
        ).to.be.revertedWith("Amount exceeds the maximum mintable tokens available");
    });

    it("Mint - Should accumulate unused mint allowance over multiple days", async function () {
        await contractDeployed.connect(owner).addClient(addr1.address, 50);

        await ethers.provider.send("evm_increaseTime", [3 * 24 * 60 * 60]);
        await ethers.provider.send("evm_mine", [])

        await contractDeployed.connect(addr1).getSunWattToken(addr1.address, 150);
        const balance = await contractDeployed.balanceOf(addr1.address)
        expect(balance).to.equal(150)

    })
    it("Mint -Should reset lastMintTimeStamp after minting", async function () {
        await contractDeployed.connect(owner).addClient(addr1.address, 50);
        const currentTimestamp = (await ethers.provider.getBlock("latest"))?.timestamp;

        await ethers.provider.send("evm_increaseTime", [3 * 24 * 60 * 60]);
        await ethers.provider.send("evm_mine", [])

        await contractDeployed.connect(addr1).getSunWattToken(addr1.address, 50);

        const clientData = await contractDeployed.getClientData(addr1.address);
        const updatedTimestamp = (await ethers.provider.getBlock("latest"))?.timestamp;
        expect(clientData.lastMintTimestamp).to.equal(updatedTimestamp)
    })
    // ::::::::::::: Check Token ::::::::::::: //
    it("Check - Should revert if the address is not into client list", async function () {

        await contractDeployed.connect(owner).addClient(addr1.address, 50)
        await expect(contractDeployed.connect(addr1).getTotalMinted(addr2.address)).to.be.revertedWith("This address is not a client adress")

    })
    it("Check - Should return the correct total minted for an adress", async function () {
        await contractDeployed.connect(owner).addClient(addr1.address, 150)

        await contractDeployed.connect(addr1).getSunWattToken(addr1.address, 100)

        const totalMinted = await contractDeployed.getTotalMinted(addr1.address);
        assert.equal(totalMinted.toString(), "100", "Total minted should be 100")
    })

    it("Check - Should return 0 for an address with no minted tokens", async function () {

        await contractDeployed.connect(owner).addClient(addr1.address, 50)
        await contractDeployed.connect(addr1)

        const totalMinted = await contractDeployed.getTotalMinted(addr1.address)
        assert.equal(totalMinted.toString(), "0", "Total minted should be 0")

    })
    // ::::::::::::: BURN FUNTION ::::::::::::: //
    it("Burn - Should revert if the connect adress try to burn token from other address", async function () {
        await contractDeployed.connect(owner).addClient(addr1.address, 150);
        await contractDeployed.connect(addr1).getSunWattToken(addr1.address, 100)

        await expect(contractDeployed.connect(addr2).burnSunWattToken(addr1.address, 50)).to.be.revertedWith("Unauthorized: Only token owner can burn their tokens")
    })
    it("Burn - Should revert if the address is not in the client list", async function () {
        await contractDeployed.connect(owner).addClient(addr1.address, 150);
        await contractDeployed.connect(addr1).getSunWattToken(addr1.address, 100)

        await expect(contractDeployed.connect(addr2).burnSunWattToken(addr2.address, 50)).to.be.revertedWith("This address is not a client adress")
    })
    it("Burn - Should revert if the address doesn't have any token", async function () {
        await contractDeployed.connect(owner).addClient(addr1.address, 50);

        await expect(contractDeployed.connect(addr1).burnSunWattToken(addr1.address, 50)).to.be.revertedWith("Can not burn Token as this address doesn't have any")

    })
    it("Burn - Should revert if the amount burn is higher than the address get", async function () {
        await contractDeployed.connect(owner).addClient(addr1.address, 150);
        await contractDeployed.connect(addr1).getSunWattToken(addr1.address, 100)

        await expect(contractDeployed.connect(addr1).burnSunWattToken(addr1.address, 150)).to.be.revertedWith("Can not burn more Token than address get")

    })
    it("Burn - Should emit with the right amount of updated after burn", async function () {
        await contractDeployed.connect(owner).addClient(addr1.address, 150);
        await contractDeployed.connect(addr1).getSunWattToken(addr1.address, 100)

        const totalMintedBeforeBurn = await contractDeployed.getTotalMinted(addr1.address);

        assert.equal(totalMintedBeforeBurn.toString(), "100", "Total minted should be 100")
        await expect(contractDeployed.connect(addr1).burnSunWattToken(addr1.address, 50)).to.not.be.reverted

        const totalMintedAfterBurn = await contractDeployed.getTotalMinted(addr1.address);
        assert.equal(totalMintedAfterBurn.toString(), "50", "Total minted should be 100")



    })

    // ::::::::::::: History FUNTION ::::::::::::: //
    it("History - Should return the correct mint history for an address ", async function () {
        await contractDeployed.connect(owner).addClient(addr1.address, 150);
        const mintAmount1 = 50n;
        const mintAmount2 = 75n;

        const tx1 = await contractDeployed.connect(addr1).getSunWattToken(addr1.address, mintAmount1);
        const receipt1 = await tx1.wait();
        const tx2 = await contractDeployed.connect(addr1).getSunWattToken(addr1.address, mintAmount2);
        const receipt2 = await tx2.wait();

        const block1 = await ethers.provider.getBlock(receipt1.blockNumber!);
        const block2 = await ethers.provider.getBlock(receipt2.blockNumber!);

        // Appeler getMintHistory
        const [amounts, timestamps] = await contractDeployed.connect(addr1).getMintHistory(addr1.address);
        // console.log(amounts, timestamps);

        // Vérifier que les montants et timestamps sont corrects
        assert.equal(amounts.length, 2, "Mint history should contain 2 records");
        assert.equal(amounts[0].toString(), mintAmount1.toString(), "First mint amount should match");
        assert.equal(amounts[1].toString(), mintAmount2.toString(), "Second mint amount should match");

        assert.equal(timestamps[0], block1.timestamp, "First mint timestamp should match the block timestamp");
        assert.equal(timestamps[1], block2.timestamp, "Second mint timestamp should match the block timestamp");
    });
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

    // it("AAVE - Should fetch data from Aave protocol", async function () {
    //     const data = await fetchContractData()
    //     const rate = await fetchSupplierRates()

    //     console.log(rate);
    //     // console.log(data.reserves);
    //     await expect(data).to.have.property('reserves');
    //     await expect(data).to.have.property('userReserves');

    // })
    // it.only("AAVE - Should transfer 100 USDC to the contract and supply to Aave", async function () {
    //     // Étape 1 : Récupérer l'interface du contrat USDC
    //     const usdcContract = await ethers.getContractAt("IERC20", process.env.USDC_CONTRACT_ADDRESS);

    //     // Étape 2 : Vérifier le solde initial du propriétaire
    //     const amountToTransfer = ethers.parseUnits("100", 6); // 100 USDC
    //     const ownerBalanceBefore = await usdcContract.balanceOf(owner.address);
    //     expect(ownerBalanceBefore).to.be.gte(amountToTransfer); // Vérifie que le propriétaire a assez de USDC

    //     // Étape 3 : Approuver le transfert des USDC au contrat déployé
    //     await usdcContract.connect(owner).approve(contractDeployed.getAddress(), amountToTransfer);

    //     // Étape 4 : Transférer les USDC vers le contrat déployé
    //     await contractDeployed.connect(owner).depositUSDC(amountToTransfer);

    //     // Vérifier que les USDC ont bien été transférés au contrat
    //     const contractBalance = await usdcContract.balanceOf(contractDeployed.getAddress());
    //     expect(contractBalance).to.equal(amountToTransfer);

    //     // Étape 5 : Fournir les USDC à Aave via la fonction du contrat
    //     await contractDeployed.connect(owner).supplyToAave(amountToTransfer);

    //     // Vérifier que le solde de USDC du contrat est maintenant à 0
    //     const finalContractBalance = await usdcContract.balanceOf(contractDeployed.getAddress());
    //     expect(finalContractBalance).to.equal(0);

    //     // // Vérifier que le contrat a bien reçu des aTokens en retour (optionnel)
    //     // const aTokenBalance = await usdcContract.balanceOf(process.env.ATOKEN_CONTRACT_ADDRESS);
    //     // console.log("aToken balance after supply:", aTokenBalance.toString());
    // });
    // it.only("AAVE - Should supply USDC to Aave", async function () {
    //     const usdcContract = await ethers.getContractAt("IERC20", process.env.USDC_CONTRACT_ADDRESS);
    //     const initialBalance = await usdcContract.balanceOf(contractDeployed.getAddress());

    //     // Mint USDC to contract
    //     const amount = ethers.parseUnits("100", 6); // 100 USDC
    //     await usdcContract.mint(contractDeployed.getAddress(), amount);

    //     // Approve and supply to Aave
    //     await contractDeployed.supplyToAave(amount);

    //     const finalBalance = await usdcContract.balanceOf(contractDeployed.getAddress());
    //     expect(finalBalance).to.equal(0); // All USDC should be supplied
    // });
    // it.only("AAVE - Should withdraw USDC from Aave", async function () {
    //     const usdcContract = await ethers.getContractAt("IERC20", process.env.USDC_CONTRACT_ADDRESS);

    //     // Mint USDC and supply to Aave
    //     const amount = ethers.parseUnits("100", 6); // 100 USDC
    //     await usdcContract.mint(contractDeployed.getAddress(), amount);
    //     await contractDeployed.supplyToAave(amount);

    //     // Withdraw from Aave
    //     await contractDeployed.withdrawFromAave(amount);

    //     const finalBalance = await usdcContract.balanceOf(contractDeployed.getAddress());
    //     expect(finalBalance).to.equal(amount); // USDC should be returned
    // });
    it.only("AAVE - Should transfer 100 USDC to the contract and supply to Aave", async function () {
        // Mint 100 USDC
        const amountToMint = ethers.parseUnits("100", 10); // 100 USDC

        // Étape 1 : Mint de 100 USDC
        const balanceBeforeMint = await mockUSDC.balanceOf(owner.address);
        await mockUSDC.connect(owner).mint(owner.address, amountToMint);
        const balanceAfterMint = await mockUSDC.balanceOf(owner.address);

        console.log("Balance avant mint:", balanceBeforeMint.toString());
        console.log("Balance après mint:", balanceAfterMint.toString());
        // await mockUSDC.connect(owner).mint(owner.address, amountToMint);


        // Vérifiez que l'owner a bien reçu les USDC
        const ownerBalanceBefore = await mockUSDC.balanceOf(owner.address);
        // console.log("Owner balance before:", ownerBalanceBefore.toString());

        expect(ownerBalanceBefore).to.equal(balanceBeforeMint + amountToMint);


        // // Approuvez le contrat SunFi à utiliser les USDC
        await mockUSDC.connect(owner).approve(contractDeployed.getAddress(), amountToMint);

        const allowance = await mockUSDC.allowance(owner.address, contractDeployed.getAddress());
        console.log("Allowance:", allowance.toString());
        expect(allowance).to.equal(amountToMint);

        // // Déposez les USDC dans SunFi
        await contractDeployed.connect(owner).depositUSDC(amountToMint);

        // // Vérifiez que SunFi a bien reçu les USDC
        const contractBalance = await mockUSDC.balanceOf(contractDeployed.getAddress());
        console.log("Contract balance after deposit:", contractBalance.toString());
        expect(contractBalance).to.equal(amountToMint);
        // expect(contractBalance).to.equal(amountToMint);

        // // Approuvez le Pool à utiliser les USDC détenus par SunFi
        // await contractDeployed.connect(owner).supplyToAave(amountToMint);

        // // Vérifiez que SunFi n'a plus de USDC après transfert vers Aave
        // const finalContractBalance = await mockUSDC.balanceOf(contractDeployed.getAddress());
        // expect(finalContractBalance).to.equal(0);

        // console.log("Contract balance after deposit:", contractBalance.toString());
        // console.log("Final contract balance after supply:", finalContractBalance.toString());
    });

})

// describe('Aave Data Fetcher', function () {
// })