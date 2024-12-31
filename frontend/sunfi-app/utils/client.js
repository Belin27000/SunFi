import { createPublicClient, http } from "viem";
import { sepolia } from "viem/chains"
// import * as dotenv from 'dotenv'
// dotenv.config()

const SEPOLIA = process.env.NEXT_PUBLIC_RPC_URL || "";
console.log("RPC URL utils/clients:", process.env.NEXT_PUBLIC_RPC_URL);

export const publicClient = createPublicClient({
    chain: sepolia,
    transport: http(SEPOLIA)
})