import { HardhatUserConfig, task } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";
import * as dotenv from "dotenv";
import { fetchSupplierRates } from "./ignition/modules/aave-project/aaveDataFetcher"; // Ton sous-module
import { ethers } from "ethers";

dotenv.config()

const SEPOLIA = process.env.SEPOLIA || "";
const PK = process.env.PK || "";
const ETHERSCAN = process.env.ETHERSCAN_API || "";


const config: HardhatUserConfig = {
  solidity: "0.8.27",
  networks: {
    localhost: {
      url: "http://127.0.0.1:8545", // Blockchain locale Hardhat
    },
    sepolia: {
      url: SEPOLIA,
      accounts: PK ? [`0x${PK}`] : [],
      chainId: 11155111,
    },
  },
  etherscan: {
    apiKey: ETHERSCAN,
  },
};

export default config;

// ::::::::::: Tâche update-rate ::::::::::::
task("update-rate", "Updates the liquidity rate in the staking contract")
  .setAction(async (_, hre) => {
    const stakingContractAddress = process.env.CONTRACT_STAKING_ADDRESS;

    if (!stakingContractAddress) {
      throw new Error("CONTRACT_STAKING_ADDRESS is not defined in .env file");
    }

    // Charger le contrat
    const stakingContract = await hre.ethers.getContractAt(
      "StakingContract",
      stakingContractAddress
    );

    // Récupérer le taux de liquidité USDC depuis Aave
    const supplierRates = await fetchSupplierRates();
    const usdcRate = supplierRates.find((rate) => rate.symbol === "USDC")?.liquidityRate;

    if (!usdcRate) {
      throw new Error("USDC liquidity rate not found");
    }

    // Convertir le taux en ray (1e27)
    const usdcRateRay = ethers.parseUnits(usdcRate.toString(), 27);


    // Mettre à jour le taux dans le contrat
    const tx = await stakingContract.updateLiquidityRate(usdcRateRay);
    await tx.wait();

  });