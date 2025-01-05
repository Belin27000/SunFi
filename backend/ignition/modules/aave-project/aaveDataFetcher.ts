import { ethers } from "ethers";
import { UiIncentiveDataProvider, UiPoolDataProvider, ChainId } from "@aave/contract-helpers";
import * as markets from '@bgd-labs/aave-address-book';
import * as dotenv from 'dotenv';
dotenv.config()

const provider = new ethers.providers.JsonRpcProvider(
    'https://eth-mainnet.public.blastapi.io',
)
// const ownerPubAddrr = process.env.PUBLIC_ADDRESS_WALLET

// const currentAccount = "0xf6ec695DdE2970Dd8D76ad5aD99B89CC89661889";
const currentAccount = process.env.PUBLIC_ADDRESS_WALLET;
if (!currentAccount) {
    throw new Error("PUBLIC_ADDRESS_WALLET is not defined in your environment variables.");
}
// Instances des contrats d'Aave
const poolDataProviderContract = new UiPoolDataProvider({
    uiPoolDataProviderAddress: markets.AaveV3Ethereum.UI_POOL_DATA_PROVIDER,
    provider,
    chainId: ChainId.mainnet,
});

const incentiveDataProviderContract = new UiIncentiveDataProvider({
    uiIncentiveDataProviderAddress:
        markets.AaveV3Ethereum.UI_INCENTIVE_DATA_PROVIDER,
    provider,
    chainId: ChainId.mainnet,
});

// Fonction pour récupérer les données
export async function fetchContractData() {
    const reserves = await poolDataProviderContract.getReservesHumanized({
        lendingPoolAddressProvider: markets.AaveV3Ethereum.POOL_ADDRESSES_PROVIDER,
    });

    const userReserves = await poolDataProviderContract.getUserReservesHumanized({
        lendingPoolAddressProvider: markets.AaveV3Ethereum.POOL_ADDRESSES_PROVIDER,
        user: currentAccount!,
    });

    const reserveIncentives =
        await incentiveDataProviderContract.getReservesIncentivesDataHumanized({
            lendingPoolAddressProvider:
                markets.AaveV3Ethereum.POOL_ADDRESSES_PROVIDER,
        });

    const userIncentives =
        await incentiveDataProviderContract.getUserReservesIncentivesDataHumanized({
            lendingPoolAddressProvider:
                markets.AaveV3Ethereum.POOL_ADDRESSES_PROVIDER,
            user: currentAccount!,
        });

    return { reserves, userReserves, reserveIncentives, userIncentives };
}
// Fonction pour récupérer les données des taux de rémunération des fournisseurs
export async function fetchSupplierRates() {
    // Récupérer les données des réserves
    const reserves = await poolDataProviderContract.getReservesHumanized({
        lendingPoolAddressProvider: markets.AaveV3Ethereum.POOL_ADDRESSES_PROVIDER,
    });

    // Extraire les taux de rémunération des fournisseurs (liquidityRate) pour chaque réserve
    const supplierRates = reserves.reservesData
        .filter((reserve) => reserve.symbol === "USDT" || reserve.symbol === "USDC" || reserve.symbol === "WBTC") // Filtrer les tokens USD
        .map((reserve) => ({
            symbol: reserve.symbol,
            liquidityRate: Number(reserve.liquidityRate) / 1e27, // Conversion du ray (1e27) en nombre décimal
        }));

    return supplierRates;
}
