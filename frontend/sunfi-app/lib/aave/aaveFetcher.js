import { ethers } from "ethers";
import { UiPoolDataProvider } from "@aave/contract-helpers";
import * as markets from "@bgd-labs/aave-address-book";

// Fournisseur JSON-RPC pour se connecter au réseau Ethereum
const provider = new ethers.providers.JsonRpcProvider("https://eth-mainnet.public.blastapi.io");

// Adresse du contrat Pool Data Provider pour Aave V3 sur Ethereum (ou Sepolia, selon votre réseau)
const poolDataProviderAddress = markets.AaveV3Ethereum.UI_POOL_DATA_PROVIDER;

// Instanciation du contrat Pool Data Provider
const poolDataProviderContract = new UiPoolDataProvider({
    uiPoolDataProviderAddress: poolDataProviderAddress,
    provider,
});

export async function fetchSupplierRates() {
    try {
        // Récupérer les données des réserves
        const reserves = await poolDataProviderContract.getReservesHumanized({
            lendingPoolAddressProvider: markets.AaveV3Ethereum.POOL_ADDRESSES_PROVIDER,
        });

        // Trouver les données pour USDC
        const usdcReserve = reserves.reservesData.find((reserve) => reserve.symbol === "USDC");

        if (!usdcReserve) {
            throw new Error("USDC reserve not found");
        }

        // Retourne le taux de liquidité de l'USDC
        const usdcRate = Number(usdcReserve.liquidityRate) / 1e27; // Conversion du ray (1e27)
        return usdcRate;
    } catch (err) {
        console.error("Error fetching USDC liquidity rate from Aave:", err);
        throw err;
    }
}