// // This setup uses Hardhat Ignition to manage smart contract deployments.
// // Learn more about it at https://hardhat.org/ignition

// import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";


// const SunFiModule = buildModule("SunFi", (m) => {

//   const poolAddress = process.env.POOL_CONTRACT_ADDRESS; // Adresse du Pool d'Aave
//   const usdcAddress = process.env.USDC_CONTRACT_ADDRESS; // Adresse du contrat USDC

//   if (!poolAddress || !usdcAddress) {
//     throw new Error("POOL_CONTRACT_ADDRESS or USDC_CONTRACT_ADDRESS is not defined");
//   }
//   const sunFi = m.contract("SunFi", [poolAddress, usdcAddress]);

//   return { sunFi };
// });

// export default SunFiModule;
import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";

const SunFiModule = buildModule("SunFi", (m) => {
  const mockUSDC = m.contract("MockUSDC");
  const poolAddress = process.env.POOL_CONTRACT_ADDRESS;

  if (!poolAddress) {
    throw new Error("POOL_CONTRACT_ADDRESS is not defined");
  }

  const sunFi = m.contract("SunFi", [poolAddress, mockUSDC]);

  return { sunFi, mockUSDC };
});

export default SunFiModule;