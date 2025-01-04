// This setup uses Hardhat Ignition to manage smart contract deployments.
// Learn more about it at https://hardhat.org/ignition

import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";


const LockModule = buildModule("SunFi", (m) => {

  const sunFi = m.contract("SunFi");

  const stakingContract = m.contract("StakingContract", [sunFi])

  m.call(sunFi, "authorizeMinter", [stakingContract]);

  // console.log("SunFi Name:", sunFi.contractName);
  // console.log("Staking Contract Liquidity Rate:", stakingContract);

  return { sunFi, stakingContract };
});

export default LockModule;
