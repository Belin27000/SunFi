const { ethers } = require("ethers");
// const { fetchSupplierRates } = require("./ignition/modules/aave-project/aaveDataFetcher.ts")
const { fetchSupplierRates } = require("../ignition/modules/aave-project/aaveDataFetcher")
const stakingContractAbi = require("../artifacts/contracts/StakingContract.sol/StakingContract.json"); // ABI du contrat
// const stakingContractAbi = require("./artifacts/contracts/StakingContract.sol/StakingContract.json"); // ABI du contrat
require("dotenv").config();

const RPC = process.env.SEPOLIA;
const PK = process.env.PK;
const provider = new ethers.providers.JsonRpcProvider(RPC);
const signer = new ethers.Wallet(PK, provider);

const stakingContractAddress = process.env.CONTRACT_STAKING_ADDRESS;
const stakingContract = new ethers.Contract(stakingContractAddress, stakingContractAbi.abi, signer);

async function updateLiquidityRate() {
    try {
        // Récupérer les taux de liquidité depuis Aave
        const supplierRates = await fetchSupplierRates();
        const usdcRate = supplierRates.find((rate: { symbol: string; liquidityRate: number }) => rate.symbol === "USDC")?.liquidityRate;

        if (!usdcRate) {
            throw new Error("USDC rate not found");
        }

        // Convertir le taux en ray (1e27)
        const usdcRateRay = ethers.utils.parseUnits(usdcRate.toString(), 27);

        // Appeler la fonction de mise à jour dans le contrat
        const tx = await stakingContract.updateLiquidityRate(usdcRateRay);

        const receipt = await tx.wait();
    } catch (error) {
        console.error("Error updating liquidity rate:", error);
    }
}

// Lancer le script
updateLiquidityRate();