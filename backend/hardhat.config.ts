import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";
import * as dotenv from "dotenv"

dotenv.config()

const SEPOLIA = process.env.SEPOLIA || "";
const PK = process.env.PK || "";
const LOCAL_PK = process.env.PK || "";
const ETHERSCAN = process.env.ETHERSCAN_API || "";

console.log("Private Key:", process.env.PK);
const config: HardhatUserConfig = {
  solidity: "0.8.27",
  networks: {
    localhost: {
      accounts: LOCAL_PK ? [`0x${LOCAL_PK}`] : [],
      url: "http://127.0.0.1:8545", // Blockchain locale Hardhat
    },
    sepolia: {
      url: SEPOLIA,
      accounts: PK ? [`0x${PK}`] : [],
      chainId: 11155111,
    }
  },
  etherscan: {
    apiKey: ETHERSCAN
  },

};

export default config;
