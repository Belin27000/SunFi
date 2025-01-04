import { HardhatEthersSigner } from "@nomicfoundation/hardhat-ethers/signers";
import { expect } from "chai";
import hre, { ethers, network } from "hardhat";
import { SunFi, StakingContract } from "../../typechain-types";
import { fetchContractData, fetchSupplierRates } from "../../ignition/modules/aave-project/aaveDataFetcher";


describe("StakingContract", function () {
    let sunFi: SunFi
    let stakingContract: StakingContract
    let owner: HardhatEthersSigner
    let user: HardhatEthersSigner

    beforeEach(async () => {

        [owner, user] = await ethers.getSigners()

        const SunFi = await ethers.getContractFactory("SunFi");
        sunFi = await SunFi.deploy()

        const StakingContract = await ethers.getContractFactory("StakingContract");
        stakingContract = await StakingContract.deploy(sunFi.getAddress())

        await sunFi.addClient(user.address, ethers.parseUnits("1000", 18));
        await sunFi.connect(user).getSunWattToken(user.address, ethers.parseUnits("100", 18));


    })
    it("STAKING - Should allow staking tokens", async function () {

        const balance = await sunFi.balanceOf(user.address);
        expect(balance).to.equal(ethers.parseUnits("100", 18)); // Vérifie le mint

        await sunFi.connect(user).approve(stakingContract.getAddress(), ethers.parseUnits("50", 18));

        const allowance = await sunFi.allowance(user.address, stakingContract.getAddress());
        expect(allowance).to.equal(ethers.parseUnits("50", 18));

        await stakingContract.connect(user).stake(ethers.parseUnits("50", 18));

        const stake = await stakingContract.stakes(user.address);
        expect(stake.amount).to.equal(ethers.parseUnits("50", 18));
    })

    it("STAKING - Should calculate the rewards correctly", async function () {
        await stakingContract.updateLiquidityRate(ethers.parseUnits("30", 18));
        await sunFi.connect(user).approve(stakingContract.getAddress(), ethers.parseUnits("50", 18));
        await stakingContract.connect(user).stake(ethers.parseUnits("50", 18));

        await network.provider.send("evm_increaseTime", [3600 * 24 * 30]);
        await network.provider.send("evm_mine");

        const rewards = await stakingContract.calculateRewards(user.address)

    })
    it("STAKING - Should allow unstacking with rewards", async function () {
        // Mettre à jour le taux de liquidité
        const liquidityRate = ethers.parseUnits("30", 27); // 30% annuel

        await stakingContract.updateLiquidityRate(liquidityRate);

        // Autoriser le contrat de staking à mint
        await sunFi.connect(owner).authorizeMinter(stakingContract.getAddress());

        // Approuver et staker 50 tokens
        await sunFi.connect(user).approve(stakingContract.getAddress(), ethers.parseUnits("50", 18));
        await stakingContract.connect(user).stake(ethers.parseUnits("50", 18));

        // Simuler 30 jours
        await network.provider.send("evm_increaseTime", [3600 * 24 * 30]);
        await network.provider.send("evm_mine");

        // Effectuer l'unstake
        await stakingContract.connect(user).unstake();

        // Calculer les récompenses attendues
        const stakingAmount = ethers.parseUnits("50", 18); // Montant staké

        const ratePerSecond = BigInt(liquidityRate) / (BigInt(365 * 24 * 60 * 60)); // Taux par seconde
        const timeElapsed = BigInt(3600 * 24 * 30); // 30 jours
        const rewards = BigInt(stakingAmount) * (ratePerSecond) * (timeElapsed) / (BigInt(1e27)); // Diviser par 1e27

        // Solde attendu après le retrait
        const initialBalance = ethers.parseUnits("50", 18); // Solde initial
        const expectedBalance = BigInt(initialBalance.toString()) + rewards; // Ajouter les récompenses

        // Vérifier le solde final
        const tolerance = BigInt(1e18); // Tolérance d'une unité ether
        const balance = await sunFi.balanceOf(user.address);
        const balanceBigInt = BigInt(balance.toString());
        expect(balanceBigInt).to.be.closeTo(expectedBalance, tolerance);
    });

})