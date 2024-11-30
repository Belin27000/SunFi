// This setup uses Hardhat Ignition to manage smart contract deployments.
// Learn more about it at https://hardhat.org/ignition

import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";


const LockModule = buildModule("SunFi", (m) => {

  const sunFi = m.contract("SunFi");

  return { sunFi };
});

export default LockModule;
