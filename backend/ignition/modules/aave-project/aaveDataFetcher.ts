import { ethers } from "ethers";
import { UiPoolDataProvider, ChainId } from "@aave/contract-helpers";
import * as dotenv from "dotenv";
dotenv.config();

// URL RPC du réseau Sepolia
const SEPOLIA = process.env.SEPOLIA || "";

// Initialisation du provider Ethers
const provider = new ethers.providers.JsonRpcProvider(SEPOLIA);

// Adresses des contrats spécifiques à Sepolia
const POOL_ADDRESSES_PROVIDER = process.env.POOL_ADDRESSES_PROVIDER;
const UI_POOL_DATA_PROVIDER = process.env.UI_POOL_DATA_PROVIDER;
const POOL_CONTRACT_ADDRESS = process.env.POOL_CONTRACT_ADDRESS;
const USDC_CONTRACT_ADDRESS = process.env.USDC_CONTRACT_ADDRESS;


// Instance de UiPoolDataProvider pour récupérer les données des réserves
const poolDataProvider = new UiPoolDataProvider({
    uiPoolDataProviderAddress: UI_POOL_DATA_PROVIDER,
    provider,
    chainId: ChainId.sepolia, // Réseau Sepolia
});

// Fonction pour vérifier le réseau
async function verifyNetwork() {
    const network = await provider.getNetwork();
    console.log(`Connected to network: ${network.name}`);
    console.log(`Chain ID: ${network.chainId}`);
    if (network.chainId === ChainId.sepolia) {
        console.log("✅ Vous êtes connecté à Sepolia !");
    } else {
        console.warn("⚠️ Attention : Vous n'êtes pas connecté à Sepolia.");
    }
}

// Fonction pour récupérer les données brutes des réserves
export async function fetchRawContractData() {
    try {
        await verifyNetwork(); // Vérifiez le réseau avant de récupérer les données

        const symbols = ["USDC"];

        const reserves = await poolDataProvider.getReservesData(
            {
                lendingPoolAddressProvider: POOL_ADDRESSES_PROVIDER
            });
        const filteredReserves = reserves[0].filter((reserve) => {
            const isActive = reserve.isActive;
            const inSymbolList = symbols.includes(reserve.symbol);
            return isActive && inSymbolList;
        });


        const formattedReserves = filteredReserves.map((reserve) => ({
            symbol: reserve.symbol,
            underlyingAsset: reserve.underlyingAsset,
            availableLiquidity: (Number(reserve.availableLiquidity || "0") / 10).toFixed(2), // Convertir en chaîne pour éviter les erreurs
            liquidityRate: reserve.liquidityRate?.toString() || "0", // Taux brut
            liquidityRateInPercentage: ((Number(reserve.liquidityRate || "0") / 1e27) * 100).toFixed(2), // Taux en pourcentage
            // liquidityRateInPercentage: reserve.liquidityRate.div(ethers.BigNumber.from(10).pow(25)).toNumber() / 100,
            isActive: reserve.isActive,
        }));

        console.log("Filtered Reserves:", formattedReserves);
        // Affiche les objets bruts pour inspection

        // console.log("Available liquidity:", reserves[0][1]);
        // console.log("Liquidity rate:", reserves[0][1].liquidityRate);
        // console.log("Active liquidity:", reserves[0][1].isActive);

        return formattedReserves;
    } catch (error) {
        console.error("Erreur lors de la récupération des données filtrées");

    }


}


